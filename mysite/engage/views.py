from django.contrib.sites.models import Site
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.contrib import messages

from . import forms
from . import models


def configure(request):
    if request.method == 'POST':
        form = forms.NetworkNameForm(instance=Site.objects.all()[0],
                                     data=request.POST)
        formset = forms.RoleFormSet(data=request.POST)
        if form.is_valid() and formset.is_valid():
            form.save()
            formset.save()
            messages.success(request, "Configuration successfully updated")
            return HttpResponseRedirect(request.path)
    else:
        form = forms.NetworkNameForm(instance=Site.objects.all()[0])
        formset = forms.RoleFormSet()
        
    return render(request, 'engage/configure.html', {
        'form': form,
        'formset': formset,
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
    })


def config(request):
    try:
        config = models.Config.objects.all()[0]
    except models.Config.DoesNotExist:
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
    })
