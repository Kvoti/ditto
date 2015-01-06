from django import template

from .. import models

register = template.Library()


@register.assignment_tag
def theme():
    try:
        theme = models.Config.objects.all()[0].theme
    except models.Config.DoesNotExist:
        theme = ""
    return theme


@register.assignment_tag
def features():
    # TODO features probably need ordering
    return models.Feature.objects.filter(is_active=True)
