from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.accounts.views.views_v1 import AccountViewSet

router = DefaultRouter()
router.register(r"users", AccountViewSet, basename="account")

urlpatterns = [
    path("", include(router.urls)),
]
