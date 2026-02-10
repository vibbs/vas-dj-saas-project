'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useOnboarding, type OnboardingStep, type UserOnboardingProgress } from '@/hooks/useOnboarding';

// Tooltip configuration for guided tour
export interface TooltipConfig {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

// Context interface
interface OnboardingContextValue {
  // From useOnboarding hook
  progress: UserOnboardingProgress | null;
  steps: OnboardingStep[];
  isLoading: boolean;
  error: string | null;
  completedCount: number;
  totalSteps: number;
  progressPercentage: number;
  isComplete: boolean;
  isDismissed: boolean;
  showWelcome: boolean;
  currentStep: OnboardingStep | null;

  // Actions from useOnboarding
  markStepComplete: (stepId: string) => Promise<void>;
  markAllComplete: () => Promise<void>;
  dismissOnboarding: () => Promise<void>;
  markWelcomeShown: () => void;
  refresh: () => Promise<void>;

  // Tooltip tour management
  activeTooltip: TooltipConfig | null;
  tooltipStep: number;
  totalTooltipSteps: number;
  startTour: (tooltips: TooltipConfig[]) => void;
  nextTooltip: () => void;
  skipTour: () => void;
  closeTour: () => void;

  // UI state helpers
  showChecklist: boolean;
  setShowChecklist: (show: boolean) => void;
  minimizeChecklist: boolean;
  setMinimizeChecklist: (minimize: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
}) => {
  // Use the core onboarding hook
  const onboarding = useOnboarding();

  // Tooltip tour state
  const [tooltipQueue, setTooltipQueue] = useState<TooltipConfig[]>([]);
  const [currentTooltipIndex, setCurrentTooltipIndex] = useState(0);
  const [isTourActive, setIsTourActive] = useState(false);

  // UI state
  const [showChecklist, setShowChecklist] = useState(true);
  const [minimizeChecklist, setMinimizeChecklist] = useState(false);

  // Computed tooltip values
  const activeTooltip = useMemo(() => {
    if (!isTourActive || tooltipQueue.length === 0) return null;
    return tooltipQueue[currentTooltipIndex] || null;
  }, [isTourActive, tooltipQueue, currentTooltipIndex]);

  const tooltipStep = currentTooltipIndex + 1;
  const totalTooltipSteps = tooltipQueue.length;

  // Tour management actions
  const startTour = useCallback((tooltips: TooltipConfig[]) => {
    if (tooltips.length === 0) return;
    setTooltipQueue(tooltips);
    setCurrentTooltipIndex(0);
    setIsTourActive(true);
  }, []);

  const nextTooltip = useCallback(() => {
    if (currentTooltipIndex < tooltipQueue.length - 1) {
      setCurrentTooltipIndex((prev) => prev + 1);
    } else {
      // Tour complete
      setIsTourActive(false);
      setTooltipQueue([]);
      setCurrentTooltipIndex(0);
    }
  }, [currentTooltipIndex, tooltipQueue.length]);

  const skipTour = useCallback(() => {
    setIsTourActive(false);
    setTooltipQueue([]);
    setCurrentTooltipIndex(0);
  }, []);

  const closeTour = useCallback(() => {
    setIsTourActive(false);
    setTooltipQueue([]);
    setCurrentTooltipIndex(0);
  }, []);

  // Combine all values
  const contextValue = useMemo<OnboardingContextValue>(
    () => ({
      // From useOnboarding
      ...onboarding,

      // Tooltip tour
      activeTooltip,
      tooltipStep,
      totalTooltipSteps,
      startTour,
      nextTooltip,
      skipTour,
      closeTour,

      // UI state
      showChecklist,
      setShowChecklist,
      minimizeChecklist,
      setMinimizeChecklist,
    }),
    [
      onboarding,
      activeTooltip,
      tooltipStep,
      totalTooltipSteps,
      startTour,
      nextTooltip,
      skipTour,
      closeTour,
      showChecklist,
      minimizeChecklist,
    ]
  );

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

/**
 * Hook to access onboarding context
 * @throws Error if used outside OnboardingProvider
 */
export function useOnboardingContext(): OnboardingContextValue {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error(
      'useOnboardingContext must be used within an OnboardingProvider'
    );
  }

  return context;
}

/**
 * Optional hook that doesn't throw if context is missing
 * Useful for components that may be rendered outside the provider
 */
export function useOnboardingContextOptional(): OnboardingContextValue | null {
  return useContext(OnboardingContext);
}

// Pre-defined tour configurations
export const DASHBOARD_TOUR: TooltipConfig[] = [
  {
    id: 'sidebar',
    title: 'Navigation Sidebar',
    description:
      'Access all your main features from here. Navigate between Home, Dashboard, Settings and more.',
    targetSelector: '[data-tour="sidebar"]',
    position: 'right',
  },
  {
    id: 'profile',
    title: 'Your Profile',
    description:
      'Click here to access your profile settings, account preferences, and sign out.',
    targetSelector: '[data-tour="profile"]',
    position: 'bottom',
  },
  {
    id: 'quick-actions',
    title: 'Quick Actions',
    description:
      'Access frequently used actions with just one click. Customize these based on your workflow.',
    targetSelector: '[data-tour="quick-actions"]',
    position: 'left',
  },
];

export const SETTINGS_TOUR: TooltipConfig[] = [
  {
    id: 'profile-settings',
    title: 'Profile Settings',
    description:
      'Update your personal information, avatar, and display preferences here.',
    targetSelector: '[data-tour="profile-settings"]',
    position: 'right',
  },
  {
    id: 'team-settings',
    title: 'Team Management',
    description:
      'Invite team members, manage roles, and configure team permissions.',
    targetSelector: '[data-tour="team-settings"]',
    position: 'right',
  },
  {
    id: 'organization-settings',
    title: 'Organization Settings',
    description:
      'Configure your organization details, billing, and advanced settings.',
    targetSelector: '[data-tour="organization-settings"]',
    position: 'right',
  },
];

export default OnboardingContext;
