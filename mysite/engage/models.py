from django.db import models
from django.utils.translation import ugettext_lazy as _
    


class Feature(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField()
    permissions = models.ManyToManyField('auth.Permission')
    # default is_active to True so any fresh instance has everything
    # turned on
    is_active = models.BooleanField(default=True)
    
    class Meta:
        # TODO put these here for now until we have the right model/app to hang them off
        permissions = (
            ('view_post', 'Can view blog post'),
            ('add_post', 'Can add blog post'),
            ('change_post', 'Can change blog post'),
            ('delete_post', 'Can delete blog post'),
            ('moderate_post', 'Can moderate blog post'),
            
            ('can_message', 'Can send message'),
        )


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
    SIZES = (1000, 5000, 10000)
    
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
    size_cap = models.IntegerField(
        _("size cap"),
        help_text=_("How many people are you likely to have?"),
        choices=zip(SIZES, SIZES)
    )
