from rest_framework import serializers
from django.contrib.auth.models import Group

from .. import models

# TODO is there a right way to add the 'role' to the user data?
# SerializerMethodField is read-only.
# Using a Group serializer doesn't work as validation errors get raised.
class RoleField(serializers.Field):
    def to_representation(self, obj):
        return obj.name

    def to_internal_value(self, data):
        # TODO validation
        return Group.objects.get(name=data)
        
        
class UserSerializer(serializers.ModelSerializer):
    role = RoleField()

    def update(self, user, validated_data):
        if 'role' in validated_data:
            role = validated_data.pop('role')
        else:
            role = None
        user = super(UserSerializer, self).update(user, validated_data)
        if role:
            user.groups = [role]
        return user
    
    class Meta:
        model = models.User
        fields = (
            'username',
            'first_name',
            'last_name',
            'email',
            'role',
            'bio',
            'avatar',
        )
        read_only_fields = (
            'username',
            'first_name',
            'last_name',
            'email',
        )
