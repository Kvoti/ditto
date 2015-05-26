from django.conf.urls import patterns, url

from . import views

urlpatterns = patterns(
    "",
    # default Member signup view
    url(r"^signup/$", views.signup, name="account_signup"),

    # Role specific signup view
    url(r"^signup/(\w+)/$", views.signup, name="account_signup_role"),

    url(r"^invites/$", views.invites, name="invites"),

    url(r"^invites/add/$", views.add_invite, name="add_invite")
)
