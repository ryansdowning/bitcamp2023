from openticket.utils import IsAuthenticatedView, UnauthenticatedReadMixin, READ_ACTIONS
from venues.models import Event, Venue, Seat
from venues.serializers import EventSerializer, VenueSerializer, SeatSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.viewsets import ModelViewSet


class VenueView(UnauthenticatedReadMixin, ModelViewSet):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["organization", "name", "location"]

    def get_queryset(self):
        if self.request is None:
            return self.queryset.none()
        if self.action in READ_ACTIONS:
            return self.queryset
        if self.request.user.member is None:
            return self.queryset.none()
        return self.queryset.filter(organization=self.request.user.member.organization)


class EventView(UnauthenticatedReadMixin, ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["venue", "venue__organization", "datetime"]

    def get_queryset(self):
        if self.request is None:
            return self.queryset.none()
        if self.action in READ_ACTIONS:
            return self.queryset
        if self.request.user.member is None:
            return self.queryset.none()
        return self.queryset.filter(venue__organization=self.request.user.member.organization)


class SeatView(UnauthenticatedReadMixin, ModelViewSet):
    queryset = Seat.objects.all()
    serializer_class = SeatSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["identifier", "event", "event__venue", "event__venue__organization", "event__datetime"]

    def get_queryset(self):
        if self.request is None:
            return self.queryset.none()
        if self.action in READ_ACTIONS:
            return self.queryset
        if self.request.user.member is None:
            return self.queryset.none()
        return self.queryset.filter(seat__event__venue__organization=self.request.user.member.organization)
