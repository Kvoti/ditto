from django.conf.urls import patterns, url

from . import views

urlpatterns = patterns('',
    url(r'^$', views.TicketList.as_view(), name="ticket_list"),
    url(r'^(\d+)/claim/$', views.claim, name="ticket_claim"),
    url(r'^(\d+)/resolve/$', views.resolve, name="ticket_resolve"),
)
