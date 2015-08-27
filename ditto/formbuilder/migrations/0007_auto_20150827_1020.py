# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('formbuilder', '0006_auto_20150827_1019'),
    ]

    operations = [
        migrations.AlterField(
            model_name='choiceanswer',
            name='question',
            field=models.ForeignKey(related_name='answers', to='formbuilder.Choice'),
        ),
    ]
