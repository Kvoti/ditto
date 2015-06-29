import logging

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
        request.urlconf = tenant._get_urls()
        request.tenant = tenant
        # TODO wonder what else is screwed up by changing _meta.db_table on the fly!!??
        Site.objects.clear_cache()
        
    def process_response(self, request, response):
        logging.debug('unsetting tenant in response')
        self._unset()
        return response

    # Take this out for now as it causes an error when trying to render a 404
    # def process_exception(self, request, exception):
    #     logging.debug('unsetting tenant in exception response')
    #     self._unset()

    def _unset(self):
        try:
            tenant._unset()
        except AttributeError:
            pass
