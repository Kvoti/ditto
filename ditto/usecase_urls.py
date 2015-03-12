from collections import OrderedDict
from django.conf.urls import patterns, url
from django.http import Http404
from django.views.generic import TemplateView


class UseCaseView(TemplateView):
    use_cases = OrderedDict([
        ('therapist', {
            'name': 'Psychotherapist',
            'img': 'Use-Case-Psychotherapist',
            'alt': 'diagram showing use case of a Ditto network for a psychotherapist',
        }),
        ('legal-practice', {
            'name': 'Legal practice',
            'img': 'Use-Case-Legal',
            'alt': 'diagram showing use case of a Ditto network for a small legal practice',
        }),
        ('housing-association', {
            'name': 'Housing association',
            'img': 'Use-Case-Housing',
            'alt': 'diagram showing use case of a Ditto network for a housing association',
        }),
        ('adult-social-care', {
            'name': 'Adult social care',
            'img': 'Use-Case-Adult-Social-Care',
            'alt': 'diagram showing use case of a Ditto network for an adult social care organisation',
        }),
        ('sexual-health', {
            'name': 'Sexual health charity',
            'img': 'Use-Case-Sexual-Health-Charity',
            'alt': 'diagram showing use case of a Ditto network for a sexual health charity',
        }),
    ])
        
    def get_context_data(self, **kwargs):
        if self.kwargs['case'] not in self.use_cases:
            raise Http404('No such case')
        context = super(UseCaseView, self).get_context_data(**kwargs)
        context['cases'] = self.use_cases
        context['meta'] = self.use_cases[self.kwargs['case']]
        return context
    
    
urlpatterns = patterns(
    '',
    url(r'^(?P<case>[\w-]+).html$', UseCaseView.as_view(
        template_name="usecases/usecases.html"),
        name="usecase"),
)
