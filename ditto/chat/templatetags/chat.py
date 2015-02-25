from django.core.signing import Signer
from django import template

register = template.Library()


@register.filter
def chatpass(username):
    signer = Signer()
    return signer.sign(username)
