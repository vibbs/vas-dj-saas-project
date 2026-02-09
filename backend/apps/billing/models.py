import uuid
from decimal import Decimal

from django.db import models

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
    # Override organization to be nullable for global plans
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="%(class)s_set",
        null=True,
        blank=True,
        help_text="If null, this is a global plan available to all organizations",
    )

    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    # Payment provider fields
    provider = models.CharField(
        max_length=50,
        default="stripe",
        help_text="Payment provider (stripe, paypal, etc.)",
    )
    external_price_id = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="External price/plan ID from payment provider",
    )
    external_product_id = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="External product ID from payment provider",
    )

    # Legacy Stripe fields (for backward compatibility)
    stripe_price_id = models.CharField(max_length=255, blank=True)
    stripe_product_id = models.CharField(max_length=255, blank=True)

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
        unique_together = [["provider", "external_price_id"]]

    def __str__(self):
        return f"{self.name} ({self.get_interval_display()})"

    def get_interval_display(self):
        return f"{self.interval_count} {self.get_interval_display().lower()}"

    def save(self, *args, **kwargs):
        # Auto-populate legacy stripe fields for backward compatibility
        if self.provider == "stripe":
            if self.external_price_id and not self.stripe_price_id:
                self.stripe_price_id = self.external_price_id
            if self.external_product_id and not self.stripe_product_id:
                self.stripe_product_id = self.external_product_id

        super().save(*args, **kwargs)


class Subscription(models.Model):
    # Remove BaseFields inheritance to avoid organization FK circular dependency
    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Organization-based subscription (1:1 relationship)
    organization = models.OneToOneField(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="subscription",
    )
    plan = models.ForeignKey(
        Plan, on_delete=models.PROTECT, related_name="subscriptions"
    )

    # Payment provider fields
    provider = models.CharField(
        max_length=50,
        default="stripe",
        help_text="Payment provider (stripe, paypal, etc.)",
    )
    external_subscription_id = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        help_text="External subscription ID from payment provider",
    )
    external_customer_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="External customer ID from payment provider",
    )

    # Legacy Stripe fields (for backward compatibility)
    stripe_subscription_id = models.CharField(
        max_length=255, unique=True, null=True, blank=True
    )
    stripe_customer_id = models.CharField(max_length=255, null=True, blank=True)

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
        return f"{self.organization.name} - {self.plan.name} ({self.status})"

    @property
    def is_active(self):
        return self.status == SubscriptionStatus.ACTIVE

    @property
    def is_trialing(self):
        return self.status == SubscriptionStatus.TRIALING

    @property
    def is_canceled(self):
        return self.status == SubscriptionStatus.CANCELED

    def save(self, *args, **kwargs):
        # Auto-populate legacy stripe fields for backward compatibility
        if self.provider == "stripe":
            if self.external_subscription_id and not self.stripe_subscription_id:
                self.stripe_subscription_id = self.external_subscription_id
            if self.external_customer_id and not self.stripe_customer_id:
                self.stripe_customer_id = self.external_customer_id

        super().save(*args, **kwargs)


class Invoice(models.Model):
    # Remove BaseFields inheritance to avoid organization FK circular dependency
    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Organization-based invoice
    organization = models.ForeignKey(
        "organizations.Organization", on_delete=models.CASCADE, related_name="invoices"
    )
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE,
        related_name="invoices",
        null=True,
        blank=True,
    )

    # Payment provider fields
    provider = models.CharField(
        max_length=50,
        default="stripe",
        help_text="Payment provider (stripe, paypal, etc.)",
    )
    external_invoice_id = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        help_text="External invoice ID from payment provider",
    )
    external_payment_intent_id = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="External payment intent ID",
    )

    # Legacy Stripe fields (for backward compatibility)
    stripe_invoice_id = models.CharField(max_length=255, blank=True)
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
        return f"Invoice {self.number} - {self.organization.name} ({self.status})"

    @property
    def is_paid(self):
        return self.status == InvoiceStatus.PAID

    def save(self, *args, **kwargs):
        # Auto-populate legacy stripe fields for backward compatibility
        if self.provider == "stripe":
            if self.external_invoice_id and not self.stripe_invoice_id:
                self.stripe_invoice_id = self.external_invoice_id
            if self.external_payment_intent_id and not self.stripe_payment_intent_id:
                self.stripe_payment_intent_id = self.external_payment_intent_id

        super().save(*args, **kwargs)
