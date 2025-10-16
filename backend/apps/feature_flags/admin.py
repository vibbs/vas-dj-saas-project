"""
Feature Flags Django Admin Configuration.

Provides comprehensive admin interface for managing feature flags,
access rules, and onboarding progress with proper filtering,
search, and bulk actions.
"""

import json

from django.contrib import admin
from django.contrib.admin import SimpleListFilter
from django.db import models
from django.forms import Textarea
from django.urls import reverse
from django.utils import timezone
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from .models import FeatureAccess, FeatureFlag, UserOnboardingProgress
from .services import FeatureFlagService


class IsActiveListFilter(SimpleListFilter):
    """Custom filter for active feature flags based on scheduling."""

    title = "Active Status"
    parameter_name = "is_active"

    def lookups(self, request, model_admin):
        return (
            ("active", "Active Now"),
            ("scheduled", "Scheduled"),
            ("expired", "Expired"),
        )

    def queryset(self, request, queryset):
        now = timezone.now()

        if self.value() == "active":
            return queryset.filter(
                models.Q(active_from__isnull=True) | models.Q(active_from__lte=now),
                models.Q(active_until__isnull=True) | models.Q(active_until__gte=now),
            )
        elif self.value() == "scheduled":
            return queryset.filter(active_from__gt=now)
        elif self.value() == "expired":
            return queryset.filter(active_until__lt=now)

        return queryset


class FeatureAccessInline(admin.TabularInline):
    """Inline admin for feature access rules."""

    model = FeatureAccess
    extra = 0
    fields = ("user", "role", "enabled", "conditions", "reason")
    readonly_fields = ("created_at", "updated_at")

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("user", "feature")


@admin.register(FeatureFlag)
class FeatureFlagAdmin(admin.ModelAdmin):
    """
    Admin interface for Feature Flags.

    Provides comprehensive management of feature flags with
    proper filtering, search, and bulk actions.
    """

    list_display = [
        "name",
        "key",
        "is_enabled_globally",
        "rollout_percentage",
        "active_status",
        "access_rules_count",
        "organization",
        "created_at",
        "updated_at",
    ]
    list_filter = [
        "is_enabled_globally",
        IsActiveListFilter,
        "is_permanent",
        "requires_restart",
        "created_at",
        "organization",
    ]
    search_fields = ["name", "key", "description"]
    readonly_fields = [
        "id",
        "created_at",
        "updated_at",
        "created_by",
        "updated_by",
        "active_status",
        "access_rules_count",
    ]

    fieldsets = (
        (
            "Basic Information",
            {"fields": ("key", "name", "description", "organization")},
        ),
        ("Global Settings", {"fields": ("is_enabled_globally", "rollout_percentage")}),
        (
            "Scheduling",
            {"fields": ("active_from", "active_until"), "classes": ("collapse",)},
        ),
        (
            "Advanced Settings",
            {
                "fields": ("is_permanent", "requires_restart", "environments"),
                "classes": ("collapse",),
            },
        ),
        (
            "Metadata",
            {
                "fields": (
                    "id",
                    "active_status",
                    "access_rules_count",
                    "created_at",
                    "updated_at",
                    "created_by",
                    "updated_by",
                ),
                "classes": ("collapse",),
            },
        ),
    )

    inlines = [FeatureAccessInline]

    actions = ["enable_globally", "disable_globally", "clear_rollout", "full_rollout"]

    formfield_overrides = {
        models.TextField: {"widget": Textarea(attrs={"rows": 3, "cols": 80})},
        models.JSONField: {"widget": Textarea(attrs={"rows": 4, "cols": 80})},
    }

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related(
            "organization", "created_by", "updated_by"
        ).prefetch_related("access_rules")

    def active_status(self, obj):
        """Display current active status with color coding."""
        if obj.is_active_now():
            return format_html(
                '<span style="color: green; font-weight: bold;">Active</span>'
            )
        elif obj.active_from and obj.active_from > timezone.now():
            return format_html('<span style="color: orange;">Scheduled</span>')
        elif obj.active_until and obj.active_until < timezone.now():
            return format_html('<span style="color: red;">Expired</span>')
        else:
            return format_html('<span style="color: gray;">Inactive</span>')

    active_status.short_description = "Status"

    def access_rules_count(self, obj):
        """Display count of access rules with link to view them."""
        count = obj.access_rules.count()
        if count > 0:
            url = reverse("admin:feature_flags_featureaccess_changelist")
            url += f"?feature__id__exact={obj.id}"
            return format_html('<a href="{}">{} rules</a>', url, count)
        return "0 rules"

    access_rules_count.short_description = "Access Rules"

    def enable_globally(self, request, queryset):
        """Bulk action to enable flags globally."""
        count = queryset.update(is_enabled_globally=True)

        # Clear caches for updated flags
        service = FeatureFlagService()
        for flag in queryset:
            service.invalidate_flag_cache(flag.key)

        self.message_user(request, f"{count} flags enabled globally.")

    enable_globally.short_description = "Enable selected flags globally"

    def disable_globally(self, request, queryset):
        """Bulk action to disable flags globally."""
        count = queryset.update(is_enabled_globally=False)

        # Clear caches for updated flags
        service = FeatureFlagService()
        for flag in queryset:
            service.invalidate_flag_cache(flag.key)

        self.message_user(request, f"{count} flags disabled globally.")

    disable_globally.short_description = "Disable selected flags globally"

    def clear_rollout(self, request, queryset):
        """Bulk action to clear rollout percentage."""
        count = queryset.update(rollout_percentage=0)

        # Clear caches for updated flags
        service = FeatureFlagService()
        for flag in queryset:
            service.invalidate_flag_cache(flag.key)

        self.message_user(request, f"{count} flags rollout cleared.")

    clear_rollout.short_description = "Clear rollout percentage"

    def full_rollout(self, request, queryset):
        """Bulk action to set 100% rollout."""
        count = queryset.update(rollout_percentage=100)

        # Clear caches for updated flags
        service = FeatureFlagService()
        for flag in queryset:
            service.invalidate_flag_cache(flag.key)

        self.message_user(request, f"{count} flags set to 100% rollout.")

    full_rollout.short_description = "Set 100% rollout"

    def save_model(self, request, obj, form, change):
        """Set created_by/updated_by fields and clear cache."""
        if not change:
            obj.created_by = request.user
        else:
            obj.updated_by = request.user

        super().save_model(request, obj, form, change)

        # Clear cache for this flag
        service = FeatureFlagService()
        service.invalidate_flag_cache(obj.key)


