'use client';

import React, { useState, useEffect } from 'react';
import { useAuthAccount } from '@vas-dj-saas/auth';
import { Icon, Button } from '@vas-dj-saas/ui';
import {
  StatCardGrid,
  ActivityFeed,
  QuickActions,
  TeamOverview,
  UsageChart,
} from '@/components/dashboard';
import { useDashboard } from '@/hooks/useDashboard';
import { useOnboarding } from '@/hooks/useOnboarding';
import {
  OnboardingChecklist,
  WelcomeModal,
} from '@/components/onboarding';

/**
 * Get greeting based on time of day
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Get current date formatted
 */
function getCurrentDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Dashboard Header Component
 * Greeting with user name and time of day
 */
function DashboardHeader({
  name,
  onRefresh,
  isRefreshing,
}: {
  name: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          {getGreeting()}, {name}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {getCurrentDate()}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="self-start sm:self-auto"
      >
        <Icon
          name="RefreshCw"
          size="sm"
          className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
          aria-hidden={true}
        />
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </Button>
    </div>
  );
}

/**
 * Home Page (Protected)
 * Main dashboard with metrics, activity, quick actions, and onboarding
 */
export default function HomePage() {
  const account = useAuthAccount();
  const {
    stats,
    activities,
    teamOverview,
    usageMetrics,
    isLoading,
    isStatsLoading,
    isActivitiesLoading,
    isTeamLoading,
    isUsageLoading,
    error,
    refresh,
  } = useDashboard();

  // Onboarding state
  const {
    steps,
    completedCount,
    totalSteps,
    progressPercentage,
    isComplete: isOnboardingComplete,
    isDismissed: isOnboardingDismissed,
    showWelcome,
    isLoading: isOnboardingLoading,
    markStepComplete,
    dismissOnboarding,
    markWelcomeShown,
  } = useOnboarding();

  // State for welcome modal
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);

  // Show welcome modal on first visit
  useEffect(() => {
    if (showWelcome && !isOnboardingLoading) {
      // Small delay to ensure smooth page load
      const timer = setTimeout(() => {
        setIsWelcomeOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showWelcome, isOnboardingLoading]);

  const handleWelcomeGetStarted = () => {
    markWelcomeShown();
    setIsWelcomeOpen(false);
  };

  const handleWelcomeSkip = () => {
    markWelcomeShown();
    setIsWelcomeOpen(false);
  };

  const handleDismissOnboarding = async () => {
    await dismissOnboarding();
  };

  if (!account) {
    return null; // Layout handles auth guard
  }

  // Convert stats object to array for StatCardGrid
  const statsArray = stats
    ? [
        stats.totalMembers,
        stats.activeProjects,
        stats.pendingInvites,
        stats.monthlyUsage,
      ]
    : [];

  // Determine if we should show the onboarding checklist
  const showOnboardingChecklist =
    !isOnboardingComplete && !isOnboardingDismissed && !isOnboardingLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header with greeting */}
      <DashboardHeader
        name={account.firstName || account.fullName || 'there'}
        onRefresh={refresh}
        isRefreshing={isLoading}
      />

      {/* Onboarding Checklist - shown for new users */}
      {showOnboardingChecklist && (
        <section className="mb-6">
          <OnboardingChecklist
            steps={steps}
            completedCount={completedCount}
            totalSteps={totalSteps}
            progressPercentage={progressPercentage}
            isComplete={isOnboardingComplete}
            onDismiss={handleDismissOnboarding}
            onStepClick={(stepId) => {
              // Auto-mark step as complete when clicking (navigation handles the rest)
              const step = steps.find((s) => s.id === stepId);
              if (step && !step.isComplete && !step.href) {
                markStepComplete(stepId);
              }
            }}
          />
        </section>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <Icon
              name="AlertCircle"
              size="sm"
              className="text-red-600 dark:text-red-400 mr-2"
              aria-hidden={true}
            />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Row 1: Stat Cards */}
      <section className="mb-6">
        <StatCardGrid stats={statsArray} isLoading={isStatsLoading} />
      </section>

      {/* Row 2: Activity Feed + Quick Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ActivityFeed
            activities={activities}
            isLoading={isActivitiesLoading}
            maxItems={6}
          />
        </div>
        <div data-tour="quick-actions">
          <QuickActions layout="list" />
        </div>
      </section>

      {/* Row 3: Team Overview + Usage Chart */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <TeamOverview data={teamOverview} isLoading={isTeamLoading} />
        </div>
        <div>
          <UsageChart data={usageMetrics} isLoading={isUsageLoading} />
        </div>
      </section>

      {/* Welcome Modal for first-time users */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        userName={account.firstName}
        onGetStarted={handleWelcomeGetStarted}
        onSkip={handleWelcomeSkip}
        onClose={handleWelcomeSkip}
      />
    </div>
  );
}
