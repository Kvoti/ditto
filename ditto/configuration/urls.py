from django.conf.urls import patterns, url

from . import views

urlpatterns = patterns('',
    url(
        regex=r'^step1/$',
        view=views.step1,
        name='create-step1'
    ),
    url(
        regex=r'^step2/$',
        view=views.step2,
        name='create-step2'
    ),
    url(
        regex=r'^step3/$',
        view=views.step3,
        name='create-step3'
    ),
    url(r'^debug/start-again/$',
        views.start_again,
        name="start-again"),
                       
                       
    url(
        regex=r'^config/$',
        view=views.config,
        name='config'
    ),
    url(
        regex=r'^features/$',
        view=views.feature_permissions,
        name='features'
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
    url(
        regex=r'^permissions/$',
        view=views.permissions,
        name='permissions'
    ),
)
