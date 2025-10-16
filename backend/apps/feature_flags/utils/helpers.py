"""
Feature Flag Helper Functions.

Utility functions for feature flag evaluation and management
that can be used throughout the application.
"""

import logging
from typing import Any

from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)


def is_feature_enabled_for_user(
    user, flag_key: str, organization=None, use_cache: bool = True
) -> bool:
    """
    Check if a feature flag is enabled for a specific user.

    Args:
        user: User instance or user ID
        flag_key: Feature flag key to check
        organization: Optional organization context
        use_cache: Whether to use caching

    Returns:
        True if feature is enabled, False otherwise

    Usage:
        if is_feature_enabled_for_user(request.user, 'advanced_analytics'):
            # Show advanced analytics features
    """
    try:
        from ..services import FeatureFlagService

        # Handle user ID string
        if isinstance(user, (str, int)):
            try:
                user = User.objects.get(id=user)
            except User.DoesNotExist:
                logger.warning(f"User {user} not found for feature flag check")
                return False

        # Handle organization ID string
        if isinstance(organization, (str, int)):
            try:
                from apps.organizations.models import Organization

                organization = Organization.objects.get(id=organization)
            except Organization.DoesNotExist:
                logger.warning(f"Organization {organization} not found")
                organization = None

        service = FeatureFlagService(use_cache=use_cache)
        return service.is_feature_enabled(user, flag_key, organization)

    except Exception as e:
        logger.error(
            f"Error checking feature flag {flag_key} for user {user}: {str(e)}"
        )
        return False


def get_user_feature_flags(
    user,
    organization=None,
    flag_keys: list[str] | None = None,
    use_cache: bool = True,
) -> dict[str, bool]:
    """
    Get all feature flags for a user.

    Args:
        user: User instance or user ID
        organization: Optional organization context
        flag_keys: Optional list of specific flags to check
        use_cache: Whether to use caching

    Returns:
        Dictionary of flag_key -> enabled boolean

    Usage:
        flags = get_user_feature_flags(request.user)
        if flags.get('premium_features', False):
            # Show premium features
    """
    try:
        from ..services import FeatureFlagService

        # Handle user ID string
        if isinstance(user, (str, int)):
            try:
                user = User.objects.get(id=user)
            except User.DoesNotExist:
                logger.warning(f"User {user} not found for feature flags")
                return {}

        # Handle organization ID string
        if isinstance(organization, (str, int)):
            try:
                from apps.organizations.models import Organization

                organization = Organization.objects.get(id=organization)
            except Organization.DoesNotExist:
                logger.warning(f"Organization {organization} not found")
                organization = None

        service = FeatureFlagService(use_cache=use_cache)
        return service.get_user_flags(user, organization, flag_keys)

    except Exception as e:
        logger.error(f"Error getting feature flags for user {user}: {str(e)}")
        return {}


def get_enabled_features_for_user(
    user,
    organization=None,
    flag_keys: list[str] | None = None,
    use_cache: bool = True,
) -> list[str]:
    """
    Get list of enabled feature flag keys for a user.

    Args:
        user: User instance or user ID
        organization: Optional organization context
        flag_keys: Optional list of specific flags to check
        use_cache: Whether to use caching

    Returns:
        List of enabled feature flag keys

    Usage:
        enabled_features = get_enabled_features_for_user(request.user)
        if 'advanced_analytics' in enabled_features:
            # Show analytics features
    """
    flags = get_user_feature_flags(user, organization, flag_keys, use_cache)
    return [key for key, enabled in flags.items() if enabled]


def check_multiple_features(
    user,
    flag_keys: list[str],
    require_all: bool = True,
    organization=None,
    use_cache: bool = True,
) -> dict[str, Any]:
    """
    Check multiple feature flags for a user.

    Args:
        user: User instance or user ID
        flag_keys: List of feature flag keys to check
        require_all: If True, all flags must be enabled for access
        organization: Optional organization context
        use_cache: Whether to use caching

    Returns:
        Dictionary with access info and flag details

    Usage:
        result = check_multiple_features(user, ['analytics', 'reporting'])
        if result['access_granted']:
            # User has access to required features
    """
    try:
        flags = get_user_feature_flags(user, organization, flag_keys, use_cache)

        enabled_flags = [key for key, enabled in flags.items() if enabled]
        missing_flags = [key for key in flag_keys if not flags.get(key, False)]

        if require_all:
            access_granted = len(missing_flags) == 0
        else:
            access_granted = len(enabled_flags) > 0

        return {
            "access_granted": access_granted,
            "enabled_flags": enabled_flags,
            "missing_flags": missing_flags,
            "all_flags": flags,
            "require_all": require_all,
        }

    except Exception as e:
        logger.error(
            f"Error checking multiple features {flag_keys} for user {user}: {str(e)}"
        )
        return {
            "access_granted": False,
            "enabled_flags": [],
            "missing_flags": flag_keys,
            "all_flags": {},
            "require_all": require_all,
            "error": str(e),
        }


def get_user_onboarding_info(user) -> dict[str, Any]:
    """
    Get onboarding information for a user.

    Args:
        user: User instance or user ID

    Returns:
        Dictionary with onboarding progress information

    Usage:
        onboarding = get_user_onboarding_info(request.user)
        if onboarding['is_complete']:
            # User has completed onboarding
    """
    try:
        from ..services import OnboardingService

        # Handle user ID string
        if isinstance(user, (str, int)):
            try:
                user = User.objects.get(id=user)
            except User.DoesNotExist:
                logger.warning(f"User {user} not found for onboarding info")
                return {}

        service = OnboardingService()
        return service.get_user_progress_summary(user)

    except Exception as e:
        logger.error(f"Error getting onboarding info for user {user}: {str(e)}")
        return {}


