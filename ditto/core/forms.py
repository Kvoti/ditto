def autofocus(form, field_name):
    form.fields[field_name].widget.attrs['autofocus'] = 'autofocus'
    

class UserModelFormMixin(object):
    def __init__(self, user, *args, **kwargs):
        super(UserModelFormMixin, self).__init__(*args, **kwargs)
        self.instance.user = user
