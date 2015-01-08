from django import template
from django.template.loader import get_template

from .. import models

register = template.Library()


@register.assignment_tag
def theme():
    try:
        theme = models.Config.objects.all()[0].theme
    except IndexError:
        theme = ""
    return theme


@register.assignment_tag
def features():
    # TODO features probably need ordering
    return models.Feature.objects.filter(is_active=True)


@register.inclusion_tag("engage/templatetags/nav_item.html", takes_context=True)
def navitem(context, slug, url, text):
    return {
        'url': url,
        'text': text,
        'active': slug in context['nav'] if 'nav' in context else False
    }


@register.tag(name="m")
def do_markup(parser, token):
    """Tag to wrap content in some standard markup.

    To keep the markup consistent we define a number of common page
    components that we reuse, rather than repeating the markup.

    It makes it easier to apply changes to components without having
    to find/replace.

    As a simple example, consider a row. Using bootstrap that's

        <div class="row"></div>

    What we don't want is that markup repeated everywhere. Eg

        <div class="row"></div>
        <div class="row"></div>
        <div class="row"></div>

    Instead we do

        {% m "row" %}{% endm %}
        {% m "row" %}{% endm %}
        {% m "row" %}{% endm %}

    It's almost as many characters but the detail of the markup is
    abstraced away meaning we can easily change every row should we
    need to (say we change framework).

    The tag has a short name, 'm', as it will be frequently used.

    """
    nodelist = parser.parse(('endm',))
    parser.delete_first_token()
    try:
        # split_contents() knows not to split quoted strings.
        tag_name, format_string = token.split_contents()
    except ValueError:
        raise template.TemplateSyntaxError(
            "%r tag requires a single argument" % token.contents.split()[0]
        )
    if not (format_string[0] == format_string[-1] and
            format_string[0] in ('"', "'")):
        raise template.TemplateSyntaxError(
            "%r tag's argument should be in quotes" % tag_name
        )
    return MarkupNode(format_string[1:-1], nodelist)


class MarkupNode(template.Node):
    def __init__(self, component, nodelist):
        self.nodelist = nodelist
        self.component = component
        
    def render(self, context):
        output = self.nodelist.render(context)
        file_name = "engage/markup/%s.html" % self.component
        t = get_template(file_name)
        return t.render(template.Context({
            'content': output,
        }))
