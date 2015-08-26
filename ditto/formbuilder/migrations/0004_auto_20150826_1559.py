# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('formbuilder', '0003_auto_20150814_1427'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='scoregroupanswer',
            name='score',
        ),
        migrations.AddField(
            model_name='scoregroupanswer',
            name='item',
            field=models.ForeignKey(related_name='answers', to='formbuilder.ScoreGroupItem', null=True),
        ),
        migrations.AddField(
            model_name='scoregroupanswer',
            name='label',
            field=models.ForeignKey(related_name='answers', to='formbuilder.ScoreLabel', null=True),
        ),
        migrations.AlterField(
            model_name='choice',
            name='other_text',
            field=models.CharField(max_length=255, blank=True),
        ),
    ]
