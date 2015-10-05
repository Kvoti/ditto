# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_userdatum'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='bio',
            field=models.TextField(blank=True),
        ),
    ]
