from openticket.utils import TrackedMixin
from django.db import models
from venues.models import Seat, Event
from django.contrib.auth.models import User
from accounts.models import Organization


class Ticket(TrackedMixin, models.Model):
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    price = models.FloatField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, default=None)

    class Meta:
        unique_together = ("seat", "event")

    def get_owner(self) -> User | Organization:
        if self.owner is None:
            return self.seat.event.venue.organization
        return self.owner
