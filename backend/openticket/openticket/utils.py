from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import CreateAPIView
from rest_framework.authentication import TokenAuthentication
from django.db import models


class IsAuthenticatedMixin:
    """
    Mixin for a view that requires a user to be authenticated.
    """

    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]


class IsAuthenticatedView(IsAuthenticatedMixin, ModelViewSet):
    """
    Default CRUD API that requires a user to be authenticated.
    """


class CreateOnlyIsAuthenticatedView(IsAuthenticatedMixin, CreateAPIView):
    """
    Default create-only API that requires a user to be authenticated.
    """


class CreatedAtMixin:
    created_at = models.DateTimeField(auto_now_add=True)


class UpdatedAtMixin:
    updated_at = models.DateTimeField(auto_now=True)


class TrackedMixin(CreatedAtMixin, UpdatedAtMixin):
    """ """
