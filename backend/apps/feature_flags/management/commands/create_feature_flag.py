"""
Management command to create feature flags.
"""

from django.core.management.base import BaseCommand, CommandError
from apps.feature_flags.models import FeatureFlag


class Command(BaseCommand):
    help = 'Create a new feature flag'
    
    def add_arguments(self, parser):
        parser.add_argument('key', type=str, help='Feature flag key')
        parser.add_argument('name', type=str, help='Feature flag name')
        parser.add_argument('--description', type=str, default='', help='Feature flag description')
        parser.add_argument('--enabled', action='store_true', help='Enable flag globally')
        parser.add_argument('--rollout', type=int, default=0, help='Rollout percentage (0-100)')
    
    def handle(self, *args, **options):
        key = options['key']
        name = options['name']
        description = options['description']
        enabled = options['enabled']
        rollout = options['rollout']
        
        if FeatureFlag.objects.filter(key=key).exists():
            raise CommandError(f'Feature flag "{key}" already exists')
        
        flag = FeatureFlag.objects.create(
            key=key,
            name=name,
            description=description,
            is_enabled_globally=enabled,
            rollout_percentage=rollout
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created feature flag "{flag.key}"')
        )