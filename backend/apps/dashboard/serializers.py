from rest_framework import serializers


class DashboardStatsSerializer(serializers.Serializer):
    total_members = serializers.IntegerField(read_only=True)
    active_members = serializers.IntegerField(read_only=True)
    pending_invites = serializers.IntegerField(read_only=True)
    total_api_keys = serializers.IntegerField(read_only=True)
    active_api_keys = serializers.IntegerField(read_only=True)
    unread_notifications = serializers.IntegerField(read_only=True)


class RecentActivitySerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    type = serializers.CharField(read_only=True)
    description = serializers.CharField(read_only=True)
    actor_name = serializers.CharField(read_only=True, allow_null=True)
    actor_email = serializers.CharField(read_only=True, allow_null=True)
    timestamp = serializers.CharField(read_only=True)
    metadata = serializers.DictField(read_only=True, default=dict)


class TeamOverviewSerializer(serializers.Serializer):
    total_members = serializers.IntegerField(read_only=True)
    active_last_7_days = serializers.IntegerField(read_only=True)
    active_last_30_days = serializers.IntegerField(read_only=True)
    admins = serializers.IntegerField(read_only=True)
    members_by_role = serializers.DictField(read_only=True, default=dict)


class UsageMetricsSerializer(serializers.Serializer):
    api_requests_today = serializers.IntegerField(read_only=True)
    api_requests_this_week = serializers.IntegerField(read_only=True)
    api_requests_this_month = serializers.IntegerField(read_only=True)
    storage_used_mb = serializers.IntegerField(read_only=True)
    active_integrations = serializers.IntegerField(read_only=True)
