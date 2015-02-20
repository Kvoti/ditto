import floppyforms.__future__ as forms

import core

from . import models


class TenantForm(core.forms.UserModelFormMixin, forms.ModelForm):
    class Meta:
        model = models.Tenant
        fields = ('network_name', 'slug')
        
    def __init__(self, *args, **kwargs):
        super(TenantForm, self).__init__(*args, **kwargs)
        core.forms.autofocus(self, 'network_name')
