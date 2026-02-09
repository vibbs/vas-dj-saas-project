import random
import string

import factory
from django.utils import timezone
from django.utils.text import slugify
from factory.django import DjangoModelFactory
from faker import Faker

from apps.organizations.models import Invite, Organization, OrganizationMembership


def _generate_subdomain(name):
    """Generate a realistic subdomain from organization name."""
    # Clean the name and create base
    base = slugify(name).replace("-", "").lower()

    # Ensure minimum length
    if len(base) < 3:
        base += "".join(random.choices(string.ascii_lowercase, k=3 - len(base)))

    # Ensure maximum length
    if len(base) > 45:  # Leave room for potential suffix
        base = base[:45]

    # Add random suffix to ensure uniqueness
    suffix = "".join(random.choices(string.digits, k=random.randint(0, 3)))

    return (base + suffix)[:50]


class OrganizationFactory(DjangoModelFactory):
    class Meta:
        model = Organization
        skip_postgeneration_save = True

    name = factory.LazyFunction(
        lambda: Faker().company()[:100]
    )  # Truncate to max 100 chars
    slug = factory.LazyAttribute(lambda obj: slugify(obj.name))
    description = factory.Faker("text", max_nb_chars=200)
    logo = factory.LazyFunction(
        lambda: f"https://ui-avatars.com/api/?name={Faker().company().replace(' ', '+')}&background=random"
    )

    creator_email = factory.Faker("email")
    creator_name = factory.LazyFunction(
        lambda: Faker().name()[:255]
    )  # Truncate to max 255 chars

    is_active = True
    plan = "free_trial"  # Default to free trial, use specific traits for other plans

    # Realistic trial/payment dates
    on_trial = factory.LazyAttribute(lambda obj: obj.plan == "free_trial")
    trial_ends_on = factory.LazyFunction(
        lambda: timezone.now().date() + timezone.timedelta(days=random.randint(1, 30))
    )
    paid_until = factory.LazyAttribute(
        lambda obj: (
            timezone.now().date() + timezone.timedelta(days=random.randint(30, 365))
            if obj.plan != "free_trial" and not obj.on_trial
            else None
        )
    )

    # Generate realistic subdomains
    sub_domain = factory.LazyAttribute(lambda obj: _generate_subdomain(obj.name))

    @factory.post_generation
    def created_by(self, create, extracted, **kwargs):
        if extracted:
            self.created_by = extracted


class OrganizationMembershipFactory(DjangoModelFactory):
    class Meta:
        model = OrganizationMembership
        skip_postgeneration_save = True

    organization = factory.SubFactory(OrganizationFactory)
    user = factory.SubFactory("apps.accounts.tests.factories.AccountFactory")
    role = "member"  # Default to member, use specific traits for other roles
    status = "active"  # Default to active, use specific traits for other statuses

    # More realistic join dates - within last 2 years
    joined_at = factory.LazyFunction(
        lambda: timezone.now() - timezone.timedelta(days=random.randint(0, 730))
    )

    @factory.post_generation
    def invited_by(self, create, extracted, **kwargs):
        if extracted:
            self.invited_by = extracted
        elif create and self.organization:
            # Try to find an existing owner or admin to be the inviter
            try:
                potential_inviters = OrganizationMembership.objects.filter(
                    organization=self.organization,
                    role__in=["owner", "admin"],
                    status="active",
                ).exclude(pk=self.pk if self.pk else None)

                if potential_inviters.exists():
                    self.invited_by = potential_inviters.first().user
            except:
                pass  # Ignore if organization doesn't exist yet


