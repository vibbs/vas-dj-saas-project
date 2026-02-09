"""
Test cases for feature flags models.

Tests for FeatureFlag, FeatureAccess, and UserOnboardingProgress models
including validation, methods, properties, and edge cases.
"""

from datetime import timedelta

import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.utils import timezone
from freezegun import freeze_time

from ..enums import OnboardingStageTypes
from .factories import (
    FeatureAccessFactory,
    FeatureFlagFactory,
    UserFactory,
    UserOnboardingProgressFactory,
)


@pytest.mark.django_db
@pytest.mark.models
class TestFeatureFlagModel:
    """Test cases for FeatureFlag model."""

    def test_create_feature_flag(self):
        """Test creating a basic feature flag."""
        flag = FeatureFlagFactory()
        assert flag.key
        assert flag.name
        assert not flag.is_enabled_globally
        assert flag.rollout_percentage == 0
        assert flag.created_at
        assert flag.updated_at

    def test_feature_flag_str_representation(self):
        """Test string representation of feature flag."""
        flag = FeatureFlagFactory(name="Test Feature", key="test_feature")
        assert str(flag) == "Test Feature (test_feature)"

    def test_feature_flag_key_uniqueness(self):
        """Test that feature flag keys must be unique."""
        FeatureFlagFactory(key="unique_key")

        with pytest.raises(IntegrityError):
            FeatureFlagFactory(key="unique_key")

    def test_rollout_percentage_validation_success(self):
        """Test valid rollout percentage values."""
        # Valid percentages should not raise exceptions
        flag = FeatureFlagFactory(rollout_percentage=0)
        flag.full_clean()

        flag.rollout_percentage = 50
        flag.full_clean()

        flag.rollout_percentage = 100
        flag.full_clean()

    def test_rollout_percentage_validation_failure(self):
        """Test rollout percentage validation at model level."""
        # Create a flag with valid rollout percentage first
        flag = FeatureFlagFactory(rollout_percentage=50)

        # Test negative percentage
        flag.rollout_percentage = -1
        with pytest.raises(ValidationError):
            flag.full_clean()

        # Test percentage over 100
        flag.rollout_percentage = 101
        with pytest.raises(ValidationError):
            flag.full_clean()

    def test_date_range_validation_success(self):
        """Test valid active date ranges."""
        now = timezone.now()
        future = now + timedelta(days=7)

        flag = FeatureFlagFactory(active_from=now, active_until=future)
        flag.full_clean()  # Should not raise

    def test_date_range_validation_failure(self):
        """Test invalid active date ranges."""
        now = timezone.now()
        past = now - timedelta(days=1)

        flag = FeatureFlagFactory(active_from=now, active_until=past)
        with pytest.raises(ValidationError) as exc_info:
            flag.full_clean()

        assert "active_until" in str(exc_info.value)

    @freeze_time("2024-01-15 12:00:00")
    def test_is_active_now_no_restrictions(self):
        """Test is_active_now with no time restrictions."""
        flag = FeatureFlagFactory(active_from=None, active_until=None)
        assert flag.is_active_now() is True

    @freeze_time("2024-01-15 12:00:00")
    def test_is_active_now_future_start(self):
        """Test is_active_now with future start date."""
        future_date = timezone.now() + timedelta(days=1)
        flag = FeatureFlagFactory(active_from=future_date)
        assert flag.is_active_now() is False

    @freeze_time("2024-01-15 12:00:00")
    def test_is_active_now_past_end(self):
        """Test is_active_now with past end date."""
        past_date = timezone.now() - timedelta(days=1)
        flag = FeatureFlagFactory(active_until=past_date)
        assert flag.is_active_now() is False

    @freeze_time("2024-01-15 12:00:00")
    def test_is_active_now_within_range(self):
        """Test is_active_now within valid time range."""
        past_date = timezone.now() - timedelta(days=1)
        future_date = timezone.now() + timedelta(days=1)
        flag = FeatureFlagFactory(active_from=past_date, active_until=future_date)
        assert flag.is_active_now() is True

    def test_is_in_rollout_percentage_deterministic(self):
        """Test that rollout percentage is deterministic for same user."""
        flag = FeatureFlagFactory(rollout_percentage=50)
        user_id = "test-user-123"

        # Multiple calls should return same result
        result1 = flag.is_in_rollout_percentage(user_id)
        result2 = flag.is_in_rollout_percentage(user_id)
        assert result1 == result2

    def test_is_in_rollout_percentage_zero_percent(self):
        """Test rollout with 0% should never include users."""
        flag = FeatureFlagFactory(rollout_percentage=0)
        assert flag.is_in_rollout_percentage("any-user") is False

    def test_is_in_rollout_percentage_hundred_percent(self):
        """Test rollout with 100% should include all users."""
        flag = FeatureFlagFactory(rollout_percentage=100)
        assert flag.is_in_rollout_percentage("any-user") is True

    def test_is_in_rollout_percentage_distribution(self):
        """Test that rollout percentage distributes users reasonably."""
        flag = FeatureFlagFactory(rollout_percentage=50)

        # Test with many user IDs to check distribution
        user_ids = [f"user-{i}" for i in range(1000)]
        included_count = sum(
            1 for user_id in user_ids if flag.is_in_rollout_percentage(user_id)
        )

        # Should be approximately 50%, allow for some variance
        assert 450 <= included_count <= 550

    def test_environments_field(self):
        """Test environments JSON field."""
        environments = ["development", "staging", "production"]
        flag = FeatureFlagFactory(environments=environments)

        assert flag.environments == environments
        assert isinstance(flag.environments, list)

    def test_extended_properties_inheritance(self):
        """Test that extended_properties are inherited from BaseFields."""
        properties = {"custom_key": "custom_value", "number": 42}
        flag = FeatureFlagFactory(extended_properties=properties)

        assert flag.extended_properties == properties
        assert flag.extended_properties["custom_key"] == "custom_value"

    def test_organization_scoping(self, organization):
        """Test organization-scoped feature flags."""
        flag = FeatureFlagFactory(organization=organization)
        assert flag.organization == organization

    def test_created_by_tracking(self, user):
        """Test created_by field tracking."""
        flag = FeatureFlagFactory(created_by=user)
        assert flag.created_by == user

    def test_permanent_flag_property(self):
        """Test is_permanent flag property."""
        permanent_flag = FeatureFlagFactory(is_permanent=True)
        regular_flag = FeatureFlagFactory(is_permanent=False)

        assert permanent_flag.is_permanent is True
        assert regular_flag.is_permanent is False

    def test_requires_restart_property(self):
        """Test requires_restart flag property."""
        restart_flag = FeatureFlagFactory(requires_restart=True)
        regular_flag = FeatureFlagFactory(requires_restart=False)

        assert restart_flag.requires_restart is True
        assert regular_flag.requires_restart is False


