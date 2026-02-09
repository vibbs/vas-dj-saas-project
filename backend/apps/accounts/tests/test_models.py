"""
Test cases for accounts models.
"""

from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.utils import timezone
from freezegun import freeze_time

from apps.accounts.enums import UserStatusTypes
from apps.accounts.tests.factories import (
    AccountAuthProviderFactory,
    AccountFactory,
    UnverifiedAccountFactory,
)

User = get_user_model()


@pytest.mark.django_db
@pytest.mark.unit
class TestAccountModel:
    """Test cases for Account model."""

    def test_create_account_with_email(self):
        """Test creating an account with email."""
        account = AccountFactory()
        assert account.email
        assert account.id
        assert account.full_name
        assert account.is_active

    def test_email_uniqueness(self):
        """Test that email must be unique."""
        email = "test@example.com"
        AccountFactory(email=email)

        with pytest.raises(IntegrityError):
            AccountFactory(email=email)

    def test_full_name_property(self):
        """Test full_name property."""
        account = AccountFactory(first_name="John", last_name="Doe")
        assert account.full_name == "John Doe"

    def test_abbreviated_name_property(self):
        """Test abbreviated_name property."""
        account = AccountFactory(first_name="John", last_name="Doe")
        assert account.abbreviated_name == "JD"

        # Test with only first name
        account.last_name = ""
        assert account.abbreviated_name == "J"

        # Test with email fallback
        account.first_name = ""
        account.email = "test@example.com"
        assert account.abbreviated_name == "T"

    def test_is_admin_property(self):
        """Test is_admin property."""
        regular_user = AccountFactory()
        admin_user = AccountFactory(is_org_admin=True)
        creator_user = AccountFactory(is_org_creator=True)

        assert not regular_user.is_admin
        assert admin_user.is_admin
        assert creator_user.is_admin

    @freeze_time("2024-01-01 12:00:00")
    def test_generate_email_verification_token(self):
        """Test email verification token generation."""
        account = UnverifiedAccountFactory()
        token = account.generate_email_verification_token()

        assert token
        assert account.email_verification_token == token
        assert account.email_verification_token_expires

        # Check token expires in 24 hours
        expected_expiry = timezone.now() + timedelta(hours=24)
        assert account.email_verification_token_expires == expected_expiry

    @freeze_time("2024-01-01 12:00:00")
    def test_verify_email_success(self):
        """Test successful email verification."""
        account = UnverifiedAccountFactory()
        token = account.generate_email_verification_token()

        result = account.verify_email(token)
        account.refresh_from_db()

        assert result is True
        assert account.is_email_verified is True
        assert account.status == UserStatusTypes.ACTIVE.value
        assert account.email_verification_token is None
        assert account.email_verification_token_expires is None

    def test_verify_email_invalid_token(self):
        """Test email verification with invalid token."""
        account = UnverifiedAccountFactory()
        account.generate_email_verification_token()

        result = account.verify_email("invalid_token")

        assert result is False
        assert account.is_email_verified is False

    @freeze_time("2024-01-01 12:00:00")
    def test_verify_email_expired_token(self):
        """Test email verification with expired token."""
        account = UnverifiedAccountFactory()
        token = account.generate_email_verification_token()

        # Move time forward to expire token
        with freeze_time("2024-01-02 13:00:00"):  # 25 hours later
            result = account.verify_email(token)

            assert result is False
            assert account.is_email_verified is False

    def test_get_primary_organization_with_direct_org(self):
        """Test get_primary_organization with direct organization."""
        from apps.organizations.tests.factories import OrganizationFactory

        org = OrganizationFactory()
        account = AccountFactory(organization=org)

        assert account.get_primary_organization() == org

    def test_get_primary_organization_with_membership(self):
        """Test get_primary_organization via membership."""
        from apps.organizations.tests.factories import (
            OrganizationFactory,
            OrganizationMembershipFactory,
        )

        org = OrganizationFactory()
        account = AccountFactory()
        OrganizationMembershipFactory(organization=org, user=account, status="active")

        assert account.get_primary_organization() == org

    def test_has_active_membership_in(self):
        """Test has_active_membership_in method."""
        from apps.organizations.tests.factories import (
            OrganizationFactory,
            OrganizationMembershipFactory,
        )

        org = OrganizationFactory()
        account = AccountFactory()

        assert not account.has_active_membership_in(org)

        # Create active membership
        OrganizationMembershipFactory(organization=org, user=account, status="active")

        assert account.has_active_membership_in(org)

    def test_is_owner_of(self):
        """Test is_owner_of method."""
        from apps.organizations.tests.factories import (
            OrganizationFactory,
            OrganizationMembershipFactory,
        )

        org = OrganizationFactory()
        account = AccountFactory()

        assert not account.is_owner_of(org)

        # Create owner membership
        OrganizationMembershipFactory(
            organization=org, user=account, role="owner", status="active"
        )

        assert account.is_owner_of(org)


@pytest.mark.django_db
@pytest.mark.unit
class TestAccountAuthProvider:
    """Test cases for AccountAuthProvider model."""

    def test_create_auth_provider(self):
        """Test creating an auth provider."""
        provider = AccountAuthProviderFactory()

        assert provider.user
        assert provider.provider == "email"
        assert provider.provider_user_id
        assert provider.email
        assert provider.linked_at

    def test_provider_user_id_uniqueness(self):
        """Test provider and provider_user_id uniqueness."""
        provider1 = AccountAuthProviderFactory(
            provider="google", provider_user_id="12345"
        )

        with pytest.raises(IntegrityError):
            AccountAuthProviderFactory(provider="google", provider_user_id="12345")

    def test_multiple_providers_same_user(self):
        """Test multiple providers for same user."""
        user = AccountFactory()

        email_provider = AccountAuthProviderFactory(
            user=user, provider="email", is_primary=True
        )
        google_provider = AccountAuthProviderFactory(
            user=user, provider="google", provider_user_id="google123", is_primary=False
        )

        assert user.auth_providers.count() == 2
        assert email_provider.is_primary
        assert not google_provider.is_primary
