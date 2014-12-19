from django import forms
from django.contrib.auth.models import Group, Permission
from django.contrib.sites.models import Site
from django.db.models import Count
from django.utils.translation import ugettext_lazy as _


class NetworkNameForm(forms.ModelForm):
    class Meta:
        model = Site
        fields = ('name',)
        labels = {'name': _('Network name')}


class RoleForm(forms.ModelForm):
    class Meta:
        model = Group
        fields = ('name',)

RoleFormSet = forms.models.modelformset_factory(Group, form=RoleForm, extra=3)


class PermissionsForm(forms.ModelForm):
    class Meta:
        model = Group
        fields = ('name', 'permissions',)
        widgets = {'permissions': forms.CheckboxSelectMultiple}
        
    def __init__(self, *args, **kwargs):
        super(PermissionsForm, self).__init__(*args, **kwargs)
        self.fields['permissions'].queryset = Permission.objects.annotate(
            features=Count('feature')).filter(features__gt=0)

        
PermissionsFormSet = forms.models.modelformset_factory(
    Group, form=PermissionsForm)
