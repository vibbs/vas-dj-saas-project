"""
Billing seeder for creating plans, subscriptions, and invoices.
"""

from datetime import timedelta
from decimal import Decimal

from django.utils import timezone

from apps.billing.models import Invoice, InvoiceStatus, Plan, Subscription, SubscriptionStatus

from .constants import SEED_PLANS


class BillingSeeder:
    """Seeder for billing-related test data."""

    def __init__(self, stdout, style):
        self.stdout = stdout
        self.style = style

    def _log_created(self, entity_type, identifier):
        self.stdout.write(self.style.SUCCESS(f"   + Created {entity_type}: {identifier}"))

    def _log_existing(self, entity_type, identifier):
        self.stdout.write(self.style.SUCCESS(f"   = {entity_type} exists: {identifier}"))

    def seed_plans(self):
        """
        Seed global billing plans.

        Returns:
            Dict of plan_key -> Plan instance
        """
        plans = {}
        for plan_key, plan_data in SEED_PLANS.items():
            plan, created = Plan.objects.get_or_create(
                slug=plan_data["slug"],
                defaults={
                    "name": plan_data["name"],
                    "description": plan_data["description"],
                    "amount": plan_data["amount"],
                    "currency": "usd",
                    "interval": "month",
                    "interval_count": 1,
                    "trial_period_days": plan_data["trial_period_days"],
                    "is_active": True,
                    "organization": None,  # Global plan
                    "provider": "stripe",
                    "external_price_id": f"price_seed_{plan_key}",
                    "external_product_id": f"prod_seed_{plan_key}",
                    "features": plan_data.get("features", {}),
                },
            )
            plans[plan_key] = plan

            if created:
                self._log_created("Plan", plan.name)
            else:
                self._log_existing("Plan", plan.name)

        return plans

    def seed_subscription(self, organization, plan):
        """
        Seed active subscription for an organization.

        Args:
            organization: Organization instance
            plan: Plan instance

        Returns:
            Subscription instance
        """
        now = timezone.now()

        subscription, created = Subscription.objects.get_or_create(
            organization=organization,
            defaults={
                "plan": plan,
                "provider": "stripe",
                "external_subscription_id": f"sub_seed_{organization.slug}",
                "external_customer_id": f"cus_seed_{organization.slug}",
                "status": SubscriptionStatus.ACTIVE,
                "current_period_start": now - timedelta(days=15),
                "current_period_end": now + timedelta(days=15),
                "metadata": {"seed": True, "created_at": now.isoformat()},
            },
        )

        if created:
            self._log_created("Subscription", f"{organization.name} - {plan.name}")
        else:
            self._log_existing("Subscription", f"{organization.name}")

        return subscription

    def seed_invoices(self, organization, subscription, count=3):
        """
        Seed paid invoices for an organization.

        Args:
            organization: Organization instance
            subscription: Subscription instance
            count: Number of invoices to create

        Returns:
            List of Invoice instances
        """
        invoices = []
        now = timezone.now()
        plan_amount = subscription.plan.amount

        for i in range(count):
            # Generate unique invoice number
            invoice_number = f"INV-SEED-{organization.slug.upper()}-{i + 1:04d}"

            # Calculate period dates (going backwards from now)
            period_end = now - timedelta(days=30 * i)
            period_start = period_end - timedelta(days=30)

            # Calculate amounts
            subtotal = plan_amount
            tax = subtotal * Decimal("0.08")  # 8% tax
            total = subtotal + tax

            invoice, created = Invoice.objects.get_or_create(
                number=invoice_number,
                defaults={
                    "organization": organization,
                    "subscription": subscription,
                    "provider": "stripe",
                    "external_invoice_id": f"in_seed_{organization.slug}_{i}",
                    "status": InvoiceStatus.PAID,
                    "subtotal": subtotal,
                    "tax": tax,
                    "total": total,
                    "currency": "usd",
                    "period_start": period_start,
                    "period_end": period_end,
                    "due_date": period_end,
                    "paid_at": period_end,
                    "metadata": {"seed": True},
                },
            )
            invoices.append(invoice)

            if created:
                self._log_created("Invoice", invoice_number)
            else:
                self._log_existing("Invoice", invoice_number)

        return invoices
