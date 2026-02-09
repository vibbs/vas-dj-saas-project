"""
Payment provider abstractions for platform-agnostic billing.

This module provides base classes and interfaces that allow switching
between different payment providers (Stripe, PayPal, Braintree, etc.)
without changing application code.
"""

from .base import BasePaymentProvider, PaymentProviderError
from .factory import PaymentProviderFactory
from .stripe_provider import StripePaymentProvider

__all__ = [
    "BasePaymentProvider",
    "PaymentProviderError",
    "PaymentProviderFactory",
    "StripePaymentProvider",
]
