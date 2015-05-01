import json

from django.conf import settings
from django.core.signing import Signer
from django import template

register = template.Library()


@register.inclusion_tag('chat/_conf.html', takes_context=True)
def chat_config(context, other=None, extra=None):
    user = context['request'].user
    chat_host = context['request'].tenant.chat_host()
    server = "localhost" if settings.DEBUG else "134.213.147.235"
    if settings.DEBUG:
        password = ""
    else:
        signer = Signer()
        password = signer.sign(user.username)
    me = '%s@%s' % (user.username, chat_host)
    try:
        role = user.groups.all()[0].name
    except IndexError:
        role = '-'
    conf = {
        'me': _resource(me),
        'role': role,
        'nick': user.username,
        'server': server,
        'password': password,
        'element': 'emptychat',
        'page': None,
    }
    if extra:
        conf.update(extra)
    return {'conf': json.dumps(conf)}


def _resource(jid):
    return '%s/Ditto' % jid
