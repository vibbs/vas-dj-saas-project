from django.db import models
from django.conf import settings
from decimal import Decimal
from apps.core.models import BaseFields


class PlanInterval(models.TextChoices):
    MONTH = "month", "Monthly"
    YEAR = "year", "Yearly"


class SubscriptionStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    CANCELED = "canceled", "Canceled"
    INCOMPLETE = "incomplete", "Incomplete"
    INCOMPLETE_EXPIRED = "incomplete_expired", "Incomplete Expired"
    PAST_DUE = "past_due", "Past Due"
    TRIALING = "trialing", "Trialing"
    UNPAID = "unpaid", "Unpaid"


class InvoiceStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    OPEN = "open", "Open"
    PAID = "paid", "Paid"
    UNCOLLECTIBLE = "uncollectible", "Uncollectible"
    VOID = "void", "Void"


class Plan(BaseFields):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    stripe_price_id = models.CharField(max_length=255, unique=True)
    stripe_product_id = models.CharField(max_length=255)

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="usd")
    interval = models.CharField(
        max_length=20, choices=PlanInterval.choices, default=PlanInterval.MONTH
    )
    interval_count = models.PositiveIntegerField(default=1)

    trial_period_days = models.PositiveIntegerField(default=0)

    is_active = models.BooleanField(default=True)

    features = models.JSONField(
        default=dict, blank=True, help_text="Plan features and limits"
    )

    class Meta:
        ordering = ["amount"]

    def __str__(self):
        return f"{self.name} ({self.get_interval_display()})"

    def get_interval_display(self):
        return f"{self.interval_count} {self.get_interval_display().lower()}"


class Subscription(BaseFields):
    account = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="subscriptions"
    )
    plan = models.ForeignKey(
        Plan, on_delete=models.PROTECT, related_name="subscriptions"
    )

    stripe_subscription_id = models.CharField(max_length=255, unique=True)
    stripe_customer_id = models.CharField(max_length=255)

    status = models.CharField(
        max_length=50,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.ACTIVE,
    )

    current_period_start = models.DateTimeField()
    current_period_end = models.DateTimeField()

    trial_start = models.DateTimeField(null=True, blank=True)
    trial_end = models.DateTimeField(null=True, blank=True)

    canceled_at = models.DateTimeField(null=True, blank=True)
    cancel_at_period_end = models.BooleanField(default=False)

    grace_period_end = models.DateTimeField(null=True, blank=True)

    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{getattr(self.account, 'email', str(self.account))} - {self.plan.name} ({self.status})"

    @property
    def is_active(self):
        return self.status == SubscriptionStatus.ACTIVE

    @property
    def is_trialing(self):
        return self.status == SubscriptionStatus.TRIALING

    @property
    def is_canceled(self):
        return self.status == SubscriptionStatus.CANCELED


class Invoice(BaseFields):
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE,
        related_name="invoices",
        null=True,
        blank=True,
    )
    account = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="invoices"
    )

    stripe_invoice_id = models.CharField(max_length=255, unique=True)
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True)

    number = models.CharField(max_length=100)

    status = models.CharField(
        max_length=50, choices=InvoiceStatus.choices, default=InvoiceStatus.DRAFT
    )

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    total = models.DecimalField(max_digits=10, decimal_places=2)

    currency = models.CharField(max_length=3, default="usd")

    period_start = models.DateTimeField()
    period_end = models.DateTimeField()

    due_date = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    hosted_invoice_url = models.URLField(blank=True)
    invoice_pdf_url = models.URLField(blank=True)

    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Invoice {self.number} - {self.account.email if hasattr(self.account, 'email') else self.account} ({self.status})"

    @property
    def is_paid(self):
        return self.status == InvoiceStatus.PAID
