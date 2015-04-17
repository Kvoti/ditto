import json

from django import forms

from dittoforms.models import FormSpec
from dittoforms.utils import FormFromSpecMixin


class SignupForm(FormFromSpecMixin, forms.Form):
    def __init__(self, role, *args, **kwargs):
        self.role = role
        spec = FormSpec.objects.get(regform__role=role)
        self.spec = spec
        super(SignupForm, self).__init__(*args, **kwargs)
        self.add_fields_from_spec(json.loads(spec.spec))

    def signup(self, request, user):
        self.save_submission(self.spec, user)
