from braces import views
from django.contrib.auth.decorators import login_required
from django.template.response import TemplateResponse
from django.views.generic import TemplateView

from core.views.decorators import nav
from core.views.mixins import NavMixin

from . import forms
from . import utils


class ChatroomView(views.LoginRequiredMixin,
                   views.PermissionRequiredMixin,
                   NavMixin,
                   TemplateView):
    template_name = 'chat/chatroom.html'
    permission_required = 'configuration.can_chat'
    nav = ['chatroom']

    def get_context_data(self, **kwargs):
        context = super(ChatroomView, self).get_context_data(**kwargs)
        return context
