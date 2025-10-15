"""
Feature Flags and Progressive Onboarding Models.

This module implements a comprehensive feature flag system with progressive
feature enablement capabilities for multi-tenant SaaS applications.
"""

from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

from apps.core.models import BaseFields, TenantAwareModel
from .enums import OnboardingStageTypes, FeatureFlagScopeTypes


class FeatureFlag(BaseFields):
    """
    Core feature flag model for controlling feature access.
    
    Supports global, organization, and user-specific feature toggling
    with progressive rollout capabilities.
    """
    key = models.SlugField(
        unique=True,
        max_length=100,
        help_text="Unique identifier for the feature flag (e.g., 'advanced_analytics')"
    )
    name = models.CharField(
        max_length=255,
        help_text="Human-readable name for the feature (e.g., 'Advanced Analytics Dashboard')"
    )
    description = models.TextField(
        blank=True,
        help_text="Detailed description of what this feature flag controls"
    )
    
    # Global flag control
    is_enabled_globally = models.BooleanField(
        default=False,
        help_text="If true, this feature is enabled for all users regardless of other settings"
    )
    
    # Progressive rollout settings
    rollout_percentage = models.PositiveIntegerField(
        default=0,
        help_text="Percentage of users (0-100) who should have this feature enabled"
    )
    
    # Metadata for feature management
    is_permanent = models.BooleanField(
        default=False,
        help_text="If true, this feature flag should not be deleted (core system feature)"
    )
    requires_restart = models.BooleanField(
        default=False,
        help_text="If true, application restart is required when this flag changes"
    )
    
    # Environment controls
    environments = models.JSONField(
        default=list,
        blank=True,
        help_text="List of environments where this flag is active (e.g., ['development', 'production'])"
    )
    
    # Scheduling
    active_from = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Feature becomes active from this date (optional)"
    )
    active_until = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Feature is active until this date (optional)"
    )

    def clean(self):
        """Validate feature flag data."""
        super().clean()
        
        # Validate rollout percentage
        if not 0 <= self.rollout_percentage <= 100:
            raise ValidationError({
                'rollout_percentage': _("Rollout percentage must be between 0 and 100.")
            })
        
        # Validate date range
        if self.active_from and self.active_until:
            if self.active_from >= self.active_until:
                raise ValidationError({
                    'active_until': _("Active until date must be after active from date.")
                })

    def is_active_now(self):
        """Check if the feature flag is currently active based on scheduling."""
        now = timezone.now()
        
        if self.active_from and now < self.active_from:
            return False
        
        if self.active_until and now > self.active_until:
            return False
        
        return True

    def is_in_rollout_percentage(self, user_id):
        """Check if user falls within the rollout percentage."""
        if self.rollout_percentage == 0:
            return False
        if self.rollout_percentage == 100:
            return True
        
        # Use deterministic hash to ensure consistent experience for each user
        import hashlib
        hash_input = f"{self.key}-{user_id}"
        hash_value = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)
        return (hash_value % 100) < self.rollout_percentage

    def __str__(self):
        return f"{self.name} ({self.key})"

    class Meta:
        verbose_name = "Feature Flag"
        verbose_name_plural = "Feature Flags"
        ordering = ["name"]


class FeatureAccess(BaseFields):
    """
    Specific access rules for feature flags.
    
    Allows fine-grained control over who has access to specific features
    based on user, role, or organization.
    """
    feature = models.ForeignKey(
        FeatureFlag,
        on_delete=models.CASCADE,
        related_name="access_rules"
    )
    
    # Access targets (one of these should be set)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="Specific user this rule applies to"
    )
    role = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="User role this rule applies to (e.g., 'ADMIN', 'MANAGER')"
    )
    
    # Access control
    enabled = models.BooleanField(
        default=True,
        help_text="Whether this access rule grants (True) or denies (False) access"
    )
    
    # Conditional access
    conditions = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional conditions for access (e.g., minimum account age, action count)"
    )
    
    # Metadata
    reason = models.CharField(
        max_length=255,
        blank=True,
        help_text="Reason for this access rule (for auditing)"
    )

    def clean(self):
        """Validate access rule data."""
        super().clean()
        
        # Ensure at least one target is specified
        if not any([self.user, self.role]):
            raise ValidationError(
                _("At least one of user or role must be specified.")
            )
        
        # Prevent conflicting targets
        if self.user and self.role:
            raise ValidationError(
                _("Cannot specify both user and role in the same access rule.")
            )

    def applies_to_user(self, user):
        """Check if this access rule applies to the given user."""
        if self.user and self.user == user:
            return True
        
        if self.role and hasattr(user, 'role') and user.role == self.role:
            return True
        
        return False

    def check_conditions(self, user):
        """Check if the user meets the conditions for this access rule."""
        if not self.conditions:
            return True
        
        # Example condition checks (extend as needed)
        if 'min_account_age_days' in self.conditions:
            account_age = (timezone.now() - user.date_joined).days
            if account_age < self.conditions['min_account_age_days']:
                return False
        
        if 'requires_email_verified' in self.conditions:
            if self.conditions['requires_email_verified'] and not user.is_email_verified:
                return False
        
        return True

    def __str__(self):
        target = self.user.email if self.user else f"role:{self.role}"
        status = "ENABLED" if self.enabled else "DISABLED"
        return f"{self.feature.key} -> {target} ({status})"

    class Meta:
        verbose_name = "Feature Access Rule"
        verbose_name_plural = "Feature Access Rules"
        indexes = [
            models.Index(fields=['feature', 'user']),
            models.Index(fields=['feature', 'role']),
        ]