@pytest.mark.django_db
@pytest.mark.models
class TestFeatureAccessModel:
    """Test cases for FeatureAccess model."""

    def test_create_feature_access(self, feature_flag, user):
        """Test creating a basic feature access rule."""
        access = FeatureAccessFactory(feature=feature_flag, user=user)
        assert access.feature == feature_flag
        assert access.user == user
        assert access.enabled is True
        assert access.created_at

    def test_feature_access_str_representation(self, feature_flag, user):
        """Test string representation of feature access."""
        access = FeatureAccessFactory(feature=feature_flag, user=user, enabled=True)
        expected = f"{feature_flag.key} -> {user.email} (ENABLED)"
        assert str(access) == expected

        access.enabled = False
        expected = f"{feature_flag.key} -> {user.email} (DISABLED)"
        assert str(access) == expected

    def test_feature_access_role_representation(self, feature_flag):
        """Test string representation for role-based access."""
        access = FeatureAccessFactory(feature=feature_flag, role="ADMIN", enabled=True)
        expected = f"{feature_flag.key} -> role:ADMIN (ENABLED)"
        assert str(access) == expected

    def test_user_and_role_validation_failure(self, feature_flag, user):
        """Test that both user and role cannot be set."""
        access = FeatureAccessFactory.build(
            feature=feature_flag, user=user, role="ADMIN"
        )

        with pytest.raises(ValidationError) as exc_info:
            access.full_clean()

        assert "Cannot specify both user and role" in str(exc_info.value)

    def test_no_target_validation_failure(self, feature_flag):
        """Test that at least one target must be specified."""
        access = FeatureAccessFactory.build(
            feature=feature_flag, user=None, role=None, organization=None
        )

        with pytest.raises(ValidationError) as exc_info:
            access.full_clean()

        assert "At least one of user or role must be specified" in str(exc_info.value)

    def test_applies_to_user_with_user_rule(self, feature_flag, user):
        """Test applies_to_user for user-specific rule."""
        access = FeatureAccessFactory(feature=feature_flag, user=user)

        assert access.applies_to_user(user) is True

        other_user = UserFactory()
        assert access.applies_to_user(other_user) is False

    def test_applies_to_user_with_role_rule(self, feature_flag):
        """Test applies_to_user for role-based rule."""
        access = FeatureAccessFactory(feature=feature_flag, role="ADMIN")

        admin_user = UserFactory(role="ADMIN")
        regular_user = UserFactory(role="USER")

        assert access.applies_to_user(admin_user) is True
        assert access.applies_to_user(regular_user) is False

    def test_check_conditions_no_conditions(self, feature_flag, user):
        """Test check_conditions with no conditions set."""
        access = FeatureAccessFactory(feature=feature_flag, user=user, conditions={})
        assert access.check_conditions(user) is True

    def test_check_conditions_min_account_age(self, feature_flag):
        """Test check_conditions with minimum account age."""
        old_user = UserFactory(date_joined=timezone.now() - timedelta(days=10))
        new_user = UserFactory(date_joined=timezone.now() - timedelta(days=3))

        conditions = {"min_account_age_days": 7}
        access = FeatureAccessFactory(
            feature=feature_flag, user=old_user, conditions=conditions
        )

        assert access.check_conditions(old_user) is True
        assert access.check_conditions(new_user) is False

    def test_check_conditions_email_verified(self, feature_flag):
        """Test check_conditions with email verification requirement."""
        verified_user = UserFactory(is_email_verified=True)
        unverified_user = UserFactory(is_email_verified=False)

        conditions = {"requires_email_verified": True}
        access = FeatureAccessFactory(
            feature=feature_flag, user=verified_user, conditions=conditions
        )

        assert access.check_conditions(verified_user) is True
        assert access.check_conditions(unverified_user) is False

    def test_check_conditions_multiple_conditions(self, feature_flag):
        """Test check_conditions with multiple conditions."""
        user = UserFactory(
            date_joined=timezone.now() - timedelta(days=10), is_email_verified=True
        )

        conditions = {"min_account_age_days": 7, "requires_email_verified": True}
        access = FeatureAccessFactory(
            feature=feature_flag, user=user, conditions=conditions
        )

        assert access.check_conditions(user) is True

        # Test user failing one condition
        user.is_email_verified = False
        assert access.check_conditions(user) is False

    def test_organization_access_rule(self, feature_flag, organization):
        """Test organization-specific access rule."""
        access = FeatureAccessFactory(
            feature=feature_flag, organization=organization, enabled=True
        )

        assert access.organization == organization
        assert access.user is None
        assert access.role is None

    def test_reason_field(self, feature_flag, user):
        """Test reason field for access rules."""
        reason = "User is a beta tester"
        access = FeatureAccessFactory(feature=feature_flag, user=user, reason=reason)

        assert access.reason == reason

    def test_unique_together_constraint(self, feature_flag, user):
        """Test that provider and provider_user_id combination is unique."""
        # This test is more relevant for the AccountAuthProvider model
        # For FeatureAccess, we test that duplicate rules can exist
        # (multiple rules for same feature-user combination are allowed)
        access1 = FeatureAccessFactory(feature=feature_flag, user=user, enabled=True)
        access2 = FeatureAccessFactory(feature=feature_flag, user=user, enabled=False)

        # Both should be able to exist
        assert access1.id != access2.id
        assert access1.feature == access2.feature
        assert access1.user == access2.user


