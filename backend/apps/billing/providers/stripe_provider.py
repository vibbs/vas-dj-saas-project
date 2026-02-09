"""
Stripe payment provider implementation.

Implements the BasePaymentProvider interface for Stripe.
"""

import logging
from datetime import datetime
from decimal import Decimal
from typing import Any

from django.utils import timezone

try:
    import stripe
except ImportError:
    stripe = None

from .base import (
    BasePaymentProvider,
    CheckoutSessionData,
    CustomerData,
    InvoiceData,
    PaymentProviderError,
    SubscriptionData,
)

logger = logging.getLogger(__name__)


class StripePaymentProvider(BasePaymentProvider):
    """Stripe implementation of the payment provider interface."""

    def __init__(self, api_key: str, **kwargs):
        super().__init__(api_key, **kwargs)

        if stripe is None:
            raise PaymentProviderError("Stripe library is not installed")

        stripe.api_key = api_key
        self.stripe = stripe

    @property
    def provider_name(self) -> str:
        return "stripe"

    def create_customer(
        self, email: str, name: str, metadata: dict[str, Any] | None = None
    ) -> CustomerData:
        """Create a Stripe customer."""
        try:
            customer_data = {
                "email": email,
                "name": name,
                "metadata": metadata or {},
            }

            customer = self.stripe.Customer.create(**customer_data)

            return CustomerData(
                email=customer.email,
                name=customer.name,
                external_id=customer.id,
                metadata=customer.metadata,
            )

        except self.stripe.error.StripeError as e:
            logger.error(f"Stripe customer creation failed: {str(e)}")
            raise PaymentProviderError(f"Customer creation failed: {str(e)}")

    def get_or_create_customer(
        self, email: str, name: str, metadata: dict[str, Any] | None = None
    ) -> CustomerData:
        """Get existing Stripe customer or create new one."""
        try:
            # Search for existing customer by email
            customers = self.stripe.Customer.list(email=email, limit=1)

            if customers.data:
                customer = customers.data[0]
                return CustomerData(
                    email=customer.email,
                    name=customer.name,
                    external_id=customer.id,
                    metadata=customer.metadata,
                )

            # Create new customer if none found
            return self.create_customer(email, name, metadata)

        except self.stripe.error.StripeError as e:
            logger.error(f"Stripe get_or_create_customer failed: {str(e)}")
            raise PaymentProviderError(f"Customer retrieval failed: {str(e)}")

    def create_checkout_session(
        self,
        customer_id: str,
        price_id: str,
        success_url: str,
        cancel_url: str,
        trial_period_days: int = 0,
        metadata: dict[str, Any] | None = None,
    ) -> CheckoutSessionData:
        """Create a Stripe checkout session."""
        try:
            session_data = {
                "customer": customer_id,
                "payment_method_types": ["card"],
                "line_items": [
                    {
                        "price": price_id,
                        "quantity": 1,
                    }
                ],
                "mode": "subscription",
                "success_url": success_url,
                "cancel_url": cancel_url,
                "metadata": metadata or {},
            }

            if trial_period_days > 0:
                session_data["subscription_data"] = {
                    "trial_period_days": trial_period_days
                }

            session = self.stripe.checkout.Session.create(**session_data)

            return CheckoutSessionData(
                session_id=session.id,
                checkout_url=session.url,
                external_subscription_id=session.subscription,
                external_customer_id=session.customer,
                metadata=session.metadata,
            )

        except self.stripe.error.StripeError as e:
            logger.error(f"Stripe checkout session creation failed: {str(e)}")
            raise PaymentProviderError(f"Checkout session creation failed: {str(e)}")

    def retrieve_subscription(self, subscription_id: str) -> SubscriptionData:
        """Retrieve Stripe subscription details."""
        try:
            sub = self.stripe.Subscription.retrieve(subscription_id)

            return SubscriptionData(
                external_id=sub.id,
                external_customer_id=sub.customer,
                status=sub.status,
                current_period_start=datetime.fromtimestamp(
                    sub.current_period_start, tz=timezone.utc
                ),
                current_period_end=datetime.fromtimestamp(
                    sub.current_period_end, tz=timezone.utc
                ),
                cancel_at_period_end=sub.cancel_at_period_end,
                trial_start=(
                    datetime.fromtimestamp(sub.trial_start, tz=timezone.utc)
                    if sub.trial_start
                    else None
                ),
                trial_end=(
                    datetime.fromtimestamp(sub.trial_end, tz=timezone.utc)
                    if sub.trial_end
                    else None
                ),
                canceled_at=(
                    datetime.fromtimestamp(sub.canceled_at, tz=timezone.utc)
                    if sub.canceled_at
                    else None
                ),
                metadata=sub.metadata,
            )

        except self.stripe.error.StripeError as e:
            logger.error(f"Stripe subscription retrieval failed: {str(e)}")
            raise PaymentProviderError(f"Subscription retrieval failed: {str(e)}")

    def cancel_subscription(
        self, subscription_id: str, at_period_end: bool = True
    ) -> SubscriptionData:
        """Cancel a Stripe subscription."""
        try:
            if at_period_end:
                sub = self.stripe.Subscription.modify(
                    subscription_id, cancel_at_period_end=True
                )
            else:
                sub = self.stripe.Subscription.cancel(subscription_id)

            return self.retrieve_subscription(sub.id)

        except self.stripe.error.StripeError as e:
            logger.error(f"Stripe subscription cancellation failed: {str(e)}")
            raise PaymentProviderError(f"Subscription cancellation failed: {str(e)}")

    def reactivate_subscription(self, subscription_id: str) -> SubscriptionData:
        """Reactivate a Stripe subscription."""
        try:
            sub = self.stripe.Subscription.modify(
                subscription_id, cancel_at_period_end=False
            )

            return self.retrieve_subscription(sub.id)

        except self.stripe.error.StripeError as e:
            logger.error(f"Stripe subscription reactivation failed: {str(e)}")
            raise PaymentProviderError(f"Subscription reactivation failed: {str(e)}")

    def update_subscription(
        self, subscription_id: str, price_id: str, prorate: bool = True
    ) -> SubscriptionData:
        """Update Stripe subscription to a different plan."""
        try:
            # Get current subscription
            subscription = self.stripe.Subscription.retrieve(subscription_id)

            # Update subscription with new price
            sub = self.stripe.Subscription.modify(
                subscription_id,
                items=[
                    {
                        "id": subscription["items"]["data"][0].id,
                        "price": price_id,
                    }
                ],
                proration_behavior="create_prorations" if prorate else "none",
            )

            return self.retrieve_subscription(sub.id)

        except self.stripe.error.StripeError as e:
            logger.error(f"Stripe subscription update failed: {str(e)}")
            raise PaymentProviderError(f"Subscription update failed: {str(e)}")

    def retrieve_invoice(self, invoice_id: str) -> InvoiceData:
        """Retrieve Stripe invoice details."""
        try:
            invoice = self.stripe.Invoice.retrieve(invoice_id)

            return InvoiceData(
                external_id=invoice.id,
                number=invoice.number or invoice.id,
                status=invoice.status,
                subtotal=Decimal(str(invoice.subtotal / 100)),  # Convert from cents
                tax=Decimal(str(invoice.tax / 100 if invoice.tax else 0)),
                total=Decimal(str(invoice.total / 100)),
                currency=invoice.currency,
                period_start=datetime.fromtimestamp(
                    invoice.period_start, tz=timezone.utc
                ),
                period_end=datetime.fromtimestamp(invoice.period_end, tz=timezone.utc),
                due_date=(
                    datetime.fromtimestamp(invoice.due_date, tz=timezone.utc)
                    if invoice.due_date
                    else None
                ),
                paid_at=(
                    datetime.fromtimestamp(
                        invoice.status_transitions.paid_at, tz=timezone.utc
                    )
                    if invoice.status_transitions and invoice.status_transitions.paid_at
                    else None
                ),
                hosted_invoice_url=invoice.hosted_invoice_url or "",
                invoice_pdf_url=invoice.invoice_pdf or "",
                external_payment_intent_id=invoice.payment_intent,
                metadata=invoice.metadata,
            )

        except self.stripe.error.StripeError as e:
            logger.error(f"Stripe invoice retrieval failed: {str(e)}")
            raise PaymentProviderError(f"Invoice retrieval failed: {str(e)}")

    def list_invoices(self, customer_id: str, limit: int = 10) -> list[InvoiceData]:
        """List Stripe invoices for a customer."""
        try:
            invoices = self.stripe.Invoice.list(customer=customer_id, limit=limit)

            return [self.retrieve_invoice(invoice.id) for invoice in invoices.data]

        except self.stripe.error.StripeError as e:
            logger.error(f"Stripe invoice listing failed: {str(e)}")
            raise PaymentProviderError(f"Invoice listing failed: {str(e)}")

    def construct_webhook_event(
        self, payload: bytes, signature: str, webhook_secret: str
    ) -> Any:
        """Construct and verify Stripe webhook event."""
        try:
            event = self.stripe.Webhook.construct_event(
                payload, signature, webhook_secret
            )
            return event

        except ValueError as e:
            logger.error(f"Invalid webhook payload: {str(e)}")
            raise PaymentProviderError(f"Invalid webhook payload: {str(e)}")
        except self.stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid webhook signature: {str(e)}")
            raise PaymentProviderError(f"Invalid webhook signature: {str(e)}")

    def handle_webhook_event(self, event: Any) -> dict[str, Any]:
        """Handle Stripe webhook event and return normalized data."""
        event_type = event["type"]
        data = event["data"]["object"]

        # Normalize Stripe event types to generic types
        event_type_map = {
            "checkout.session.completed": "checkout_completed",
            "customer.subscription.created": "subscription_created",
            "customer.subscription.updated": "subscription_updated",
            "customer.subscription.deleted": "subscription_deleted",
            "customer.subscription.trial_will_end": "subscription_trial_ending",
            "invoice.paid": "invoice_paid",
            "invoice.payment_failed": "invoice_payment_failed",
            "invoice.created": "invoice_created",
            "invoice.finalized": "invoice_finalized",
            "payment_intent.succeeded": "payment_succeeded",
            "payment_intent.payment_failed": "payment_failed",
        }

        normalized_type = event_type_map.get(event_type, event_type)

        return {
            "event_type": normalized_type,
            "data": data,
            "raw": event,
            "provider": self.provider_name,
        }
