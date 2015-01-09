import floppyforms.__future__ as forms
from django.contrib.auth.models import Group, Permission
from django.contrib.sites.models import Site
from django.db.models import Count, Q
from django.utils.translation import ugettext_lazy as _
from django.utils.text import capfirst

from . import config
from . import models


class NetworkNameForm(forms.ModelForm):
    class Meta:
        model = Site
        fields = ('name',)
        labels = {'name': _('Network name')}


ConfigForm = forms.models.modelform_factory(models.Config, fields=(
    'theme',
    'type',
    'description',
    'size_cap',
))


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

            
class FeatureForm(forms.ModelForm):
    """Used with FeatureFormSet to set the label for the is_active field
    to the feature name. Used on the feature selection page so you get

             Blog: [ ]
        Messaging: [ ]

    instead of

        Is active: [ ]
        Is active: [ ]

    """
    
    class Meta:
        model = models.Feature

    def __init__(self, *args, **kwargs):
        super(FeatureForm, self).__init__(*args, **kwargs)
        self.fields['is_active'].label = self.instance.name
        

FeatureFormSet = forms.models.modelformset_factory(
    models.Feature, fields=('is_active',), extra=0,
    form=FeatureForm)
