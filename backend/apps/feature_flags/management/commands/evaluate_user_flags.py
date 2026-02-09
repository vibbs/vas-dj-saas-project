"""
Management command to evaluate feature flags for a specific user.
"""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from apps.feature_flags.services import FeatureFlagService

User = get_user_model()


class Command(BaseCommand):
    help = "Evaluate feature flags for a specific user"

    def add_arguments(self, parser):
        parser.add_argument("user_email", type=str, help="User email address")
        parser.add_argument("--flag", type=str, help="Specific flag to check")
        parser.add_argument("--no-cache", action="store_true", help="Skip cache")

    def handle(self, *args, **options):
        email = options["user_email"]
        specific_flag = options.get("flag")
        use_cache = not options.get("no_cache", False)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise CommandError(f'User with email "{email}" not found')

        service = FeatureFlagService(use_cache=use_cache)
        organization = user.get_primary_organization()

        if specific_flag:
            # Check specific flag
            is_enabled = service.is_feature_enabled(user, specific_flag, organization)
            status = "ENABLED" if is_enabled else "DISABLED"
            self.stdout.write(f'Flag "{specific_flag}": {status}')
        else:
            # Check all flags
            flags = service.get_user_flags(user, organization)

            self.stdout.write(f"\nFeature flags for {user.email}:")
            self.stdout.write("=" * 40)

            if not flags:
                self.stdout.write("No feature flags found")
                return

            for flag_key, enabled in flags.items():
                status = (
                    self.style.SUCCESS("ENABLED")
                    if enabled
                    else self.style.ERROR("DISABLED")
                )
                self.stdout.write(f"{flag_key}: {status}")

            enabled_count = sum(1 for enabled in flags.values() if enabled)
            self.stdout.write(f"\nTotal flags: {len(flags)}, Enabled: {enabled_count}")
