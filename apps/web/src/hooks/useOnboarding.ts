/**
 * Onboarding Hook
 * Manages user onboarding state and progress tracking
 * Uses API when available, falls back to localStorage
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStatus, useAuthAccount } from '@vas-dj-saas/auth';

// Define types locally since they may not be exported from api-client
export interface UserOnboardingProgress {
  id: string;
  currentStage: string;
  completedStages?: string[];
  onboardingCompletedAt?: string | null;
  customData?: Record<string, unknown>;
}

export type OnboardingAction =
  | 'email_verified'
  | 'profile_completed'
  | 'organization_created'
  | 'first_team_member_added'
  | 'first_project_created'
  | 'advanced_feature_used';

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

// Mock OnboardingService for local usage until api-client exports it
const OnboardingService = {
  getOnboardingStatus: async () => {
    return { status: 404, extractedData: null };
  },
  triggerAction: async (_action: OnboardingAction) => {
    return { status: 200 };
  },
  completeOnboarding: async (_id: string) => {
    return { status: 200 };
  },
  dismissOnboarding: async (_id: string) => {
    return { status: 200 };
  },
  hasCompletedStage: (progress: UserOnboardingProgress | null, stage: OnboardingStageType): boolean => {
    if (!progress) return false;
    const completedStages = progress.completedStages as string[] | undefined;
    if (completedStages?.includes(stage)) return true;
    const stageOrder = Object.values(OnboardingStage);
    const currentIndex = stageOrder.indexOf(progress.currentStage as OnboardingStageType || 'SIGNUP_COMPLETE');
    const targetIndex = stageOrder.indexOf(stage);
    return currentIndex >= targetIndex;
  },
  isOnboardingComplete: (progress: UserOnboardingProgress | null): boolean => {
    if (!progress) return false;
    return (
      progress.currentStage === OnboardingStage.ONBOARDING_COMPLETE ||
      progress.onboardingCompletedAt !== null
    );
  },
  wasOnboardingDismissed: (progress: UserOnboardingProgress | null): boolean => {
    if (!progress) return false;
    const customData = progress.customData as { dismissed?: boolean } | undefined;
    return customData?.dismissed === true;
  },
};

// Local storage key for fallback
const STORAGE_KEY = 'onboarding-progress';
const WELCOME_SHOWN_KEY = 'onboarding-welcome-shown';

// Onboarding step definitions for the checklist UI
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  stage: OnboardingStageType;
  action?: OnboardingAction;
  href?: string;
  isComplete: boolean;
}

// Default onboarding steps configuration
export const ONBOARDING_STEPS: Omit<OnboardingStep, 'isComplete'>[] = [
  {
    id: 'profile',
    title: 'Complete your profile',
    description: 'Add your name and profile details',
    stage: OnboardingStage.PROFILE_SETUP,
    action: 'profile_completed',
    href: '/settings/profile',
  },
  {
    id: 'organization',
    title: 'Set up your organization',
    description: 'Create or join an organization',
    stage: OnboardingStage.ORGANIZATION_CREATED,
    action: 'organization_created',
    href: '/settings/organization',
  },
  {
    id: 'team',
    title: 'Invite team members',
    description: 'Collaborate with your team',
    stage: OnboardingStage.FIRST_TEAM_MEMBER,
    action: 'first_team_member_added',
    href: '/settings/team',
  },
  {
    id: 'explore',
    title: 'Explore the dashboard',
    description: 'Discover key features',
    stage: OnboardingStage.ADVANCED_FEATURES,
    action: 'advanced_feature_used',
    href: '/dashboard',
  },
];

interface LocalOnboardingState {
  completedSteps: string[];
  dismissed: boolean;
  currentStage: OnboardingStageType;
  welcomeShown: boolean;
}

interface UseOnboardingResult {
  // State
  progress: UserOnboardingProgress | null;
  steps: OnboardingStep[];
  isLoading: boolean;
  error: string | null;

  // Computed values
  completedCount: number;
  totalSteps: number;
  progressPercentage: number;
  isComplete: boolean;
  isDismissed: boolean;
  showWelcome: boolean;
  currentStep: OnboardingStep | null;

  // Actions
  markStepComplete: (stepId: string) => Promise<void>;
  markAllComplete: () => Promise<void>;
  dismissOnboarding: () => Promise<void>;
  markWelcomeShown: () => void;
  refresh: () => Promise<void>;
}

/**
 * Load local state from localStorage
 */
function loadLocalState(): LocalOnboardingState {
  if (typeof window === 'undefined') {
    return {
      completedSteps: [],
      dismissed: false,
      currentStage: OnboardingStage.SIGNUP_COMPLETE,
      welcomeShown: false,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const welcomeShown = localStorage.getItem(WELCOME_SHOWN_KEY) === 'true';

    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...parsed, welcomeShown };
    }
  } catch {
    // Ignore parse errors
  }

  return {
    completedSteps: [],
    dismissed: false,
    currentStage: OnboardingStage.SIGNUP_COMPLETE,
    welcomeShown: false,
  };
}

/**
 * Save local state to localStorage
 */
function saveLocalState(state: Omit<LocalOnboardingState, 'welcomeShown'>): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

