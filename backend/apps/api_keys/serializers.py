from rest_framework import serializers

from .models import ApiKey


class ApiKeySerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )
    is_expired = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    created_by_email = serializers.CharField(
        source="created_by.email", read_only=True, default=None
    )

    class Meta:
        model = ApiKey
        fields = [
            "id",
            "name",
            "description",
            "key_prefix",
            "scopes",
            "status",
            "status_display",
            "is_expired",
            "is_active",
            "expires_at",
            "last_used_at",
            "revoked_at",
            "total_requests",
            "created_by",
            "created_by_email",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "key_prefix",
            "status",
            "status_display",
            "is_expired",
            "is_active",
            "last_used_at",
            "revoked_at",
            "total_requests",
            "created_by",
            "created_by_email",
            "created_at",
            "updated_at",
        ]


class CreateApiKeySerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, default="", allow_blank=True)
    scopes = serializers.ListField(
        child=serializers.CharField(), required=False, default=list
    )
    expires_at = serializers.DateTimeField(required=False, allow_null=True)


class CreateApiKeyResponseSerializer(ApiKeySerializer):
    """Response serializer that includes the full key (only returned on creation)."""

    key = serializers.CharField(read_only=True)

    class Meta(ApiKeySerializer.Meta):
        fields = ApiKeySerializer.Meta.fields + ["key"]


class ApiKeyUsageSerializer(serializers.Serializer):
    total_requests = serializers.IntegerField(read_only=True)
    last_used_at = serializers.DateTimeField(read_only=True, allow_null=True)
