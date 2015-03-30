from django.conf.urls import patterns, url
from django.contrib.auth.decorators import login_required

from . import views

urlpatterns = patterns('',
    url(
        regex=r'^chatroom/$',
        view=views.ChatroomView.as_view(),
        name='chatroom'
    ),
                       
    url(
        regex=r'^messages/$',
        view=login_required(
            views.TemplateView.as_view(
                template_name="index.html"
            ),
        ),
        name='private_chats'
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
                       
    # url(
    #     regex=r'^messages/$',
    #     view=views.Messages.as_view(),
    #     name='private_chats'
    # ),
    # url(
    #     regex=r'^messages/(?P<slug>\w+)/$',
    #     view=views.MessagesFrom.as_view(),
    #     name='private_chat'
    # ),
)
