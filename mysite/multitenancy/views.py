from django.contrib import messages
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from django.shortcuts import render

from . import forms
from . import models
from . import tenant as utils


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
            tenant = form.save()
            _create_network_instance(tenant)
            messages.success(request, 'Network successfully created!')
            return HttpResponseRedirect(reverse('ditto:home'))
    else:
        form = forms.TenantForm(request.user)
    return render(request, 'tenant/create.html', {'form': form})


def _go_to_my_network(request, tenant):
    return render(request, 'tenant/go.html', {'tenant': tenant})


def _create_network_instance(tenant):
    # TODO in the real world we'll send a task off to some queue that'll go do bunch of stuff
    utils._set_for_tenant(tenant.slug)
    from django.core import management
    management.call_command('migrate', verbosity=0)
    # TODO copy over network name to tenant data
    # TODO set up current user as admin for new network
    management.call_command('runscript', 'setup_test_data')
    utils._unset()
