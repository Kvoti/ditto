from braces.views import LoginRequiredMixin

from django.contrib import messages
from django.contrib.auth.models import Group
from django.contrib.auth.decorators import permission_required, login_required
from django.core.signing import Signer
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.template.response import TemplateResponse
from django.utils.decorators import method_decorator
from django.utils.translation import ugettext_lazy as _
from django.views.generic import TemplateView, ListView, DetailView

import wrapt

from users.models import User
from utils.views import ContextMixin

from . import forms
from . import models

CHAT_AUTH_CONTEXT_VAR = 'pass'
admin_required = permission_required('users.can_admin', raise_exception=True)


class AdminRequiredMixin(object):
    @method_decorator(admin_required)
    def dispatch(self, *args, **kwargs):
        return super(AdminRequiredMixin, self).dispatch(*args, **kwargs)


def nav(nav):
    """Decorator for setting navigation state.

    E.g.

    @nav(['dash', 'settings'])
    def my_view(request):
        ...
    """
    @wrapt.decorator
    def wrapper(wrapped, instance, args, kwargs):
        template_response = wrapped(*args, **kwargs)
        if hasattr(template_response, 'context_data'):
            template_response.context_data['nav'] = nav
        return template_response
    return wrapper

    
class NavMixin(ContextMixin):
    """Mixin for setting navigation state.

    E.g.

        class HomeView(NavMixin, TemplateView):
            nav = ['home']

    """
    def process_context(self, context):
        context['nav'] = self.nav
        return context


@wrapt.decorator
def chat_view(wrapped, instance, args, kwargs):
    template_response = wrapped(*args, **kwargs)
    if hasattr(template_response, 'context_data'):
        template_response.context_data[CHAT_AUTH_CONTEXT_VAR] = \
            _get_chat_password(args[0].user.username)
    return template_response


class ChatAuthMixin(ContextMixin):
    def process_context(self, context):
        context[CHAT_AUTH_CONTEXT_VAR] = \
            _get_chat_password(self.request.user.username)
        return context


def _get_chat_password(username):
    signer = Signer()
    return signer.sign(username)
    
    
class _HomeView(NavMixin, TemplateView):
    template_name = 'pages/home.html'
    nav = ['home']
_home = _HomeView.as_view()


@login_required
def home(request):
    if request.user.is_new:
        return TemplateResponse(request, 'ditto/create.html')
    else:
        return _home(request)
    
        
class AboutView(LoginRequiredMixin, NavMixin, TemplateView):
    template_name = 'pages/about.html'
    nav = ['about']


class DashView(NavMixin, AdminRequiredMixin, TemplateView):
    template_name = 'pages/dash.html'
    nav = ['dash']
    

class ChatroomView(LoginRequiredMixin, NavMixin, ChatAuthMixin, TemplateView):
    template_name = 'ditto/chat/chatroom.html'
    nav = ['chatroom']

    
@login_required  # @admin_required
@nav(['chatroom'])
@chat_view
def private_chatroom(request, room):
    # invite-only chatroom
    return TemplateResponse(
        request, 'ditto/chat/chatroom.html', {'room': room})


@login_required  # @admin_required
@nav(['newchatroom'])
@chat_view
def new_chatroom(request):
    form = forms.NewChatroomForm(request.user)
    return TemplateResponse(
        request, 'ditto/chat/newchatroom.html', {'form': form})


class PrivateChatView(LoginRequiredMixin, NavMixin, ChatAuthMixin, DetailView):
    model = User
    slug_field = 'username'
    context_object_name = 'chatee'
    template_name = 'ditto/chat/private_chat.html'
    nav = ['private_chat']

    
class PrivateChatsView(LoginRequiredMixin, NavMixin, ListView):
    model = User
    context_object_name = 'chatees'
    template_name = 'ditto/chat/private_chats.html'
    nav = ['private_chat']
    
    
