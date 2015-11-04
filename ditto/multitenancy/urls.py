from django.conf.urls import patterns, url
from . import views

urlpatterns = patterns('',
    # mondgooseim auth api endpoint
    url(
        regex=r'^get_password$',
        view=views.get_password,
    ),
    url(
        regex=r'^user_exists$',
        view=views.user_exists,
    ),

)
