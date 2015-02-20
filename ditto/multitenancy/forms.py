import floppyforms.__future__ as forms

import utils

from . import models


class TenantForm(utils.forms.UserModelFormMixin, forms.ModelForm):
    class Meta:
        model = models.Tenant
        fields = ('network_name', 'slug')
        
    def __init__(self, *args, **kwargs):
        super(TenantForm, self).__init__(*args, **kwargs)
        utils.forms.autofocus(self, 'network_name')
