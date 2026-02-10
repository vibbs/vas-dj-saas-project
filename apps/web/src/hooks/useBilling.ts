/**
 * Billing Management Hook
 * Provides billing data and mutation functions for subscription and plan management
 */

import { useState, useEffect, useCallback } from 'react';
import {
  BillingService,
  type Plan,
  type Subscription,
  type Invoice,
} from '@vas-dj-saas/api-client';
import { useOrganization } from './useOrganization';

interface BillingOverview {
  subscription: Subscription | null;
  recentInvoices: Invoice[];
  totalSpentThisYear: number;
  outstandingBalance: number;
}

interface UseBillingResult {
  // Data
  currentSubscription: Subscription | null;
  plans: Plan[];
  invoices: Invoice[];
  billingOverview: BillingOverview | null;

  // Loading states
  isLoading: boolean;
  isLoadingPlans: boolean;
  isLoadingInvoices: boolean;
  isUpdating: boolean;

  // Error state
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
  refreshPlans: () => Promise<void>;
  refreshInvoices: () => Promise<void>;
  createCheckoutSession: (planId: string) => Promise<{ checkoutUrl?: string; success: boolean }>;
  cancelSubscription: (cancelImmediately?: boolean) => Promise<boolean>;
  reactivateSubscription: () => Promise<boolean>;
  changePlan: (newPlanId: string) => Promise<boolean>;
}

