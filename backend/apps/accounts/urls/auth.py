"""
JWT Authentication URL patterns
"""
from django.urls import path
from apps.accounts.views.auth import (
    login,
    register,
    refresh_token,
    logout,
    verify_token,
    verify_email,
    resend_verification_email,
    social_auth,
    social_login,
)

urlpatterns = [
    path('register/', register, name='auth-register'),
    path('login/', login, name='auth-login'),
    path('refresh/', refresh_token, name='auth-refresh'),
    path('logout/', logout, name='auth-logout'),
    path('verify/', verify_token, name='auth-verify'),
    path('verify-email/', verify_email, name='auth-verify-email'),
    path('resend-verification/', resend_verification_email, name='auth-resend-verification'),
    path('social/', social_auth, name='auth-social'),
    path('social-login/', social_login, name='auth-social-login'),
]