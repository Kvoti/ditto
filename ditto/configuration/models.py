from django.core.exceptions import ValidationError
from django.core import validators
from django.db import models
from django.utils.translation import ugettext_lazy as _


class Feature(models.Model):
    name = models.CharField(_('name'), max_length=100)
    slug = models.SlugField(_('slug'))
    permissions = models.ManyToManyField(
        'auth.Permission', verbose_name=_('permissions'))
    # default is_active to True so any fresh instance has everything
    # turned on
    is_active = models.BooleanField(_('is active'), default=True)


class Config(models.Model):
    THEMES = (
        'cerulean',
        'cosmo',
        'cyborg',
        'darkly',
        'flatly',
        'journal',
        'lumen',
        'paper',
        'readable',
        'sandstone',
        'simplex',
        'slate',
        'spacelab',
        'superhero',
        'united',
        'yeti'
    )
    TYPES = (
        'Charity',
        'Not For Profit',
        'Social Enterprise',
        'NGO',
        'Sole Proprietor',
        'Partnership',
        'Cooperative',
        'Small Business',
        'Corporation',
        'Government Agency',
    )
    SIZES = (
        "100",
        "250",
        "500",
        "1000",
        "1000+",
    )
    
    theme = models.CharField(
        _("theme"),
        max_length=20, choices=zip(THEMES, THEMES), blank=True)
    type = models.CharField(
        _("type"),
        help_text=_("What type of organisation are you?"),
        max_length=20, choices=zip(TYPES, TYPES),
        default='Charity'
    )
    description = models.TextField(
        _("description"),
        help_text=_("A brief description of your network"),
        blank=True,
    )
    size_cap = models.CharField(
        _("size cap"),
        max_length=10,
        help_text=_("How many people are you likely to have on your Kvoti network?"),
        choices=zip(SIZES, SIZES)
    )


class Interaction(models.Model):
    name = models.CharField(_('name'), max_length=20)

    def is_permitted(self, role1, role2):
        return self._get_permission(role1, role2).exists()

    def allow(self, role1, role2):
        if not self.is_permitted(role1, role2):
            PermittedInteraction.objects.create(
                interaction=self,
                role1=role1,
                role2=role2
            )

    def deny(self, role1, role2):
        self._get_permission(role1, role2).delete()

    def _get_permission(self, role1, role2):
        return PermittedInteraction.objects.filter(
            interaction=self
        ).filter(
            models.Q(role1__name=role1, role2__name=role2) |
            models.Q(role1__name=role2, role2__name=role1)
        )

        
class PermittedInteraction(models.Model):
    interaction = models.ForeignKey('Interaction', related_name="permitted", verbose_name=_('interaction'))
    role1 = models.ForeignKey('auth.Group', related_name="permitted_interactions_1", verbose_name=_('role 1'))
    role2 = models.ForeignKey('auth.Group', related_name="permitted_interactions_2", verbose_name=_('role 2'))
    
    class Meta:
        unique_together = ('interaction', 'role1', 'role2')


class RegForm(models.Model):
    role = models.ForeignKey('auth.Group', related_name="reg_forms")
    form = models.ForeignKey('dittoforms.FormSpec')


# Note would like to just add a 'description' field to auth.Group but
# modifying external apps is tricky. It seemed to work until upgrading
# to Django 1.8. Decided then it was best not to hack things and just
# live with having to add a new table.
class GroupDescription(models.Model):
    group = models.OneToOneField('auth.Group', related_name="description")
    text = models.TextField(blank=True)


class Values(models.Model):
    """Ad-hoc values that can be customised."""
    role = models.OneToOneField('auth.Group', related_name="values")
    case_notes_name = models.CharField(
        max_length=200,
        default="case notes"
    )
    post_session_feedback_name = models.CharField(
        max_length=200,
        default="post-session feedback"
    )
    post_session_feedback_question = models.TextField(
        default="How useful did you find the support given to you today?"
    )
