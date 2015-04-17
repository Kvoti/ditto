import json

from django import forms

from dittoforms.utils import FormFromSpecMixin


class SignupForm(FormFromSpecMixin, forms.Form):
    def __init__(self, role, *args, **kwargs):
        self.role = role
        #### testing for now
        # TODO get correct form for role
        from dittoforms.models import FormSpec
        spec = FormSpec.objects.all()[0]
        #######
        self.spec = spec
        super(SignupForm, self).__init__(*args, **kwargs)
        self.add_fields_from_spec(json.loads(spec.spec))

    def signup(self, request, user):
        self.save_submission(self.spec, user)
