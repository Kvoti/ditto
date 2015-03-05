from django.conf.urls import patterns, url

from . import views

urlpatterns = patterns('',
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

    url(
        regex=r'^react/(?P<slug>\w+)/$',
        view=views.React.as_view(),
        name='react'
    ),
)
