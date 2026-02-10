/**
 * Onboarding Service
 * Clean wrapper over generated feature-flags/onboarding endpoints
 */

import {
  v1FeatureFlagsOnboardingMeRetrieve,
  v1FeatureFlagsOnboardingPartialUpdate,
  v1FeatureFlagsOnboardingActionCreate,
  v1FeatureFlagsOnboardingStagesRetrieve,
} from '../generated/feature-flags/feature-flags';

import type {
  PatchedUserOnboardingProgressUpdateRequest,
  V1FeatureFlagsOnboardingActionCreateBody,
  V1FeatureFlagsOnboardingStagesRetrieveParams,
  UserOnboardingProgress,
  UserOnboardingProgressCurrentStage,
} from '../generated/api.schemas';

// Re-export types for convenience
export type { UserOnboardingProgress, UserOnboardingProgressCurrentStage };

// Onboarding action types that can trigger stage progression
export type OnboardingAction =
  | 'email_verified'
  | 'profile_completed'
  | 'organization_created'
  | 'first_team_member_added'
  | 'first_project_created'
  | 'advanced_feature_used';

// Onboarding stages enum for frontend use
export const OnboardingStage = {
  SIGNUP_COMPLETE: 'SIGNUP_COMPLETE',
  EMAIL_VERIFIED: 'EMAIL_VERIFIED',
  PROFILE_SETUP: 'PROFILE_SETUP',
  ORGANIZATION_CREATED: 'ORGANIZATION_CREATED',
  FIRST_TEAM_MEMBER: 'FIRST_TEAM_MEMBER',
  FIRST_PROJECT: 'FIRST_PROJECT',
  ADVANCED_FEATURES: 'ADVANCED_FEATURES',
  ONBOARDING_COMPLETE: 'ONBOARDING_COMPLETE',
} as const;

export type OnboardingStageType = typeof OnboardingStage[keyof typeof OnboardingStage];

/**
 * Helper to extract data from API response
 */
function extractData<T>(response: { status: number; data: any }): T | null {
  if (response.status >= 200 && response.status < 300) {
    // Handle nested data structure from Django REST envelope
    return response.data?.data || response.data;
  }
  return null;
}

export const OnboardingService = {
  /**
   * Get current user's onboarding status
   * Creates a new progress record if one doesn't exist
   */
  getOnboardingStatus: async () => {
    const response = await v1FeatureFlagsOnboardingMeRetrieve();
    return {
      ...response,
      extractedData: extractData<UserOnboardingProgress>(response),
    };
  },

  /**
   * Update onboarding step/progress
   * @param id - Onboarding progress record ID
   * @param data - Update data (current stage or custom data)
   */
  updateOnboardingStep: async (
    id: string,
    data: PatchedUserOnboardingProgressUpdateRequest
  ) => {
    const response = await v1FeatureFlagsOnboardingPartialUpdate(id, data);
    return {
      ...response,
      extractedData: extractData<UserOnboardingProgress>(response),
    };
  },

  /**
   * Trigger an onboarding action that may advance the user's stage
   * @param action - The action to trigger (e.g., 'email_verified', 'profile_completed')
   * @param metadata - Optional metadata about the action
   */
  triggerAction: async (
    action: OnboardingAction,
    metadata?: Record<string, unknown>
  ) => {
    const body: V1FeatureFlagsOnboardingActionCreateBody = {
      action,
      metadata,
    };
    const response = await v1FeatureFlagsOnboardingActionCreate(body);
    return response;
  },

  /**
   * Complete the onboarding process
   * Sets the current stage to ONBOARDING_COMPLETE
   */
  completeOnboarding: async (id: string) => {
    const response = await v1FeatureFlagsOnboardingPartialUpdate(id, {
      currentStage: 'ONBOARDING_COMPLETE',
    });
    return {
      ...response,
      extractedData: extractData<UserOnboardingProgress>(response),
    };
  },

  /**
   * Dismiss/skip onboarding
   * Marks onboarding as complete with custom data indicating it was dismissed
   */
  dismissOnboarding: async (id: string) => {
    const response = await v1FeatureFlagsOnboardingPartialUpdate(id, {
      currentStage: 'ONBOARDING_COMPLETE',
      customData: {
        dismissed: true,
        dismissedAt: new Date().toISOString(),
      },
    });
    return {
      ...response,
      extractedData: extractData<UserOnboardingProgress>(response),
    };
  },

  /**
   * Get information about available onboarding stages
   * @param stage - Optional specific stage to get info for
   */
  getStagesInfo: async (stage?: OnboardingStageType) => {
    const params: V1FeatureFlagsOnboardingStagesRetrieveParams = {};
    if (stage) {
      params.stage = stage;
    }
    const response = await v1FeatureFlagsOnboardingStagesRetrieve(params);
    return response;
  },

  /**
   * Check if user has completed a specific stage
   */
  hasCompletedStage: (
    progress: UserOnboardingProgress | null,
    stage: OnboardingStageType
  ): boolean => {
    if (!progress) return false;

    // Check if it's in completed stages
    const completedStages = progress.completedStages as string[] | undefined;
    if (completedStages?.includes(stage)) return true;

    // Check if current stage is at or beyond the target stage
    const stageOrder = Object.values(OnboardingStage);
    const currentIndex = stageOrder.indexOf(progress.currentStage || 'SIGNUP_COMPLETE');
    const targetIndex = stageOrder.indexOf(stage);

    return currentIndex >= targetIndex;
  },

  /**
   * Check if onboarding is complete
   */
  isOnboardingComplete: (progress: UserOnboardingProgress | null): boolean => {
    if (!progress) return false;
    return (
      progress.currentStage === OnboardingStage.ONBOARDING_COMPLETE ||
      progress.onboardingCompletedAt !== null
    );
  },

  /**
   * Check if onboarding was dismissed (skipped)
   */
  wasOnboardingDismissed: (progress: UserOnboardingProgress | null): boolean => {
    if (!progress) return false;
    const customData = progress.customData as { dismissed?: boolean } | undefined;
    return customData?.dismissed === true;
  },
} as const;
