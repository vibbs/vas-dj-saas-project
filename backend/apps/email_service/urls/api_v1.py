from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .. import views

router = DefaultRouter()
router.register(r"templates", views.EmailTemplateViewSet, basename="emailtemplate")
router.register(r"logs", views.EmailLogViewSet, basename="emaillog")
router.register(r"send", views.SendEmailViewSet, basename="sendemail")

urlpatterns = [
    path("", include(router.urls)),
]
