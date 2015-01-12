import collections

import floppyforms.__future__ as forms
from django.contrib.auth.models import Group
from django.contrib.sites.models import Site
from django.utils.translation import ugettext_lazy as _

from . import config
from . import models


class ConfigForm(forms.ModelForm):
    class Meta:
        model = models.Config
        fields = (
            'theme',
            'type',
            'description',
            'size_cap',
        )

    def __init__(self, *args, **kwargs):
        super(ConfigForm, self).__init__(*args, **kwargs)
        self.fields = collections.OrderedDict(
            [('name', forms.CharField(
                label=_("Name"),
                initial=Site.objects.all()[0].name,
                help_text=_("Type a name for network")
            ))] + self.fields.items()
        )

    def save(self):
        super(ConfigForm, self).save()
        site = Site.objects.all()[0]
        site.name = self.cleaned_data['name']
        site.save()


class RoleForm(forms.ModelForm):
    class Meta:
        model = Group
        fields = ('name',)


class BaseRoleFormSet(forms.models.BaseModelFormSet):
    def __init__(self, extra, *args, **kwargs):
        self.extra = extra
        super(BaseRoleFormSet, self).__init__(*args, **kwargs)
        self.queryset = Group.objects.exclude(name__in=config.DEFAULT_ROLES)

        
RoleFormSet = forms.models.modelformset_factory(
    Group,
    formset=BaseRoleFormSet,
    form=RoleForm)


class PermissionsForm(forms.Form):
    def __init__(self, role1, role2, *args, **kwargs):
        self.roles = [role1, role2]
        super(PermissionsForm, self).__init__(*args, **kwargs)
        for interaction in models.Interaction.objects.all():
            is_permitted = interaction.is_permitted(*self.roles)
            self.fields[interaction.name] = forms.BooleanField(
                required=False,
                initial=is_permitted,
            )
            self.fields[interaction.name].interaction = interaction
            
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
        if is_permitted:
            interaction.allow(*self.roles)
        else:
            interaction.deny(*self.roles)

            
class FeaturePermissionsForm(forms.Form):
    def __init__(self, group, feature, *args, **kwargs):
        self.group = group
        super(FeaturePermissionsForm, self).__init__(*args, **kwargs)
        permissions = feature.permissions.all()
        enabled_permissions = group.permissions.all()
        for perm in permissions:
            is_enabled = perm in enabled_permissions
            self.fields[perm.name] = forms.BooleanField(
                required=False,
                initial=is_enabled,
            )
            self.fields[perm.name].permission = perm

    def save(self):
        for name, is_enabled in self.cleaned_data.items():
            if is_enabled:
                self.group.permissions.add(self.fields[name].permission)
            else:
                self.group.permissions.remove(self.fields[name].permission)
