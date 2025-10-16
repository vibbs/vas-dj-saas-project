"""
Feature Flags DRF Serializers.

Serializers for Feature Flag API endpoints following the existing
project patterns and conventions.
"""

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

from .enums import OnboardingStageTypes
from .models import FeatureAccess, FeatureFlag, UserOnboardingProgress

User = get_user_model()


class FeatureFlagSerializer(serializers.ModelSerializer):
    """
    Serializer for FeatureFlag model.

    Provides full CRUD operations for feature flags with validation
    and proper field handling.
    """

    is_active_now = serializers.SerializerMethodField()
    total_access_rules = serializers.SerializerMethodField()
    enabled_access_rules = serializers.SerializerMethodField()

    class Meta:
        model = FeatureFlag
        fields = [
            "id",
            "key",
            "name",
            "description",
            "is_enabled_globally",
            "rollout_percentage",
            "is_permanent",
            "requires_restart",
            "environments",
            "active_from",
            "active_until",
            "is_active_now",
            "total_access_rules",
            "enabled_access_rules",
            "created_at",
            "updated_at",
            "created_by",
            "organization",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "is_active_now",
            "total_access_rules",
            "enabled_access_rules",
        ]

    def get_is_active_now(self, obj):
        """Check if flag is currently active based on scheduling."""
        return obj.is_active_now()

    def get_total_access_rules(self, obj):
        """Get total number of access rules for this flag."""
        return obj.access_rules.count()

    def get_enabled_access_rules(self, obj):
        """Get number of enabled access rules for this flag."""
        return obj.access_rules.filter(enabled=True).count()

    def validate_rollout_percentage(self, value):
        """Validate rollout percentage is within valid range."""
        if not 0 <= value <= 100:
            raise serializers.ValidationError(
                "Rollout percentage must be between 0 and 100."
            )
        return value

    def validate(self, data):
        """Validate cross-field constraints."""
        active_from = data.get("active_from")
        active_until = data.get("active_until")

        if active_from and active_until and active_from >= active_until:
            raise serializers.ValidationError(
                {"active_until": "Active until date must be after active from date."}
            )

        return data


class FeatureFlagSummarySerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for feature flag summaries.

    Used for list views and when full details are not needed.
    """

    is_active_now = serializers.SerializerMethodField()

    class Meta:
        model = FeatureFlag
        fields = [
            "id",
            "key",
            "name",
            "is_enabled_globally",
            "rollout_percentage",
            "is_active_now",
            "updated_at",
        ]

    def get_is_active_now(self, obj):
        return obj.is_active_now()


class FeatureAccessSerializer(serializers.ModelSerializer):
    """
    Serializer for FeatureAccess model.

    Handles access rule creation and management with proper validation.
    """

    feature_key = serializers.CharField(source="feature.key", read_only=True)
    feature_name = serializers.CharField(source="feature.name", read_only=True)
    user_email = serializers.SerializerMethodField()
    applies_to_current_user = serializers.SerializerMethodField()

    class Meta:
        model = FeatureAccess
        fields = [
            "id",
            "feature",
            "feature_key",
            "feature_name",
            "user",
            "user_email",
            "role",
            "enabled",
            "conditions",
            "reason",
            "applies_to_current_user",
            "created_at",
            "updated_at",
            "organization",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "feature_key",
            "feature_name",
            "user_email",
            "applies_to_current_user",
        ]

    def get_user_email(self, obj):
        """Get user email, handling None for role-based rules."""
        return obj.user.email if obj.user else None

    def get_applies_to_current_user(self, obj):
        """Check if this access rule applies to the current user."""
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            return obj.applies_to_user(request.user)
        return False

    def validate(self, data):
        """Validate access rule constraints."""
        # Skip validation on partial updates
        if self.instance and self.partial:
            # On update, only validate if user/role are being changed
            if "user" in data or "role" in data:
                user = data.get("user", self.instance.user)
                role = data.get("role", self.instance.role)

                # Prevent conflicting targets
                if user and role:
                    raise serializers.ValidationError(
                        "Cannot specify both user and role in the same access rule."
                    )
            return data

        # On create, validate required fields
        user = data.get("user")
        role = data.get("role")

        # Ensure at least one target is specified
        if not any([user, role]):
            raise serializers.ValidationError(
                "At least one of user or role must be specified."
            )

        # Prevent conflicting targets
        if user and role:
            raise serializers.ValidationError(
                "Cannot specify both user and role in the same access rule."
            )

        return data


class UserOnboardingProgressSerializer(serializers.ModelSerializer):
    """
    Serializer for UserOnboardingProgress model.

    Provides comprehensive onboarding status and progression tracking.
    """

    user_email = serializers.CharField(source="user.email", read_only=True)
    user_full_name = serializers.CharField(source="user.full_name", read_only=True)
    is_complete = serializers.SerializerMethodField()
    next_stage = serializers.SerializerMethodField()
    available_features = serializers.SerializerMethodField()
    days_since_start = serializers.SerializerMethodField()

    class Meta:
        model = UserOnboardingProgress
        fields = [
            "id",
            "user",
            "user_email",
            "user_full_name",
            "current_stage",
            "completed_stages",
            "total_actions_completed",
            "progress_percentage",
            "is_complete",
            "next_stage",
            "available_features",
            "stage_started_at",
            "last_activity_at",
            "onboarding_completed_at",
            "custom_data",
            "days_since_start",
            "created_at",
            "updated_at",
            "organization",
        ]
        read_only_fields = [
            "id",
            "user_email",
            "user_full_name",
            "is_complete",
            "next_stage",
            "available_features",
            "days_since_start",
            "total_actions_completed",
            "progress_percentage",
            "last_activity_at",
            "onboarding_completed_at",
            "created_at",
            "updated_at",
        ]

    def get_is_complete(self, obj):
        """Check if onboarding is complete."""
        return obj.is_onboarding_complete()

    def get_next_stage(self, obj):
        """Get the next recommended stage."""
        return obj.get_next_stage()

    def get_available_features(self, obj):
        """Get features available based on current progress."""
        return obj.get_available_features()

    def get_days_since_start(self, obj):
        """Get number of days since onboarding started."""
        if obj.created_at:
            return (timezone.now() - obj.created_at).days
        return 0


class UserOnboardingProgressUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user onboarding progress.

    Focused on fields that can be updated by users or admin actions.
    """

    class Meta:
        model = UserOnboardingProgress
        fields = ["current_stage", "custom_data"]

    def validate_current_stage(self, value):
        """Validate stage is a valid choice."""
        valid_stages = [choice[0] for choice in OnboardingStageTypes.choices()]
        if value not in valid_stages:
            raise serializers.ValidationError(
                f"Invalid stage. Must be one of: {valid_stages}"
            )
        return value


class UserFeatureFlagsSerializer(serializers.Serializer):
    """
    Serializer for user's enabled feature flags.

    Returns a user's complete feature flag state including
    enabled flags, onboarding progress, and metadata.
    """

    user_id = serializers.UUIDField(read_only=True)
    user_email = serializers.EmailField(read_only=True)
    organization_id = serializers.UUIDField(read_only=True, allow_null=True)
    organization_name = serializers.CharField(read_only=True, allow_null=True)

    # Feature flags
    enabled_flags = serializers.ListField(
        child=serializers.CharField(),
        read_only=True,
        help_text="List of enabled feature flag keys",
    )
    disabled_flags = serializers.ListField(
        child=serializers.CharField(),
        read_only=True,
        required=False,
        help_text="List of disabled feature flag keys",
    )
    all_flags = serializers.DictField(
        child=serializers.BooleanField(),
        read_only=True,
        required=False,
        help_text="Dictionary of all flag keys and their enabled status",
    )
    flags = serializers.ListField(
        child=serializers.DictField(),
        read_only=True,
        required=False,
        help_text="List of specific flag details when querying specific flags",
    )

    # Onboarding info
    onboarding_stage = serializers.CharField(read_only=True, allow_null=True)
    onboarding_progress = serializers.IntegerField(read_only=True)
    onboarding_complete = serializers.BooleanField(read_only=True)

    # Metadata
    last_evaluated = serializers.DateTimeField(read_only=True)
    cache_hit = serializers.BooleanField(read_only=True, default=False)


