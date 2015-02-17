import logging
from contextlib import contextmanager
from threading import local

from django.conf import settings

log = logging.getLogger(__name__)

_current_tenant = local()
_MAIN = 'main'


class _DBTable(object):
    def __get__(self, obj, objtype):
        orig = getattr(obj, '_db_table', '')
        if orig:
            # TODO exempt some tables so they're shared (will screw up migrate...)
            return '%s%s' % (_current_tenant.table_prefix, orig)
        else:
            return ''

    def __set__(self, obj, value):
        if value:
            obj._db_table = value.replace(_current_tenant.table_prefix, '')
        
        
def _patch_table_names():
    import sys
    _meta = sys.modules['django.db.models.options'].Options
    _meta.db_table = _DBTable()

            
def _set_for_request(request):
    host = request.get_host()
    log.debug('Request host is %s' % host)
    with _tenant(_MAIN):
        # **Must** have this import here, not at the top of the file
        from django.contrib.sites.models import Site
        Site.objects.clear_cache()
        domain = Site.objects.get_current().domain
        log.debug('Parent domain is %s' % domain)
    if not _is_main_request(host, domain):
        tenant = host.split('.')[0]
        log.debug('Tenant is %s' % tenant)
        with _tenant(_MAIN):
            from . import models  # fix circ. import
            try:
                tenant = models.Tenant.objects.select_related().get(slug=tenant)
            except models.Tenant.DoesNotExist:
                log.error('Tenant %s not found' % tenant)
                raise ValueError
            else:
                is_configured = tenant.is_configured
                tenant = tenant.slug
    else:
        log.debug('No tenant found')
        tenant = _MAIN
        is_configured = None
    _set(tenant)
    # TODO this should be part of the _set function
    if is_configured is not None:
        if is_configured:
            log.debug('Tenant is configured')
        else:
            log.debug('Tenant is not configured')
        _current_tenant.is_configured = is_configured

    
def _is_main_request(host, domain):
    if settings.DEBUG:
        return host.startswith('localhost')
    else:
        # chat server makes auth requests to django from localhost
        return host in ['localhost', domain]
    

def _set_for_tenant(tenant):
    _set(tenant)


def _table_prefix(tenant):
    return '__%s__' % tenant


def _set_default():
    _set(_MAIN)

    
def _set(tenant_id):
    _current_tenant.table_prefix = _table_prefix(tenant_id)
    log.debug('Set tenant to %s' % tenant_id)


def _unset():
    del _current_tenant.table_prefix
    if hasattr(_current_tenant, 'is_configured'):
        del _current_tenant.is_configured
    log.debug('Unset tenant')


def _is_main():
    return _current_tenant.table_prefix == _table_prefix(_MAIN)


def is_configured():
    return _current_tenant.is_configured


def set_configured():
    _set_configured(True)

    
def reset_configured():
    _set_configured(False)


def _set_configured(is_configured):
    from . import models  # fix circ. import
    slug = _current_tenant.table_prefix[2:-2]  # FIXME
    with _tenant(_MAIN):
        tenant = models.Tenant.objects.get(
            slug=slug
        )
        tenant.is_configured = is_configured
        tenant.save()

        
# TODO think we need a version of this that *restores* the current tenant
@contextmanager
def _tenant(tenant_id):
    _set_for_tenant(tenant_id)
    yield
    _unset()
