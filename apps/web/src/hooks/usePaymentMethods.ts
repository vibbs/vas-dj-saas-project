/**
 * Payment Methods Management Hook
 * Provides payment method data and mutation functions
 *
 * Note: This hook uses mock data as the backend payment methods API
 * is typically handled via Stripe.js directly for security.
 * When Stripe integration is complete, update this hook to use
 * Stripe.js SetupIntents and PaymentMethods APIs.
 */

import { useState, useEffect, useCallback } from 'react';
import { useOrganization } from './useOrganization';

/**
 * Payment method type
 */
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'sepa_debit';
  brand: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  cardholderName?: string;
  bankName?: string;
  createdAt: string;
}

/**
 * Billing address type
 */
export interface BillingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface UsePaymentMethodsResult {
  // Data
  paymentMethods: PaymentMethod[];
  defaultPaymentMethod: PaymentMethod | null;
  billingAddress: BillingAddress | null;

  // Loading states
  isLoading: boolean;
  isUpdating: boolean;

  // Error state
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
  addPaymentMethod: (paymentMethodId: string) => Promise<boolean>;
  removePaymentMethod: (paymentMethodId: string) => Promise<boolean>;
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<boolean>;
  updateBillingAddress: (address: BillingAddress) => Promise<boolean>;
}

// Mock data for development - will be replaced with actual Stripe integration
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2026,
    isDefault: true,
    cardholderName: 'John Doe',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'pm_2',
    type: 'card',
    brand: 'Mastercard',
    last4: '8888',
    expiryMonth: 6,
    expiryYear: 2025,
    isDefault: false,
    cardholderName: 'John Doe',
    createdAt: '2024-03-20T00:00:00Z',
  },
];

const mockBillingAddress: BillingAddress = {
  name: 'John Doe',
  line1: '123 Main Street',
  line2: 'Suite 100',
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94102',
  country: 'United States',
};

export function usePaymentMethods(): UsePaymentMethodsResult {
  const { organizationId } = useOrganization();

  // Data state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  /**
   * Get the default payment method
   */
  const defaultPaymentMethod = paymentMethods.find(pm => pm.isDefault) || null;

  /**
   * Fetch payment methods
   * Note: In production, this would use Stripe.js to fetch customer's payment methods
   */
  const fetchPaymentMethods = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual Stripe API call
      // const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
      // const { paymentMethods } = await stripe.paymentMethods.list({
      //   customer: customerId,
      //   type: 'card',
      // });

      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      setPaymentMethods(mockPaymentMethods);
      setBillingAddress(mockBillingAddress);
    } catch (err: unknown) {
      console.error('Failed to fetch payment methods:', err);
      const error = err as { message?: string };
      setError(error?.message || 'Failed to fetch payment methods');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  /**
   * Add a new payment method
   * Note: In production, this would attach a PaymentMethod to the customer via Stripe
   */
  const addPaymentMethod = useCallback(async (paymentMethodId: string): Promise<boolean> => {
    if (!organizationId) {
      setError('No organization selected');
      return false;
    }

    setIsUpdating(true);
    setError(null);

    try {
      // TODO: Replace with actual Stripe API call
      // const response = await fetch('/api/billing/payment-methods', {
      //   method: 'POST',
      //   body: JSON.stringify({ paymentMethodId }),
      // });

      console.log('Adding payment method:', paymentMethodId);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      // For demo, add a mock card
      const newMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: 'card',
        brand: 'Visa',
        last4: paymentMethodId.slice(-4) || '1234',
        expiryMonth: 12,
        expiryYear: 2027,
        isDefault: paymentMethods.length === 0,
        cardholderName: 'New Card',
        createdAt: new Date().toISOString(),
      };

      setPaymentMethods(prev => [...prev, newMethod]);
      return true;
    } catch (err: unknown) {
      console.error('Failed to add payment method:', err);
      const error = err as { message?: string };
      setError(error?.message || 'Failed to add payment method');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [organizationId, paymentMethods.length]);

  /**
   * Remove a payment method
   */
  const removePaymentMethod = useCallback(async (paymentMethodId: string): Promise<boolean> => {
    if (!organizationId) {
      setError('No organization selected');
      return false;
    }

    const methodToRemove = paymentMethods.find(pm => pm.id === paymentMethodId);
    if (methodToRemove?.isDefault && paymentMethods.length > 1) {
      setError('Cannot remove default payment method. Please set another as default first.');
      return false;
    }

    setIsUpdating(true);
    setError(null);

    try {
      // TODO: Replace with actual Stripe API call
      // await stripe.paymentMethods.detach(paymentMethodId);

      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
      return true;
    } catch (err: unknown) {
      console.error('Failed to remove payment method:', err);
      const error = err as { message?: string };
      setError(error?.message || 'Failed to remove payment method');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [organizationId, paymentMethods]);

  /**
   * Set a payment method as default
   */
  const setDefaultPaymentMethod = useCallback(async (paymentMethodId: string): Promise<boolean> => {
    if (!organizationId) {
      setError('No organization selected');
      return false;
    }

    setIsUpdating(true);
    setError(null);

    try {
      // TODO: Replace with actual Stripe API call
      // await stripe.customers.update(customerId, {
      //   invoice_settings: { default_payment_method: paymentMethodId },
      // });

      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      setPaymentMethods(prev =>
        prev.map(pm => ({
          ...pm,
          isDefault: pm.id === paymentMethodId,
        }))
      );
      return true;
    } catch (err: unknown) {
      console.error('Failed to set default payment method:', err);
      const error = err as { message?: string };
      setError(error?.message || 'Failed to set default payment method');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [organizationId]);

  /**
   * Update billing address
   */
  const updateBillingAddress = useCallback(async (address: BillingAddress): Promise<boolean> => {
    if (!organizationId) {
      setError('No organization selected');
      return false;
    }

    setIsUpdating(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // await fetch('/api/billing/address', {
      //   method: 'PUT',
      //   body: JSON.stringify(address),
      // });

      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      setBillingAddress(address);
      return true;
    } catch (err: unknown) {
      console.error('Failed to update billing address:', err);
      const error = err as { message?: string };
      setError(error?.message || 'Failed to update billing address');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [organizationId]);

  // Initial fetch
  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return {
    // Data
    paymentMethods,
    defaultPaymentMethod,
    billingAddress,

    // Loading states
    isLoading,
    isUpdating,

    // Error state
    error,

    // Actions
    refresh: fetchPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    updateBillingAddress,
  };
}
