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


def is_main():
    return _current.value == _Main


def is_configured():
    return _current.value.is_configured


def chat_domain():
    pass


class _Main(object):
    slug = _MAIN

    
class _DBTable(object):
    @property
    def _table_prefix(self):
        if hasattr(_table_prefix, 'value'):
            return _table_prefix.value
        else:
            return _table_prefix(_current.value.slug)
        
    def __get__(self, obj, objtype):
        orig = getattr(obj, '_db_table', '')
        if orig:
            return '%s%s' % (self._table_prefix, orig)
        else:
            return ''

    def __set__(self, obj, value):
        if value:
            obj._db_table = value.replace(self._table_prefix, '')
        
        
def _patch_table_names():
    import sys
    _meta = sys.modules['django.db.models.options'].Options
    _meta.db_table = _DBTable()

        
@contextmanager
def _main():
    """Context manager to allow access to main database tables when
    current tenant is not main.

    """
    _table_prefix.value = _table_prefix(_MAIN)
    yield
    del _table_prefix.value


def _set_default():
    _set(_Main)

    
def _set_for_request(request):
    _set_for_id(_get_id_from_request(request))

    
def _set_for_id(tenant_id):
    from . import models  # fix circ. import
    if tenant_id == _MAIN:
        _set_default()
    else:
        with _main():
            try:
                tenant = models.Tenant.objects.get(slug=tenant_id)
            except models.Tenant.DoesNotExist:
                log.error('Tenant %s not found' % tenant_id)
                raise ValueError('Tenant does not exist: %s' % tenant_id)
            else:
                _set(tenant)


def _get_id_from_request(request):
    if request.path == '/':
        tenant_id = _MAIN
    else:
        parts = request.path.split('/')
        tenant_id = parts[1]
    return tenant_id
                

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
    _current.value.is_configured = is_configured
    with _main():
        _current.value.save()


def _get_urls():
    if is_main():
        return 'main_urls'
    else:
        tid = _current.value.slug
        # Note, need 'tuple' here otherwise url stuff blows up
        return tuple(
            patterns(
                '',
                url(r'^%s/' % tid, include('network_urls')),
            ) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT))

    
def _table_prefix(tenant_id):
    return '__%s__' % tenant_id
