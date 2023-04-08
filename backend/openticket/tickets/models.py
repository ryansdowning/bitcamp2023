from openticket.utils import TrackedMixin
from django.db import models
from venues.models import Seat, Event


class Ticket(TrackedMixin, models.Model):
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    price = models.FloatField()
    
