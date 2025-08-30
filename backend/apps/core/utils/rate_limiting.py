"""
Rate limiting utilities and decorators for Django views.

This module provides comprehensive rate limiting functionality with Redis backend,
supporting IP-based, user-based, and email-based rate limiting strategies.
"""

import redis
import time
import logging
import hashlib
from functools import wraps
from typing import Optional, Dict, Any, Union, Callable
from django.conf import settings
from django.core.cache import cache
from django.http import HttpRequest
from apps.core.exceptions.client_errors import RateLimitException

logger = logging.getLogger(__name__)


class RateLimitExceeded(Exception):
    """Custom exception for rate limit exceeded scenarios"""
    def __init__(self, limit: str, reset_time: int):
        self.limit = limit
        self.reset_time = reset_time
        super().__init__(f"Rate limit exceeded: {limit}")


class RateLimiter:
    """
    Redis-backed rate limiter using sliding window algorithm.
    
    Supports multiple rate limiting strategies:
    - IP-based limiting
    - User-based limiting  
    - Email-based limiting
    - Custom key limiting
    """
    
    def __init__(self):
        self.redis_client = self._get_redis_client()
        self.enabled = getattr(settings, 'RATE_LIMITING', {}).get('ENABLED', True)
        
    def _get_redis_client(self) -> redis.Redis:
        """Get Redis client for rate limiting storage"""
        try:
            redis_url = getattr(settings, 'RATE_LIMITING', {}).get(
                'REDIS_URL', 
                'redis://redis:6379/1'
            )
            client = redis.from_url(redis_url, decode_responses=True)
            # Test connection
            client.ping()
            return client
        except Exception as e:
            logger.warning(f"Redis connection failed, using Django cache: {e}")
            return None
    
    def _parse_rate_limit(self, limit_str: str) -> tuple[int, int]:
        """
        Parse rate limit string like '100/hour' or '10/minute'
        Returns (count, seconds)
        """
        if not limit_str:
            return 0, 0
            
        try:
            count, period = limit_str.split('/')
            count = int(count)
            
            period_map = {
                'second': 1,
                'minute': 60,
                'hour': 3600,
                'day': 86400,
            }
            
            period_seconds = period_map.get(period, 3600)  # Default to hour
            return count, period_seconds
            
        except (ValueError, KeyError) as e:
            logger.warning(f"Invalid rate limit format '{limit_str}': {e}")
            return 0, 0
    
    def _get_rate_limit_key(self, key_type: str, identifier: str, endpoint: str = None) -> str:
        """Generate Redis key for rate limiting"""
        # Hash long identifiers to keep keys manageable
        if len(identifier) > 50:
            identifier = hashlib.md5(identifier.encode()).hexdigest()
            
        base_key = f"rate_limit:{key_type}:{identifier}"
        if endpoint:
            base_key += f":{endpoint}"
        return base_key
    
    def _check_rate_limit_redis(self, key: str, limit: int, window: int) -> tuple[bool, int]:
        """
        Check rate limit using Redis sliding window.
        Returns (allowed, reset_time)
        """
        if not self.redis_client:
            return True, 0  # Fallback: allow if Redis unavailable
            
        try:
            current_time = int(time.time())
            window_start = current_time - window
            
            pipe = self.redis_client.pipeline()
            
            # Remove expired entries
            pipe.zremrangebyscore(key, 0, window_start)
            
            # Count current requests in window  
            pipe.zcard(key)
            
            # Execute pipeline to get current count
            results = pipe.execute()
            current_count = results[1]  # Count after cleanup
            
            # Check if request is allowed
            allowed = current_count < limit
            
            if allowed:
                # Only add the request if it's allowed
                self.redis_client.zadd(key, {str(current_time): current_time})
                self.redis_client.expire(key, window)
            
            reset_time = current_time + window if not allowed else 0
            
            return allowed, reset_time
            
        except Exception as e:
            logger.error(f"Redis rate limit check failed: {e}")
            return True, 0  # Fallback: allow on error
    
    def _check_rate_limit_cache(self, key: str, limit: int, window: int) -> tuple[bool, int]:
        """
        Fallback rate limiting using Django cache.
        Less accurate but provides basic protection.
        """
        try:
            current_count = cache.get(key, 0)
            if current_count >= limit:
                return False, int(time.time()) + window
            
            cache.set(key, current_count + 1, window)
            return True, 0
            
        except Exception as e:
            logger.error(f"Cache rate limit check failed: {e}")
            return True, 0  # Fallback: allow on error
    
    def check_rate_limit(
        self, 
        key_type: str, 
        identifier: str, 
        limit_str: str, 
        endpoint: str = None
    ) -> tuple[bool, int]:
        """
        Check if request is within rate limit.
        
        Args:
            key_type: Type of rate limit ('ip', 'user', 'email', etc.)
            identifier: Unique identifier (IP address, user ID, email, etc.)
            limit_str: Rate limit string like '10/hour'
            endpoint: Optional endpoint name for endpoint-specific limits
            
        Returns:
            (allowed, reset_time): Boolean allowed and reset timestamp
        """
        if not self.enabled:
            return True, 0
            
        limit, window = self._parse_rate_limit(limit_str)
        if limit == 0:  # No limit or invalid format
            return True, 0
        
        key = self._get_rate_limit_key(key_type, identifier, endpoint)
        
        # Try Redis first, fall back to Django cache
        if self.redis_client:
            return self._check_rate_limit_redis(key, limit, window)
        else:
            return self._check_rate_limit_cache(key, limit, window)
    
    def get_client_ip(self, request: HttpRequest) -> str:
        """Get client IP address from request, handling proxies"""
        # Check for forwarded IPs (common in production behind load balancers)
        forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if forwarded_for:
            # Take the first IP in the chain
            ip = forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
        
        return ip
    
    def get_user_identifier(self, request: HttpRequest) -> Optional[str]:
        """Get user identifier for authenticated users"""
        if hasattr(request, 'user') and request.user.is_authenticated:
            return str(request.user.id)
        return None


