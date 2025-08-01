from django.contrib import admin
from .models import Plan, Subscription, Invoice


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'amount', 'currency', 'interval', 'is_active', 'organization']
    list_filter = ['is_active', 'interval', 'currency', 'organization']
    search_fields = ['name', 'slug', 'stripe_price_id']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['account', 'plan', 'status', 'current_period_end', 'organization']
    list_filter = ['status', 'plan', 'organization', 'cancel_at_period_end']
    search_fields = ['account__email', 'stripe_subscription_id', 'plan__name']
    readonly_fields = ['id', 'stripe_subscription_id', 'stripe_customer_id', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['number', 'account', 'status', 'total', 'currency', 'paid_at', 'organization']
    list_filter = ['status', 'currency', 'organization']
    search_fields = ['number', 'account__email', 'stripe_invoice_id']
    readonly_fields = ['id', 'stripe_invoice_id', 'stripe_payment_intent_id', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
