import logging

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from .models import Invoice, Plan, Subscription, SubscriptionStatus
from .providers.factory import PaymentProviderFactory

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
    """
    Platform-agnostic billing service that uses PaymentProviderFactory.
    Handles subscription lifecycle, feature access, and database synchronization.
    """

    def __init__(self, provider_name: str | None = None):
        """Initialize billing service with a payment provider."""
        self.provider = PaymentProviderFactory.get_provider(provider_name)

    # ==================== Customer Management ====================

    def create_customer(self, account, organization=None):
        """Create a customer in the payment provider."""
        try:
            customer_data = self.provider.create_customer(
                email=account.email,
                name=account.get_full_name(),
                metadata={
                    "account_id": str(account.id),
                    "organization_id": str(organization.id) if organization else "",
                },
            )
            log.info(
                f"Customer created in {self.provider.provider_name}: {customer_data.external_id}"
            )
            return customer_data
        except Exception as e:
            log.error(f"Customer creation failed: {str(e)}")
            raise

    def get_or_create_customer(self, account, organization=None):
        """Get existing customer or create a new one."""
        try:
            # Try to find existing customer by email
            customer = self.provider.get_customer_by_email(account.email)
            if customer:
                return customer

            # Create new customer
            return self.create_customer(account, organization)
        except Exception as e:
            log.error(f"Get or create customer failed: {str(e)}")
            raise

    # ==================== Checkout & Subscription Creation ====================

    @transaction.atomic
    def create_checkout_session(
        self, plan: Plan, account, success_url: str, cancel_url: str, organization=None
    ):
        """Create a checkout session for subscription purchase."""
        try:
            # Get or create customer
            customer = self.get_or_create_customer(account, organization)

            # Create checkout session
            session_data = self.provider.create_checkout_session(
                customer_id=customer.external_id,
                price_id=plan.external_price_id,
                success_url=success_url,
                cancel_url=cancel_url,
                trial_period_days=plan.trial_period_days,
                metadata={
                    "plan_id": str(plan.id),
                    "account_id": str(account.id),
                    "organization_id": str(organization.id) if organization else "",
                },
            )

            log.info(
                f"Checkout session created: {session_data.session_id} for plan {plan.name}"
            )
            return session_data

        except Exception as e:
            log.error(f"Checkout session creation failed: {str(e)}")
            raise

    @transaction.atomic
    def create_subscription_from_checkout(self, checkout_session_data: dict):
        """
        Create local subscription from successful checkout.
        Accepts normalized checkout session data from provider webhook.
        """
        from django.contrib.auth import get_user_model

        from apps.organizations.models import Organization

        Account = get_user_model()

        try:
            metadata = checkout_session_data.get("metadata", {})
            account = Account.objects.get(id=metadata["account_id"])
            plan = Plan.objects.get(id=metadata["plan_id"])

            organization = None
            if metadata.get("organization_id"):
                organization = Organization.objects.get(id=metadata["organization_id"])

            # Get subscription data from provider
            subscription_id = checkout_session_data.get("subscription_id")
            if not subscription_id:
                raise ValueError("No subscription ID in checkout session data")

            subscription_data = self.provider.retrieve_subscription(subscription_id)

            # Create local subscription record
            if not organization:
                organization = account.organizations.first()
            subscription = Subscription.objects.create(
                organization=organization,
                plan=plan,
                provider=self.provider.provider_name,
                external_subscription_id=subscription_data.external_id,
                external_customer_id=subscription_data.external_customer_id,
                status=subscription_data.status,
                current_period_start=subscription_data.current_period_start,
                current_period_end=subscription_data.current_period_end,
                cancel_at_period_end=subscription_data.cancel_at_period_end,
                trial_start=subscription_data.trial_start,
                trial_end=subscription_data.trial_end,
                metadata=metadata,
            )

            log.info(
                f"Subscription created from checkout: {subscription.id} for {account.email}"
            )
            return subscription

        except Exception as e:
            log.error(f"Subscription creation from checkout failed: {str(e)}")
            raise

    # ==================== Subscription Lifecycle ====================

    @transaction.atomic
    def cancel_subscription(
        self, subscription: Subscription, at_period_end: bool = True
    ):
        """Cancel a subscription."""
        try:
            # Cancel in payment provider
            subscription_data = self.provider.cancel_subscription(
                subscription.external_subscription_id, at_period_end=at_period_end
            )

            # Update local record
            subscription.cancel_at_period_end = at_period_end
            if not at_period_end:
                subscription.status = SubscriptionStatus.CANCELED
                subscription.canceled_at = timezone.now()
            subscription.save()

            log.info(
                f"Subscription canceled: {subscription.id} (at_period_end={at_period_end})"
            )
            return subscription_data

        except Exception as e:
            log.error(f"Subscription cancellation failed: {str(e)}")
            raise

    @transaction.atomic
    def reactivate_subscription(self, subscription: Subscription):
        """Reactivate a canceled subscription."""
        try:
            # Reactivate in payment provider
            subscription_data = self.provider.reactivate_subscription(
                subscription.external_subscription_id
            )

            # Update local record
            subscription.cancel_at_period_end = False
            subscription.canceled_at = None
            subscription.save()

            log.info(f"Subscription reactivated: {subscription.id}")
            return subscription_data

        except Exception as e:
            log.error(f"Subscription reactivation failed: {str(e)}")
            raise

    @transaction.atomic
    def update_subscription_plan(self, subscription: Subscription, new_plan: Plan):
        """Update subscription to a new plan."""
        try:
            # Update in payment provider
            subscription_data = self.provider.update_subscription(
                subscription.external_subscription_id,
                new_price_id=new_plan.external_price_id,
                proration_behavior="always_invoice",  # Can be configurable
            )

            # Update local record
            subscription.plan = new_plan
            subscription.current_period_start = subscription_data.current_period_start
            subscription.current_period_end = subscription_data.current_period_end
            subscription.save()

            log.info(
                f"Subscription plan updated: {subscription.id} to plan {new_plan.name}"
            )
            return subscription_data

        except Exception as e:
            log.error(f"Subscription plan update failed: {str(e)}")
            raise

    # ==================== Synchronization ====================

    @transaction.atomic
    def sync_subscription_from_provider(self, external_subscription_id: str):
        """Sync subscription data from payment provider to local database."""
        try:
            # Get subscription from local database
            subscription = Subscription.objects.get(
                external_subscription_id=external_subscription_id
            )

            # Retrieve from provider
            subscription_data = self.provider.retrieve_subscription(
                external_subscription_id
            )

            # Update local record
            subscription.status = subscription_data.status
            subscription.current_period_start = subscription_data.current_period_start
            subscription.current_period_end = subscription_data.current_period_end
            subscription.cancel_at_period_end = subscription_data.cancel_at_period_end
            subscription.trial_start = subscription_data.trial_start
            subscription.trial_end = subscription_data.trial_end
            subscription.canceled_at = subscription_data.canceled_at
            subscription.save()

            log.info(f"Subscription synced: {subscription.id}")
            return subscription

        except Subscription.DoesNotExist:
            log.warning(
                f"Subscription not found for external ID: {external_subscription_id}"
            )
            return None
        except Exception as e:
            log.error(f"Subscription sync failed: {str(e)}")
            raise

    @transaction.atomic
    def sync_invoice_from_provider(self, external_invoice_id: str):
        """Sync invoice data from payment provider to local database."""
        try:
            # Get invoice from local database
            invoice = Invoice.objects.get(external_invoice_id=external_invoice_id)

            # Retrieve from provider
            invoice_data = self.provider.retrieve_invoice(external_invoice_id)

            # Update local record
            invoice.status = invoice_data.status
            invoice.subtotal = invoice_data.subtotal
            invoice.tax = invoice_data.tax
            invoice.total = invoice_data.total
            invoice.due_date = invoice_data.due_date
            invoice.paid_at = invoice_data.paid_at
            invoice.hosted_invoice_url = invoice_data.hosted_invoice_url or ""
            invoice.invoice_pdf_url = invoice_data.invoice_pdf_url or ""
            invoice.save()

            log.info(f"Invoice synced: {invoice.id}")
            return invoice

        except Invoice.DoesNotExist:
            log.warning(f"Invoice not found for external ID: {external_invoice_id}")
            return None
        except Exception as e:
            log.error(f"Invoice sync failed: {str(e)}")
            raise

    @transaction.atomic
    def create_invoice_from_provider_data(self, invoice_data):
        """Create a new invoice from provider data."""
        try:
            # Find the subscription
            subscription = Subscription.objects.get(
                external_subscription_id=invoice_data.get("subscription_id")
            )

            invoice = Invoice.objects.create(
                subscription=subscription,
                provider=self.provider.provider_name,
                external_invoice_id=invoice_data.external_id,
                external_payment_intent_id=invoice_data.payment_intent_id,
                number=invoice_data.number,
                status=invoice_data.status,
                subtotal=invoice_data.subtotal,
                tax=invoice_data.tax,
                total=invoice_data.total,
                currency=invoice_data.currency,
                period_start=invoice_data.period_start,
                period_end=invoice_data.period_end,
                due_date=invoice_data.due_date,
                paid_at=invoice_data.paid_at,
                hosted_invoice_url=invoice_data.hosted_invoice_url or "",
                invoice_pdf_url=invoice_data.invoice_pdf_url or "",
            )

            log.info(f"Invoice created: {invoice.id} ({invoice.number})")
            return invoice

        except Subscription.DoesNotExist:
            log.error(
                f"Subscription not found for invoice: {invoice_data.get('subscription_id')}"
            )
            return None
        except Exception as e:
            log.error(f"Invoice creation failed: {str(e)}")
            raise

    # ==================== Feature Access & Limits ====================

    @staticmethod
    def get_active_subscription(account, organization=None):
        """Get the active subscription for an organization."""
        if not organization:
            return None
        return Subscription.objects.filter(
            organization=organization,
            status__in=[SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
        ).first()

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
