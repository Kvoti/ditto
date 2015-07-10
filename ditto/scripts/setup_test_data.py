"""Script to set up test data for a Kvoti instance.

As before we tried to do this with migrations but ran into problems
early on with custom permissions not being created.

In any case, it's probably easier/better to have a single bootstrap
script instead of a bunch of data migrations.

"""
# Must install config and setup Django before importing models
from configurations import importer
importer.install()
import django
django.setup()
####################

import os

from django.conf import settings
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.contrib.sites.models import Site

import casenotes.models
import chat.models
import configuration.models
import core
import dittoforms.models
import multitenancy.models
import multitenancy.tenant

from users.models import User

INTERACTIONS = ["Messaging"]


REG_FORM_SPEC = '[{"name":"Name","on":true,"fields":[{"name":"First name"},{"name":"Last name"}]},{"name":"Gender","on":true,"options":["Male","Female","Other"]},{"name":"Ethnicity","on":true,"options":["White British","Other"]},{"name":"How did you hear about us?","on":true,"multiple":true,"options":["Internet search","Magazine","Other"]}]'


def run():
    setup_guest_passwords()
    setup_site()
    setup_features()
    setup_default_roles()
    setup_permissions()
    setup_interactions()
    setup_admin_users()
    setup_members()
    setup_tenants()
    setup_reg_form()
    setup_chat_conf()
    setup_case_notes()
    

def setup_guest_passwords():
    global GUEST_PASSWORDS, DEFAULT_PASSWORD
    if 'GUEST_PASSWORDS' in os.environ:
        GUEST_PASSWORDS = os.environ['GUEST_PASSWORDS'].split()
        # prob ok to reuse the same password for any extra test users?
        DEFAULT_PASSWORD = GUEST_PASSWORDS[0]
    else:
        GUEST_PASSWORDS = None
        

def setup_site(name='KVOTI.TECHNOLOGY'):
    site = Site.objects.get_current()
    site.name = name
    domain = 'localhost:8000' if settings.DEBUG else site.name.lower()
    site.domain = domain
    site.save()


def setup_features():
    for slug, name, perms in (
            ('chatroom', 'Chatroom', [
                ('can_chat', 'Can chat'),
                ('configure_chatroom', 'Can configure chatrooms')
            ]),
            ('casenotes', 'Case notes', [
                ('add_casenote', 'Can add case notes'),
                ('view_casenote', 'Can view case notes')
            ]),
    ):
        feature, _ = configuration.models.Feature.objects.get_or_create(
            slug=slug, name=name)
        content_type = ContentType.objects.get_for_model(configuration.models.Feature)
        for codename, name in perms:
            perm, _ = Permission.objects.get_or_create(
                codename=codename,
                defaults={'content_type': content_type})
            perm.name = name
            perm.save()
            feature.permissions.add(perm)


def setup_default_roles():
    for group in core.DEFAULT_ROLES:
        group, _ = Group.objects.get_or_create(name=group)
    # TODO split out the kvoti example network stuff
    for group in ['Adviser', 'Counsellor']:
        group, _ = Group.objects.get_or_create(name=group)
        

def setup_permissions():
    content_type = ContentType.objects.get_for_model(User)
    perm, _ = Permission.objects.get_or_create(
        codename='can_admin',
        content_type=content_type)
    perm.name = 'Can administer'
    perm.save()
    Group.objects.get(name=core.ADMIN_ROLE).permissions.add(perm)
    perm = Permission.objects.get(codename='invite_user')
    Group.objects.get(name=core.ADMIN_ROLE).permissions.add(perm)
    perm = Permission.objects.get(codename='configure_chatroom')
    Group.objects.get(name=core.ADMIN_ROLE).permissions.add(perm)
    perm = Permission.objects.get(codename='add_casenote')
    Group.objects.get(name=core.ADMIN_ROLE).permissions.add(perm)
    perm = Permission.objects.get(codename='view_casenote')
    Group.objects.get(name=core.ADMIN_ROLE).permissions.add(perm)
    perm = Permission.objects.get(codename='manage_casenote')
    Group.objects.get(name=core.ADMIN_ROLE).permissions.add(perm)
    perm = Permission.objects.get(codename='guest')
    Group.objects.get(name=core.GUEST_ROLE).permissions.add(perm)
    perm = Permission.objects.get(codename='can_chat')
    for group in Group.objects.all():
        group.permissions.add(perm)
    

def setup_interactions():
    for interaction in INTERACTIONS:
        configuration.models.Interaction.objects.get_or_create(name=interaction)


def setup_admin_users():
    _create_user('admin', core.ADMIN_ROLE)
    _create_user('visitor', core.ADMIN_ROLE)


def setup_members():
    for name in ['mark', 'sarah', 'ross', 'emma']:
        _create_user(name, core.MEMBER_ROLE)
    for i in range(1, 4):
        _create_user('member%s' % i, core.MEMBER_ROLE)
    for user, role in [
            ['adviser', 'Adviser'],
            ['counsellor', 'Counsellor']
    ]:
        _create_user(user, role)
        

def _create_user(username, group_name):
    user, created = User.objects.get_or_create(username=username)
    user.emailaddress_set.get_or_create(
        verified=1,
        defaults={'email': '%s@example.com' % username})
    if created:
        if 'GUEST_PASSWORDS' in os.environ:
            try:
                password = GUEST_PASSWORDS.pop()
            except IndexError:
                password = DEFAULT_PASSWORD
        else:
            password = 'x'
        user.set_password(password)
        user.save()
    user.groups.add(Group.objects.get(name=group_name))


def setup_tenants():
    user = User.objects.get(username='mark')
    multitenancy.models.Tenant.objects.create(
        user=user,
        network_name='Kvoti',
        slug='di',
        is_configured=True,
    )
    if not multitenancy.tenant.is_main():
        setup_site(name='Kvoti')


def setup_reg_form():
    for role in Group.objects.all():
        form = dittoforms.models.FormSpec.objects.create(
            slug='reg',
            spec=REG_FORM_SPEC
        )
        configuration.models.RegForm.objects.create(
            role=role,
            form=form
        )


def setup_chat_conf():
    room = chat.models.Room.objects.create(
        slug='main',
        name='Main chatroom',
        is_regular=True
    )
    for day in range(7):
        chat.models.Slot.objects.create(
            room=room,
            day=day,
            start=8,
            end=18,
        )


def setup_case_notes():
    client = User.objects.get(username="mark")
    author = User.objects.get(username="sarah")
    for i in range(1, 5):
        casenotes.models.CaseNote.objects.create(
            author=author,
            client=client,
            title="Case note %s" % i,
            text="Case note %s" % i
        )

if __name__ == '__main__':
    run()
    
