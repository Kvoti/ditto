import sesame.utils
from allauth.account.views import SignupView as BaseSignupView
from django.shortcuts import get_object_or_404, render
from django.contrib.auth.decorators import permission_required
from django.contrib.auth.models import Group
from django.contrib import messages
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from django.contrib.sites.models import Site

import core
from users.models import User

from . import forms


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


@permission_required('users.invite_user', raise_exception=True)
def add_invite(request):
    if request.method == 'POST':
        form = forms.InviteForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "User %s created." % form.cleaned_data['username'])
            return HttpResponseRedirect(reverse('invites'))
    else:
        form = forms.InviteForm()
    return render(request, 'signup/add_invite.html', {'form': form})


@permission_required('users.invite_user', raise_exception=True)
def invites(request):
    links = [(user.username,
              'http://%s/main/%s' % (Site.objects.get_current().domain, sesame.utils.get_query_string(user)))
             for user in User.objects.order_by('-date_joined')]
    return render(request, 'signup/guest_links.html', {'links': links})
