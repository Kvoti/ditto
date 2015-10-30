from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .. import models
from . import serializers
from .permissions import IsMeOrAdminOrReadOnly


class UserList(generics.ListAPIView):
    queryset = models.User.objects.all()
    serializer_class = serializers.UserSerializer
    permission_classes = (IsAuthenticated, IsMeOrAdminOrReadOnly)


class UserDetail(generics.RetrieveUpdateAPIView):
    # TODO limit queryset depending on who's asking?
    queryset = models.User.objects.all()
    serializer_class = serializers.UserSerializer
    lookup_field = 'username'
    permission_classes = (IsAuthenticated, IsMeOrAdminOrReadOnly)
