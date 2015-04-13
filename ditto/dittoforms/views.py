import json

from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import get_object_or_404
from django.template.response import TemplateResponse

from . import models
from .utils import Form


def form(request, form_slug, data=None):
    form_spec = get_object_or_404(models.FormSpec, slug=form_slug)
    if request.method == 'POST':
        form = Form(request.user, form_spec, request.POST)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect('.')
    else:
        form = Form(request.user, form_spec, data=data)
    return TemplateResponse(
        request,
        'dittoforms/form.html',
        {'form': form}
    )


# @login_required
def response(request, form_slug):
    form_spec = get_object_or_404(models.FormSpec, slug=form_slug)
    # TODO need to configure if multiple submissions are required
    submissions = models.FormSubmission.objects.filter(
        form=form_spec,
        user=request.user
    )
    return HttpResponse(submissions[0].data)


def edit(request, form_slug):
    form_spec = get_object_or_404(models.FormSpec, slug=form_slug)
    # TODO need to configure if multiple submissions are required
    submissions = models.FormSubmission.objects.filter(
        form=form_spec,
        user=request.user
    )
    data = json.loads(submissions[0].data)
    return form(request, form_slug, data)


# TODO full rest_framework goodness here, just hacking this together for now
from django.views.decorators.csrf import csrf_exempt
@csrf_exempt  # TODO remove this when remembered how to add token to ajax requests
def api(request, form_slug):
    form_spec = get_object_or_404(models.FormSpec, slug=form_slug)
    if request.method == 'GET':
        print form_spec.spec
        return HttpResponse(
            form_spec.spec,
            content_type='application/json'
        )
    else:
        form_spec.spec = request.body
        print form_spec.spec
        form_spec.save()
        return HttpResponse()  # 200 ok
