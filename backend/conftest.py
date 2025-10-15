"""
Global pytest fixtures for the entire project.
"""

import pytest
from django.core.management import call_command
from django.test import Client
from rest_framework.test import APIClient
from apps.accounts.tests.factories import (
    AccountFactory,
    AdminAccountFactory,
    SuperuserAccountFactory,
    UnverifiedAccountFactory
)
from apps.organizations.tests.factories import OrganizationFactory, OrganizationMembershipFactory


@pytest.fixture(scope='session')
def django_db_setup(django_db_setup, django_db_blocker):
    """
    Custom database setup that runs migrations at the start of test session.
    This ensures the test database has all tables including audit logs.
    """
    with django_db_blocker.unblock():
        # Migrations are automatically run by pytest-django with --create-db
        # This fixture just ensures proper ordering and can be extended if needed
        pass


@pytest.fixture
def api_client():
    """DRF API client."""
    return APIClient()


@pytest.fixture
def django_client():
    """Django test client."""
    return Client()


@pytest.fixture
def user():
    """Standard user account."""
    return AccountFactory()


@pytest.fixture
def admin_user():
    """Admin user account."""
    return AdminAccountFactory()


@pytest.fixture
def superuser():
    """Superuser account."""
    return SuperuserAccountFactory()


@pytest.fixture
def unverified_user():
    """Unverified user account."""
    return UnverifiedAccountFactory()


@pytest.fixture
def organization():
    """Organization instance."""
    return OrganizationFactory()


@pytest.fixture
def organization_with_owner(user):
    """Organization with an owner."""
    org = OrganizationFactory(created_by=user)
    # Create owner membership
    OrganizationMembershipFactory(
        organization=org,
        user=user,
        role='owner',
        status='active'
    )
    return org


@pytest.fixture
def authenticated_api_client(api_client, user):
    """API client with authenticated user."""
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def admin_api_client(api_client, admin_user):
    """API client with authenticated admin user."""
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def tenant_aware_user(organization):
    """User with organization context."""
    user = AccountFactory(organization=organization)
    OrganizationMembershipFactory(
        organization=organization,
        user=user,
        role='member',
        status='active'
    )
    return user