import datetime
import random

from django.contrib.auth.models import Group
from django.contrib.auth.decorators import login_required
from django.db.models import Sum, Case, When, IntegerField
from django.shortcuts import render
from django.views.generic import TemplateView

import chat.models
from core.views.decorators import admin_required
from core.views.mixins import NavMixin
from users.models import User


#TODO permission required
class DashView(NavMixin, TemplateView):
    template_name = 'dashboard/dashboard.html'
    nav = ['dashboard']

    
@login_required  # TODO permission?
def tickets(request):
    types = [
        'Blog moderation',
        'Book appointment',
        'Case note shared',
        'Request for help',
        'Comment moderation',
    ]
    return _tickets(request, types, 'Tickets')


@admin_required
def safeguarding(request):
    types = [
        'Internal referral',
        'External referral',
        'Session note shared',
        'Unplanned ending',
        'Ban',
        'Warning',
    ]
    return _tickets(request, types, 'Safeguarding')


def _tickets(request, types, section):
    users = User.objects.all()
    tickets = []
    date = datetime.datetime(2015, 7, 8, 15, 30)
    for i in range(30):
        date += datetime.timedelta(minutes=random.choice([5, 15, 30, 60, 180]))
        tickets.append(dict(
            client=random.choice(users).username,
            professional=random.choice(users).username,
            type=random.choice(types),
            created=date
        ))
    return render(request, 'dashboard/tickets.html', {
        'tickets': tickets,
        'section': section,
    })


@admin_required
def users(request):
    return render(request, 'dashboard/users.html')


@admin_required
def reports(request):
    counts = {
        role.name: Sum(
            Case(When(user__groups=role, then=1),
                 output_field=IntegerField())
        )
        for role in Group.objects.all()
    }
    sessions = chat.models.SessionRating.objects.aggregate(**counts)
    return render(request, 'dashboard/reports.html', {
        'sessions': sessions
    })
