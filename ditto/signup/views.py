from allauth.account.views import SignupView as BaseSignupView
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import Group


class SignupView(BaseSignupView):
    def dispatch(self, request, role_name=None):
        if role_name is None:
            role_name = 'Member'
        self.role = get_object_or_404(Group, name=role_name)
        return super(SignupView, self).dispatch(request, role_name)
        
    def get_form_kwargs(self):
        kwargs = super(SignupView, self).get_form_kwargs()
        kwargs['role'] = self.role
        return kwargs

    def get_context_data(self, **kwargs):
        context = super(SignupView, self).get_context_data(**kwargs)
        context['roles'] = Group.objects.exclude(name='Member').values_list('name', flat=True)
        return context
    
signup = SignupView.as_view()
