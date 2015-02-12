from django import forms
from slugify import slugify

from . import models


class TenantForm(forms.ModelForm):
    class Meta:
        model = models.Tenant
        fields = ('network_name',)
        
    def __init__(self, user, *args, **kwargs):
        super(TenantForm, self).__init__(*args, **kwargs)
        self.instance.user = user
        
    def save(self, *args, **kwargs):
        self.instance.slug = slugify(self.cleaned_data['network_name'])
        return super(TenantForm, self).save(*args, **kwargs)
