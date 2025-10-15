"""
Feature Flags Test Configuration and Fixtures.

Provides comprehensive pytest fixtures for testing feature flags,
access rules, onboarding progress, and related services.
"""

import pytest
from datetime import datetime, timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import Mock, patch

from ..models import FeatureFlag, FeatureAccess, UserOnboardingProgress
from ..services import FeatureFlagService, OnboardingService, FeatureFlagCacheService
from ..enums import OnboardingStageTypes
from .factories import (
    FeatureFlagFactory,
    FeatureAccessFactory,
    UserOnboardingProgressFactory,
    UserFactory,
    OrganizationFactory
)

User = get_user_model()


# Base fixtures
@pytest.fixture(autouse=True)
def clear_cache():
    """Clear all caches before each test."""
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def user(db):
    """Create a test user."""
    return UserFactory()


@pytest.fixture
def admin_user(db):
    """Create an admin user."""
    return UserFactory(is_staff=True, is_superuser=True)


@pytest.fixture
def org_admin_user(db):
    """Create an organization admin user."""
    return UserFactory(is_org_admin=True)


@pytest.fixture
def organization(db):
    """Create a test organization."""
    return OrganizationFactory()


@pytest.fixture
def user_with_org(db, organization):
    """Create a user with an organization."""
    user = UserFactory()
    # Create organization membership
    from apps.organizations.models import OrganizationMembership
    OrganizationMembership.objects.create(
        user=user,
        organization=organization,
        role='member',
        status='active'
    )
    return user


@pytest.fixture
def admin_with_org(db, organization):
    """Create an admin user with an organization."""
    user = UserFactory(is_staff=True)  # Django staff user for DRF IsAdminUser permission
    from apps.organizations.models import OrganizationMembership
    OrganizationMembership.objects.create(
        user=user,
        organization=organization,
        role='admin',
        status='active'
    )
    return user


# API Client fixtures
@pytest.fixture
def api_client():
    """Create an API client."""
    return APIClient()


@pytest.fixture
def authenticated_api_client(api_client, user_with_org, organization):
    """Create an authenticated API client with organization context."""
    refresh = RefreshToken.for_user(user_with_org)
    api_client.credentials(
        HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}',
        HTTP_X_ORG_SLUG=organization.slug
    )
    return api_client


@pytest.fixture
def admin_api_client(api_client, admin_with_org, organization):
    """Create an admin API client with organization context."""
    refresh = RefreshToken.for_user(admin_with_org)
    api_client.credentials(
        HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}',
        HTTP_X_ORG_SLUG=organization.slug
    )
    return api_client


@pytest.fixture
def org_admin_api_client(api_client, admin_with_org, organization):
    """Create an organization admin API client with organization context."""
    refresh = RefreshToken.for_user(admin_with_org)
    api_client.credentials(
        HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}',
        HTTP_X_ORG_SLUG=organization.slug
    )
    return api_client


# Feature Flag fixtures
@pytest.fixture
def feature_flag(db):
    """Create a basic feature flag."""
    return FeatureFlagFactory()


@pytest.fixture
def enabled_feature_flag(db):
    """Create a globally enabled feature flag."""
    return FeatureFlagFactory(is_enabled_globally=True)


@pytest.fixture
def disabled_feature_flag(db):
    """Create a globally disabled feature flag."""
    return FeatureFlagFactory(is_enabled_globally=False)


@pytest.fixture
def rollout_feature_flag(db):
    """Create a feature flag with 50% rollout."""
    return FeatureFlagFactory(is_enabled_globally=False, rollout_percentage=50)


@pytest.fixture
def scheduled_feature_flag(db):
    """Create a feature flag scheduled for the future."""
    future_time = timezone.now() + timedelta(days=1)
    return FeatureFlagFactory(
        is_enabled_globally=True,
        active_from=future_time
    )


@pytest.fixture
def expired_feature_flag(db):
    """Create an expired feature flag."""
    past_time = timezone.now() - timedelta(days=1)
    return FeatureFlagFactory(
        is_enabled_globally=True,
        active_until=past_time
    )


@pytest.fixture
def org_scoped_feature_flag(db, organization):
    """Create an organization-scoped feature flag."""
    return FeatureFlagFactory(organization=organization)


