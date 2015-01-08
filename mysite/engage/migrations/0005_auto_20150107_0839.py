# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('engage', '0004_auto_20150106_0639'),
    ]

    operations = [
        migrations.AddField(
            model_name='config',
            name='description',
            field=models.TextField(default='', help_text='A brief description of your network', verbose_name='description', blank=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='config',
            name='size_cap',
            field=models.IntegerField(default=1000, help_text='How many people are you likely to have?', verbose_name='size cap', choices=[(1000, 1000), (5000, 5000), (10000, 10000)]),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='config',
            name='type',
            field=models.CharField(default='Business', help_text='What sector are you?', max_length=20, verbose_name='type', choices=[(b'Business', b'Business'), (b'Social', b'Social'), (b'Charity', b'Charity'), (b'Volunteer', b'Volunteer')]),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='config',
            name='theme',
            field=models.CharField(blank=True, max_length=20, verbose_name='theme', choices=[(b'cerulean', b'cerulean'), (b'cosmo', b'cosmo'), (b'cyborg', b'cyborg'), (b'darkly', b'darkly'), (b'flatly', b'flatly'), (b'journal', b'journal'), (b'lumen', b'lumen'), (b'paper', b'paper'), (b'readable', b'readable'), (b'sandstone', b'sandstone'), (b'simplex', b'simplex'), (b'slate', b'slate'), (b'spacelab', b'spacelab'), (b'superhero', b'superhero'), (b'united', b'united'), (b'yeti', b'yeti')]),
            preserve_default=True,
        ),
    ]
