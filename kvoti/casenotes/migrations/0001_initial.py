# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('auth', '0006_require_contenttypes_0002'),
    ]

    operations = [
        migrations.CreateModel(
            name='CaseNote',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('title', models.CharField(max_length=100)),
                ('text', models.TextField()),
                ('author', models.ForeignKey(related_name='authored_case_notes', to=settings.AUTH_USER_MODEL)),
                ('client', models.ForeignKey(related_name='case_notes', to=settings.AUTH_USER_MODEL)),
                ('shared_with_roles', models.ManyToManyField(related_name='case_notes', to='auth.Group', blank=True)),
                ('shared_with_users', models.ManyToManyField(related_name='shared_case_notes', to=settings.AUTH_USER_MODEL, blank=True)),
            ],
            options={
                'permissions': (('view_casenote', 'Can view case notes'), ('manage_casenote', 'Can manage case notes')),
            },
        ),
    ]
