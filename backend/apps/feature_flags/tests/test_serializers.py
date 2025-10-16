"""
Feature Flag Serializers Tests.

Comprehensive tests for all DRF serializers with validation and field testing.
"""

from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework import serializers

from ..enums import OnboardingStageTypes
from ..serializers import (
    FeatureAccessSerializer,
    FeatureFlagBulkUpdateSerializer,
    FeatureFlagSerializer,
    FeatureFlagStatisticsSerializer,
    FeatureFlagSummarySerializer,
    FeatureFlagToggleSerializer,
    OnboardingStageInfoSerializer,
    UserFeatureFlagsSerializer,
    UserOnboardingProgressSerializer,
    UserOnboardingProgressUpdateSerializer,
    UserStatisticsSerializer,
)
from .factories import (
    FeatureAccessFactory,
    FeatureFlagFactory,
    UserFactory,
    UserOnboardingProgressFactory,
)


@pytest.mark.django_db
class TestFeatureFlagSerializer:
    """Test suite for FeatureFlagSerializer."""

    def test_serialization(self, feature_flag):
        """Test basic serialization of feature flag."""
        serializer = FeatureFlagSerializer(feature_flag)
        data = serializer.data

        assert data["key"] == feature_flag.key
        assert data["name"] == feature_flag.name
        assert data["description"] == feature_flag.description
        assert data["is_enabled_globally"] == feature_flag.is_enabled_globally
        assert data["rollout_percentage"] == feature_flag.rollout_percentage
        assert "is_active_now" in data
        assert "total_access_rules" in data
        assert "enabled_access_rules" in data

    def test_is_active_now_method_field(self, feature_flag):
        """Test is_active_now method field."""
        serializer = FeatureFlagSerializer(feature_flag)
        data = serializer.data

        assert data["is_active_now"] == feature_flag.is_active_now()

    def test_access_rules_count_fields(self, feature_flag, user):
        """Test access rules count method fields."""
        # Create some access rules
        FeatureAccessFactory(feature=feature_flag, user=user, enabled=True)
        FeatureAccessFactory(feature=feature_flag, role="ADMIN", enabled=False)

        serializer = FeatureFlagSerializer(feature_flag)
        data = serializer.data

        assert data["total_access_rules"] == 2
        assert data["enabled_access_rules"] == 1

    def test_deserialization_valid_data(self, valid_flag_data):
        """Test deserialization with valid data."""
        serializer = FeatureFlagSerializer(data=valid_flag_data)

        assert serializer.is_valid()
        flag = serializer.save()
        assert flag.key == valid_flag_data["key"]
        assert flag.name == valid_flag_data["name"]

    def test_deserialization_invalid_data(self):
        """Test deserialization with invalid data."""
        invalid_data = {
            "key": "",  # Empty key
            "name": "Test Feature",
            "rollout_percentage": 150,  # Invalid percentage
        }

        serializer = FeatureFlagSerializer(data=invalid_data)

        assert not serializer.is_valid()
        assert "key" in serializer.errors
        assert "rollout_percentage" in serializer.errors

    def test_rollout_percentage_validation(self):
        """Test rollout percentage validation."""
        # Test valid percentages
        for percentage in [0, 25, 50, 100]:
            serializer = FeatureFlagSerializer()
            result = serializer.validate_rollout_percentage(percentage)
            assert result == percentage

        # Test invalid percentages
        for percentage in [-1, 101, 150]:
            serializer = FeatureFlagSerializer()
            with pytest.raises(serializers.ValidationError):
                serializer.validate_rollout_percentage(percentage)

    def test_date_validation(self):
        """Test active_from and active_until date validation."""
        now = timezone.now()
        future = now + timedelta(days=7)
        past = now - timedelta(days=7)

        # Valid: active_from before active_until
        valid_data = {
            "key": "test_flag",
            "name": "Test Flag",
            "active_from": past,
            "active_until": future,
        }
        serializer = FeatureFlagSerializer(data=valid_data)
        assert serializer.is_valid()

        # Invalid: active_from after active_until
        invalid_data = {
            "key": "test_flag",
            "name": "Test Flag",
            "active_from": future,
            "active_until": past,
        }
        serializer = FeatureFlagSerializer(data=invalid_data)
        assert not serializer.is_valid()
        assert "active_until" in serializer.errors

    def test_read_only_fields(self, feature_flag):
        """Test that read-only fields cannot be updated."""
        update_data = {
            "id": 999,
            "created_at": timezone.now(),
            "updated_at": timezone.now(),
            "is_active_now": False,
            "total_access_rules": 10,
            "enabled_access_rules": 5,
            "name": "Updated Name",
        }

        serializer = FeatureFlagSerializer(feature_flag, data=update_data, partial=True)
        assert serializer.is_valid()

        updated_flag = serializer.save()

        # Name should be updated (writable field)
        assert updated_flag.name == "Updated Name"

        # Read-only fields should not change
        assert updated_flag.id == feature_flag.id
        assert updated_flag.created_at == feature_flag.created_at


