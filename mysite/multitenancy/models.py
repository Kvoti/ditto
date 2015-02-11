import os
from django.conf import settings
from django.db import models

from . import tenant


if 'DJANGO_TENANT' in os.environ:
    tenant._set_for_tenant(os.environ['DJANGO_TENANT'])
else:
    tenant._set_default()
    
tenant._patch_table_names()


class Tenant(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL)
    network_name = models.CharField(max_length=20)
    slug = models.SlugField()

    @property
    def network_url(self):
        if settings.DEBUG:
            return 'http://%s.localhost:8080' % self.slug
        else:
            # Do the Site import here to avoid messing up the
            # monkeypatching of _meta.db_table
            from django.contrib.sites.models import Site
            return 'http://%s.%s' % (self.slug, Site.objects.get_current())
