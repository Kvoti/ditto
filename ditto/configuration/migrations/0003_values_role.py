# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0006_require_contenttypes_0002'),
        ('configuration', '0002_auto_20151012_1146'),
    ]

    operations = [
        migrations.AddField(
            model_name='values',
            name='role',
            field=models.OneToOneField(related_name='values', default=1, to='auth.Group'),
            preserve_default=False,
        ),
    ]
