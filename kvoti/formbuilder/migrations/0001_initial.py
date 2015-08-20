# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Answer',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
            ],
        ),
        migrations.CreateModel(
            name='Form',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('slug', models.SlugField(unique=True)),
                ('title', models.CharField(max_length=b'100')),
                ('description', models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Option',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('order', models.PositiveIntegerField()),
                ('text', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('order', models.PositiveIntegerField()),
                ('question', models.CharField(max_length=255)),
                ('is_required', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Response',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('submitted_at', models.DateTimeField(auto_now_add=True)),
                ('form', models.ForeignKey(related_name='responses', to='formbuilder.Form')),
                ('user', models.ForeignKey(related_name='answers', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Score',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('score', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='ScoreGroupItem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('order', models.PositiveIntegerField()),
                ('text', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='ScoreLabel',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('order', models.PositiveIntegerField()),
                ('label', models.CharField(max_length=b'50')),
            ],
        ),
        migrations.CreateModel(
            name='Choice',
            fields=[
                ('question_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='formbuilder.Question')),
                ('is_multiple', models.BooleanField(default=False)),
                ('has_other', models.BooleanField(default=False)),
                ('other_text', models.CharField(max_length=255)),
            ],
            bases=('formbuilder.question',),
        ),
        migrations.CreateModel(
            name='ChoiceAnswer',
            fields=[
                ('answer_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='formbuilder.Answer')),
            ],
            bases=('formbuilder.answer',),
        ),
        migrations.CreateModel(
            name='ScoreGroup',
            fields=[
                ('question_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='formbuilder.Question')),
            ],
            bases=('formbuilder.question',),
        ),
        migrations.CreateModel(
            name='ScoreGroupAnswer',
            fields=[
                ('answer_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='formbuilder.Answer')),
            ],
            bases=('formbuilder.answer',),
        ),
        migrations.CreateModel(
            name='Text',
            fields=[
                ('question_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='formbuilder.Question')),
                ('is_multiline', models.BooleanField(default=False)),
                ('max_chars', models.PositiveIntegerField(null=True, blank=True)),
                ('max_words', models.PositiveIntegerField(null=True, blank=True)),
            ],
            bases=('formbuilder.question',),
        ),
        migrations.CreateModel(
            name='TextAnswer',
            fields=[
                ('answer_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='formbuilder.Answer')),
                ('answer', models.TextField()),
                ('question', models.ForeignKey(to='formbuilder.Text')),
            ],
            bases=('formbuilder.answer',),
        ),
        migrations.AddField(
            model_name='score',
            name='item',
            field=models.ForeignKey(related_name='scores', to='formbuilder.ScoreGroupItem'),
        ),
        migrations.AddField(
            model_name='score',
            name='label',
            field=models.ForeignKey(related_name='scores', to='formbuilder.ScoreLabel'),
        ),
        migrations.AddField(
            model_name='question',
            name='form',
            field=models.ForeignKey(related_name='questions', to='formbuilder.Form'),
        ),
        migrations.AddField(
            model_name='answer',
            name='response',
            field=models.ForeignKey(related_name='answers', to='formbuilder.Response'),
        ),
        migrations.AddField(
            model_name='scorelabel',
            name='question',
            field=models.ForeignKey(related_name='labels', to='formbuilder.ScoreGroup'),
        ),
        migrations.AddField(
            model_name='scoregroupitem',
            name='question',
            field=models.ForeignKey(related_name='items', to='formbuilder.ScoreGroup'),
        ),
        migrations.AddField(
            model_name='scoregroupanswer',
            name='score',
            field=models.ForeignKey(to='formbuilder.Score'),
        ),
        migrations.AlterUniqueTogether(
            name='score',
            unique_together=set([('item', 'label', 'score')]),
        ),
        migrations.AlterUniqueTogether(
            name='question',
            unique_together=set([('form', 'question'), ('form', 'order')]),
        ),
        migrations.AddField(
            model_name='option',
            name='question',
            field=models.ForeignKey(related_name='options', to='formbuilder.Choice'),
        ),
        migrations.AddField(
            model_name='choiceanswer',
            name='option',
            field=models.ForeignKey(to='formbuilder.Option'),
        ),
        migrations.AlterUniqueTogether(
            name='scorelabel',
            unique_together=set([('question', 'order'), ('question', 'label')]),
        ),
        migrations.AlterUniqueTogether(
            name='scoregroupitem',
            unique_together=set([('question', 'order'), ('question', 'text')]),
        ),
        migrations.AlterUniqueTogether(
            name='option',
            unique_together=set([('question', 'order'), ('question', 'text')]),
        ),
    ]
