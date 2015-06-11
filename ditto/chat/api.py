from django.conf.urls import patterns, url, include
from django.contrib.auth.models import Group
from rest_framework import routers, serializers, viewsets, generics, mixins

from users.models import User

from . import models


class SlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Slot
        fields = ('day', 'start', 'end')


class RoomSerializer(serializers.ModelSerializer):
    slots = SlotSerializer(many=True, required=False)
    users = serializers.SlugRelatedField(
        many=True,
        queryset=User.objects.all(),
        slug_field='username',
        required=False
    )
    roles = serializers.SlugRelatedField(
        many=True,
        queryset=Group.objects.all(),
        slug_field='name',
        required=False
    )
    
    class Meta:
        model = models.Room
        fields = (
            'slug',
            'name',
            'start',
            'end',
            'slots',
            'users',
            'roles',
        )

    #TODO validation
    # - room is either one off or regular
    # - slots don't overlap each other

    
class RoomViewSet(viewsets.ModelViewSet):
    queryset = models.Room.objects.all()
    serializer_class = RoomSerializer
    #permission_classes

router = routers.DefaultRouter()
router.register(r'rooms', RoomViewSet)

urlpatterns = patterns('',
    url(r'^', include(router.urls)),
)
