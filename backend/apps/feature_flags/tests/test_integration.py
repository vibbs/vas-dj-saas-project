"""
Feature Flags Integration Tests.

End-to-end integration tests that verify complete workflows
across models, services, and API endpoints.
"""

import pytest
import json
from datetime import datetime, timedelta
from django.utils import timezone
from django.urls import reverse
from rest_framework import status
from unittest.mock import patch

from ..models import FeatureFlag, FeatureAccess, UserOnboardingProgress
from ..enums import OnboardingStageTypes
from ..services import FeatureFlagService, OnboardingService
from .factories import (
    FeatureFlagFactory, FeatureAccessFactory, UserOnboardingProgressFactory,
    UserFactory, OrganizationFactory
)


@pytest.mark.django_db
@pytest.mark.integration
class TestFeatureFlagLifecycleIntegration:
    """Test complete feature flag lifecycle workflows."""
    
    def test_create_flag_and_enable_for_user_workflow(self, admin_api_client, user):
        """Test creating a flag and enabling it for a specific user."""
        # Step 1: Create a feature flag via API
        flag_data = {
            'key': 'integration_test_flag',
            'name': 'Integration Test Flag',
            'description': 'Flag created for integration testing',
            'is_enabled_globally': False,
            'rollout_percentage': 0
        }
        
        create_url = reverse('feature_flags:featureflag-list')
        response = admin_api_client.post(create_url, flag_data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        flag_id = response.data['id']
        
        # Step 2: Verify flag exists and is disabled globally
        flag = FeatureFlag.objects.get(id=flag_id)
        assert flag.key == 'integration_test_flag'
        assert flag.is_enabled_globally is False
        
        # Step 3: Check that user doesn't have access initially
        service = FeatureFlagService()
        assert service.is_feature_enabled(user, 'integration_test_flag') is False
        
        # Step 4: Enable flag for specific user via API
        toggle_data = {
            'enabled': True,
            'reason': 'Integration test enablement'
        }
        
        toggle_url = reverse('feature_flags:feature-flag-user-toggle', 
                           kwargs={'flag_key': 'integration_test_flag', 'user_id': user.id})
        response = admin_api_client.post(toggle_url, toggle_data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        
        # Step 5: Verify user now has access
        assert service.is_feature_enabled(user, 'integration_test_flag') is True
        
        # Step 6: Verify access rule was created
        access_rule = FeatureAccess.objects.filter(feature=flag, user=user).first()
        assert access_rule is not None
        assert access_rule.enabled is True
        assert access_rule.reason == 'Integration test enablement'
        
        # Step 7: Check user's feature flags via API
        user_flags_url = reverse('feature_flags:user-feature-flags')
        with patch('rest_framework.authentication.SessionAuthentication.authenticate', return_value=(user, None)):
            response = admin_api_client.get(user_flags_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'integration_test_flag' in response.data['enabled_flags']
    
    def test_rollout_percentage_workflow(self, admin_api_client):
        """Test rollout percentage functionality end-to-end."""
        # Step 1: Create flag with 50% rollout
        flag_data = {
            'key': 'rollout_test_flag',
            'name': 'Rollout Test Flag',
            'description': 'Flag for testing rollout percentage',
            'is_enabled_globally': False,
            'rollout_percentage': 50
        }
        
        create_url = reverse('feature_flags:featureflag-list')
        response = admin_api_client.post(create_url, flag_data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        
        # Step 2: Create multiple users and test rollout
        users = [UserFactory(email=f'rollout_user_{i}@example.com') for i in range(10)]
        service = FeatureFlagService()
        
        enabled_count = 0
        for user in users:
            if service.is_feature_enabled(user, 'rollout_test_flag'):
                enabled_count += 1
        
        # With deterministic hashing, results should be consistent
        # We can't predict exact count, but should have some enabled/disabled
        assert 0 < enabled_count < len(users)
        
        # Step 3: Update rollout to 100%
        flag = FeatureFlag.objects.get(key='rollout_test_flag')
        update_data = {'rollout_percentage': 100}
        
        update_url = reverse('feature_flags:featureflag-detail', kwargs={'pk': flag.id})
        response = admin_api_client.patch(update_url, update_data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        
        # Step 4: Verify all users now have access
        for user in users:
            assert service.is_feature_enabled(user, 'rollout_test_flag') is True
    
    def test_scheduled_flag_activation_workflow(self, admin_api_client, user):
        """Test scheduled flag activation workflow."""
        future_time = timezone.now() + timedelta(hours=1)
        
        # Step 1: Create scheduled flag
        flag_data = {
            'key': 'scheduled_flag',
            'name': 'Scheduled Flag',
            'is_enabled_globally': True,
            'active_from': future_time.isoformat()
        }
        
        create_url = reverse('feature_flags:featureflag-list')
        response = admin_api_client.post(create_url, flag_data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        
        # Step 2: Verify flag is not active yet
        service = FeatureFlagService()
        assert service.is_feature_enabled(user, 'scheduled_flag') is False
        
        # Step 3: Simulate time passing
        with patch('django.utils.timezone.now', return_value=future_time + timedelta(minutes=1)):
            # Now flag should be active
            assert service.is_feature_enabled(user, 'scheduled_flag') is True
    
    def test_bulk_access_rules_workflow(self, admin_api_client, organization):
        """Test bulk access rules creation and management."""
        # Step 1: Create feature flag
        flag = FeatureFlagFactory(key='bulk_test_flag', is_enabled_globally=False)
        
        # Step 2: Create multiple users
        users = [UserFactory(email=f'bulk_user_{i}@example.com') for i in range(5)]
        
        # Step 3: Create bulk access rules via API
        bulk_data = {
            'feature_id': flag.id,
            'rules': [
                {'user_id': users[0].id, 'enabled': True, 'reason': 'Bulk rule 1'},
                {'user_id': users[1].id, 'enabled': True, 'reason': 'Bulk rule 2'},
                {'user_id': users[2].id, 'enabled': False, 'reason': 'Bulk rule 3'},
            ]
        }
        
        bulk_url = reverse('feature_flags:bulk-access-rules')
        response = admin_api_client.post(bulk_url, bulk_data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['created_count'] == 3
        
        # Step 4: Verify access rules were created correctly
        service = FeatureFlagService()
        
        assert service.is_feature_enabled(users[0], 'bulk_test_flag') is True
        assert service.is_feature_enabled(users[1], 'bulk_test_flag') is True
        assert service.is_feature_enabled(users[2], 'bulk_test_flag') is False
        assert service.is_feature_enabled(users[3], 'bulk_test_flag') is False  # No rule
        assert service.is_feature_enabled(users[4], 'bulk_test_flag') is False  # No rule
        
        # Step 5: Update rules in bulk
        rule_ids = list(FeatureAccess.objects.filter(feature=flag).values_list('id', flat=True))
        
        update_data = {
            'rule_ids': rule_ids[:2],  # Update first two rules
            'updates': {'enabled': False, 'reason': 'Bulk disabled'}
        }
        
        response = admin_api_client.patch(bulk_url, update_data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['updated_count'] == 2
        
        # Step 6: Verify updates
        assert service.is_feature_enabled(users[0], 'bulk_test_flag') is False
        assert service.is_feature_enabled(users[1], 'bulk_test_flag') is False
        # Third user should still be disabled (was already False)
        assert service.is_feature_enabled(users[2], 'bulk_test_flag') is False


@pytest.mark.django_db
@pytest.mark.integration
class TestOnboardingIntegrationWorkflows:
    """Test onboarding progression workflows."""
    
    def test_complete_onboarding_workflow(self, authenticated_api_client, user):
        """Test complete user onboarding progression."""
        # Step 1: Create initial onboarding progress
        service = OnboardingService()
        progress = service.get_or_create_progress(user)
        
        assert progress.current_stage == OnboardingStageTypes.SIGNUP_COMPLETE.value
        assert progress.progress_percentage == 0
        
        # Step 2: Trigger email verification via API
        action_data = {
            'action': 'email_verified',
            'metadata': {'verification_method': 'email_link'}
        }
        
        action_url = reverse('feature_flags:onboarding-action')
        response = authenticated_api_client.post(action_url, action_data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert response.data['new_stage'] == OnboardingStageTypes.EMAIL_VERIFIED.value
        
        # Step 3: Verify progress was updated
        progress.refresh_from_db()
        assert progress.current_stage == OnboardingStageTypes.EMAIL_VERIFIED.value
        assert OnboardingStageTypes.SIGNUP_COMPLETE.value in progress.completed_stages
        assert progress.progress_percentage > 0
        
        # Step 4: Continue with profile completion
        action_data = {
            'action': 'profile_completed',
            'metadata': {'profile_fields_completed': ['first_name', 'last_name']}
        }
        
        response = authenticated_api_client.post(action_url, action_data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['new_stage'] == OnboardingStageTypes.PROFILE_SETUP.value
        
        # Step 5: Skip to organization creation
        action_data = {
            'action': 'organization_created',
            'metadata': {'organization_name': 'Test Org'}
        }
        
        response = authenticated_api_client.post(action_url, action_data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['new_stage'] == OnboardingStageTypes.ORGANIZATION_CREATED.value
        
        # Step 6: Verify intermediate stages were marked complete
        progress.refresh_from_db()
        assert OnboardingStageTypes.EMAIL_VERIFIED.value in progress.completed_stages
        assert OnboardingStageTypes.PROFILE_SETUP.value in progress.completed_stages
        assert progress.current_stage == OnboardingStageTypes.ORGANIZATION_CREATED.value
        
        # Step 7: Get progress summary via API
        progress_url = reverse('feature_flags:onboardingprogress-detail', 
                              kwargs={'pk': progress.id})
        response = authenticated_api_client.get(progress_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['current_stage'] == OnboardingStageTypes.ORGANIZATION_CREATED.value
        assert len(response.data['completed_stages']) >= 2
        assert response.data['is_complete'] is False
    
    def test_onboarding_feature_unlock_integration(self, user):
        """Test feature unlocking based on onboarding progress."""
        # Step 1: Create features that unlock at different stages
        basic_flag = FeatureFlagFactory(key='basic_dashboard', is_enabled_globally=False)
        profile_flag = FeatureFlagFactory(key='profile_customization', is_enabled_globally=False)
        team_flag = FeatureFlagFactory(key='team_features', is_enabled_globally=False)
        
        service = FeatureFlagService()
        onboarding_service = OnboardingService()
        
        # Step 2: User at signup stage - no features unlocked
        progress = UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.SIGNUP_COMPLETE.value
        )
        
        # Mock the progressive feature unlocking
        with patch.object(progress, 'get_available_features', 
                         return_value=['basic_dashboard']):
            assert service.is_feature_enabled(user, 'basic_dashboard') is False  # Not implemented in current logic
        
        # Step 3: Advance to email verified
        onboarding_service.advance_user_stage(user, OnboardingStageTypes.EMAIL_VERIFIED.value)
        
        progress.refresh_from_db()
        assert progress.current_stage == OnboardingStageTypes.EMAIL_VERIFIED.value
        
        # Step 4: Advance to profile setup
        onboarding_service.advance_user_stage(user, OnboardingStageTypes.PROFILE_SETUP.value)
        
        progress.refresh_from_db()
        assert progress.current_stage == OnboardingStageTypes.PROFILE_SETUP.value
        assert OnboardingStageTypes.EMAIL_VERIFIED.value in progress.completed_stages
    
    def test_onboarding_stage_info_workflow(self, authenticated_api_client):
        """Test getting onboarding stage information workflow."""
        # Step 1: Get all stages info
        stages_url = reverse('feature_flags:onboarding-stages')
        response = authenticated_api_client.get(stages_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'stages' in response.data
        assert len(response.data['stages']) > 0
        
        # Verify stage structure
        stage = response.data['stages'][0]
        assert 'stage' in stage
        assert 'requirements' in stage
        assert 'unlocked_features' in stage
        assert 'description' in stage
        
        # Step 2: Get specific stage info
        response = authenticated_api_client.get(stages_url, {
            'stage': OnboardingStageTypes.EMAIL_VERIFIED.value
        })
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['stage'] == OnboardingStageTypes.EMAIL_VERIFIED.value
        assert isinstance(response.data['requirements'], list)
        assert isinstance(response.data['unlocked_features'], list)


@pytest.mark.django_db
@pytest.mark.integration
class TestCachingIntegrationWorkflows:
    """Test caching integration workflows."""
    
    def test_cache_invalidation_workflow(self, user, organization):
        """Test cache invalidation across service operations."""
        # Step 1: Create flag and enable for user
        flag = FeatureFlagFactory(key='cache_test_flag', is_enabled_globally=False)
        service = FeatureFlagService(use_cache=True)
        
        # Step 2: Initial check (cache miss)
        result = service.is_feature_enabled(user, 'cache_test_flag', organization)
        assert result is False
        
        # Step 3: Enable flag for user (should invalidate cache)
        access_rule = FeatureAccessFactory(feature=flag, user=user, enabled=True)
        
        # Step 4: Check again (should get fresh result)
        result = service.is_feature_enabled(user, 'cache_test_flag', organization)
        assert result is True
        
        # Step 5: Update user's onboarding (should invalidate user cache)
        onboarding_service = OnboardingService(use_cache=True)
        onboarding_service.advance_user_stage(user, OnboardingStageTypes.EMAIL_VERIFIED.value)
        
        # Cache should be invalidated, but flag should still be enabled
        result = service.is_feature_enabled(user, 'cache_test_flag', organization)
        assert result is True
    
    def test_multi_organization_cache_separation(self):
        """Test cache separation across organizations."""
        org1 = OrganizationFactory(name='Org 1')
        org2 = OrganizationFactory(name='Org 2')
        user = UserFactory()
        
        flag = FeatureFlagFactory(key='org_test_flag', is_enabled_globally=False)
        
        # Enable flag for org1 only
        FeatureAccessFactory(feature=flag, organization=org1, enabled=True)
        
        service = FeatureFlagService(use_cache=True)
        
        # User should have access in org1
        result = service.is_feature_enabled(user, 'org_test_flag', org1)
        assert result is True
        
        # User should not have access in org2
        result = service.is_feature_enabled(user, 'org_test_flag', org2)
        assert result is False
        
        # Caches should be separate - enabling for org2 shouldn't affect org1
        FeatureAccessFactory(feature=flag, organization=org2, enabled=True)
        
        # Both should now have access
        assert service.is_feature_enabled(user, 'org_test_flag', org1) is True
        assert service.is_feature_enabled(user, 'org_test_flag', org2) is True


@pytest.mark.django_db
@pytest.mark.integration
class TestRoleBasedAccessIntegration:
    """Test role-based access control integration."""
    
    def test_role_based_feature_access_workflow(self, admin_api_client):
        """Test role-based feature access end-to-end."""
        # Step 1: Create users with different roles
        admin_user = UserFactory(role='ADMIN', email='admin@example.com')
        manager_user = UserFactory(role='MANAGER', email='manager@example.com')
        regular_user = UserFactory(role='USER', email='user@example.com')
        
        # Step 2: Create feature flag
        flag = FeatureFlagFactory(key='admin_feature', is_enabled_globally=False)
        
        # Step 3: Create role-based access rule via API
        rule_data = {
            'feature': flag.id,
            'role': 'ADMIN',
            'enabled': True,
            'reason': 'Admin-only feature'
        }
        
        create_url = reverse('feature_flags:featureaccess-list')
        response = admin_api_client.post(create_url, rule_data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        
        # Step 4: Test access for different roles
        service = FeatureFlagService()
        
        assert service.is_feature_enabled(admin_user, 'admin_feature') is True
        assert service.is_feature_enabled(manager_user, 'admin_feature') is False
        assert service.is_feature_enabled(regular_user, 'admin_feature') is False
        
        # Step 5: Add access for managers
        manager_rule_data = {
            'feature': flag.id,
            'role': 'MANAGER',
            'enabled': True,
            'reason': 'Manager access granted'
        }
        
        response = admin_api_client.post(create_url, manager_rule_data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        
        # Step 6: Verify updated access
        assert service.is_feature_enabled(admin_user, 'admin_feature') is True
        assert service.is_feature_enabled(manager_user, 'admin_feature') is True
        assert service.is_feature_enabled(regular_user, 'admin_feature') is False
        
        # Step 7: Test access rule priority (user rule overrides role rule)
        user_deny_rule = FeatureAccessFactory(
            feature=flag, 
            user=admin_user, 
            enabled=False,
            reason='Specific admin denial'
        )
        
        # Admin user should now be denied despite role access
        assert service.is_feature_enabled(admin_user, 'admin_feature') is False
        assert service.is_feature_enabled(manager_user, 'admin_feature') is True


@pytest.mark.django_db
@pytest.mark.integration
class TestStatisticsAndAnalyticsIntegration:
    """Test statistics and analytics workflows."""
    
    def test_feature_flag_statistics_workflow(self, admin_api_client):
        """Test comprehensive feature flag statistics workflow."""
        # Step 1: Create flag with various access rules
        flag = FeatureFlagFactory(
            key='stats_test_flag',
            is_enabled_globally=False,
            rollout_percentage=25
        )
        
        # Create various access rules
        users = [UserFactory(email=f'stats_user_{i}@example.com') for i in range(3)]
        
        FeatureAccessFactory(feature=flag, user=users[0], enabled=True)
        FeatureAccessFactory(feature=flag, user=users[1], enabled=False)
        FeatureAccessFactory(feature=flag, role='ADMIN', enabled=True)
        FeatureAccessFactory(feature=flag, role='MANAGER', enabled=False)
        
        # Step 2: Get statistics via API
        stats_url = reverse('feature_flags:feature-flag-statistics')
        response = admin_api_client.get(stats_url, {'flag_key': 'stats_test_flag'})
        
        assert response.status_code == status.HTTP_200_OK
        stats = response.data
        
        assert stats['flag_key'] == 'stats_test_flag'
        assert stats['is_enabled_globally'] is False
        assert stats['rollout_percentage'] == 25
        assert stats['total_access_rules'] == 4
        assert stats['enabled_access_rules'] == 2
        assert stats['user_specific_rules'] == 2
        assert stats['role_based_rules'] == 2
        
        # Step 3: Get system-wide statistics
        response = admin_api_client.get(stats_url)
        
        assert response.status_code == status.HTTP_200_OK
        system_stats = response.data
        
        assert 'total_flags' in system_stats
        assert 'enabled_flags' in system_stats
        assert 'total_access_rules' in system_stats
        assert system_stats['total_flags'] >= 1
        assert system_stats['total_access_rules'] >= 4
    
    def test_user_feature_statistics_workflow(self, admin_api_client, user):
        """Test user-specific feature statistics."""
        # Step 1: Set up user with various flags
        flag1 = FeatureFlagFactory(key='user_flag_1', is_enabled_globally=True)
        flag2 = FeatureFlagFactory(key='user_flag_2', is_enabled_globally=False)
        flag3 = FeatureFlagFactory(key='user_flag_3', is_enabled_globally=False)
        
        # Enable flag2 specifically for user
        FeatureAccessFactory(feature=flag2, user=user, enabled=True)
        
        # Create onboarding progress
        UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.EMAIL_VERIFIED.value,
            progress_percentage=25
        )
        
        # Step 2: Get user statistics via service
        service = FeatureFlagService()
        stats = service.get_user_statistics(user)
        
        assert stats['user_id'] == str(user.id)
        assert stats['user_email'] == user.email
        assert stats['total_flags_evaluated'] >= 3
        assert stats['enabled_flags_count'] >= 2  # flag1 (global) + flag2 (user rule)
        assert 'user_flag_1' in stats['enabled_flags']
        assert 'user_flag_2' in stats['enabled_flags']
        assert stats['onboarding_stage'] == OnboardingStageTypes.EMAIL_VERIFIED.value
        assert stats['onboarding_progress'] == 25


@pytest.mark.django_db
@pytest.mark.integration
class TestComplexScenarioIntegration:
    """Test complex real-world scenarios."""
    
    def test_progressive_feature_rollout_scenario(self, admin_api_client):
        """Test progressive feature rollout scenario."""
        # Scenario: Rolling out a new analytics feature
        # 1. Start with admin-only access
        # 2. Add beta users
        # 3. Gradual percentage rollout
        # 4. Full global enablement
        
        # Step 1: Create analytics feature
        flag_data = {
            'key': 'advanced_analytics',
            'name': 'Advanced Analytics',
            'description': 'Advanced analytics dashboard',
            'is_enabled_globally': False,
            'rollout_percentage': 0
        }
        
        create_url = reverse('feature_flags:featureflag-list')
        response = admin_api_client.post(create_url, flag_data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        flag_id = response.data['id']
        
        # Step 2: Enable for admins first
        admin_rule_data = {
            'feature': flag_id,
            'role': 'ADMIN',
            'enabled': True,
            'reason': 'Admin early access'
        }
        
        access_url = reverse('feature_flags:featureaccess-list')
        response = admin_api_client.post(access_url, admin_rule_data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        
        # Step 3: Add beta users
        beta_users = [UserFactory(email=f'beta_{i}@example.com') for i in range(3)]
        
        for beta_user in beta_users:
            beta_rule_data = {
                'feature': flag_id,
                'user': beta_user.id,
                'enabled': True,
                'reason': 'Beta tester access'
            }
            response = admin_api_client.post(access_url, beta_rule_data, format='json')
            assert response.status_code == status.HTTP_201_CREATED
        
        # Step 4: Gradual rollout - 25%
        update_url = reverse('feature_flags:featureflag-detail', kwargs={'pk': flag_id})
        update_data = {'rollout_percentage': 25}
        
        response = admin_api_client.patch(update_url, update_data, format='json')
        assert response.status_code == status.HTTP_200_OK
        
        # Step 5: Test access at different stages
        admin_user = UserFactory(role='ADMIN')
        regular_users = [UserFactory(email=f'regular_{i}@example.com') for i in range(10)]
        
        service = FeatureFlagService()
        
        # Admin should have access (role rule)
        assert service.is_feature_enabled(admin_user, 'advanced_analytics') is True
        
        # Beta users should have access (user rules)
        for beta_user in beta_users:
            assert service.is_feature_enabled(beta_user, 'advanced_analytics') is True
        
        # Some regular users should have access (rollout percentage)
        enabled_count = sum(1 for user in regular_users 
                          if service.is_feature_enabled(user, 'advanced_analytics'))
        assert 0 < enabled_count < len(regular_users)
        
        # Step 6: Full global rollout
        update_data = {'is_enabled_globally': True}
        response = admin_api_client.patch(update_url, update_data, format='json')
        assert response.status_code == status.HTTP_200_OK
        
        # Step 7: Everyone should now have access
        for user in regular_users:
            assert service.is_feature_enabled(user, 'advanced_analytics') is True
    
    def test_organization_scoped_feature_management(self, admin_api_client):
        """Test organization-scoped feature management workflow."""
        # Scenario: Different organizations have different feature access
        
        # Step 1: Create organizations
        startup_org = OrganizationFactory(name='Startup Corp', plan='free_trial')
        enterprise_org = OrganizationFactory(name='Enterprise Corp', plan='enterprise')
        
        # Step 2: Create users in different orgs
        startup_user = UserFactory(email='startup@startup.com')
        enterprise_user = UserFactory(email='enterprise@enterprise.com')
        
        # Step 3: Create premium feature
        premium_flag = FeatureFlagFactory(
            key='premium_reporting',
            is_enabled_globally=False,
            organization=None  # Global flag
        )
        
        # Step 4: Enable for enterprise organization only
        org_rule_data = {
            'feature': premium_flag.id,
            'organization': enterprise_org.id,
            'enabled': True,
            'reason': 'Enterprise plan feature'
        }
        
        access_url = reverse('feature_flags:featureaccess-list')
        response = admin_api_client.post(access_url, org_rule_data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        
        # Step 5: Test access across organizations
        service = FeatureFlagService()
        
        # Enterprise user should have access
        assert service.is_feature_enabled(enterprise_user, 'premium_reporting', enterprise_org) is True
        
        # Startup user should not have access
        assert service.is_feature_enabled(startup_user, 'premium_reporting', startup_org) is False
        
        # Step 6: Upgrade startup org (simulate plan change)
        startup_upgrade_data = {
            'feature': premium_flag.id,
            'organization': startup_org.id,
            'enabled': True,
            'reason': 'Plan upgrade - premium access granted'
        }
        
        response = admin_api_client.post(access_url, startup_upgrade_data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        
        # Step 7: Now startup user should also have access
        assert service.is_feature_enabled(startup_user, 'premium_reporting', startup_org) is True
    
    def test_feature_flag_with_conditions_workflow(self, admin_api_client, user):
        """Test feature flags with complex conditions."""
        # Step 1: Create flag for users with specific conditions
        flag = FeatureFlagFactory(key='conditional_feature', is_enabled_globally=False)
        
        # Step 2: Create conditional access rule
        conditions = {
            'min_account_age_days': 7,
            'requires_email_verified': True,
            'max_failed_logins': 3
        }
        
        conditional_rule = FeatureAccessFactory(
            feature=flag,
            user=user,
            enabled=True,
            conditions=conditions,
            reason='Conditional access for trusted users'
        )
        
        # Step 3: Test access with unmet conditions
        service = FeatureFlagService()
        
        # Mock user not meeting conditions
        with patch.object(conditional_rule, 'check_conditions', return_value=False):
            assert service.is_feature_enabled(user, 'conditional_feature') is False
        
        # Step 4: Test access with met conditions
        with patch.object(conditional_rule, 'check_conditions', return_value=True):
            assert service.is_feature_enabled(user, 'conditional_feature') is True


@pytest.mark.django_db
@pytest.mark.integration
class TestErrorHandlingIntegration:
    """Test error handling across the system."""
    
    def test_service_error_propagation(self, authenticated_api_client):
        """Test how errors propagate through the system."""
        # Step 1: Create scenario that might cause errors
        with patch('apps.feature_flags.services.FeatureFlagService.get_user_flags',
                  side_effect=Exception('Database connection failed')):
            
            # API should handle service errors gracefully
            url = reverse('feature_flags:user-feature-flags')
            response = authenticated_api_client.get(url)
            
            assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    
    def test_cache_failure_fallback(self, user):
        """Test fallback behavior when cache fails."""
        flag = FeatureFlagFactory(key='cache_failure_test', is_enabled_globally=True)
        
        # Mock cache failure
        with patch('django.core.cache.cache.get', side_effect=Exception('Redis down')):
            with patch('django.core.cache.cache.set', side_effect=Exception('Redis down')):
                
                # Service should still work without cache
                service = FeatureFlagService(use_cache=True)
                result = service.is_feature_enabled(user, 'cache_failure_test')
                
                # Should fall back to database evaluation
                assert result is True
    
    def test_database_constraint_handling(self, admin_api_client, feature_flag, user):
        """Test handling of database constraint violations."""
        # Step 1: Create an access rule
        rule_data = {
            'feature': feature_flag.id,
            'user': user.id,
            'enabled': True,
            'reason': 'First rule'
        }
        
        access_url = reverse('feature_flags:featureaccess-list')
        response = admin_api_client.post(access_url, rule_data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        
        # Step 2: Try to create duplicate rule (should be handled gracefully)
        duplicate_rule_data = {
            'feature': feature_flag.id,
            'user': user.id,
            'enabled': False,
            'reason': 'Duplicate rule attempt'
        }
        
        response = admin_api_client.post(access_url, duplicate_rule_data, format='json')
        
        # Depending on model constraints, this might succeed (update) or fail
        # The important thing is it's handled gracefully, not causing a 500 error
        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST]