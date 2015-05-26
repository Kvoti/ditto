import json

from django import forms
from django.utils.translation import ugettext, ugettext_lazy as _

from dittoforms.models import FormSpec
from dittoforms.utils import FormFromSpecMixin
from users.models import User


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
        User.objects.create_user(
            username=self.cleaned_data['username'],
            password=User.objects.make_random_password()
        )
