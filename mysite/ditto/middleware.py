from django.http import Http404


class VisitorMiddleware(object):
    allowed = [
        '/',
        '/accounts/login/',
        '/accounts/logout/',
        '/ditto/'
    ]

    def process_request(self, request):
        if (
                request.user.is_authenticated() and
                request.user.is_new and
                request.path not in self.allowed):
            raise Http404
