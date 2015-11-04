import json

from django.contrib.auth.models import Group
from django import forms
from django.utils.translation import ugettext, ugettext_lazy as _

import core
from dittoforms.models import FormSpec
from dittoforms.utils import FormFromSpecMixin
from users.models import User, UserDatum


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
            user.groups.add(self.role)

    def save_submission(self, spec, user):
        data = {name: self.cleaned_data[name]
                for name in spec.get_flat_field_names()}
        UserDatum.objects.create_custom_data(user, data)
                

class InviteForm(forms.Form):
    error_messages = {
        'duplicate_username': _("A user with that username already exists."),
    }
    username = forms.RegexField(label=_("Username"), max_length=30,
        regex=r'^[\w.@+-]+$',
        help_text=_("Required. 30 characters or fewer. Letters, digits and "
                    "@/./+/-/_ only."),
        error_messages={
            'invalid': _("This value may contain only letters, numbers and "
                         "@/./+/-/_ characters.")})

    def clean_username(self):
        # Since User.username is unique, this check is redundant,
        # but it sets a nicer error message than the ORM. See #13147.
        username = self.cleaned_data["username"]
        try:
            User._default_manager.get(username=username)
        except User.DoesNotExist:
            return username
        raise forms.ValidationError(
            self.error_messages['duplicate_username'],
            code='duplicate_username',
        )

    def save(self):
        self._create_user()
        with tenant._tenant('di'):   # FIXME
            # create the user on the example network so we can
            # give them an auto login link
            self._create_user()

    def _create_user(self):
        user = User.objects.create_user(
            username=self.cleaned_data['username'],
            password=User.objects.make_random_password()
        )
        user.groups.add(Group.objects.get(name=core.GUEST_ROLE))
