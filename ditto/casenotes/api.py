from django.conf.urls import patterns, url, include
from rest_framework import generics, serializers

from . import models


class CaseNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CaseNote
        fields = (
            'author',
            'client',
            'created_at',
            'shared_with_roles',
            'shared_with_users',
            'assigned_to',
            'resolved',
            'text'
        )

        
class CaseNotesList(generics.ListAPIView):
    serializer_class = CaseNoteSerializer
    queryset = models.CaseNote.objects.all()
    

urlpatterns = patterns('',
    url(r'^$', CaseNotesList.as_view()),
)
