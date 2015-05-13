"""Script to set up test data for a Ditto instance.

As before we tried to do this with migrations but ran into problems
early on with custom permissions not being created.

In any case, it's probably easier/better to have a single bootstrap
script instead of a bunch of data migrations.

"""
import os

from django.conf import settings
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.contrib.sites.models import Site

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
    setup_admin_permission()
    setup_interactions()
    setup_admin_users()
    setup_members()
    setup_tenants()
    setup_reg_form()


def setup_guest_passwords():
    global GUEST_PASSWORDS
    if 'GUEST_PASSWORDS' in os.environ:
        GUEST_PASSWORDS = os.environ['GUEST_PASSWORDS'].split()
    else:
        GUEST_PASSWORDS = None
        

def setup_site(name='DITTO.TECHNOLOGY', subdomain=None):
    site = Site.objects.get_current()
    site.name = name
    domain = 'localhost' if settings.DEBUG else site.name.lower()
    if subdomain:
        domain = '%s.%s' % (subdomain, domain)
    site.domain = domain
    site.save()


def setup_features():
    for slug, name, perms in (
            ('chatroom', 'Chatroom', [('can_chat', 'Can chat')]),
            ('news', 'News', [('can_news', 'Can manage news')]),
            ('blog', 'Blog', [
                ('can_blog', 'Can Blog'),
                ('can_comment', 'Can comment'),
            ]),
    ):
        feature, _ = configuration.models.Feature.objects.get_or_create(
            slug=slug, name=name)
        content_type = ContentType.objects.get_for_model(configuration.models.Feature)
        for codename, name in perms:
            perm, _ = Permission.objects.get_or_create(
                codename=codename,
                content_type=content_type)
            perm.name = name
            perm.save()
            feature.permissions.add(perm)


def setup_default_roles():
    for group in core.DEFAULT_ROLES:
        group, _ = Group.objects.get_or_create(name=group)
        

def setup_admin_permission():
    content_type = ContentType.objects.get_for_model(User)
    perm, _ = Permission.objects.get_or_create(
        codename='can_admin',
        content_type=content_type)
    perm.name = 'Can administer'
    perm.save()
    Group.objects.get(name=core.ADMIN_ROLE).permissions.add(perm)
    

def setup_interactions():
    for interaction in INTERACTIONS:
        configuration.models.Interaction.objects.get_or_create(name=interaction)


def setup_admin_users():
    _create_user('admin', core.ADMIN_ROLE)
    _create_user('visitor', core.ADMIN_ROLE)


def setup_members():
    for name in ['mark', 'sarah', 'ross', 'emma']:
        _create_user(name, core.MEMBER_ROLE)
        

def _create_user(username, group_name):
    user, created = User.objects.get_or_create(username=username)
    user.emailaddress_set.get_or_create(
        verified=1,
        defaults={'email': '%s@example.com' % username})
    if created:
        if GUEST_PASSWORDS:
            password = GUEST_PASSWORDS.pop()
        else:
            password = 'x'
        user.set_password(password)
        user.save()
    user.groups.add(Group.objects.get(name=group_name))


def setup_tenants():
    user = User.objects.get(username='mark')
    multitenancy.models.Tenant.objects.create(
        user=user,
        network_name='Digital Impacts',
        slug='di',
        is_configured=True,
    )
    if not multitenancy.tenant.is_main():
        setup_site(name='Digital Impacts', subdomain='di')


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
