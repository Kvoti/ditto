import floppyforms.__future__ as forms
from django.contrib.auth.models import Group, Permission
from django.contrib.sites.models import Site
from django.db.models import Count
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
    def __init__(self, *args, **kwargs):
        super(BaseRoleFormSet, self).__init__(*args, **kwargs)
        self.queryset = Group.objects.exclude(name__in=config.DEFAULT_ROLES)

        
RoleFormSet = forms.models.modelformset_factory(
    Group,
    formset=BaseRoleFormSet,
    form=RoleForm, extra=3)


class PermissionsForm(forms.ModelForm):
    class Meta:
        model = Group
        fields = ('permissions',)
        widgets = {
            'permissions': forms.CheckboxSelectMultiple,
        }
        
    def __init__(self, *args, **kwargs):
        super(PermissionsForm, self).__init__(*args, **kwargs)
        self.fields['permissions'].queryset = (
            Permission.objects.filter(
                feature__is_active=True)
            .annotate(
                features=Count('feature'))
            .filter(features__gt=0)
        )
        self.fields['permissions'].label = capfirst(self.instance.name)
        
        
PermissionsFormSet = forms.models.modelformset_factory(
    Group, form=PermissionsForm)


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
