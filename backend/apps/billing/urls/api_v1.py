from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .. import views
from ..webhooks import StripeWebhookView

router = DefaultRouter()
router.register(r"plans", views.PlanViewSet, basename="plans")
router.register(r"subscriptions", views.SubscriptionViewSet, basename="subscriptions")
router.register(r"invoices", views.InvoiceViewSet, basename="invoices")

urlpatterns = [
    path("", include(router.urls)),
    path("webhooks/stripe/", StripeWebhookView.as_view(), name="stripe-webhook"),
]
