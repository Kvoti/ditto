# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dittoforms', '0001_initial'),
        ('auth', '0006_require_contenttypes_0002'),
    ]

    operations = [
        migrations.CreateModel(
            name='Config',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('theme', models.CharField(blank=True, max_length=20, verbose_name='theme', choices=[(b'cerulean', b'cerulean'), (b'cosmo', b'cosmo'), (b'cyborg', b'cyborg'), (b'darkly', b'darkly'), (b'flatly', b'flatly'), (b'journal', b'journal'), (b'lumen', b'lumen'), (b'paper', b'paper'), (b'readable', b'readable'), (b'sandstone', b'sandstone'), (b'simplex', b'simplex'), (b'slate', b'slate'), (b'spacelab', b'spacelab'), (b'superhero', b'superhero'), (b'united', b'united'), (b'yeti', b'yeti')])),
                ('type', models.CharField(help_text='What sector are you?', max_length=20, verbose_name='type', choices=[(b'Business', b'Business'), (b'Social', b'Social'), (b'Charity', b'Charity'), (b'Volunteer', b'Volunteer')])),
                ('description', models.TextField(help_text='A brief description of your network', verbose_name='description', blank=True)),
                ('size_cap', models.CharField(help_text='How many people are you likely to have?', max_length=10, verbose_name='size cap', choices=[(b'100', b'100'), (b'500', b'500'), (b'1,000', b'1,000'), (b'5,000', b'5,000'), (b'10,000', b'10,000'), (b'Uber', b'Uber')])),
            ],
        ),
        migrations.CreateModel(
            name='Feature',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=100, verbose_name='name')),
                ('slug', models.SlugField(verbose_name='slug')),
                ('is_active', models.BooleanField(default=True, verbose_name='is active')),
                ('permissions', models.ManyToManyField(to='auth.Permission', verbose_name='permissions')),
            ],
        ),
        migrations.CreateModel(
            name='GroupDescription',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.TextField(blank=True)),
                ('group', models.OneToOneField(related_name='description', to='auth.Group')),
            ],
        ),
        migrations.CreateModel(
            name='Interaction',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=20, verbose_name='name')),
            ],
        ),
        migrations.CreateModel(
            name='PermittedInteraction',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('interaction', models.ForeignKey(related_name='permitted', verbose_name='interaction', to='configuration.Interaction')),
                ('role1', models.ForeignKey(related_name='permitted_interactions_1', verbose_name='role 1', to='auth.Group')),
                ('role2', models.ForeignKey(related_name='permitted_interactions_2', verbose_name='role 2', to='auth.Group')),
            ],
        ),
        migrations.CreateModel(
            name='RegForm',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('form', models.ForeignKey(to='dittoforms.FormSpec')),
                ('role', models.ForeignKey(related_name='reg_forms', to='auth.Group')),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='permittedinteraction',
            unique_together=set([('interaction', 'role1', 'role2')]),
        ),
    ]
