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
        self.role1 = role1
        self.role2 = role2
        super(PermissionsForm, self).__init__(*args, **kwargs)
        for interaction in models.Interaction.objects.all():
            is_permitted = self._is_permitted(interaction, role1, role2)
            self.fields[interaction.name] = forms.BooleanField(
                required=False,
                initial=is_permitted,
            )

    def _is_permitted(self, interaction, role1, role2):
        return models.PermittedInteraction.objects.filter(
            interaction=interaction).filter(
                Q(role1=role1, role2=role2) |
                Q(role1=role2, role2=role1)
            ).exists()

    def save(self):
        for field, value in self.cleaned_data.items():
            if self._is_changed(field, value):
                self._save_field(field, value)

    def _is_changed(self, field, clean_value):
        return self.fields[field].initial != clean_value

    def _save_field(self, interaction_name, is_permitted):
        if is_permitted:
            interaction = models.Interaction.objects.get(name=interaction_name)
            models.PermittedInteraction.objects.create(
                interaction=interaction,
                role1=self.role1,
                role2=self.role2
            )
        else:
            models.PermittedInteraction.objects.filter(interaction__name=interaction_name).filter(
                Q(role1=self.role1, role2=self.role2) |
                Q(role1=self.role2, role2=self.role1)
            ).delete()


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
