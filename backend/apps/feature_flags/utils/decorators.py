"""
Feature Flag Decorators.

Provides decorators for view-level feature gating with proper
error handling and flexible configuration options.
"""

from functools import wraps
from django.http import Http404, JsonResponse
from django.core.exceptions import PermissionDenied
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def require_feature_flag(flag_key, fail_silently=False, custom_response=None,
                        check_organization=True, cache_enabled=True):
    """
    Decorator to require a feature flag to be enabled for view access.
    
    Args:
        flag_key (str): Feature flag key to check
        fail_silently (bool): If True, raise 404 instead of 403
        custom_response (callable): Custom response function for denied access
        check_organization (bool): Include organization context in flag evaluation
        cache_enabled (bool): Use caching for flag evaluation
    
    Usage:
        @require_feature_flag('advanced_analytics')
        def analytics_view(request):
            return render(request, 'analytics.html')
        
        @require_feature_flag('beta_feature', fail_silently=True)
        def beta_view(request):
            return JsonResponse({'message': 'Beta feature active'})
    """
    def decorator(view_func):
        @wraps(view_func)
        @login_required
        def wrapper(request, *args, **kwargs):
            from ..services import FeatureFlagService
            
            try:
                user = request.user
                organization = None
                
                if check_organization:
                    organization = user.get_primary_organization()
                
                service = FeatureFlagService(use_cache=cache_enabled)
                is_enabled = service.is_feature_enabled(user, flag_key, organization)
                
                if not is_enabled:
                    logger.warning(f"Access denied to {flag_key} for user {user.id}")
                    
                    # Custom response handler
                    if custom_response and callable(custom_response):
                        return custom_response(request, flag_key)
                    
                    # Default response based on fail_silently setting
                    if fail_silently:
                        raise Http404("Page not found")
                    
                    # Check if it's an AJAX request
                    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                        return JsonResponse({
                            'error': 'Feature not available',
                            'feature_flag': flag_key
                        }, status=403)
                    
                    # Default: raise PermissionDenied
                    raise PermissionDenied(f"Feature '{flag_key}' is not enabled for your account")
                
                # Feature is enabled, proceed with the view
                return view_func(request, *args, **kwargs)
                
            except Exception as e:
                logger.error(f"Error checking feature flag {flag_key}: {str(e)}")
                
                # In production, fail securely by denying access
                if not settings.DEBUG:
                    if fail_silently:
                        raise Http404("Page not found")
                    raise PermissionDenied("Feature access could not be verified")
                
                # In development, re-raise for debugging
                raise
        
        # Add metadata for introspection
        wrapper.required_feature_flag = flag_key
        wrapper.feature_flag_options = {
            'fail_silently': fail_silently,
            'check_organization': check_organization,
            'cache_enabled': cache_enabled
        }
        
        return wrapper
    return decorator


def feature_flag_required(flag_key, **options):
    """
    Alternative syntax for require_feature_flag decorator.
    
    Args:
        flag_key (str): Feature flag key to check
        **options: Additional options passed to require_feature_flag
    
    Usage:
        @feature_flag_required('premium_features')
        def premium_view(request):
            return render(request, 'premium.html')
    """
    return require_feature_flag(flag_key, **options)


def multiple_feature_flags(flag_keys, require_all=True, **options):
    """
    Decorator to require multiple feature flags.
    
    Args:
        flag_keys (list): List of feature flag keys to check
        require_all (bool): If True, all flags must be enabled. If False, any flag can be enabled.
        **options: Additional options passed to require_feature_flag
    
    Usage:
        @multiple_feature_flags(['analytics', 'reporting'], require_all=True)
        def analytics_report_view(request):
            return render(request, 'analytics_report.html')
    """
    def decorator(view_func):
        @wraps(view_func)
        @login_required
        def wrapper(request, *args, **kwargs):
            from ..services import FeatureFlagService
            
            try:
                user = request.user
                organization = None
                
                if options.get('check_organization', True):
                    organization = user.get_primary_organization()
                
                service = FeatureFlagService(use_cache=options.get('cache_enabled', True))
                
                # Check all flags
                enabled_flags = []
                for flag_key in flag_keys:
                    is_enabled = service.is_feature_enabled(user, flag_key, organization)
                    if is_enabled:
                        enabled_flags.append(flag_key)
                
                # Evaluate based on require_all setting
                if require_all:
                    access_granted = len(enabled_flags) == len(flag_keys)
                    missing_flags = set(flag_keys) - set(enabled_flags)
                else:
                    access_granted = len(enabled_flags) > 0
                    missing_flags = set(flag_keys) if not access_granted else set()
                
                if not access_granted:
                    logger.warning(f"Access denied to {flag_keys} for user {user.id}. Missing: {missing_flags}")
                    
                    # Handle custom response
                    custom_response = options.get('custom_response')
                    if custom_response and callable(custom_response):
                        return custom_response(request, flag_keys, missing_flags)
                    
                    # Default responses
                    if options.get('fail_silently', False):
                        raise Http404("Page not found")
                    
                    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                        return JsonResponse({
                            'error': 'Required features not available',
                            'required_flags': flag_keys,
                            'missing_flags': list(missing_flags),
                            'require_all': require_all
                        }, status=403)
                    
                    error_msg = f"Required features not enabled: {', '.join(missing_flags)}"
                    raise PermissionDenied(error_msg)
                
                # Access granted, add flag information to request
                request.enabled_feature_flags = enabled_flags
                return view_func(request, *args, **kwargs)
                
            except Exception as e:
                logger.error(f"Error checking feature flags {flag_keys}: {str(e)}")
                
                if not settings.DEBUG:
                    if options.get('fail_silently', False):
                        raise Http404("Page not found")
                    raise PermissionDenied("Feature access could not be verified")
                
                raise
        
        # Add metadata
        wrapper.required_feature_flags = flag_keys
        wrapper.feature_flags_require_all = require_all
        wrapper.feature_flag_options = options
        
        return wrapper
    return decorator


