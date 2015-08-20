from tabulate import tabulate

from . import models


def render_form(form):
    s = form.title + '\n\n'
    for question in form.questions.order_by('order').select_subclasses():
        s += _render_question_heading(question)
        s += _render_question(question) + '\n\n'
    return s


def _render_question_heading(question):
    s = '%s. %s?' % (question.order, question.question)
    if question.is_required:
        s += ' *'
    return s + '\n'


def _render_question(question):
    if isinstance(question, models.Text):
        return _render_text_question(question)

    elif isinstance(question, models.Choice):
        return _render_choice_question(question)

    elif isinstance(question, models.ScoreGroup):
        return _render_score_group_question(question)


def _render_text_question(question):
    return ''


def _render_choice_question(question):
    s = u''
    for option in question.options.order_by('order'):
        s += '    {0.order}. {0.text}\n'.format(option)
    return s


def _render_score_group_question(question):
    s = u''
    options = question.labels.order_by('order').values_list('label', flat=True)
    rows = [
        [''] + list(options)
    ]
    for item in question.items.order_by('order'):
        scores = item.scores.order_by('label__order').values_list('score', flat=True)
        rows.append([item.text] + list(scores))
    s += tabulate(rows)
    return s



def render_response(response):
    s = response.form.title + '\n\n'
    for question in response.form.questions.order_by(
            'order',
    ).select_subclasses():
        s += _render_question_heading(question)
        s += _render_answer(response, question) + '\n'
    return s


def _render_answer(response, question):
    if isinstance(question, models.Text):
        return _render_text_answer(response, question)

    elif isinstance(question, models.Choice):
        return _render_choice_answer(response, question)

    elif isinstance(question, models.ScoreGroup):
        return _render_score_group_answer(response, question)


def _render_text_answer(response, question):
    s = u''
    answer = models.TextAnswer.objects.get(response=response, question=question)
    s += answer.answer + '\n'
    return s


def _render_choice_answer(response, question):
    s = ''
    for option in question.options.order_by('order'):
        if models.ChoiceAnswer.objects.filter(
                response=response,
                option=option).exists():
            tick = u'\u2713'
        else:
            tick = ''
        s += u'    {0.order}. {0.text}{1}\n'.format(option, tick)
    return s


def _render_score_group_answer(response, question):            
    s = ''
    options = question.labels.order_by('order').values_list('label', flat=True)
    rows = [
        [''] + list(options)
    ]
    for item in question.items.order_by('order'):
        scores = item.scores.order_by('label__order')
        ss = []
        for score in scores:
            if models.ScoreGroupAnswer.objects.filter(
                    response=response,
                    score=score
            ).exists():
                ss.append(u'\u2713')
            else:
                ss.append('')
        rows.append([item.text] + ss)
    s += tabulate(rows) + '\n'
    return s
