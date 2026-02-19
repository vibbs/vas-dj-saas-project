from django.contrib import admin

from .models import ApiKey


@admin.register(ApiKey)
class ApiKeyAdmin(admin.ModelAdmin):
    list_display = ["name", "key_prefix", "organization", "status", "created_at"]
    list_filter = ["status"]
    search_fields = ["name", "key_prefix", "organization__name"]
    readonly_fields = ["id", "key_prefix", "key_hash", "created_at", "updated_at"]
