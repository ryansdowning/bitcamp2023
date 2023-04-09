from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.generics import CreateAPIView
from rest_framework.authentication import TokenAuthentication
from django.db import models

READ_ACTIONS = {"retrieve", "list"}


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


class ReadOnlyIsAuthenticatedView(IsAuthenticatedMixin, ReadOnlyModelViewSet):
    """
    Default read-only API that requires a user to be authenticated.
    """


class UnauthenticatedReadMixin:
    """
    Mixin to allow READ operations.
    """

    authentication_classes = [TokenAuthentication]

    def get_permissions(self):
        """
        Gets the permissions for this class. Allows READ operations.
        """
        if self.action in ["retrieve", "list"]:
            return [AllowAny()]
        return [IsAuthenticated()]


class CreatedAtMixin(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class UpdatedAtMixin(models.Model):
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class TrackedMixin(CreatedAtMixin, UpdatedAtMixin):
    """ """

    class Meta:
        abstract = True