@admin.register(FeatureAccess)
class FeatureAccessAdmin(admin.ModelAdmin):
    """
    Admin interface for Feature Access Rules.

    Manages fine-grained access control for feature flags.
    """

    list_display = [
        "feature_name",
        "feature_key",
        "target_display",
        "enabled",
        "conditions_summary",
        "reason",
        "organization",
        "created_at",
    ]
    list_filter = [
        "enabled",
        "feature",
        "created_at",
        "organization",
        ("user", admin.RelatedOnlyFieldListFilter),
    ]
    search_fields = ["feature__name", "feature__key", "user__email", "role", "reason"]
    readonly_fields = ["id", "created_at", "updated_at", "created_by", "updated_by"]

    fieldsets = (
        ("Access Rule", {"fields": ("feature", "enabled", "reason")}),
        (
            "Target",
            {
                "fields": ("user", "role", "organization"),
                "description": "Specify exactly one target: user, role, or organization",
            },
        ),
        ("Conditions", {"fields": ("conditions",), "classes": ("collapse",)}),
        (
            "Metadata",
            {
                "fields": (
                    "id",
                    "created_at",
                    "updated_at",
                    "created_by",
                    "updated_by",
                ),
                "classes": ("collapse",),
            },
        ),
    )

    actions = ["enable_rules", "disable_rules", "clear_conditions"]

    formfield_overrides = {
        models.JSONField: {"widget": Textarea(attrs={"rows": 3, "cols": 80})},
        models.CharField: {"widget": Textarea(attrs={"rows": 1, "cols": 80})},
    }

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related(
            "feature", "user", "organization", "created_by", "updated_by"
        )

    def feature_name(self, obj):
        """Display feature name with link."""
        url = reverse("admin:feature_flags_featureflag_change", args=[obj.feature.id])
        return format_html('<a href="{}">{}</a>', url, obj.feature.name)

    feature_name.short_description = "Feature"
    feature_name.admin_order_field = "feature__name"

    def feature_key(self, obj):
        """Display feature key."""
        return obj.feature.key

    feature_key.short_description = "Key"
    feature_key.admin_order_field = "feature__key"

    def target_display(self, obj):
        """Display the target of this access rule."""
        if obj.user:
            return format_html("User: <strong>{}</strong>", obj.user.email)
        elif obj.role:
            return format_html("Role: <strong>{}</strong>", obj.role)
        elif obj.organization:
            return format_html("Org: <strong>{}</strong>", obj.organization.name)
        return "No target"

    target_display.short_description = "Target"

    def conditions_summary(self, obj):
        """Display summary of conditions."""
        if not obj.conditions:
            return "None"

        conditions = (
            json.loads(obj.conditions)
            if isinstance(obj.conditions, str)
            else obj.conditions
        )
        if isinstance(conditions, dict) and conditions:
            summary = ", ".join([f"{k}: {v}" for k, v in conditions.items()])
            return summary[:50] + "..." if len(summary) > 50 else summary

        return "None"

    conditions_summary.short_description = "Conditions"

    def enable_rules(self, request, queryset):
        """Bulk action to enable access rules."""
        count = queryset.update(enabled=True)

        # Clear relevant caches
        service = FeatureFlagService()
        for rule in queryset:
            if rule.user:
                service.invalidate_user_cache(rule.user)
            service.invalidate_flag_cache(rule.feature.key)

        self.message_user(request, f"{count} access rules enabled.")

    enable_rules.short_description = "Enable selected access rules"

    def disable_rules(self, request, queryset):
        """Bulk action to disable access rules."""
        count = queryset.update(enabled=False)

        # Clear relevant caches
        service = FeatureFlagService()
        for rule in queryset:
            if rule.user:
                service.invalidate_user_cache(rule.user)
            service.invalidate_flag_cache(rule.feature.key)

        self.message_user(request, f"{count} access rules disabled.")

    disable_rules.short_description = "Disable selected access rules"

    def clear_conditions(self, request, queryset):
        """Bulk action to clear rule conditions."""
        count = queryset.update(conditions={})
        self.message_user(request, f"{count} access rule conditions cleared.")

    clear_conditions.short_description = "Clear conditions"

    def save_model(self, request, obj, form, change):
        """Set created_by/updated_by fields and clear cache."""
        if not change:
            obj.created_by = request.user
        else:
            obj.updated_by = request.user

        super().save_model(request, obj, form, change)

        # Clear relevant caches
        service = FeatureFlagService()
        if obj.user:
            service.invalidate_user_cache(obj.user)
        service.invalidate_flag_cache(obj.feature.key)


