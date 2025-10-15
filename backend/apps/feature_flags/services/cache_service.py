"""
Feature Flag Cache Service.

Provides Redis-based caching for feature flag evaluations to improve performance
and reduce database load.
"""

import json
import hashlib
from typing import Dict, Any, Optional, List, Set
from django.core.cache import cache
from django.conf import settings
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


class FeatureFlagCacheService:
    """
    Service for caching feature flag evaluations and related data.
    
    Uses Redis through Django's cache framework to store:
    - User-specific feature flag evaluations
    - Feature flag metadata and rules
    - Onboarding progress data
    """
    
    # Cache key prefixes
    USER_FLAGS_PREFIX = "ff:user_flags"
    FLAG_META_PREFIX = "ff:flag_meta"
    ACCESS_RULES_PREFIX = "ff:access_rules"
    ONBOARDING_PREFIX = "ff:onboarding"
    ROLLOUT_PREFIX = "ff:rollout"
    
    # Cache timeouts (in seconds)
    USER_FLAGS_TIMEOUT = 300  # 5 minutes
    FLAG_META_TIMEOUT = 3600  # 1 hour
    ACCESS_RULES_TIMEOUT = 1800  # 30 minutes
    ONBOARDING_TIMEOUT = 600  # 10 minutes
    ROLLOUT_TIMEOUT = 3600  # 1 hour
    
    @classmethod
    def get_user_flags_key(cls, user_id: str, organization_id: Optional[str] = None) -> str:
        """Generate cache key for user's feature flags."""
        if organization_id:
            return f"{cls.USER_FLAGS_PREFIX}:{user_id}:{organization_id}"
        return f"{cls.USER_FLAGS_PREFIX}:{user_id}"
    
    @classmethod
    def get_flag_meta_key(cls, flag_key: str) -> str:
        """Generate cache key for feature flag metadata."""
        return f"{cls.FLAG_META_PREFIX}:{flag_key}"
    
    @classmethod
    def get_access_rules_key(cls, flag_key: str) -> str:
        """Generate cache key for feature flag access rules."""
        return f"{cls.ACCESS_RULES_PREFIX}:{flag_key}"
    
    @classmethod
    def get_onboarding_key(cls, user_id: str) -> str:
        """Generate cache key for user onboarding progress."""
        return f"{cls.ONBOARDING_PREFIX}:{user_id}"
    
    @classmethod
    def get_rollout_key(cls, flag_key: str) -> str:
        """Generate cache key for rollout percentage data."""
        return f"{cls.ROLLOUT_PREFIX}:{flag_key}"
    
    @classmethod
    def cache_user_flags(cls, user_id: str, flags: Dict[str, bool], 
                        organization_id: Optional[str] = None,
                        timeout: Optional[int] = None) -> None:
        """
        Cache user's feature flag evaluations.
        
        Args:
            user_id: User identifier
            flags: Dictionary of flag_key -> enabled boolean
            organization_id: Optional organization context
            timeout: Cache timeout in seconds
        """
        try:
            cache_key = cls.get_user_flags_key(user_id, organization_id)
            cache_timeout = timeout or cls.USER_FLAGS_TIMEOUT
            
            cache_data = {
                'flags': flags,
                'cached_at': timezone.now().isoformat(),
                'organization_id': organization_id
            }
            
            cache.set(cache_key, json.dumps(cache_data), cache_timeout)
            logger.debug(f"Cached user flags for {user_id}: {len(flags)} flags")
            
        except Exception as e:
            logger.error(f"Failed to cache user flags for {user_id}: {str(e)}")
    
    @classmethod
    def get_user_flags(cls, user_id: str, 
                      organization_id: Optional[str] = None) -> Optional[Dict[str, bool]]:
        """
        Retrieve cached user feature flags.
        
        Args:
            user_id: User identifier
            organization_id: Optional organization context
            
        Returns:
            Dictionary of flag_key -> enabled boolean or None if not cached
        """
        try:
            cache_key = cls.get_user_flags_key(user_id, organization_id)
            cached_data = cache.get(cache_key)
            
            if cached_data:
                data = json.loads(cached_data)
                logger.debug(f"Retrieved cached flags for {user_id}: {len(data['flags'])} flags")
                return data['flags']
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to retrieve cached flags for {user_id}: {str(e)}")
            return None
    
    @classmethod
    def cache_flag_metadata(cls, flag_key: str, metadata: Dict[str, Any],
                           timeout: Optional[int] = None) -> None:
        """
        Cache feature flag metadata.
        
        Args:
            flag_key: Feature flag key
            metadata: Flag metadata including global settings, rollout, etc.
            timeout: Cache timeout in seconds
        """
        try:
            cache_key = cls.get_flag_meta_key(flag_key)
            cache_timeout = timeout or cls.FLAG_META_TIMEOUT
            
            cache_data = {
                'metadata': metadata,
                'cached_at': timezone.now().isoformat()
            }
            
            cache.set(cache_key, json.dumps(cache_data), cache_timeout)
            logger.debug(f"Cached metadata for flag {flag_key}")
            
        except Exception as e:
            logger.error(f"Failed to cache metadata for flag {flag_key}: {str(e)}")
    
    @classmethod
    def get_flag_metadata(cls, flag_key: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve cached feature flag metadata.
        
        Args:
            flag_key: Feature flag key
            
        Returns:
            Flag metadata dictionary or None if not cached
        """
        try:
            cache_key = cls.get_flag_meta_key(flag_key)
            cached_data = cache.get(cache_key)
            
            if cached_data:
                data = json.loads(cached_data)
                return data['metadata']
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to retrieve cached metadata for flag {flag_key}: {str(e)}")
            return None
    
    @classmethod
    def cache_access_rules(cls, flag_key: str, rules: List[Dict[str, Any]],
                          timeout: Optional[int] = None) -> None:
        """
        Cache feature flag access rules.
        
        Args:
            flag_key: Feature flag key
            rules: List of access rule dictionaries
            timeout: Cache timeout in seconds
        """
        try:
            cache_key = cls.get_access_rules_key(flag_key)
            cache_timeout = timeout or cls.ACCESS_RULES_TIMEOUT
            
            cache_data = {
                'rules': rules,
                'cached_at': timezone.now().isoformat()
            }
            
            cache.set(cache_key, json.dumps(cache_data), cache_timeout)
            logger.debug(f"Cached {len(rules)} access rules for flag {flag_key}")
            
        except Exception as e:
            logger.error(f"Failed to cache access rules for flag {flag_key}: {str(e)}")
    
    @classmethod
    def get_access_rules(cls, flag_key: str) -> Optional[List[Dict[str, Any]]]:
        """
        Retrieve cached feature flag access rules.
        
        Args:
            flag_key: Feature flag key
            
        Returns:
            List of access rule dictionaries or None if not cached
        """
        try:
            cache_key = cls.get_access_rules_key(flag_key)
            cached_data = cache.get(cache_key)
            
            if cached_data:
                data = json.loads(cached_data)
                return data['rules']
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to retrieve cached access rules for flag {flag_key}: {str(e)}")
            return None
    
    @classmethod
    def cache_onboarding_progress(cls, user_id: str, progress_data: Dict[str, Any],
                                 timeout: Optional[int] = None) -> None:
        """
        Cache user onboarding progress.
        
        Args:
            user_id: User identifier
            progress_data: Onboarding progress data
            timeout: Cache timeout in seconds
        """
        try:
            cache_key = cls.get_onboarding_key(user_id)
            cache_timeout = timeout or cls.ONBOARDING_TIMEOUT
            
            cache_data = {
                'progress': progress_data,
                'cached_at': timezone.now().isoformat()
            }
            
            cache.set(cache_key, json.dumps(cache_data), cache_timeout)
            logger.debug(f"Cached onboarding progress for {user_id}")
            
        except Exception as e:
            logger.error(f"Failed to cache onboarding progress for {user_id}: {str(e)}")
    
    @classmethod
    def get_onboarding_progress(cls, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve cached user onboarding progress.
        
        Args:
            user_id: User identifier
            
        Returns:
            Onboarding progress data or None if not cached
        """
        try:
            cache_key = cls.get_onboarding_key(user_id)
            cached_data = cache.get(cache_key)
            
            if cached_data:
                data = json.loads(cached_data)
                return data['progress']
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to retrieve cached onboarding progress for {user_id}: {str(e)}")
            return None
    
    @classmethod
    def invalidate_user_flags(cls, user_id: str, 
                             organization_id: Optional[str] = None) -> None:
        """
        Invalidate cached user feature flags.
        
        Args:
            user_id: User identifier
            organization_id: Optional organization context
        """
        try:
            cache_key = cls.get_user_flags_key(user_id, organization_id)
            cache.delete(cache_key)
            logger.debug(f"Invalidated cached flags for user {user_id}")
            
        except Exception as e:
            logger.error(f"Failed to invalidate cached flags for user {user_id}: {str(e)}")
    
    @classmethod
    def invalidate_flag_metadata(cls, flag_key: str) -> None:
        """
        Invalidate cached feature flag metadata.
        
        Args:
            flag_key: Feature flag key
        """
        try:
            cache_key = cls.get_flag_meta_key(flag_key)
            cache.delete(cache_key)
            logger.debug(f"Invalidated cached metadata for flag {flag_key}")
            
        except Exception as e:
            logger.error(f"Failed to invalidate cached metadata for flag {flag_key}: {str(e)}")
    
    @classmethod
    def invalidate_access_rules(cls, flag_key: str) -> None:
        """
        Invalidate cached access rules for a feature flag.
        
        Args:
            flag_key: Feature flag key
        """
        try:
            cache_key = cls.get_access_rules_key(flag_key)
            cache.delete(cache_key)
            logger.debug(f"Invalidated cached access rules for flag {flag_key}")
            
        except Exception as e:
            logger.error(f"Failed to invalidate cached access rules for flag {flag_key}: {str(e)}")
    
    @classmethod
    def invalidate_onboarding_progress(cls, user_id: str) -> None:
        """
        Invalidate cached onboarding progress.
        
        Args:
            user_id: User identifier
        """
        try:
            cache_key = cls.get_onboarding_key(user_id)
            cache.delete(cache_key)
            logger.debug(f"Invalidated cached onboarding progress for user {user_id}")
            
        except Exception as e:
            logger.error(f"Failed to invalidate cached onboarding progress for user {user_id}: {str(e)}")
    
    @classmethod
    def invalidate_all_user_caches(cls, user_id: str) -> None:
        """
        Invalidate all cached data for a specific user.
        
        Args:
            user_id: User identifier
        """
        cls.invalidate_user_flags(user_id)
        cls.invalidate_onboarding_progress(user_id)
    
    @classmethod
    def invalidate_all_flag_caches(cls, flag_key: str) -> None:
        """
        Invalidate all cached data for a specific feature flag.
        
        Args:
            flag_key: Feature flag key
        """
        cls.invalidate_flag_metadata(flag_key)
        cls.invalidate_access_rules(flag_key)
        
        # Also invalidate rollout cache
        try:
            cache_key = cls.get_rollout_key(flag_key)
            cache.delete(cache_key)
        except Exception as e:
            logger.error(f"Failed to invalidate rollout cache for flag {flag_key}: {str(e)}")
    
    @classmethod
    def get_cache_stats(cls) -> Dict[str, Any]:
        """
        Get cache statistics for monitoring.
        
        Returns:
            Dictionary with cache statistics
        """
        try:
            # This would require Redis info commands
            # For now, return basic info
            return {
                'cache_backend': str(type(cache)),
                'prefixes': {
                    'user_flags': cls.USER_FLAGS_PREFIX,
                    'flag_meta': cls.FLAG_META_PREFIX,
                    'access_rules': cls.ACCESS_RULES_PREFIX,
                    'onboarding': cls.ONBOARDING_PREFIX,
                    'rollout': cls.ROLLOUT_PREFIX,
                },
                'timeouts': {
                    'user_flags': cls.USER_FLAGS_TIMEOUT,
                    'flag_meta': cls.FLAG_META_TIMEOUT,
                    'access_rules': cls.ACCESS_RULES_TIMEOUT,
                    'onboarding': cls.ONBOARDING_TIMEOUT,
                    'rollout': cls.ROLLOUT_TIMEOUT,
                }
            }
        except Exception as e:
            logger.error(f"Failed to get cache stats: {str(e)}")
            return {'error': str(e)}
    
    @classmethod
    def clear_all_feature_flag_caches(cls) -> None:
        """
        Clear all feature flag related caches.
        WARNING: This will clear all cached feature flag data.
        """
        try:
            # This is a simplified version - in production you might want
            # to use cache.delete_many() or Redis pipeline operations
            prefixes = [
                cls.USER_FLAGS_PREFIX,
                cls.FLAG_META_PREFIX,
                cls.ACCESS_RULES_PREFIX,
                cls.ONBOARDING_PREFIX,
                cls.ROLLOUT_PREFIX,
            ]
            
            # Note: This is not the most efficient way for Redis
            # In production, you'd want to use Redis SCAN with pattern matching
            logger.warning("Clearing all feature flag caches")
            
            # For now, just log the action
            # Implementation would depend on your cache backend
            
        except Exception as e:
            logger.error(f"Failed to clear all feature flag caches: {str(e)}")