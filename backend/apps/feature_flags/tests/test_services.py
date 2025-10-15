"""
Feature Flag Services Test Suite.

Comprehensive tests for all service classes with 90% coverage target.
Tests FeatureFlagService, FeatureFlagCacheService, and OnboardingService.
"""

import pytest
import json
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta
from django.utils import timezone
from django.core.cache import cache
from django.test import override_settings
from django.db import IntegrityError

from ..services import FeatureFlagService, FeatureFlagCacheService, OnboardingService
from ..models import FeatureFlag, FeatureAccess, UserOnboardingProgress
from ..enums import OnboardingStageTypes
from .factories import (
    FeatureFlagFactory, FeatureAccessFactory, UserOnboardingProgressFactory,
    UserFactory, OrganizationFactory
)


@pytest.mark.django_db
class TestFeatureFlagService:
    """Test suite for FeatureFlagService."""
    
    def test_init_with_cache(self):
        """Test service initialization with caching enabled."""
        service = FeatureFlagService(use_cache=True)
        assert service.use_cache is True
        assert service.cache_service == FeatureFlagCacheService
    
    def test_init_without_cache(self):
        """Test service initialization with caching disabled."""
        service = FeatureFlagService(use_cache=False)
        assert service.use_cache is False
        assert service.cache_service == FeatureFlagCacheService
    
    def test_is_feature_enabled_globally_enabled_flag(self, user, feature_flag_service):
        """Test feature flag that is globally enabled."""
        flag = FeatureFlagFactory(is_enabled_globally=True)
        
        result = feature_flag_service.is_feature_enabled(user, flag.key)
        
        assert result is True
    
    def test_is_feature_enabled_globally_disabled_flag(self, user, feature_flag_service):
        """Test feature flag that is globally disabled."""
        flag = FeatureFlagFactory(is_enabled_globally=False, rollout_percentage=0)
        
        result = feature_flag_service.is_feature_enabled(user, flag.key)
        
        assert result is False
    
    def test_is_feature_enabled_rollout_percentage(self, user, feature_flag_service):
        """Test feature flag with rollout percentage."""
        flag = FeatureFlagFactory(rollout_percentage=100)  # 100% rollout
        
        result = feature_flag_service.is_feature_enabled(user, flag.key)
        
        assert result is True
    
    def test_is_feature_enabled_user_specific_enabled(self, user, feature_flag_service):
        """Test feature flag with user-specific enabled rule."""
        flag = FeatureFlagFactory(is_enabled_globally=False)
        FeatureAccessFactory(feature=flag, user=user, enabled=True)
        
        result = feature_flag_service.is_feature_enabled(user, flag.key)
        
        assert result is True
    
    def test_is_feature_enabled_user_specific_disabled(self, user, feature_flag_service):
        """Test feature flag with user-specific disabled rule."""
        flag = FeatureFlagFactory(is_enabled_globally=True)
        FeatureAccessFactory(feature=flag, user=user, enabled=False)
        
        result = feature_flag_service.is_feature_enabled(user, flag.key)
        
        assert result is False
    
    def test_is_feature_enabled_role_based_access(self, feature_flag_service):
        """Test feature flag with role-based access."""
        user = UserFactory(role='ADMIN')
        flag = FeatureFlagFactory(is_enabled_globally=False)
        FeatureAccessFactory(feature=flag, role='ADMIN', enabled=True)
        
        result = feature_flag_service.is_feature_enabled(user, flag.key)
        
        assert result is True
    
    def test_is_feature_enabled_organization_access(self, organization, feature_flag_service):
        """Test feature flag with organization-specific access."""
        user = UserFactory()
        flag = FeatureFlagFactory(is_enabled_globally=False)
        FeatureAccessFactory(feature=flag, organization=organization, enabled=True)
        
        result = feature_flag_service.is_feature_enabled(user, flag.key, organization)
        
        assert result is True
    
    def test_is_feature_enabled_scheduled_future(self, user, feature_flag_service):
        """Test feature flag scheduled for future activation."""
        future_time = timezone.now() + timedelta(days=1)
        flag = FeatureFlagFactory(
            is_enabled_globally=True,
            active_from=future_time
        )
        
        result = feature_flag_service.is_feature_enabled(user, flag.key)
        
        assert result is False
    
    def test_is_feature_enabled_expired(self, user, feature_flag_service):
        """Test expired feature flag."""
        past_time = timezone.now() - timedelta(days=1)
        flag = FeatureFlagFactory(
            is_enabled_globally=True,
            active_until=past_time
        )
        
        result = feature_flag_service.is_feature_enabled(user, flag.key)
        
        assert result is False
    
    def test_is_feature_enabled_nonexistent_flag(self, user, feature_flag_service):
        """Test checking nonexistent feature flag."""
        result = feature_flag_service.is_feature_enabled(user, 'nonexistent_flag')
        
        assert result is False
    
    def test_is_feature_enabled_cache_hit(self, user, cached_feature_flag_service, mock_redis_cache):
        """Test cache hit scenario."""
        flag = FeatureFlagFactory(key='test_flag')
        mock_redis_cache.get.return_value = json.dumps({
            'flags': {'test_flag': True},
            'cached_at': timezone.now().isoformat(),
            'organization_id': None
        })
        
        result = cached_feature_flag_service.is_feature_enabled(user, 'test_flag')
        
        assert result is True
        mock_redis_cache.get.assert_called()
    
    def test_is_feature_enabled_force_refresh(self, user, cached_feature_flag_service):
        """Test force refresh bypasses cache."""
        flag = FeatureFlagFactory(is_enabled_globally=True)
        
        with patch.object(FeatureFlagCacheService, 'get_user_flags', return_value={'test_flag': False}):
            result = cached_feature_flag_service.is_feature_enabled(
                user, flag.key, force_refresh=True
            )
        
        assert result is True  # Should get fresh value, not cached
    
    def test_get_user_flags_multiple_flags(self, user, feature_flag_service):
        """Test getting multiple flags for a user."""
        flag1 = FeatureFlagFactory(is_enabled_globally=True)
        flag2 = FeatureFlagFactory(is_enabled_globally=False)
        flag3 = FeatureFlagFactory(rollout_percentage=100)
        
        flags = feature_flag_service.get_user_flags(user)
        
        assert isinstance(flags, dict)
        assert flag1.key in flags
        assert flag2.key in flags
        assert flag3.key in flags
        assert flags[flag1.key] is True
        assert flags[flag2.key] is False
        assert flags[flag3.key] is True
    
    def test_get_user_flags_specific_keys(self, user, feature_flag_service):
        """Test getting specific flags for a user."""
        flag1 = FeatureFlagFactory(is_enabled_globally=True)
        flag2 = FeatureFlagFactory(is_enabled_globally=False)
        FeatureFlagFactory(is_enabled_globally=True)  # Should be excluded
        
        flags = feature_flag_service.get_user_flags(user, flag_keys=[flag1.key, flag2.key])
        
        assert len(flags) == 2
        assert flag1.key in flags
        assert flag2.key in flags
    
    def test_get_user_flags_cache_miss(self, user, cached_feature_flag_service, mock_redis_cache):
        """Test cache miss scenario."""
        flag = FeatureFlagFactory(is_enabled_globally=True)
        mock_redis_cache.get.return_value = None
        
        flags = cached_feature_flag_service.get_user_flags(user)
        
        assert isinstance(flags, dict)
        mock_redis_cache.set.assert_called()
    
    def test_get_enabled_flags(self, user, feature_flag_service):
        """Test getting only enabled flags."""
        flag1 = FeatureFlagFactory(is_enabled_globally=True)
        flag2 = FeatureFlagFactory(is_enabled_globally=False)
        flag3 = FeatureFlagFactory(rollout_percentage=100)
        
        enabled_flags = feature_flag_service.get_enabled_flags(user)
        
        assert flag1.key in enabled_flags
        assert flag2.key not in enabled_flags
        assert flag3.key in enabled_flags
    
    def test_update_user_onboarding_new_user(self, user, feature_flag_service):
        """Test updating onboarding for new user."""
        result = feature_flag_service.update_user_onboarding(
            user, 
            OnboardingStageTypes.EMAIL_VERIFIED.value
        )
        
        assert result is True
        progress = UserOnboardingProgress.objects.get(user=user)
        assert progress.current_stage == OnboardingStageTypes.EMAIL_VERIFIED.value
    
    def test_update_user_onboarding_existing_progress(self, user, feature_flag_service):
        """Test updating onboarding for user with existing progress."""
        UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.SIGNUP_COMPLETE.value
        )
        
        result = feature_flag_service.update_user_onboarding(
            user,
            OnboardingStageTypes.EMAIL_VERIFIED.value,
            custom_data={'verification_method': 'email_link'}
        )
        
        assert result is True
        progress = UserOnboardingProgress.objects.get(user=user)
        assert progress.current_stage == OnboardingStageTypes.EMAIL_VERIFIED.value
        assert progress.custom_data['verification_method'] == 'email_link'
    
    def test_create_feature_flag_success(self, feature_flag_service):
        """Test successful feature flag creation."""
        flag = feature_flag_service.create_feature_flag(
            key='new_feature',
            name='New Feature',
            description='A test feature',
            enabled_globally=True
        )
        
        assert flag is not None
        assert flag.key == 'new_feature'
        assert flag.name == 'New Feature'
        assert flag.is_enabled_globally is True
    
    def test_create_feature_flag_duplicate_key(self, feature_flag_service):
        """Test creating flag with duplicate key."""
        FeatureFlagFactory(key='existing_feature')
        
        flag = feature_flag_service.create_feature_flag(
            key='existing_feature',
            name='Duplicate Feature'
        )
        
        assert flag is None
    
    def test_create_access_rule_success(self, user, feature_flag_service):
        """Test successful access rule creation."""
        flag = FeatureFlagFactory()
        
        rule = feature_flag_service.create_access_rule(
            flag.key,
            user=user,
            enabled=True,
            reason='Test rule'
        )
        
        assert rule is not None
        assert rule.feature == flag
        assert rule.user == user
        assert rule.enabled is True
    
    def test_create_access_rule_nonexistent_flag(self, user, feature_flag_service):
        """Test creating access rule for nonexistent flag."""
        rule = feature_flag_service.create_access_rule(
            'nonexistent_flag',
            user=user
        )
        
        assert rule is None
    
    def test_enable_flag_for_user(self, user, feature_flag_service):
        """Test enabling flag for specific user."""
        flag = FeatureFlagFactory()
        
        result = feature_flag_service.enable_flag_for_user(
            flag.key,
            user,
            reason='Testing user enablement'
        )
        
        assert result is True
        assert FeatureAccess.objects.filter(feature=flag, user=user, enabled=True).exists()
    
    def test_disable_flag_for_user(self, user, feature_flag_service):
        """Test disabling flag for specific user."""
        flag = FeatureFlagFactory()
        
        result = feature_flag_service.disable_flag_for_user(
            flag.key,
            user,
            reason='Testing user disablement'
        )
        
        assert result is True
        assert FeatureAccess.objects.filter(feature=flag, user=user, enabled=False).exists()
    
    def test_enable_flag_for_role(self, feature_flag_service):
        """Test enabling flag for specific role."""
        flag = FeatureFlagFactory()
        
        result = feature_flag_service.enable_flag_for_role(
            flag.key,
            'ADMIN',
            reason='Testing role enablement'
        )
        
        assert result is True
        assert FeatureAccess.objects.filter(feature=flag, role='ADMIN', enabled=True).exists()
    
    def test_invalidate_user_cache(self, user, cached_feature_flag_service):
        """Test invalidating user cache."""
        with patch.object(FeatureFlagCacheService, 'invalidate_user_flags') as mock_invalidate:
            cached_feature_flag_service.invalidate_user_cache(user)
            mock_invalidate.assert_called_once_with(str(user.id), None)
    
    def test_invalidate_flag_cache(self, cached_feature_flag_service):
        """Test invalidating flag cache."""
        with patch.object(FeatureFlagCacheService, 'invalidate_all_flag_caches') as mock_invalidate:
            cached_feature_flag_service.invalidate_flag_cache('test_flag')
            mock_invalidate.assert_called_once_with('test_flag')
    
    def test_get_flag_statistics(self, feature_flag_service):
        """Test getting flag statistics."""
        flag = FeatureFlagFactory(is_enabled_globally=True, rollout_percentage=50)
        user = UserFactory()
        FeatureAccessFactory(feature=flag, user=user, enabled=True)
        FeatureAccessFactory(feature=flag, role='ADMIN', enabled=False)
        
        stats = feature_flag_service.get_flag_statistics(flag.key)
        
        assert stats['flag_key'] == flag.key
        assert stats['is_enabled_globally'] is True
        assert stats['rollout_percentage'] == 50
        assert stats['total_access_rules'] == 2
        assert stats['enabled_access_rules'] == 1
        assert stats['user_specific_rules'] == 1
        assert stats['role_based_rules'] == 1
    
    def test_get_flag_statistics_nonexistent(self, feature_flag_service):
        """Test getting statistics for nonexistent flag."""
        stats = feature_flag_service.get_flag_statistics('nonexistent')
        
        assert 'error' in stats
    
    def test_get_user_statistics(self, user, feature_flag_service):
        """Test getting user statistics."""
        flag1 = FeatureFlagFactory(is_enabled_globally=True)
        flag2 = FeatureFlagFactory(is_enabled_globally=False)
        UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.EMAIL_VERIFIED.value,
            progress_percentage=25
        )
        
        stats = feature_flag_service.get_user_statistics(user)
        
        assert stats['user_id'] == str(user.id)
        assert stats['user_email'] == user.email
        assert stats['total_flags_evaluated'] >= 2
        assert stats['enabled_flags_count'] >= 1
        assert flag1.key in stats['enabled_flags']
        assert stats['onboarding_stage'] == OnboardingStageTypes.EMAIL_VERIFIED.value
        assert stats['onboarding_progress'] == 25
    
    def test_is_feature_enabled_error_handling(self, user, feature_flag_service):
        """Test error handling in is_feature_enabled."""
        with patch('apps.feature_flags.models.FeatureFlag.objects.get', side_effect=Exception('DB error')):
            result = feature_flag_service.is_feature_enabled(user, 'test_flag')
            assert result is False
    
    def test_get_user_flags_error_handling(self, user, feature_flag_service):
        """Test error handling in get_user_flags."""
        with patch('apps.feature_flags.models.FeatureFlag.objects.all', side_effect=Exception('DB error')):
            result = feature_flag_service.get_user_flags(user)
            assert result == {}
    
    def test_update_user_onboarding_error_handling(self, user, feature_flag_service):
        """Test error handling in update_user_onboarding."""
        with patch('apps.feature_flags.models.UserOnboardingProgress.objects.get_or_create', 
                  side_effect=Exception('DB error')):
            result = feature_flag_service.update_user_onboarding(user, 'test_stage')
            assert result is False


