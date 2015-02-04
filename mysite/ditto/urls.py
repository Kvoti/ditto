# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url
from django.views.generic import TemplateView

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

    # chatroom and private chat                       
    url(
        regex=r'^chatroom/$',
        view=views.ChatroomView.as_view(),
        name='chatroom'
    ),
    # Candy chatroom(s) for comparison
    url(
        regex=r'^candy/$',
        view=TemplateView.as_view(
            template_name="ditto/chat/candy.html",
        ),
        name='candy'
    ),
    url(
        regex=r'^messages/$',
        view=views.PrivateChatsView.as_view(),
        name='private_chats'
    ),
    url(
        regex=r'^messages/(?P<slug>\w+)/$',
        view=views.PrivateChatView.as_view(),
        name='private_chat'
    ),
                       
    # auth api endpoints for mongooseim
    # TODO move into separate module?
    url(
        regex=r'^check_password$',
        view=views.check_password,
    ),
    url(
        regex=r'^user_exists$',
        view=views.user_exists,
    ),
    url(
        regex=r'^get_password$',
        view=views.get_password,
    ),

)
