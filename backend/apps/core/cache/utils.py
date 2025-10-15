"""
Caching utility functions for performance optimization.
"""

import functools
from django.core.cache import cache
from django.conf import settings
from typing import Optional, Any, Callable


def cache_key(*parts) -> str:
    """
    Generate a cache key from parts.

    Example:
        cache_key('user', user_id, 'permissions') -> 'vasdj:user:123:permissions'
    """
    prefix = getattr(settings, 'CACHE_KEY_PREFIX', 'vasdj')
    return f"{prefix}:{':'.join(str(p) for p in parts)}"


def invalidate_cache(pattern: str):
    """
    Invalidate cache keys matching a pattern.
    Note: For production, use Redis SCAN command for efficiency.
    """
    # This is a simple implementation. For production with many keys,
    # consider using django-redis and its delete_pattern method
    try:
        from django_redis import get_redis_connection
        conn = get_redis_connection("default")
        # Use SCAN for efficient pattern-based deletion
        cursor = 0
        while True:
            cursor, keys = conn.scan(cursor, match=pattern, count=100)
            if keys:
                conn.delete(*keys)
            if cursor == 0:
                break
    except (ImportError, Exception):
        # Fallback: just clear the entire cache (not ideal for production)
        cache.clear()


def cached_property_method(timeout: int = 300):
    """
    Decorator for caching method results.

    Args:
        timeout: Cache timeout in seconds (default: 5 minutes)

    Example:
        @cached_property_method(timeout=600)
        def get_expensive_data(self, param):
            return compute_expensive_operation(param)
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(self, *args, **kwargs):
            # Generate cache key from object, method name, and arguments
            obj_id = getattr(self, 'id', id(self))
            key = cache_key(
                self.__class__.__name__,
                obj_id,
                func.__name__,
                *args,
                *sorted(kwargs.items())
            )

            # Try to get from cache
            result = cache.get(key)
            if result is not None:
                return result

            # Compute and cache
            result = func(self, *args, **kwargs)
            cache.set(key, result, timeout)
            return result

        return wrapper
    return decorator


def cache_user_permissions(user_id, organization_id, permissions: dict, timeout: int = 300):
    """
    Cache user permissions for an organization.

    Args:
        user_id: User UUID
        organization_id: Organization UUID
        permissions: Dictionary of permissions
        timeout: Cache timeout in seconds (default: 5 minutes)
    """
    key = cache_key('user', user_id, 'org', organization_id, 'permissions')
    cache.set(key, permissions, timeout)


def get_cached_user_permissions(user_id, organization_id) -> Optional[dict]:
    """
    Get cached user permissions for an organization.

    Args:
        user_id: User UUID
        organization_id: Organization UUID

    Returns:
        Cached permissions dictionary or None if not cached
    """
    key = cache_key('user', user_id, 'org', organization_id, 'permissions')
    return cache.get(key)


def invalidate_user_permissions(user_id, organization_id=None):
    """
    Invalidate cached user permissions.

    Args:
        user_id: User UUID
        organization_id: Optional organization UUID. If None, invalidates all orgs.
    """
    if organization_id:
        # Invalidate specific org permissions
        key = cache_key('user', user_id, 'org', organization_id, 'permissions')
        cache.delete(key)
    else:
        # Invalidate all permissions for user
        pattern = cache_key('user', user_id, 'org', '*', 'permissions')
        invalidate_cache(pattern)


def cache_organization_stats(organization_id, stats: dict, timeout: int = 600):
    """
    Cache organization statistics.

    Args:
        organization_id: Organization UUID
        stats: Dictionary of statistics
        timeout: Cache timeout in seconds (default: 10 minutes)
    """
    key = cache_key('org', organization_id, 'stats')
    cache.set(key, stats, timeout)


def get_cached_organization_stats(organization_id) -> Optional[dict]:
    """
    Get cached organization statistics.

    Args:
        organization_id: Organization UUID

    Returns:
        Cached stats dictionary or None if not cached
    """
    key = cache_key('org', organization_id, 'stats')
    return cache.get(key)


def invalidate_organization_cache(organization_id):
    """
    Invalidate all cached data for an organization.

    Args:
        organization_id: Organization UUID
    """
    pattern = cache_key('org', organization_id, '*')
    invalidate_cache(pattern)
