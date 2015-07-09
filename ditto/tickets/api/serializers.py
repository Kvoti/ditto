from django.core.urlresolvers import reverse
from rest_framework import serializers

from casenotes.api import CaseNoteSerializer

from .. import models


class ViewTicketSerializer(serializers.ModelSerializer):
    case_note = CaseNoteSerializer()
    claim_url = serializers.SerializerMethodField()
    resolve_url = serializers.SerializerMethodField()
    assigned_to = serializers.SlugRelatedField(slug_field='username', read_only=True)
    
    def get_claim_url(self, obj):
        return reverse('ditto:ticket_claim', args=(obj.pk,))
    
    def get_resolve_url(self, obj):
        return reverse('ditto:ticket_resolve', args=(obj.pk,))
    
    class Meta:
        model = models.Ticket
        fields = (
            'claim_url',
            'resolve_url',
            'created_at',
            'assigned_to',
            'is_resolved',
            'case_note',
        )
