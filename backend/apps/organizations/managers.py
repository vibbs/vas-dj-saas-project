from django.contrib.auth import get_user_model
from django.db import models


class OrganizationManager(models.Manager):
    def create_with_creator(
        self, name, slug, creator_email, creator_name, creator_password, **extra_fields
    ):
        """Create organization and first admin user"""

        # Create organization first
        organization = self.create(
            name=name,
            slug=slug,
            creator_email=creator_email,
            creator_name=creator_name,
            **extra_fields,
        )

        # Create the creator user
        User = get_user_model()
        creator_user = User.objects.create_user(
            email=creator_email,
            first_name=creator_name.split(" ")[0] if creator_name else "",
            last_name=(
                " ".join(creator_name.split(" ")[1:])
                if len(creator_name.split(" ")) > 1
                else ""
            ),
            password=creator_password,
            organization=organization,
            is_org_admin=True,
            is_org_creator=True,
            can_invite_users=True,
            can_manage_billing=True,
            can_delete_org=True,
        )

        # Link creator back to organization
        organization.creator_user = creator_user
        organization.save()

        return organization, creator_user

    def _get_current_organization(self, user):
        """Get the organization for the current user"""
        if hasattr(user, "organization"):
            return user.organization
        return None
