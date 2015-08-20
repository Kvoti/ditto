# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('casenotes', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Ticket',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_resolved', models.BooleanField(default=False)),
                ('assigned_to', models.ForeignKey(related_name='assigned_tickets', blank=True, to=settings.AUTH_USER_MODEL, null=True)),
                ('case_note', models.OneToOneField(related_name='tickets', to='casenotes.CaseNote')),
            ],
        ),
    ]
