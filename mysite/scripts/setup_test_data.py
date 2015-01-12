"""Script to set up test data for a ditto instance.

As before we tried to do this with migrations but ran into problems
early on with custom permissions not being created.

In any case, it's probably easier/better to have a single bootstrap
script instead of a bunch of data migrations.

"""
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

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
                ('can_blog', 'Can Blog'),
                ('can_comment', 'Can commenet'),
            ]),
            ('messaging', 'Messaging', [('can_message', 'Can Message')]),
            ('polls', 'Polls', [('can_poll', 'Can add polls')]),
    ):
        feature, _ = ditto.models.Feature.objects.get_or_create(
            slug=slug, name=name)
        content_type = ContentType.objects.get_for_model(ditto.models.Feature)
        for codename, name in perms:
            perm, _ = Permission.objects.get_or_create(
                codename=codename,
                content_type=content_type)
            perm.name = name
            perm.save()
            feature.permissions.add(perm)


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