class InviteFactory(DjangoModelFactory):
    class Meta:
        model = Invite
        skip_postgeneration_save = True

    organization = factory.SubFactory(OrganizationFactory)
    invited_by = factory.SubFactory("apps.accounts.tests.factories.AccountFactory")
    email = factory.LazyFunction(
        lambda: f"{random.choice(['john', 'jane', 'alice', 'bob', 'charlie', 'diana'])}."
        f"{random.choice(['smith', 'johnson', 'brown', 'davis', 'wilson', 'moore'])}@"
        f"{random.choice(['gmail.com', 'yahoo.com', 'company.com', 'startup.io', 'tech.org'])}"
    )
    role = "member"  # Default to member, use specific traits for other roles
    status = "pending"  # Default to pending, use specific traits for other statuses

    # Realistic expiry dates
    expires_at = factory.LazyFunction(
        lambda: timezone.now()
        + timezone.timedelta(
            days=random.randint(1, 14),  # 1-14 days from now
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59),
        )
    )

    # Realistic invite messages
    message = factory.LazyFunction(
        lambda: random.choice(
            [
                "Welcome to our team!",
                "We'd love to have you join our organization.",
                "Looking forward to working with you!",
                "Join us and let's build something amazing together.",
                "Your expertise would be a great addition to our team.",
                "",  # Empty message sometimes
            ]
        )
    )

    @factory.post_generation
    def token(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            self.token = extracted
        elif not self.token:
            self.token = self.generate_token()

    @factory.post_generation
    def handle_status_dates(self, create, extracted, **kwargs):
        """Set appropriate dates based on status."""
        if not create:
            return

        if self.status == "accepted" and not self.accepted_at:
            self.accepted_at = timezone.now() - timezone.timedelta(
                days=random.randint(0, 30)
            )
        elif self.status == "expired" and self.expires_at > timezone.now():
            # Make sure expired invites actually have past expiry dates
            self.expires_at = timezone.now() - timezone.timedelta(
                days=random.randint(1, 30)
            )


# Trait factories for specific scenarios
class ActiveMembershipFactory(OrganizationMembershipFactory):
    """Factory for active memberships only."""

    status = "active"
    role = "member"


class OwnerMembershipFactory(OrganizationMembershipFactory):
    """Factory for owner memberships."""

    role = "owner"
    status = "active"


class AdminMembershipFactory(OrganizationMembershipFactory):
    """Factory for admin memberships."""

    role = "admin"
    status = "active"


class SuspendedMembershipFactory(OrganizationMembershipFactory):
    """Factory for suspended memberships."""

    status = "suspended"


class PendingInviteFactory(InviteFactory):
    """Factory for pending invites only."""

    status = "pending"
    expires_at = factory.LazyFunction(
        lambda: timezone.now() + timezone.timedelta(days=7)
    )


class ExpiredInviteFactory(InviteFactory):
    """Factory for expired invites."""

    status = "expired"
    expires_at = factory.LazyFunction(
        lambda: timezone.now() - timezone.timedelta(days=1)
    )


class AcceptedInviteFactory(InviteFactory):
    """Factory for accepted invites."""

    status = "accepted"
    accepted_at = factory.LazyFunction(
        lambda: timezone.now() - timezone.timedelta(days=1)
    )


class TrialOrganizationFactory(OrganizationFactory):
    """Factory for organizations on trial."""

    plan = "free_trial"
    on_trial = True
    paid_until = None
    trial_ends_on = factory.LazyFunction(
        lambda: timezone.now().date() + timezone.timedelta(days=14)
    )


class PaidOrganizationFactory(OrganizationFactory):
    """Factory for paid organizations."""

    plan = factory.Iterator(["starter", "pro", "enterprise"])
    on_trial = False
    trial_ends_on = None
    paid_until = factory.LazyFunction(
        lambda: timezone.now().date() + timezone.timedelta(days=365)
    )


class ExpiredTrialOrganizationFactory(OrganizationFactory):
    """Factory for organizations with expired trials."""

    plan = "free_trial"
    on_trial = True
    paid_until = None
    trial_ends_on = factory.LazyFunction(
        lambda: timezone.now().date() - timezone.timedelta(days=1)
    )
