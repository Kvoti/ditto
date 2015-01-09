# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0001_initial'),
        ('ditto', '0006_auto_20150108_0529'),
    ]

    operations = [
        migrations.CreateModel(
            name='Interaction',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=20)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='PermittedInteraction',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('interaction', models.ForeignKey(related_name='permitted', to='ditto.Interaction')),
                ('role1', models.ForeignKey(related_name='permitted_interactions_1', to='auth.Group')),
                ('role2', models.ForeignKey(related_name='permitted_interactions_2', to='auth.Group')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
