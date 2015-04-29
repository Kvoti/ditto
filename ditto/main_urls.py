# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf import settings
from django.conf.urls import patterns, include, url
from django.conf.urls.static import static
from django.views.generic import RedirectView

# url patterns required for someone to sign up and create their own
# new network
urlpatterns = patterns('',
    (r'^$', RedirectView.as_view(
        pattern_name='ditto:home',
        permanent=True,
    )),
    # include 'signup' urls above 'allauth' to override                       
    url(r'^main/accounts/', include('signup.urls')),
    url(r'^main/accounts/', include('allauth.urls')),
    url(r'^main/use-cases/', include('usecase_urls')),
    url(r'^main/', include('multitenancy.urls', namespace="ditto")),

) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
