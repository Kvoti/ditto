from django.db import models


class CaseNoteQuerySet(models.QuerySet):
    def filter_for_viewer(self, viewer):
        if not viewer.has_perm('casenotes.view_casenote'):
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
    assigned_to = models.ForeignKey(
        'users.User', related_name="assigned_case_notes",
        null=True, blank=True
    )
    resolved = models.BooleanField(default=False)
    text = models.TextField()

    objects = CaseNoteQuerySet.as_manager()
    
    class Meta:
        permissions = (
            ('view_casenote', 'Can view case notes'),
        )
