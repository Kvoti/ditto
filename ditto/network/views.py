from braces.views import LoginRequiredMixin

from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import Group
from django.db.models import Count
from django.template.response import TemplateResponse
from django.views.generic import TemplateView

from core.views.mixins import NavMixin


@login_required
def home(request):
    if request.tenant.is_configured():
        return _home(request)
    else:
        return TemplateResponse(request, 'configuration/start.html')
    
        
class _HomeView(NavMixin, TemplateView):
    template_name = 'pages/home.html'
    nav = ['home']
    
    def get_context_data(self, **kwargs):
        context = super(_HomeView, self).get_context_data(**kwargs)
        context['chat_conf'] = {
            'element': 'whosonline',
            'page': 'home',
        }
        return context
_home = _HomeView.as_view()


class PeopleView(LoginRequiredMixin, NavMixin, TemplateView):
    template_name = 'pages/people.html'
    nav = ['people']

    def get_context_data(self, **kwargs):
        context = super(PeopleView, self).get_context_data(**kwargs)
        context['roles'] = []
        for role in Group.objects.all():
            users = role.user_set.order_by('username')
            if role.name == 'Member':
                users = users.annotate(roles=Count('groups')).filter(roles=1)
            context['roles'].append((role, users))
        return context
