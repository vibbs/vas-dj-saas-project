from apps.core.utils.enums import CustomEnum


class OnboardingStageTypes(CustomEnum):
    """User onboarding progression stages."""
    SIGNUP_COMPLETE = "SIGNUP_COMPLETE"
    EMAIL_VERIFIED = "EMAIL_VERIFIED"
    PROFILE_SETUP = "PROFILE_SETUP"
    ORGANIZATION_CREATED = "ORGANIZATION_CREATED"
    FIRST_TEAM_MEMBER = "FIRST_TEAM_MEMBER"
    FIRST_PROJECT = "FIRST_PROJECT"
    ADVANCED_FEATURES = "ADVANCED_FEATURES"
    ONBOARDING_COMPLETE = "ONBOARDING_COMPLETE"


class FeatureFlagScopeTypes(CustomEnum):
    """Feature flag scope types."""
    GLOBAL = "GLOBAL"
    ORGANIZATION = "ORGANIZATION"
    USER = "USER"
    ROLE = "ROLE"