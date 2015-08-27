# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('formbuilder', '0005_auto_20150826_1600'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='choiceanswer',
            name='option',
        ),
        migrations.AddField(
            model_name='choiceanswer',
            name='choices',
            field=models.ManyToManyField(related_name='answers', to='formbuilder.Option'),
        ),
        migrations.AddField(
            model_name='choiceanswer',
            name='other',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='choiceanswer',
            name='question',
            field=models.ForeignKey(related_name='answers', to='formbuilder.Choice', null=True),
        ),
    ]
