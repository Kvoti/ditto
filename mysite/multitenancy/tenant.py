from contextlib import contextmanager
from threading import local

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
    with _tenant(_MAIN):
        # **Must** have this import here, not at the top of the file
        from django.contrib.sites.models import Site
        Site.objects.clear_cache()
        domain = Site.objects.get_current().domain
    if not host.startswith(domain):
        tenant = host.split('.')[0]
        with _tenant(_MAIN):
            from . import models  # fix circ. import
            if not models.Tenant.objects.filter(slug=tenant).exists():
                raise ValueError
    else:
        tenant = _MAIN
    return _set(tenant)


def _set_for_tenant(tenant):
    _set(tenant)


def _table_prefix(tenant):
    return '__%s__' % tenant


def _set_default():
    _set(_MAIN)

    
def _set(tenant_id):
    _current_tenant.table_prefix = _table_prefix(tenant_id)


def _unset():
    del _current_tenant.table_prefix


def _is_main():
    return _current_tenant.table_prefix == _table_prefix(_MAIN)


@contextmanager
def _tenant(tenant_id):
    _set_for_tenant(tenant_id)
    yield
    _unset()
