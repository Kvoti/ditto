import collections

import floppyforms.__future__ as forms
from django.contrib.auth.models import Group, Permission
from django.contrib.sites.models import Site
from django.utils.translation import ugettext_lazy as _

import core
from users.models import User

from . import models
from . import utils


class BasicInfoForm(forms.ModelForm):
    class Meta:
        model = models.Config
        fields = (
            'theme',
            'type',
            'description',
            'size_cap',
        )

    def __init__(self, *args, **kwargs):
        try:
            config = models.Config.objects.all()[0]
        except IndexError:
            config = None
        kwargs['instance'] = config
        super(BasicInfoForm, self).__init__(*args, **kwargs)
        self.fields = collections.OrderedDict(
            [('name', forms.CharField(
                label=_("Name"),
                initial=Site.objects.all()[0].name,
                help_text=_("Type a name for network")
            ))] + self.fields.items()
        )

    def save(self):
        super(BasicInfoForm, self).save()
        site = Site.objects.all()[0]
        site.name = self.cleaned_data['name']
        site.save()


class RoleForm(forms.ModelForm):
    class Meta:
        model = Group
        fields = ('name',)


class BaseRoleFormSet(forms.models.BaseModelFormSet):
    def __init__(self, extra, *args, **kwargs):
        self.extra = extra
        super(BaseRoleFormSet, self).__init__(*args, **kwargs)
        self.queryset = Group.objects.exclude(name__in=core.DEFAULT_ROLES)

        
RoleFormSet = forms.models.modelformset_factory(
    Group,
    formset=BaseRoleFormSet,
    form=RoleForm)


class InteractionsForm(forms.Form):
    def __init__(self, *args, **kwargs):
        super(InteractionsForm, self).__init__(*args, **kwargs)
        grid = utils.get_role_grid()
        for role1, others in grid:
            for role2 in others:
                for interaction in models.Interaction.objects.all():
                    is_permitted = interaction.is_permitted(role1, role2)
                    name = '-'.join((interaction.name, role1, role2))
                    checkbox = forms.BooleanField(
                        required=False,
                        initial=is_permitted,
                    )
                    checkbox.interaction = interaction
                    checkbox.role1 = Group.objects.get(name=role1)
                    checkbox.role2 = Group.objects.get(name=role2)
                    self.fields[name] = checkbox
            
    def save(self):
        is_changed = False
        for name, value in self.cleaned_data.items():
            if self._is_changed(name, value):
                is_changed = True
                self._save_field(name, value)
        return is_changed

    def _is_changed(self, field, clean_value):
        return self.fields[field].initial != clean_value

    def _save_field(self, name, is_permitted):
        interaction = self.fields[name].interaction
        role1 = self.fields[name].role1
        role2 = self.fields[name].role2
        if is_permitted:
            interaction.allow(role1, role2)
        else:
            interaction.deny(role1, role2)


            
class PermissionsForm(forms.Form):
    def __init__(self, *args, **kwargs):
        super(PermissionsForm, self).__init__(*args, **kwargs)
        for role in Group.objects.all():
            for feature in models.Feature.objects.all():
                for permission in feature.permissions.all():
                    is_enabled = role.permissions.filter(
                        pk=permission.pk).exists()
                    name = '-'.join((role.name, feature.name, permission.name))
                    checkbox = forms.BooleanField(
                        required=False,
                        initial=is_enabled,
                    )
                    checkbox.role = role
                    checkbox.permission = permission
                    self.fields[name] = checkbox

    def save(self):
        for name, is_enabled in self.cleaned_data.items():
            role = self.fields[name].role
            permission = self.fields[name].permission
            if is_enabled:
                role.permissions.add(permission)
            else:
                role.permissions.remove(permission)


class ChatroomForm(forms.ModelForm):
    class Meta:
        model = models.Chatroom
        fields = ('open_time', 'close_time', 'close_message')


class CreateChatroomPermsForm(forms.Form):
    creator_roles = forms.ModelMultipleChoiceField(
        Group.objects.all(),
        label=_("Roles that can create chatrooms"),
        required=False
    )
    creator_users = forms.ModelMultipleChoiceField(
        User.objects.all(),
        label=_("Users that can create chatrooms"),
        required=False
    )
    
    def __init__(self, *args, **kwargs):
        creator_roles = Group.objects.filter(
            permissions__codename='create_chatroom')
        creator_users = User.objects.filter(
            user_permissions__codename='create_chatroom')
        kwargs['initial'] = {
            'creator_roles': creator_roles,
            'creator_users': creator_users,
        }
        super(CreateChatroomPermsForm, self).__init__(*args, **kwargs)

    def save(self):
        perm = Permission.objects.get(codename='create_chatroom')
        perm.user_set = self.cleaned_data['creator_users']
        perm.group_set = self.cleaned_data['creator_roles']
