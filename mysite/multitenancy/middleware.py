from django.http import Http404
from django.contrib.sites.models import Site
from . import tenant


# NOTE: this MUST come first in the middleware order
class CurrentTenantMiddleware(object):
    def process_request(self, request):
        try:
            tenant._set_for_request(request)
        except ValueError as e:
            raise Http404(e)
        if tenant._is_main():
            request.urlconf = 'main_urls'
        else:
            request.urlconf = tenant._get_urls()
            # TODO more usual to attach a class than module!?
            request.tenant = tenant
        # TODO wonder what else is screwed up by changing _meta.db_table on the fly!!??
        Site.objects.clear_cache()
        
    def process_response(self, request, response):
        self._unset()
        return response

    def process_exception(self, request, exception):
        self._unset()

    def _unset(self):
        try:
            tenant._unset()
        except AttributeError:
            pass
