from django.conf import settings
from django.conf.urls import patterns, include, url
from django.conf.urls.static import static
from django.views.generic import RedirectView


class FakeTenant(object):
    is_main =  lambda self: False
    is_configured = lambda self: True
    id = 'di'

    def chat_host(self):
        if settings.DEBUG:
            return 'network1.localhost'
        return 'network1.ditto.technology'
        

# NOTE: this MUST come first in the middleware order
class CurrentTenantMiddleware(object):
    def process_request(self, request):
        request.tenant = FakeTenant()
        request.urlconf = _get_urls('di')

        
def _get_urls(tenant_slug):
    # Note, need 'tuple' here otherwise url stuff blows up
    return tuple(
        patterns(
            '',
            (r'^$', RedirectView.as_view(
                pattern_name='ditto:home',
                permanent=True,
            )),
            url(r'^%s/' % tenant_slug, include('network_urls')),
            url(r'^main/', include('multitenancy.urls', namespace="ditto")),
        ) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT))
