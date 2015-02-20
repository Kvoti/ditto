from core.views.mixins import AdminRequiredMixin, NavMixin

from django.views.generic import TemplateView


class DashView(NavMixin, AdminRequiredMixin, TemplateView):
    template_name = 'dashboard/dashboard.html'
    nav = ['dash']
