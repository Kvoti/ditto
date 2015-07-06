from django.conf.urls import patterns, url
from django.contrib.auth.models import Group
from rest_framework import generics, serializers, filters, permissions

from users.models import User
from . import models


class CaseNoteSerializer(serializers.ModelSerializer):
    author = serializers.SlugRelatedField(slug_field='username', read_only=True)
    client = serializers.SlugRelatedField(slug_field='username', read_only=True)
    
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


class CreateCaseNoteSerializer(serializers.ModelSerializer):
    client = serializers.SlugRelatedField(slug_field='username',
                                          # TODO can we restrict to clients?
                                          queryset=User.objects.all()
    )
    shared_with_roles = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Group.objects.all(),
        many=True
    )
    shared_with_users = serializers.SlugRelatedField(
        slug_field='username',
        # TODO probably shouldn't allow *all* users here?
        queryset=User.objects.all(),
        many=True
    )
    
    class Meta:
        model = models.CaseNote
        fields = (
            'client',
            'shared_with_roles',
            'shared_with_users',
            'text'
        )


class CaseNotesList(generics.ListCreateAPIView):
    queryset = models.CaseNote.objects.none()  # required for model perms
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('client__username',)
    permission_classes = [permissions.DjangoModelPermissions]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateCaseNoteSerializer
        else:
            return CaseNoteSerializer

    def get_queryset(self):
        return models.CaseNote.objects.filter_for_viewer(self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
        

urlpatterns = patterns('',
    url(r'^$', CaseNotesList.as_view()),
)
