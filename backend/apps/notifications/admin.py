from django.contrib import admin

from .models import Notification, NotificationPreference


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["title", "recipient", "category", "is_read", "created_at"]
    list_filter = ["category", "is_read", "priority"]
    search_fields = ["title", "message", "recipient__email"]
    readonly_fields = ["id", "created_at", "updated_at"]


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ["user", "email_enabled", "push_enabled", "in_app_enabled"]
    search_fields = ["user__email"]
