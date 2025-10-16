"""
Base payment provider interface.

All payment providers must implement this interface to ensure
consistent behavior across different payment platforms.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Any


class PaymentProviderError(Exception):
    """Base exception for payment provider errors."""

    pass


@dataclass
class CustomerData:
    """Data class for customer information."""

    email: str
    name: str
    external_id: str | None = None
    metadata: dict[str, Any] | None = None


@dataclass
class CheckoutSessionData:
    """Data class for checkout session information."""

    session_id: str
    checkout_url: str
    external_subscription_id: str | None = None
    external_customer_id: str | None = None
    metadata: dict[str, Any] | None = None


@dataclass
class SubscriptionData:
    """Data class for subscription information."""

    external_id: str
    external_customer_id: str
    status: str
    current_period_start: datetime
    current_period_end: datetime
    cancel_at_period_end: bool
    trial_start: datetime | None = None
    trial_end: datetime | None = None
    canceled_at: datetime | None = None
    metadata: dict[str, Any] | None = None


@dataclass
class InvoiceData:
    """Data class for invoice information."""

    external_id: str
    number: str
    status: str
    subtotal: Decimal
    tax: Decimal
    total: Decimal
    currency: str
    period_start: datetime
    period_end: datetime
    due_date: datetime | None = None
    paid_at: datetime | None = None
    hosted_invoice_url: str | None = None
    invoice_pdf_url: str | None = None
    external_payment_intent_id: str | None = None
    metadata: dict[str, Any] | None = None


class BasePaymentProvider(ABC):
    """
    Abstract base class for payment providers.

    All payment providers (Stripe, PayPal, etc.) must implement this interface.
    """

    def __init__(self, api_key: str, **kwargs):
        """
        Initialize the payment provider.

        Args:
            api_key: API key for the payment provider
            **kwargs: Additional provider-specific configuration
        """
        self.api_key = api_key
        self.config = kwargs

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return the name of the payment provider (e.g., 'stripe', 'paypal')."""
        pass

    @abstractmethod
    def create_customer(
        self, email: str, name: str, metadata: dict[str, Any] | None = None
    ) -> CustomerData:
        """
        Create a customer in the payment provider.

        Args:
            email: Customer email
            name: Customer name
            metadata: Additional metadata

        Returns:
            CustomerData with external_id and metadata

        Raises:
            PaymentProviderError: If customer creation fails
        """
        pass

    @abstractmethod
    def get_or_create_customer(
        self, email: str, name: str, metadata: dict[str, Any] | None = None
    ) -> CustomerData:
        """
        Get existing customer or create new one.

        Args:
            email: Customer email
            name: Customer name
            metadata: Additional metadata

        Returns:
            CustomerData

        Raises:
            PaymentProviderError: If operation fails
        """
        pass

    @abstractmethod
    def create_checkout_session(
        self,
        customer_id: str,
        price_id: str,
        success_url: str,
        cancel_url: str,
        trial_period_days: int = 0,
        metadata: dict[str, Any] | None = None,
    ) -> CheckoutSessionData:
        """
        Create a checkout session for subscription purchase.

        Args:
            customer_id: External customer ID
            price_id: External price/plan ID
            success_url: URL to redirect on success
            cancel_url: URL to redirect on cancellation
            trial_period_days: Number of trial days (0 for no trial)
            metadata: Additional metadata

        Returns:
            CheckoutSessionData with session_id and checkout_url

        Raises:
            PaymentProviderError: If checkout session creation fails
        """
        pass

    @abstractmethod
    def retrieve_subscription(self, subscription_id: str) -> SubscriptionData:
        """
        Retrieve subscription details from payment provider.

        Args:
            subscription_id: External subscription ID

        Returns:
            SubscriptionData

        Raises:
            PaymentProviderError: If retrieval fails
        """
        pass

    @abstractmethod
    def cancel_subscription(
        self, subscription_id: str, at_period_end: bool = True
    ) -> SubscriptionData:
        """
        Cancel a subscription.

        Args:
            subscription_id: External subscription ID
            at_period_end: Whether to cancel at period end or immediately

        Returns:
            Updated SubscriptionData

        Raises:
            PaymentProviderError: If cancellation fails
        """
        pass

    @abstractmethod
    def reactivate_subscription(self, subscription_id: str) -> SubscriptionData:
        """
        Reactivate a canceled subscription.

        Args:
            subscription_id: External subscription ID

        Returns:
            Updated SubscriptionData

        Raises:
            PaymentProviderError: If reactivation fails
        """
        pass

    @abstractmethod
    def update_subscription(
        self, subscription_id: str, price_id: str, prorate: bool = True
    ) -> SubscriptionData:
        """
        Update subscription to a different plan.

        Args:
            subscription_id: External subscription ID
            price_id: New price/plan ID
            prorate: Whether to prorate the subscription

        Returns:
            Updated SubscriptionData

        Raises:
            PaymentProviderError: If update fails
        """
        pass

    @abstractmethod
    def retrieve_invoice(self, invoice_id: str) -> InvoiceData:
        """
        Retrieve invoice details from payment provider.

        Args:
            invoice_id: External invoice ID

        Returns:
            InvoiceData

        Raises:
            PaymentProviderError: If retrieval fails
        """
        pass

    @abstractmethod
    def list_invoices(self, customer_id: str, limit: int = 10) -> list[InvoiceData]:
        """
        List invoices for a customer.

        Args:
            customer_id: External customer ID
            limit: Maximum number of invoices to return

        Returns:
            List of InvoiceData

        Raises:
            PaymentProviderError: If retrieval fails
        """
        pass

    @abstractmethod
    def construct_webhook_event(
        self, payload: bytes, signature: str, webhook_secret: str
    ) -> Any:
        """
        Construct and verify webhook event from payment provider.

        Args:
            payload: Raw webhook payload
            signature: Webhook signature header
            webhook_secret: Webhook secret for verification

        Returns:
            Provider-specific event object

        Raises:
            PaymentProviderError: If verification fails
        """
        pass

    @abstractmethod
    def handle_webhook_event(self, event: Any) -> dict[str, Any]:
        """
        Handle webhook event and return normalized data.

        Args:
            event: Provider-specific event object

        Returns:
            Dictionary with normalized event data:
            {
                'event_type': str,  # normalized event type
                'data': dict,  # normalized event data
                'raw': Any,  # raw event for debugging
            }

        Raises:
            PaymentProviderError: If handling fails
        """
        pass
