from django.db import models

import tickets.models


class CaseNoteQuerySet(models.QuerySet):
    def filter_for_viewer(self, viewer):
        if viewer.is_anonymous():
            return self.none()
        elif not viewer.has_perm('casenotes.view_casenote'):
            query = models.Q(shared_with_users=viewer) | models.Q(author=viewer)
            for group in viewer.groups.all():
                query |= models.Q(shared_with_roles=group)
            return self.filter(query)
        else:
            return self
    

class CaseNote(models.Model):
    author = models.ForeignKey(
        'users.User', related_name="authored_case_notes")
    created_at = models.DateTimeField(auto_now_add=True)
    client = models.ForeignKey('users.User', related_name="case_notes")
    shared_with_roles = models.ManyToManyField(
        'auth.Group', related_name="case_notes", blank=True)
    shared_with_users = models.ManyToManyField(
        'users.User', related_name="shared_case_notes", blank=True)
    title = models.CharField(max_length=100)
    text = models.TextField()

    objects = CaseNoteQuerySet.as_manager()
    
    class Meta:
        permissions = (
            ('view_casenote', 'Can view case notes'),
            ('manage_casenote', 'Can manage case notes'),
        )

    def save(self, *args, **kwargs):
        super(CaseNote, self).save(*args, **kwargs)
        tickets.models.Ticket.objects.create_ticket(self)
