from django.contrib.auth.models import Group
from django.contrib import messages
from django.core.urlresolvers import reverse, reverse_lazy
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.template.response import TemplateResponse

from core.views.decorators import admin_required, nav

from . import forms
from . import models


@admin_required
@nav(['dash', 'roles'], back=reverse_lazy('ditto:dash'))
def roles(request, template='configuration/roles.html', success_url=None):
    if success_url is None:
        success_url = request.path
    try:
        extra = int(request.POST.get('extra'))
    except (TypeError, ValueError):
        extra = 1
    if request.method == 'POST' and 'delete' in request.POST:
        group = get_object_or_404(Group, pk=request.POST['delete'])
        group.delete()
        return HttpResponseRedirect(request.path)
    if request.method == 'POST' and 'add' not in request.POST:
        formset = forms.RoleFormSet(extra, data=request.POST)
        if formset.is_valid():
            formset.save()
            messages.success(request, "Configuration successfully updated")
            return HttpResponseRedirect(success_url)
    else:
        i = 0
        initial = []
        while True:
            name_key = 'form-{}-name'.format(i)
            id_key = 'form-{}-id'.format(i)
            if id_key not in request.POST:
                break
            if not request.POST[id_key]:
                initial.append({'name': request.POST[name_key]})
            i += 1
        formset = forms.RoleFormSet(extra, initial=initial)
    return TemplateResponse(request, template, {
        'formset': formset,
        'extra': extra + 1
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
    return TemplateResponse(request, 'configuration/delete_role_confirm.html', {
        'group': group,
    })
    

@admin_required
@nav(['dash', 'permissions'], back=reverse_lazy('ditto:dash'))
def permissions(request, template='configuration/interactions.html', success_url=None, on_success=None):
    if success_url is None:
        success_url = request.path
    if request.method == 'POST':
        form = forms.InteractionsForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Configuration updated")
            if on_success:
                on_success(request)
            return HttpResponseRedirect(success_url)
    else:
        form = forms.InteractionsForm()
    return TemplateResponse(request, template, {
        'form': form,
        'grid': form._get_role_grid(),
        'interactions': models.Interaction.objects.all()
    })


@admin_required
@nav(['dash', 'features'], back=reverse_lazy('ditto:dash'))
def feature_permissions(request, template='configuration/permissions.html', success_url=None, on_success=None):
    if success_url is None:
        success_url = request.path
    if request.method == 'POST':
        form = forms.PermissionsForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Configuration updated")
            if on_success:
                on_success(request)
            return HttpResponseRedirect(success_url)
    else:
        form = forms.PermissionsForm()
    return TemplateResponse(request, template, {
        'form': form,
        'roles': Group.objects.all(),
        'features': models.Feature.objects.all(),
    })


@admin_required
@nav(['dash', 'basicinfo'], back=reverse_lazy('ditto:dash'))
def config(request, template='configuration/config.html', success_url=None):
    if success_url is None:
        success_url = request.path
    try:
        config = models.Config.objects.all()[0]
    except IndexError:
        config = None
    if request.method == 'POST':
        form = forms.ConfigForm(data=request.POST, instance=config)
        if form.is_valid():
            form.save()
            messages.success(request, "Configuration successfully updated")
            return HttpResponseRedirect(success_url)
    else:
        form = forms.ConfigForm(instance=config)
        
    return TemplateResponse(request, template, {
        'form': form,
    })


@admin_required
def step1(request):
    return config(
        request,
        template='configuration/walkthrough/step1.html',
        success_url=reverse('ditto:create-step2')
    )


@admin_required
def step2(request):
    return roles(
        request,
        template='configuration/walkthrough/step2.html',
        success_url=reverse('ditto:home'),
    )


@admin_required
def step3(request):
    return permissions(
        request,
        template='configuration/walkthrough/step3.html',
        success_url=reverse('ditto:home'),
        on_success=_on_setup_finish
    )


def _on_setup_finish(request):
    request.tenant.set_configured()


def start_again(request):
    request.tenant.reset_configured()
    return HttpResponseRedirect(reverse('ditto:home'))
