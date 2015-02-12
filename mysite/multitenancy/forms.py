import floppyforms.__future__ as forms
from slugify import slugify

import utils

from . import models


class TenantForm(utils.forms.UserModelFormMixin, forms.ModelForm):
    class Meta:
        model = models.Tenant
        fields = ('network_name',)
        
    def __init__(self, *args, **kwargs):
        super(TenantForm, self).__init__(*args, **kwargs)
        utils.forms.autofocus(self, 'network_name')
        
    def save(self, *args, **kwargs):
        self.instance.slug = slugify(self.cleaned_data['network_name'])
        return super(TenantForm, self).save(*args, **kwargs)
