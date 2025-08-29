"""
Test cases for accounts API views.
"""

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.tests.factories import AccountFactory, UnverifiedAccountFactory


@pytest.mark.django_db
@pytest.mark.api
class TestAccountViews:
    """Test cases for Account API views."""

    def test_get_current_user_profile_authenticated(self, authenticated_api_client, user):
        """Test getting current user profile when authenticated."""
        url = reverse('account-me')  # Based on AccountViewSet router
        response = authenticated_api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == user.email
        assert response.data['first_name'] == user.first_name

    def test_get_current_user_profile_unauthenticated(self, api_client):
        """Test getting current user profile when not authenticated."""
        url = reverse('account-me')  # Based on AccountViewSet router
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data.get('code') == 'VDJ-AUTH-LOGIN-401'  # Authentication required

    def test_update_user_profile_authenticated(self, authenticated_api_client, user):
        """Test updating user profile when authenticated."""
        url = reverse('account-update-profile')  # Based on AccountViewSet router
        data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'bio': 'Updated bio'
        }
        
        response = authenticated_api_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        
        user.refresh_from_db()
        assert user.first_name == 'Updated'
        assert user.last_name == 'Name'
        assert user.bio == 'Updated bio'

    def test_update_user_profile_invalid_data(self, authenticated_api_client, user):
        """Test updating user profile with invalid data."""
        url = reverse('account-update-profile')  # Based on AccountViewSet router
        data = {
            'email': 'invalid-email'  # Invalid email format
        }
        
        response = authenticated_api_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data.get('code') == 'VDJ-GEN-VAL-422'

    def test_get_user_auth_providers(self, authenticated_api_client, user):
        """Test getting user's auth providers."""
        # Create auth provider for user
        from apps.accounts.tests.factories import AccountAuthProviderFactory
        AccountAuthProviderFactory(user=user)
        
        url = reverse('account-auth-providers', kwargs={'pk': user.id})  # Based on AccountViewSet router
        response = authenticated_api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['provider'] == 'email'


@pytest.mark.django_db
@pytest.mark.api
class TestAuthenticationViews:
    """Test cases for authentication views."""

    def test_login_with_valid_credentials(self, api_client):
        """Test login with valid credentials."""
        user = AccountFactory()
        url = reverse('login')  # Based on auth URLs
        
        data = {
            'email': user.email,
            'password': 'testpassword123'  # From factory
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data['data'] or 'token' in response.data['data']

    def test_login_with_invalid_credentials(self, api_client):
        """Test login with invalid credentials."""
        url = reverse('login')  # Based on auth URLs
        
        data = {
            'email': 'nonexistent@example.com',
            'password': 'wrongpassword'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data.get('code') == 'VDJ-ACC-CREDS-401'  # Invalid credentials

    def test_login_with_unverified_account(self, api_client):
        """Test login with unverified account."""
        user = UnverifiedAccountFactory()
        url = reverse('login')  # Based on auth URLs
        
        data = {
            'email': user.email,
            'password': 'testpassword123'
        }
        
        response = api_client.post(url, data, format='json')
        
        # Unverified account login returns 400 with validation error for email verification
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        # Should include email verification requirement details
        assert 'email_verification' in str(response.data).lower() or 'verify' in str(response.data).lower()

    def test_register_new_user(self, api_client):
        """Test registering a new user."""
        url = reverse('register')  # Based on auth URLs
        
        data = {
            'email': 'newuser@example.com',
            'password': 'SecurePassword123!',
            'password_confirm': 'SecurePassword123!',
            'first_name': 'New',
            'last_name': 'User'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['data']['user']['email'] == data['email']

    def test_register_with_existing_email(self, api_client):
        """Test registering with existing email."""
        existing_user = AccountFactory()
        url = reverse('register')  # Based on auth URLs
        
        data = {
            'email': existing_user.email,
            'password': 'newpassword123',
            'first_name': 'New',
            'last_name': 'User'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data.get('code') == 'VDJ-GEN-VAL-422'

    def test_verify_email_with_valid_token(self, api_client):
        """Test email verification with valid token."""
        user = UnverifiedAccountFactory()
        token = user.generate_email_verification_token()
        
        url = reverse('auth-verify-email')  # Based on auth URLs
        data = {'token': token}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        
        user.refresh_from_db()
        assert user.is_email_verified

    def test_verify_email_with_invalid_token(self, api_client):
        """Test email verification with invalid token."""
        url = reverse('auth-verify-email')  # Based on auth URLs
        data = {'token': 'invalid_token'}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data.get('code') == 'VDJ-GEN-VAL-422'