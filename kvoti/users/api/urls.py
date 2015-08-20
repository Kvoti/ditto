from django.conf.urls import patterns, url

from . import views

urlpatterns = patterns('',
    url(r'^$', views.UserList.as_view(), name="user_mgmt_list"),
)
