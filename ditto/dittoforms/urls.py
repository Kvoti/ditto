# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url

from . import views

urlpatterns = patterns('',
    url(
        regex=r'^(\w+)/$',
        view=views.form,
    ),

    url(
        regex=r'^(\w+)/response/$',
        view=views.response,
    ),
                       
    url(
        regex=r'^(\w+)/response/edit/$',
        view=views.edit,
    ),

    url(
        regex=r'^(\w+)/api/$',
        view=views.api,
    ),
)
