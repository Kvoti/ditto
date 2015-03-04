from django.conf.urls import patterns, url

from . import views

urlpatterns = patterns('',
    url(r'^dashboard/$',
        views.DashView.as_view(),
        name="dashboard"),
)
