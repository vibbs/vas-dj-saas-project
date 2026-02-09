"""
Management command to bootstrap the global mode organization.

This command creates the canonical "platform" organization that serves as the
global scope for all users when GLOBAL_MODE_ENABLED=True.

Usage:
    python manage.py bootstrap_global_mode

This command is idempotent - it can be run multiple times safely.
"""

import logging

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from apps.accounts.models import Account
from apps.organizations.models import Organization, OrganizationMembership

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Bootstrap the global platform organization for Global Mode"

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Force recreation of the global organization even if it exists",
        )

    def handle(self, *args, **options):
        force = options.get("force", False)

        if not settings.GLOBAL_MODE_ENABLED:
            self.stdout.write(
                self.style.WARNING(
                    "GLOBAL_MODE_ENABLED is False. This command should only be run when Global Mode is enabled."
                )
            )
            self.stdout.write(
                self.style.WARNING(
                    "Set GLOBAL_MODE_ENABLED=true in your environment to enable Global Mode."
                )
            )
            return

        org_slug = settings.GLOBAL_SCOPE_ORG_SLUG
        org_name = settings.GLOBAL_SCOPE_ORG_NAME

        self.stdout.write(f"Bootstrapping global organization: {org_name} ({org_slug})")

        try:
            with transaction.atomic():
                # Check if organization already exists
                org = Organization.objects.filter(slug=org_slug).first()

                if org and not force:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"✓ Global organization '{org_name}' already exists (ID: {org.id})"
                        )
                    )
                    self._verify_system_user(org)
                    return

                if org and force:
                    self.stdout.write(
                        self.style.WARNING(f"Deleting existing organization '{org_name}'...")
                    )
                    org.delete()
                    org = None

                # Create or get system user
                system_user = self._get_or_create_system_user()

                # Create global organization
                org = Organization.objects.create(
                    name=org_name,
                    slug=org_slug,
                    sub_domain=org_slug,
                    creator_email=system_user.email,
                    creator_name=system_user.full_name,
                    created_by=system_user,
                    is_active=True,
                    plan="enterprise",  # Global scope doesn't have plan limits
                    on_trial=False,
                    description="Global platform organization for all users",
                )

                # Mark this organization as the global scope in extended_properties
                # This makes it easy to identify and protects it from deletion
                org.extended_properties = {
                    "is_global_scope": True,
                    "protected": True,
                    "system_managed": True,
                }
                org.save(update_fields=["extended_properties"])

                self.stdout.write(
                    self.style.SUCCESS(
                        f"✓ Created global organization '{org_name}' (ID: {org.id})"
                    )
                )

                # Create system user membership
                membership, created = OrganizationMembership.objects.get_or_create(
                    organization=org,
                    user=system_user,
                    defaults={
                        "role": "owner",
                        "status": "active",
                    },
                )

                if created:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"✓ Created system user membership (ID: {membership.id})"
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.SUCCESS("✓ System user membership already exists")
                    )

                # Summary
                self.stdout.write("")
                self.stdout.write(self.style.SUCCESS("=" * 60))
                self.stdout.write(
                    self.style.SUCCESS("Global Mode Bootstrap Complete!")
                )
                self.stdout.write(self.style.SUCCESS("=" * 60))
                self.stdout.write(f"Organization Name: {org.name}")
                self.stdout.write(f"Organization Slug: {org.slug}")
                self.stdout.write(f"Organization ID: {org.id}")
                self.stdout.write(f"System User: {system_user.email}")
                self.stdout.write("")
                self.stdout.write("Next steps:")
                self.stdout.write("1. Ensure GLOBAL_MODE_ENABLED=true in your environment")
                self.stdout.write(
                    f"2. Ensure GLOBAL_SCOPE_ORG_SLUG={org_slug} in your environment"
                )
                self.stdout.write("3. Restart your Django application")
                self.stdout.write(
                    "4. New users will automatically be added to this organization"
                )

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error bootstrapping global mode: {e}"))
            logger.exception("Failed to bootstrap global mode")
            raise

    def _get_or_create_system_user(self):
        """Get or create a system user for managing the global organization."""
        system_email = "system@platform.internal"

        user, created = Account.objects.get_or_create(
            email=system_email,
            defaults={
                "first_name": "System",
                "last_name": "Administrator",
                "is_active": True,
                "is_email_verified": True,
                "status": "ACTIVE",
                "role": "ADMIN",
            },
        )

        if created:
            # Set unusable password for system user (cannot login)
            user.set_unusable_password()
            user.save()
            self.stdout.write(
                self.style.SUCCESS(f"✓ Created system user: {system_email}")
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f"✓ System user already exists: {system_email}")
            )

        return user

    def _verify_system_user(self, org):
        """Verify that the system user has proper membership in the organization."""
        system_email = "system@platform.internal"

        try:
            system_user = Account.objects.get(email=system_email)
            membership = OrganizationMembership.objects.filter(
                organization=org, user=system_user
            ).first()

            if not membership:
                # Create membership if missing
                membership = OrganizationMembership.objects.create(
                    organization=org,
                    user=system_user,
                    role="owner",
                    status="active",
                )
                self.stdout.write(
                    self.style.WARNING(
                        f"✓ Fixed missing system user membership (ID: {membership.id})"
                    )
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS("✓ System user membership verified")
                )

        except Account.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(
                    "System user not found. Run with --force to recreate."
                )
            )