class FeatureFlagStatisticsSerializer(serializers.Serializer):
    """
    Serializer for feature flag usage statistics.

    Provides analytics data for feature flag usage and effectiveness.
    """

    flag_key = serializers.CharField(read_only=True)
    flag_name = serializers.CharField(read_only=True)

    # Status info
    is_enabled_globally = serializers.BooleanField(read_only=True)
    rollout_percentage = serializers.IntegerField(read_only=True)
    is_active_now = serializers.BooleanField(read_only=True)

    # Usage statistics
    total_access_rules = serializers.IntegerField(read_only=True)
    enabled_access_rules = serializers.IntegerField(read_only=True)
    user_specific_rules = serializers.IntegerField(read_only=True)
    role_based_rules = serializers.IntegerField(read_only=True)

    # Timing info
    active_from = serializers.DateTimeField(read_only=True, allow_null=True)
    active_until = serializers.DateTimeField(read_only=True, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


class UserStatisticsSerializer(serializers.Serializer):
    """
    Serializer for user feature flag statistics.

    Provides user-specific analytics about their feature flag usage.
    """

    user_id = serializers.UUIDField(read_only=True)
    user_email = serializers.EmailField(read_only=True)

    # Flag statistics
    total_flags_evaluated = serializers.IntegerField(read_only=True)
    enabled_flags_count = serializers.IntegerField(read_only=True)
    disabled_flags_count = serializers.IntegerField(read_only=True)
    enabled_flags = serializers.ListField(child=serializers.CharField(), read_only=True)

    # Onboarding statistics
    onboarding_stage = serializers.CharField(read_only=True, allow_null=True)
    onboarding_progress = serializers.IntegerField(read_only=True)


class OnboardingStageInfoSerializer(serializers.Serializer):
    """
    Serializer for onboarding stage information.

    Provides details about specific onboarding stages including
    requirements and unlocked features.
    """

    stage = serializers.CharField(read_only=True)
    description = serializers.CharField(read_only=True)
    requirements = serializers.ListField(child=serializers.CharField(), read_only=True)
    unlocked_features = serializers.ListField(
        child=serializers.CharField(), read_only=True
    )


class FeatureFlagBulkUpdateSerializer(serializers.Serializer):
    """
    Serializer for bulk feature flag operations.

    Allows bulk enabling/disabling of flags for users or roles.
    """

    flag_keys = serializers.ListField(
        child=serializers.CharField(), help_text="List of feature flag keys to update"
    )
    enabled = serializers.BooleanField(
        help_text="Whether to enable or disable the flags"
    )
    target_type = serializers.ChoiceField(
        choices=["user", "role", "organization"],
        help_text="Type of target for the bulk operation",
    )
    target_ids = serializers.ListField(
        child=serializers.CharField(),
        help_text="List of target IDs (user IDs, role names, or organization IDs)",
    )
    reason = serializers.CharField(
        required=False, allow_blank=True, help_text="Reason for the bulk update"
    )

    def validate_flag_keys(self, value):
        """Validate that all flag keys exist."""
        existing_keys = set(
            FeatureFlag.objects.filter(key__in=value).values_list("key", flat=True)
        )
        missing_keys = set(value) - existing_keys

        if missing_keys:
            raise serializers.ValidationError(
                f"The following flag keys do not exist: {list(missing_keys)}"
            )

        return value

    def validate_target_ids(self, value):
        """Validate target IDs based on target type."""
        target_type = self.initial_data.get("target_type")

        if target_type == "user":
            # Validate user IDs exist
            existing_ids = set(
                User.objects.filter(id__in=value).values_list("id", flat=True)
            )
            missing_ids = set(value) - {str(uid) for uid in existing_ids}

            if missing_ids:
                raise serializers.ValidationError(
                    f"The following user IDs do not exist: {list(missing_ids)}"
                )

        return value


class FeatureFlagToggleSerializer(serializers.Serializer):
    """
    Simple serializer for toggling a feature flag on/off.
    """

    enabled = serializers.BooleanField(
        help_text="Whether the feature flag should be enabled"
    )
    reason = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=255,
        help_text="Reason for the change",
    )
