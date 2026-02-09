import datetime
import logging

from django.db import transaction
from django.http import HttpResponse, HttpResponseBadRequest
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .models import Invoice, InvoiceStatus, Subscription, SubscriptionStatus
from .providers.factory import PaymentProviderFactory
from .services import BillingService

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name="dispatch")
@method_decorator(require_POST, name="dispatch")
class PaymentWebhookView(View):
    """
    Platform-agnostic webhook handler for payment provider events.
    Uses PaymentProviderFactory to handle webhooks from any configured provider.
    """

    def post(self, request, provider_name="stripe"):
        """
        Handle incoming webhook from payment provider.
        Provider name is passed from URL routing (e.g., /webhooks/stripe/, /webhooks/paypal/).
        """
        try:
            # Get the payment provider
            provider = PaymentProviderFactory.get_provider(provider_name)

            # Verify and parse webhook signature
            payload = request.body
            sig_header = self._get_signature_header(request, provider_name)

            if not sig_header:
                logger.error(f"{provider_name} webhook signature missing")
                return HttpResponseBadRequest("Webhook signature missing")

            # Verify webhook signature using provider
            verified_event = provider.verify_webhook_signature(
                payload, sig_header, provider.webhook_secret
            )

            # Handle the normalized webhook event
            self.handle_webhook_event(verified_event, provider)
            return HttpResponse(status=200)

        except ValueError as e:
            logger.error(f"Invalid payload in {provider_name} webhook: {str(e)}")
            return HttpResponseBadRequest("Invalid payload")
        except Exception as e:
            logger.error(f"Error handling {provider_name} webhook: {str(e)}")
            return HttpResponse(status=500)

    def _get_signature_header(self, request, provider_name):
        """Get the appropriate signature header based on provider."""
        header_map = {
            "stripe": "HTTP_STRIPE_SIGNATURE",
            "paypal": "HTTP_PAYPAL_TRANSMISSION_SIG",
            # Add more providers as needed
        }
        header_name = header_map.get(provider_name.lower(), "HTTP_SIGNATURE")
        return request.META.get(header_name)

    def handle_webhook_event(self, event, provider):
        """
        Route webhook events to appropriate handlers.
        Events are normalized by the provider's handle_webhook_event method.
        """
        # Normalize the event using provider
        normalized_event = provider.handle_webhook_event(event)
        event_type = normalized_event["event_type"]
        provider_name = normalized_event["provider"]

        # Map normalized event types to handlers
        handlers = {
            "checkout_completed": self.handle_checkout_completed,
            "subscription_created": self.handle_subscription_created,
            "subscription_updated": self.handle_subscription_updated,
            "subscription_deleted": self.handle_subscription_deleted,
            "invoice_payment_succeeded": self.handle_invoice_payment_succeeded,
            "invoice_payment_failed": self.handle_invoice_payment_failed,
            "invoice_created": self.handle_invoice_created,
            "invoice_finalized": self.handle_invoice_finalized,
        }

        handler = handlers.get(event_type)
        if handler:
            logger.info(f"Processing {provider_name} webhook: {event_type}")
            handler(normalized_event["data"], provider)
        else:
            logger.info(f"Unhandled {provider_name} webhook event: {event_type}")

    @transaction.atomic
    def handle_checkout_completed(self, checkout_data, provider):
        """Handle successful checkout completion."""
        try:
            if checkout_data.get("mode") == "subscription":
                billing_service = BillingService(provider.provider_name)
                subscription = billing_service.create_subscription_from_checkout(
                    checkout_data
                )
                logger.info(
                    f"Created subscription {subscription.id} from {provider.provider_name} checkout"
                )
        except Exception as e:
            logger.error(f"Error creating subscription from checkout: {str(e)}")
            raise

    @transaction.atomic
    def handle_subscription_created(self, subscription_data, provider):
        """Handle subscription creation."""
        try:
            external_id = subscription_data.get("id")
            subscription = Subscription.objects.filter(
                external_subscription_id=external_id, provider=provider.provider_name
            ).first()

            if subscription:
                billing_service = BillingService(provider.provider_name)
                billing_service.sync_subscription_from_provider(external_id)
                logger.info(f"Synced existing subscription {subscription.id}")
            else:
                logger.info(
                    f"Subscription {external_id} created in {provider.provider_name} but not found locally"
                )
        except Exception as e:
            logger.error(f"Error handling subscription creation: {str(e)}")
            raise

    @transaction.atomic
    def handle_subscription_updated(self, subscription_data, provider):
        """Handle subscription updates."""
        try:
            external_id = subscription_data.get("id")
            billing_service = BillingService(provider.provider_name)
            subscription = billing_service.sync_subscription_from_provider(external_id)

            if subscription:
                logger.info(f"Updated subscription {subscription.id}")
            else:
                logger.warning(f"Subscription {external_id} not found locally")
        except Exception as e:
            logger.error(f"Error handling subscription update: {str(e)}")
            raise

    @transaction.atomic
    def handle_subscription_deleted(self, subscription_data, provider):
        """Handle subscription deletion/cancellation."""
        try:
            external_id = subscription_data.get("id")
            subscription = Subscription.objects.filter(
                external_subscription_id=external_id, provider=provider.provider_name
            ).first()

            if subscription:
                subscription.status = SubscriptionStatus.CANCELED
                subscription.canceled_at = timezone.now()
                subscription.save()
                logger.info(f"Canceled subscription {subscription.id}")
            else:
                logger.warning(f"Subscription {external_id} not found locally")
        except Exception as e:
            logger.error(f"Error handling subscription deletion: {str(e)}")
            raise

    @transaction.atomic
    def handle_invoice_created(self, invoice_data, provider):
        """Handle invoice creation."""
        try:
            external_invoice_id = invoice_data.get("id")
            subscription_id = invoice_data.get("subscription")

            subscription = None
            if subscription_id:
                subscription = Subscription.objects.filter(
                    external_subscription_id=subscription_id,
                    provider=provider.provider_name,
                ).first()

            if not subscription:
                logger.warning(
                    f"No subscription found for invoice {external_invoice_id}"
                )
                return

            invoice, created = Invoice.objects.get_or_create(
                external_invoice_id=external_invoice_id,
                provider=provider.provider_name,
                defaults={
                    "subscription": subscription,
                    "account": subscription.account,
                    "organization": subscription.organization,
                    "number": invoice_data.get("number", ""),
                    "status": invoice_data["status"],
                    "subtotal": invoice_data["subtotal"] / 100,
                    "tax": (invoice_data.get("tax") or 0) / 100,
                    "total": invoice_data["total"] / 100,
                    "currency": invoice_data.get("currency", "usd"),
                    "period_start": datetime.datetime.fromtimestamp(
                        invoice_data["period_start"], tz=datetime.UTC
                    ),
                    "period_end": datetime.datetime.fromtimestamp(
                        invoice_data["period_end"], tz=datetime.UTC
                    ),
                    "hosted_invoice_url": invoice_data.get("hosted_invoice_url", ""),
                    "invoice_pdf_url": invoice_data.get("invoice_pdf", ""),
                },
            )

            if created:
                logger.info(f"Created invoice {invoice.id}")
            else:
                logger.info(f"Invoice {invoice.id} already exists")

        except Exception as e:
            logger.error(f"Error handling invoice creation: {str(e)}")
            raise

    @transaction.atomic
    def handle_invoice_finalized(self, invoice_data, provider):
        """Handle invoice finalization."""
        try:
            external_invoice_id = invoice_data.get("id")
            billing_service = BillingService(provider.provider_name)
            billing_service.sync_invoice_from_provider(external_invoice_id)
            logger.info(f"Synced finalized invoice {external_invoice_id}")
        except Exception as e:
            logger.error(f"Error handling invoice finalization: {str(e)}")
            raise

    @transaction.atomic
    def handle_invoice_payment_succeeded(self, invoice_data, provider):
        """Handle successful invoice payment."""
        try:
            external_invoice_id = invoice_data.get("id")
            invoice = Invoice.objects.filter(
                external_invoice_id=external_invoice_id, provider=provider.provider_name
            ).first()

            if invoice:
                invoice.status = InvoiceStatus.PAID
                invoice.paid_at = timezone.now()
                invoice.save()

                # Update subscription status if needed
                if (
                    invoice.subscription
                    and invoice.subscription.status == SubscriptionStatus.PAST_DUE
                ):
                    invoice.subscription.status = SubscriptionStatus.ACTIVE
                    invoice.subscription.save()

                logger.info(f"Invoice {invoice.id} payment succeeded")
            else:
                logger.warning(f"Invoice {external_invoice_id} not found locally")
        except Exception as e:
            logger.error(f"Error handling invoice payment success: {str(e)}")
            raise

    @transaction.atomic
    def handle_invoice_payment_failed(self, invoice_data, provider):
        """Handle failed invoice payment."""
        try:
            external_invoice_id = invoice_data.get("id")
            invoice = Invoice.objects.filter(
                external_invoice_id=external_invoice_id, provider=provider.provider_name
            ).first()

            if invoice:
                # Update subscription to past due if it's currently active
                if (
                    invoice.subscription
                    and invoice.subscription.status == SubscriptionStatus.ACTIVE
                ):
                    invoice.subscription.status = SubscriptionStatus.PAST_DUE
                    invoice.subscription.save()

                logger.info(f"Invoice {invoice.id} payment failed")
            else:
                logger.warning(f"Invoice {external_invoice_id} not found locally")
        except Exception as e:
            logger.error(f"Error handling invoice payment failure: {str(e)}")
            raise


# Keep legacy StripeWebhookView for backward compatibility
# This will be removed in a future version
class StripeWebhookView(PaymentWebhookView):
    """
    DEPRECATED: Use PaymentWebhookView instead.
    Legacy Stripe-specific webhook view maintained for backward compatibility.
    """

    def post(self, request):
        """Handle Stripe webhook by delegating to parent with provider_name='stripe'."""
        logger.warning(
            "StripeWebhookView is deprecated. Please migrate to PaymentWebhookView."
        )
        return super().post(request, provider_name="stripe")