@pytest.mark.django_db
@pytest.mark.models
class TestUserOnboardingProgressModel:
    """Test cases for UserOnboardingProgress model."""

    def test_create_onboarding_progress(self, user):
        """Test creating basic onboarding progress."""
        progress = UserOnboardingProgressFactory(user=user)
        assert progress.user == user
        assert progress.current_stage == OnboardingStageTypes.SIGNUP_COMPLETE.value
        assert progress.completed_stages == []
        assert progress.progress_percentage == 0
        assert progress.created_at

    def test_onboarding_progress_str_representation(self, user):
        """Test string representation of onboarding progress."""
        progress = UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.EMAIL_VERIFIED.value,
            progress_percentage=25,
        )
        expected = f"{user.email} - EMAIL_VERIFIED (25%)"
        assert str(progress) == expected

    def test_advance_to_stage(self, user):
        """Test advancing to a new stage."""
        progress = UserOnboardingProgressFactory(user=user)
        old_stage = progress.current_stage

        new_stage = OnboardingStageTypes.EMAIL_VERIFIED.value
        progress.advance_to_stage(new_stage)

        assert progress.current_stage == new_stage
        assert old_stage in progress.completed_stages
        assert progress.total_actions_completed == 1
        assert progress.progress_percentage > 0

    def test_mark_stage_completed(self, user):
        """Test marking a stage as completed without advancing."""
        progress = UserOnboardingProgressFactory(user=user)
        initial_stage = progress.current_stage

        stage_to_complete = OnboardingStageTypes.EMAIL_VERIFIED.value
        progress.mark_stage_completed(stage_to_complete)

        assert progress.current_stage == initial_stage  # Should not change
        assert stage_to_complete in progress.completed_stages
        assert progress.total_actions_completed == 1

    def test_has_completed_stage(self, user):
        """Test checking if a stage has been completed."""
        progress = UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.PROFILE_SETUP.value,
            completed_stages=[
                OnboardingStageTypes.SIGNUP_COMPLETE.value,
                OnboardingStageTypes.EMAIL_VERIFIED.value,
            ],
        )

        assert (
            progress.has_completed_stage(OnboardingStageTypes.EMAIL_VERIFIED.value)
            is True
        )
        assert (
            progress.has_completed_stage(OnboardingStageTypes.PROFILE_SETUP.value)
            is True
        )  # Current stage
        assert (
            progress.has_completed_stage(
                OnboardingStageTypes.ORGANIZATION_CREATED.value
            )
            is False
        )

    def test_get_next_stage(self, user):
        """Test getting the next recommended stage."""
        progress = UserOnboardingProgressFactory(
            user=user, current_stage=OnboardingStageTypes.EMAIL_VERIFIED.value
        )

        next_stage = progress.get_next_stage()
        assert next_stage == OnboardingStageTypes.PROFILE_SETUP.value

        # Test last stage
        progress.current_stage = OnboardingStageTypes.ONBOARDING_COMPLETE.value
        assert progress.get_next_stage() is None

    def test_is_onboarding_complete_by_stage(self, user):
        """Test is_onboarding_complete by current stage."""
        progress = UserOnboardingProgressFactory(
            user=user, current_stage=OnboardingStageTypes.ONBOARDING_COMPLETE.value
        )
        assert progress.is_onboarding_complete() is True

        progress.current_stage = OnboardingStageTypes.PROFILE_SETUP.value
        assert progress.is_onboarding_complete() is False

    def test_is_onboarding_complete_by_timestamp(self, user):
        """Test is_onboarding_complete by completion timestamp."""
        progress = UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.PROFILE_SETUP.value,
            onboarding_completed_at=timezone.now(),
        )
        assert progress.is_onboarding_complete() is True

    def test_calculate_progress_percentage(self, user):
        """Test progress percentage calculation."""
        total_stages = len(OnboardingStageTypes.choices())

        # Test with some completed stages
        progress = UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.PROFILE_SETUP.value,
            completed_stages=[
                OnboardingStageTypes.SIGNUP_COMPLETE.value,
                OnboardingStageTypes.EMAIL_VERIFIED.value,
            ],
        )

        progress._calculate_progress_percentage()

        # 2 completed + 0.5 for current = 2.5 out of total
        expected_percentage = int((2.5 / total_stages) * 100)
        assert progress.progress_percentage == expected_percentage

    def test_get_available_features_basic(self, user):
        """Test getting available features for basic progress."""
        progress = UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.EMAIL_VERIFIED.value,
            completed_stages=[OnboardingStageTypes.SIGNUP_COMPLETE.value],
        )

        features = progress.get_available_features()
        assert "basic_dashboard" in features

    def test_get_available_features_advanced(self, user):
        """Test getting available features for advanced progress."""
        progress = UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.ADVANCED_FEATURES.value,
            completed_stages=[
                OnboardingStageTypes.SIGNUP_COMPLETE.value,
                OnboardingStageTypes.EMAIL_VERIFIED.value,
                OnboardingStageTypes.PROFILE_SETUP.value,
                OnboardingStageTypes.ORGANIZATION_CREATED.value,
                OnboardingStageTypes.FIRST_TEAM_MEMBER.value,
                OnboardingStageTypes.FIRST_PROJECT.value,
            ],
        )

        features = progress.get_available_features()
        expected_features = [
            "basic_dashboard",
            "profile_customization",
            "team_features",
            "collaboration_tools",
            "project_management",
            "advanced_analytics",
        ]

        for feature in expected_features:
            assert feature in features

    def test_get_available_features_completed(self, user):
        """Test getting available features for completed onboarding."""
        progress = UserOnboardingProgressFactory(
            user=user, current_stage=OnboardingStageTypes.ONBOARDING_COMPLETE.value
        )

        features = progress.get_available_features()
        assert "all_features" in features

    def test_custom_data_field(self, user):
        """Test custom_data JSON field."""
        custom_data = {
            "source": "referral",
            "referrer_id": "user123",
            "campaign": "summer2024",
        }

        progress = UserOnboardingProgressFactory(user=user, custom_data=custom_data)

        assert progress.custom_data == custom_data
        assert progress.custom_data["source"] == "referral"

    def test_stage_timestamps(self, user):
        """Test stage timing fields."""
        progress = UserOnboardingProgressFactory(user=user)

        # stage_started_at should be set
        assert progress.stage_started_at is not None

        # last_activity_at should update on save
        old_activity = progress.last_activity_at
        progress.total_actions_completed += 1
        progress.save()

        assert progress.last_activity_at > old_activity

    def test_onboarding_completion_timestamp(self, user):
        """Test onboarding completion timestamp setting."""
        progress = UserOnboardingProgressFactory(user=user)
        assert progress.onboarding_completed_at is None

        # Advance to completion
        progress.advance_to_stage(OnboardingStageTypes.ONBOARDING_COMPLETE.value)
        assert progress.onboarding_completed_at is not None

    def test_one_to_one_relationship(self, user):
        """Test one-to-one relationship with user."""
        progress1 = UserOnboardingProgressFactory(user=user)

        # Trying to create another progress for same user should fail
        with pytest.raises(IntegrityError):
            UserOnboardingProgressFactory(user=user)

    def test_organization_inheritance(self, user, organization):
        """Test organization field inheritance from BaseFields."""
        progress = UserOnboardingProgressFactory(user=user, organization=organization)
        assert progress.organization == organization
