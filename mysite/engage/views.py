from django.contrib.sites.models import Site
from django.contrib import messages
from django.contrib.auth.models import Group
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from django.shortcuts import render, get_object_or_404
from django.utils.translation import ugettext_lazy as _
from django.views.generic import TemplateView

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
        
    return render(request, 'engage/roles.html', {
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
        return HttpResponseRedirect(reverse('engage:settings'))
    return render(request, 'engage/delete_role_confirm.html', {
        'group': group,
        'nav': ['dash', 'roles'],
    })
    

def permissions(request):
    if request.method == 'POST':
        formset = forms.PermissionsFormSet(data=request.POST)
        if formset.is_valid():
            formset.save()
            messages.success(request, "Configuration successfully updated")
            return HttpResponseRedirect(request.path)
    else:
        formset = forms.PermissionsFormSet()
        
    return render(request, 'engage/perms.html', {
        'formset': formset,
        'nav': ['dash', 'perms'],
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
        
    return render(request, 'engage/features.html', {
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
        
    return render(request, 'engage/config.html', {
        'form': form,
        # TODO set nav state in decorator, bit neater?
        'nav': ['dash', 'settings'],
    })
