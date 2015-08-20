# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_auto_20150713_1619'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserDatum',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('field_name', models.CharField(max_length=100)),
                ('field_value', models.TextField()),
                ('user', models.ForeignKey(related_name='custom_data', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
