"""
Django management command to set up local development data.

This command creates:
1. Superuser (if none exists) - with interactive prompt
2. Dummy organization and user for testing
3. Organization membership linking them
4. (With --full) Comprehensive seed data: multiple users, orgs, billing, onboarding

Usage:
    python manage.py setup_local_data
    python manage.py setup_local_data --skip-superuser
    python manage.py setup_local_data --skip-dummy
    python manage.py setup_local_data --reset
    python manage.py setup_local_data --full --skip-superuser
    python manage.py setup_local_data --auto --full --skip-superuser  # For Docker

Safety:
    - Only runs when DEBUG=True (production safety)
    - Idempotent - safe to run multiple times
    - Transaction-wrapped for data consistency
"""

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.accounts.models import Account
from apps.organizations.models import Organization, OrganizationMembership


class Command(BaseCommand):
    help = "Set up local development data (superuser + dummy org/user)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--skip-superuser",
            action="store_true",
            help="Skip superuser creation",
        )
        parser.add_argument(
            "--skip-dummy",
            action="store_true",
            help="Skip dummy data creation",
        )
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing test data before creating new",
        )
        parser.add_argument(
            "--full",
            action="store_true",
            help="Create comprehensive seed data (users, orgs, billing, onboarding, audit logs)",
        )
        parser.add_argument(
            "--auto",
            action="store_true",
            help="Non-interactive mode for automated Docker startup",
        )

    def handle(self, *args, **options):
        # Safety check: Only run in development
        if not settings.DEBUG:
            raise CommandError(
                "This command can only be run when DEBUG=True (development mode)"
            )

        self.stdout.write(self.style.MIGRATE_HEADING("\n=== Local Data Setup ===\n"))

        skip_superuser = options["skip_superuser"]
        skip_dummy = options["skip_dummy"]
        reset = options["reset"]
        full = options["full"]
        auto = options["auto"]

        try:
            # Reset existing test data if requested
            if reset:
                self._reset_test_data(full=full)

            # Create superuser (skip in auto mode)
            if not skip_superuser and not auto:
                self._create_superuser()

            # If full mode, run comprehensive seed
            if full:
                self._seed_complete_data()
            elif not skip_dummy:
                # Create basic dummy data (original behavior)
                self._create_dummy_data()

            self.stdout.write(
                self.style.SUCCESS("\n Local data setup completed successfully!\n")
            )

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"\n Error during setup: {str(e)}\n"))
            raise

    def _reset_test_data(self, full=False):
        """Delete existing test data."""
        self.stdout.write(self.style.WARNING("Resetting test data..."))

        # Delete test organization (cascades to memberships)
        deleted_orgs = Organization.objects.filter(slug="test-company").delete()
        if deleted_orgs[0] > 0:
            self.stdout.write(
                self.style.WARNING(f"   Deleted {deleted_orgs[0]} organization(s)")
            )

        # If full reset, also delete seed data organizations
        if full:
            seed_slugs = ["complete-company", "admin-company"]
            for slug in seed_slugs:
                deleted = Organization.objects.filter(slug=slug).delete()
                if deleted[0] > 0:
                    self.stdout.write(
                        self.style.WARNING(f"   Deleted seed org: {slug}")
                    )

            # Delete seed users
            seed_emails = [
                "complete@example.com",
                "empty@example.com",
                "admin@example.com",
                "superadmin@example.com",
            ]
            for email in seed_emails:
                deleted = Account.objects.filter(email=email).delete()
                if deleted[0] > 0:
                    self.stdout.write(
                        self.style.WARNING(f"   Deleted seed user: {email}")
                    )

        # Delete demo user (if not in any other orgs)
        demo_user = Account.objects.filter(email="demo@example.com").first()
        if demo_user:
            # Only delete if they have no other memberships
            other_memberships = OrganizationMembership.objects.filter(
                user=demo_user
            ).exclude(organization__slug="test-company")
            if not other_memberships.exists():
                demo_user.delete()
                self.stdout.write(self.style.WARNING("   Deleted demo user"))
            else:
                self.stdout.write(
                    self.style.WARNING(
                        "   Kept demo user (has memberships in other orgs)"
                    )
                )

        self.stdout.write(self.style.SUCCESS("   Reset complete\n"))

    def _create_superuser(self):
        """Create superuser if none exists (interactive prompt)."""
        self.stdout.write(self.style.MIGRATE_LABEL("Superuser Setup"))

        # Check if any superuser exists
        if Account.objects.filter(is_superuser=True).exists():
            superuser = Account.objects.filter(is_superuser=True).first()
            self.stdout.write(
                self.style.SUCCESS(
                    f"   Superuser already exists: {superuser.email}\n"
                )
            )
            return

        self.stdout.write("   No superuser found. Creating one...\n")

        # Prompt for superuser details
        while True:
            email = input("   Email address: ").strip()
            if email and "@" in email:
                break
            self.stdout.write(self.style.ERROR("   Please enter a valid email address"))

        while True:
            first_name = input("   First name: ").strip()
            if first_name:
                break
            self.stdout.write(self.style.ERROR("   First name cannot be empty"))

        while True:
            last_name = input("   Last name: ").strip()
            if last_name:
                break
            self.stdout.write(self.style.ERROR("   Last name cannot be empty"))

        # Password with validation
        while True:
            password = input("   Password: ").strip()
            if len(password) >= 8:
                password_confirm = input("   Password (again): ").strip()
                if password == password_confirm:
                    break
                else:
                    self.stdout.write(
                        self.style.ERROR("   Passwords don't match. Try again.")
                    )
            else:
                self.stdout.write(
                    self.style.ERROR("   Password must be at least 8 characters")
                )

        # Create superuser
        try:
            superuser = Account.objects.create_superuser(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                is_email_verified=True,  # Skip verification for local dev
            )
            self.stdout.write(
                self.style.SUCCESS(f"   Superuser created: {superuser.email}\n")
            )
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"   Error creating superuser: {e}"))
            raise

    @transaction.atomic
    def _create_dummy_data(self):
        """Create dummy organization and user for testing."""
        self.stdout.write(self.style.MIGRATE_LABEL("Dummy Data Setup"))

        # Check if dummy data already exists
        if Organization.objects.filter(slug="test-company").exists():
            org = Organization.objects.get(slug="test-company")
            self.stdout.write(
                self.style.SUCCESS(
                    f"   Test organization already exists: {org.name}"
                )
            )

            if Account.objects.filter(email="demo@example.com").exists():
                user = Account.objects.get(email="demo@example.com")
                self.stdout.write(
                    self.style.SUCCESS(f"   Demo user already exists: {user.email}")
                )

                # Check membership
                if OrganizationMembership.objects.filter(
                    organization=org, user=user
                ).exists():
                    membership = OrganizationMembership.objects.get(
                        organization=org, user=user
                    )
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"   Membership exists: {membership.role}\n"
                        )
                    )
                    return

        # Create test organization
        org, org_created = Organization.objects.get_or_create(
            slug="test-company",
            defaults={
                "name": "Test Company",
                "description": "Test organization for local development",
                "creator_email": "demo@example.com",
                "creator_name": "Demo User",
                "plan": "free_trial",
                "on_trial": True,
                "sub_domain": "test-company",
            },
        )

        if org_created:
            self.stdout.write(
                self.style.SUCCESS(f"   Created organization: {org.name}")
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f"   Organization exists: {org.name}")
            )

        # Create demo user
        user, user_created = Account.objects.get_or_create(
            email="demo@example.com",
            defaults={
                "first_name": "Demo",
                "last_name": "User",
                "is_email_verified": True,  # Skip verification for local dev
                "is_active": True,
            },
        )

        if user_created:
            user.set_password("Demo123456!")
            user.save()
            self.stdout.write(
                self.style.SUCCESS(
                    f"   Created demo user: {user.email} (password: Demo123456!)"
                )
            )
        else:
            self.stdout.write(self.style.SUCCESS(f"   Demo user exists: {user.email}"))

        # Update organization created_by if needed
        if not org.created_by:
            org.created_by = user
            org.save(update_fields=["created_by"])

        # Create organization membership
        membership, membership_created = OrganizationMembership.objects.get_or_create(
            organization=org,
            user=user,
            defaults={
                "role": "owner",
                "status": "active",
            },
        )

        if membership_created:
            self.stdout.write(
                self.style.SUCCESS(
                    f"   Created membership: {user.email} -> {org.name} (owner)"
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f"   Membership exists: {user.email} -> {org.name} ({membership.role})"
                )
            )

        # Display summary
        self.stdout.write(self.style.MIGRATE_HEADING("\nSummary:"))
        self.stdout.write(f"   Organization: {org.name}")
        self.stdout.write(f"   Subdomain: {org.sub_domain}")
        self.stdout.write(f"   Plan: {org.plan}")
        self.stdout.write(f"   User: {user.email}")
        self.stdout.write(f"   Password: Demo123456!")
        self.stdout.write(f"   Role: {membership.role}")
        self.stdout.write("")

    @transaction.atomic
    def _seed_complete_data(self):
        """Seed comprehensive test data for all user scenarios."""
        self.stdout.write(self.style.MIGRATE_HEADING("\n=== Full Seed Data ===\n"))

        # Import seeders
        from .seed_data import (
            AuditLogSeeder,
            BillingSeeder,
            OnboardingSeeder,
            OrganizationSeeder,
            UserSeeder,
        )

        # Initialize seeders
        user_seeder = UserSeeder(self.stdout, self.style)
        org_seeder = OrganizationSeeder(self.stdout, self.style)
        billing_seeder = BillingSeeder(self.stdout, self.style)
        onboarding_seeder = OnboardingSeeder(self.stdout, self.style)
        audit_seeder = AuditLogSeeder(self.stdout, self.style)

        # 1. Seed billing plans (global)
        self.stdout.write(self.style.MIGRATE_LABEL("Billing Plans"))
        plans = billing_seeder.seed_plans()

        # 2. Seed users
        self.stdout.write(self.style.MIGRATE_LABEL("\nUsers"))
        users = user_seeder.seed_all()

        # 3. Seed organizations
        self.stdout.write(self.style.MIGRATE_LABEL("\nOrganizations"))
        complete_org, _ = org_seeder.seed_organization("complete_org", users["complete"])
        admin_org, _ = org_seeder.seed_organization("admin_org", users["admin"])

        # Add superadmin to admin org
        org_seeder.add_member(admin_org, users["superadmin"], role="admin")

        # 4. Seed subscriptions
        self.stdout.write(self.style.MIGRATE_LABEL("\nSubscriptions"))
        complete_sub = billing_seeder.seed_subscription(complete_org, plans["pro"])
        admin_sub = billing_seeder.seed_subscription(admin_org, plans["enterprise"])

        # 5. Seed invoices
        self.stdout.write(self.style.MIGRATE_LABEL("\nInvoices"))
        billing_seeder.seed_invoices(complete_org, complete_sub, count=3)
        billing_seeder.seed_invoices(admin_org, admin_sub, count=2)

        # 6. Seed onboarding progress
        self.stdout.write(self.style.MIGRATE_LABEL("\nOnboarding Progress"))
        onboarding_seeder.seed_complete_onboarding(users["complete"], complete_org)
        onboarding_seeder.seed_initial_onboarding(users["empty"])
        onboarding_seeder.seed_complete_onboarding(users["admin"], admin_org)
        onboarding_seeder.seed_complete_onboarding(users["superadmin"], admin_org)

        # 7. Seed audit logs
        self.stdout.write(self.style.MIGRATE_LABEL("\nAudit Logs"))
        audit_seeder.seed_audit_logs(users["complete"], complete_org)
        audit_seeder.seed_audit_logs(users["admin"], admin_org)

        # Display summary
        self.stdout.write(self.style.MIGRATE_HEADING("\n=== Seed Data Summary ==="))
        self.stdout.write(
            """
Test Users Created:
  complete@example.com / Complete123!
    - Full profile, org owner, Pro plan, 100% onboarding, audit logs

  empty@example.com / Empty123!
    - Minimal profile, no organization, 0% onboarding

  admin@example.com / Admin123!
    - Staff user, org owner, Enterprise plan, full permissions

  superadmin@example.com / SuperAdmin123!
    - Superuser, all privileges, admin of Admin Company

Organizations:
  complete-company (Pro plan, $99/month)
  admin-company (Enterprise plan, $299/month)

Django Admin: http://localhost:8000/admin/
  Login as: superadmin@example.com / SuperAdmin123!
"""
        )
