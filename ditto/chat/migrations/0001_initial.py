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
            name='Room',
            fields=[
                ('slug', models.SlugField(serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=50)),
                ('is_regular', models.BooleanField(default=False)),
                ('start', models.DateTimeField(null=True, blank=True)),
                ('end', models.DateTimeField(null=True, blank=True)),
                ('close_message', models.CharField(default='The chatroom is now closed.', max_length=200)),
                ('is_opened', models.BooleanField(default=False)),
                ('is_closed', models.BooleanField(default=False)),
                ('roles', models.ManyToManyField(related_name='chatrooms', to='auth.Group', blank=True)),
                ('users', models.ManyToManyField(related_name='chatrooms', to=settings.AUTH_USER_MODEL, blank=True)),
            ],
            options={
                'permissions': (('configure_chatroom', 'Can configure chatrooms'),),
            },
        ),
        migrations.CreateModel(
            name='Session',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('session_id', models.CharField(unique=True, max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='SessionRating',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('rating', models.IntegerField(null=True, choices=[(0, b'Very poor'), (1, b'poor'), (2, b'OK'), (3, b'Good'), (4, b'Very good')])),
                ('session', models.ForeignKey(related_name='ratings', to='chat.Session')),
                ('user', models.ForeignKey(related_name='session_ratings', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Slot',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('day', models.IntegerField(choices=[(0, b'Monday'), (1, b'Tuesday'), (2, b'Wednesday'), (3, b'Thursday'), (4, b'Friday'), (5, b'Saturday'), (6, b'Sunday')])),
                ('start', models.IntegerField(choices=[(0, 0), (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10), (11, 11), (12, 12), (13, 13), (14, 14), (15, 15), (16, 16), (17, 17), (18, 18), (19, 19), (20, 20), (21, 21), (22, 22), (23, 23)])),
                ('end', models.IntegerField(choices=[(0, 0), (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10), (11, 11), (12, 12), (13, 13), (14, 14), (15, 15), (16, 16), (17, 17), (18, 18), (19, 19), (20, 20), (21, 21), (22, 22), (23, 23)])),
                ('room', models.ForeignKey(related_name='slots', to='chat.Room')),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='sessionrating',
            unique_together=set([('session', 'user')]),
        ),
    ]
