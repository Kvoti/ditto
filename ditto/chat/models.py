from django.db import models


class Session(models.Model):
    session_id = models.CharField(max_length=50, unique=True)


class SessionRating(models.Model):
    CHOICES = (
        (0, 'Very poor'),
        (1, 'poor'),
        (2, 'OK'),
        (3, 'Good'),
        (4, 'Very good'),
    )        
    session = models.ForeignKey(Session, related_name="ratings")
    user = models.ForeignKey('users.User', related_name="session_ratings")
    rating = models.IntegerField(choices=CHOICES, null=True)

    class Meta:
        unique_together = ('session', 'user')
