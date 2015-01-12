from django.contrib import messages
from django.contrib.auth.models import Group
from django.contrib.auth.decorators import permission_required
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from django.shortcuts import render, get_object_or_404
from django.utils.decorators import method_decorator
from django.utils.translation import ugettext_lazy as _
from django.views.generic import TemplateView, ListView

from . import forms
from . import models


admin_required = permission_required('user.can_admin')


class AdminRequiredMixin(object):
    @method_decorator(admin_required)
    def dispatch(self, *args, **kwargs):
        super(AdminRequiredMixin, self).dispatch(*args, **kwargs)
    
    
class NavTemplateView(TemplateView):
    """TemplateView subclass for pages that net to set the nav state.

    E.g.

        class HomeView(NavTemplateView):
            nav = ['home']

    """
    def get_context_data(self, **kwargs):
        context = super(NavTemplateView, self).get_context_data(**kwargs)
        context['nav'] = self.nav
        return context


class HomeView(NavTemplateView):
    template_name = 'pages/home.html'
    nav = ['home']


class AboutView(NavTemplateView):
    template_name = 'pages/about.html'
    nav = ['about']


class DashView(AdminRequiredMixin, NavTemplateView):
    template_name = 'pages/dash.html'
    nav = ['dash']
    

@admin_required
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
        
    return render(request, 'ditto/roles.html', {
        'formset': formset,
        'nav': ['dash', 'roles'],
    })


@admin_required
def delete_role(request, role_id):
    group = get_object_or_404(Group, pk=role_id)
    if request.method == 'POST':
        group.delete()
        # TODO trans
        messages.success(request, "Deleted '%s' role" % group.name)
        return HttpResponseRedirect(reverse('ditto:settings'))
    return render(request, 'ditto/delete_role_confirm.html', {
        'group': group,
        'nav': ['dash', 'roles'],
    })
    

class RoleList(AdminRequiredMixin, ListView):
    model = Group


@admin_required
def permissions_for(request, pk):
    role = get_object_or_404(Group, pk=pk)
    roles = Group.objects.exclude(pk=pk)
    
    return render(request, 'ditto/permissions_for.html', {
        'role': role,
        'roles': roles,
        'nav': ['configure'],
    })


@admin_required
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
        
    return render(request, 'ditto/permissions_between.html', {
        'role1': role1,
        'role2': role2,
        'form': form,
        'nav': ['configure'],
    })


class Features(AdminRequiredMixin, ListView):
    model = Group
    template_name = 'ditto/features.html'
    
    def get_context_data(self, **kwargs):
        context = super(Features, self).get_context_data(**kwargs)
        context['features'] = models.Feature.objects.all()
        context['nav'] = ['dash', 'features']
        return context

    
@admin_required
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
        
    return render(request, 'ditto/feature_permissions.html', {
        'form': form,
        'group': group,
        'feature': feature,
        'nav': ['configure'],
    })


@admin_required
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
        
    return render(request, 'ditto/config.html', {
        'form': form,
        # TODO set nav state in decorator, bit neater?
        'nav': ['dash', 'settings'],
    })
