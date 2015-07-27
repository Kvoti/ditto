from django.db import models
from . import question


class AbstractAnswer(models.Model):
    # TODO use MTI and have a question FK here?
    user = models.ForeignKey('users.User', related_name="answers")
    submitted_at = models.DateTimeField(auto_add_now=True)

    class Meta:
        abstract = True
        
    
class TextAnswer(AbstractAnswer):
    question = models.ForeignKey(question.Text)
    answer = models.TextField()


class ChoiceAnswer(AbstractAnswer):
    option = models.ForeignKey(question.Option)


class ScoreGroupAnswer(AbstractAnswer):
    score = models.ForeignKey(question.Score)
