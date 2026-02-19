"""
Test cases for billing models.
"""

from datetime import timedelta
from decimal import Decimal

import pytest
from django.db import IntegrityError
from django.utils import timezone

from apps.billing.models import (
    Invoice,
    InvoiceStatus,
    Plan,
    PlanInterval,
    Subscription,
    SubscriptionStatus,
)
from apps.organizations.tests.factories import OrganizationFactory


@pytest.fixture
def organization():
    return OrganizationFactory()


@pytest.fixture
def plan(organization):
    return Plan.objects.create(
        organization=organization,
        name="Pro Plan",
        slug="pro-plan",
        description="Professional plan",
        amount=Decimal("29.99"),
        currency="usd",
        interval=PlanInterval.MONTH,
        interval_count=1,
        trial_period_days=14,
        is_active=True,
        features={"max_users": 10, "api_calls": 10000, "storage_gb": 50},
    )


@pytest.fixture
def global_plan():
    return Plan.objects.create(
        organization=None,
        name="Starter Plan",
        slug="starter-plan",
        amount=Decimal("9.99"),
        currency="usd",
        interval=PlanInterval.MONTH,
        is_active=True,
        features={"max_users": 3},
    )


@pytest.fixture
def subscription(organization, plan):
    return Subscription.objects.create(
        organization=organization,
        plan=plan,
        status=SubscriptionStatus.ACTIVE,
        current_period_start=timezone.now(),
        current_period_end=timezone.now() + timedelta(days=30),
    )


@pytest.fixture
def invoice(organization, subscription):
    return Invoice.objects.create(
        organization=organization,
        subscription=subscription,
        number="INV-001",
        status=InvoiceStatus.PAID,
        subtotal=Decimal("29.99"),
        tax=Decimal("2.40"),
        total=Decimal("32.39"),
        currency="usd",
        period_start=timezone.now() - timedelta(days=30),
        period_end=timezone.now(),
        paid_at=timezone.now(),
    )


@pytest.mark.django_db
@pytest.mark.unit
@pytest.mark.billing
class TestPlanModel:
    def test_plan_creation(self, plan):
        assert plan.name == "Pro Plan"
        assert plan.slug == "pro-plan"
        assert plan.amount == Decimal("29.99")
        assert plan.interval == PlanInterval.MONTH
        assert plan.is_active is True

    def test_plan_features(self, plan):
        assert plan.features["max_users"] == 10
        assert plan.features["api_calls"] == 10000

    def test_global_plan_has_no_organization(self, global_plan):
        assert global_plan.organization is None

    def test_plan_string_representation(self, plan):
        assert "Pro Plan" in str(plan)

    def test_plan_ordering(self, plan, global_plan):
        plans = Plan.objects.filter(is_active=True).order_by("amount")
        assert plans.first().amount < plans.last().amount

    def test_stripe_field_auto_population(self, organization):
        plan = Plan.objects.create(
            organization=organization,
            name="Stripe Plan",
            slug="stripe-plan",
            amount=Decimal("19.99"),
            provider="stripe",
            external_price_id="price_abc123",
            external_product_id="prod_xyz789",
        )
        assert plan.stripe_price_id == "price_abc123"
        assert plan.stripe_product_id == "prod_xyz789"


