from django.conf.urls import patterns, url
from django.contrib.auth.models import Group
from rest_framework import serializers, generics, permissions


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('name',)
    

class RoleList(generics.ListAPIView):
    queryset = Group.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]

    
urlpatterns = patterns('',
    url(r'^roles/$', RoleList.as_view()),
)
