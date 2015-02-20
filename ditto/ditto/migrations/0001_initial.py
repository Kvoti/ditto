# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Config',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('theme', models.CharField(blank=True, max_length=20, verbose_name='theme', choices=[(b'cerulean', b'cerulean'), (b'cosmo', b'cosmo'), (b'cyborg', b'cyborg'), (b'darkly', b'darkly'), (b'flatly', b'flatly'), (b'journal', b'journal'), (b'lumen', b'lumen'), (b'paper', b'paper'), (b'readable', b'readable'), (b'sandstone', b'sandstone'), (b'simplex', b'simplex'), (b'slate', b'slate'), (b'spacelab', b'spacelab'), (b'superhero', b'superhero'), (b'united', b'united'), (b'yeti', b'yeti')])),
                ('type', models.CharField(help_text='What sector are you?', max_length=20, verbose_name='type', choices=[(b'Business', b'Business'), (b'Social', b'Social'), (b'Charity', b'Charity'), (b'Volunteer', b'Volunteer')])),
                ('description', models.TextField(help_text='A brief description of your network', verbose_name='description', blank=True)),
                ('size_cap', models.IntegerField(help_text='How many people are you likely to have?', verbose_name='size cap', choices=[(1000, 1000), (5000, 5000), (10000, 10000)])),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Feature',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=100)),
                ('slug', models.SlugField()),
                ('is_active', models.BooleanField(default=True)),
                ('permissions', models.ManyToManyField(to='auth.Permission')),
            ],
            options={
                'permissions': (('view_post', 'Can view blog post'), ('add_post', 'Can add blog post'), ('change_post', 'Can change blog post'), ('delete_post', 'Can delete blog post'), ('moderate_post', 'Can moderate blog post'), ('can_message', 'Can send message')),
            },
            bases=(models.Model,),
        ),
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
        migrations.AlterUniqueTogether(
            name='permittedinteraction',
            unique_together=set([('interaction', 'role1', 'role2')]),
        ),
    ]
