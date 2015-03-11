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
    

class Messages(LoginRequiredMixin, TemplateView):
    template_name = 'chat/react.html'
    model = User
    
    def get_context_data(self, **kwargs):
        context = super(Messages, self).get_context_data(**kwargs)
        context['chat_conf'] = {
            'page': 'messages',
            'element': 'chat',
        }
        return context

    
class MessagesFrom(LoginRequiredMixin, DetailView):
    model = User
    slug_field = 'username'
    template_name = 'chat/react.html'
    
    def get_context_data(self, **kwargs):
        context = super(MessagesFrom, self).get_context_data(**kwargs)
        chat_host = self.request.tenant.chat_host()
        context['chat_conf'] = {
            'other': '%s@%s' % (self.object.username, chat_host),
            'page': 'messages',
            'element': 'chat',
        }
        return context

    
class ChatroomView(LoginRequiredMixin, NavMixin, TemplateView):
    template_name = 'chat/react.html'
    nav = ['chatroom']

    def get_context_data(self, **kwargs):
        context = super(ChatroomView, self).get_context_data(**kwargs)
        context['chat_conf'] = {
            'page': 'chatroom',
            'element': 'chat',
        }
        return context
