from core.views.mixins import NavMixin

from django.views.generic import TemplateView


class DashView(NavMixin, TemplateView):
    template_name = 'dashboard/dashboard.html'
    nav = ['dashboard']
