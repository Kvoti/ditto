from allauth.account.views import SignupView as BaseSignupView
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import Group

import core

MEMBER = core.MEMBER_ROLE


class SignupView(BaseSignupView):
    def dispatch(self, request, role_name=None):
        if not request.tenant.is_main():
            if role_name is None:
                role_name = MEMBER
            self.role = get_object_or_404(Group, name=role_name)
        return super(SignupView, self).dispatch(request, role_name)
        
    def get_form_kwargs(self):
        kwargs = super(SignupView, self).get_form_kwargs()
        if not self.request.tenant.is_main():
            kwargs['role'] = self.role
        return kwargs

    def get_context_data(self, **kwargs):
        context = super(SignupView, self).get_context_data(**kwargs)
        if not self.request.tenant.is_main():
            context['roles'] = Group.objects.exclude(
                name=MEMBER).values_list('name', flat=True)
        return context
    
signup = SignupView.as_view()
