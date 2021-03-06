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
import dittoforms.models
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
    return render(request, 'dashboard/reports.html', {
        'reports': [
            _custom_registration_data(),
            _sessions(),
            _users(),
            _case_notes(),
        ]
    })


def _sessions():
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
    return {
        'heading': 'Sessions',
        'columns': ['Role', '', 'Completed', 'Average rating'],
        'data': _rows(sessions, 'complete', 'avg_rating')
    }


def _users():
    users = User.objects.aggregate(**_role_counts('groups'))
    return {
        'heading': 'Registrations',
        'columns': ['Role', ''],
        'data': _rows(users)
    }


def _case_notes():
    case_notes = casenotes.models.CaseNote.objects.aggregate(
        **_role_counts('author__groups')
    )
    return {
        'heading': 'Case notes',
        'columns': ['Role', ''],
        'data': _rows(case_notes)
    }


def _custom_registration_data():
    # TODO handle fact we might have different forms for each role
    form_spec = dittoforms.models.FormSpec.objects.all()[0]
    ######
    # TODO handle field types other than single choice
    custom_choice_fields = form_spec.get_choice_fields()
    ######
    counts = {}
    col_headings = ['Role']
    col_keys = []
    for choice_field in custom_choice_fields:
        for choice in choice_field['options']:
            key = '%s_%s' % (choice_field['name'], choice)
            col_keys.append(key)
            col_headings.append('%s - %s' % (choice_field['name'], choice))
            for role in Group.objects.all():
                counts['%s_%s' % (role.name, key)] = Sum(
                    Case(
                        When(
                            groups=role,
                            custom_data__field_name=choice_field['name'],
                            custom_data__field_value=choice,
                            then=1
                        ),
                        output_field=IntegerField())
                )
    data = User.objects.aggregate(**counts)
    return {
        'heading': 'Custom registration data',
        'columns': col_headings,
        'data': _rows(data, *col_keys)
    }
    

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
    if role in data:
        yield data[role]
    if keys:
        for key in keys:
            value = data['%s_%s' % (role, key)]
            # TODO remove this hack for displaying average ratings (can we do this in the SQL query?)
            if key.endswith('avg_rating'):
                # TODO get these from SessionRating.CHOICES
                if value is not None:
                    if 0 <= value < 0.5:
                        text_value = 'Very poor'
                    elif 0.5 <= value < 1.5:
                        text_value = 'poor'
                    elif 1.5 <= value < 2.5:
                        text_value = 'OK'
                    elif 2.5 <= value < 3.5:
                        text_value = 'Good'
                    elif 3.5 <= value <= 4:
                        text_value = 'Very good'
                    value = '%s (%s)' % (value, text_value)
            yield value
