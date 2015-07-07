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
        'Business',
        'Social',
        'Charity',
        'Volunteer',
    )
    SIZES = (
        "100",
        "500",
        "1,000",
        "5,000",
        "10,000",
        "Uber",
    )
    
    theme = models.CharField(
        _("theme"),
        max_length=20, choices=zip(THEMES, THEMES), blank=True)
    type = models.CharField(
        _("type"),
        help_text=_("What sector are you?"),
        max_length=20, choices=zip(TYPES, TYPES)
    )
    description = models.TextField(
        _("description"),
        help_text=_("A brief description of your network"),
        blank=True,
    )
    size_cap = models.CharField(
        _("size cap"),
        max_length=10,
        help_text=_("How many people are you likely to have?"),
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


# Patch the Group model to add description instead of adding
# another model with a one to one field
from django.contrib.auth.models import Group
Group.add_to_class('description', models.TextField(blank=True))