@pytest.mark.django_db
class TestFeatureFlagSummarySerializer:
    """Test suite for FeatureFlagSummarySerializer."""

    def test_serialization_includes_summary_fields(self, feature_flag):
        """Test that summary serializer includes only summary fields."""
        serializer = FeatureFlagSummarySerializer(feature_flag)
        data = serializer.data

        expected_fields = {
            "id",
            "key",
            "name",
            "is_enabled_globally",
            "rollout_percentage",
            "is_active_now",
            "updated_at",
        }
        assert set(data.keys()) == expected_fields

    def test_is_active_now_method_field(self, feature_flag):
        """Test is_active_now method field in summary."""
        serializer = FeatureFlagSummarySerializer(feature_flag)
        data = serializer.data

        assert data["is_active_now"] == feature_flag.is_active_now()


@pytest.mark.django_db
class TestFeatureAccessSerializer:
    """Test suite for FeatureAccessSerializer."""

    def test_serialization_with_user_rule(self, user_access_rule):
        """Test serialization of user-specific access rule."""
        serializer = FeatureAccessSerializer(user_access_rule)
        data = serializer.data

        assert data["feature"] == user_access_rule.feature.id
        assert data["feature_key"] == user_access_rule.feature.key
        assert data["feature_name"] == user_access_rule.feature.name
        assert data["user"] == user_access_rule.user.id
        assert data["user_email"] == user_access_rule.user.email
        assert data["enabled"] == user_access_rule.enabled

    def test_serialization_with_role_rule(self, role_access_rule):
        """Test serialization of role-based access rule."""
        serializer = FeatureAccessSerializer(role_access_rule)
        data = serializer.data

        assert data["role"] == role_access_rule.role
        assert data["user"] is None
        assert data["user_email"] is None

    def test_applies_to_current_user_method_field(self, user_access_rule, user):
        """Test applies_to_current_user method field."""
        # Mock request context
        from unittest.mock import Mock

        request = Mock()
        request.user = user

        serializer = FeatureAccessSerializer(
            user_access_rule, context={"request": request}
        )
        data = serializer.data

        assert "applies_to_current_user" in data
        assert data["applies_to_current_user"] == user_access_rule.applies_to_user(user)

    def test_applies_to_current_user_without_request(self, user_access_rule):
        """Test applies_to_current_user without request context."""
        serializer = FeatureAccessSerializer(user_access_rule)
        data = serializer.data

        assert data["applies_to_current_user"] is False

    def test_validation_missing_target(self, feature_flag):
        """Test validation fails when no target is specified."""
        invalid_data = {
            "feature": feature_flag.id,
            "enabled": True,
            # Missing both user and role
        }

        serializer = FeatureAccessSerializer(data=invalid_data)

        assert not serializer.is_valid()
        assert "non_field_errors" in serializer.errors
        assert "At least one of user or role must be specified" in str(
            serializer.errors
        )

    def test_validation_conflicting_targets(self, feature_flag, user):
        """Test validation fails when both user and role are specified."""
        invalid_data = {
            "feature": feature_flag.id,
            "user": user.id,
            "role": "ADMIN",
            "enabled": True,
        }

        serializer = FeatureAccessSerializer(data=invalid_data)

        assert not serializer.is_valid()
        assert "non_field_errors" in serializer.errors
        assert "Cannot specify both user and role" in str(serializer.errors)

    def test_deserialization_user_rule(self, valid_access_rule_data):
        """Test creating user-specific access rule."""
        serializer = FeatureAccessSerializer(data=valid_access_rule_data)

        assert serializer.is_valid()
        rule = serializer.save()
        assert rule.feature.id == valid_access_rule_data["feature"]
        assert rule.user.id == valid_access_rule_data["user"]
        assert rule.enabled == valid_access_rule_data["enabled"]

    def test_deserialization_role_rule(self, feature_flag):
        """Test creating role-based access rule."""
        role_data = {
            "feature": feature_flag.id,
            "role": "ADMIN",
            "enabled": True,
            "reason": "Admin access",
        }

        serializer = FeatureAccessSerializer(data=role_data)

        assert serializer.is_valid()
        rule = serializer.save()
        assert rule.feature == feature_flag
        assert rule.role == "ADMIN"
        assert rule.user is None


