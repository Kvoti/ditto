# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url, include

from . import views

urlpatterns = patterns('',
    url(r'^$',  # noqa
        views.home,
        name="home"),
    url(r'^about/$',
        views.AboutView.as_view(),
        name="about"),

    url(r'^config/', include('configuration.urls')),
    url(r'', include('chat.urls')),
    url(r'', include('dashboard.urls')),
    url(r'^forms/', include('dittoforms.urls')),

)
