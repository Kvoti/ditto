from django.conf.urls import patterns, url

from . import views

urlpatterns = patterns('',
    url(
        regex=r'^step([1234])/$',
        view=views.edit_initial_config,
        name='initialconfig'
    ),
    url(r'^debug/start-again/$',
        views.start_again,
        name="start-again"),
                       
    url(
        regex=r'^(basicinfo|permissions|features)/$',
        view=views.edit_config,
        name='editconfig'
    ),
    url(
        regex=r'^roles/$',
        view=views.roles,
        name='settings'
    ),
    url(
        regex=r'^roles/(\d+)/delete/$',
        view=views.delete_role,
        name='delete-role'
    ),
)
