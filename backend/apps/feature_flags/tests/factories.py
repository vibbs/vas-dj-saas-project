"""
Feature Flags Test Factories.

Factory Boy factories for creating test data for feature flags,
access rules, onboarding progress, and related models.
"""

import factory
import factory.fuzzy
from datetime import datetime, timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model

from ..models import FeatureFlag, FeatureAccess, UserOnboardingProgress
from ..enums import OnboardingStageTypes

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    """Factory for creating test users."""
    
    class Meta:
        model = User
    
    email = factory.Sequence(lambda n: f'user{n}@example.com')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    is_active = True
    is_email_verified = True
    date_joined = factory.LazyFunction(timezone.now)
    
    @factory.post_generation
    def set_role(self, create, extracted, **kwargs):
        """Set user role after creation."""
        if extracted:
            self.role = extracted


class OrganizationFactory(factory.django.DjangoModelFactory):
    """Factory for creating test organizations."""
    
    class Meta:
        model = 'organizations.Organization'
    
    name = factory.Faker('company')
    slug = factory.LazyAttribute(lambda obj: obj.name.lower().replace(' ', '-'))
    sub_domain = factory.LazyAttribute(lambda obj: obj.slug)
    creator_email = factory.LazyAttribute(lambda obj: f'admin@{obj.slug}.com')
    creator_name = factory.Faker('name')
    plan = 'free_trial'
    is_active = True
    on_trial = True
    trial_ends_on = factory.LazyFunction(
        lambda: timezone.now().date() + timedelta(days=14)
    )


class FeatureFlagFactory(factory.django.DjangoModelFactory):
    """Factory for creating test feature flags."""
    
    class Meta:
        model = FeatureFlag
    
    key = factory.Sequence(lambda n: f'feature_flag_{n}')
    name = factory.LazyAttribute(lambda obj: obj.key.replace('_', ' ').title())
    description = factory.Faker('sentence', nb_words=10)
    is_enabled_globally = False
    rollout_percentage = 0
    is_permanent = False
    requires_restart = False
    environments = factory.LazyFunction(lambda: ['development', 'staging'])
    
    @factory.post_generation
    def set_organization(self, create, extracted, **kwargs):
        """Set organization if provided."""
        if extracted:
            self.organization = extracted
    
    @classmethod
    def create_enabled(cls, **kwargs):
        """Create an enabled feature flag."""
        return cls(is_enabled_globally=True, **kwargs)
    
    @classmethod
    def create_with_rollout(cls, percentage=50, **kwargs):
        """Create a feature flag with rollout percentage."""
        return cls(rollout_percentage=percentage, **kwargs)
    
    @classmethod
    def create_scheduled(cls, days_from_now=1, **kwargs):
        """Create a scheduled feature flag."""
        active_from = timezone.now() + timedelta(days=days_from_now)
        return cls(active_from=active_from, **kwargs)
    
    @classmethod
    def create_expired(cls, days_ago=1, **kwargs):
        """Create an expired feature flag."""
        active_until = timezone.now() - timedelta(days=days_ago)
        return cls(active_until=active_until, **kwargs)


class FeatureAccessFactory(factory.django.DjangoModelFactory):
    """Factory for creating test feature access rules."""
    
    class Meta:
        model = FeatureAccess
    
    feature = factory.SubFactory(FeatureFlagFactory)
    enabled = True
    conditions = factory.LazyFunction(dict)
    reason = factory.Faker('sentence', nb_words=5)
    
    @factory.post_generation
    def set_target(self, create, extracted, **kwargs):
        """Set the access target (user, role, or organization)."""
        if extracted:
            target_type, target_value = extracted
            if target_type == 'user':
                self.user = target_value
            elif target_type == 'role':
                self.role = target_value
            elif target_type == 'organization':
                self.organization = target_value
    
    @classmethod
    def create_for_user(cls, user, **kwargs):
        """Create an access rule for a specific user."""
        return cls(user=user, **kwargs)
    
    @classmethod
    def create_for_role(cls, role, **kwargs):
        """Create an access rule for a specific role."""
        return cls(role=role, **kwargs)
    
    @classmethod
    def create_for_organization(cls, organization, **kwargs):
        """Create an access rule for a specific organization."""
        return cls(organization=organization, **kwargs)
    
    @classmethod
    def create_disabled(cls, **kwargs):
        """Create a disabled access rule."""
        return cls(enabled=False, **kwargs)
    
    @classmethod
    def create_with_conditions(cls, conditions, **kwargs):
        """Create an access rule with specific conditions."""
        return cls(conditions=conditions, **kwargs)


