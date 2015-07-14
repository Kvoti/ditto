import logging
from contextlib import contextmanager
from threading import local

from django.conf.urls.static import static
from django.conf import settings
from django.conf.urls import patterns, include, url

log = logging.getLogger(__name__)

_current = local()
_table_prefix = local()
_MAIN = 'main'


def id():
    return _current.value


def is_main():
    return _current.value == _MAIN


def is_configured():
    return _get_current().is_configured


def chat_host():
    if settings.DEBUG:
        domain = 'localhost'
    else:
        domain = 'ditto.technology'
    # Each ditto network has their own chat vhost to keep the users
    # isolated.  At the moment I can't figure out if it's possible to
    # configure new hosts at runtime (other than by invoking a script
    # to update the conf file and reloading). So, for testing/demoing,
    # I've just pre-configured a bunch of vhosts that we can map new
    # networks to.
    return 'network%s.%s' % (_get_current().pk, domain)


class _DBTable(object):
    @property
    def _table_prefix(self):
        if hasattr(_table_prefix, 'value'):
            return _table_prefix.value
        else:
            # HACK for borrowed laptop
            if not hasattr(_current, "value"):
                value = _MAIN
            else:
                value = _current.value
            return _table_prefix(value)
        
    def __get__(self, obj, objtype):
        orig = getattr(obj, '_db_table', '')
        if orig:
            if not orig.startswith('mam_'):
                return '%s%s' % (self._table_prefix, orig)
            else:
                return orig
        else:
            return ''

    def __set__(self, obj, value):
        if value:
            obj._db_table = value.replace(self._table_prefix, '')
        
        
def _patch_table_names():
    import sys
    _meta = sys.modules['django.db.models.options'].Options
    _meta.db_table = _DBTable()
    # Changes in django 1.8 mean we need to patch the cached_col
    # property on Field so it *doesn't* cache
    # TODO we REALLY need a proper multitenant solution!
    _field = sys.modules['django.db.models.fields'].Field
    def not_cached_col(self):
        from django.db.models.expressions import Col
        return Col(self.model._meta.db_table, self)
    _field.cached_col = property(not_cached_col)

    
def _main():
    """Context manager to allow access to main database tables when
    current tenant may not be main.

    """
    return _tenant(_MAIN)


@contextmanager
def _tenant(slug):
    """Context manager to allow access to tenant database tables.

    """
    if hasattr(_table_prefix, 'value'):
        previous = _table_prefix.value
    else:
        previous = None
    _table_prefix.value = _table_prefix(slug)
    logging.debug('set _table_prefix to %s' % _table_prefix.value)
    yield
    if previous:
        _table_prefix.value = previous
        logging.debug('restored _table_prefix to %s' % previous)
    else:
        del _table_prefix.value
        logging.debug('unset _table_prefix')
    

def _set_default():
    _set(_MAIN)

    
def _set_for_request(request):
    tenant_id = _get_id_from_request(request)
    # When setting from the request we check the tenant exists
    _get_for_id(tenant_id)
    _set(tenant_id)


def _get_id_from_request(request):
    if request.path == '/':
        tenant_id = _MAIN
    else:
        parts = request.path.split('/')
        tenant_id = parts[1]
    return tenant_id
                

def _get_current():
    return _get_for_id(_current.value)


def _get_for_id(tenant_id):
    from . import models  # fix circ. import
    if tenant_id == _MAIN:
        return _MAIN
    else:
        with _tenant(_MAIN):  # _main():
            try:
                tenant = models.Tenant.objects.get(slug=tenant_id)
            except models.Tenant.DoesNotExist:
                log.error('Tenant %s not found' % tenant_id)
                raise ValueError('Tenant does not exist: %s' % tenant_id)
            else:
                return tenant

            
def _set(tenant):
    _current.value = tenant
    log.debug('Set tenant to %s' % tenant)


def _unset():
    del _current.value
    log.debug('Unset tenant')


def set_configured():
    _set_configured(True)

    
def reset_configured():
    _set_configured(False)


def _set_configured(is_configured):
    tenant = _get_current()
    tenant.is_configured = is_configured
    with _main():
        tenant.save()


def _get_urls():
    if is_main():
        return 'main_urls'
    else:
        tid = _current.value
        # Note, need 'tuple' here otherwise url stuff blows up
        return tuple(
            patterns(
                '',
                url(r'^%s/' % tid, include('network_urls')),
            ) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT))

    
def _table_prefix(tenant_id):
    return '__%s__' % tenant_id
