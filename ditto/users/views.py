# -*- coding: utf-8 -*-
import json

# Import the reverse lookup function
from django.core.urlresolvers import reverse

from django.http import HttpResponse
# view imports
from django.views.generic import DetailView
from django.views.generic import RedirectView
from django.views.generic import UpdateView
from django.views.generic import ListView

# Only authenticated users can access views using this.
from braces.views import LoginRequiredMixin

from casenotes.models import CaseNote
from core.views.mixins import NavMixin
from configuration.utils import get_reg_data

# Import the form from users/forms.py
from .forms import UserForm

# Import the customized User model
from .models import User


class UserDetailView(LoginRequiredMixin, NavMixin, DetailView):
    model = User
    # These next two lines tell the view to index lookups by username
    slug_field = "username"
    slug_url_kwarg = "username"
    nav = ['me']

    def get_context_data(self, **kwargs):
        context = super(UserDetailView, self).get_context_data(**kwargs)
        context['is_me'] = self.request.user == self.object
        context['reg_data'] = get_reg_data(self.object)
        context['show_casenotes'] = CaseNote.objects.filter_for_viewer(
            self.request.user).count()
        context['chat_link'] = self.request.user.chat_link(self.object)
        return context

    
class UserRedirectView(LoginRequiredMixin, RedirectView):
    permanent = False

    def get_redirect_url(self):
        return reverse("users:detail",
                       kwargs={"username": self.request.user.username})


class UserUpdateView(LoginRequiredMixin, UpdateView):

    form_class = UserForm

    # we already imported User in the view code above, remember?
    model = User

    # send the user back to their own page after a successful update
    def get_success_url(self):
        return reverse("users:detail",
                       kwargs={"username": self.request.user.username})

    def get_object(self):
        # Only get the User record for the user making the request
        return User.objects.get(username=self.request.user.username)


class UserListView(LoginRequiredMixin, ListView):
    model = User
    # These next two lines tell the view to index lookups by username
    slug_field = "username"
    slug_url_kwarg = "username"


#@login_required
def search(request):
    users = User.objects.values_list('username', flat=True)
    query = request.GET.get('q', '')
    if query:
        users = users.filter(username__contains=query)
    return HttpResponse(json.dumps(list(users)),
                        content_type="application/json")