def trigger_onboarding_action(user, action: str, metadata: dict | None = None) -> bool:
    """
    Trigger an onboarding action for a user.

    Args:
        user: User instance or user ID
        action: Action to trigger
        metadata: Optional metadata about the action

    Returns:
        True if action was processed successfully

    Usage:
        success = trigger_onboarding_action(request.user, 'email_verified')
    """
    try:
        from ..services import OnboardingService

        # Handle user ID string
        if isinstance(user, (str, int)):
            try:
                user = User.objects.get(id=user)
            except User.DoesNotExist:
                logger.warning(f"User {user} not found for onboarding action")
                return False

        service = OnboardingService()
        return service.handle_user_action(user, action, metadata or {})

    except Exception as e:
        logger.error(
            f"Error triggering onboarding action {action} for user {user}: {str(e)}"
        )
        return False


def create_feature_flag(
    key: str, name: str, description: str = "", enabled_globally: bool = False, **kwargs
) -> Any | None:
    """
    Create a new feature flag programmatically.

    Args:
        key: Unique flag key
        name: Human-readable name
        description: Flag description
        enabled_globally: Whether to enable globally
        **kwargs: Additional flag properties

    Returns:
        Created FeatureFlag instance or None if failed

    Usage:
        flag = create_feature_flag(
            key='new_feature',
            name='New Feature',
            description='A new feature for testing',
            enabled_globally=False,
            rollout_percentage=25
        )
    """
    try:
        from ..services import FeatureFlagService

        service = FeatureFlagService()
        return service.create_feature_flag(
            key, name, description, enabled_globally, **kwargs
        )

    except Exception as e:
        logger.error(f"Error creating feature flag {key}: {str(e)}")
        return None


def enable_flag_for_user(flag_key: str, user, reason: str = "") -> bool:
    """
    Enable a feature flag for a specific user.

    Args:
        flag_key: Feature flag key
        user: User instance or user ID
        reason: Reason for enabling

    Returns:
        True if successful

    Usage:
        success = enable_flag_for_user('beta_feature', request.user, 'Beta tester')
    """
    try:
        from ..services import FeatureFlagService

        # Handle user ID string
        if isinstance(user, (str, int)):
            try:
                user = User.objects.get(id=user)
            except User.DoesNotExist:
                logger.warning(f"User {user} not found for flag enable")
                return False

        service = FeatureFlagService()
        return service.enable_flag_for_user(flag_key, user, reason)

    except Exception as e:
        logger.error(f"Error enabling flag {flag_key} for user {user}: {str(e)}")
        return False


def disable_flag_for_user(flag_key: str, user, reason: str = "") -> bool:
    """
    Disable a feature flag for a specific user.

    Args:
        flag_key: Feature flag key
        user: User instance or user ID
        reason: Reason for disabling

    Returns:
        True if successful

    Usage:
        success = disable_flag_for_user('beta_feature', request.user, 'Beta ended')
    """
    try:
        from ..services import FeatureFlagService

        # Handle user ID string
        if isinstance(user, (str, int)):
            try:
                user = User.objects.get(id=user)
            except User.DoesNotExist:
                logger.warning(f"User {user} not found for flag disable")
                return False

        service = FeatureFlagService()
        return service.disable_flag_for_user(flag_key, user, reason)

    except Exception as e:
        logger.error(f"Error disabling flag {flag_key} for user {user}: {str(e)}")
        return False


def get_feature_flag_statistics(flag_key: str) -> dict[str, Any]:
    """
    Get statistics for a feature flag.

    Args:
        flag_key: Feature flag key

    Returns:
        Dictionary with flag statistics

    Usage:
        stats = get_feature_flag_statistics('advanced_analytics')
        print(f"Flag has {stats['total_access_rules']} access rules")
    """
    try:
        from ..services import FeatureFlagService

        service = FeatureFlagService()
        return service.get_flag_statistics(flag_key)

    except Exception as e:
        logger.error(f"Error getting statistics for flag {flag_key}: {str(e)}")
        return {"error": str(e)}


def clear_feature_flag_cache(user=None, flag_key: str = None) -> bool:
    """
    Clear feature flag caches.

    Args:
        user: Optional user to clear cache for
        flag_key: Optional flag key to clear cache for

    Returns:
        True if successful

    Usage:
        # Clear cache for specific user
        clear_feature_flag_cache(user=request.user)

        # Clear cache for specific flag
        clear_feature_flag_cache(flag_key='analytics')

        # Clear all feature flag caches
        clear_feature_flag_cache()
    """
    try:
        from ..services import FeatureFlagService

        service = FeatureFlagService()

        if user and flag_key:
            # Clear both user and flag cache
            service.invalidate_user_cache(user)
            service.invalidate_flag_cache(flag_key)
        elif user:
            # Clear user cache
            service.invalidate_user_cache(user)
        elif flag_key:
            # Clear flag cache
            service.invalidate_flag_cache(flag_key)
        else:
            # Clear all caches (would need implementation in cache service)
            logger.warning("Clearing all feature flag caches not implemented")
            return False

        return True

    except Exception as e:
        logger.error(f"Error clearing feature flag cache: {str(e)}")
        return False
