from django.conf.urls import patterns, url
from rest_framework import serializers, generics, decorators, response

from . import models


class TextSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Text
        fields = (
            'is_multiline',
            'max_chars',
            'max_words',
        )


class ChoiceSerializer(serializers.ModelSerializer):
    options = serializers.SlugRelatedField(slug_field='text', read_only=True, many=True)

    class Meta:
        model = models.Choice
        fields = (
            'is_multiple',
            'has_other',
            'other_text',
            'options',
        )


class ScoreGroupItemSerializer(serializers.ModelSerializer):
    scores = serializers.SlugRelatedField(slug_field='score', read_only=True, many=True)

    class Meta:
        model = models.ScoreGroupItem
        fields = (
            'text',
            'scores',
        )


class ScoreLableSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.ScoreLabel
        fields = (
            'label',
            'default_score'
        )


class ScoreGroupSerializer(serializers.ModelSerializer):
    items = ScoreGroupItemSerializer(many=True)
    labels = ScoreLableSerializer(many=True)

    class Meta:
        model = models.ScoreGroup
        fields = (
            'items',
            'labels',
        )


class QuestionSerializer(serializers.ModelSerializer):
    text = TextSerializer()
    choice = ChoiceSerializer()
    scoregroup = ScoreGroupSerializer()

    class Meta:
        model = models.Question
        fields = (
            'question',
            'is_required',
            'text',
            'choice',
            'scoregroup',
        )


class FormSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)

    class Meta:
        model = models.Form
        fields = (
            'slug',
            'title',
            'questions',
        )


class FormList(generics.ListAPIView):
    queryset = models.Form.objects.all()
    serializer_class = FormSerializer


@decorators.api_view(['PUT'])
def form(request, slug):
    # For now just rip up and recreate the whole form when saving changes.
    # Should probably throw an error if the form has submissions.
    # In future we _might_ allow granular changes
    models.Form.objects.filter(slug=slug).delete()
    form = models.Form.objects.create_form_from_data(request.data)
    return response.Response(FormSerializer(form).data)


urlpatterns = patterns('',
    url(r'^$', FormList.as_view()),
    url(r'^(?P<slug>[\w\-]+)/$', form)
)
