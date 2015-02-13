# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url
from django.views.generic import TemplateView

from . import views

urlpatterns = patterns('',
    url(r'^$',  # noqa
        views.home,
        name="home"),
    url(r'^about/$',
        views.AboutView.as_view(),
        name="about"),
    url(r'^dashboard/$',
        views.DashView.as_view(),
        name="dash"),
                       
    url(r'^debug/start-again/$',
        views.start_again,
        name="start-again"),

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
        view=views.permissions,
        name='permissions'
    ),

    # inital configuration
    url(
        regex=r'^create/step1/$',
        view=views.step1,
        name='create-step1'
    ),
    url(
        regex=r'^create/step2/$',
        view=views.step2,
        name='create-step2'
    ),
                       
    # chatroom and private chat                       
    url(
        regex=r'^chatroom/$',
        view=views.ChatroomView.as_view(),
        name='chatroom'
    ),
    url(
        regex=r'^chatroom/new/$',
        view=views.new_chatroom,
        name='new-chatroom'
    ),
    url(
        regex=r'^chatroom/(\w+)/$',
        view=views.private_chatroom,
        name='private-chatroom'
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
)
