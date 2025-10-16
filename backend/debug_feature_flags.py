#!/usr/bin/env python
"""Debug script for feature flags evaluation."""

import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.test")
django.setup()

from apps.feature_flags.services import FeatureFlagService
from apps.feature_flags.tests.factories import (
    FeatureAccessFactory,
    FeatureFlagFactory,
    UserFactory,
)

# Recreate test scenario
user = UserFactory()
flag1 = FeatureFlagFactory(is_enabled_globally=True)
flag2 = FeatureFlagFactory(is_enabled_globally=False)
access_rule = FeatureAccessFactory(feature=flag2, user=user, enabled=True)

print(f"User ID: {user.id}")
print(f"User email: {user.email}")
print(f"\nFlag1: {flag1.key} (globally enabled: {flag1.is_enabled_globally})")
print(f"Flag2: {flag2.key} (globally enabled: {flag2.is_enabled_globally})")
print(
    f"\nAccess Rule: feature={flag2.key}, user={user.email}, enabled={access_rule.enabled}"
)
print(f"Access rule applies to user: {access_rule.applies_to_user(user)}")

# Test service
service = FeatureFlagService(use_cache=False)
result = service.get_user_flags(user, None, None, force_refresh=True)

print("\nService evaluation result:")
for key, enabled in result.items():
    print(f"  {key}: {enabled}")

print("\nExpected: Both flags enabled")
print(f"Actual: flag1={result.get(flag1.key)}, flag2={result.get(flag2.key)}")

# Debug single flag evaluation
print("\n--- Debugging flag2 evaluation ---")
print(f"Flag2 is_active_now: {flag2.is_active_now()}")
print(f"Flag2 is_enabled_globally: {flag2.is_enabled_globally}")
print(f"Flag2 rollout_percentage: {flag2.rollout_percentage}")
print(f"Flag2 access_rules count: {flag2.access_rules.count()}")

for rule in flag2.access_rules.all():
    print(f"  Rule: user={rule.user}, enabled={rule.enabled}")
    print(f"  Rule applies_to_user: {rule.applies_to_user(user)}")
    print(f"  Rule check_conditions: {rule.check_conditions(user)}")