@pytest.mark.django_db
class TestUserOnboardingProgressSerializer:
    """Test suite for UserOnboardingProgressSerializer."""

    def test_serialization(self, onboarding_progress):
        """Test basic serialization of onboarding progress."""
        serializer = UserOnboardingProgressSerializer(onboarding_progress)
        data = serializer.data

        assert data["user"] == onboarding_progress.user.id
        assert data["user_email"] == onboarding_progress.user.email
        assert data["current_stage"] == onboarding_progress.current_stage
        assert data["progress_percentage"] == onboarding_progress.progress_percentage
        assert "is_complete" in data
        assert "next_stage" in data
        assert "available_features" in data
        assert "days_since_start" in data

    def test_method_fields(self, onboarding_progress):
        """Test method fields return correct values."""
        serializer = UserOnboardingProgressSerializer(onboarding_progress)
        data = serializer.data

        assert data["is_complete"] == onboarding_progress.is_onboarding_complete()
        assert data["next_stage"] == onboarding_progress.get_next_stage()
        assert (
            data["available_features"] == onboarding_progress.get_available_features()
        )

    def test_days_since_start(self):
        """Test days_since_start calculation."""
        past_date = timezone.now() - timedelta(days=5)
        progress = UserOnboardingProgressFactory()
        # Update created_at manually since auto_now_add prevents setting it in factory
        progress.created_at = past_date
        progress.save(update_fields=["created_at"])

        serializer = UserOnboardingProgressSerializer(progress)
        data = serializer.data

        assert data["days_since_start"] == 5

    def test_days_since_start_no_created_date(self, user):
        """Test days_since_start with no creation date."""
        progress = UserOnboardingProgressFactory(user=user, created_at=None)

        serializer = UserOnboardingProgressSerializer(progress)
        data = serializer.data

        assert data["days_since_start"] == 0

    def test_read_only_fields(self, onboarding_progress):
        """Test that read-only fields cannot be updated."""
        update_data = {
            "user_email": "newemail@example.com",
            "is_complete": True,
            "next_stage": "ADVANCED",
            "days_since_start": 999,
            "current_stage": OnboardingStageTypes.PROFILE_SETUP.value,
        }

        serializer = UserOnboardingProgressSerializer(
            onboarding_progress, data=update_data, partial=True
        )
        assert serializer.is_valid()

        updated_progress = serializer.save()

        # Writable field should update
        assert (
            updated_progress.current_stage == OnboardingStageTypes.PROFILE_SETUP.value
        )

        # Read-only fields should not change
        assert updated_progress.user.email == onboarding_progress.user.email


