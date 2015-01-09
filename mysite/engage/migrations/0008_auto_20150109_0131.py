# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations

INTERACTIONS = ["Message", "Private chat", "Group chat"]


def add_interactions(apps, schema_editor):
    Interaction = apps.get_model("engage", "Interaction")
    for interaction in INTERACTIONS:
        Interaction.objects.create(name=interaction)
        

def remove_interactions(apps, schema_editor):
    Interaction = apps.get_model("engage", "Interaction")
    Interaction.objects.filter(name__in=INTERACTIONS).delete()

    
class Migration(migrations.Migration):

    dependencies = [
        ('engage', '0007_interaction_permittedinteraction'),
    ]

    operations = [
        migrations.RunPython(add_interactions, remove_interactions)
    ]
