from django.contrib.auth.models import Group
from django.db.models import Q

from users.models import User

from . import models


def get_role_grid():
    roles = list(Group.objects.values_list('name', flat=True))
    grid = []
    while roles:
        role = roles.pop(0)
        if roles:
            grid.append((role, roles[::]))
    return grid


def get_permitted_users_for_messaging(user):
    return get_permitted_users_for_interaction(user, 'Messaging')


def get_permitted_users_for_interaction(user, interaction):
    role = _get_role(user)
    permitted = User.objects.filter(
        Q(groups__permitted_interactions_1__interaction__name=interaction,
          groups__permitted_interactions_1__role2=role) |
        Q(groups__permitted_interactions_2__interaction__name=interaction,
          groups__permitted_interactions_2__role1=role)
    )
    return permitted


def is_user_messaging_permitted(user1, user2):
    return is_user_interaction_permitted('Messaging', user1, user2)


def is_user_interaction_permitted(interaction, user1, user2):
    role1 = _get_role(user1)
    role2 = _get_role(user2)
    return models.Interaction.objects.get(
        name=interaction).is_permitted(role1, role2)


def _get_role(user):
    # TODO not sure here if user will have multiple groups
    return user.groups.all()[0]
