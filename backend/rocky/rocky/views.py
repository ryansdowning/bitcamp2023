"""
Views for the rocky app.
"""
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rocky.serializers import RegisterSerializer, UserSerializer
from rocky.utils import CreateOnlyIsAuthenticatedView, IsAuthenticatedView
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend


class UserEndpoint(IsAuthenticatedView):
    """
    View for getting user details using token authentication.
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["id", "username", "email", "first_name", "last_name"]

    def get_queryset(self):
        return self.queryset.filter(id=self.request.user.id)


class SignupEndpoint(CreateAPIView):
    """
    View for getting registered user details.
    """

    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer


class TokenEndpoint(APIView):
    """
    View for user token operations.
    """

    authentication_classes = []

    def post(self, request):
        """
        Gets the token using a user's email and password.

        Args:
            request: Request object sent to the endpoint.

        Returns:
            token: The user's token.
        """
        email = request.POST.get("email", None)
        password = request.POST.get("password", None)

        if email is None:
            return Response({"email": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

        if password is None:
            return Response({"password": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"message": "User with this email was not found."}, status=status.HTTP_400_BAD_REQUEST)

        correct = user.check_password(password)
        if not correct:
            return Response(
                {"non_field_errors": ["Unable to login with the provided credentials."]},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token = Token.objects.get(user=user)
        return Response({"token": str(token)}, status=status.HTTP_200_OK)


class ChangePasswordEndpoint(CreateOnlyIsAuthenticatedView):
    """
    Endpoint for changing a user's password.
    """

    def patch(self, request):
        """
        PATCH view for updating a user's password.

        Args:
            current_password: The user's current password.
            password: The user's new password.
            password2: The confirmation password, must match the new password.
        """
        password = request.POST["password"]
        password2 = request.POST["password2"]

        if password != password2:
            return Response({"message": "The passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(password)
        except ValidationError as err:
            return Response({"message": err}, status=status.HTTP_400_BAD_REQUEST)

        if not request.user.check_password(request.POST["current_password"]):
            return Response({"message": "The current password is not correct."}, status=status.HTTP_403_FORBIDDEN)

        request.user.set_password(password)
        request.user.save()
        return Response(
            {"message": f"The password for user {request.user.pk} has been updated."}, status=status.HTTP_204_NO_CONTENT
        )