@pytest.mark.django_db
@pytest.mark.unit
@pytest.mark.billing
class TestSubscriptionModel:
    def test_subscription_creation(self, subscription, organization, plan):
        assert subscription.organization == organization
        assert subscription.plan == plan
        assert subscription.status == SubscriptionStatus.ACTIVE

    def test_is_active_property(self, subscription):
        assert subscription.is_active is True
        subscription.status = SubscriptionStatus.CANCELED
        assert subscription.is_active is False

    def test_is_trialing_property(self, subscription):
        assert subscription.is_trialing is False
        subscription.status = SubscriptionStatus.TRIALING
        assert subscription.is_trialing is True

    def test_is_canceled_property(self, subscription):
        assert subscription.is_canceled is False
        subscription.status = SubscriptionStatus.CANCELED
        assert subscription.is_canceled is True

    def test_subscription_string_representation(self, subscription):
        result = str(subscription)
        assert subscription.organization.name in result
        assert subscription.plan.name in result

    def test_one_to_one_with_organization(self, subscription, organization, plan):
        with pytest.raises(IntegrityError):
            Subscription.objects.create(
                organization=organization,
                plan=plan,
                status=SubscriptionStatus.ACTIVE,
                current_period_start=timezone.now(),
                current_period_end=timezone.now() + timedelta(days=30),
            )

    def test_stripe_field_auto_population(self, organization, plan):
        org2 = OrganizationFactory()
        sub = Subscription.objects.create(
            organization=org2,
            plan=plan,
            provider="stripe",
            external_subscription_id="sub_abc123",
            external_customer_id="cus_xyz789",
            status=SubscriptionStatus.ACTIVE,
            current_period_start=timezone.now(),
            current_period_end=timezone.now() + timedelta(days=30),
        )
        assert sub.stripe_subscription_id == "sub_abc123"
        assert sub.stripe_customer_id == "cus_xyz789"


@pytest.mark.django_db
@pytest.mark.unit
@pytest.mark.billing
class TestInvoiceModel:
    def test_invoice_creation(self, invoice, organization):
        assert invoice.organization == organization
        assert invoice.number == "INV-001"
        assert invoice.total == Decimal("32.39")

    def test_is_paid_property(self, invoice):
        assert invoice.is_paid is True
        invoice.status = InvoiceStatus.OPEN
        assert invoice.is_paid is False

    def test_invoice_string_representation(self, invoice):
        result = str(invoice)
        assert "INV-001" in result

    def test_invoice_ordering(self, organization, subscription):
        Invoice.objects.create(
            organization=organization,
            subscription=subscription,
            number="INV-002",
            status=InvoiceStatus.PAID,
            subtotal=Decimal("10.00"),
            total=Decimal("10.00"),
            period_start=timezone.now() - timedelta(days=60),
            period_end=timezone.now() - timedelta(days=30),
        )
        Invoice.objects.create(
            organization=organization,
            subscription=subscription,
            number="INV-003",
            status=InvoiceStatus.OPEN,
            subtotal=Decimal("20.00"),
            total=Decimal("20.00"),
            period_start=timezone.now() - timedelta(days=30),
            period_end=timezone.now(),
        )
        invoices = Invoice.objects.filter(organization=organization)
        assert invoices.first().created_at >= invoices.last().created_at


@pytest.mark.django_db
@pytest.mark.unit
@pytest.mark.billing
class TestBillingServiceStaticMethods:
    def test_get_active_subscription(self, subscription, organization):
        from apps.billing.services import BillingService

        result = BillingService.get_active_subscription(None, organization)
        assert result == subscription

    def test_get_active_subscription_none_without_org(self, subscription):
        from apps.billing.services import BillingService

        result = BillingService.get_active_subscription(None, None)
        assert result is None

    def test_has_active_subscription(self, subscription, organization):
        from apps.billing.services import BillingService

        assert BillingService.has_active_subscription(None, organization) is True

    def test_has_no_active_subscription(self, organization):
        from apps.billing.services import BillingService

        assert BillingService.has_active_subscription(None, organization) is False

    def test_is_feature_available(self, subscription, organization):
        from apps.billing.services import BillingService

        assert (
            BillingService.is_feature_available(None, "max_users", organization) == 10
        )

    def test_get_usage_limit(self, subscription, organization):
        from apps.billing.services import BillingService

        assert (
            BillingService.get_usage_limit(None, "api_calls", organization) == 10000
        )
        assert BillingService.get_usage_limit(None, "nonexistent", organization) == 0

    def test_is_not_in_grace_period(self, subscription, organization):
        from apps.billing.services import BillingService

        assert BillingService.is_in_grace_period(None, organization) is False

    def test_is_in_grace_period(self, subscription, organization):
        from apps.billing.services import BillingService

        subscription.grace_period_end = timezone.now() + timedelta(days=7)
        subscription.save()
        assert BillingService.is_in_grace_period(None, organization) is True