# Global rate limiter instance
rate_limiter = RateLimiter()


def rate_limit(
    per_ip: Optional[str] = None,
    per_user: Optional[str] = None, 
    per_email: Optional[str] = None,
    endpoint: Optional[str] = None
) -> Callable:
    """
    Decorator for applying rate limiting to Django views.
    
    Args:
        per_ip: IP-based rate limit (e.g., '100/hour')
        per_user: User-based rate limit (e.g., '200/hour')
        per_email: Email-based rate limit (e.g., '5/hour')
        endpoint: Endpoint name for specific limits
        
    Example:
        @rate_limit(per_ip='10/hour', per_email='3/hour')
        def resend_email_view(request):
            pass
    """
    def decorator(view_func: Callable) -> Callable:
        @wraps(view_func)
        def wrapper(request: HttpRequest, *args, **kwargs):
            if not rate_limiter.enabled:
                return view_func(request, *args, **kwargs)
            
            client_ip = rate_limiter.get_client_ip(request)
            user_id = rate_limiter.get_user_identifier(request)
            endpoint_name = endpoint or getattr(view_func, '__name__', 'unknown')
            
            # Check IP-based rate limit
            if per_ip:
                allowed, reset_time = rate_limiter.check_rate_limit(
                    'ip', client_ip, per_ip, endpoint_name
                )
                if not allowed:
                    logger.warning(
                        f"Rate limit exceeded for IP {client_ip} on endpoint {endpoint_name}"
                    )
                    raise RateLimitException(
                        detail=f"Rate limit exceeded: {per_ip}. Try again later.",
                        reset_time=reset_time,
                        limit=per_ip
                    )
            
            # Check user-based rate limit
            if per_user and user_id:
                allowed, reset_time = rate_limiter.check_rate_limit(
                    'user', user_id, per_user, endpoint_name
                )
                if not allowed:
                    logger.warning(
                        f"Rate limit exceeded for user {user_id} on endpoint {endpoint_name}"
                    )
                    raise RateLimitException(
                        detail=f"Rate limit exceeded: {per_user}. Try again later.",
                        reset_time=reset_time,
                        limit=per_user
                    )
            
            # Check email-based rate limit (for email resend scenarios)
            if per_email and hasattr(request, 'data'):
                email = request.data.get('email')
                if email:
                    allowed, reset_time = rate_limiter.check_rate_limit(
                        'email', email, per_email, endpoint_name
                    )
                    if not allowed:
                        logger.warning(
                            f"Rate limit exceeded for email {email} on endpoint {endpoint_name}"
                        )
                        raise RateLimitException(
                            detail=f"Rate limit exceeded: {per_email}. Try again later.",
                            reset_time=reset_time,
                            limit=per_email
                        )
            
            return view_func(request, *args, **kwargs)
        
        return wrapper
    return decorator


class IPRateLimit:
    """IP-based rate limiting utility"""
    
    def __init__(self, limit: str):
        self.limit = limit
        
    def check(self, request: HttpRequest, endpoint: str = None) -> tuple[bool, int]:
        ip = rate_limiter.get_client_ip(request)
        return rate_limiter.check_rate_limit('ip', ip, self.limit, endpoint)


class UserRateLimit:
    """User-based rate limiting utility"""
    
    def __init__(self, limit: str):
        self.limit = limit
        
    def check(self, request: HttpRequest, endpoint: str = None) -> tuple[bool, int]:
        user_id = rate_limiter.get_user_identifier(request)
        if not user_id:
            return True, 0  # No limit for anonymous users
        return rate_limiter.check_rate_limit('user', user_id, self.limit, endpoint)


class EmailRateLimit:
    """Email-based rate limiting utility"""
    
    def __init__(self, limit: str):
        self.limit = limit
        
    def check(self, email: str, endpoint: str = None) -> tuple[bool, int]:
        return rate_limiter.check_rate_limit('email', email, self.limit, endpoint)