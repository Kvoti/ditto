# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ditto', '0003_feature_is_active'),
    ]

    operations = [
        migrations.CreateModel(
            name='Config',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('theme', models.CharField(blank=True, max_length=20, choices=[(b'cerulean', b'cerulean'), (b'cosmo', b'cosmo'), (b'cyborg', b'cyborg'), (b'darkly', b'darkly'), (b'flatly', b'flatly'), (b'journal', b'journal'), (b'lumen', b'lumen'), (b'paper', b'paper'), (b'readable', b'readable'), (b'sandstone', b'sandstone'), (b'simplex', b'simplex'), (b'slate', b'slate'), (b'spacelab', b'spacelab'), (b'superhero', b'superhero'), (b'united', b'united'), (b'yeti', b'yeti')])),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AlterField(
            model_name='feature',
            name='is_active',
            field=models.BooleanField(default=True),
            preserve_default=True,
        ),
    ]
