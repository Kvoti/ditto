import json

from django import forms

from dittoforms.models import FormSpec
from dittoforms.utils import FormFromSpecMixin


class SignupForm(FormFromSpecMixin, forms.Form):
    def __init__(self, role=None, *args, **kwargs):
        super(SignupForm, self).__init__(*args, **kwargs)
        if role is not None:
            self.role = role
            spec = FormSpec.objects.get(regform__role=role)
            self.spec = spec
            self.add_fields_from_spec(json.loads(spec.spec))

    def signup(self, request, user):
        if hasattr(self, 'role'):
            self.save_submission(self.spec, user)
