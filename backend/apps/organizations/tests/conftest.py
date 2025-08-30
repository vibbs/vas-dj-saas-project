"""
Pytest fixtures specific to organizations app.
"""

import pytest
from apps.organizations.tests.factories import OrganizationFactory, OrganizationMembershipFactory
from apps.accounts.tests.factories import AccountFactory


@pytest.fixture
def trial_organization():
    """Organization on trial."""
    return OrganizationFactory(
        plan='free_trial',
        on_trial=True,
        paid_until=None
    )


@pytest.fixture
def paid_organization():
    """Organization with paid subscription."""
    return OrganizationFactory(
        plan='pro',
        on_trial=False,
        paid_until='2024-12-31'
    )


@pytest.fixture
def inactive_organization():
    """Inactive organization."""
    return OrganizationFactory(is_active=False)


@pytest.fixture
def organization_with_members():
    """Organization with multiple members."""
    org = OrganizationFactory()
    owner = AccountFactory()
    admin = AccountFactory()
    member = AccountFactory()
    
    # Create memberships
    OrganizationMembershipFactory(
        organization=org,
        user=owner,
        role='owner',
        status='active'
    )
    OrganizationMembershipFactory(
        organization=org,
        user=admin,
        role='admin',
        status='active'
    )
    OrganizationMembershipFactory(
        organization=org,
        user=member,
        role='member',
        status='active'
    )
    
    org.owner = owner
    org.admin = admin
    org.member = member
    return org


@pytest.fixture
def organization_with_pending_invites():
    """Organization with pending member invitations."""
    org = OrganizationFactory()
    
    # Create pending membership
    OrganizationMembershipFactory(
        organization=org,
        user=None,  # No user yet
        role='member',
        status='invited'
    )
    
    return org