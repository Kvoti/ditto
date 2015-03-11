from django.conf.urls import patterns, url

from django.views.generic import TemplateView
urlpatterns = patterns(
    '',
    url(r'^(\w+).html$', TemplateView.as_view(
        template_name="usecases/usecases.html"),
        name="usecase"),
)
