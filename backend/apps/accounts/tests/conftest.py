"""
Pytest fixtures specific to accounts app.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.accounts.tests.factories import (
    AccountAuthProviderFactory,
    AccountFactory,
    GoogleAuthProviderFactory,
    UnverifiedAccountFactory,
)
from apps.organizations.tests.factories import (
    OrganizationFactory,
    OrganizationMembershipFactory,
)

User = get_user_model()


@pytest.fixture
def account_with_google_provider():
    """Account with Google OAuth provider."""
    user = AccountFactory()
    GoogleAuthProviderFactory(user=user)
    return user


@pytest.fixture
def account_with_multiple_providers():
    """Account with multiple auth providers."""
    user = AccountFactory()
    # Email provider (primary)
    AccountAuthProviderFactory(user=user, is_primary=True)
    # Google provider (secondary)
    GoogleAuthProviderFactory(user=user, is_primary=False)
    return user


@pytest.fixture
def pending_verification_account():
    """Account pending email verification."""
    return UnverifiedAccountFactory()


@pytest.fixture
def expired_verification_account():
    """Account with expired verification token."""
    account = UnverifiedAccountFactory()
    # Set token expiry to past
    from datetime import timedelta

    from django.utils import timezone

    account.email_verification_token_expires = timezone.now() - timedelta(hours=1)
    account.save()
    return account


@pytest.fixture
def user():
    """Create a test user with organization."""
    # Create organization first
    org = OrganizationFactory()
    # Create user and associate with organization
    user = AccountFactory(organization=org)
    # Create membership
    OrganizationMembershipFactory(organization=org, user=user, role="owner")
    return user


@pytest.fixture
def api_client():
    """Create an API client."""
    return APIClient()


@pytest.fixture
def authenticated_api_client(user):
    """Create an authenticated API client with organization context."""
    client = APIClient()
    client.force_authenticate(user=user)

    # Add organization context header for tenant middleware
    if hasattr(user, "organization") and user.organization:
        client.credentials(HTTP_X_ORG_SLUG=user.organization.slug)

    return client
