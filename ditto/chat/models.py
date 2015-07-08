from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q, F
from django.utils.timezone import now, localtime
from django.utils.translation import ugettext_lazy as _

from users.models import User


class Room(models.Model):
    """A chatroom

    There are two types of chatroom
        - those that have a regular schedule of hours
        - one-off chatrooms that open for some hours on a certain day

    Both types of room can be made private by restricting to certain roles
    and/or users.

    """
    slug = models.SlugField(primary_key=True)
    name = models.CharField(max_length=50)
    is_regular = models.BooleanField(default=False)
    
    # a one-off room needs to have a start and end time
    start = models.DateTimeField(null=True, blank=True)
    end = models.DateTimeField(null=True, blank=True)

    # specifying roles and/or users makes this a private room
    roles = models.ManyToManyField(
        'auth.Group', related_name="chatrooms", blank=True)
    users = models.ManyToManyField(
        'users.User', related_name="chatrooms", blank=True)
    
    close_message = models.CharField(
        max_length=200,
        default=_("The chatroom is now closed.")
    )

    # These two fields track the state of the room in the chat server.
    # For now we're running a cron every minute that checks which rooms
    # should be open and closed. We record the state here so we know next
    # time whether a room needs to be opened or closed.
    is_opened = models.BooleanField(default=False)
    is_closed = models.BooleanField(default=False)

    class Meta:
        permissions = (
            # A single permission that let's you perform all room related actions
            ('configure_chatroom', 'Can configure chatrooms'),
        )
        
    def clean(self):
        if (
                self.start and not self.end or
                self.end and not self.start
        ):
            raise ValidationError(_('Please specify both open and close times'))

    def is_open(self):
        if self.is_regular:
            return self._is_regular_room_open()
        else:
            return self._is_one_off_room_open()

    def members(self):
        return self.users.all() | User.objects.filter(groups__in=self.roles.all())

    def _is_regular_room_open(self):
        # TODO this feels massively flakey and surely doesn't do the
        # right thing around clock change (will have to change anyway
        # when Slot model changes from (day, start, end) to ((day,
        # start), (day, end)) [probably])
        localnow = localtime(now())
        weekday = localnow.weekday()
        yesterday = (weekday - 1) % 7
        time = localnow.hour + localnow.minute / 60.0
        return self.slots.filter(
            # |   s--t------e       |
            Q(day=weekday, start__lt=F('end'), start__lte=time, end__gt=time) |
            # |----e    s----t------|
            Q(day=weekday, start__gt=F('end'), start__lte=time) |
            # |--t--e               |
            Q(day=yesterday, start__gt=F('end'), end__gt=time)
        ).count()

    def _is_one_off_room_open(self):
        return self.start <= now() <= self.end


# TODO specify slot as a pair of (day, hour) tuples. Currently a bit inflexible
# assuming a slot finishes the following day
class Slot(models.Model):
    """A time slot when the referenced chatroom is open.

    Specified as

       - a day of the week
       - an opening hour
       - a closing hour

    For example

    >>> RoomSlot(Slot.Monday, 8, 2)

    Note closing times can be the following day for slots that span midnight.
    So, in the above configuration, the room is open on Mondays from 8am to
    2am the following morning.

    """
    # TODO neater way to specify these (e.g. use calendar for days?)?
    Monday = 0
    Tuesday = 1
    Wednesday = 2
    Thursday = 3
    Friday = 4
    Saturday = 5
    Sunday = 6
    DAY_CHOICES = (
        (Monday, 'Monday'),
        (Tuesday, 'Tuesday'),
        (Wednesday, 'Wednesday'),
        (Thursday, 'Thursday'),
        (Friday, 'Friday'),
        (Saturday, 'Saturday'),
        (Sunday, 'Sunday')
    )
    HOUR_CHOICES = [(i,  i) for i in range(24)]
    ############
    room = models.ForeignKey(Room, related_name="slots")
    day = models.IntegerField(choices=DAY_CHOICES)
    start = models.IntegerField(choices=HOUR_CHOICES)
    end = models.IntegerField(choices=HOUR_CHOICES)


class Session(models.Model):
    session_id = models.CharField(max_length=50, unique=True)


class SessionRating(models.Model):
    CHOICES = (
        (0, 'Very poor'),
        (1, 'poor'),
        (2, 'OK'),
        (3, 'Good'),
        (4, 'Very good'),
    )        
    session = models.ForeignKey(Session, related_name="ratings")
    user = models.ForeignKey('users.User', related_name="session_ratings")
    rating = models.IntegerField(choices=CHOICES, null=True)

    class Meta:
        unique_together = ('session', 'user')
