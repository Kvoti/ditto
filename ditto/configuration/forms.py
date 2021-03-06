import collections

import floppyforms.__future__ as forms
from django.contrib.auth.models import Group, Permission
from django.contrib.sites.models import Site
from django.utils.translation import ugettext_lazy as _

import core
from users.models import User

from . import models
from . import utils


class BasicInfoForm(forms.ModelForm):
    class Meta:
        model = models.Config
        fields = (
            'theme',
            'type',
            'description',
            'size_cap',
        )

    def __init__(self, *args, **kwargs):
        try:
            config = models.Config.objects.all()[0]
        except IndexError:
            config = None
        kwargs['instance'] = config
        super(BasicInfoForm, self).__init__(*args, **kwargs)
        self.fields = collections.OrderedDict(
            [('name', forms.CharField(
                label=_("Name"),
                initial=Site.objects.all()[0].name,
                help_text=_("Type a name for network")
            ))] + self.fields.items()
        )
        self.fields["theme"].choices = [("", "Kvoti"),] + list(self.fields["theme"].choices)[1:]
        
    def save(self):
        super(BasicInfoForm, self).save()
        site = Site.objects.all()[0]
        site.name = self.cleaned_data['name']
        site.save()


class RoleForm(forms.ModelForm):
    class Meta:
        model = Group
        fields = ('name',)

    def __init__(self, *args, **kwargs):
        super(RoleForm, self).__init__(*args, **kwargs)
        # import ipdb; ipdb.set_trace()
        try:
            initial = self.instance.description.text
        except models.GroupDescription.DoesNotExist:
            initial = ""
        self.fields['description'] = forms.CharField(
            initial=initial,
            widget=forms.Textarea(),
            required=False
        )

    def save(self, *args, **kwargs):
        super(RoleForm, self).save(*args, **kwargs)
        try:
            description = self.instance.description
        except models.GroupDescription.DoesNotExist:
            models.GroupDescription.objects.create(
                group=self.instance,
                text=self.cleaned_data['description']
            )
        else:
            description.text = self.cleaned_data['description']
            description.save()


class BaseRoleFormSet(forms.models.BaseModelFormSet):
    def __init__(self, extra, *args, **kwargs):
        self.extra = extra
        super(BaseRoleFormSet, self).__init__(*args, **kwargs)
        self.queryset = Group.objects.exclude(name__in=core.DEFAULT_ROLES)

        
RoleFormSet = forms.models.modelformset_factory(
    Group,
    formset=BaseRoleFormSet,
    form=RoleForm)


class InteractionsForm(forms.Form):
    def __init__(self, *args, **kwargs):
        super(InteractionsForm, self).__init__(*args, **kwargs)
        grid = utils.get_role_grid()
        for role1, others in grid:
            for role2 in others:
                for interaction in models.Interaction.objects.all():
                    is_permitted = interaction.is_permitted(role1, role2)
                    name = '-'.join((interaction.name, role1, role2))
                    checkbox = forms.BooleanField(
                        required=False,
                        initial=is_permitted,
                    )
                    checkbox.interaction = interaction
                    checkbox.role1 = Group.objects.get(name=role1)
                    checkbox.role2 = Group.objects.get(name=role2)
                    self.fields[name] = checkbox
            
    def save(self):
        is_changed = False
        for name, value in self.cleaned_data.items():
            if self._is_changed(name, value):
                is_changed = True
                self._save_field(name, value)
        return is_changed

    def _is_changed(self, field, clean_value):
        return self.fields[field].initial != clean_value

    def _save_field(self, name, is_permitted):
        interaction = self.fields[name].interaction
        role1 = self.fields[name].role1
        role2 = self.fields[name].role2
        if is_permitted:
            interaction.allow(role1, role2)
        else:
            interaction.deny(role1, role2)


class PermissionsForm(forms.Form):
    def __init__(self, *args, **kwargs):
        super(PermissionsForm, self).__init__(*args, **kwargs)
        for role in Group.objects.all():
            for feature in models.Feature.objects.all():
                for permission in feature.permissions.all():
                    is_enabled = role.permissions.filter(
                        pk=permission.pk).exists()
                    name = '-'.join((role.name, feature.name, permission.name))
                    checkbox = forms.BooleanField(
                        required=False,
                        initial=is_enabled,
                    )
                    checkbox.role = role
                    checkbox.permission = permission
                    self.fields[name] = checkbox
        for feature in models.Feature.objects.all():
            for permission in feature.permissions.all():
                users = User.objects.filter(user_permissions=permission).values_list('username', flat=True)
                users = '|'.join(users)
                name = '%s-%s' % (permission.content_type_id, permission.codename)
                self.fields[name] = forms.CharField(
                    required=False,
                    initial=users
                )
                self.fields[name].permission = permission

    def save(self):
        for name, is_enabled in self.cleaned_data.items():
            if hasattr(self.fields[name], 'role'):
                role = self.fields[name].role
                permission = self.fields[name].permission
                if is_enabled:
                    role.permissions.add(permission)
                else:
                    role.permissions.remove(permission)
            else:
                users = is_enabled.split('|')
                # TODO validate users value
                users = User.objects.filter(username__in=users)
                self.fields[name].permission.user_set = users
