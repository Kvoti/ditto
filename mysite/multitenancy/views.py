from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.contrib import messages
from django.contrib.sites.models import Site
from django.core import management
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from django.shortcuts import render

import ditto.config

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
    admin = tenant.user
    admin_emails = list(admin.emailaddress_set.all())
    subdomain = tenant.slug
    network_name = tenant.network_name
    parent_domain = Site.objects.get_current().domain
    with utils._tenant(tenant.slug):
        # TODO in the real world we'll send a task off to some queue that'll go do bunch of stuff

        management.call_command('migrate', verbosity=0)

        management.call_command('runscript', 'setup_test_data')

        # remove dummy users created by test data script
        get_user_model().objects.all().delete()
        
        # copy the current user to the network database and make an admin
        admin.pk = None
        admin.is_new = True
        admin.save()
        for email in admin_emails:
            admin.emailaddress_set.create(
                email=email.email,
                verified=1
            )
        admin.groups.add(Group.objects.get(name=ditto.config.ADMIN_ROLE))

        # copy over network name
        site = Site.objects.get_current()
        site.domain = '%s.%s' % (subdomain, parent_domain),
        site.name = network_name
        site.save()
