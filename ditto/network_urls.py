# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf import settings
from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),

    # User management
    url(r'^users/', include("users.urls", namespace="users")),
    # include 'signup' urls above 'allauth' to override                       
    url(r'^accounts/', include('signup.urls')),
    url(r'^accounts/', include('allauth.urls')),

    # Your stuff: custom urls go here
    url(r'', include('network.urls', namespace="ditto")),
    url(r'', include('django_comments.urls')),

)