export function useBilling(): UseBillingResult {
  const { organizationId } = useOrganization();

  // Data state
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [billingOverview, setBillingOverview] = useState<BillingOverview | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch current subscription
   */
  const fetchCurrentSubscription = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await BillingService.getCurrentSubscription();

      if (response.status >= 200 && response.status < 300 && response.data) {
        const data = response.data as { data?: Subscription };
        setCurrentSubscription(data.data || null);
      } else if (response.status === 404) {
        // No subscription found - this is okay
        setCurrentSubscription(null);
      } else {
        setError('Failed to fetch subscription');
      }
    } catch (err: unknown) {
      console.error('Failed to fetch subscription:', err);
      const error = err as { data?: { detail?: string }; message?: string };
      // 404 means no subscription, which is valid
      if ((error as { status?: number })?.status !== 404) {
        setError(error?.data?.detail || error?.message || 'Failed to fetch subscription');
      }
      setCurrentSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  /**
   * Fetch available plans
   */
  const fetchPlans = useCallback(async () => {
    setIsLoadingPlans(true);

    try {
      const response = await BillingService.getPlans();

      if (response.status >= 200 && response.status < 300 && response.data) {
        const data = response.data as { data?: Plan[][] };
        // Handle nested array structure from pagination
        const planList = data.data?.flat() || [];
        setPlans(planList);
      } else {
        console.error('Failed to fetch plans');
      }
    } catch (err: unknown) {
      console.error('Failed to fetch plans:', err);
    } finally {
      setIsLoadingPlans(false);
    }
  }, []);

  /**
   * Fetch invoices
   */
  const fetchInvoices = useCallback(async () => {
    if (!organizationId) {
      setIsLoadingInvoices(false);
      return;
    }

    setIsLoadingInvoices(true);

    try {
      const response = await BillingService.getInvoices();

      if (response.status >= 200 && response.status < 300 && response.data) {
        const data = response.data as { data?: Invoice[][] };
        // Handle nested array structure from pagination
        const invoiceList = data.data?.flat() || [];
        setInvoices(invoiceList);

        // Calculate billing overview
        const thisYear = new Date().getFullYear();
        const thisYearInvoices = invoiceList.filter((inv: Invoice) => {
          const invoiceDate = new Date(inv.createdAt);
          return invoiceDate.getFullYear() === thisYear;
        });

        const totalSpent = thisYearInvoices
          .filter((inv: Invoice) => inv.status === 'paid')
          .reduce((sum: number, inv: Invoice) => sum + parseFloat(inv.total), 0);

        const outstanding = invoiceList
          .filter((inv: Invoice) => inv.status === 'open')
          .reduce((sum: number, inv: Invoice) => sum + parseFloat(inv.total), 0);

        setBillingOverview({
          subscription: currentSubscription,
          recentInvoices: invoiceList.slice(0, 5),
          totalSpentThisYear: totalSpent,
          outstandingBalance: outstanding,
        });
      } else {
        console.error('Failed to fetch invoices');
      }
    } catch (err: unknown) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setIsLoadingInvoices(false);
    }
  }, [organizationId, currentSubscription]);

  /**
   * Refresh all billing data
   */
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchCurrentSubscription(),
      fetchPlans(),
      fetchInvoices(),
    ]);
  }, [fetchCurrentSubscription, fetchPlans, fetchInvoices]);

  /**
   * Create checkout session for a plan
   */
  const createCheckoutSession = useCallback(async (planId: string): Promise<{ checkoutUrl?: string; success: boolean }> => {
    if (!organizationId) {
      setError('No organization selected');
      return { success: false };
    }

    setIsUpdating(true);
    setError(null);

    try {
      const response = await BillingService.createCheckoutSession({
        organization: organizationId,
        plan: planId,
      });

      if (response.status >= 200 && response.status < 300 && response.data) {
        const data = response.data as { data?: { checkoutUrl?: string } };
        // The response may contain a checkout URL to redirect to
        return { checkoutUrl: data.data?.checkoutUrl, success: true };
      }
      setError('Failed to create checkout session');
      return { success: false };
    } catch (err: unknown) {
      console.error('Failed to create checkout session:', err);
      const error = err as { data?: { detail?: string }; message?: string };
      setError(error?.data?.detail || error?.message || 'Failed to create checkout session');
      return { success: false };
    } finally {
      setIsUpdating(false);
    }
  }, [organizationId]);

  /**
   * Cancel the current subscription
   */
  const cancelSubscription = useCallback(async (cancelImmediately = false): Promise<boolean> => {
    if (!currentSubscription) {
      setError('No active subscription to cancel');
      return false;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const response = await BillingService.cancelSubscription(
        currentSubscription.id,
        cancelImmediately
      );

      if (response.status >= 200 && response.status < 300) {
        // Refresh subscription data
        await fetchCurrentSubscription();
        return true;
      }
      setError('Failed to cancel subscription');
      return false;
    } catch (err: unknown) {
      console.error('Failed to cancel subscription:', err);
      const error = err as { data?: { detail?: string }; message?: string };
      setError(error?.data?.detail || error?.message || 'Failed to cancel subscription');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [currentSubscription, fetchCurrentSubscription]);

  /**
   * Reactivate a canceled subscription
   */
  const reactivateSubscription = useCallback(async (): Promise<boolean> => {
    if (!currentSubscription) {
      setError('No subscription to reactivate');
      return false;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const response = await BillingService.reactivateSubscription(currentSubscription.id);

      if (response.status >= 200 && response.status < 300) {
        // Refresh subscription data
        await fetchCurrentSubscription();
        return true;
      }
      setError('Failed to reactivate subscription');
      return false;
    } catch (err: unknown) {
      console.error('Failed to reactivate subscription:', err);
      const error = err as { data?: { detail?: string }; message?: string };
      setError(error?.data?.detail || error?.message || 'Failed to reactivate subscription');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [currentSubscription, fetchCurrentSubscription]);

  /**
   * Change to a different plan (upgrade/downgrade)
   */
  const changePlan = useCallback(async (newPlanId: string): Promise<boolean> => {
    if (!currentSubscription || !organizationId) {
      // If no subscription, create a checkout session instead
      const result = await createCheckoutSession(newPlanId);
      return result.success;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const response = await BillingService.manageSubscription(currentSubscription.id, {
        organization: organizationId,
        plan: newPlanId,
        status: 'active',
      });

      if (response.status >= 200 && response.status < 300) {
        // Refresh subscription data
        await fetchCurrentSubscription();
        return true;
      }
      setError('Failed to change plan');
      return false;
    } catch (err: unknown) {
      console.error('Failed to change plan:', err);
      const error = err as { data?: { detail?: string }; message?: string };
      setError(error?.data?.detail || error?.message || 'Failed to change plan');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [currentSubscription, organizationId, createCheckoutSession, fetchCurrentSubscription]);

  // Initial fetch
  useEffect(() => {
    fetchCurrentSubscription();
    fetchPlans();
  }, [fetchCurrentSubscription, fetchPlans]);

  // Fetch invoices after subscription is loaded
  useEffect(() => {
    if (!isLoading) {
      fetchInvoices();
    }
  }, [isLoading, fetchInvoices]);

  return {
    // Data
    currentSubscription,
    plans,
    invoices,
    billingOverview,

    // Loading states
    isLoading,
    isLoadingPlans,
    isLoadingInvoices,
    isUpdating,

    // Error state
    error,

    // Actions
    refresh,
    refreshPlans: fetchPlans,
    refreshInvoices: fetchInvoices,
    createCheckoutSession,
    cancelSubscription,
    reactivateSubscription,
    changePlan,
  };
}
