from django.urls import include, path
from rest_framework.routers import DefaultRouter
from accounts.views import OrganizationView, MemberView

router = DefaultRouter()
router.register("organization", OrganizationView)
router.register("member", MemberView)

urlpatterns = [
    path("", include(router.urls)),
]
