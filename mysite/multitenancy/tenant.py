from contextlib import contextmanager
from threading import local

_current_tenant = local()

_MAIN = '__main__'


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
    if '.' in host:
        tenant = host.split('.')[0]
        table_prefix = _table_prefix(tenant)
    else:
        table_prefix = _MAIN
    return _set(table_prefix)


def _set_for_tenant(tenant):
    _set(_table_prefix(tenant))


def _table_prefix(tenant):
    return '__%s__' % tenant


def _set_default():
    _set(_MAIN)

    
def _set(table_prefix):
    _current_tenant.table_prefix = table_prefix


def _unset():
    del _current_tenant.table_prefix


def _is_main():
    return _current_tenant.table_prefix == _MAIN


@contextmanager
def _tenant(tenant_id):
    _set_for_tenant(tenant_id)
    yield
    _unset()
