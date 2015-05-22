from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import Group
from django.contrib import messages
from django.contrib.sites.models import Site
from django.core import management
from django.core.signing import Signer
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect, HttpResponse, Http404
from django.shortcuts import render, get_object_or_404
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_POST

import core
from users.models import User

from . import forms
from . import models
from . import tenant as utils


def my_network(request):
    if request.user.is_anonymous():
        return render(request, 'landing.html')
    else:
        tenants = models.Tenant.objects.filter(user=request.user)
        if tenants.count():
            return _go_to_my_network(request, tenants)
        else:
            return create_my_network(request)


@login_required
def create_my_network(request):
    if request.method == 'POST':
        form = forms.TenantForm(request.user, data=request.POST)
        if form.is_valid():
            tenant = form.save()
            _create_network_instance(tenant)
            messages.success(request, 'Network successfully created!')
            return HttpResponseRedirect(reverse('ditto:home'))
    else:
        form = forms.TenantForm(request.user)
    return render(request, 'tenant/create.html', {
        'form': form,
        'networks': models.Tenant.objects.all(),
    })


def _go_to_my_network(request, tenants):
    return render(request, 'tenant/go.html', {
        'tenants': tenants,
        'networks': models.Tenant.objects.all(),
    })


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
        admin.groups.add(Group.objects.get(name=core.ADMIN_ROLE))

        # copy over network name
        site = Site.objects.get_current()
        site.domain = '%s.%s' % (subdomain, parent_domain)
        site.name = network_name
        site.save()

        
@require_POST
def delete_network(request, tenant_id):
    tenant = get_object_or_404(models.Tenant, pk=tenant_id)
    if not tenant.user == request.user:
        raise Http404
    tenant.delete()
    messages.success(request, "Deleted '%s' network." % tenant.network_name)
    return HttpResponseRedirect(reverse('ditto:home'))
    

# TODO restrict this to requests from chat (localhost for now)?
@never_cache
def get_password(request):
    if settings.DEBUG:
        return HttpResponse()
    username = request.GET['user']
    tenant_slug = _get_tenant(request.GET['server'])
    with utils._tenant(tenant_slug):
        user = get_object_or_404(User, username=username)
    signer = Signer()
    value = signer.sign(user.username)
    return HttpResponse(value)


@never_cache
def user_exists(request):
    username = request.GET['user']
    tenant_slug = _get_tenant(request.GET['server'])
    with utils._tenant(tenant_slug):
        get_object_or_404(User, username=username)
    return HttpResponse('true')


def _get_tenant(server):
    chat_domain = server
    network = chat_domain.split('.')[0]
    tenant_pk = network.replace('network', '')
    tenant = get_object_or_404(models.Tenant, pk=tenant_pk)
    return tenant.slug
