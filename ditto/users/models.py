# -*- coding: utf-8 -*-
# Import the AbstractUser model
from django.contrib.auth.models import AbstractUser

# Import the basic Django ORM models library
from django.db import models

from django.utils.translation import ugettext_lazy as _

AVATARS = [
    "sunshine",
    "rocket",
    "skull",
    "zoom_lolly",
    "fried_egg",
    "flower",
    "super_mario",
    "ice_lolly",
    "panda",
    "hotdog",
    "popcorn",
    "melon",
    "monkey",
    "cupcake",
]

# Subclass AbstractUser
class User(AbstractUser):
    bio = models.TextField(blank=True)
    avatar = models.CharField(
        max_length="10",
        choices=zip(AVATARS, AVATARS),
        default="sunshine"
    )
    
    def __unicode__(self):
        return self.username

    class Meta(AbstractUser.Meta):
        permissions = (
            ('invite_user', 'Can invite a user'),
            ('guest', 'Guest permission'),
            ('assign_role', 'Can assign role'),
        )

    def custom_values(self):
        role = self.groups.all()[0]
        values = role.values
        return {
            'case_notes': values.case_notes_name,
            'post_session_feedback': values.post_session_feedback_name,
            'post_session_feedback_question': values.post_session_feedback_question
        }

    def role(self):
        return self.groups.all()[0]

# As registration forms as user-definable we need to store extra custom
# data. I read this:
# http://martinfowler.com/articles/schemaless/#relational-schemaless
# For now going with an attribute table.
# (though it's an anti-pattern
# http://schinckel.net/2014/08/26/avoiding-sql-antipatterns-using-django-(and-postgres)/
# )
# (the 4th option he mentions somewhere of runtime migrations is interesting,
# wonder if anyone does that...?)
# However postgres now has a json type that you can index and query so
# that might be better. Using the attribute table for now as we're stuck
# with mysql at rackspace (they don't fully support postgres)
# (though mysql, it seems, can do similar things with json
# https://www.percona.com/blog/2015/02/17/indexing-json-documents-for-efficient-mysql-queries-over-json-data/
# but not out of the box.
# 5th option is to model the custom data. The custom fields aren't completely arbitrary as
# there's a fixed list of question types that can be added. So we could have, say,
#
#     class Score(models.Model):
#         value = models.IntegerField()
#
#     class ScoreGroupAnswer(models.Model):
#         user = models.ForeignKey(User)
#         question = models.ForeignKey(ScoreGroup)
#         score = models.ForeignKey(Score)
#
# Could be that's the best way...
# We'll use this flat attribute table for ease/speed for now until we've
# thought about form building some more.
class UserDatumManager(models.Manager):
    def create_custom_data(self, user, data):
        # TODO fix saving multiple choices
        # (with postgres could save as array field. with mysql will have to
        # save a UserDatum per choice and account for that when querying)
        self.bulk_create([
            UserDatum(
                user=user,
                field_name=name,
                field_value=value)
            for name, value in data.items()
        ])

        
class UserDatum(models.Model):
    user = models.ForeignKey(User, related_name="custom_data")
    field_name = models.CharField(max_length=100)
    # TODO something other than TextField here?
    # Using that for now as custom reg form can have long text questions.
    # Might be that we split out indexable fields (say gender, ethnicity etc)
    # from free text fields. Dunno...
    field_value = models.TextField()

    objects = UserDatumManager()
