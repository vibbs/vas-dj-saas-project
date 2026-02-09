from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Account, AccountAuthProvider


class AccountAuthProviderInline(admin.TabularInline):
    model = AccountAuthProvider
    fk_name = "user"
    extra = 0
    readonly_fields = ("linked_at",)
    fields = ("provider", "provider_user_id", "email", "is_primary", "linked_at")


@admin.register(Account)
class AccountAdmin(UserAdmin):
    inlines = [AccountAuthProviderInline]
    list_display = (
        "email",
        "first_name",
        "last_name",
        "status",
        "is_active",
        "is_email_verified",
        "is_org_admin",
        "date_joined",
    )
    list_filter = (
        "status",
        "is_active",
        "is_email_verified",
        "is_org_admin",
        "is_org_creator",
        "role",
        "gender",
        "date_joined",
    )
    search_fields = ("email", "first_name", "last_name")
    readonly_fields = (
        "date_joined",
        "last_login",
        "email_verification_token_expires",
        "abbreviated_name",
        "full_name",
        "is_admin",
    )
    ordering = ("-date_joined",)

    fieldsets = (
        (
            "Basic Information",
            {"fields": ("email", "first_name", "last_name", "avatar", "phone", "bio")},
        ),
        (
            "Personal Details",
            {"fields": ("date_of_birth", "gender"), "classes": ("collapse",)},
        ),
        (
            "Authentication",
            {
                "fields": (
                    "password",
                    "is_active",
                    "is_email_verified",
                    "is_phone_verified",
                    "is_2fa_enabled",
                )
            },
        ),
        (
            "Email Verification",
            {
                "fields": (
                    "email_verification_token",
                    "email_verification_token_expires",
                ),
                "classes": ("collapse",),
            },
        ),
        (
            "Roles & Permissions",
            {
                "fields": (
                    "role",
                    "status",
                    "is_org_admin",
                    "is_org_creator",
                    "can_invite_users",
                    "can_manage_billing",
                    "can_delete_org",
                )
            },
        ),
        (
            "Django Admin Permissions",
            {
                "fields": ("is_staff", "is_superuser", "groups", "user_permissions"),
                "classes": ("collapse",),
            },
        ),
        (
            "Metadata",
            {
                "fields": (
                    "date_joined",
                    "last_login",
                    "abbreviated_name",
                    "full_name",
                    "is_admin",
                ),
                "classes": ("collapse",),
            },
        ),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                ),
            },
        ),
    )

    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing existing user
            return self.readonly_fields + ("email",)  # Email should not be changed
        return self.readonly_fields


@admin.register(AccountAuthProvider)
class AccountAuthProviderAdmin(admin.ModelAdmin):
    list_display = ("user", "provider", "email", "is_primary", "linked_at")
    list_filter = ("provider", "is_primary", "linked_at")
    search_fields = (
        "user__email",
        "user__first_name",
        "user__last_name",
        "email",
        "provider_user_id",
    )
    readonly_fields = ("linked_at",)
    ordering = ("-linked_at",)

    fieldsets = (
        (
            "Provider Information",
            {"fields": ("user", "provider", "provider_user_id", "email", "is_primary")},
        ),
        ("Metadata", {"fields": ("linked_at",)}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("user")
