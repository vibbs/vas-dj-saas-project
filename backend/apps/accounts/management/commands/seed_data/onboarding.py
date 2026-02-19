"""
Onboarding seeder for creating user onboarding progress records.
"""

from django.utils import timezone

from apps.feature_flags.enums import OnboardingStageTypes
from apps.feature_flags.models import UserOnboardingProgress


class OnboardingSeeder:
    """Seeder for user onboarding progress records."""

    def __init__(self, stdout, style):
        self.stdout = stdout
        self.style = style

    def _log_created(self, entity_type, identifier):
        self.stdout.write(self.style.SUCCESS(f"   + Created {entity_type}: {identifier}"))

    def _log_existing(self, entity_type, identifier):
        self.stdout.write(self.style.SUCCESS(f"   = {entity_type} exists: {identifier}"))

    def seed_complete_onboarding(self, user, organization):
        """
        Seed completed onboarding progress for a user.

        Args:
            user: Account instance
            organization: Organization instance (can be None)

        Returns:
            UserOnboardingProgress instance
        """
        # Get all stages except the final one (which is current)
        all_stages = [choice[0] for choice in OnboardingStageTypes.choices()]
        completed_stages = all_stages[:-1]  # All except ONBOARDING_COMPLETE

        progress, created = UserOnboardingProgress.objects.get_or_create(
            user=user,
            defaults={
                "organization": organization,
                "current_stage": OnboardingStageTypes.ONBOARDING_COMPLETE.value,
                "completed_stages": completed_stages,
                "total_actions_completed": len(completed_stages),
                "progress_percentage": 100,
                "onboarding_completed_at": timezone.now(),
                "custom_data": {
                    "seed": True,
                    "completed_at": timezone.now().isoformat(),
                },
            },
        )

        if created:
            self._log_created("OnboardingProgress", f"{user.email} (100%)")
        else:
            self._log_existing("OnboardingProgress", f"{user.email}")

        return progress

    def seed_initial_onboarding(self, user):
        """
        Seed initial/empty onboarding state for a user (no progress).

        Args:
            user: Account instance

        Returns:
            UserOnboardingProgress instance
        """
        progress, created = UserOnboardingProgress.objects.get_or_create(
            user=user,
            defaults={
                "organization": None,
                "current_stage": OnboardingStageTypes.SIGNUP_COMPLETE.value,
                "completed_stages": [],
                "total_actions_completed": 0,
                "progress_percentage": 0,
                "custom_data": {"seed": True},
            },
        )

        if created:
            self._log_created("OnboardingProgress", f"{user.email} (0%)")
        else:
            self._log_existing("OnboardingProgress", f"{user.email}")

        return progress
