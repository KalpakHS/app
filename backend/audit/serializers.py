from rest_framework import serializers
from .models import AuditLog
from accounts.models import User

class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True, default='System')
    user_name = serializers.CharField(source='user.full_name', read_only=True, default='System')

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'user',
            'user_name',
            'user_email',
            'action',
            'entity_type',
            'entity_id',
            'details',
            'status',
            'ip_address',
            'timestamp',
        ]
        read_only_fields = ['id', 'timestamp']


class AdminUserManagementSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, default='SmartNebPass123!')

    class Meta:
        model = User
        fields = [
            'id',
            'full_name',
            'email',
            'role',
            'phone',
            'is_active',
            'is_staff',
            'password',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        password = validated_data.pop('password', 'SmartNebPass123!')
        user = User.objects.create_user(password=password, **validated_data)
        return user
