from braces.views import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.http import Http404
from django.template.response import TemplateResponse
from django.views.generic import TemplateView, ListView, DetailView


import configuration.utils
from core.views.decorators import nav
from core.views.mixins import NavMixin
from users.models import User

from . import forms


class ChatroomView(LoginRequiredMixin, NavMixin, TemplateView):
    template_name = 'chat/chatroom.html'
    nav = ['chatroom']

    
@login_required  # @admin_required
@nav(['chatroom'])
def private_chatroom(request, room):
    # invite-only chatroom
    return TemplateResponse(
        request, 'chat/chatroom.html', {'room': room})


@login_required  # @admin_required
@nav(['newchatroom'])
def new_chatroom(request):
    form = forms.NewChatroomForm(request.user)
    return TemplateResponse(
        request, 'chat/newchatroom.html', {'form': form})


class PrivateChatsView(LoginRequiredMixin, NavMixin, ListView):
    model = User
    context_object_name = 'chatees'
    template_name = 'chat/private_chats.html'
    nav = ['messages']

    def get_queryset(self):
        return configuration.utils.get_permitted_users_for_messaging(
            self.request.user,
        )

    
class PrivateChatView(LoginRequiredMixin, NavMixin, DetailView):
    model = User
    slug_field = 'username'
    context_object_name = 'chatee'
    template_name = 'chat/private_chat.html'
    nav = ['private_chat']

    def get_object(self, queryset=None):
        obj = super(PrivateChatView, self).get_object(queryset)
        if configuration.utils.is_user_messaging_permitted(
                self.request.user,
                obj
        ):
            return obj
        raise Http404
