from django import template

from .. import models

register = template.Library()


@register.assignment_tag
def theme():
    try:
        theme = models.Config.objects.all()[0].theme
    except IndexError:
        theme = ""
    return theme
