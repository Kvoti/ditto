from django.contrib.auth.models import Group
from django.contrib.auth.decorators import permission_required
from django.contrib import messages
from django.core.urlresolvers import reverse, reverse_lazy
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.template.response import TemplateResponse

import chat.models
from core.views.decorators import admin_required, nav

from . import forms
from . import models
from . import utils

BASICINFO = 'basicinfo'
ROLES = 'roles'
PERMISSIONS = 'permissions'
FEATURES = 'features'

STEPS = [BASICINFO, ROLES, PERMISSIONS, FEATURES]

FORM_CLASSES = {
    BASICINFO: forms.BasicInfoForm,
    PERMISSIONS: forms.InteractionsForm,
    FEATURES: forms.PermissionsForm,
}

FORM_TEMPLATES = {
    PERMISSIONS: 'configuration/perms_form.html',
    FEATURES: 'configuration/feature_perms_form.html'
}


def edit_initial_config(request, step):
    step = int(step)
    section = STEPS[step - 1]
    if not section == STEPS[-1]:
        next = success_url = reverse('ditto:initialconfig', args=(step + 1,))
    else:
        next = None
        success_url = reverse('ditto:home')
    if step == 2:
        from .views import roles
        result = roles(request, success_url=success_url)
    else:
        result = edit_config(request, section, success_url=success_url)
    if hasattr(result, 'context_data'):
        result.context_data['base'] = 'configuration/walkthrough/base.html'
        result.context_data['next'] = next
        result.context_data['submit'] = 'NEXT' if next else 'FINISH'
    elif not next:
        _on_setup_finish(request)
    return result


def edit_config(request, section, success_url=None):
    result = _edit_config(
        request,
        section,
        form_class=FORM_CLASSES[section],
        form_template=FORM_TEMPLATES.get(section, 'skin/forms/form.html'),
        success_url=success_url
    )
    if hasattr(result, 'context_data'):
        if section == 'permissions':
            result.context_data['grid'] = utils.get_role_grid()
            result.context_data['interactions'] = models.Interaction.objects.all()
        elif section == 'features':
            result.context_data['roles'] = Group.objects.all()
            result.context_data['features'] = models.Feature.objects.all()
    return result


@admin_required
def _edit_config(
        request,
        section,
        form_class,
        form_template,
        base_template='configuration/base.html',
        success_url=None,
        on_success=None,
):
    if success_url is None:
        success_url = request.path
    if request.method == 'POST':
        form = form_class(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Configuration updated")
            if on_success:
                on_success(request)
            return HttpResponseRedirect(success_url)
    else:
        form = form_class()
    return TemplateResponse(request, 'configuration/edit.html', {
        'form': form,
        'back': reverse('ditto:editconfig', args=('basicinfo',)),
        'nav': ['settings', section],
        'form_template': form_template,
        'submit': 'SAVE',
        'base': base_template,
        'section': section
    })


@admin_required
@nav(['settings', 'roles'], back=reverse_lazy('ditto:editconfig', args=('basicinfo',)))
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
@nav(['settings', 'roles'])
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


def _on_setup_finish(request):
    request.tenant.set_configured()


def start_again(request):
    request.tenant.reset_configured()
    return HttpResponseRedirect(reverse('ditto:home'))


@admin_required
def evaluation(request):
    return TemplateResponse(request, 'configuration/evaluation.html', {
        'nav': ['evaluation'],
    })


@permission_required('configuration.create_chatroom', raise_exception=True)
def chatroom(request, room=None):
    if room is None:
        default_room = chat.models.Room.objects.values_list(
            'slug', flat=True)[0]
        return HttpResponseRedirect(
            reverse('ditto:chatroom_config_room', args=(default_room,)))
    return TemplateResponse(request, 'configuration/chatroom_configuration.html', {
        'nav': ['chatroom_config'],
    })
