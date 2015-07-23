from django.contrib.contenttypes.models import ContentType
from django.contrib.sites.models import Site
from django_comments.models import Comment
from rest_framework import serializers, generics, filters


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.SlugRelatedField(slug_field='username', read_only=True)
    content_type = serializers.SlugRelatedField(
        slug_field='model',
        queryset=ContentType.objects.all())

    class Meta:
        model = Comment
        fields = (
            'id',
            'content_type',
            'object_pk',
            'user',
            'comment',
            'submit_date',
        )
        read_only_fields = ('user', 'id', 'submit_date')

    # TODO validate object_pk
    # def validate():
    #     pass


class CommentList(generics.ListCreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('content_type__model', 'object_pk')
    
    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            site=Site.objects.get_current(),
        )

    # TODO customise create response to list all case notes


from django.conf.urls import patterns, url
urlpatterns = patterns('',
    url(r'^$', CommentList.as_view(), name="create_comment"),
)
