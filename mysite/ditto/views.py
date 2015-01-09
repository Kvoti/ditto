from django.contrib.sites.models import Site
from django.contrib import messages
from django.contrib.auth.models import Group
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from django.shortcuts import render, get_object_or_404
from django.utils.translation import ugettext_lazy as _
from django.views.generic import TemplateView, ListView

from . import forms
from . import models


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


class DashView(NavTemplateView):
    template_name = 'pages/dash.html'
    nav = ['dash']
    

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


# TODO @something_required
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
    

class RoleList(ListView):
    model = Group


def permissions_for(request, pk):
    role = get_object_or_404(Group, pk=pk)
    roles = Group.objects.exclude(pk=pk)
    
    return render(request, 'ditto/permissions_for.html', {
        'role': role,
        'roles': roles,
        'nav': ['configure'],
    })


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


def features(request):
    if request.method == 'POST':
        formset = forms.FeatureFormSet(data=request.POST)
        if formset.is_valid():
            formset.save()
            messages.success(request, "Configuration successfully updated")
            return HttpResponseRedirect(request.path)
    else:
        formset = forms.FeatureFormSet()
        
    return render(request, 'ditto/features.html', {
        'formset': formset,
        'nav': ['configure'],
    })


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
