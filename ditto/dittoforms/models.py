"""
Store form descriptions and results of form submissions.

**NO IDEA** how to really do this. For testing storing the spec
and form submissions as JSON.

That might be ok. With postgres+JSON we could still index/query the
data efficiently.

Previously, with qanda, we had some tables to store fields and answers
in a reasonably structured way but not sure it's worth it/better.

"""
import json
from django.db import models


class FormSpec(models.Model):
    slug = models.SlugField()
    # TODO version = models...
    spec = models.TextField(blank=False)  # TODO JSON field?

    def get_flat_field_names(self):
        spec = json.loads(self.spec)
        for item in spec:
            if 'fields' in item:
                # group of fields
                # TODO form config should probably separate out UI stuff like field grouping
                # from field definitions (we'll do this when changing over to use the
                # new version of the formbuilder that's decoupled from the settings)
                for field_spec in item['fields']:
                    yield field_spec['name']
            else:
                yield item['name']

    def get_choice_fields(self):
        spec = json.loads(self.spec)
        return self._get_choice_fields(spec)

    def _get_choice_fields(self, spec):
        fields = []
        for item in spec:
            if 'fields' in item:
                # field group so recursively extract choice field fields
                # (TODO at some point we'll decouple layout from field definition)
                fields.extend(self._get_choice_fields(item['fields']))
            else:
                if ('on' in item and
                    item['on'] and
                    'options' in item and
                    'multiple' not in item):
                    fields.append(item)
        return fields
    

class FormSubmission(models.Model):
    form = models.ForeignKey(FormSpec, related_name="submissions")
    user = models.ForeignKey('users.User', related_name="form_submissions")
    # We ensure the data is valid at the application level (all
    # submitted forms are validated with forms dynamically constructed
    # from the form spec.)
    data = models.TextField(blank=True)  # TODO JSON field?

    
