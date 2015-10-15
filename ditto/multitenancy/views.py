import sesame.utils
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import Group
from django.contrib import messages
from django.contrib.sites.models import Site
from django.core import management
from django.core.signing import Signer
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect, HttpResponse, Http404
from django.shortcuts import render, get_object_or_404
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_POST

import core
from users.models import User

# TODO restrict this to requests from chat (localhost for now)?
@never_cache
def get_password(request):
    if settings.DEBUG:
        return HttpResponse()
    username = request.GET['user']
    user = get_object_or_404(User, username=username)
    signer = Signer()
    value = signer.sign(user.username)
    return HttpResponse(value)


@never_cache
def user_exists(request):
    username = request.GET['user']
    get_object_or_404(User, username=username)
    return HttpResponse('true')
