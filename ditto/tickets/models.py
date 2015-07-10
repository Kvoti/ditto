from django.db import models


class TicketManager(models.Manager):
    use_for_related_fields = True
    
    def create_ticket(self, case_note):
        return self.create(
            case_note=case_note
        )

    def unclaimed(self):
        return self.filter(assigned_to__isnull=True)

    def unresolved(self):
        return self.filter(is_resolved=False)
        
        
class Ticket(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    assigned_to = models.ForeignKey(
        'users.User',
        null=True, blank=True,
        related_name="assigned_tickets"
    )
    is_resolved = models.BooleanField(default=False)

    # Note here we're *not* using generic relations. From experience
    # they usually turn out to be a pain. So we have a foreign key for
    # each model we want to associate a ticket to. Of course this
    # might turn out to raise its own problems. Let's see...
    case_note = models.OneToOneField('casenotes.CaseNote', related_name="tickets")

    objects = TicketManager()
    
    def claim(self, assign_to):
        if self.assigned_to:
            raise ValueError("Ticket already claimed")
        self.assigned_to = assign_to
        self.save()

    def resolve(self, user):
        if self.is_resolved:
            raise ValueError("Ticket already resolved")
        elif not self.assigned_to:
            raise ValueError("Ticket is unassigned")
        elif user != self.assigned_to:
            raise ValueError("Ticket is claimed by another user")
        self.is_resolved = True
        self.save()