class OnboardingStageListFilter(SimpleListFilter):
    """Custom filter for onboarding stages."""

    title = "Onboarding Stage"
    parameter_name = "stage_category"

    def lookups(self, request, model_admin):
        return (
            ("early", "Early Stages"),
            ("middle", "Middle Stages"),
            ("advanced", "Advanced Stages"),
            ("complete", "Complete"),
        )

    def queryset(self, request, queryset):
        from .enums import OnboardingStageTypes

        if self.value() == "early":
            early_stages = [
                OnboardingStageTypes.SIGNUP_COMPLETE.value,
                OnboardingStageTypes.EMAIL_VERIFIED.value,
                OnboardingStageTypes.PROFILE_SETUP.value,
            ]
            return queryset.filter(current_stage__in=early_stages)
        elif self.value() == "middle":
            middle_stages = [
                OnboardingStageTypes.ORGANIZATION_CREATED.value,
                OnboardingStageTypes.FIRST_TEAM_MEMBER.value,
            ]
            return queryset.filter(current_stage__in=middle_stages)
        elif self.value() == "advanced":
            advanced_stages = [
                OnboardingStageTypes.FIRST_PROJECT.value,
                OnboardingStageTypes.ADVANCED_FEATURES.value,
            ]
            return queryset.filter(current_stage__in=advanced_stages)
        elif self.value() == "complete":
            return queryset.filter(
                current_stage=OnboardingStageTypes.ONBOARDING_COMPLETE.value
            )

        return queryset


