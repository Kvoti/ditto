from django import template

register = template.Library()


# annoys the hell out of me that you can't do dynamic lookups in
# django templates out of the box!
@register.filter
def lookup(obj, attr):
    try:
        return getattr(obj, attr)
    except AttributeError:
        return obj[attr]
