# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_user_bio'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='user',
            options={'verbose_name': 'user', 'verbose_name_plural': 'users', 'permissions': (('invite_user', 'Can invite a user'), ('guest', 'Guest permission'), ('assign_role', 'Can assign role'))},
        ),
        migrations.AddField(
            model_name='user',
            name='avatar',
            field=models.CharField(default=b'sunshine', max_length=b'10', choices=[(b'sunshine', b'sunshine'), (b'rocket', b'rocket'), (b'skull', b'skull'), (b'zoom_lolly', b'zoom_lolly'), (b'fried_egg', b'fried_egg'), (b'flower', b'flower'), (b'super_mario', b'super_mario'), (b'ice_lolly', b'ice_lolly'), (b'panda', b'panda'), (b'hotdog', b'hotdog'), (b'popcorn', b'popcorn'), (b'melon', b'melon'), (b'monkey', b'monkey')]),
        ),
    ]
