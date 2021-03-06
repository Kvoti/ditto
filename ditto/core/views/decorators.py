import wrapt

from django.contrib.auth.decorators import permission_required

admin_required = permission_required('users.can_admin', raise_exception=True)


def nav(nav, back=None):
    """Decorator for setting navigation state.

    E.g.

    @nav(['dash', 'settings'])
    def my_view(request):
        ...
    """
    @extra_context
    def wrapper(request, context):
        context['nav'] = nav
        context['back'] = back
    return wrapper


# Let's you decorate a function to turn *it* into a decorator that can
# be applied to a view function to modify the context of the
# (template) response. An example is infinitely clearer!
#
#     @extra_context
#     def modify_context(request, context):
#         context['some key'] = 'some value'
#
#     @modify_context
#     def my_view(request):
#         .
#         .
#         .
#         return TemplateResponse(request, ...)
#
# (Don't ask how this works!)
@wrapt.decorator
def extra_context(wrapped, instance, args, kwargs):
    @wrapt.decorator
    def _wrapper(i_wrapped, i_instance, i_args, i_kwargs):
        template_response = i_wrapped(*i_args, **i_kwargs)
        if hasattr(template_response, 'context_data'):
            wrapped(i_args[0], template_response.context_data)
        return template_response
        
    view = args[0]
    return _wrapper(view)