@pytest.mark.django_db
class TestUserOnboardingProgressUpdateSerializer:
    """Test suite for UserOnboardingProgressUpdateSerializer."""

    def test_valid_stage_update(self, onboarding_progress):
        """Test updating with valid stage."""
        update_data = {
            "current_stage": OnboardingStageTypes.EMAIL_VERIFIED.value,
            "custom_data": {"updated": True},
        }

        serializer = UserOnboardingProgressUpdateSerializer(
            onboarding_progress, data=update_data
        )

        assert serializer.is_valid()
        updated_progress = serializer.save()
        assert (
            updated_progress.current_stage == OnboardingStageTypes.EMAIL_VERIFIED.value
        )
        assert updated_progress.custom_data["updated"] is True

    def test_invalid_stage_validation(self, onboarding_progress):
        """Test validation with invalid stage."""
        update_data = {"current_stage": "INVALID_STAGE"}

        serializer = UserOnboardingProgressUpdateSerializer(
            onboarding_progress, data=update_data
        )

        assert not serializer.is_valid()
        assert "current_stage" in serializer.errors
        # Check for DRF's default choice validation error
        assert "is not a valid choice" in str(serializer.errors["current_stage"])

    def test_custom_data_only_update(self, onboarding_progress):
        """Test updating only custom data."""
        original_stage = onboarding_progress.current_stage
        update_data = {"custom_data": {"new_field": "new_value"}}

        serializer = UserOnboardingProgressUpdateSerializer(
            onboarding_progress, data=update_data, partial=True
        )

        assert serializer.is_valid()
        updated_progress = serializer.save()
        assert updated_progress.current_stage == original_stage
        assert updated_progress.custom_data["new_field"] == "new_value"


class TestUserFeatureFlagsSerializer:
    """Test suite for UserFeatureFlagsSerializer."""

    def test_serialization_structure(self, user):
        """Test serializer structure and field types."""
        data = {
            "user_id": user.id,
            "user_email": user.email,
            "organization_id": None,
            "organization_name": None,
            "enabled_flags": ["flag1", "flag2"],
            "all_flags": {"flag1": True, "flag2": True, "flag3": False},
            "onboarding_stage": "EMAIL_VERIFIED",
            "onboarding_progress": 25,
            "onboarding_complete": False,
            "last_evaluated": timezone.now(),
            "cache_hit": True,
        }

        serializer = UserFeatureFlagsSerializer(data)
        serialized_data = serializer.data

        assert serialized_data["user_id"] == str(user.id)
        assert serialized_data["user_email"] == user.email
        assert serialized_data["enabled_flags"] == ["flag1", "flag2"]
        assert serialized_data["all_flags"] == {
            "flag1": True,
            "flag2": True,
            "flag3": False,
        }

    def test_with_organization(self, user, organization):
        """Test serialization with organization context."""
        data = {
            "user_id": user.id,
            "user_email": user.email,
            "organization_id": organization.id,
            "organization_name": organization.name,
            "enabled_flags": ["flag1"],
            "all_flags": {"flag1": True},
            "onboarding_stage": "ORGANIZATION_CREATED",
            "onboarding_progress": 50,
            "onboarding_complete": False,
            "last_evaluated": timezone.now(),
            "cache_hit": False,
        }

        serializer = UserFeatureFlagsSerializer(data)
        serialized_data = serializer.data

        assert serialized_data["organization_id"] == str(organization.id)
        assert serialized_data["organization_name"] == organization.name


class TestFeatureFlagStatisticsSerializer:
    """Test suite for FeatureFlagStatisticsSerializer."""

    def test_serialization_structure(self, feature_flag):
        """Test statistics serializer structure."""
        data = {
            "flag_key": feature_flag.key,
            "flag_name": feature_flag.name,
            "is_enabled_globally": feature_flag.is_enabled_globally,
            "rollout_percentage": feature_flag.rollout_percentage,
            "is_active_now": True,
            "total_access_rules": 5,
            "enabled_access_rules": 3,
            "user_specific_rules": 2,
            "role_based_rules": 1,
            "active_from": feature_flag.active_from,
            "active_until": feature_flag.active_until,
            "created_at": feature_flag.created_at,
            "updated_at": feature_flag.updated_at,
        }

        serializer = FeatureFlagStatisticsSerializer(data)
        serialized_data = serializer.data

        assert serialized_data["flag_key"] == feature_flag.key
        assert serialized_data["total_access_rules"] == 5
        assert serialized_data["enabled_access_rules"] == 3


