# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations

DEFAULT_GROUPS = ["Admin", "Member"]


def add_default_groups(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    for group in DEFAULT_GROUPS:
        Group.objects.create(name=group)
        

def remove_default_groups(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Group.objects.filter(name__in=DEFAULT_GROUPS).delete()

    
class Migration(migrations.Migration):

    dependencies = [
        ('ditto', '0005_auto_20150107_0839'),
    ]

    operations = [
        migrations.RunPython(add_default_groups, remove_default_groups)
    ]
