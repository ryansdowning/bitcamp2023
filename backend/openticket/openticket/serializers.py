"""
Serializers for the rocky app.
"""
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.authtoken.models import Token
from rest_framework.validators import UniqueValidator


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer to get user details using Django token authentication.
    """

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "username", "email"]


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for a registered user.
    """

    class Meta:
        model = User
        fields = ("username", "password", "password2", "email", "first_name", "last_name", "token")
        extra_kwargs = {"first_name": {"required": True}, "last_name": {"required": True}}

    email = serializers.EmailField(required=True, validators=[UniqueValidator(queryset=User.objects.all())])
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    token = serializers.SerializerMethodField()

    def get_token(self, obj: User):  # pylint: disable=R0201
        """
        Gets the token for a registered user.
        """
        return str(Token.objects.get(user=obj))

    def validate(self, attrs):
        """
        Validates that the password was confirmed correctly.

        Args:
            attrs: Dictionary of user registration information.

        Returns:
            Reference to the attrs dictionary.
        """
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        """
        Creates a new registered user.

        Args:
            validated_data: Dictionary of validated user registration information.

        Returns:
            Newly created User object.
        """
        user = User.objects.create(
            username=validated_data["username"],
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )
        user.set_password(validated_data["password"])
        user.save()
        Token.objects.create(user=user)
        return user
