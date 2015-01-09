"""Script to set up test data for a ditto instance.

As before we tried to do this with migrations but ran into problems
early on with custom permissions not being created.

In any case, it's probably easier/better to have a single bootstrap
script instead of a bunch of data migrations.

"""
from django.contrib.auth.models import Group, Permission

import ditto.models
import ditto.config

from users.models import User

INTERACTIONS = ["Message", "Private chat", "Group chat"]


def run():
    setup_features()
    setup_default_roles()
    setup_interactions()
    setup_admin_user()

    
def setup_features():
    for slug, name, perms in (
            ('blog', 'Blog', [
                'view_post',
                'add_post',
                'change_post',
                'delete_post',
                'moderate_post',
            ]),
            ('messaging', 'Messaging', ['can_message'])
    ):
        feature, _ = ditto.models.Feature.objects.get_or_create(
            slug=slug, name=name)
        for perm in perms:
            feature.permissions.add(Permission.objects.get(codename=perm))


def setup_default_roles():
    for group in ditto.config.DEFAULT_ROLES:
        Group.objects.get_or_create(name=group)


def setup_interactions():
    for interaction in INTERACTIONS:
        ditto.models.Interaction.objects.get_or_create(name=interaction)


def setup_admin_user():
    user, created = User.objects.get_or_create(username="admin")
    user.emailaddress_set.get_or_create(verified=1)
    if created:
        user.set_password("let me in")
        user.save()
