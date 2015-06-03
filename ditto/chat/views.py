from braces import views
from django.contrib.auth.decorators import login_required
from django.template.response import TemplateResponse
from django.views.generic import TemplateView

from core.views.decorators import nav
from core.views.mixins import NavMixin

from . import forms


@login_required  # @admin_required
@nav(['newchatroom'])
def new_chatroom(request):
    form = forms.NewChatroomForm(request.user)
    return TemplateResponse(
        request, 'chat/newchatroom.html', {'form': form})

    
class ChatroomView(views.LoginRequiredMixin,
                   views.PermissionRequiredMixin,
                   NavMixin,
                   TemplateView):
    template_name = 'chat/chatroom.html'
    permission_required = 'configuration.can_chat'
    nav = ['chatroom']