@admin.register(UserOnboardingProgress)
class UserOnboardingProgressAdmin(admin.ModelAdmin):
    """
    Admin interface for User Onboarding Progress.

    Tracks and manages user progression through onboarding stages.
    """

    list_display = [
        "user_email",
        "user_full_name",
        "current_stage",
        "progress_bar",
        "total_actions_completed",
        "stage_started_at",
        "is_complete",
        "organization",
    ]
    list_filter = [
        "current_stage",
        OnboardingStageListFilter,
        "created_at",
        "onboarding_completed_at",
        "organization",
        ("user", admin.RelatedOnlyFieldListFilter),
    ]
    search_fields = ["user__email", "user__first_name", "user__last_name"]
    readonly_fields = [
        "id",
        "progress_bar",
        "is_complete",
        "next_stage",
        "available_features_list",
        "created_at",
        "updated_at",
        "created_by",
        "updated_by",
    ]

    fieldsets = (
        ("User Information", {"fields": ("user", "organization")}),
        (
            "Progress",
            {
                "fields": (
                    "current_stage",
                    "progress_bar",
                    "total_actions_completed",
                    "is_complete",
                    "next_stage",
                )
            },
        ),
        ("Stage History", {"fields": ("completed_stages",), "classes": ("collapse",)}),
        (
            "Timestamps",
            {
                "fields": (
                    "stage_started_at",
                    "last_activity_at",
                    "onboarding_completed_at",
                )
            },
        ),
        (
            "Features",
            {"fields": ("available_features_list",), "classes": ("collapse",)},
        ),
        ("Custom Data", {"fields": ("custom_data",), "classes": ("collapse",)}),
        (
            "Metadata",
            {
                "fields": (
                    "id",
                    "created_at",
                    "updated_at",
                    "created_by",
                    "updated_by",
                ),
                "classes": ("collapse",),
            },
        ),
    )

    actions = ["advance_to_next_stage", "reset_progress", "mark_complete"]

    formfield_overrides = {
        models.JSONField: {"widget": Textarea(attrs={"rows": 4, "cols": 80})},
    }

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("user", "organization")

    def user_email(self, obj):
        """Display user email with link."""
        url = reverse("admin:accounts_account_change", args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.email)

    user_email.short_description = "Email"
    user_email.admin_order_field = "user__email"

    def user_full_name(self, obj):
        """Display user's full name."""
        return obj.user.full_name or "No name set"

    user_full_name.short_description = "Name"
    user_full_name.admin_order_field = "user__first_name"

    def progress_bar(self, obj):
        """Display visual progress bar."""
        percentage = obj.progress_percentage
        color = (
            "red"
            if percentage < 25
            else (
                "orange"
                if percentage < 50
                else "yellow"
                if percentage < 75
                else "green"
            )
        )

        return format_html(
            '<div style="width: 100px; height: 20px; background-color: #f0f0f0; border-radius: 10px; overflow: hidden;">'
            '<div style="width: {}%; height: 100%; background-color: {}; transition: width 0.3s;"></div>'
            "</div>"
            "<small>{}%</small>",
            percentage,
            color,
            percentage,
        )

    progress_bar.short_description = "Progress"

    def is_complete(self, obj):
        """Display completion status."""
        if obj.is_onboarding_complete():
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Complete</span>'
            )
        return format_html('<span style="color: orange;">In Progress</span>')

    is_complete.short_description = "Status"

    def next_stage(self, obj):
        """Display next recommended stage."""
        next_stage = obj.get_next_stage()
        return next_stage if next_stage else "None (complete)"

    next_stage.short_description = "Next Stage"

    def available_features_list(self, obj):
        """Display available features as a formatted list."""
        features = obj.get_available_features()
        if not features:
            return "None"

        return mark_safe("<br>".join([f"• {feature}" for feature in features]))

    available_features_list.short_description = "Available Features"

    def advance_to_next_stage(self, request, queryset):
        """Bulk action to advance users to next stage if possible."""
        from .services import OnboardingService

        service = OnboardingService()
        advanced_count = 0

        for progress in queryset:
            next_stage = service.auto_progress_user(progress.user)
            if next_stage:
                advanced_count += 1

        self.message_user(
            request,
            f"{advanced_count} users advanced to next stage. "
            f"{queryset.count() - advanced_count} users could not be advanced.",
        )

    advance_to_next_stage.short_description = "Advance to next stage (if possible)"

    def reset_progress(self, request, queryset):
        """Bulk action to reset onboarding progress."""
        from .enums import OnboardingStageTypes

        count = 0
        for progress in queryset:
            progress.current_stage = OnboardingStageTypes.SIGNUP_COMPLETE.value
            progress.completed_stages = []
            progress.total_actions_completed = 0
            progress.progress_percentage = 0
            progress.onboarding_completed_at = None
            progress.custom_data = {}
            progress.save()
            count += 1

            # Clear user cache
            service = FeatureFlagService()
            service.invalidate_all_user_caches(str(progress.user.id))

        self.message_user(request, f"{count} onboarding progress records reset.")

    reset_progress.short_description = "Reset onboarding progress"

    def mark_complete(self, request, queryset):
        """Bulk action to mark onboarding as complete."""
        from .enums import OnboardingStageTypes

        count = queryset.update(
            current_stage=OnboardingStageTypes.ONBOARDING_COMPLETE.value,
            progress_percentage=100,
            onboarding_completed_at=timezone.now(),
        )

        # Clear user caches
        service = FeatureFlagService()
        for progress in queryset:
            service.invalidate_all_user_caches(str(progress.user.id))

        self.message_user(request, f"{count} users marked as onboarding complete.")

    mark_complete.short_description = "Mark onboarding complete"

    def save_model(self, request, obj, form, change):
        """Set created_by/updated_by fields and clear cache."""
        if not change:
            obj.created_by = request.user
        else:
            obj.updated_by = request.user

        super().save_model(request, obj, form, change)

        # Clear user cache
        service = FeatureFlagService()
        service.invalidate_all_user_caches(str(obj.user.id))


# Additional admin customizations
admin.site.site_header = "VAS-DJ SaaS Admin"
admin.site.site_title = "Feature Flags Admin"
admin.site.index_title = "Feature Flags Management"
