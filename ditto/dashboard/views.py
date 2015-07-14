import datetime
import random

from django.conf import settings
from django.contrib.auth.models import Group
from django.contrib.auth.decorators import login_required
from django.db.models import Sum, Case, When, IntegerField, Avg, F, FloatField
from django.shortcuts import render
from django.views.generic import TemplateView

import casenotes.models
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
    counts = {}
    for role in Group.objects.all():
        counts[role.name] = Sum(
            Case(When(user__groups=role, then=1),
                 output_field=IntegerField())
        )
        counts['%s_complete' % role.name] = Sum(
            Case(When(user__groups=role, rating__isnull=False, then=1),
                 output_field=IntegerField())
        )
        counts['%s_avg_rating' % role.name] = Avg(
            Case(When(user__groups=role,
                      rating__isnull=False, then=F('rating')),
                 output_field=FloatField())
        )
    sessions = chat.models.SessionRating.objects.aggregate(**counts)
    users = User.objects.aggregate(**_role_counts('groups'))
    case_notes = casenotes.models.CaseNote.objects.aggregate(
        **_role_counts('author__groups')
    )
    # TODO this will BLOW UP HORRIBLY for a large number of users
    # Eventually we'll probably need to do offline processing of the django
    # and chat dbs so we can efficiently query private messages
    pms = chat.models.PrivateMessage.objects
    if settings.DEBUG:
        pms = pms.using('chat')
    private_messages = pms.aggregate(
        **{
            role.name: Sum(
                Case(When(
                    user__user_name__in=list(User.objects.filter(
                        groups=role).values_list('username', flat=True)),
                    then=1),
                     output_field=IntegerField())
            )
            for role in Group.objects.all()
        }
    )
    return render(request, 'dashboard/reports.html', {
        'reports': [
            {
                'heading': 'Sessions',
                'columns': ['Role', '', 'Completed', 'Average rating'],
                'data': _rows(sessions, 'complete', 'avg_rating')
            },
            {
                'heading': 'Registrations',
                'columns': ['Role', ''],
                'data': _rows(users)
            },
            {
                'heading': 'Case notes',
                'columns': ['Role', ''],
                'data': _rows(case_notes)
            },
            {
                'heading': 'Private messages',
                'columns': ['Role', ''],
                'data': _rows(private_messages)
            },
        ]
    })


def _role_counts(role_relation):
    return {
        role.name: Sum(
            Case(When(**{role_relation: role, 'then': 1}),
                 output_field=IntegerField())
        )
        for role in Group.objects.all()
    }


def _rows(data, *keys):
    for role in Group.objects.values_list('name', flat=True):
        yield role, _columns(data, role, *keys)


def _columns(data, role, *keys):
    yield data[role]
    if keys:
        for key in keys:
            yield data['%s_%s' % (role, key)]
