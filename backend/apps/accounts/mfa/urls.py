from django.urls import path

from .views import (
    MFABackupCodesView,
    MFAConfirmView,
    MFADisableView,
    MFASetupView,
    MFAStatusView,
    MFAVerifyLoginView,
)

urlpatterns = [
    path("status/", MFAStatusView.as_view(), name="mfa-status"),
    path("setup/", MFASetupView.as_view(), name="mfa-setup"),
    path("confirm/", MFAConfirmView.as_view(), name="mfa-confirm"),
    path("disable/", MFADisableView.as_view(), name="mfa-disable"),
    path("backup-codes/", MFABackupCodesView.as_view(), name="mfa-backup-codes"),
    path("verify/", MFAVerifyLoginView.as_view(), name="mfa-verify-login"),
]