class UserOnboardingProgressFactory(factory.django.DjangoModelFactory):
    """Factory for creating test onboarding progress."""
    
    class Meta:
        model = UserOnboardingProgress
    
    user = factory.SubFactory(UserFactory)
    current_stage = OnboardingStageTypes.SIGNUP_COMPLETE.value
    completed_stages = factory.LazyFunction(list)
    total_actions_completed = 0
    progress_percentage = 0
    stage_started_at = factory.LazyFunction(timezone.now)
    custom_data = factory.LazyFunction(dict)
    
    @classmethod
    def create_email_verified(cls, **kwargs):
        """Create progress at email verified stage."""
        return cls(
            current_stage=OnboardingStageTypes.EMAIL_VERIFIED.value,
            completed_stages=[OnboardingStageTypes.SIGNUP_COMPLETE.value],
            total_actions_completed=1,
            progress_percentage=12,  # 1/8 stages
            **kwargs
        )
    
    @classmethod
    def create_profile_setup(cls, **kwargs):
        """Create progress at profile setup stage."""
        return cls(
            current_stage=OnboardingStageTypes.PROFILE_SETUP.value,
            completed_stages=[
                OnboardingStageTypes.SIGNUP_COMPLETE.value,
                OnboardingStageTypes.EMAIL_VERIFIED.value
            ],
            total_actions_completed=2,
            progress_percentage=25,  # 2/8 stages
            **kwargs
        )
    
    @classmethod
    def create_organization_created(cls, **kwargs):
        """Create progress at organization created stage."""
        return cls(
            current_stage=OnboardingStageTypes.ORGANIZATION_CREATED.value,
            completed_stages=[
                OnboardingStageTypes.SIGNUP_COMPLETE.value,
                OnboardingStageTypes.EMAIL_VERIFIED.value,
                OnboardingStageTypes.PROFILE_SETUP.value
            ],
            total_actions_completed=3,
            progress_percentage=37,  # 3/8 stages
            **kwargs
        )
    
    @classmethod
    def create_advanced(cls, **kwargs):
        """Create advanced onboarding progress."""
        return cls(
            current_stage=OnboardingStageTypes.FIRST_PROJECT.value,
            completed_stages=[
                OnboardingStageTypes.SIGNUP_COMPLETE.value,
                OnboardingStageTypes.EMAIL_VERIFIED.value,
                OnboardingStageTypes.PROFILE_SETUP.value,
                OnboardingStageTypes.ORGANIZATION_CREATED.value,
                OnboardingStageTypes.FIRST_TEAM_MEMBER.value
            ],
            total_actions_completed=5,
            progress_percentage=62,  # 5/8 stages
            **kwargs
        )
    
    @classmethod
    def create_completed(cls, **kwargs):
        """Create completed onboarding progress."""
        all_stages = [choice[0] for choice in OnboardingStageTypes.choices()]
        return cls(
            current_stage=OnboardingStageTypes.ONBOARDING_COMPLETE.value,
            completed_stages=all_stages[:-1],  # All except current
            total_actions_completed=len(all_stages) - 1,
            progress_percentage=100,
            onboarding_completed_at=timezone.now(),
            **kwargs
        )
    
    @classmethod
    def create_with_custom_data(cls, custom_data, **kwargs):
        """Create progress with custom data."""
        return cls(custom_data=custom_data, **kwargs)


