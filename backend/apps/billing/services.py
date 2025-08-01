import logging
from django.conf import settings

try:
    import stripe

    stripe.api_key = getattr(settings, "STRIPE_SECRET_KEY", "")
except ImportError:
    stripe = None
from django.utils import timezone
from typing import Optional, Dict, Any
from .models import Plan, Subscription, Invoice, SubscriptionStatus, InvoiceStatus

log = logging.getLogger(f"{settings.LOG_APP_PREFIX}.billing.services")


class StripeService:

    @staticmethod
    def create_customer(account, organization=None):
        customer_data = {
            "email": account.email,
            "name": account.get_full_name(),
            "metadata": {
                "account_id": str(account.id),
                "organization_id": str(organization.id) if organization else "",
            },
        }

        if organization:
            customer_data["description"] = f"Customer for {organization.name}"

        return stripe.Customer.create(**customer_data)

    @staticmethod
    def create_checkout_session(
        plan: Plan, account, success_url: str, cancel_url: str, organization=None
    ):
        try:
            customer = StripeService.get_or_create_customer(account, organization)

            session_data = {
                "customer": customer.id,
                "payment_method_types": ["card"],
                "line_items": [
                    {
                        "price": plan.stripe_price_id,
                        "quantity": 1,
                    }
                ],
                "mode": "subscription",
                "success_url": success_url,
                "cancel_url": cancel_url,
                "metadata": {
                    "plan_id": str(plan.id),
                    "account_id": str(account.id),
                    "organization_id": str(organization.id) if organization else "",
                },
            }

            if plan.trial_period_days > 0:
                session_data["subscription_data"] = {
                    "trial_period_days": plan.trial_period_days
                }

            return stripe.checkout.Session.create(**session_data)

        except stripe.error.StripeError as e:
            raise Exception(f"Stripe checkout session creation failed: {str(e)}")

    @staticmethod
    def get_or_create_customer(account, organization=None):
        customers = stripe.Customer.list(email=account.email, limit=1)

        if customers.data:
            return customers.data[0]
        else:
            return StripeService.create_customer(account, organization)

    @staticmethod
    def cancel_subscription(subscription: Subscription, at_period_end: bool = True):
        try:
            stripe_subscription = stripe.Subscription.modify(
                subscription.stripe_subscription_id, cancel_at_period_end=at_period_end
            )

            subscription.cancel_at_period_end = at_period_end
            if not at_period_end:
                subscription.status = SubscriptionStatus.CANCELED
                subscription.canceled_at = timezone.now()
            subscription.save()

            return stripe_subscription

        except stripe.error.StripeError as e:
            raise Exception(f"Stripe subscription cancellation failed: {str(e)}")

    @staticmethod
    def reactivate_subscription(subscription: Subscription):
        try:
            stripe_subscription = stripe.Subscription.modify(
                subscription.stripe_subscription_id, cancel_at_period_end=False
            )

            subscription.cancel_at_period_end = False
            subscription.canceled_at = None
            subscription.save()

            return stripe_subscription

        except stripe.error.StripeError as e:
            raise Exception(f"Stripe subscription reactivation failed: {str(e)}")

    @staticmethod
    def sync_subscription_from_stripe(stripe_subscription_id: str):
        try:
            stripe_sub = stripe.Subscription.retrieve(stripe_subscription_id)

            try:
                subscription = Subscription.objects.get(
                    stripe_subscription_id=stripe_subscription_id
                )
            except Subscription.DoesNotExist:
                return None

            subscription.status = stripe_sub.status
            subscription.current_period_start = timezone.datetime.fromtimestamp(
                stripe_sub.current_period_start, tz=timezone.utc
            )
            subscription.current_period_end = timezone.datetime.fromtimestamp(
                stripe_sub.current_period_end, tz=timezone.utc
            )

            if stripe_sub.trial_start:
                subscription.trial_start = timezone.datetime.fromtimestamp(
                    stripe_sub.trial_start, tz=timezone.utc
                )
            if stripe_sub.trial_end:
                subscription.trial_end = timezone.datetime.fromtimestamp(
                    stripe_sub.trial_end, tz=timezone.utc
                )

            if stripe_sub.canceled_at:
                subscription.canceled_at = timezone.datetime.fromtimestamp(
                    stripe_sub.canceled_at, tz=timezone.utc
                )

            subscription.cancel_at_period_end = stripe_sub.cancel_at_period_end
            subscription.save()

            return subscription

        except stripe.error.StripeError as e:
            raise Exception(f"Stripe subscription sync failed: {str(e)}")

    @staticmethod
    def sync_invoice_from_stripe(stripe_invoice_id: str):
        try:
            stripe_invoice = stripe.Invoice.retrieve(stripe_invoice_id)

            try:
                invoice = Invoice.objects.get(stripe_invoice_id=stripe_invoice_id)
            except Invoice.DoesNotExist:
                return None

            invoice.status = stripe_invoice.status
            invoice.subtotal = stripe_invoice.subtotal / 100  # Convert from cents
            invoice.tax = stripe_invoice.tax / 100 if stripe_invoice.tax else 0
            invoice.total = stripe_invoice.total / 100

            if stripe_invoice.due_date:
                invoice.due_date = timezone.datetime.fromtimestamp(
                    stripe_invoice.due_date, tz=timezone.utc
                )

            if (
                stripe_invoice.status_transitions
                and stripe_invoice.status_transitions.get("paid_at")
            ):
                invoice.paid_at = timezone.datetime.fromtimestamp(
                    stripe_invoice.status_transitions["paid_at"], tz=timezone.utc
                )

            invoice.hosted_invoice_url = stripe_invoice.hosted_invoice_url or ""
            invoice.invoice_pdf_url = stripe_invoice.invoice_pdf or ""

            invoice.save()
            return invoice

        except stripe.error.StripeError as e:
            raise Exception(f"Stripe invoice sync failed: {str(e)}")