@admin_required
@nav(['dash', 'roles'])
def roles(request, template='ditto/roles.html', success_url=None, on_success=None):
    if success_url is None:
        success_url = request.path
    try:
        extra = int(request.POST.get('extra'))
    except (TypeError, ValueError):
        extra = 1
    if request.method == 'POST' and 'delete' in request.POST:
        group = get_object_or_404(Group, pk=request.POST['delete'])
        group.delete()
        return HttpResponseRedirect(request.path)
    if request.method == 'POST' and 'add' not in request.POST:
        formset = forms.RoleFormSet(extra, data=request.POST)
        if formset.is_valid():
            formset.save()
            messages.success(request, "Configuration successfully updated")
            if on_success:
                on_success(request)
            return HttpResponseRedirect(success_url)
    else:
        i = 0
        initial = []
        while True:
            name_key = 'form-{}-name'.format(i)
            id_key = 'form-{}-id'.format(i)
            if id_key not in request.POST:
                break
            if not request.POST[id_key]:
                initial.append({'name': request.POST[name_key]})
            i += 1
        formset = forms.RoleFormSet(extra, initial=initial)
    return TemplateResponse(request, template, {
        'formset': formset,
        'extra': extra + 1
    })


@admin_required
@nav(['dash', 'roles'])
def delete_role(request, role_id):
    group = get_object_or_404(Group, pk=role_id)
    if request.method == 'POST':
        group.delete()
        # TODO trans
        messages.success(request, "Deleted '%s' role" % group.name)
        return HttpResponseRedirect(reverse('ditto:settings'))
    return TemplateResponse(request, 'ditto/delete_role_confirm.html', {
        'group': group,
    })
    

class RoleList(NavMixin, AdminRequiredMixin, ListView):
    model = Group
    nav = ['dash', 'permissions']

    
@admin_required
@nav(['dash', 'permissions'])
def permissions_for(request, pk):
    role = get_object_or_404(Group, pk=pk)
    roles = Group.objects.exclude(pk=pk)
    
    return TemplateResponse(request, 'ditto/permissions_for.html', {
        'role': role,
        'roles': roles,
    })


@admin_required
@nav(['dash', 'permissions'])
def permissions_between(request, pk1, pk2):
    role1 = get_object_or_404(Group, pk=pk1)
    role2 = get_object_or_404(Group, pk=pk2)

    if request.method == 'POST':
        form = forms.PermissionsForm(role1, role2, data=request.POST)
        if form.is_valid():
            is_changed = form.save()
            if is_changed:
                messages.success(request, _("Permissions updated"))
            return HttpResponseRedirect(request.path)
    else:
        form = forms.PermissionsForm(role1, role2)
        
    return TemplateResponse(request, 'ditto/permissions_between.html', {
        'role1': role1,
        'role2': role2,
        'form': form,
    })


class Features(NavMixin, AdminRequiredMixin, ListView):
    model = Group
    template_name = 'ditto/features.html'
    nav = ['dash', 'features']
    
    def get_context_data(self, **kwargs):
        context = super(Features, self).get_context_data(**kwargs)
        context['features'] = models.Feature.objects.all()
        return context

    
@admin_required
@nav(['dash', 'features'])
def feature_permissions(request, role_slug, feature_slug):
    group = get_object_or_404(Group, name__iexact=role_slug)
    feature = get_object_or_404(models.Feature, slug=feature_slug)
    
    if request.method == 'POST':
        form = forms.FeaturePermissionsForm(group, feature, data=request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, _("Permissions saved"))
            return HttpResponseRedirect(request.path)
    else:
        form = forms.FeaturePermissionsForm(group, feature)
        
    return TemplateResponse(request, 'ditto/feature_permissions.html', {
        'form': form,
        'group': group,
        'feature': feature,
    })


@admin_required
@nav(['dash', 'settings'])
def config(request, template='ditto/config.html', success_url=None):
    if success_url is None:
        success_url = request.path
    try:
        config = models.Config.objects.all()[0]
    except IndexError:
        config = None
    if request.method == 'POST':
        form = forms.ConfigForm(data=request.POST, instance=config)
        if form.is_valid():
            form.save()
            messages.success(request, "Configuration successfully updated")
            return HttpResponseRedirect(success_url)
    else:
        form = forms.ConfigForm(instance=config)
        
    return TemplateResponse(request, template, {
        'form': form,
    })


@admin_required
def step1(request):
    return config(
        request,
        template='ditto/signup/step1.html',
        success_url=reverse('ditto:create-step2')
    )


@admin_required
def step2(request):
    return roles(
        request,
        template='ditto/signup/step2.html',
        success_url=reverse('ditto:home'),
        on_success=_on_setup_finish
    )


def _on_setup_finish(request):
    user = request.user
    user.is_new = False
    user.save()


def start_again(request):
    user = request.user
    user.is_new = True
    user.save()
    return HttpResponseRedirect(reverse('ditto:home'))
