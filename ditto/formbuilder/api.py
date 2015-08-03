from django.conf.urls import patterns, url
from rest_framework import serializers, generics

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


class ScoreGroupSerializer(serializers.ModelSerializer):
    items = ScoreGroupItemSerializer(many=True)
    labels = serializers.SlugRelatedField(slug_field='label', read_only=True, many=True)

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
            'id',
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


urlpatterns = patterns('',
    url(r'^', FormList.as_view()),
)
