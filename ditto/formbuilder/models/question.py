from django.db import models


class Form(models.Model):
    slug = models.SlugField()
    title = models.CharField(max_length="100")
    description = models.TextField(blank=True)
    

# TODO could be useful to make this concrete and use MTI?
class AbstractQuestion(models.Model):
    form = models.ForeignKey(Form, related_name="questions")
    # TODO we'll probably replace 'order' with a way to configure layout that allows grouping etc.
    order = models.PositiveIntegerField()
    question = models.CharField(max_length=255)
    is_required = models.BooleanField(default=False)

    class Meta:
        abstract = True
        

class Text(AbstractQuestion):
    is_multiline = models.BooleanField(default=False)
    max_chars = models.PositiveIntegerField(null=True, blank=True)
    max_words = models.PositiveIntegerField(null=True, blank=True)


class Choice(AbstractQuestion):
    is_multiple = models.BooleanField(default=False)
    has_other = models.BooleanField(default=False)
    other_text = models.CharField(max_length=255)


class Option(models.Model):
    question = models.ForeignKey(Choice, related_name="options")
    order = models.PositiveIntegerField()
    text = models.CharField(max_length=100)


class ScoreGroup(AbstractQuestion):
    pass


class ScoreGroupItem(models.Model):
    question = models.ForeignKey(Choice, related_name="items")
    order = models.PositiveIntegerField()
    text = models.CharField(max_length=100)


class ScoreLabel(models.Model):
    question = models.ForeignKey(ScoreGroup, related_name="labels")
    order = models.PositiveIntegerField()
    label = models.CharField(max_length="50")

    
class Score(models.Model):
    question = models.ForeignKey(ScoreGroup, related_name="scores")
    label = models.ForeignKey(ScoreLabel, related_name="scores")
    score = models.IntegerField()

    class Meta:
        unique_together = ('question', 'label')
