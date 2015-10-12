# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('configuration', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Values',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('case_notes_name', models.CharField(default=b'case notes', max_length=200)),
                ('post_session_feedback_name', models.CharField(default=b'post-session feedback', max_length=200)),
                ('post_session_feedback_question', models.TextField(default=b'How useful did you find the support given to you today?')),
            ],
        ),
        migrations.AlterField(
            model_name='config',
            name='size_cap',
            field=models.CharField(help_text='How many people are you likely to have on your Kvoti network?', max_length=10, verbose_name='size cap', choices=[(b'100', b'100'), (b'250', b'250'), (b'500', b'500'), (b'1000', b'1000'), (b'1000+', b'1000+')]),
        ),
        migrations.AlterField(
            model_name='config',
            name='type',
            field=models.CharField(default=b'Charity', help_text='What type of organisation are you?', max_length=20, verbose_name='type', choices=[(b'Charity', b'Charity'), (b'Not For Profit', b'Not For Profit'), (b'Social Enterprise', b'Social Enterprise'), (b'NGO', b'NGO'), (b'Sole Proprietor', b'Sole Proprietor'), (b'Partnership', b'Partnership'), (b'Cooperative', b'Cooperative'), (b'Small Business', b'Small Business'), (b'Corporation', b'Corporation'), (b'Government Agency', b'Government Agency')]),
        ),
    ]
