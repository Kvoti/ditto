"""Script to set up test data for a ditto instance.

As before we tried to do this with migrations but ran into problems
early on with custom permissions not being created.

In any case, it's probably easier/better to have a single bootstrap
script instead of a bunch of data migrations.

"""
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from postman.models import Alias, Message, Recipient, STATUS_ACCEPTED
import ditto.models
import ditto.config

from users.models import User

INTERACTIONS = ["Message", "Private chat", "Group chat"]


def run():
    setup_features()
    setup_default_roles()
    setup_admin_permission()
    setup_interactions()
    setup_admin_user()
    setup_members()
    setup_conversations()
    
    
def setup_features():
    for slug, name, perms in (
            ('blog', 'Blog', [
                ('can_blog', 'Can Blog'),
                ('can_comment', 'Can commenet'),
            ]),
            ('news', 'News', [('can_news', 'Can manage news')]),
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
        group, _ = Group.objects.get_or_create(name=group)
        

def setup_admin_permission():
    content_type = ContentType.objects.get_for_model(User)
    perm, _ = Permission.objects.get_or_create(
        codename='can_admin',
        content_type=content_type)
    perm.name = 'Can administer'
    perm.save()
    Group.objects.get(name=ditto.config.ADMIN_ROLE).permissions.add(perm)
    

def setup_interactions():
    for interaction in INTERACTIONS:
        ditto.models.Interaction.objects.get_or_create(name=interaction)


def setup_admin_user():
    _create_user('admin', ditto.config.ADMIN_ROLE)


def setup_members():
    for name in ['mark', 'sarah', 'ross', 'emma']:
        _create_user(name, ditto.config.MEMBER_ROLE)


def setup_conversations():
    mark = User.objects.get(username='mark')
    sarah = User.objects.get(username='sarah')
    admin = User.objects.get(username='admin')

    msg, _ = Message.objects.get_or_create(
        sender=admin,
        subject="Hello members!",
        moderation_status=STATUS_ACCEPTED,
    )
    for user in [mark, sarah]:
        Recipient.objects.get_or_create(
            message=msg,
            user=user
        )
    testers, _ = Alias.objects.get_or_create(name="testers")
    testers.users = [mark, sarah]
    

def _create_user(username, group_name):
    user, created = User.objects.get_or_create(username=username)
    user.emailaddress_set.get_or_create(
        verified=1,
        defaults={'email': '%s@example.com' % username})
    if created:
        user.set_password("let me in")
        user.save()
    user.groups.add(Group.objects.get(name=group_name))