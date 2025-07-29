"""
JWT Authentication URL patterns
"""
from django.urls import path
from apps.accounts.views.auth import (
    login,
    refresh_token,
    logout,
    verify_token,
)

urlpatterns = [
    path('login/', login, name='auth-login'),
    path('refresh/', refresh_token, name='auth-refresh'),
    path('logout/', logout, name='auth-logout'),
    path('verify/', verify_token, name='auth-verify'),
]