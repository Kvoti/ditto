# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ditto', '0002_auto_20141218_0750'),
    ]

    operations = [
        migrations.AddField(
            model_name='feature',
            name='is_active',
            field=models.BooleanField(default=False),
            preserve_default=False,
        ),
    ]
