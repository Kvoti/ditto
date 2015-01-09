# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Feature',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=100)),
                ('slug', models.SlugField()),
                ('permissions', models.ManyToManyField(to='auth.Permission')),
            ],
            options={
                'permissions': (('view_post', 'Can view blog post'), ('add_post', 'Can add blog post'), ('change_post', 'Can change blog post'), ('delete_post', 'Can delete blog post'), ('moderate_post', 'Can moderate blog post'), ('can_message', 'Can send message')),
            },
            bases=(models.Model,),
        ),
    ]
