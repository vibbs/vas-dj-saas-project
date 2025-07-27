import stripe
import logging
import datetime
from django.conf import settings
from django.http import HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils.decorators import method_decorator
from django.views import View
from django.utils import timezone
from .models import Plan, Subscription, Invoice, SubscriptionStatus, InvoiceStatus
from .services import StripeService, BillingService


logger = logging.getLogger(__name__)
stripe.api_key = getattr(settings, "STRIPE_SECRET_KEY", "")


@method_decorator(csrf_exempt, name="dispatch")
@method_decorator(require_POST, name="dispatch")
class StripeWebhookView(View):

    def post(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
        endpoint_secret = getattr(settings, "STRIPE_WEBHOOK_SECRET", "")

        if not endpoint_secret:
            logger.error("Stripe webhook secret not configured")
            return HttpResponseBadRequest("Webhook secret not configured")

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        except ValueError:
            logger.error("Invalid payload in Stripe webhook")
            return HttpResponseBadRequest("Invalid payload")
        except stripe.error.SignatureVerificationError:
            logger.error("Invalid signature in Stripe webhook")
            return HttpResponseBadRequest("Invalid signature")

        try:
            self.handle_webhook_event(event)
            return HttpResponse(status=200)
        except Exception as e:
            logger.error(f"Error handling Stripe webhook: {str(e)}")
            return HttpResponse(status=500)

    def handle_webhook_event(self, event):
        """Route webhook events to appropriate handlers."""
        event_type = event["type"]

        handlers = {
            "checkout.session.completed": self.handle_checkout_completed,
            "customer.subscription.created": self.handle_subscription_created,
            "customer.subscription.updated": self.handle_subscription_updated,
            "customer.subscription.deleted": self.handle_subscription_deleted,
            "invoice.payment_succeeded": self.handle_invoice_payment_succeeded,
            "invoice.payment_failed": self.handle_invoice_payment_failed,
            "invoice.created": self.handle_invoice_created,
            "invoice.finalized": self.handle_invoice_finalized,
        }

        handler = handlers.get(event_type)
        if handler:
            logger.info(f"Processing Stripe webhook: {event_type}")
            handler(event["data"]["object"])
        else:
            logger.info(f"Unhandled Stripe webhook event: {event_type}")

    def handle_checkout_completed(self, checkout_session):
        """Handle successful checkout completion."""
        try:
            if checkout_session.get("mode") == "subscription":
                subscription = BillingService.create_subscription_from_checkout(
                    checkout_session
                )
                logger.info(f"Created subscription {subscription.id} from checkout")
        except Exception as e:
            logger.error(f"Error creating subscription from checkout: {str(e)}")
            raise

    def handle_subscription_created(self, stripe_subscription):
        """Handle subscription creation."""
        try:
            subscription = Subscription.objects.filter(
                stripe_subscription_id=stripe_subscription["id"]
            ).first()

            if subscription:
                StripeService.sync_subscription_from_stripe(stripe_subscription["id"])
                logger.info(f"Synced existing subscription {subscription.id}")
            else:
                logger.info(
                    f"Subscription {stripe_subscription['id']} created in Stripe but not found locally"
                )
        except Exception as e:
            logger.error(f"Error handling subscription creation: {str(e)}")
            raise

    def handle_subscription_updated(self, stripe_subscription):
        """Handle subscription updates."""
        try:
            subscription = StripeService.sync_subscription_from_stripe(
                stripe_subscription["id"]
            )
            if subscription:
                logger.info(f"Updated subscription {subscription.id}")
            else:
                logger.warning(
                    f"Subscription {stripe_subscription['id']} not found locally"
                )
        except Exception as e:
            logger.error(f"Error handling subscription update: {str(e)}")
            raise

    def handle_subscription_deleted(self, stripe_subscription):
        """Handle subscription deletion/cancellation."""
        try:
            subscription = Subscription.objects.filter(
                stripe_subscription_id=stripe_subscription["id"]
            ).first()

            if subscription:
                subscription.status = SubscriptionStatus.CANCELED
                subscription.canceled_at = timezone.now()
                subscription.save()
                logger.info(f"Canceled subscription {subscription.id}")
            else:
                logger.warning(
                    f"Subscription {stripe_subscription['id']} not found locally"
                )
        except Exception as e:
            logger.error(f"Error handling subscription deletion: {str(e)}")
            raise

    def handle_invoice_created(self, stripe_invoice):
        """Handle invoice creation."""
        try:
            subscription = None
            if stripe_invoice.get("subscription"):
                subscription = Subscription.objects.filter(
                    stripe_subscription_id=stripe_invoice["subscription"]
                ).first()

            if not subscription:
                logger.warning(
                    f"No subscription found for invoice {stripe_invoice['id']}"
                )
                return

            invoice, created = Invoice.objects.get_or_create(
                stripe_invoice_id=stripe_invoice["id"],
                defaults={
                    "subscription": subscription,
                    "account": subscription.account,
                    "organization": subscription.organization,
                    "number": stripe_invoice.get("number", ""),
                    "status": stripe_invoice["status"],
                    "subtotal": stripe_invoice["subtotal"] / 100,
                    "tax": (stripe_invoice.get("tax") or 0) / 100,
                    "total": stripe_invoice["total"] / 100,
                    "period_start": datetime.datetime.fromtimestamp(
                        stripe_invoice["period_start"], tz=datetime.timezone.utc
                    ),
                    "period_end": datetime.datetime.fromtimestamp(
                        stripe_invoice["period_end"], tz=datetime.timezone.utc
                    ),
                    "hosted_invoice_url": stripe_invoice.get("hosted_invoice_url", ""),
                    "invoice_pdf_url": stripe_invoice.get("invoice_pdf", ""),
                },
            )

            if created:
                logger.info(f"Created invoice {invoice.id}")
            else:
                logger.info(f"Invoice {invoice.id} already exists")

        except Exception as e:
            logger.error(f"Error handling invoice creation: {str(e)}")
            raise

    def handle_invoice_finalized(self, stripe_invoice):
        """Handle invoice finalization."""
        try:
            StripeService.sync_invoice_from_stripe(stripe_invoice["id"])
            logger.info(f"Synced finalized invoice {stripe_invoice['id']}")
        except Exception as e:
            logger.error(f"Error handling invoice finalization: {str(e)}")
            raise

    def handle_invoice_payment_succeeded(self, stripe_invoice):
        """Handle successful invoice payment."""
        try:
            invoice = Invoice.objects.filter(
                stripe_invoice_id=stripe_invoice["id"]
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
                logger.warning(f"Invoice {stripe_invoice['id']} not found locally")
        except Exception as e:
            logger.error(f"Error handling invoice payment success: {str(e)}")
            raise

    def handle_invoice_payment_failed(self, stripe_invoice):
        """Handle failed invoice payment."""
        try:
            invoice = Invoice.objects.filter(
                stripe_invoice_id=stripe_invoice["id"]
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
                logger.warning(f"Invoice {stripe_invoice['id']} not found locally")
        except Exception as e:
            logger.error(f"Error handling invoice payment failure: {str(e)}")
            raise
