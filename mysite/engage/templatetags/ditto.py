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


@register.inclusion_tag("engage/templatetags/nav_item.html", takes_context=True)
def navitem(context, slug, url, text):
    return {
        'url': url,
        'text': text,
        'active': slug in context['nav'] if 'nav' in context else False
    }
