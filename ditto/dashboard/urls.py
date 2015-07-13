from django.conf.urls import patterns, url

from . import views

urlpatterns = patterns('',
    url(r'^dashboard/$',
        views.DashView.as_view(),
        name="dashboard"),
    url(r'^dashboard/tickets/(?:\d+/)?$',
        views.tickets,
        name="tickets"),
    url(r'^dashboard/users/(?:\w+/)?$',
        views.users,
        name="user_mgmt"),
    url(r'^dashboard/safeguarding/$',
        views.safeguarding,
        name="safeguarding"),
)