class UserOnboardingProgress(BaseFields):
    """
    Track user progression through onboarding stages.
    
    Enables progressive feature unlocking based on user actions
    and onboarding completion.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="onboarding_progress"
    )
    current_stage = models.CharField(
        max_length=100,
        choices=OnboardingStageTypes.choices(),
        default=OnboardingStageTypes.SIGNUP_COMPLETE.value,
        help_text="Current onboarding stage the user is in"
    )
    completed_stages = models.JSONField(
        default=list,
        help_text="List of completed onboarding stages"
    )
    
    # Progress tracking
    total_actions_completed = models.PositiveIntegerField(
        default=0,
        help_text="Total number of onboarding actions completed"
    )
    progress_percentage = models.PositiveIntegerField(
        default=0,
        help_text="Percentage of onboarding completion (0-100)"
    )
    
    # Timestamps for progression
    stage_started_at = models.DateTimeField(
        default=timezone.now,
        help_text="When the current stage was started"
    )
    last_activity_at = models.DateTimeField(
        auto_now=True,
        help_text="Last time user progressed in onboarding"
    )
    onboarding_completed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When onboarding was fully completed"
    )
    
    # Metadata
    custom_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Custom data for organization-specific onboarding tracking"
    )

    def advance_to_stage(self, stage, save=True):
        """Advance user to a new onboarding stage."""
        old_stage = self.current_stage
        
        # Add old stage to completed if not already there
        if old_stage not in self.completed_stages:
            self.completed_stages.append(old_stage)
        
        # Update current stage
        self.current_stage = stage
        self.stage_started_at = timezone.now()
        self.last_activity_at = timezone.now()
        
        # Update progress
        self.total_actions_completed += 1
        self._calculate_progress_percentage()
        
        # Check if onboarding is complete
        if stage == OnboardingStageTypes.ONBOARDING_COMPLETE.value:
            self.onboarding_completed_at = timezone.now()
        
        if save:
            self.save()

    def mark_stage_completed(self, stage, save=True):
        """Mark a specific stage as completed without advancing."""
        if stage not in self.completed_stages:
            self.completed_stages.append(stage)
            self.total_actions_completed += 1
            self._calculate_progress_percentage()
            self.last_activity_at = timezone.now()
            
            if save:
                self.save()

    def has_completed_stage(self, stage):
        """Check if user has completed a specific stage."""
        return stage in self.completed_stages or self.current_stage == stage

    def get_next_stage(self):
        """Get the next recommended stage for the user."""
        stages = [choice[0] for choice in OnboardingStageTypes.choices()]
        current_index = stages.index(self.current_stage)
        
        if current_index < len(stages) - 1:
            return stages[current_index + 1]
        
        return None

    def is_onboarding_complete(self):
        """Check if user has completed onboarding."""
        return (
            self.current_stage == OnboardingStageTypes.ONBOARDING_COMPLETE.value or
            self.onboarding_completed_at is not None
        )

    def _calculate_progress_percentage(self):
        """Calculate the progress percentage based on completed stages."""
        total_stages = len(OnboardingStageTypes.choices())
        completed_count = len(self.completed_stages)
        
        # Current stage counts as partial completion
        if self.current_stage != OnboardingStageTypes.SIGNUP_COMPLETE.value:
            completed_count += 0.5
        
        self.progress_percentage = min(100, int((completed_count / total_stages) * 100))

    def get_available_features(self):
        """Get features that should be available based on onboarding progress."""
        available_features = []
        
        # Define stage-based feature unlocking
        stage_features = {
            OnboardingStageTypes.EMAIL_VERIFIED.value: ['basic_dashboard'],
            OnboardingStageTypes.PROFILE_SETUP.value: ['profile_customization'],
            OnboardingStageTypes.ORGANIZATION_CREATED.value: ['team_features'],
            OnboardingStageTypes.FIRST_TEAM_MEMBER.value: ['collaboration_tools'],
            OnboardingStageTypes.FIRST_PROJECT.value: ['project_management'],
            OnboardingStageTypes.ADVANCED_FEATURES.value: ['advanced_analytics'],
            OnboardingStageTypes.ONBOARDING_COMPLETE.value: ['all_features'],
        }
        
        # Add features based on completed stages
        for stage in self.completed_stages:
            if stage in stage_features:
                available_features.extend(stage_features[stage])
        
        # Add features for current stage
        if self.current_stage in stage_features:
            available_features.extend(stage_features[self.current_stage])
        
        return list(set(available_features))  # Remove duplicates

    def __str__(self):
        return f"{self.user.email} - {self.current_stage} ({self.progress_percentage}%)"

    class Meta:
        verbose_name = "User Onboarding Progress"
        verbose_name_plural = "User Onboarding Progress"
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['current_stage']),
        ]