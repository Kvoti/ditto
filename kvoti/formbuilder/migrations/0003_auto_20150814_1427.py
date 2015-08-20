# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('formbuilder', '0002_auto_20150814_1426'),
    ]

    operations = [
        migrations.AlterField(
            model_name='scorelabel',
            name='default_score',
            field=models.IntegerField(),
        ),
    ]
