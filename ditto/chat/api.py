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

    def validate(self, data):
        start = data.get('start')
        end = data.get('end')
        slots = data.get('slots')
        if (start and not end or
            end and not start):
            raise serializers.ValidationError('Please specify both start and end times')
        if (start and start > end):
            raise serializers.ValidationError('End time must be after start time')
        if (start and slots):
            raise serializers.ValidationError('Please specify either start/end time or slots')
            
        return data

    def create(self, validated_data):
        slots_data = []
        if 'slots' in validated_data:
            # TODO validate slots don't overlap each other
            slots_data = validated_data.pop('slots')
        if 'users' in validated_data:
            validated_data.pop('users')
        if 'roles' in validated_data:
            validated_data.pop('roles')
        room = models.Room.objects.create(**validated_data)
        for slot_data in slots_data:
            models.Slot.objects.create(room=room, **slot_data)
        return room
    
    #TODO update

    
class RoomViewSet(viewsets.ModelViewSet):
    queryset = models.Room.objects.all()
    serializer_class = RoomSerializer
    #permission_classes  #TODO admin only?

router = routers.DefaultRouter()
router.register(r'rooms', RoomViewSet)

urlpatterns = patterns('',
    url(r'^', include(router.urls)),
)