class TestUserStatisticsSerializer:
    """Test suite for UserStatisticsSerializer."""

    def test_serialization_structure(self, user):
        """Test user statistics serializer structure."""
        data = {
            "user_id": user.id,
            "user_email": user.email,
            "total_flags_evaluated": 10,
            "enabled_flags_count": 7,
            "disabled_flags_count": 3,
            "enabled_flags": ["flag1", "flag2", "flag3"],
            "onboarding_stage": "PROFILE_SETUP",
            "onboarding_progress": 75,
        }

        serializer = UserStatisticsSerializer(data)
        serialized_data = serializer.data

        assert serialized_data["user_id"] == str(user.id)
        assert serialized_data["user_email"] == user.email
        assert serialized_data["total_flags_evaluated"] == 10
        assert serialized_data["enabled_flags"] == ["flag1", "flag2", "flag3"]


class TestOnboardingStageInfoSerializer:
    """Test suite for OnboardingStageInfoSerializer."""

    def test_serialization_structure(self):
        """Test onboarding stage info serializer structure."""
        data = {
            "stage": "EMAIL_VERIFIED",
            "description": "User has verified their email address",
            "requirements": ["email_verified"],
            "unlocked_features": ["basic_dashboard"],
        }

        serializer = OnboardingStageInfoSerializer(data)
        serialized_data = serializer.data

        assert serialized_data["stage"] == "EMAIL_VERIFIED"
        assert serialized_data["description"] == "User has verified their email address"
        assert serialized_data["requirements"] == ["email_verified"]
        assert serialized_data["unlocked_features"] == ["basic_dashboard"]


@pytest.mark.django_db
class TestFeatureFlagBulkUpdateSerializer:
    """Test suite for FeatureFlagBulkUpdateSerializer."""

    def test_valid_bulk_update_data(self, multiple_users):
        """Test validation with valid bulk update data."""
        flag1 = FeatureFlagFactory(key="flag1")
        flag2 = FeatureFlagFactory(key="flag2")

        data = {
            "flag_keys": [flag1.key, flag2.key],
            "enabled": True,
            "target_type": "user",
            "target_ids": [str(user.id) for user in multiple_users[:2]],
            "reason": "Bulk enable for testing",
        }

        serializer = FeatureFlagBulkUpdateSerializer(data=data)

        assert serializer.is_valid()
        assert serializer.validated_data["flag_keys"] == [flag1.key, flag2.key]
        assert serializer.validated_data["enabled"] is True
        assert serializer.validated_data["target_type"] == "user"

    def test_invalid_flag_keys_validation(self):
        """Test validation with nonexistent flag keys."""
        data = {
            "flag_keys": ["nonexistent_flag1", "nonexistent_flag2"],
            "enabled": True,
            "target_type": "user",
            "target_ids": ["user1"],
            "reason": "Test",
        }

        serializer = FeatureFlagBulkUpdateSerializer(data=data)

        assert not serializer.is_valid()
        assert "flag_keys" in serializer.errors
        assert "do not exist" in str(serializer.errors["flag_keys"])

    def test_mixed_valid_invalid_flag_keys(self):
        """Test validation with mix of valid and invalid flag keys."""
        valid_flag = FeatureFlagFactory(key="valid_flag")

        data = {
            "flag_keys": [valid_flag.key, "nonexistent_flag"],
            "enabled": True,
            "target_type": "user",
            "target_ids": ["user1"],
        }

        serializer = FeatureFlagBulkUpdateSerializer(data=data)

        assert not serializer.is_valid()
        assert "flag_keys" in serializer.errors
        assert "nonexistent_flag" in str(serializer.errors["flag_keys"])

    def test_invalid_user_targets_validation(self):
        """Test validation with nonexistent user IDs."""
        import uuid

        flag = FeatureFlagFactory()

        # Use valid UUID format but nonexistent user
        nonexistent_uuid = str(uuid.uuid4())
        data = {
            "flag_keys": [flag.key],
            "enabled": True,
            "target_type": "user",
            "target_ids": [nonexistent_uuid],
        }

        serializer = FeatureFlagBulkUpdateSerializer(data=data)

        assert not serializer.is_valid()
        assert "target_ids" in serializer.errors
        # Check for validation error (may be UUID or existence check)
        error_str = str(serializer.errors["target_ids"]).lower()
        assert "not" in error_str and (
            "exist" in error_str or "found" in error_str or "valid" in error_str
        )

    def test_role_target_type(self):
        """Test validation with role target type."""
        flag = FeatureFlagFactory()

        data = {
            "flag_keys": [flag.key],
            "enabled": True,
            "target_type": "role",
            "target_ids": ["ADMIN", "MANAGER"],
            "reason": "Role-based access",
        }

        serializer = FeatureFlagBulkUpdateSerializer(data=data)

        # Should be valid - role validation is simpler
        assert serializer.is_valid()
        assert serializer.validated_data["target_type"] == "role"
        assert serializer.validated_data["target_ids"] == ["ADMIN", "MANAGER"]

    def test_organization_target_type(self):
        """Test validation with organization target type."""
        flag = FeatureFlagFactory()

        data = {
            "flag_keys": [flag.key],
            "enabled": False,
            "target_type": "organization",
            "target_ids": ["org1", "org2"],
        }

        serializer = FeatureFlagBulkUpdateSerializer(data=data)

        # Should be valid - organization validation not implemented yet
        assert serializer.is_valid()
        assert serializer.validated_data["target_type"] == "organization"

    def test_optional_reason_field(self):
        """Test that reason field is optional."""
        flag = FeatureFlagFactory()
        user = UserFactory()

        data = {
            "flag_keys": [flag.key],
            "enabled": True,
            "target_type": "user",
            "target_ids": [str(user.id)],
            # No reason provided
        }

        serializer = FeatureFlagBulkUpdateSerializer(data=data)

        assert serializer.is_valid()
        assert serializer.validated_data.get("reason", "") == ""


