from django.conf.urls import patterns, url
from . import views

urlpatterns = patterns('',
    url(r'^$',  # noqa
        views.my_network,
        name="home"),

    # mondgooseim auth api endpoint
    url(
        regex=r'^get_password$',
        view=views.get_password,
    ),

)
