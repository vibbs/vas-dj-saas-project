/**
 * BillingService
 * High-level service for billing, subscription, and invoice management
 */

import {
  v1BillingPlansList,
  v1BillingPlansRetrieve,
  v1BillingSubscriptionsList,
  v1BillingSubscriptionsCurrentRetrieve,
  v1BillingSubscriptionsOverviewRetrieve,
  v1BillingSubscriptionsRetrieve,
  v1BillingSubscriptionsCreateCheckoutSessionCreate,
  v1BillingSubscriptionsManageSubscriptionCreate,
  v1BillingInvoicesList,
  v1BillingInvoicesRetrieve,
  type v1BillingPlansListResponse,
  type v1BillingPlansRetrieveResponse,
  type v1BillingSubscriptionsListResponse,
  type v1BillingSubscriptionsCurrentRetrieveResponse,
  type v1BillingSubscriptionsOverviewRetrieveResponse,
  type v1BillingSubscriptionsRetrieveResponse,
  type v1BillingSubscriptionsCreateCheckoutSessionCreateResponse,
  type v1BillingSubscriptionsManageSubscriptionCreateResponse,
  type v1BillingInvoicesListResponse,
  type v1BillingInvoicesRetrieveResponse,
} from '../generated/billing/billing';
import type {
  V1BillingPlansListParams,
  V1BillingSubscriptionsListParams,
  V1BillingInvoicesListParams,
  SubscriptionRequest,
} from '../generated/api.schemas';

/**
 * Manage subscription action types
 */
export type ManageSubscriptionAction = 'cancel' | 'reactivate' | 'upgrade' | 'downgrade';

/**
 * Request to manage (cancel/reactivate/change) a subscription
 */
export interface ManageSubscriptionRequest {
  action: ManageSubscriptionAction;
  planId?: string; // Required for upgrade/downgrade
  cancelAtPeriodEnd?: boolean; // For cancel action
}

export const BillingService = {
  // === Plans ===

  /**
   * List all available billing plans
   */
  getPlans: (
    params?: V1BillingPlansListParams
  ): Promise<v1BillingPlansListResponse> => {
    return v1BillingPlansList(params);
  },

  /**
   * Retrieve a specific plan by ID
   */
  getPlan: (id: string): Promise<v1BillingPlansRetrieveResponse> => {
    return v1BillingPlansRetrieve(id);
  },

  // === Subscriptions ===

  /**
   * List all subscriptions for the current organization
   */
  listSubscriptions: (
    params?: V1BillingSubscriptionsListParams
  ): Promise<v1BillingSubscriptionsListResponse> => {
    return v1BillingSubscriptionsList(params);
  },

  /**
   * Get the current active subscription for the organization
   */
  getCurrentSubscription: (): Promise<v1BillingSubscriptionsCurrentRetrieveResponse> => {
    return v1BillingSubscriptionsCurrentRetrieve();
  },

  /**
   * Get billing overview including subscription, invoices summary, and usage
   */
  getBillingOverview: (): Promise<v1BillingSubscriptionsOverviewRetrieveResponse> => {
    return v1BillingSubscriptionsOverviewRetrieve();
  },

  /**
   * Retrieve a specific subscription by ID
   */
  getSubscription: (id: string): Promise<v1BillingSubscriptionsRetrieveResponse> => {
    return v1BillingSubscriptionsRetrieve(id);
  },

  /**
   * Create a checkout session for subscribing to a plan
   * Returns a checkout URL to redirect the user to
   */
  createCheckoutSession: (
    data: SubscriptionRequest
  ): Promise<v1BillingSubscriptionsCreateCheckoutSessionCreateResponse> => {
    return v1BillingSubscriptionsCreateCheckoutSessionCreate(data);
  },

  /**
   * Manage an existing subscription (cancel, reactivate, etc.)
   */
  manageSubscription: (
    subscriptionId: string,
    data: SubscriptionRequest
  ): Promise<v1BillingSubscriptionsManageSubscriptionCreateResponse> => {
    return v1BillingSubscriptionsManageSubscriptionCreate(subscriptionId, data);
  },

  /**
   * Cancel the current subscription
   * @param subscriptionId - The subscription ID to cancel
   * @param cancelImmediately - If false, cancels at period end (default). If true, cancels immediately.
   */
  cancelSubscription: (
    subscriptionId: string,
    cancelImmediately = false
  ): Promise<v1BillingSubscriptionsManageSubscriptionCreateResponse> => {
    return v1BillingSubscriptionsManageSubscriptionCreate(subscriptionId, {
      organization: '', // Will be filled by the backend from context
      plan: '', // Not changing plan
      status: 'canceled',
      cancelAtPeriodEnd: !cancelImmediately,
    });
  },

  /**
   * Reactivate a canceled subscription (before period end)
   */
  reactivateSubscription: (
    subscriptionId: string
  ): Promise<v1BillingSubscriptionsManageSubscriptionCreateResponse> => {
    return v1BillingSubscriptionsManageSubscriptionCreate(subscriptionId, {
      organization: '', // Will be filled by the backend from context
      plan: '', // Not changing plan
      status: 'active',
      cancelAtPeriodEnd: false,
    });
  },

  // === Invoices ===

  /**
   * List all invoices for the current organization
   */
  getInvoices: (
    params?: V1BillingInvoicesListParams
  ): Promise<v1BillingInvoicesListResponse> => {
    return v1BillingInvoicesList(params);
  },

  /**
   * Retrieve a specific invoice by ID
   */
  getInvoice: (id: string): Promise<v1BillingInvoicesRetrieveResponse> => {
    return v1BillingInvoicesRetrieve(id);
  },

  // === Payment Methods ===
  // Note: Payment method endpoints are typically handled via Stripe.js directly
  // for security reasons. These placeholder methods would be implemented when
  // the backend provides payment method management endpoints.

  /**
   * Get payment methods for the organization
   * Note: This is a placeholder - actual implementation depends on backend support
   */
  getPaymentMethods: async (): Promise<{ data: unknown[]; status: number }> => {
    // Payment methods are typically fetched via Stripe.js SetupIntent
    // This is a placeholder that returns an empty array
    console.warn('getPaymentMethods: Backend endpoint not yet implemented. Use Stripe.js directly.');
    return { data: [], status: 200 };
  },

  /**
   * Add a new payment method
   * Note: This is a placeholder - actual implementation uses Stripe.js Elements
   */
  addPaymentMethod: async (_paymentMethodId: string): Promise<{ success: boolean; status: number }> => {
    console.warn('addPaymentMethod: Use Stripe.js Elements and SetupIntent for secure card collection.');
    return { success: false, status: 501 };
  },

  /**
   * Remove a payment method
   * Note: This is a placeholder - actual implementation depends on backend support
   */
  removePaymentMethod: async (_paymentMethodId: string): Promise<{ success: boolean; status: number }> => {
    console.warn('removePaymentMethod: Backend endpoint not yet implemented.');
    return { success: false, status: 501 };
  },

  /**
   * Set default payment method
   * Note: This is a placeholder - actual implementation depends on backend support
   */
  setDefaultPaymentMethod: async (_paymentMethodId: string): Promise<{ success: boolean; status: number }> => {
    console.warn('setDefaultPaymentMethod: Backend endpoint not yet implemented.');
    return { success: false, status: 501 };
  },
} as const;
