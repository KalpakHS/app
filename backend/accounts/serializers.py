from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'full_name',
            'email',
            'role',
            'phone',
            'avatar_url',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['full_name', 'email', 'password', 'confirm_password', 'role', 'phone']

    def validate(self, attrs):
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')

        if password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        role = attrs.get('role', User.Role.PATIENT).lower()
        if role == User.Role.ADMIN:
            raise serializers.ValidationError({"role": "Admin accounts cannot be registered publicly."})

        if role not in [User.Role.PATIENT, User.Role.DOCTOR, User.Role.CAREGIVER]:
            raise serializers.ValidationError({"role": "Invalid role specified."})

        attrs['role'] = role
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email', '').lower().strip()
        password = attrs.get('password')

        if not email or not password:
            raise serializers.ValidationError("Must include both email and password.")

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("No active account found with the given credentials.")

        if not user.check_password(password):
            raise serializers.ValidationError("No active account found with the given credentials.")

        if not user.is_active:
            raise serializers.ValidationError("This account has been deactivated.")

        refresh = RefreshToken.for_user(user)
        # Custom claims in token
        refresh['role'] = user.role
        refresh['full_name'] = user.full_name
        refresh['email'] = user.email

        return {
            'user': user,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
