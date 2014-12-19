from django.contrib.sites.models import Site
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.contrib import messages

from . import forms


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


def features(request):
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
