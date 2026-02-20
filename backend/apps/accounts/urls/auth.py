"""
JWT Authentication URL patterns
"""

from django.urls import include, path

from apps.accounts.views.auth import (
    login,
    logout,
    password_reset_confirm,
    password_reset_request,
    refresh_token,
    register,
    resend_verification_by_email,
    resend_verification_email,
    social_auth,
    social_login,
    verify_email,
    verify_token,
)

urlpatterns = [
    path("register/", register, name="register"),
    path("login/", login, name="login"),
    path("refresh/", refresh_token, name="auth-refresh"),
    path("logout/", logout, name="auth-logout"),
    path("verify/", verify_token, name="auth-verify"),
    path("verify-email/", verify_email, name="auth-verify-email"),
    path(
        "resend-verification/",
        resend_verification_email,
        name="resend_verification_email",
    ),
    path(
        "resend-verification-by-email/",
        resend_verification_by_email,
        name="resend_verification_by_email",
    ),
    path("password-reset/", password_reset_request, name="password-reset-request"),
    path(
        "password-reset/confirm/", password_reset_confirm, name="password-reset-confirm"
    ),
    path("social/", social_auth, name="auth-social"),
    path("social-login/", social_login, name="auth-social-login"),
    path("mfa/", include("apps.accounts.mfa.urls")),
]
