"""
Feature Flag Mixins.

Provides class-based view mixins for feature flag gating and context
with proper permission handling and error responses.
"""

import logging

from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied
from django.http import Http404, JsonResponse

logger = logging.getLogger(__name__)


class FeatureGatedMixin(LoginRequiredMixin):
    """
    Mixin for class-based views that require a feature flag to be enabled.

    Attributes:
        required_feature_flag (str): Feature flag key that must be enabled
        feature_flag_fail_silently (bool): If True, raise 404 instead of 403
        feature_flag_check_organization (bool): Include organization in flag evaluation
        feature_flag_cache_enabled (bool): Use caching for flag evaluation
        feature_flag_custom_response_method (str): Method name for custom denied response

    Usage:
        class AnalyticsView(FeatureGatedMixin, TemplateView):
            template_name = 'analytics.html'
            required_feature_flag = 'advanced_analytics'
            feature_flag_fail_silently = True
    """

    required_feature_flag = None
    feature_flag_fail_silently = False
    feature_flag_check_organization = True
    feature_flag_cache_enabled = True
    feature_flag_custom_response_method = None

    def dispatch(self, request, *args, **kwargs):
        """Override dispatch to check feature flag before processing request."""
        if not self.required_feature_flag:
            raise ValueError(
                f"{self.__class__.__name__} must define required_feature_flag"
            )

        # Check authentication first
        if not request.user.is_authenticated:
            return self.handle_no_permission()

        # Check feature flag
        if not self._check_feature_flag(request):
            return self._handle_feature_denied(request)

        return super().dispatch(request, *args, **kwargs)

    def _check_feature_flag(self, request):
        """Check if the required feature flag is enabled for the user."""
        try:
            from ..services import FeatureFlagService

            user = request.user
            organization = None

            if self.feature_flag_check_organization:
                organization = user.get_primary_organization()

            service = FeatureFlagService(use_cache=self.feature_flag_cache_enabled)
            return service.is_feature_enabled(
                user, self.required_feature_flag, organization
            )

        except Exception as e:
            logger.error(
                f"Error checking feature flag {self.required_feature_flag}: {str(e)}"
            )

            # In production, fail securely
            if not settings.DEBUG:
                return False

            # In development, re-raise for debugging
            raise

    def _handle_feature_denied(self, request):
        """Handle feature flag denial with appropriate response."""
        logger.warning(
            f"Access denied to {self.required_feature_flag} for user {request.user.id}"
        )

        # Try custom response method first
        if self.feature_flag_custom_response_method:
            custom_method = getattr(
                self, self.feature_flag_custom_response_method, None
            )
            if custom_method and callable(custom_method):
                return custom_method(request, self.required_feature_flag)

        # Default responses
        if self.feature_flag_fail_silently:
            raise Http404("Page not found")

        # AJAX request handling
        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse(
                {
                    "error": "Feature not available",
                    "feature_flag": self.required_feature_flag,
                },
                status=403,
            )

        # Default: raise PermissionDenied
        raise PermissionDenied(
            f"Feature '{self.required_feature_flag}' is not enabled for your account"
        )


class MultipleFeatureGatedMixin(LoginRequiredMixin):
    """
    Mixin for views requiring multiple feature flags.

    Attributes:
        required_feature_flags (list): List of feature flag keys
        feature_flags_require_all (bool): If True, all flags must be enabled
        feature_flag_fail_silently (bool): If True, raise 404 instead of 403
        feature_flag_check_organization (bool): Include organization in evaluation
        feature_flag_cache_enabled (bool): Use caching for flag evaluation

    Usage:
        class ReportingView(MultipleFeatureGatedMixin, TemplateView):
            template_name = 'reporting.html'
            required_feature_flags = ['analytics', 'reporting']
            feature_flags_require_all = True
    """

    required_feature_flags = []
    feature_flags_require_all = True
    feature_flag_fail_silently = False
    feature_flag_check_organization = True
    feature_flag_cache_enabled = True

    def dispatch(self, request, *args, **kwargs):
        """Override dispatch to check multiple feature flags."""
        if not self.required_feature_flags:
            raise ValueError(
                f"{self.__class__.__name__} must define required_feature_flags"
            )

        # Check authentication first
        if not request.user.is_authenticated:
            return self.handle_no_permission()

        # Check feature flags
        enabled_flags, missing_flags = self._check_feature_flags(request)
        if not self._evaluate_flag_access(enabled_flags, missing_flags):
            return self._handle_multiple_features_denied(request, missing_flags)

        # Add enabled flags to request for use in view
        request.enabled_feature_flags = enabled_flags

        return super().dispatch(request, *args, **kwargs)

    def _check_feature_flags(self, request):
        """Check all required feature flags and return enabled/missing lists."""
        try:
            from ..services import FeatureFlagService

            user = request.user
            organization = None

            if self.feature_flag_check_organization:
                organization = user.get_primary_organization()

            service = FeatureFlagService(use_cache=self.feature_flag_cache_enabled)

            enabled_flags = []
            missing_flags = []

            for flag_key in self.required_feature_flags:
                is_enabled = service.is_feature_enabled(user, flag_key, organization)
                if is_enabled:
                    enabled_flags.append(flag_key)
                else:
                    missing_flags.append(flag_key)

            return enabled_flags, missing_flags

        except Exception as e:
            logger.error(
                f"Error checking feature flags {self.required_feature_flags}: {str(e)}"
            )

            if not settings.DEBUG:
                return [], self.required_feature_flags

            raise

    def _evaluate_flag_access(self, enabled_flags, missing_flags):
        """Evaluate whether access should be granted based on flag requirements."""
        if self.feature_flags_require_all:
            return len(missing_flags) == 0
        else:
            return len(enabled_flags) > 0

    def _handle_multiple_features_denied(self, request, missing_flags):
        """Handle denial when multiple feature flags are not met."""
        logger.warning(
            f"Access denied to {self.required_feature_flags} for user {request.user.id}. Missing: {missing_flags}"
        )

        if self.feature_flag_fail_silently:
            raise Http404("Page not found")

        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse(
                {
                    "error": "Required features not available",
                    "required_flags": self.required_feature_flags,
                    "missing_flags": missing_flags,
                    "require_all": self.feature_flags_require_all,
                },
                status=403,
            )

        error_msg = f"Required features not enabled: {', '.join(missing_flags)}"
        raise PermissionDenied(error_msg)


