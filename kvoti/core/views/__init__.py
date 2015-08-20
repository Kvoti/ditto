import os

from django.views.generic import TemplateView


class PageView(TemplateView):
    def get_template_names(self):
        return [os.path.join('pages', self.args[0] + '.html')]

    def get_context_data(self, **kwargs):
        context = super(PageView, self).get_context_data(**kwargs)
        context['nav'] = [self.args[0]]
        return context
