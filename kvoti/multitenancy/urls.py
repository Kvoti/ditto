from django.conf.urls import patterns, url
from . import views

urlpatterns = patterns('',
    url(r'^$',  # noqa
        views.my_network,
        name="home"),

    url(r'^create/$',  # noqa
        views.create_my_network,
        name="create"),

    url(r'^delete/(\d+)/$',  # noqa
        views.delete_network,
        name="delete"),
                       
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
