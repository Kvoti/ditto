from django_comments.views.comments import post_comment
from django_comments.models import Comment
from rest_framework import serializers, decorators, status
from rest_framework.response import Response


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.SlugRelatedField(slug_field='username', read_only=True)
    
    class Meta:
        model = Comment
        fields = (
            'id',
            'user',
            'comment',
            'submit_date',
        )


@decorators.api_view(['GET', 'POST'])
def create_comment(request):
    if request.method == 'GET':
        serializer = CommentSerializer(
            Comment.objects.all().order_by('-submit_date'),  # TODO filter for current object!
            many=True
        )
        return Response(serializer.data)
    else:
        # Ugly, ugly wrapping of comment app view to handle validation
        # of data
        request.POST = request.data
        response = post_comment(request)
        if response.status_code == 302:
            # TODO not sure about returning list of comments here.
            # By default rest_framework returns the newly created object.
            # But in the UI it makes sense to retrieve the latest comment
            # list when a new comment is submitted (until and unless we use
            # pubsub for real time updates)
            serializer = CommentSerializer(
                Comment.objects.all().order_by('-submit_date'),  # TODO filter for current object!
                many=True
            )
            return Response(serializer.data)
        import ipdb; ipdb.set_trace()
        return Response({'detail': 'form data invalid'},
                        status=status.HTTP_400_BAD_REQUEST)


from django.conf.urls import patterns, url
urlpatterns = patterns('',
    url(r'^$', create_comment, name="create_comment"),
)