# Feature Access fixtures
@pytest.fixture
def user_access_rule(db, feature_flag, user):
    """Create a user-specific access rule."""
    return FeatureAccessFactory(feature=feature_flag, user=user, enabled=True)


@pytest.fixture
def role_access_rule(db, feature_flag):
    """Create a role-based access rule."""
    return FeatureAccessFactory(feature=feature_flag, role='ADMIN', enabled=True)


@pytest.fixture
def org_access_rule(db, feature_flag, organization):
    """Create an organization-specific access rule."""
    return FeatureAccessFactory(
        feature=feature_flag, 
        organization=organization, 
        enabled=True
    )


@pytest.fixture
def disabled_access_rule(db, feature_flag, user):
    """Create a disabled user access rule."""
    return FeatureAccessFactory(feature=feature_flag, user=user, enabled=False)


@pytest.fixture
def conditional_access_rule(db, feature_flag, user):
    """Create an access rule with conditions."""
    conditions = {
        'min_account_age_days': 7,
        'requires_email_verified': True
    }
    return FeatureAccessFactory(
        feature=feature_flag,
        user=user,
        enabled=True,
        conditions=conditions
    )


# Onboarding fixtures
@pytest.fixture
def onboarding_progress(db, user):
    """Create basic onboarding progress."""
    return UserOnboardingProgressFactory(user=user)


@pytest.fixture
def email_verified_progress(db, user):
    """Create onboarding progress at email verified stage."""
    return UserOnboardingProgressFactory(
        user=user,
        current_stage=OnboardingStageTypes.EMAIL_VERIFIED.value,
        completed_stages=[OnboardingStageTypes.SIGNUP_COMPLETE.value],
        progress_percentage=25
    )


@pytest.fixture
def advanced_onboarding_progress(db, user):
    """Create advanced onboarding progress."""
    completed = [
        OnboardingStageTypes.SIGNUP_COMPLETE.value,
        OnboardingStageTypes.EMAIL_VERIFIED.value,
        OnboardingStageTypes.PROFILE_SETUP.value,
        OnboardingStageTypes.ORGANIZATION_CREATED.value,
    ]
    return UserOnboardingProgressFactory(
        user=user,
        current_stage=OnboardingStageTypes.FIRST_TEAM_MEMBER.value,
        completed_stages=completed,
        progress_percentage=75
    )


@pytest.fixture
def completed_onboarding_progress(db, user):
    """Create completed onboarding progress."""
    all_stages = [choice[0] for choice in OnboardingStageTypes.choices()]
    return UserOnboardingProgressFactory(
        user=user,
        current_stage=OnboardingStageTypes.ONBOARDING_COMPLETE.value,
        completed_stages=all_stages[:-1],  # All except the current one
        progress_percentage=100,
        onboarding_completed_at=timezone.now()
    )


# Service fixtures
@pytest.fixture
def feature_flag_service():
    """Create a feature flag service instance."""
    return FeatureFlagService(use_cache=False)  # Disable cache for predictable tests


@pytest.fixture
def cached_feature_flag_service():
    """Create a cached feature flag service instance."""
    return FeatureFlagService(use_cache=True)


@pytest.fixture
def onboarding_service():
    """Create an onboarding service instance."""
    return OnboardingService(use_cache=False)


@pytest.fixture
def cached_onboarding_service():
    """Create a cached onboarding service instance."""
    return OnboardingService(use_cache=True)


@pytest.fixture
def cache_service():
    """Create a cache service instance."""
    return FeatureFlagCacheService()


# Mock fixtures
@pytest.fixture
def mock_cache():
    """Mock the cache for testing cache behavior."""
    with patch('apps.feature_flags.services.cache_service.cache') as mock:
        mock.get.return_value = None
        mock.set.return_value = True
        mock.delete.return_value = True
        yield mock


@pytest.fixture
def mock_redis_cache():
    """Mock Redis cache with more realistic behavior."""
    mock_cache_data = {}
    
    def mock_get(key):
        return mock_cache_data.get(key)
    
    def mock_set(key, value, timeout=None):
        mock_cache_data[key] = value
        return True
    
    def mock_delete(key):
        return mock_cache_data.pop(key, None) is not None
    
    with patch('apps.feature_flags.services.cache_service.cache') as mock:
        mock.get.side_effect = mock_get
        mock.set.side_effect = mock_set
        mock.delete.side_effect = mock_delete
        yield mock


