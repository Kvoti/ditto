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
        regex=r'^settings/config/$',
        view=views.config,
        name='config'
    ),
                       
    url(
        regex=r'^settings/features/$',
        view=views.Features.as_view(),
        name='features'
    ),
    url(
        regex=r'^settings/features/(\w+)/(\w+)/$',
        view=views.feature_permissions,
        name='feature-permissions'
    ),
                       
    url(
        regex=r'^settings/roles/$',
        view=views.roles,
        name='settings'
    ),
    url(
        regex=r'^settings/roles/(\d+)/delete/$',
        view=views.delete_role,
        name='delete-role'
    ),

    url(
        regex=r'^settings/permissions/$',
        view=views.RoleList.as_view(),
        name='permissions'
    ),
    url(
        regex=r'^settings/permissions/(\d+)/$',
        view=views.permissions_for,
        name='permissions-for'
    ),
    url(
        regex=r'^settings/permissions/(\d+)/(\d+)/$',
        view=views.permissions_between,
        name='permissions-between'
    ),
                       
    url(
        regex=r'^chatroom/$',
        view=views.ChatroomView.as_view(),
        name='chatroom'
    ),
)
