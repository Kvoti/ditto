# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf import settings
from django.conf.urls import patterns, include, url
from django.conf.urls.static import static
from django.views.generic import TemplateView

# url patterns required for someone to sign up and create their own
# new network
urlpatterns = patterns('',
    url(r'^accounts/', include('allauth.urls')),
    # url(r'^$', TemplateView.as_view(template_name='landing.html'), name='landing'),
    url(r'', include('multitenancy.urls', namespace="tenant")),

) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
