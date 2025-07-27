from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, extend_schema_view
from .models import Plan, Subscription, Invoice
from .serializers import (
    PlanSerializer,
    SubscriptionSerializer,
    InvoiceSerializer,
    CreateCheckoutSessionSerializer,
    SubscriptionActionSerializer,
    BillingOverviewSerializer,
)
from .services import StripeService, BillingService
from .webhooks import StripeWebhookView


@extend_schema_view(
    list=extend_schema(tags=["Billing"]),
    retrieve=extend_schema(tags=["Billing"]),
)
class PlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Plan.objects.filter(is_active=True)
    serializer_class = PlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Plan.objects.filter(
            is_active=True, organization=self.request.user.current_organization
        )


@extend_schema_view(
    list=extend_schema(tags=["Billing"]),
    retrieve=extend_schema(tags=["Billing"]),
    create_checkout_session=extend_schema(tags=["Billing"]),
    manage_subscription=extend_schema(tags=["Billing"]),
    current=extend_schema(tags=["Billing"]),
    overview=extend_schema(tags=["Billing"]),
)
class SubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(
            account=self.request.user,
            organization=self.request.user.current_organization,
        )

    @action(detail=False, methods=["post"])
    def create_checkout_session(self, request):
        serializer = CreateCheckoutSessionSerializer(data=request.data)
        if serializer.is_valid():
            plan = serializer.validated_data["plan_id"]
            success_url = serializer.validated_data["success_url"]
            cancel_url = serializer.validated_data["cancel_url"]

            try:
                session = StripeService.create_checkout_session(
                    plan=plan,
                    account=request.user,
                    success_url=success_url,
                    cancel_url=cancel_url,
                    organization=request.user.current_organization,
                )

                return Response({"checkout_url": session.url, "session_id": session.id})
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def manage_subscription(self, request, pk=None):
        subscription = self.get_object()
        serializer = SubscriptionActionSerializer(data=request.data)

        if serializer.is_valid():
            action_type = serializer.validated_data["action"]
            at_period_end = serializer.validated_data.get("at_period_end", True)

            try:
                message = ""
                if action_type == "cancel":
                    StripeService.cancel_subscription(subscription, at_period_end)
                    message = f"Subscription {'will be canceled at period end' if at_period_end else 'has been canceled immediately'}"
                elif action_type == "reactivate":
                    StripeService.reactivate_subscription(subscription)
                    message = "Subscription has been reactivated"

                subscription.refresh_from_db()
                return Response(
                    {
                        "message": message,
                        "subscription": SubscriptionSerializer(subscription).data,
                    }
                )
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def current(self, request):
        """Get current active subscription."""
        subscription = BillingService.get_active_subscription(
            request.user, request.user.current_organization
        )

        if subscription:
            serializer = SubscriptionSerializer(subscription)
            return Response(serializer.data)

        return Response(
            {"message": "No active subscription found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    @action(detail=False, methods=["get"])
    def overview(self, request):
        """Get billing overview including subscription, invoices, and usage."""
        active_subscription = BillingService.get_active_subscription(
            request.user, request.user.current_organization
        )

        recent_invoices = Invoice.objects.filter(
            account=request.user, organization=request.user.current_organization
        )[:5]

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
                request.user, request.user.current_organization
            ),
            "is_in_grace_period": BillingService.is_in_grace_period(
                request.user, request.user.current_organization
            ),
        }

        serializer = BillingOverviewSerializer(data)
        return Response(serializer.data)


@extend_schema_view(
    list=extend_schema(tags=["Billing"]),
    retrieve=extend_schema(tags=["Billing"]),
)
class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Invoice.objects.filter(
            account=self.request.user,
            organization=self.request.user.current_organization,
        )
