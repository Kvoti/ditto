# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url

from . import views

urlpatterns = patterns('',
    # URL pattern for the UserListView  # noqa
    url(
        regex=r'^config/$',
        view=views.config,
        name='config'
    ),
                       
    url(
        regex=r'^features/$',
        view=views.features,
        name='features'
    ),
                       
    url(
        regex=r'^configure/$',
        view=views.configure,
        name='configure'
    ),

    url(
        regex=r'^perms/$',
        view=views.permissions,
        name='permissions'
    ),
)
