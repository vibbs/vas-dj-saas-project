"""
Global rate limiting middleware for Django.

This middleware applies configurable rate limiting to all incoming requests
based on IP address, user authentication, and endpoint-specific rules.
"""

import logging
import time
from django.conf import settings
from django.http import JsonResponse
from django.urls import resolve
from django.utils.deprecation import MiddlewareMixin
from apps.core.utils.rate_limiting import rate_limiter
from apps.core.exceptions.client_errors import RateLimitException

logger = logging.getLogger(__name__)


class RateLimitMiddleware(MiddlewareMixin):
    """
    Global rate limiting middleware that applies to all requests.
    
    Features:
    - Global per-IP rate limiting
    - Per-user rate limiting for authenticated users
    - Endpoint-specific rate limiting overrides
    - Configurable via Django settings
    - Graceful fallback when Redis is unavailable
    """
    
    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.enabled = self._get_setting('ENABLED', True)
        self.global_limits = self._get_setting('DEFAULT_LIMITS', {})
        self.endpoint_limits = self._get_setting('ENDPOINT_LIMITS', {})
        
        # Paths to exclude from global rate limiting
        self.excluded_paths = self._get_setting('EXCLUDED_PATHS', [
            '/admin/',
            '/api/schema/',
            '/api/docs/',
            '/api/redoc/',
            '/health/',
            '/ping/',
        ])
        
    def _get_setting(self, key: str, default=None):
        """Get rate limiting setting from Django configuration"""
        rate_limiting_config = getattr(settings, 'RATE_LIMITING', {})
        return rate_limiting_config.get(key, default)
    
    def _should_skip_rate_limiting(self, request) -> bool:
        """Check if request should skip rate limiting"""
        if not self.enabled:
            return True
            
        # Skip for excluded paths
        path = request.path
        for excluded_path in self.excluded_paths:
            if path.startswith(excluded_path):
                return True
        
        # Skip for static files
        if path.startswith('/static/') or path.startswith('/media/'):
            return True
            
        return False
    
    def _get_endpoint_name(self, request) -> str:
        """Get endpoint name from URL resolution"""
        try:
            resolved = resolve(request.path)
            if resolved.url_name:
                return resolved.url_name
            elif resolved.view_name:
                return resolved.view_name.split('.')[-1]  # Get the last part
            else:
                # Fallback to view function name if available
                view_func = resolved.func
                if hasattr(view_func, '__name__'):
                    return view_func.__name__
                elif hasattr(view_func, 'view_class'):
                    return view_func.view_class.__name__
                else:
                    return 'unknown'
        except Exception:
            return 'unknown'
    
    def _apply_global_rate_limits(self, request, endpoint_name: str) -> None:
        """Apply global rate limiting rules"""
        client_ip = rate_limiter.get_client_ip(request)
        user_id = rate_limiter.get_user_identifier(request)
        
        # Apply global IP rate limit
        if 'PER_IP' in self.global_limits:
            allowed, reset_time = rate_limiter.check_rate_limit(
                'ip', client_ip, self.global_limits['PER_IP'], 'global'
            )
            if not allowed:
                logger.warning(f"Global IP rate limit exceeded for {client_ip}")
                raise RateLimitException(
                    detail=f"Global rate limit exceeded: {self.global_limits['PER_IP']}. Try again later.",
                    reset_time=reset_time,
                    limit=self.global_limits['PER_IP']
                )
        
        # Apply global user rate limit for authenticated users
        if user_id and 'PER_USER' in self.global_limits:
            allowed, reset_time = rate_limiter.check_rate_limit(
                'user', user_id, self.global_limits['PER_USER'], 'global'
            )
            if not allowed:
                logger.warning(f"Global user rate limit exceeded for user {user_id}")
                raise RateLimitException(
                    detail=f"Global rate limit exceeded: {self.global_limits['PER_USER']}. Try again later.",
                    reset_time=reset_time,
                    limit=self.global_limits['PER_USER']
                )
    
    def _apply_endpoint_rate_limits(self, request, endpoint_name: str) -> None:
        """Apply endpoint-specific rate limiting rules"""
        if endpoint_name not in self.endpoint_limits:
            return
            
        endpoint_config = self.endpoint_limits[endpoint_name]
        client_ip = rate_limiter.get_client_ip(request)
        user_id = rate_limiter.get_user_identifier(request)
        
        # Apply endpoint-specific IP rate limit
        if 'PER_IP' in endpoint_config:
            allowed, reset_time = rate_limiter.check_rate_limit(
                'ip', client_ip, endpoint_config['PER_IP'], endpoint_name
            )
            if not allowed:
                logger.warning(f"Endpoint IP rate limit exceeded for {client_ip} on {endpoint_name}")
                raise RateLimitException(
                    detail=f"Rate limit exceeded for this action: {endpoint_config['PER_IP']}. Try again later.",
                    reset_time=reset_time,
                    limit=endpoint_config['PER_IP']
                )
        
        # Apply endpoint-specific user rate limit
        if user_id and 'PER_USER' in endpoint_config:
            allowed, reset_time = rate_limiter.check_rate_limit(
                'user', user_id, endpoint_config['PER_USER'], endpoint_name
            )
            if not allowed:
                logger.warning(f"Endpoint user rate limit exceeded for user {user_id} on {endpoint_name}")
                raise RateLimitException(
                    detail=f"Rate limit exceeded for this action: {endpoint_config['PER_USER']}. Try again later.",
                    reset_time=reset_time,
                    limit=endpoint_config['PER_USER']
                )
        
        # Apply endpoint-specific email rate limit (if email is in request data)
        if 'PER_EMAIL' in endpoint_config and hasattr(request, '_body'):
            try:
                # Try to extract email from request data
                if hasattr(request, 'data'):
                    email = request.data.get('email')
                elif request.content_type == 'application/json':
                    import json
                    data = json.loads(request.body.decode('utf-8'))
                    email = data.get('email')
                else:
                    email = request.POST.get('email')
                
                if email:
                    allowed, reset_time = rate_limiter.check_rate_limit(
                        'email', email, endpoint_config['PER_EMAIL'], endpoint_name
                    )
                    if not allowed:
                        logger.warning(f"Endpoint email rate limit exceeded for {email} on {endpoint_name}")
                        raise RateLimitException(
                            detail=f"Rate limit exceeded for this email: {endpoint_config['PER_EMAIL']}. Try again later.",
                            reset_time=reset_time,
                            limit=endpoint_config['PER_EMAIL']
                        )
            except Exception as e:
                # Don't fail the request if we can't parse email
                logger.debug(f"Could not extract email for rate limiting: {e}")
    
    def _create_rate_limit_response(self, exception: RateLimitException) -> JsonResponse:
        """Create standardized rate limit response"""
        response_data = {
            "type": "https://docs.yourapp.com/problems/rate-limit-exceeded",
            "title": "Rate limit exceeded",
            "status": 429,
            "detail": exception.detail,
            "code": "VDJ-GEN-RATE-429",
            "i18nKey": "errors.rate_limit_exceeded",
        }
        
        # Add rate limit headers with safe fallbacks
        response = JsonResponse(response_data, status=429)
        
        # Safe access to reset_time
        reset_time = getattr(exception, 'reset_time', None)
        if reset_time:
            response['Retry-After'] = str(max(1, reset_time - int(time.time())))
            response['X-RateLimit-Reset'] = str(reset_time)
        else:
            response['Retry-After'] = '60'  # Default 1 minute
        
        # Safe access to limit
        limit = getattr(exception, 'limit', None)
        if limit:
            response['X-RateLimit-Limit'] = str(limit)
        
        return response
    
    def process_request(self, request):
        """Process incoming request for rate limiting"""
        if self._should_skip_rate_limiting(request):
            return None
        
        try:
            endpoint_name = self._get_endpoint_name(request)
            
            # Apply global rate limits
            self._apply_global_rate_limits(request, endpoint_name)
            
            # Apply endpoint-specific rate limits
            self._apply_endpoint_rate_limits(request, endpoint_name)
            
        except RateLimitException as e:
            return self._create_rate_limit_response(e)
        except Exception as e:
            # Don't fail requests due to rate limiting errors
            logger.error(f"Rate limiting error: {e}", exc_info=True)
        
        return None
    
    def process_response(self, request, response):
        """Add rate limiting headers to successful responses"""
        if self._should_skip_rate_limiting(request):
            return response
        
        try:
            # Add helpful headers for clients
            client_ip = rate_limiter.get_client_ip(request)
            
            # Add current IP-based rate limiting info
            if 'PER_IP' in self.global_limits:
                # This is informational only - we don't want to make additional Redis calls
                response['X-RateLimit-Policy'] = self.global_limits['PER_IP']
            
        except Exception as e:
            logger.debug(f"Error adding rate limit headers: {e}")
        
        return response


class RateLimitHeaderMiddleware(MiddlewareMixin):
    """
    Lightweight middleware to add rate limiting headers without enforcing limits.
    Useful for monitoring and client information.
    """
    
    def process_response(self, request, response):
        """Add informational rate limiting headers"""
        if not getattr(settings, 'RATE_LIMITING', {}).get('ENABLED', True):
            return response
        
        try:
            # Add informational headers
            response['X-RateLimit-Policy'] = 'See API documentation for limits'
            response['X-RateLimit-Service'] = 'VAS-DJ-API'
            
        except Exception:
            pass  # Don't fail on header errors
            
        return response