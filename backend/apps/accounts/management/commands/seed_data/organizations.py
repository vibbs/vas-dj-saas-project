"""
Organization seeder for creating test organizations and memberships.
"""

from apps.organizations.models import Organization, OrganizationMembership

from .constants import SEED_ORGANIZATIONS


class OrganizationSeeder:
    """Seeder for creating test organizations with memberships."""

    def __init__(self, stdout, style):
        self.stdout = stdout
        self.style = style

    def _log_created(self, entity_type, identifier):
        self.stdout.write(self.style.SUCCESS(f"   + Created {entity_type}: {identifier}"))

    def _log_existing(self, entity_type, identifier):
        self.stdout.write(self.style.SUCCESS(f"   = {entity_type} exists: {identifier}"))

    def seed_organization(self, org_key, owner_user):
        """
        Create organization with owner membership.

        Args:
            org_key: Key in SEED_ORGANIZATIONS (e.g., 'complete_org')
            owner_user: Account instance to be the owner

        Returns:
            Tuple of (Organization, OrganizationMembership)
        """
        data = SEED_ORGANIZATIONS[org_key]

        org, created = Organization.objects.get_or_create(
            slug=data["slug"],
            defaults={
                "name": data["name"],
                "description": data["description"],
                "creator_email": owner_user.email,
                "creator_name": f"{owner_user.first_name} {owner_user.last_name}",
                "created_by": owner_user,
                "plan": data["plan"],
                "on_trial": data["plan"] == "free_trial",
                "sub_domain": data["sub_domain"],
            },
        )

        if created:
            self._log_created("Organization", org.name)
        else:
            self._log_existing("Organization", org.name)

        # Create owner membership
        membership, mem_created = OrganizationMembership.objects.get_or_create(
            organization=org,
            user=owner_user,
            defaults={
                "role": "owner",
                "status": "active",
            },
        )

        if mem_created:
            self._log_created("Membership", f"{owner_user.email} -> {org.name} (owner)")
        else:
            self._log_existing("Membership", f"{owner_user.email} -> {org.name}")

        return org, membership

    def add_member(self, org, user, role="member"):
        """
        Add a user as a member of an organization.

        Args:
            org: Organization instance
            user: Account instance
            role: Membership role (owner, admin, member)

        Returns:
            OrganizationMembership instance
        """
        membership, created = OrganizationMembership.objects.get_or_create(
            organization=org,
            user=user,
            defaults={
                "role": role,
                "status": "active",
            },
        )

        if created:
            self._log_created("Membership", f"{user.email} -> {org.name} ({role})")
        else:
            self._log_existing("Membership", f"{user.email} -> {org.name}")

        return membership