@pytest.fixture
def mock_logger():
    """Mock logger for testing log output."""
    with patch('apps.feature_flags.views.feature_flag_views.logger') as mock:
        yield mock


# Data fixtures
@pytest.fixture
def multiple_feature_flags(db):
    """Create multiple feature flags for testing."""
    flags = []
    flags.append(FeatureFlagFactory(key='analytics', name='Analytics', is_enabled_globally=True))
    flags.append(FeatureFlagFactory(key='reporting', name='Reporting', is_enabled_globally=False))
    flags.append(FeatureFlagFactory(key='premium', name='Premium Features', rollout_percentage=25))
    flags.append(FeatureFlagFactory(key='beta', name='Beta Features', is_enabled_globally=False))
    return flags


@pytest.fixture
def multiple_users(db, organization):
    """Create multiple users for testing."""
    users = []
    for i in range(5):
        user = UserFactory(email=f'user{i}@example.com')
        # Create organization membership
        from apps.organizations.models import OrganizationMembership
        OrganizationMembership.objects.create(
            user=user,
            organization=organization,
            role='member',
            status='active'
        )
        users.append(user)
    return users


@pytest.fixture
def complex_access_rules(db, multiple_feature_flags, multiple_users, organization):
    """Create a complex set of access rules for testing."""
    rules = []
    
    # User-specific rules
    rules.append(FeatureAccessFactory(
        feature=multiple_feature_flags[0],  # analytics
        user=multiple_users[0],
        enabled=True
    ))
    
    # Role-based rules
    rules.append(FeatureAccessFactory(
        feature=multiple_feature_flags[1],  # reporting
        role='ADMIN',
        enabled=True
    ))
    
    # Organization rules
    rules.append(FeatureAccessFactory(
        feature=multiple_feature_flags[2],  # premium
        organization=organization,
        enabled=True
    ))
    
    # Disabled rule
    rules.append(FeatureAccessFactory(
        feature=multiple_feature_flags[3],  # beta
        user=multiple_users[1],
        enabled=False
    ))
    
    return rules


# Time fixtures
@pytest.fixture
def freeze_time():
    """Freeze time for testing time-dependent features."""
    fixed_time = timezone.now().replace(microsecond=0)
    
    with patch('django.utils.timezone.now') as mock_now:
        mock_now.return_value = fixed_time
        yield fixed_time


@pytest.fixture
def past_time():
    """Provide a past timestamp."""
    return timezone.now() - timedelta(days=7)


@pytest.fixture
def future_time():
    """Provide a future timestamp."""
    return timezone.now() + timedelta(days=7)


# Test data fixtures
@pytest.fixture
def valid_flag_data():
    """Provide valid feature flag data for testing."""
    return {
        'key': 'test_feature',
        'name': 'Test Feature',
        'description': 'A test feature for testing',
        'is_enabled_globally': False,
        'rollout_percentage': 0,
        'is_permanent': False,
        'requires_restart': False,
        'environments': ['development', 'staging']
    }


@pytest.fixture
def valid_access_rule_data(feature_flag, user):
    """Provide valid access rule data for testing."""
    return {
        'feature': feature_flag.id,
        'user': user.id,
        'enabled': True,
        'reason': 'Test access rule'
    }


@pytest.fixture
def valid_onboarding_data():
    """Provide valid onboarding action data for testing."""
    return {
        'action': 'email_verified',
        'metadata': {
            'verification_method': 'email_link',
            'timestamp': timezone.now().isoformat()
        }
    }


# Performance test fixtures
@pytest.fixture
def performance_test_data(db):
    """Create data for performance testing."""
    # Create many flags and rules for performance testing
    flags = [
        FeatureFlagFactory(key=f'perf_flag_{i}')
        for i in range(50)
    ]
    
    users = [
        UserFactory(email=f'perf_user_{i}@example.com')
        for i in range(20)
    ]
    
    # Create many access rules
    rules = []
    for i, flag in enumerate(flags[:25]):  # Half the flags get rules
        for j, user in enumerate(users[:10]):  # Half the users get rules
            rules.append(FeatureAccessFactory(
                feature=flag,
                user=user,
                enabled=(i + j) % 2 == 0  # Mix of enabled/disabled
            ))
    
    return {
        'flags': flags,
        'users': users,
        'rules': rules
    }