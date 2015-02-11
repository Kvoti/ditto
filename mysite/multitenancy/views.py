from django.contrib import messages
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from django.shortcuts import render

from . import forms
from . import models


def my_network(request):
    if request.user.is_anonymous():
        return render(request, 'landing.html')
    else:
        try:
            tenant = models.Tenant.objects.get(user=request.user)
        except models.Tenant.DoesNotExist:
            return _create_my_network(request)
        else:
            return _go_to_my_network(request, tenant)

    
def _create_my_network(request):
    if request.method == 'POST':
        form = forms.TenantForm(request.user, data=request.POST)
        if form.is_valid():
            form.save()
            # TODO go off and actually create the new network
            # - create tables
            # - bootstrap db (features, perms, etc.)
            # - create initial admin user
            messages.success(request, 'Network successfully created!')
            return HttpResponseRedirect(reverse('tenant:home'))
    else:
        form = forms.TenantForm(request.user)
    return render(request, 'tenant/create.html', {'form': form})


def _go_to_my_network(request, tenant):
    return render(request, 'tenant/go.html', {'tenant': tenant})
