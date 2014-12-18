# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


def create_features(apps, schema_editor):
    Feature = apps.get_model("engage", "Feature")
    Permission = apps.get_model("auth", "Permission")
    for slug, name, perms in (
            ('blog', 'Blog', [
                'view_post',
                'add_post',
                'change_post',
                'delete_post',
                'moderate_post',
            ]),
            ('messaging', 'Messaging', ['can_message'])
    ):
        feature = Feature.objects.create(slug=slug, name=name)
        for perm in perms:
            feature.permissions.add(Permission.objects.get(codename=perm))

                                    
def delete_features(apps, schema_editor):
    Feature = apps.get_model("engage", "Feature")
    Feature.objects.all().delete()
    

class Migration(migrations.Migration):

    dependencies = [
        ('engage', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_features, delete_features),
    ]
