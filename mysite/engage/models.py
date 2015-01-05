from django.db import models


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
