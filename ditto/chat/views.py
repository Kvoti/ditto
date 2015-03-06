import json

from braces.views import LoginRequiredMixin
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.core.signing import Signer
from django.http import Http404
from django.template.response import TemplateResponse
from django.views.generic import TemplateView, DetailView

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


class PrivateChatsView(LoginRequiredMixin, NavMixin, TemplateView):
    template_name = 'chat/private_chats.html'
    nav = ['messages']

    
class PrivateChatView(LoginRequiredMixin, NavMixin, DetailView):
    model = User
    slug_field = 'username'
    context_object_name = 'chatee'
    template_name = 'chat/private_chat.html'
    nav = ['private_chat']

    # def get_object(self, queryset=None):
    #     obj = super(PrivateChatView, self).get_object(queryset)
    #     if configuration.utils.is_user_messaging_permitted(
    #             self.request.user,
    #             obj
    #     ):
    #         return obj
    #     raise Http404

    
class React(LoginRequiredMixin, DetailView):
    model = User
    slug_field = 'username'
    template_name = 'chat/react.html'

    def get_context_data(self, **kwargs):
        context = super(React, self).get_context_data(**kwargs)
        server = "localhost" if settings.DEBUG else "134.213.147.235"
        if settings.DEBUG:
            password = ""
        else:
            signer = Signer()
            password = signer.sign(self.request.user.username)
        context['conf'] = json.dumps({
            'me': self._resource(self._jid(self.request.user.username)),
            'other': self._jid(self.object.username),
            'nick': self.request.user.username,
            'server': server,
            'password': password,
            'chatroom': 'muc1@muc.%s' % self.request.tenant.chat_host(),
        })
        return context

    def _jid(self, username):
        chat_host = self.request.tenant.chat_host()
        return '%s@%s' % (username, chat_host)

    def _resource(self, jid):
        return '%s/Ditto' % jid
    
