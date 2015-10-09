# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url, include

from . import views

urlpatterns = patterns('',
    url(r'^$',  # noqa
        views.home,
        name="home"),
    url(r'^people/$',
        views.PeopleView.as_view(),
        name="people"),

    url(r'^config/', include('configuration.urls')),
    url(r'', include('chat.urls')),
    url(r'', include('dashboard.urls')),
    url(r'^forms/', include('dittoforms.urls')),

    url(r'^api/formbuilder/', include('formbuilder.api')),
    url(r'^api/comments/', include('comments.api')),
    url(r'^api/tickets/', include('tickets.api')),
    url(r'^api/users/', include('users.api')),
    url(r'^api/casenotes/', include('casenotes.api')),
    url(r'^api/chat/', include('chat.api')),
    url(r'^api/', include('configuration.api')),
)
