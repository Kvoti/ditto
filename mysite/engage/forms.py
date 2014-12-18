from django import forms
from django.contrib.auth.models import Group
from django.contrib.sites.models import Site
from django.utils.translation import ugettext_lazy as _


class NetworkNameForm(forms.ModelForm):
    class Meta:
        model = Site
        fields = ('name',)
        labels = {'name': _('Network name')}


class RoleForm(forms.ModelForm):
    class Meta:
        model = Site
        fields = ('name',)

RoleFormSet = forms.models.modelformset_factory(Group, form=RoleForm, extra=3)
