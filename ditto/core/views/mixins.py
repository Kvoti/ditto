from django.utils.decorators import method_decorator

from .decorators import admin_required


class AdminRequiredMixin(object):
    @method_decorator(admin_required)
    def dispatch(self, *args, **kwargs):
        return super(AdminRequiredMixin, self).dispatch(*args, **kwargs)

    
class NavMixin(object):
    """Mixin for setting navigation state.

    E.g.

        class HomeView(NavMixin, TemplateView):
            nav = ['home']

    """
    def get_context_data(self, **kwargs):
        context = super(NavMixin, self).get_context_data(**kwargs)
        context['nav'] = self.nav
        if hasattr(self, 'back'):
            context['back'] = self.back
        return context
