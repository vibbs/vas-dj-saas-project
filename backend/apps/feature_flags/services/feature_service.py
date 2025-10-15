"""
Feature Flag Evaluation Service.

Main service for evaluating feature flags based on user, role, organization,
and progressive onboarding criteria.
"""

from typing import Dict, List, Optional, Set, Any, Tuple
from django.conf import settings
from django.db import transaction
from django.utils import timezone
import logging

from ..models import FeatureFlag, FeatureAccess, UserOnboardingProgress
from .cache_service import FeatureFlagCacheService

logger = logging.getLogger(__name__)


class FeatureFlagService:
    """
    Central service for feature flag evaluation and management.
    
    Provides methods to:
    - Evaluate feature flags for users
    - Get user-specific feature sets
    - Manage progressive feature unlocking
    - Handle caching and performance optimization
    """
    
    def __init__(self, use_cache: bool = True):
        """
        Initialize the feature flag service.
        
        Args:
            use_cache: Whether to use Redis caching for performance
        """
        self.use_cache = use_cache
        self.cache_service = FeatureFlagCacheService
    
    def is_feature_enabled(self, user, flag_key: str, 
                          organization=None, force_refresh: bool = False) -> bool:
        """
        Check if a feature is enabled for a specific user.
        
        Args:
            user: User instance
            flag_key: Feature flag key to check
            organization: Optional organization context
            force_refresh: Skip cache and evaluate fresh
            
        Returns:
            True if feature is enabled, False otherwise
        """
        try:
            # Try cache first (unless force refresh)
            if self.use_cache and not force_refresh:
                cached_flags = self.cache_service.get_user_flags(
                    str(user.id), 
                    str(organization.id) if organization else None
                )
                if cached_flags is not None and flag_key in cached_flags:
                    logger.debug(f"Cache hit for flag {flag_key} and user {user.id}")
                    return cached_flags[flag_key]
            
            # Evaluate from database
            result = self._evaluate_flag_for_user(user, flag_key, organization)
            
            # Cache the result if caching is enabled
            if self.use_cache and result is not None:
                # Cache this single flag result
                user_flags = self.cache_service.get_user_flags(
                    str(user.id),
                    str(organization.id) if organization else None
                ) or {}
                user_flags[flag_key] = result
                
                self.cache_service.cache_user_flags(
                    str(user.id),
                    user_flags,
                    str(organization.id) if organization else None
                )
            
            return result if result is not None else False
            
        except Exception as e:
            logger.error(f"Error evaluating flag {flag_key} for user {user.id}: {str(e)}")
            return False
    
    def get_user_flags(self, user, organization=None, 
                      flag_keys: Optional[List[str]] = None,
                      force_refresh: bool = False) -> Dict[str, bool]:
        """
        Get all feature flags for a user.
        
        Args:
            user: User instance
            organization: Optional organization context
            flag_keys: Optional list of specific flags to evaluate
            force_refresh: Skip cache and evaluate fresh
            
        Returns:
            Dictionary of flag_key -> enabled boolean
        """
        try:
            user_id = str(user.id)
            org_id = str(organization.id) if organization else None
            
            # Try cache first (unless force refresh)
            if self.use_cache and not force_refresh:
                cached_flags = self.cache_service.get_user_flags(user_id, org_id)
                if cached_flags is not None:
                    logger.debug(f"Cache hit for user flags: {user_id}")
                    # If specific flags requested, filter the cached result
                    if flag_keys:
                        return {k: v for k, v in cached_flags.items() if k in flag_keys}
                    return cached_flags
            
            # Evaluate flags from database
            flags = self._evaluate_all_flags_for_user(user, organization, flag_keys)
            
            # Cache the results
            if self.use_cache:
                self.cache_service.cache_user_flags(user_id, flags, org_id)
            
            return flags
            
        except Exception as e:
            logger.error(f"Error getting flags for user {user.id}: {str(e)}")
            return {}
    
    def get_enabled_flags(self, user, organization=None,
                         flag_keys: Optional[List[str]] = None) -> List[str]:
        """
        Get list of enabled feature flag keys for a user.
        
        Args:
            user: User instance
            organization: Optional organization context
            flag_keys: Optional list of specific flags to check
            
        Returns:
            List of enabled feature flag keys
        """
        flags = self.get_user_flags(user, organization, flag_keys)
        return [key for key, enabled in flags.items() if enabled]
    
    def update_user_onboarding(self, user, new_stage: str, 
                              custom_data: Optional[Dict] = None) -> bool:
        """
        Update user onboarding progress and invalidate relevant caches.
        
        Args:
            user: User instance
            new_stage: New onboarding stage
            custom_data: Optional custom data to store
            
        Returns:
            True if update was successful
        """
        try:
            with transaction.atomic():
                progress, created = UserOnboardingProgress.objects.get_or_create(
                    user=user,
                    defaults={'current_stage': new_stage}
                )
                
                if not created and progress.current_stage != new_stage:
                    progress.advance_to_stage(new_stage)
                
                # Update custom data if provided
                if custom_data:
                    progress.custom_data.update(custom_data)
                    progress.save()
                
                # Invalidate user caches since onboarding affects feature access
                if self.use_cache:
                    self.cache_service.invalidate_all_user_caches(str(user.id))
                
                logger.info(f"Updated onboarding for user {user.id} to {new_stage}")
                return True
                
        except Exception as e:
            logger.error(f"Error updating onboarding for user {user.id}: {str(e)}")
            return False
    
    def create_feature_flag(self, key: str, name: str, description: str = "",
                           enabled_globally: bool = False, **kwargs) -> Optional[FeatureFlag]:
        """
        Create a new feature flag.
        
        Args:
            key: Unique flag key
            name: Human-readable name
            description: Flag description
            enabled_globally: Whether to enable globally
            **kwargs: Additional flag properties
            
        Returns:
            Created FeatureFlag instance or None if failed
        """
        try:
            flag = FeatureFlag.objects.create(
                key=key,
                name=name,
                description=description,
                is_enabled_globally=enabled_globally,
                **kwargs
            )
            
            logger.info(f"Created feature flag: {key}")
            return flag
            
        except Exception as e:
            logger.error(f"Error creating feature flag {key}: {str(e)}")
            return None
    
    def create_access_rule(self, flag_key: str, user=None, role: str = None,
                          enabled: bool = True, conditions: Optional[Dict] = None,
                          reason: str = "") -> Optional[FeatureAccess]:
        """
        Create a feature access rule.
        
        Args:
            flag_key: Feature flag key
            user: Optional user for user-specific rule
            role: Optional role for role-based rule
            enabled: Whether the rule grants or denies access
            conditions: Optional access conditions
            reason: Reason for the rule
            
        Returns:
            Created FeatureAccess instance or None if failed
        """
        try:
            flag = FeatureFlag.objects.get(key=flag_key)
            
            access_rule = FeatureAccess.objects.create(
                feature=flag,
                user=user,
                role=role,
                enabled=enabled,
                conditions=conditions or {},
                reason=reason
            )
            
            # Invalidate caches for affected users/roles
            if self.use_cache:
                if user:
                    self.cache_service.invalidate_user_flags(str(user.id))
                self.cache_service.invalidate_access_rules(flag_key)
            
            logger.info(f"Created access rule for flag {flag_key}")
            return access_rule
            
        except FeatureFlag.DoesNotExist:
            logger.error(f"Feature flag {flag_key} not found")
            return None
        except Exception as e:
            logger.error(f"Error creating access rule for {flag_key}: {str(e)}")
            return None
    
    def enable_flag_for_user(self, flag_key: str, user, reason: str = "") -> bool:
        """
        Enable a specific feature flag for a user.
        
        Args:
            flag_key: Feature flag key
            user: User instance
            reason: Reason for enabling
            
        Returns:
            True if successful
        """
        rule = self.create_access_rule(flag_key, user=user, enabled=True, reason=reason)
        return rule is not None
    
    def disable_flag_for_user(self, flag_key: str, user, reason: str = "") -> bool:
        """
        Disable a specific feature flag for a user.
        
        Args:
            flag_key: Feature flag key
            user: User instance
            reason: Reason for disabling
            
        Returns:
            True if successful
        """
        rule = self.create_access_rule(flag_key, user=user, enabled=False, reason=reason)
        return rule is not None
    
    def enable_flag_for_role(self, flag_key: str, role: str, reason: str = "") -> bool:
        """
        Enable a specific feature flag for a role.
        
        Args:
            flag_key: Feature flag key
            role: Role name
            reason: Reason for enabling
            
        Returns:
            True if successful
        """
        rule = self.create_access_rule(flag_key, role=role, enabled=True, reason=reason)
        return rule is not None
    
    def invalidate_user_cache(self, user, organization=None) -> None:
        """
        Invalidate cached feature flags for a user.
        
        Args:
            user: User instance
            organization: Optional organization context
        """
        if self.use_cache:
            self.cache_service.invalidate_user_flags(
                str(user.id),
                str(organization.id) if organization else None
            )
    
    def invalidate_flag_cache(self, flag_key: str) -> None:
        """
        Invalidate all caches for a specific feature flag.
        
        Args:
            flag_key: Feature flag key
        """
        if self.use_cache:
            self.cache_service.invalidate_all_flag_caches(flag_key)
    
    def _evaluate_flag_for_user(self, user, flag_key: str, organization=None) -> Optional[bool]:
        """
        Internal method to evaluate a single flag for a user.

        Evaluation order (most specific to least specific):
        1. Scheduling checks (active_from/active_until)
        2. User-specific overrides (most specific)
        3. Role-based access
        4. Organization-specific access
        5. Global flag setting
        6. Rollout percentage
        7. Progressive onboarding unlocks

        Args:
            user: User instance
            flag_key: Feature flag key
            organization: Optional organization context

        Returns:
            True/False if flag found, None if not found
        """
        try:
            flag = FeatureFlag.objects.get(key=flag_key)

            # Check if flag is active based on scheduling
            if not flag.is_active_now():
                return False

            # 1. Check user-specific overrides FIRST (highest priority)
            user_access = FeatureAccess.objects.filter(
                feature=flag,
                user=user
            ).first()

            if user_access:
                if user_access.enabled and user_access.check_conditions(user):
                    return True
                elif not user_access.enabled:
                    # User-specific disable overrides everything
                    return False

            # 2. Check role-based access
            if hasattr(user, 'role') and user.role:
                role_access = FeatureAccess.objects.filter(
                    feature=flag,
                    role=user.role
                ).first()

                if role_access:
                    if role_access.enabled and role_access.check_conditions(user):
                        return True
                    elif not role_access.enabled:
                        return False

            # 3. Check organization-specific access (if organization context provided)
            if organization:
                org_access = FeatureAccess.objects.filter(
                    feature=flag,
                    organization=organization
                ).first()

                if org_access and org_access.enabled:
                    return True

            # 4. Check global flag
            if flag.is_enabled_globally:
                return True

            # 5. Check rollout percentage
            if flag.rollout_percentage > 0:
                if flag.is_in_rollout_percentage(str(user.id)):
                    return True

            # 6. Check progressive onboarding unlocks
            onboarding_unlocked = self._check_onboarding_unlock(user, flag_key)
            if onboarding_unlocked:
                return True

            # Default to disabled
            return False

        except FeatureFlag.DoesNotExist:
            logger.debug(f"Feature flag {flag_key} not found")
            return None
        except Exception as e:
            logger.error(f"Error evaluating flag {flag_key}: {str(e)}")
            return None
    
    def _evaluate_all_flags_for_user(self, user, organization=None, 
                                   flag_keys: Optional[List[str]] = None) -> Dict[str, bool]:
        """
        Internal method to evaluate all flags for a user.
        
        Args:
            user: User instance
            organization: Optional organization context
            flag_keys: Optional list of specific flags to evaluate
            
        Returns:
            Dictionary of flag_key -> enabled boolean
        """
        try:
            # Get all flags or specific ones
            flags_query = FeatureFlag.objects.all()
            if flag_keys:
                flags_query = flags_query.filter(key__in=flag_keys)
            
            flags = flags_query.select_related().prefetch_related('access_rules')
            result = {}
            
            for flag in flags:
                enabled = self._evaluate_single_flag(flag, user, organization)
                result[flag.key] = enabled
            
            return result
            
        except Exception as e:
            logger.error(f"Error evaluating all flags for user {user.id}: {str(e)}")
            return {}
    
    def _evaluate_single_flag(self, flag: FeatureFlag, user, organization=None) -> bool:
        """
        Evaluate a single flag instance for a user.
        
        Args:
            flag: FeatureFlag instance
            user: User instance
            organization: Optional organization context
            
        Returns:
            True if enabled, False otherwise
        """
        try:
            # Check if flag is active based on scheduling
            if not flag.is_active_now():
                return False
            
            # Same evaluation logic as _evaluate_flag_for_user
            # but working with flag instance directly
            
            if flag.is_enabled_globally:
                return True
            
            if flag.rollout_percentage > 0:
                if flag.is_in_rollout_percentage(str(user.id)):
                    return True
            
            # Check access rules
            for access_rule in flag.access_rules.all():
                if access_rule.applies_to_user(user):
                    if access_rule.enabled and access_rule.check_conditions(user):
                        return True
                    elif not access_rule.enabled:
                        return False
            
            # Check progressive onboarding
            if self._check_onboarding_unlock(user, flag.key):
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error evaluating flag {flag.key}: {str(e)}")
            return False
    
    def _check_onboarding_unlock(self, user, flag_key: str) -> bool:
        """
        Check if a feature should be unlocked based on onboarding progress.
        
        Args:
            user: User instance
            flag_key: Feature flag key
            
        Returns:
            True if feature should be unlocked
        """
        try:
            progress = UserOnboardingProgress.objects.filter(user=user).first()
            if not progress:
                return False
            
            available_features = progress.get_available_features()
            return flag_key in available_features
            
        except Exception as e:
            logger.error(f"Error checking onboarding unlock for {flag_key}: {str(e)}")
            return False
    
    def get_flag_statistics(self, flag_key: str) -> Dict[str, Any]:
        """
        Get usage statistics for a feature flag.
        
        Args:
            flag_key: Feature flag key
            
        Returns:
            Dictionary with flag statistics
        """
        try:
            flag = FeatureFlag.objects.get(key=flag_key)
            
            # Count access rules
            access_rules_count = flag.access_rules.count()
            enabled_rules_count = flag.access_rules.filter(enabled=True).count()
            
            # Get breakdown by type
            user_rules_count = flag.access_rules.filter(user__isnull=False).count()
            role_rules_count = flag.access_rules.filter(role__isnull=False).count()
            
            return {
                'flag_key': flag_key,
                'flag_name': flag.name,
                'is_enabled_globally': flag.is_enabled_globally,
                'rollout_percentage': flag.rollout_percentage,
                'is_active_now': flag.is_active_now(),
                'total_access_rules': access_rules_count,
                'enabled_access_rules': enabled_rules_count,
                'user_specific_rules': user_rules_count,
                'role_based_rules': role_rules_count,
                'active_from': flag.active_from,
                'active_until': flag.active_until,
                'created_at': flag.created_at,
                'updated_at': flag.updated_at,
            }
            
        except FeatureFlag.DoesNotExist:
            return {'error': f'Feature flag {flag_key} not found'}
        except Exception as e:
            return {'error': str(e)}
    
    def get_user_statistics(self, user) -> Dict[str, Any]:
        """
        Get feature flag statistics for a user.
        
        Args:
            user: User instance
            
        Returns:
            Dictionary with user flag statistics
        """
        try:
            user_flags = self.get_user_flags(user)
            enabled_count = sum(1 for enabled in user_flags.values() if enabled)
            
            # Get onboarding progress
            progress = UserOnboardingProgress.objects.filter(user=user).first()
            
            return {
                'user_id': str(user.id),
                'user_email': user.email,
                'total_flags_evaluated': len(user_flags),
                'enabled_flags_count': enabled_count,
                'disabled_flags_count': len(user_flags) - enabled_count,
                'enabled_flags': [k for k, v in user_flags.items() if v],
                'onboarding_stage': progress.current_stage if progress else None,
                'onboarding_progress': progress.progress_percentage if progress else 0,
            }
            
        except Exception as e:
            return {'error': str(e)}