@pytest.mark.django_db
class TestFeatureFlagCacheService:
    """Test suite for FeatureFlagCacheService."""
    
    def test_get_user_flags_key_without_org(self):
        """Test generating cache key for user flags without organization."""
        key = FeatureFlagCacheService.get_user_flags_key('user123')
        
        assert key == 'ff:user_flags:user123'
    
    def test_get_user_flags_key_with_org(self):
        """Test generating cache key for user flags with organization."""
        key = FeatureFlagCacheService.get_user_flags_key('user123', 'org456')
        
        assert key == 'ff:user_flags:user123:org456'
    
    def test_get_flag_meta_key(self):
        """Test generating cache key for flag metadata."""
        key = FeatureFlagCacheService.get_flag_meta_key('test_flag')
        
        assert key == 'ff:flag_meta:test_flag'
    
    def test_get_access_rules_key(self):
        """Test generating cache key for access rules."""
        key = FeatureFlagCacheService.get_access_rules_key('test_flag')
        
        assert key == 'ff:access_rules:test_flag'
    
    def test_get_onboarding_key(self):
        """Test generating cache key for onboarding progress."""
        key = FeatureFlagCacheService.get_onboarding_key('user123')
        
        assert key == 'ff:onboarding:user123'
    
    def test_get_rollout_key(self):
        """Test generating cache key for rollout data."""
        key = FeatureFlagCacheService.get_rollout_key('test_flag')
        
        assert key == 'ff:rollout:test_flag'
    
    @patch('apps.feature_flags.services.cache_service.cache')
    def test_cache_user_flags_success(self, mock_cache):
        """Test successful caching of user flags."""
        flags = {'flag1': True, 'flag2': False}
        
        FeatureFlagCacheService.cache_user_flags('user123', flags)
        
        mock_cache.set.assert_called_once()
        call_args = mock_cache.set.call_args
        assert call_args[0][0] == 'ff:user_flags:user123'  # Cache key
        assert call_args[0][2] == 300  # Timeout
        
        # Verify cached data structure
        cached_data = json.loads(call_args[0][1])
        assert cached_data['flags'] == flags
        assert 'cached_at' in cached_data
    
    @patch('apps.feature_flags.services.cache_service.cache')
    def test_cache_user_flags_with_org(self, mock_cache):
        """Test caching user flags with organization context."""
        flags = {'flag1': True}
        
        FeatureFlagCacheService.cache_user_flags('user123', flags, 'org456')
        
        call_args = mock_cache.set.call_args
        assert call_args[0][0] == 'ff:user_flags:user123:org456'
        
        cached_data = json.loads(call_args[0][1])
        assert cached_data['organization_id'] == 'org456'
    
    @patch('apps.feature_flags.services.cache_service.cache')
    def test_cache_user_flags_custom_timeout(self, mock_cache):
        """Test caching user flags with custom timeout."""
        flags = {'flag1': True}
        
        FeatureFlagCacheService.cache_user_flags('user123', flags, timeout=600)
        
        call_args = mock_cache.set.call_args
        assert call_args[0][2] == 600  # Custom timeout
    
    @patch('apps.feature_flags.services.cache_service.cache')
    def test_get_user_flags_cache_hit(self, mock_cache):
        """Test retrieving user flags with cache hit."""
        cached_data = {
            'flags': {'flag1': True, 'flag2': False},
            'cached_at': timezone.now().isoformat(),
            'organization_id': None
        }
        mock_cache.get.return_value = json.dumps(cached_data)
        
        result = FeatureFlagCacheService.get_user_flags('user123')
        
        assert result == {'flag1': True, 'flag2': False}
        mock_cache.get.assert_called_once_with('ff:user_flags:user123')
    
    @patch('apps.feature_flags.services.cache_service.cache')
    def test_get_user_flags_cache_miss(self, mock_cache):
        """Test retrieving user flags with cache miss."""
        mock_cache.get.return_value = None
        
        result = FeatureFlagCacheService.get_user_flags('user123')
        
        assert result is None
    
    @patch('apps.feature_flags.services.cache_service.cache')
    def test_cache_flag_metadata(self, mock_cache):
        """Test caching flag metadata."""
        metadata = {'enabled': True, 'rollout': 50}
        
        FeatureFlagCacheService.cache_flag_metadata('test_flag', metadata)
        
        mock_cache.set.assert_called_once()
        call_args = mock_cache.set.call_args
        assert call_args[0][0] == 'ff:flag_meta:test_flag'
    
    @patch('apps.feature_flags.services.cache_service.cache')
    def test_get_flag_metadata_success(self, mock_cache):
        """Test retrieving flag metadata."""
        cached_data = {
            'metadata': {'enabled': True, 'rollout': 50},
            'cached_at': timezone.now().isoformat()
        }
        mock_cache.get.return_value = json.dumps(cached_data)
        
        result = FeatureFlagCacheService.get_flag_metadata('test_flag')
        
        assert result == {'enabled': True, 'rollout': 50}
    
    @patch('apps.feature_flags.services.cache_service.cache')
    def test_cache_access_rules(self, mock_cache):
        """Test caching access rules."""
        rules = [{'user': 'user123', 'enabled': True}]
        
        FeatureFlagCacheService.cache_access_rules('test_flag', rules)
        
        mock_cache.set.assert_called_once()
        call_args = mock_cache.set.call_args
        assert call_args[0][0] == 'ff:access_rules:test_flag'
    
    @patch('apps.feature_flags.services.cache_service.cache')
    def test_get_access_rules_success(self, mock_cache):
        """Test retrieving access rules."""
        cached_data = {
            'rules': [{'user': 'user123', 'enabled': True}],
            'cached_at': timezone.now().isoformat()
        }
        mock_cache.get.return_value = json.dumps(cached_data)
        
        result = FeatureFlagCacheService.get_access_rules('test_flag')
        
        assert result == [{'user': 'user123', 'enabled': True}]
    
    @patch('apps.feature_flags.services.cache_service.cache')
    def test_cache_onboarding_progress(self, mock_cache):
        """Test caching onboarding progress."""
        progress_data = {'stage': 'email_verified', 'percentage': 25}
        
        FeatureFlagCacheService.cache_onboarding_progress('user123', progress_data)
        
        mock_cache.set.assert_called_once()
        call_args = mock_cache.set.call_args
        assert call_args[0][0] == 'ff:onboarding:user123'
    
    @patch('apps.feature_flags.services.cache_service.cache')
    def test_get_onboarding_progress_success(self, mock_cache):
        """Test retrieving onboarding progress."""
        cached_data = {
            'progress': {'stage': 'email_verified', 'percentage': 25},
            'cached_at': timezone.now().isoformat()
        }
        mock_cache.get.return_value = json.dumps(cached_data)
        
        result = FeatureFlagCacheService.get_onboarding_progress('user123')
        
        assert result == {'stage': 'email_verified', 'percentage': 25}
    
    @patch('apps.feature_flags.services.cache_service.cache')
    def test_invalidate_user_flags(self, mock_cache):
        """Test invalidating user flags cache."""
        FeatureFlagCacheService.invalidate_user_flags('user123')
        
        mock_cache.delete.assert_called_once_with('ff:user_flags:user123')
    
    @patch('apps.feature_flags.services.cache_service.cache')
    def test_invalidate_user_flags_with_org(self, mock_cache):
        """Test invalidating user flags cache with organization."""
        FeatureFlagCacheService.invalidate_user_flags('user123', 'org456')
        
        mock_cache.delete.assert_called_once_with('ff:user_flags:user123:org456')
    
    @patch('apps.feature_flags.services.cache_service.cache')
    def test_invalidate_flag_metadata(self, mock_cache):
        """Test invalidating flag metadata cache."""
        FeatureFlagCacheService.invalidate_flag_metadata('test_flag')
        
        mock_cache.delete.assert_called_once_with('ff:flag_meta:test_flag')
    
    @patch('apps.feature_flags.services.cache_service.cache')
    def test_invalidate_access_rules(self, mock_cache):
        """Test invalidating access rules cache."""
        FeatureFlagCacheService.invalidate_access_rules('test_flag')
        
        mock_cache.delete.assert_called_once_with('ff:access_rules:test_flag')
    
    @patch('apps.feature_flags.services.cache_service.cache')
    def test_invalidate_onboarding_progress(self, mock_cache):
        """Test invalidating onboarding progress cache."""
        FeatureFlagCacheService.invalidate_onboarding_progress('user123')
        
        mock_cache.delete.assert_called_once_with('ff:onboarding:user123')
    
    @patch('apps.feature_flags.services.cache_service.cache')
    def test_invalidate_all_user_caches(self, mock_cache):
        """Test invalidating all user caches."""
        FeatureFlagCacheService.invalidate_all_user_caches('user123')
        
        # Should call delete twice (user flags and onboarding)
        assert mock_cache.delete.call_count == 2
    
    @patch('apps.feature_flags.services.cache_service.cache')
    def test_invalidate_all_flag_caches(self, mock_cache):
        """Test invalidating all flag caches."""
        FeatureFlagCacheService.invalidate_all_flag_caches('test_flag')
        
        # Should call delete 3 times (metadata, access rules, rollout)
        assert mock_cache.delete.call_count == 3
    
    @patch('apps.feature_flags.services.cache_service.cache')
    def test_get_cache_stats(self, mock_cache):
        """Test getting cache statistics."""
        stats = FeatureFlagCacheService.get_cache_stats()
        
        assert 'cache_backend' in stats
        assert 'prefixes' in stats
        assert 'timeouts' in stats
        assert stats['prefixes']['user_flags'] == 'ff:user_flags'
    
    @patch('apps.feature_flags.services.cache_service.cache')
    def test_cache_error_handling(self, mock_cache):
        """Test error handling in cache operations."""
        mock_cache.set.side_effect = Exception('Cache error')
        
        # Should not raise exception
        FeatureFlagCacheService.cache_user_flags('user123', {'flag1': True})
    
    @patch('apps.feature_flags.services.cache_service.cache')
    def test_get_error_handling(self, mock_cache):
        """Test error handling in cache retrieval."""
        mock_cache.get.side_effect = Exception('Cache error')
        
        result = FeatureFlagCacheService.get_user_flags('user123')
        assert result is None


