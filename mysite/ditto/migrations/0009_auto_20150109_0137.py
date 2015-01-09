# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ditto', '0008_auto_20150109_0131'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='permittedinteraction',
            unique_together=set([('interaction', 'role1', 'role2')]),
        ),
    ]
