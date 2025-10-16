from django.contrib import admin

from .models import Invite, Organization, OrganizationMembership


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "plan", "is_active", "on_trial", "created_at"]
    list_filter = ["plan", "is_active", "on_trial", "created_at"]
    search_fields = ["name", "slug", "creator_email"]
    readonly_fields = ["id", "created_at", "updated_at"]
    date_hierarchy = "created_at"

    fieldsets = (
        (None, {"fields": ("name", "slug", "description", "logo")}),
        (
            "Business Info",
            {
                "fields": (
                    "plan",
                    "is_active",
                    "on_trial",
                    "trial_ends_on",
                    "paid_until",
                )
            },
        ),
        ("Technical", {"fields": ("sub_domain", "created_by")}),
        (
            "Legacy Fields",
            {"fields": ("creator_email", "creator_name"), "classes": ("collapse",)},
        ),
        (
            "Metadata",
            {"fields": ("id", "created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(OrganizationMembership)
class OrganizationMembershipAdmin(admin.ModelAdmin):
    list_display = ["user", "organization", "role", "status", "joined_at"]
    list_filter = ["role", "status", "created_at"]
    search_fields = [
        "user__email",
        "user__first_name",
        "user__last_name",
        "organization__name",
    ]
    readonly_fields = ["id", "created_at", "updated_at"]
    date_hierarchy = "created_at"

    fieldsets = (
        (None, {"fields": ("organization", "user", "role", "status")}),
        (
            "Timestamps",
            {
                "fields": ("joined_at", "created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
        ("Invitation Info", {"fields": ("invited_by",), "classes": ("collapse",)}),
    )


@admin.register(Invite)
class InviteAdmin(admin.ModelAdmin):
    list_display = [
        "email",
        "organization",
        "role",
        "status",
        "invited_by",
        "created_at",
        "expires_at",
    ]
    list_filter = ["role", "status", "created_at"]
    search_fields = ["email", "organization__name", "invited_by__email"]
    readonly_fields = [
        "id",
        "token",
        "created_at",
        "updated_at",
        "accepted_at",
        "accepted_by",
    ]
    date_hierarchy = "created_at"

    fieldsets = (
        (None, {"fields": ("organization", "email", "role", "status")}),
        (
            "Invitation Details",
            {"fields": ("invited_by", "message", "token", "expires_at")},
        ),
        (
            "Acceptance Info",
            {"fields": ("accepted_by", "accepted_at"), "classes": ("collapse",)},
        ),
        (
            "Timestamps",
            {"fields": ("id", "created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
