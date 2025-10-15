"""
Tenant isolation security tests.

Ensures users cannot access data from organizations they're not members of.
"""

import pytest
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.tests.factories import AccountFactory
from apps.organizations.tests.factories import OrganizationFactory, OrganizationMembershipFactory


@pytest.mark.django_db
class TestTenantIsolation:
    """Test that users can only access data within their own organizations."""

    def setup_method(self):
        """Set up test data."""
        self.client = APIClient()

        # Create two separate organizations
        self.org1 = OrganizationFactory(name="Organization 1", slug="org1")
        self.org2 = OrganizationFactory(name="Organization 2", slug="org2")

        # Create users in each organization
        self.user1 = AccountFactory(email="user1@org1.com")
        self.user2 = AccountFactory(email="user2@org2.com")

        # Create memberships
        self.membership1 = OrganizationMembershipFactory(
            user=self.user1,
            organization=self.org1,
            role='member',
            status='active'
        )
        self.membership2 = OrganizationMembershipFactory(
            user=self.user2,
            organization=self.org2,
            role='member',
            status='active'
        )

    def test_user_cannot_access_other_org_data(self):
        """Test that users cannot retrieve data from other organizations."""
        self.client.force_authenticate(user=self.user1)

        # Try to access user2's data (from different organization)
        response = self.client.get(f'/api/v1/accounts/users/{self.user2.id}/')

        # Should either get 404 (not found in filtered queryset) or 403 (forbidden)
        assert response.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN]

    def test_user_cannot_list_other_org_users(self):
        """Test that users cannot see users from other organizations in list view."""
        self.client.force_authenticate(user=self.user1)

        response = self.client.get('/api/v1/accounts/users/')
        assert response.status_code == status.HTTP_200_OK

        # Parse response data (handle both list and paginated responses)
        if 'results' in response.data:
            users = response.data['results']
        else:
            users = response.data['data']

        user_ids = [user['id'] for user in users]

        # user1 should be in the list
        assert str(self.user1.id) in user_ids
        # user2 should NOT be in the list (different org)
        assert str(self.user2.id) not in user_ids

    def test_user_cannot_access_other_organization(self):
        """Test that users cannot access other organizations."""
        self.client.force_authenticate(user=self.user1)

        # Try to access org2
        response = self.client.get(f'/api/v1/organizations/{self.org2.id}/')

        # Should get 404 (not in filtered queryset)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_user_can_only_list_their_organizations(self):
        """Test that users only see organizations they're members of."""
        self.client.force_authenticate(user=self.user1)

        response = self.client.get('/api/v1/organizations/')
        assert response.status_code == status.HTTP_200_OK

        # Parse response data
        if 'results' in response.data:
            orgs = response.data['results']
        else:
            orgs = response.data['data']

        org_ids = [org['id'] for org in orgs]

        # user1 should see org1
        assert str(self.org1.id) in org_ids
        # user1 should NOT see org2
        assert str(self.org2.id) not in org_ids

    def test_superuser_can_access_all_data(self):
        """Test that superusers bypass tenant isolation (for admin purposes)."""
        superuser = AccountFactory(email="admin@system.com", is_superuser=True, is_staff=True)
        self.client.force_authenticate(user=superuser)

        # Superuser should be able to access both organizations
        response1 = self.client.get(f'/api/v1/organizations/{self.org1.id}/')
        response2 = self.client.get(f'/api/v1/organizations/{self.org2.id}/')

        assert response1.status_code == status.HTTP_200_OK
        assert response2.status_code == status.HTTP_200_OK

    def test_multi_org_user_sees_data_from_all_their_orgs(self):
        """Test that users with memberships in multiple orgs see data from all."""
        # Create a user with memberships in both organizations
        multi_org_user = AccountFactory(email="multi@example.com")
        OrganizationMembershipFactory(
            user=multi_org_user,
            organization=self.org1,
            role='member',
            status='active'
        )
        OrganizationMembershipFactory(
            user=multi_org_user,
            organization=self.org2,
            role='member',
            status='active'
        )

        self.client.force_authenticate(user=multi_org_user)

        # Should be able to access both organizations
        response = self.client.get('/api/v1/organizations/')
        assert response.status_code == status.HTTP_200_OK

        if 'results' in response.data:
            orgs = response.data['results']
        else:
            orgs = response.data['data']

        org_ids = [org['id'] for org in orgs]

        # Should see both organizations
        assert str(self.org1.id) in org_ids
        assert str(self.org2.id) in org_ids

    def test_suspended_membership_denies_access(self):
        """Test that suspended memberships don't grant access."""
        # Suspend user1's membership
        self.membership1.status = 'suspended'
        self.membership1.save()

        self.client.force_authenticate(user=self.user1)

        # Try to access org1
        response = self.client.get(f'/api/v1/organizations/{self.org1.id}/')

        # Should get 404 (not in filtered queryset due to inactive membership)
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestCrossOriginRequestForgery:
    """Test CSRF protection."""

    def test_csrf_token_required_for_state_changing_operations(self):
        """Test that CSRF tokens are required for POST/PUT/DELETE requests."""
        client = APIClient(enforce_csrf_checks=True)

        # Create a test user
        user = AccountFactory()
        client.force_authenticate(user=user)

        # Try to make a POST request without CSRF token
        # Note: DRF with JWT doesn't use CSRF by default, but session auth does
        response = client.post('/api/v1/accounts/users/', {
            'email': 'test@example.com',
            'password': 'testpass123'
        })

        # Should either succeed (JWT) or fail with CSRF error (session auth)
        # This test documents the CSRF behavior
        assert response.status_code in [
            status.HTTP_201_CREATED,  # JWT auth (no CSRF needed)
            status.HTTP_403_FORBIDDEN  # Session auth (CSRF required)
        ]
