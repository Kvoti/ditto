from allauth.account.views import SignupView as BaseSignupView
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import Group


class SignupView(BaseSignupView):
    def dispatch(self, request, role_name):
        self.role = get_object_or_404(Group, name=role_name)
        return super(SignupView, self).dispatch(request, role_name)
        
    def get_form_kwargs(self):
        kwargs = super(SignupView, self).get_form_kwargs()
        kwargs['role'] = self.role
        return kwargs

signup = SignupView.as_view()
