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
    

class FormSubmission(models.Model):
    form = models.ForeignKey(FormSpec, related_name="submissions")
    user = models.ForeignKey('users.User', related_name="form_submissions")
    # We ensure the data is valid at the application level (all
    # submitted forms are validated with forms dynamically constructed
    # from the form spec.)
    data = models.TextField(blank=True)  # TODO JSON field?

    
