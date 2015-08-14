# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('formbuilder', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='option',
            options={'ordering': ('order',)},
        ),
        migrations.AlterModelOptions(
            name='question',
            options={'ordering': ('order',)},
        ),
        migrations.AlterModelOptions(
            name='scoregroupitem',
            options={'ordering': ('order',)},
        ),
        migrations.AlterModelOptions(
            name='scorelabel',
            options={'ordering': ('order',)},
        ),
        migrations.AddField(
            model_name='scorelabel',
            name='default_score',
            field=models.IntegerField(null=True),
        ),
        migrations.AlterField(
            model_name='score',
            name='score',
            field=models.IntegerField(null=True, blank=True),
        ),
        migrations.AlterUniqueTogether(
            name='scorelabel',
            unique_together=set([('question', 'order'), ('question', 'label'), ('question', 'default_score')]),
        ),
    ]
