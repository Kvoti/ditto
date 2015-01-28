from django.contrib import messages
from django.contrib.auth.models import Group
from django.contrib.auth.decorators import permission_required
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.template.response import TemplateResponse
from django.utils.decorators import method_decorator
from django.utils.translation import ugettext_lazy as _
from django.views.generic import TemplateView, ListView
import wrapt

from . import forms
from . import models


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
        template_response.context_data['nav'] = nav
        return template_response
    return wrapper

    
class NavMixin(object):
    """Mixin for pages that net to set the nav state.

    E.g.

        class HomeView(NavMixin, TemplateView):
            nav = ['home']

    """
    def get_context_data(self, **kwargs):
        context = super(NavMixin, self).get_context_data(**kwargs)
        context['nav'] = self.nav
        return context


class HomeView(NavMixin, TemplateView):
    template_name = 'pages/home.html'
    nav = ['home']


class AboutView(NavMixin, TemplateView):
    template_name = 'pages/about.html'
    nav = ['about']


class DashView(NavMixin, AdminRequiredMixin, TemplateView):
    template_name = 'pages/dash.html'
    nav = ['dash']
    

class ChatroomView(NavMixin, TemplateView):
    template_name = 'ditto/chatroom.html'
    nav = ['chatroom']

    
@admin_required
@nav(['dash', 'roles'])
def roles(request):
    extra = 1 if 'add' in request.GET else 0
    if request.method == 'POST':
        formset = forms.RoleFormSet(extra, data=request.POST)
        if formset.is_valid():
            formset.save()
            messages.success(request, "Configuration successfully updated")
            return HttpResponseRedirect(request.path)
    else:
        formset = forms.RoleFormSet(extra)
        
    return TemplateResponse(request, 'ditto/roles.html', {
        'formset': formset,
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
def config(request):
    try:
        config = models.Config.objects.all()[0]
    except IndexError:
        config = None
    if request.method == 'POST':
        form = forms.ConfigForm(data=request.POST, instance=config)
        if form.is_valid():
            form.save()
            messages.success(request, "Configuration successfully updated")
            return HttpResponseRedirect(request.path)
    else:
        form = forms.ConfigForm(instance=config)
        
    return TemplateResponse(request, 'ditto/config.html', {
        'form': form,
    })