# Specialized factories for complex scenarios
class ComplexFeatureFlagScenarioFactory:
    """Factory for creating complex feature flag scenarios."""
    
    @staticmethod
    def create_multi_tier_access(organization=None):
        """
        Create a feature flag with multi-tier access rules.
        
        Returns:
            dict: Contains flag, user rules, role rules, and org rules
        """
        flag = FeatureFlagFactory(key='multi_tier_feature')
        
        # Create users with different roles
        admin_user = UserFactory(role='ADMIN')
        manager_user = UserFactory(role='MANAGER')
        regular_user = UserFactory()
        
        # Create access rules
        user_rule = FeatureAccessFactory.create_for_user(regular_user, feature=flag, enabled=True)
        role_rule = FeatureAccessFactory.create_for_role('ADMIN', feature=flag, enabled=True)
        
        org_rule = None
        if organization:
            org_rule = FeatureAccessFactory.create_for_organization(organization, feature=flag, enabled=True)
        
        return {
            'flag': flag,
            'admin_user': admin_user,
            'manager_user': manager_user,
            'regular_user': regular_user,
            'user_rule': user_rule,
            'role_rule': role_rule,
            'org_rule': org_rule
        }
    
    @staticmethod
    def create_progressive_onboarding_scenario():
        """
        Create a complete progressive onboarding scenario.
        
        Returns:
            dict: Contains users at different onboarding stages with associated flags
        """
        # Create feature flags for different stages
        basic_flag = FeatureFlagFactory(key='basic_dashboard')
        profile_flag = FeatureFlagFactory(key='profile_customization')
        team_flag = FeatureFlagFactory(key='team_features')
        advanced_flag = FeatureFlagFactory(key='advanced_analytics')
        
        # Create users at different stages
        new_user = UserFactory()
        verified_user = UserFactory()
        profile_user = UserFactory()
        org_user = UserFactory()
        advanced_user = UserFactory()
        completed_user = UserFactory()
        
        # Create onboarding progress
        new_progress = UserOnboardingProgressFactory(user=new_user)
        verified_progress = UserOnboardingProgressFactory.create_email_verified(user=verified_user)
        profile_progress = UserOnboardingProgressFactory.create_profile_setup(user=profile_user)
        org_progress = UserOnboardingProgressFactory.create_organization_created(user=org_user)
        advanced_progress = UserOnboardingProgressFactory.create_advanced(user=advanced_user)
        completed_progress = UserOnboardingProgressFactory.create_completed(user=completed_user)
        
        return {
            'flags': {
                'basic': basic_flag,
                'profile': profile_flag,
                'team': team_flag,
                'advanced': advanced_flag
            },
            'users': {
                'new': new_user,
                'verified': verified_user,
                'profile': profile_user,
                'org': org_user,
                'advanced': advanced_user,
                'completed': completed_user
            },
            'progress': {
                'new': new_progress,
                'verified': verified_progress,
                'profile': profile_progress,
                'org': org_progress,
                'advanced': advanced_progress,
                'completed': completed_progress
            }
        }
    
    @staticmethod
    def create_rollout_scenario(users_count=10):
        """
        Create a rollout scenario with multiple users and percentage rollout.
        
        Args:
            users_count: Number of users to create
            
        Returns:
            dict: Contains flag and users for rollout testing
        """
        flag = FeatureFlagFactory.create_with_rollout(percentage=50, key='rollout_feature')
        users = [UserFactory(email=f'rollout_user_{i}@example.com') for i in range(users_count)]
        
        return {
            'flag': flag,
            'users': users
        }
    
    @staticmethod
    def create_time_based_scenario():
        """
        Create scenarios with time-based feature flags.
        
        Returns:
            dict: Contains scheduled, active, and expired flags
        """
        past_time = timezone.now() - timedelta(days=7)
        future_time = timezone.now() + timedelta(days=7)
        
        # Active flag (no time restrictions)
        active_flag = FeatureFlagFactory(key='always_active', is_enabled_globally=True)
        
        # Scheduled flag (future activation)
        scheduled_flag = FeatureFlagFactory(
            key='future_feature',
            is_enabled_globally=True,
            active_from=future_time
        )
        
        # Expired flag (past expiration)
        expired_flag = FeatureFlagFactory(
            key='expired_feature',
            is_enabled_globally=True,
            active_until=past_time
        )
        
        # Time window flag (active between dates)
        window_flag = FeatureFlagFactory(
            key='window_feature',
            is_enabled_globally=True,
            active_from=past_time,
            active_until=future_time
        )
        
        return {
            'active': active_flag,
            'scheduled': scheduled_flag,
            'expired': expired_flag,
            'window': window_flag
        }


# Batch factories for performance testing
class BatchFactory:
    """Factory for creating batches of test data for performance testing."""
    
    @staticmethod
    def create_feature_flags(count=50):
        """Create a batch of feature flags."""
        return [
            FeatureFlagFactory(key=f'perf_flag_{i}')
            for i in range(count)
        ]
    
    @staticmethod
    def create_users(count=100):
        """Create a batch of users."""
        return [
            UserFactory(email=f'perf_user_{i}@example.com')
            for i in range(count)
        ]
    
    @staticmethod
    def create_access_rules(flags, users, ratio=0.3):
        """
        Create access rules for a portion of flag-user combinations.
        
        Args:
            flags: List of feature flags
            users: List of users
            ratio: Ratio of combinations to create rules for
            
        Returns:
            List of created access rules
        """
        rules = []
        total_combinations = len(flags) * len(users)
        rules_to_create = int(total_combinations * ratio)
        
        import random
        random.seed(42)  # For reproducible results
        
        for _ in range(rules_to_create):
            flag = random.choice(flags)
            user = random.choice(users)
            enabled = random.choice([True, False])
            
            # Avoid duplicate rules
            existing = FeatureAccess.objects.filter(feature=flag, user=user).first()
            if not existing:
                rule = FeatureAccessFactory(feature=flag, user=user, enabled=enabled)
                rules.append(rule)
        
        return rules