from braces.views import LoginRequiredMixin

from django.contrib.auth.decorators import login_required
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


class AboutView(LoginRequiredMixin, NavMixin, TemplateView):
    template_name = 'pages/about.html'
    nav = ['about']
