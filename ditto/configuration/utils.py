from django.contrib.auth.models import Group


def get_role_grid():
    roles = list(Group.objects.values_list('name', flat=True))
    grid = []
    while roles:
        role = roles.pop(0)
        if roles:
            grid.append((role, roles[::]))
    return grid
