from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema_field
from .models import Plan, Subscription, Invoice


class PlanSerializer(serializers.ModelSerializer):
    interval_display = serializers.CharField(source='get_interval_display', read_only=True)
    
    class Meta:
        model = Plan
        fields = [
            'id', 'name', 'slug', 'description',
            'stripe_price_id', 'stripe_product_id',
            'amount', 'currency', 'interval', 'interval_display', 'interval_count',
            'trial_period_days', 'is_active', 'features',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'interval_display']


class SubscriptionSerializer(serializers.ModelSerializer):
    account_email = serializers.CharField(source='account.email', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    plan_details = PlanSerializer(source='plan', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_active = serializers.SerializerMethodField()
    is_trialing = serializers.SerializerMethodField()
    is_canceled = serializers.SerializerMethodField()
    
    @extend_schema_field(serializers.BooleanField)
    def get_is_active(self, obj):
        return obj.is_active
    
    @extend_schema_field(serializers.BooleanField)
    def get_is_trialing(self, obj):
        return obj.is_trialing
    
    @extend_schema_field(serializers.BooleanField)
    def get_is_canceled(self, obj):
        return obj.is_canceled
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'account', 'account_email', 'plan', 'plan_name', 'plan_details',
            'stripe_subscription_id', 'stripe_customer_id',
            'status', 'status_display',
            'current_period_start', 'current_period_end',
            'trial_start', 'trial_end',
            'canceled_at', 'cancel_at_period_end',
            'grace_period_end', 'metadata',
            'is_active', 'is_trialing', 'is_canceled',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'account_email', 'plan_name', 'plan_details', 'status_display',
            'stripe_subscription_id', 'stripe_customer_id',
            'current_period_start', 'current_period_end',
            'trial_start', 'trial_end', 'canceled_at',
            'is_active', 'is_trialing', 'is_canceled',
            'created_at', 'updated_at'
        ]


class InvoiceSerializer(serializers.ModelSerializer):
    account_email = serializers.CharField(source='account.email', read_only=True)
    subscription_plan = serializers.CharField(source='subscription.plan.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_paid = serializers.SerializerMethodField()
    
    @extend_schema_field(serializers.BooleanField)
    def get_is_paid(self, obj):
        return obj.is_paid
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'subscription', 'account', 'account_email', 'subscription_plan',
            'stripe_invoice_id', 'stripe_payment_intent_id',
            'number', 'status', 'status_display',
            'subtotal', 'tax', 'total', 'currency',
            'period_start', 'period_end',
            'due_date', 'paid_at',
            'hosted_invoice_url', 'invoice_pdf_url',
            'metadata', 'is_paid',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'account_email', 'subscription_plan', 'status_display',
            'stripe_invoice_id', 'stripe_payment_intent_id',
            'number', 'status', 'subtotal', 'tax', 'total', 'currency',
            'period_start', 'period_end', 'due_date', 'paid_at',
            'hosted_invoice_url', 'invoice_pdf_url', 'is_paid',
            'created_at', 'updated_at'
        ]


class CreateCheckoutSessionSerializer(serializers.Serializer):
    plan_id = serializers.UUIDField()
    success_url = serializers.URLField()
    cancel_url = serializers.URLField()
    
    def validate_plan_id(self, value):
        try:
            plan = Plan.objects.get(id=value, is_active=True)
            return plan
        except Plan.DoesNotExist:
            raise serializers.ValidationError(_("Invalid or inactive plan"))


class SubscriptionActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['cancel', 'reactivate'])
    at_period_end = serializers.BooleanField(default=True)


class UsageSerializer(serializers.Serializer):
    feature_key = serializers.CharField()
    current_usage = serializers.IntegerField(read_only=True)
    limit = serializers.IntegerField(read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    percentage_used = serializers.FloatField(read_only=True)


class BillingOverviewSerializer(serializers.Serializer):
    active_subscription = SubscriptionSerializer(read_only=True)
    recent_invoices = InvoiceSerializer(many=True, read_only=True)
    usage_stats = UsageSerializer(many=True, read_only=True)
    has_active_subscription = serializers.BooleanField(read_only=True)
    is_in_grace_period = serializers.BooleanField(read_only=True)