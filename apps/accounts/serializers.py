from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import Account, AccountAuthProvider


class AccountSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    abbreviated_name = serializers.CharField(read_only=True)
    is_admin = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Account
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 'abbreviated_name',
            'avatar', 'phone', 'bio', 'date_of_birth', 'gender', 'role',
            'is_active', 'is_email_verified', 'is_phone_verified', 'is_2fa_enabled',
            'date_joined', 'status', 'is_admin', 'is_org_admin', 'is_org_creator',
            'can_invite_users', 'can_manage_billing', 'can_delete_org'
        ]
        read_only_fields = ['id', 'date_joined', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }


class AccountCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = Account
        fields = [
            'email', 'password', 'password_confirm', 'first_name', 'last_name',
            'phone', 'bio', 'date_of_birth', 'gender'
        ]
        
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = Account.objects.create_user(password=password, **validated_data)
        return user


class AccountAuthProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountAuthProvider
        fields = ['id', 'provider', 'provider_user_id', 'email', 'linked_at', 'is_primary']
        read_only_fields = ['id', 'linked_at']