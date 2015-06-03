from django.conf.urls import patterns, url, include
from django.contrib.auth.decorators import login_required

from users.models import User

from . import models
from . import views

from rest_framework import routers, serializers, viewsets, generics, mixins


class CreateSessionRatingSerializer(serializers.ModelSerializer):
    # session = serializers.SlugRelatedField(read_only=True, slug_field='session_id')
    user = serializers.SlugRelatedField(
        slug_field='username',
        queryset=User.objects.all()
    )
    
    class Meta:
        model = models.SessionRating
        fields = ('user', 'rating')

        

class SessionSerializer(serializers.HyperlinkedModelSerializer):
    ratings = CreateSessionRatingSerializer(many=True)
    
    class Meta:
        model = models.Session
        fields = ('session_id', 'ratings')

    def create(self, validated_data):
        ratings_data = validated_data.pop('ratings')
        session = models.Session.objects.create(**validated_data)
        for rating_data in ratings_data:
            user = User.objects.get(username=rating_data['user'])
            models.SessionRating.objects.create(session=session, **rating_data)
        return session

    #TODO def update
    # allow rating objects to be updated

    
# ViewSets define the view behavior.
class CreateSession(generics.CreateAPIView):
    serializer_class = SessionSerializer
    
# # Routers provide an easy way of automatically determining the URL conf.
# router = routers.DefaultRouter()
# router.register(r'ratings', UserViewSet)


# Only need to be able to retrieve and update rating for a given user and session
class RetrieveUpdateViewSet(mixins.RetrieveModelMixin,
                            mixins.UpdateModelMixin,
                            viewsets.GenericViewSet):
    pass


class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SessionRating
        fields = ('rating',)
        

class RatingViewSet(RetrieveUpdateViewSet):
    serializer_class = RatingSerializer
    queryset = models.SessionRating.objects.none()
    lookup_field = 'session__session_id'

    def get_queryset(self):
        user = self.request.user
        return user.session_ratings.all()
    
router = routers.DefaultRouter()
router.register(r'ratings', RatingViewSet)

urlpatterns = patterns('',
    url(r'^', include(router.urls)),

    url(r'^ratings/$', CreateSession.as_view()),
                       
    url(
        regex=r'^messages/$',
        view=login_required(
            views.TemplateView.as_view(
                template_name="index.html"
            ),
        ),
        name='private_chats'
    ),
                       
    url(
        regex=r'^sessions/$',
        view=login_required(
            views.TemplateView.as_view(
                template_name="index.html"
            ),
        ),
        name='sessions'
    ),
                       
    url(
        # TODO not sure what url to use for chat threads yet, maybe a hash of the participants and subject?
        # for now using the hacky threadID in the chat app that needs fixing
        regex=r'^(?:messages|sessions)/[^/]+/',
        view=login_required(
            views.TemplateView.as_view(
                template_name="index.html"
            ),
        ),
    ),

    url(
        regex=r'^chatroom/new/$',
        view=views.new_chatroom,
        name='new-chatroom'
    ),
                       
    url(
        regex=r'^chatroom/(?:(\w+)/)?$',
        view=views.ChatroomView.as_view(),
        name='chatroom'
    ),
)
