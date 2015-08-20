from django.conf import settings
from django.core.signing import Signer

from multitenancy import tenant


def jid(username):
    return "%s@%s" % (username, domain())

    
def domain():
    return tenant.chat_host()


def server():
    return "localhost" if settings.DEBUG else "134.213.147.235"


def password(username):
    if settings.DEBUG:
        return ""
    else:
        signer = Signer()
        return signer.sign(username)