@pytest.mark.django_db
class TestOnboardingService:
    """Test suite for OnboardingService."""
    
    def test_init_with_cache(self):
        """Test service initialization with caching enabled."""
        service = OnboardingService(use_cache=True)
        assert service.use_cache is True
        assert service.cache_service == FeatureFlagCacheService
    
    def test_init_without_cache(self):
        """Test service initialization with caching disabled."""
        service = OnboardingService(use_cache=False)
        assert service.use_cache is False
    
    def test_get_or_create_progress_new_user(self, user, onboarding_service):
        """Test creating progress for new user."""
        progress = onboarding_service.get_or_create_progress(user)
        
        assert progress is not None
        assert progress.user == user
        assert progress.current_stage == OnboardingStageTypes.SIGNUP_COMPLETE.value
        assert progress.completed_stages == []
        assert progress.progress_percentage == 0
    
    def test_get_or_create_progress_existing_user(self, user, onboarding_service):
        """Test getting progress for existing user."""
        existing_progress = UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.EMAIL_VERIFIED.value
        )
        
        progress = onboarding_service.get_or_create_progress(user)
        
        assert progress.id == existing_progress.id
        assert progress.current_stage == OnboardingStageTypes.EMAIL_VERIFIED.value
    
    def test_advance_user_stage_success(self, user, onboarding_service):
        """Test successful stage advancement."""
        UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.SIGNUP_COMPLETE.value
        )
        
        result = onboarding_service.advance_user_stage(
            user,
            OnboardingStageTypes.EMAIL_VERIFIED.value,
            custom_data={'method': 'email_link'}
        )
        
        assert result is True
        progress = UserOnboardingProgress.objects.get(user=user)
        assert progress.current_stage == OnboardingStageTypes.EMAIL_VERIFIED.value
        assert progress.custom_data['method'] == 'email_link'
        assert OnboardingStageTypes.SIGNUP_COMPLETE.value in progress.completed_stages
    
    def test_advance_user_stage_cache_invalidation(self, user, cached_onboarding_service):
        """Test cache invalidation during stage advancement."""
        UserOnboardingProgressFactory(user=user)
        
        with patch.object(FeatureFlagCacheService, 'invalidate_all_user_caches') as mock_invalidate:
            cached_onboarding_service.advance_user_stage(
                user,
                OnboardingStageTypes.EMAIL_VERIFIED.value
            )
            
            mock_invalidate.assert_called_once_with(str(user.id))
    
    def test_mark_stage_completed_success(self, user, onboarding_service):
        """Test marking stage as completed."""
        progress = UserOnboardingProgressFactory(user=user)
        
        result = onboarding_service.mark_stage_completed(
            user,
            OnboardingStageTypes.EMAIL_VERIFIED.value,
            custom_data={'timestamp': '2023-01-01'}
        )
        
        assert result is True
        progress.refresh_from_db()
        assert OnboardingStageTypes.EMAIL_VERIFIED.value in progress.completed_stages
        assert progress.custom_data['timestamp'] == '2023-01-01'
    
    def test_check_stage_requirements_email_verified(self, onboarding_service):
        """Test stage requirements checking for email verification."""
        user = UserFactory(is_email_verified=True)
        
        can_advance, missing = onboarding_service.check_stage_requirements(
            user,
            OnboardingStageTypes.EMAIL_VERIFIED.value
        )
        
        assert can_advance is True
        assert len(missing) == 0
    
    def test_check_stage_requirements_missing_email(self, onboarding_service):
        """Test stage requirements with missing email verification."""
        user = UserFactory(is_email_verified=False)
        
        can_advance, missing = onboarding_service.check_stage_requirements(
            user,
            OnboardingStageTypes.EMAIL_VERIFIED.value
        )
        
        assert can_advance is False
        assert 'email_verified' in missing
    
    def test_check_stage_requirements_profile_setup(self, onboarding_service):
        """Test stage requirements for profile setup."""
        user = UserFactory(first_name='John', last_name='Doe')
        
        can_advance, missing = onboarding_service.check_stage_requirements(
            user,
            OnboardingStageTypes.PROFILE_SETUP.value
        )
        
        assert can_advance is True
        assert len(missing) == 0
    
    def test_check_stage_requirements_missing_profile(self, onboarding_service):
        """Test stage requirements with missing profile data."""
        user = UserFactory(first_name='', last_name='')
        
        can_advance, missing = onboarding_service.check_stage_requirements(
            user,
            OnboardingStageTypes.PROFILE_SETUP.value
        )
        
        assert can_advance is False
        assert 'first_name' in missing
        assert 'last_name' in missing
    
    def test_auto_progress_user_success(self, user, onboarding_service):
        """Test successful auto-progression."""
        user.is_email_verified = True
        user.save()
        
        UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.SIGNUP_COMPLETE.value
        )
        
        new_stage = onboarding_service.auto_progress_user(user)
        
        assert new_stage == OnboardingStageTypes.EMAIL_VERIFIED.value
        progress = UserOnboardingProgress.objects.get(user=user)
        assert progress.current_stage == OnboardingStageTypes.EMAIL_VERIFIED.value
    
    def test_auto_progress_user_blocked(self, user, onboarding_service):
        """Test auto-progression blocked by requirements."""
        user.is_email_verified = False
        user.save()
        
        UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.SIGNUP_COMPLETE.value
        )
        
        new_stage = onboarding_service.auto_progress_user(user)
        
        assert new_stage is None
        progress = UserOnboardingProgress.objects.get(user=user)
        assert progress.current_stage == OnboardingStageTypes.SIGNUP_COMPLETE.value
    
    def test_handle_user_action_email_verified(self, user, onboarding_service):
        """Test handling email verification action."""
        UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.SIGNUP_COMPLETE.value
        )
        
        result = onboarding_service.handle_user_action(
            user,
            'email_verified',
            {'verification_method': 'email_link'}
        )
        
        assert result is True
        progress = UserOnboardingProgress.objects.get(user=user)
        assert progress.current_stage == OnboardingStageTypes.EMAIL_VERIFIED.value
    
    def test_handle_user_action_skip_stages(self, user, onboarding_service):
        """Test handling action that skips intermediate stages."""
        UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.SIGNUP_COMPLETE.value
        )
        
        result = onboarding_service.handle_user_action(
            user,
            'organization_created',
            {'org_name': 'Test Org'}
        )
        
        assert result is True
        progress = UserOnboardingProgress.objects.get(user=user)
        assert progress.current_stage == OnboardingStageTypes.ORGANIZATION_CREATED.value
        # Intermediate stages should be marked as completed
        assert OnboardingStageTypes.EMAIL_VERIFIED.value in progress.completed_stages
        assert OnboardingStageTypes.PROFILE_SETUP.value in progress.completed_stages
    
    def test_handle_user_action_unknown_action(self, user, onboarding_service):
        """Test handling unknown action."""
        UserOnboardingProgressFactory(user=user)
        
        result = onboarding_service.handle_user_action(user, 'unknown_action')
        
        assert result is True  # Should succeed but not change stage
    
    def test_get_user_progress_summary(self, user, onboarding_service):
        """Test getting user progress summary."""
        progress = UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.EMAIL_VERIFIED.value,
            completed_stages=[OnboardingStageTypes.SIGNUP_COMPLETE.value],
            progress_percentage=25,
            total_actions_completed=1
        )
        
        summary = onboarding_service.get_user_progress_summary(user)
        
        assert summary['user_id'] == str(user.id)
        assert summary['current_stage'] == OnboardingStageTypes.EMAIL_VERIFIED.value
        assert summary['progress_percentage'] == 25
        assert summary['total_actions_completed'] == 1
        assert summary['is_onboarding_complete'] is False
        assert 'available_features' in summary
        assert 'next_stage' in summary
    
    def test_get_stage_info(self, onboarding_service):
        """Test getting stage information."""
        info = onboarding_service.get_stage_info(OnboardingStageTypes.EMAIL_VERIFIED.value)
        
        assert info['stage'] == OnboardingStageTypes.EMAIL_VERIFIED.value
        assert 'requirements' in info
        assert 'unlocked_features' in info
        assert 'description' in info
        assert 'email_verified' in info['requirements']
        assert 'basic_dashboard' in info['unlocked_features']
    
    def test_get_stage_requirements_mapping(self, onboarding_service):
        """Test stage requirements mapping."""
        requirements = onboarding_service._get_stage_requirements(
            OnboardingStageTypes.PROFILE_SETUP.value
        )
        
        assert 'first_name' in requirements
        assert 'last_name' in requirements
    
    def test_get_stage_features_mapping(self, onboarding_service):
        """Test stage features mapping."""
        features = onboarding_service._get_stage_features(
            OnboardingStageTypes.EMAIL_VERIFIED.value
        )
        
        assert 'basic_dashboard' in features
    
    def test_get_stage_description(self, onboarding_service):
        """Test stage description generation."""
        description = onboarding_service._get_stage_description(
            OnboardingStageTypes.EMAIL_VERIFIED.value
        )
        
        assert 'email address' in description.lower()
    
    def test_check_requirement_email_verified(self, onboarding_service):
        """Test email verification requirement check."""
        user = UserFactory(is_email_verified=True)
        progress = UserOnboardingProgressFactory(user=user)
        
        result = onboarding_service._check_requirement(user, progress, 'email_verified')
        
        assert result is True
    
    def test_check_requirement_has_organization(self, organization, onboarding_service):
        """Test organization requirement check."""
        user = UserFactory()
        progress = UserOnboardingProgressFactory(user=user)
        
        # Mock the get_primary_organization method
        with patch.object(user, 'get_primary_organization', return_value=organization):
            result = onboarding_service._check_requirement(user, progress, 'has_organization')
            
            assert result is True
    
    def test_check_requirement_organization_members(self, organization, onboarding_service):
        """Test organization members requirement check."""
        user = UserFactory()
        progress = UserOnboardingProgressFactory(user=user)
        
        # Mock organization with members
        mock_org = Mock()
        mock_org.get_active_members_count.return_value = 3
        
        with patch.object(user, 'get_primary_organization', return_value=mock_org):
            result = onboarding_service._check_requirement(user, progress, 'organization_has_members')
            
            assert result is True
    
    def test_check_requirement_custom_data(self, user, onboarding_service):
        """Test custom data requirement check."""
        progress = UserOnboardingProgressFactory(
            user=user,
            custom_data={'project_created': True}
        )
        
        result = onboarding_service._check_requirement(user, progress, 'has_created_project')
        
        assert result is True
    
    def test_error_handling_advance_stage(self, user, onboarding_service):
        """Test error handling in advance_user_stage."""
        with patch('apps.feature_flags.models.UserOnboardingProgress.objects.get_or_create',
                  side_effect=Exception('DB error')):
            result = onboarding_service.advance_user_stage(user, 'test_stage')
            
            assert result is False
    
    def test_error_handling_check_requirements(self, user, onboarding_service):
        """Test error handling in check_stage_requirements."""
        with patch.object(onboarding_service, 'get_or_create_progress',
                         side_effect=Exception('Error')):
            can_advance, missing = onboarding_service.check_stage_requirements(user, 'test_stage')
            
            assert can_advance is False
            assert 'error_checking_requirements' in missing
    
    def test_error_handling_user_progress_summary(self, user, onboarding_service):
        """Test error handling in get_user_progress_summary."""
        with patch.object(onboarding_service, 'get_or_create_progress',
                         side_effect=Exception('Error')):
            summary = onboarding_service.get_user_progress_summary(user)
            
            assert 'error' in summary
    
    def test_error_handling_stage_info(self, onboarding_service):
        """Test error handling in get_stage_info."""
        with patch.object(onboarding_service, '_get_stage_requirements',
                         side_effect=Exception('Error')):
            info = onboarding_service.get_stage_info('test_stage')
            
            assert 'error' in info