class OnboardingStageRequiredMixin(LoginRequiredMixin):
    """
    Mixin for views requiring a specific onboarding stage.

    Attributes:
        required_onboarding_stage (str): Minimum required onboarding stage
        onboarding_allow_advanced (bool): Allow users in advanced stages
        onboarding_fail_silently (bool): If True, raise 404 instead of 403

    Usage:
        class DashboardView(OnboardingStageRequiredMixin, TemplateView):
            template_name = 'dashboard.html'
            required_onboarding_stage = 'EMAIL_VERIFIED'
    """

    required_onboarding_stage = None
    onboarding_allow_advanced = True
    onboarding_fail_silently = False

    def dispatch(self, request, *args, **kwargs):
        """Override dispatch to check onboarding stage."""
        if not self.required_onboarding_stage:
            raise ValueError(
                f"{self.__class__.__name__} must define required_onboarding_stage"
            )

        # Check authentication first
        if not request.user.is_authenticated:
            return self.handle_no_permission()

        # Check onboarding stage
        progress = self._check_onboarding_stage(request)
        if progress is None:
            return self._handle_onboarding_denied(request, "Onboarding not completed")

        # Add progress to request for use in view
        request.user_onboarding_progress = progress

        return super().dispatch(request, *args, **kwargs)

    def _check_onboarding_stage(self, request):
        """Check user's onboarding stage against requirements."""
        try:
            from ..enums import OnboardingStageTypes
            from ..models import UserOnboardingProgress

            user = request.user

            # Get user's onboarding progress
            progress = UserOnboardingProgress.objects.filter(user=user).first()
            if not progress:
                return None

            # Get stage order
            stages = [choice[0] for choice in OnboardingStageTypes.choices()]

            try:
                required_index = stages.index(self.required_onboarding_stage)
                current_index = stages.index(progress.current_stage)
            except ValueError:
                logger.error(
                    f"Invalid onboarding stage: {self.required_onboarding_stage} or {progress.current_stage}"
                )
                return None

            # Check if user meets the requirement
            if self.onboarding_allow_advanced:
                meets_requirement = current_index >= required_index
            else:
                meets_requirement = current_index == required_index

            return progress if meets_requirement else None

        except Exception as e:
            logger.error(
                f"Error checking onboarding stage {self.required_onboarding_stage}: {str(e)}"
            )

            if not settings.DEBUG:
                return None

            raise

    def _handle_onboarding_denied(self, request, reason):
        """Handle onboarding requirement denial."""
        logger.warning(f"Onboarding access denied for user {request.user.id}: {reason}")

        if self.onboarding_fail_silently:
            raise Http404("Page not found")

        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse(
                {
                    "error": "Onboarding requirement not met",
                    "required_stage": self.required_onboarding_stage,
                    "allow_advanced": self.onboarding_allow_advanced,
                },
                status=403,
            )

        raise PermissionDenied(
            f"Onboarding stage '{self.required_onboarding_stage}' required"
        )


class FeatureContextMixin:
    """
    Mixin that adds feature flag context to views without restricting access.

    Attributes:
        feature_context_flags (list): Specific flags to include, or None for all
        feature_context_cache_enabled (bool): Use caching for flag evaluation

    Usage:
        class DashboardView(FeatureContextMixin, TemplateView):
            template_name = 'dashboard.html'
            feature_context_flags = ['analytics', 'reporting']
    """

    feature_context_flags = None
    feature_context_cache_enabled = True

    def dispatch(self, request, *args, **kwargs):
        """Override dispatch to add feature flag context."""
        # Add feature flag context if user is authenticated
        if hasattr(request, "user") and request.user.is_authenticated:
            self._add_feature_context(request)

        return super().dispatch(request, *args, **kwargs)

    def _add_feature_context(self, request):
        """Add feature flag information to request context."""
        try:
            from ..services import FeatureFlagService

            user = request.user
            organization = user.get_primary_organization()

            service = FeatureFlagService(use_cache=self.feature_context_cache_enabled)

            # Get flags
            user_flags = service.get_user_flags(
                user, organization, self.feature_context_flags
            )

            # Add to request context
            request.feature_flags = user_flags
            request.enabled_feature_flags = [k for k, v in user_flags.items() if v]

        except Exception as e:
            logger.error(f"Error getting feature flag context: {str(e)}")
            # Don't fail the view, just skip feature flag context
            request.feature_flags = {}
            request.enabled_feature_flags = []

    def get_context_data(self, **kwargs):
        """Add feature flag context to template context."""
        context = super().get_context_data(**kwargs)

        # Add feature flags to template context
        if hasattr(self.request, "feature_flags"):
            context["feature_flags"] = self.request.feature_flags
            context["enabled_feature_flags"] = self.request.enabled_feature_flags

        return context


class FeatureRequiredMixin(FeatureGatedMixin):
    """
    Alias for FeatureGatedMixin for backward compatibility and cleaner naming.

    Usage:
        class PremiumView(FeatureRequiredMixin, TemplateView):
            template_name = 'premium.html'
            required_feature_flag = 'premium_features'
    """

    pass
