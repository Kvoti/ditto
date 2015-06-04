from datetime import timedelta

from django.conf import settings
from django.core.signing import Signer
from django.utils.timezone import now, localtime

from configuration.utils import get_chatroom_config
from multitenancy import tenant

from . import models


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


def is_chatroom_open():
    conf = get_chatroom_config()
    if conf.open_time:
        return is_now_between_interval(conf.open_time, conf.close_time)
    else:
        return True


def is_now_between_interval(start_time, end_time):
    _now = now()
    start = _get_local_datetime(_now, start_time)
    end = _get_local_datetime(_now, end_time)
    # TODO sort out issues with clock change
    if end > start:
        return start <= _now < end
    else:
        return _now >= start or _now < end


def _get_local_datetime(now, time):
    # TODO is this cleanest way to convert time to local datetime for today?
    localnow = localtime(now)
    return localnow.replace(hour=time.hour, minute=time.minute)
    return localnow
