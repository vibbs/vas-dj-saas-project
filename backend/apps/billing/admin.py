from django.contrib import admin

from .models import Invoice, Plan, Subscription


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "amount",
        "currency",
        "interval",
        "is_active",
        "organization",
    ]
    list_filter = ["is_active", "interval", "currency", "organization"]
    search_fields = ["name", "slug", "stripe_price_id"]
    readonly_fields = ["id", "created_at", "updated_at"]


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ["organization", "plan", "status", "current_period_end"]
    list_filter = ["status", "plan", "cancel_at_period_end"]
    search_fields = ["organization__name", "stripe_subscription_id", "plan__name"]
    readonly_fields = [
        "id",
        "stripe_subscription_id",
        "stripe_customer_id",
        "created_at",
        "updated_at",
    ]
    date_hierarchy = "created_at"


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ["number", "organization", "status", "total", "currency", "paid_at"]
    list_filter = ["status", "currency"]
    search_fields = ["number", "organization__name", "stripe_invoice_id"]
    readonly_fields = [
        "id",
        "stripe_invoice_id",
        "stripe_payment_intent_id",
        "created_at",
        "updated_at",
    ]
    date_hierarchy = "created_at"