class TestFeatureFlagToggleSerializer:
    """Test suite for FeatureFlagToggleSerializer."""

    def test_valid_toggle_data(self):
        """Test validation with valid toggle data."""
        data = {"enabled": True, "reason": "Testing feature toggle"}

        serializer = FeatureFlagToggleSerializer(data=data)

        assert serializer.is_valid()
        assert serializer.validated_data["enabled"] is True
        assert serializer.validated_data["reason"] == "Testing feature toggle"

    def test_toggle_without_reason(self):
        """Test toggle without reason (optional field)."""
        data = {"enabled": False}

        serializer = FeatureFlagToggleSerializer(data=data)

        assert serializer.is_valid()
        assert serializer.validated_data["enabled"] is False
        assert serializer.validated_data.get("reason", "") == ""

    def test_empty_reason_allowed(self):
        """Test that empty reason is allowed."""
        data = {"enabled": True, "reason": ""}

        serializer = FeatureFlagToggleSerializer(data=data)

        assert serializer.is_valid()
        assert serializer.validated_data["reason"] == ""

    def test_reason_max_length(self):
        """Test reason field max length validation."""
        long_reason = "x" * 300  # Exceeds max_length of 255

        data = {"enabled": True, "reason": long_reason}

        serializer = FeatureFlagToggleSerializer(data=data)

        assert not serializer.is_valid()
        assert "reason" in serializer.errors
        assert "Ensure this field has no more than 255 characters" in str(
            serializer.errors["reason"]
        )

    def test_missing_enabled_field(self):
        """Test validation fails when enabled field is missing."""
        data = {"reason": "Missing enabled field"}

        serializer = FeatureFlagToggleSerializer(data=data)

        assert not serializer.is_valid()
        assert "enabled" in serializer.errors
        assert "This field is required" in str(serializer.errors["enabled"])

    def test_invalid_enabled_field_type(self):
        """Test validation fails with invalid enabled field type."""
        data = {
            "enabled": "invalid",  # Invalid boolean value (not 'true', 'false', 'yes', 'no', '1', '0')
            "reason": "Invalid type",
        }

        serializer = FeatureFlagToggleSerializer(data=data)

        assert not serializer.is_valid()
        assert "enabled" in serializer.errors