def onboarding_stage_required(required_stage, allow_advanced=True, **options):
    """
    Decorator to require a specific onboarding stage.
    
    Args:
        required_stage (str): Minimum required onboarding stage
        allow_advanced (bool): Allow users in advanced stages to access
        **options: Additional options for error handling
    
    Usage:
        @onboarding_stage_required('EMAIL_VERIFIED')
        def email_verified_view(request):
            return render(request, 'dashboard.html')
    """
    def decorator(view_func):
        @wraps(view_func)
        @login_required
        def wrapper(request, *args, **kwargs):
            from ..models import UserOnboardingProgress
            from ..enums import OnboardingStageTypes
            
            try:
                user = request.user
                
                # Get user's onboarding progress
                progress = UserOnboardingProgress.objects.filter(user=user).first()
                if not progress:
                    logger.warning(f"No onboarding progress found for user {user.id}")
                    
                    if options.get('fail_silently', False):
                        raise Http404("Page not found")
                    raise PermissionDenied("Onboarding not completed")
                
                # Get stage order
                stages = [choice[0] for choice in OnboardingStageTypes.choices()]
                
                try:
                    required_index = stages.index(required_stage)
                    current_index = stages.index(progress.current_stage)
                except ValueError:
                    logger.error(f"Invalid onboarding stage: {required_stage} or {progress.current_stage}")
                    raise PermissionDenied("Invalid onboarding stage")
                
                # Check if user meets the requirement
                access_granted = False
                if allow_advanced:
                    access_granted = current_index >= required_index
                else:
                    access_granted = current_index == required_index
                
                if not access_granted:
                    logger.warning(f"Onboarding stage access denied for user {user.id}. Required: {required_stage}, Current: {progress.current_stage}")
                    
                    if options.get('fail_silently', False):
                        raise Http404("Page not found")
                    
                    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                        return JsonResponse({
                            'error': 'Onboarding stage requirement not met',
                            'required_stage': required_stage,
                            'current_stage': progress.current_stage,
                            'allow_advanced': allow_advanced
                        }, status=403)
                    
                    raise PermissionDenied(f"Onboarding stage '{required_stage}' required")
                
                # Add onboarding info to request
                request.user_onboarding_progress = progress
                return view_func(request, *args, **kwargs)
                
            except Exception as e:
                logger.error(f"Error checking onboarding stage {required_stage}: {str(e)}")
                
                if not settings.DEBUG:
                    if options.get('fail_silently', False):
                        raise Http404("Page not found")
                    raise PermissionDenied("Onboarding access could not be verified")
                
                raise
        
        # Add metadata
        wrapper.required_onboarding_stage = required_stage
        wrapper.onboarding_allow_advanced = allow_advanced
        wrapper.onboarding_options = options
        
        return wrapper
    return decorator


def feature_flag_context(flag_keys=None):
    """
    Decorator to add feature flag context to views without restricting access.
    
    Args:
        flag_keys (list): List of specific flag keys to check, or None for all user flags
    
    Usage:
        @feature_flag_context(['analytics', 'reporting'])
        def dashboard_view(request):
            # Access request.feature_flags to check individual flags
            return render(request, 'dashboard.html')
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            from ..services import FeatureFlagService
            
            try:
                # Skip if user is not authenticated
                if not hasattr(request, 'user') or not request.user.is_authenticated:
                    return view_func(request, *args, **kwargs)
                
                user = request.user
                organization = user.get_primary_organization()
                
                service = FeatureFlagService()
                
                if flag_keys:
                    # Get specific flags
                    user_flags = service.get_user_flags(user, organization, flag_keys)
                else:
                    # Get all flags
                    user_flags = service.get_user_flags(user, organization)
                
                # Add to request context
                request.feature_flags = user_flags
                request.enabled_feature_flags = [k for k, v in user_flags.items() if v]
                
            except Exception as e:
                logger.error(f"Error getting feature flag context: {str(e)}")
                # Don't fail the view, just skip feature flag context
                request.feature_flags = {}
                request.enabled_feature_flags = []
            
            return view_func(request, *args, **kwargs)
        
        # Add metadata
        wrapper.feature_flag_context_keys = flag_keys
        
        return wrapper
    return decorator