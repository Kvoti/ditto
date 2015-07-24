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

    def create(self, *args, **kwargs):
        response = super(CommentList, self).create(*args, **kwargs)
        all_comments = Comment.objects.for_model(
            self.comment.content_object).order_by('-submit_date')
        serializer = CommentSerializer(
            all_comments, many=True)
        response.data = serializer.data
        return response
        
    def perform_create(self, serializer):
        self.comment = serializer.save(
            user=self.request.user,
            site=Site.objects.get_current(),
        )


from django.conf.urls import patterns, url
urlpatterns = patterns('',
    url(r'^$', CommentList.as_view(), name="create_comment"),
)
