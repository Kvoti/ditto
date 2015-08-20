from rest_framework import generics

from .. import models
from . import serializers


class UserList(generics.ListAPIView):
    queryset = models.User.objects.all()
    serializer_class = serializers.UserSerializer
    #TODO permission_classes
