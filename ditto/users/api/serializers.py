from rest_framework import serializers

from .. import models


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    def get_role(self, obj):
        # TODO encapsualte the role logic in one place
        # TODO this needs to be editable
        return obj.groups.all()[0].name
        
    class Meta:
        model = models.User
        fields = (
            'username',
            'first_name',
            'last_name',
            'email',
            'role',
            'bio'
        )
