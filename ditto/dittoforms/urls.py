# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required

from . import views

urlpatterns = patterns('',
    url(
        regex=r'^builder/$',
        view=login_required(TemplateView.as_view(
            template_name='dittoforms/builder.html')),
    ),

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
        regex=r'^api/(\w+)/$',
        view=views.api,
    ),

)