export function useOnboarding(): UseOnboardingResult {
  const authStatus = useAuthStatus();
  const account = useAuthAccount();

  const [progress, setProgress] = useState<UserOnboardingProgress | null>(null);
  const [localState, setLocalState] = useState<LocalOnboardingState>(loadLocalState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useLocalFallback, setUseLocalFallback] = useState(false);

  // Fetch onboarding status from API
  const fetchProgress = useCallback(async () => {
    if (authStatus !== 'authenticated') {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await OnboardingService.getOnboardingStatus();

      if (response.status === 200 && response.extractedData) {
        setProgress(response.extractedData);
        setUseLocalFallback(false);
      } else {
        // API not available or no data, use local fallback
        setUseLocalFallback(true);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.warn('Onboarding API not available, using local storage:', errorMessage);
      setUseLocalFallback(true);
    } finally {
      setIsLoading(false);
    }
  }, [authStatus]);

  // Initial fetch
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Load local state on mount
  useEffect(() => {
    setLocalState(loadLocalState());
  }, []);

  // Compute steps with completion status
  const steps = useMemo((): OnboardingStep[] => {
    return ONBOARDING_STEPS.map((step) => {
      let isComplete = false;

      if (useLocalFallback) {
        isComplete = localState.completedSteps.includes(step.id);
      } else if (progress) {
        isComplete = OnboardingService.hasCompletedStage(progress, step.stage);
      }

      // Also check account data for auto-completion
      if (account) {
        if (step.id === 'profile' && account.firstName && account.lastName) {
          isComplete = true;
        }
      }

      return { ...step, isComplete };
    });
  }, [progress, localState, useLocalFallback, account]);

  // Computed values
  const completedCount = useMemo(() => steps.filter((s) => s.isComplete).length, [steps]);
  const totalSteps = ONBOARDING_STEPS.length;
  const progressPercentage = Math.round((completedCount / totalSteps) * 100);

  const isComplete = useMemo(() => {
    if (useLocalFallback) {
      return localState.dismissed || completedCount === totalSteps;
    }
    return progress ? OnboardingService.isOnboardingComplete(progress) : false;
  }, [progress, localState, useLocalFallback, completedCount, totalSteps]);

  const isDismissed = useMemo(() => {
    if (useLocalFallback) {
      return localState.dismissed;
    }
    return progress ? OnboardingService.wasOnboardingDismissed(progress) : false;
  }, [progress, localState, useLocalFallback]);

  const showWelcome = !localState.welcomeShown && !isComplete && !isDismissed;

  const currentStep = useMemo(() => {
    return steps.find((s) => !s.isComplete) || null;
  }, [steps]);

  // Mark a step as complete
  const markStepComplete = useCallback(
    async (stepId: string) => {
      const step = ONBOARDING_STEPS.find((s) => s.id === stepId);
      if (!step) return;

      if (useLocalFallback) {
        const newCompletedSteps = [...localState.completedSteps, stepId];
        const newState = {
          ...localState,
          completedSteps: newCompletedSteps,
        };
        setLocalState((prev) => ({ ...prev, ...newState }));
        saveLocalState(newState);
      } else if (progress && step.action) {
        try {
          await OnboardingService.triggerAction(step.action);
          await fetchProgress();
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to update progress';
          setError(errorMessage);
        }
      }
    },
    [useLocalFallback, localState, progress, fetchProgress]
  );

  // Mark all steps complete
  const markAllComplete = useCallback(async () => {
    if (useLocalFallback) {
      const newState = {
        completedSteps: ONBOARDING_STEPS.map((s) => s.id),
        dismissed: false,
        currentStage: OnboardingStage.ONBOARDING_COMPLETE,
      };
      setLocalState((prev) => ({ ...prev, ...newState }));
      saveLocalState(newState);
    } else if (progress) {
      try {
        await OnboardingService.completeOnboarding(progress.id);
        await fetchProgress();
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to complete onboarding';
        setError(errorMessage);
      }
    }
  }, [useLocalFallback, progress, fetchProgress]);

  // Dismiss onboarding
  const dismissOnboarding = useCallback(async () => {
    if (useLocalFallback) {
      const newState = {
        ...localState,
        dismissed: true,
        currentStage: OnboardingStage.ONBOARDING_COMPLETE,
      };
      setLocalState((prev) => ({ ...prev, ...newState }));
      saveLocalState(newState);
    } else if (progress) {
      try {
        await OnboardingService.dismissOnboarding(progress.id);
        await fetchProgress();
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to dismiss onboarding';
        setError(errorMessage);
      }
    }
  }, [useLocalFallback, localState, progress, fetchProgress]);

  // Mark welcome modal as shown
  const markWelcomeShown = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    }
    setLocalState((prev) => ({ ...prev, welcomeShown: true }));
  }, []);

  return {
    progress,
    steps,
    isLoading,
    error,
    completedCount,
    totalSteps,
    progressPercentage,
    isComplete,
    isDismissed,
    showWelcome,
    currentStep,
    markStepComplete,
    markAllComplete,
    dismissOnboarding,
    markWelcomeShown,
    refresh: fetchProgress,
  };
}
