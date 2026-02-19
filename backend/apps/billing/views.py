import logging

from django.conf import settings
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Invoice, Plan, Subscription
from .serializers import (
    BillingOverviewSerializer,
    CreateCheckoutSessionSerializer,
    InvoiceSerializer,
    PlanSerializer,
    SubscriptionActionSerializer,
    SubscriptionSerializer,
)
from .services import BillingService

log = logging.getLogger(f"{settings.LOG_APP_PREFIX}.billing.views")


@extend_schema_view(
    list=extend_schema(tags=["Billing"]),
    retrieve=extend_schema(tags=["Billing"]),
)
class PlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Plan.objects.filter(is_active=True)
    serializer_class = PlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Get plans scoped to the current organization."""
        organization = getattr(self.request, "org", None)
        if organization:
            return Plan.objects.filter(is_active=True, organization=organization)
        # If no organization context, return public plans or all plans
        return Plan.objects.filter(is_active=True)


@extend_schema_view(
    list=extend_schema(tags=["Billing"]),
    retrieve=extend_schema(
        tags=["Billing"],
        parameters=[
            {
                "name": "id",
                "in": "path",
                "required": True,
                "description": "Subscription UUID",
                "schema": {"type": "string", "format": "uuid"},
            }
        ],
    ),
    create_checkout_session=extend_schema(tags=["Billing"]),
    manage_subscription=extend_schema(
        tags=["Billing"],
        parameters=[
            {
                "name": "id",
                "in": "path",
                "required": True,
                "description": "Subscription UUID",
                "schema": {"type": "string", "format": "uuid"},
            }
        ],
    ),
    current=extend_schema(tags=["Billing"]),
    overview=extend_schema(tags=["Billing"]),
)
class SubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Get subscriptions for the current organization."""
        organization = getattr(self.request, "org", None)
        if organization:
            return Subscription.objects.filter(organization=organization)
        return Subscription.objects.none()

    @action(detail=False, methods=["post"])
    def create_checkout_session(self, request):
        """Create a checkout session for subscription purchase."""
        serializer = CreateCheckoutSessionSerializer(data=request.data)
        if serializer.is_valid():
            plan = serializer.validated_data["plan_id"]
            success_url = serializer.validated_data["success_url"]
            cancel_url = serializer.validated_data["cancel_url"]
            organization = getattr(request, "org", None)

            try:
                billing_service = BillingService()
                session_data = billing_service.create_checkout_session(
                    plan=plan,
                    account=request.user,
                    success_url=success_url,
                    cancel_url=cancel_url,
                    organization=organization,
                )

                return Response(
                    {
                        "checkout_url": session_data.checkout_url,
                        "session_id": session_data.session_id,
                    }
                )
            except Exception as e:
                log.error(f"Checkout session creation failed: {str(e)}")
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def manage_subscription(self, request, pk=None):
        """Manage subscription (cancel, reactivate)."""
        subscription = self.get_object()
        serializer = SubscriptionActionSerializer(data=request.data)

        if serializer.is_valid():
            action_type = serializer.validated_data["action"]
            at_period_end = serializer.validated_data.get("at_period_end", True)

            try:
                billing_service = BillingService()
                message = ""

                if action_type == "cancel":
                    billing_service.cancel_subscription(subscription, at_period_end)
                    if at_period_end:
                        message = str(_("Subscription will be canceled at period end"))
                    else:
                        message = str(_("Subscription has been canceled immediately"))
                elif action_type == "reactivate":
                    billing_service.reactivate_subscription(subscription)
                    message = str(_("Subscription has been reactivated"))

                subscription.refresh_from_db()
                return Response(
                    {
                        "message": message,
                        "subscription": SubscriptionSerializer(subscription).data,
                    }
                )
            except Exception as e:
                log.error(f"Subscription management failed: {str(e)}")
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def current(self, request):
        """Get current active subscription."""
        organization = getattr(request, "org", None)
        subscription = BillingService.get_active_subscription(
            request.user, organization
        )

        if subscription:
            serializer = SubscriptionSerializer(subscription)
            return Response(serializer.data)

        return Response(
            {"message": str(_("No active subscription found"))},
            status=status.HTTP_404_NOT_FOUND,
        )

    @action(detail=False, methods=["get"])
    def overview(self, request):
        """Get billing overview including subscription, invoices, and usage."""
        organization = getattr(request, "org", None)

        active_subscription = BillingService.get_active_subscription(
            request.user, organization
        )

        # Get recent invoices for this organization
        invoice_queryset = Invoice.objects.none()
        if organization:
            invoice_queryset = Invoice.objects.filter(organization=organization)
        recent_invoices = invoice_queryset[:5]

        # Example usage stats - customize based on your features
        usage_stats = []
        if active_subscription:
            plan_features = active_subscription.plan.features
            for feature_key, limit in plan_features.items():
                if isinstance(limit, int):  # Only for numeric limits
                    usage_stats.append(
                        {
                            "feature_key": feature_key,
                            "current_usage": 0,  # Replace with actual usage tracking
                            "limit": limit,
                            "is_available": True,
                            "percentage_used": 0.0,
                        }
                    )

        data = {
            "active_subscription": active_subscription,
            "recent_invoices": recent_invoices,
            "usage_stats": usage_stats,
            "has_active_subscription": BillingService.has_active_subscription(
                request.user, organization
            ),
            "is_in_grace_period": BillingService.is_in_grace_period(
                request.user, organization
            ),
        }

        serializer = BillingOverviewSerializer(data)
        return Response(serializer.data)


@extend_schema_view(
    list=extend_schema(tags=["Billing"]),
    retrieve=extend_schema(
        tags=["Billing"],
        parameters=[
            {
                "name": "id",
                "in": "path",
                "required": True,
                "description": "Invoice UUID",
                "schema": {"type": "string", "format": "uuid"},
            }
        ],
    ),
)
class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Get invoices for the current organization."""
        organization = getattr(self.request, "org", None)
        if organization:
            return Invoice.objects.filter(organization=organization)
        return Invoice.objects.none()
