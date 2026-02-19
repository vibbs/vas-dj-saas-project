from rest_framework import serializers

from .models import Notification, NotificationPreference


class NotificationSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(
        source="get_category_display", read_only=True
    )
    priority_display = serializers.CharField(
        source="get_priority_display", read_only=True
    )

    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "category",
            "category_display",
            "priority",
            "priority_display",
            "is_read",
            "read_at",
            "action_url",
            "metadata",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "category_display",
            "priority_display",
            "read_at",
            "created_at",
            "updated_at",
        ]


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            "id",
            "email_enabled",
            "push_enabled",
            "in_app_enabled",
            "category_preferences",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class UnreadCountSerializer(serializers.Serializer):
    count = serializers.IntegerField(read_only=True)
