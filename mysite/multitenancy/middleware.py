from . import tenant


# NOTE: this MUST come first in the middleware order
class CurrentTenantMiddleware(object):
    def process_request(self, request):
        tenant._set_for_request(request)
        if tenant._is_main():
            request.urlconf = 'main_urls'

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
