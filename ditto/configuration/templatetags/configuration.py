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


@register.assignment_tag(takes_context=True)
def features(context):
    # TODO features probably need ordering
    features = models.Feature.objects.filter(is_active=True)
    if not context['user'].has_perm('configuration.can_chat'):
        features = features.exclude(slug='chatroom')
    return features
