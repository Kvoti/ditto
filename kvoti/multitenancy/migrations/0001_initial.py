# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Tenant',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('network_name', models.CharField(unique=True, max_length=20)),
                ('slug', models.CharField(help_text=b'A short identifier for your network, lower case letters only', unique=True, max_length=10, validators=[django.core.validators.RegexValidator(b'^[a-z]+$')])),
                ('is_configured', models.BooleanField(default=False, editable=False)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
