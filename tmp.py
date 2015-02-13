@ContextMixin
class Nav(object):
    def process_context(self, context):
        pass
    
def ContextMixin(cls):



@context_mixin
def process_context(self, context):
    pass


def context_mixin(func):
    class ChatAuthMixin(object):
        def get_context_data(self, **kwargs):
            context = super(ChatAuthMixin, self).get_context_data(**kwargs)
            func(context)
            return context
    return ChatAuthMixin
