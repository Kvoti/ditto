# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url

from . import views

urlpatterns = patterns('',
    url(r'^$',  # noqa
        views.HomeView.as_view(),
        name="home"),
    url(r'^about/$',
        views.AboutView.as_view(),
        name="about"),
    url(r'^dashboard/$',
        views.DashView.as_view(),
        name="dash"),

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
