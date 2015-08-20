import json

from django import forms

from .models import FormSubmission


class FormFromSpecMixin(object):

    def add_fields_from_spec(self, spec):
        for item in spec:
            if 'on' in item and not item['on']:
                continue
            if 'fields' in item:
                # group of fields
                # TODO form config should probably separate out UI stuff like field grouping
                # from field definitions
                for field_spec in item['fields']:
                    self.add_field(field_spec)
            else:
                self.add_field(item)

    def add_field(self, spec):
        if 'on' in spec and not spec['on']:
            return
        if 'required' not in spec:
            spec['required'] = False
        if 'options' in spec:  # TODO better to have explicit types for fields
            if spec.get('multiple', False):
                self.add_multi_choice_field(spec)
            else:
                self.add_choice_field(spec)
        else:
            self.add_text_field(spec)

    def add_text_field(self, spec):
        self.fields[spec['name']] = forms.CharField(
            max_length=100, required=spec['required']
        )

    def add_choice_field(self, spec):
        choices = zip(spec['options'], spec['options'])
        self.fields[spec['name']] = forms.ChoiceField(
            choices=choices,
            required=spec['required']
        )

    def add_multi_choice_field(self, spec):
        choices = zip(spec['options'], spec['options'])
        self.fields[spec['name']] = forms.MultipleChoiceField(
            choices=choices,
            required=spec['required']
        )

    def save_submission(self, spec, user):
        FormSubmission.objects.create(
            form=spec,
            user=user,
            # TODO just extract relevant fields from self.data (
            # form might have extra fields or other metadata in self.data)
            data=json.dumps(self.data)
        )

        
class Form(FormFromSpecMixin, forms.Form):
    """
    Create a form from config.

    Only used for serve-side valiation of POSTed data, not for form display.

    """
    def __init__(self, user, spec, *args, **kwargs):
        super(Form, self).__init__(*args, **kwargs)
        self.user = user
        self.spec = spec
        self.add_fields_from_spec(json.loads(spec.spec))

    def save(self):
        FormSubmission.objects.create(
            user=self.user,
            form=self.spec,
            data=json.dumps(self.data)
        )
