from django.conf.urls import patterns, url

from . import views

urlpatterns = patterns(
    "",
    # Role specific signup view
    url(r"^signup/(\w+)/$", views.signup, name="account_signup_role"),
)
