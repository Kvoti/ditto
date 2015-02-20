import floppyforms.__future__ as forms

from users.models import User


class NewChatroomForm(forms.Form):
    name = forms.CharField()
    participants = forms.ModelMultipleChoiceField(User.objects.all())
    # open_from = ?
    # open_until = ?

    def __init__(self, user, *args, **kwargs):
        super(NewChatroomForm, self).__init__(*args, **kwargs)
        self.fields['participants'].queryset = User.objects.exclude(pk=user.pk)
