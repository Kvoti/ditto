from django.conf import settings
from django.core.signing import Signer


def jid(username):
    return "%s@%s" % (username, domain())

    
def domain():
    if settings.DEBUG:
        return 'network1.localhost'
    return 'network1.ditto.technology'


def server():
    return "localhost" if settings.DEBUG else "chat.kvoti.technology"


def password(username):
    if settings.DEBUG:
        return ""
    else:
        signer = Signer()
        return signer.sign(username)