class BillingService:

    @staticmethod
    def get_active_subscription(account, organization=None):
        """Get the active subscription for an account within an organization."""
        queryset = Subscription.objects.filter(
            account=account,
            status__in=[SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
        )

        if organization:
            queryset = queryset.filter(organization=organization)

        return queryset.first()

    @staticmethod
    def has_active_subscription(account, organization=None):
        """Check if account has an active subscription."""
        return BillingService.get_active_subscription(account, organization) is not None

    @staticmethod
    def is_feature_available(account, feature_key: str, organization=None):
        """Check if a specific feature is available for the account."""
        subscription = BillingService.get_active_subscription(account, organization)

        if not subscription:
            return False

        plan_features = subscription.plan.features
        return plan_features.get(feature_key, False)

    @staticmethod
    def get_usage_limit(account, limit_key: str, organization=None):
        """Get usage limit for a specific feature."""
        subscription = BillingService.get_active_subscription(account, organization)

        if not subscription:
            return 0

        plan_features = subscription.plan.features
        return plan_features.get(limit_key, 0)

    @staticmethod
    def is_in_grace_period(account, organization=None):
        """Check if account is in grace period after subscription expiry."""
        subscription = BillingService.get_active_subscription(account, organization)

        if not subscription or not subscription.grace_period_end:
            return False

        return timezone.now() <= subscription.grace_period_end

    @staticmethod
    def create_subscription_from_checkout(checkout_session):
        """Create local subscription from successful Stripe checkout."""
        from django.contrib.auth import get_user_model
        from apps.organizations.models import Organization

        Account = get_user_model()

        metadata = checkout_session.metadata
        account = Account.objects.get(id=metadata["account_id"])
        plan = Plan.objects.get(id=metadata["plan_id"])

        organization = None
        if metadata.get("organization_id"):
            organization = Organization.objects.get(id=metadata["organization_id"])

        stripe_subscription = stripe.Subscription.retrieve(
            checkout_session.subscription
        )

        subscription = Subscription.objects.create(
            account=account,
            organization=organization or account.organizations.first(),
            plan=plan,
            stripe_subscription_id=stripe_subscription.id,
            stripe_customer_id=stripe_subscription.customer,
            status=stripe_subscription.status,
            current_period_start=timezone.datetime.fromtimestamp(
                stripe_subscription.current_period_start, tz=timezone.utc
            ),
            current_period_end=timezone.datetime.fromtimestamp(
                stripe_subscription.current_period_end, tz=timezone.utc
            ),
            cancel_at_period_end=stripe_subscription.cancel_at_period_end,
            metadata=metadata,
        )

        if stripe_subscription.trial_start:
            subscription.trial_start = timezone.datetime.fromtimestamp(
                stripe_subscription.trial_start, tz=timezone.utc
            )
        if stripe_subscription.trial_end:
            subscription.trial_end = timezone.datetime.fromtimestamp(
                stripe_subscription.trial_end, tz=timezone.utc
            )

        subscription.save()
        return subscription
