from django.db import models
from model_utils.managers import InheritanceManager


class FormManager(models.Manager):
    # TODO @atomic?
    def create_form(self, slug, title, questions):
        form = self.create(slug=slug, title=title)
        for creator, kwargs in questions:
            getattr(form, creator)(**kwargs)
        return form

    def create_form_from_data(self, data):
        # TODO validation
        questions = []
        for question in data['questions']:
            if 'text' in question:
                question.update(question['text'])
                del question['text']
                questions.append(Form.text(**question))
            elif 'choice' in question:
                question.update(question['choice'])
                del question['choice']
                questions.append(Form.choice(**question))
            else:
                question.update(question['scoregroup'])
                del question['scoregroup']
                questions.append(Form.score_group(**question))
        return self.create_form(
            title=data['title'],
            slug=data['slug'],
            questions=questions
        )


class Form(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length="100")
    description = models.TextField(blank=True)

    objects = FormManager()

    @staticmethod
    def text(**kwargs):
        return ('append_text', kwargs)

    @staticmethod
    def choice(**kwargs):
        return ('append_choice', kwargs)

    @staticmethod
    def score_group(**kwargs):
        return ('append_score_group', kwargs)

    # TODO @atomic
    def submit_response(self, user, response_data):
        response = Response.objects.create(user=user, form=self)
        for i, question in enumerate(
                self.questions.order_by('order').select_subclasses()):
            question.save_response(response, response_data[i])
        return response

    # TODO @atomic?
    def append_text(self, **kwargs):
        return self._append(Text, **kwargs)

    # TODO @atomic?
    def append_choice(self, **kwargs):
        options = kwargs.pop('options')
        choice = self._append(Choice, **kwargs)
        options = [
            Option(
                question=choice,
                text=text,
                order=i + 1,
            )
            for i, text in enumerate(options)
        ]
        Option.objects.bulk_create(options)
        return choice

    # TODO @atomic
    def append_score_group(self, **kwargs):
        labels = kwargs.pop('labels')
        items = kwargs.pop('items')
        score_group = self._append(ScoreGroup, **kwargs)
        labels = [
            ScoreLabel.objects.create(
                question=score_group,
                label=label['label'],
                order=i + 1,
                default_score=label['default_score']
            )
            for i, label in enumerate(labels)
        ]
        for i, item in enumerate(items):
            if isinstance(item, basestring):
                scores = [None] * len(labels)
            else:
                item, scores = item['text'], item['scores']
            item = ScoreGroupItem.objects.create(
                question=score_group,
                text=item,
                order=i + 1,
            )
            scores = [
                Score(
                    item=item,
                    label=labels[j],
                    score=score,
                )
                for j, score in enumerate(scores)
            ]
            Score.objects.bulk_create(scores)
        return score_group

    def _append(self, question_class, **kwargs):
        if 'order' in kwargs:
            raise ValueError("Cannot manually specify order")
        questions = self.questions.order_by('-order')
        if questions.exists():
            order = questions[0].order + 1
        else:
            order = 1
        kwargs['order'] = order
        kwargs['form'] = self
        return question_class.objects.create(**kwargs)


# TODO sure I've seen use of MTI being discouraged but seems appropriate here
# (plus Martin Fowler suggests it as a valid approach)
class Question(models.Model):
    form = models.ForeignKey(Form, related_name="questions")
    # TODO we'll probably replace 'order' with a way to configure layout that allows grouping etc.
    order = models.PositiveIntegerField()
    question = models.CharField(max_length=255)
    is_required = models.BooleanField(default=False)

    objects = InheritanceManager()

    class Meta:
        unique_together = (
            ('form', 'order'),
            ('form', 'question'),
        )
        ordering = ('order',)
    

class Text(Question):
    is_multiline = models.BooleanField(default=False)
    max_chars = models.PositiveIntegerField(null=True, blank=True)
    max_words = models.PositiveIntegerField(null=True, blank=True)

    def save_response(self, response, data):
        # TODO validate?
        return TextAnswer.objects.create(
            question=self,
            response=response,
            answer=data
        )


class Choice(Question):
    is_multiple = models.BooleanField(default=False)
    has_other = models.BooleanField(default=False)
    other_text = models.CharField(max_length=255, blank=True)

    def save_response(self, response, data):
        if not data:
            return
        if self.is_multiple:
            answers = data
        else:
            answers = [data]
        for answer in answers:
            ChoiceAnswer.objects.create(
                response=response,
                option=Option.objects.get(
                    question=self,
                    text=answer
                )
            )


class Option(models.Model):
    question = models.ForeignKey(Choice, related_name="options")
    order = models.PositiveIntegerField()
    text = models.CharField(max_length=100)

    class Meta:
        unique_together = (
            ('question', 'order'),
            ('question', 'text')
        )
        ordering = ('order',)


class ScoreGroup(Question):
    def save_response(self, response, data):
        if data:
            for i, item in enumerate(self.items.order_by('order')):
                ScoreGroupAnswer.objects.create(
                    response=response,
                    item=item,
                    label=self.labels.get(label=data[i])
                )


class ScoreGroupItem(models.Model):
    question = models.ForeignKey(ScoreGroup, related_name="items")
    order = models.PositiveIntegerField()
    text = models.CharField(max_length=100)

    class Meta:
        unique_together = (
            ('question', 'order'),
            ('question', 'text'),
        )
        ordering = ('order',)


class ScoreLabel(models.Model):
    question = models.ForeignKey(ScoreGroup, related_name="labels")
    order = models.PositiveIntegerField()
    label = models.CharField(max_length="50")
    default_score = models.IntegerField()

    class Meta:
        unique_together = (
            ('question', 'order'),
            ('question', 'label'),
            ('question', 'default_score'),
        )
        ordering = ('order',)


class Score(models.Model):
    item = models.ForeignKey(ScoreGroupItem, related_name="scores")
    label = models.ForeignKey(ScoreLabel, related_name="scores")
    score = models.IntegerField(null=True, blank=True)

    class Meta:
        unique_together = ('item', 'label', 'score')


class Response(models.Model):
    form = models.ForeignKey(Form, related_name="responses")
    user = models.ForeignKey('users.User', related_name="answers")
    submitted_at = models.DateTimeField(auto_now_add=True)


class Answer(models.Model):
    response = models.ForeignKey(Response, related_name="answers")
    objects = InheritanceManager()


class TextAnswer(Answer):
    question = models.ForeignKey(Text)
    answer = models.TextField()


class ChoiceAnswer(Answer):
    option = models.ForeignKey(Option)


class ScoreGroupAnswer(Answer):
    item = models.ForeignKey(ScoreGroupItem, related_name="answers")
    label = models.ForeignKey(ScoreLabel, related_name="answers")
