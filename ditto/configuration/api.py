from django.conf.urls import patterns, url
from django.contrib.auth.models import Group
from rest_framework import serializers, generics, permissions

from . import models


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('name',)
    

class RoleList(generics.ListAPIView):
    queryset = Group.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]  # TODO IsAdmin


class ValuesSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Values
        fields = (
            'case_notes_name',
            'post_session_feedback_name',
            'post_session_feedback_question'
        )


class ValuesView(generics.RetrieveUpdateAPIView):
    queryset = models.Values.objects.all()
    serializer_class = ValuesSerializer
    permission_classes = [permissions.IsAuthenticated]  # TODO IsAdmin
    

    
    
urlpatterns = patterns('',
    url(r'^roles/$', RoleList.as_view()),
    url(r'^values/(?P<pk>\d+)/$', ValuesView.as_view()),
)
