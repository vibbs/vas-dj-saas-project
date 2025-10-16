"""
Payment provider factory.

Provides a centralized way to get the configured payment provider,
making it easy to switch between providers.
"""

from django.conf import settings

from .base import BasePaymentProvider, PaymentProviderError
from .stripe_provider import StripePaymentProvider


class PaymentProviderFactory:
    """
    Factory for creating payment provider instances.

    Usage:
        provider = PaymentProviderFactory.get_provider()
        customer = provider.create_customer(email="...", name="...")
    """

    _providers: dict[str, type[BasePaymentProvider]] = {
        "stripe": StripePaymentProvider,
        # Add more providers here:
        # "paypal": PayPalPaymentProvider,
        # "braintree": BraintreePaymentProvider,
    }

    _instance: BasePaymentProvider = None

    @classmethod
    def register_provider(
        cls, name: str, provider_class: type[BasePaymentProvider]
    ) -> None:
        """
        Register a new payment provider.

        Args:
            name: Provider name (e.g., 'stripe', 'paypal')
            provider_class: Provider class that implements BasePaymentProvider

        Example:
            PaymentProviderFactory.register_provider('paypal', PayPalPaymentProvider)
        """
        cls._providers[name.lower()] = provider_class

    @classmethod
    def get_provider(cls, provider_name: str = None) -> BasePaymentProvider:
        """
        Get the configured payment provider instance.

        Args:
            provider_name: Optional provider name. If not provided, uses
                          settings.PAYMENT_PROVIDER (defaults to 'stripe')

        Returns:
            Configured payment provider instance

        Raises:
            PaymentProviderError: If provider is not supported or configuration is invalid

        Example:
            # Get default provider
            provider = PaymentProviderFactory.get_provider()

            # Get specific provider
            provider = PaymentProviderFactory.get_provider('stripe')
        """
        # Use singleton pattern to avoid recreating instances
        if cls._instance is not None:
            return cls._instance

        # Get provider name from settings or parameter
        provider_name = provider_name or getattr(settings, "PAYMENT_PROVIDER", "stripe")
        provider_name = provider_name.lower()

        # Check if provider is supported
        if provider_name not in cls._providers:
            raise PaymentProviderError(
                f"Payment provider '{provider_name}' is not supported. "
                f"Available providers: {', '.join(cls._providers.keys())}"
            )

        # Get provider configuration from settings
        provider_config = cls._get_provider_config(provider_name)

        # Create provider instance
        provider_class = cls._providers[provider_name]
        cls._instance = provider_class(**provider_config)

        return cls._instance

    @classmethod
    def _get_provider_config(cls, provider_name: str) -> dict:
        """
        Get provider configuration from Django settings.

        Args:
            provider_name: Provider name

        Returns:
            Dictionary with provider configuration

        Raises:
            PaymentProviderError: If required configuration is missing
        """
        config = {}

        if provider_name == "stripe":
            api_key = getattr(settings, "STRIPE_SECRET_KEY", None)
            if not api_key:
                raise PaymentProviderError(
                    "STRIPE_SECRET_KEY is not configured in settings"
                )

            config["api_key"] = api_key
            config["webhook_secret"] = getattr(settings, "STRIPE_WEBHOOK_SECRET", "")
            config["publishable_key"] = getattr(settings, "STRIPE_PUBLISHABLE_KEY", "")

        # Add configuration for other providers here
        # elif provider_name == "paypal":
        #     config["client_id"] = settings.PAYPAL_CLIENT_ID
        #     config["client_secret"] = settings.PAYPAL_CLIENT_SECRET
        #     config["mode"] = settings.PAYPAL_MODE  # sandbox or live

        return config

    @classmethod
    def reset_instance(cls) -> None:
        """
        Reset the singleton instance.

        Useful for testing or when switching providers dynamically.
        """
        cls._instance = None
