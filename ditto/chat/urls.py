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
        # TODO not sure what url to use for chat threads yet, maybe a hash of the participants and subject?
        # for now using the hacky threadID in the chat app that needs fixing
        regex=r'^messages/[^/]+/',
        view=login_required(
            views.TemplateView.as_view(
                template_name="index.html"
            ),
        ),
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
                       
)
