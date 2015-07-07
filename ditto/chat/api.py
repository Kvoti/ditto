from django.conf.urls import patterns, url, include
from django.contrib.auth.models import Group, Permission
from rest_framework import routers, serializers, viewsets, generics, mixins, response, status, views

from users.models import User

from . import models


class NestedSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Slot
        fields = ('day', 'start', 'end')


class RoomSerializer(serializers.ModelSerializer):
    slots = NestedSlotSerializer(many=True, read_only=True)
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
            'is_regular',
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
        # TODO can I still validate this here
        # if (start and slots):
        #     raise serializers.ValidationError('Please specify either start/end time or slots')
        return data


class UpdateRoomSerializer(serializers.ModelSerializer):
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
            'start',
            'end',
            'users',
            'roles',
        )

    def validate(self, data):
        start = data.get('start')
        end = data.get('end')
        if (start and not end or
            end and not start):
            raise serializers.ValidationError('Please specify both start and end times')
        if (start and start > end):
            raise serializers.ValidationError('End time must be after start time')
        return data
    
# TODO not sure if I need separate read/write serializers (can I leave 'room' of the field list here?)
class SlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Slot
        fields = ('id', 'room', 'day', 'start', 'end')

    #TODO validate no overlaps


class UpdateSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Slot
        # We don't allow the room to be changed once a slot is created
        fields = ('day', 'start', 'end')


#TODO class ValidateSlotMixin
    
    
class RoomViewSet(viewsets.ModelViewSet):
    queryset = models.Room.objects.all()
    serializer_class = RoomSerializer
    #permission_classes  #TODO admin only?
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UpdateRoomSerializer
        return RoomSerializer

    
class SlotViewSet(viewsets.ModelViewSet):
    queryset = models.Slot.objects.all()
    # serializer_class = SlotSerializer
    #permission_classes  #TODO admin only?

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UpdateSlotSerializer
        return SlotSerializer

    
router = routers.DefaultRouter()
router.register(r'rooms', RoomViewSet)
router.register(r'slots', SlotViewSet)

urlpatterns = patterns('',
    url(r'^', include(router.urls)),
)
