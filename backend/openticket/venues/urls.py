from django.urls import include, path
from rest_framework.routers import DefaultRouter
from venues.views import VenueView, EventView, SeatView

router = DefaultRouter()
router.register("venue", VenueView)
router.register("event", EventView)
router.register("seat", SeatView)

urlpatterns = [
    path("", include(router.urls)),
]
