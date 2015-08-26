# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('formbuilder', '0004_auto_20150826_1559'),
    ]

    operations = [
        migrations.AlterField(
            model_name='scoregroupanswer',
            name='item',
            field=models.ForeignKey(related_name='answers', to='formbuilder.ScoreGroupItem'),
        ),
        migrations.AlterField(
            model_name='scoregroupanswer',
            name='label',
            field=models.ForeignKey(related_name='answers', to='formbuilder.ScoreLabel'),
        ),
    ]
