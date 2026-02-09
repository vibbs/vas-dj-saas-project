'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SecondarySidebar, Card, Heading, Text, Button, Badge } from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { convertToSecondarySidebarConfig } from '@/utils/navigation-helpers';
import { BillingDrawer } from '@/components/settings/billing/BillingDrawer';

// Mock payment method data - will be replaced with API integration
interface PaymentMethod {
    id: string;
    type: 'card' | 'bank';
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
    cardholderName: string;
}

const mockPaymentMethods: PaymentMethod[] = [
    {
        id: '1',
        type: 'card',
        brand: 'Visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2026,
        isDefault: true,
        cardholderName: 'John Doe',
    },
    {
        id: '2',
        type: 'card',
        brand: 'Mastercard',
        last4: '8888',
        expiryMonth: 6,
        expiryYear: 2025,
        isDefault: false,
        cardholderName: 'John Doe',
    },
];

/**
 * Payment Methods Page
 *
 * Detail page with:
 * - Secondary sidebar for in-section navigation
 * - Payment methods list
 * - Add/edit payment method drawer
 *
 * URL: /settings/billing/payment-methods
 * Drawer: /settings/billing/payment-methods?action=add or ?selected=pm123
 */
export default function PaymentMethodsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selectedMethodId = searchParams.get('selected');
    const action = searchParams.get('action');

    // Get billing settings config
    const billingConfig = React.useMemo(() => {
        return navigationConfig.sections
            .find(s => s.id === 'settings')
            ?.items.find(i => i.id === 'settings-billing');
    }, []);

    // Find selected payment method
    const selectedMethod = mockPaymentMethods.find(pm => pm.id === selectedMethodId);

    // Determine if we're in add mode
    const isAddMode = action === 'add';

    const handleNavigate = React.useCallback((href: string) => {
        router.push(href);
    }, [router]);

    /**
     * Handle card click - open drawer with shallow routing
     */
    const handleCardClick = (method: PaymentMethod) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('action');
        params.set('selected', method.id);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    /**
     * Handle add new card
     */
    const handleAddCard = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('selected');
        params.set('action', 'add');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    /**
     * Get card brand icon/color
     */
    const getCardBrandStyles = (brand: string) => {
        switch (brand.toLowerCase()) {
            case 'visa':
                return { color: '#1A1F71', label: 'Visa' };
            case 'mastercard':
                return { color: '#EB001B', label: 'Mastercard' };
            case 'amex':
                return { color: '#006FCF', label: 'American Express' };
            default:
                return { color: '#6B7280', label: brand };
        }
    };

    if (!billingConfig?.secondarySidebar) {
        return (
            <div className="flex-1 p-6">
                <p className="text-red-500">
                    Error: Secondary sidebar configuration not found.
                    Please check the navigation configuration in packages/core/src/navigation/config/nav-items.ts
                </p>
            </div>
        );
    }

    const secondarySidebarConfig = convertToSecondarySidebarConfig(billingConfig.secondarySidebar);

    return (
        <>
            <div className="flex flex-1">
                {/* Secondary Sidebar */}
                <SecondarySidebar
                    config={secondarySidebarConfig}
                    activePath={pathname}
                    onNavigate={handleNavigate}
                    mode="sidebar"
                />

                {/* Main Content */}
                <div className="flex-1 p-6">
                    <div className="space-y-6">
                        {/* Page Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <Heading level={3}>Payment Methods</Heading>
                                <Text color="muted" size="sm">
                                    Manage your credit cards and payment options
                                </Text>
                            </div>
                            <Button variant="primary" size="md" onClick={handleAddCard}>
                                Add Payment Method
                            </Button>
                        </div>

                        {/* Payment Methods Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {mockPaymentMethods.map((method) => {
                                const brandStyles = getCardBrandStyles(method.brand);
                                return (
                                    <Card
                                        key={method.id}
                                        onClick={() => handleCardClick(method)}
                                        className="cursor-pointer hover:shadow-md transition-shadow"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-12 h-8 rounded flex items-center justify-center text-white text-xs font-bold"
                                                        style={{ backgroundColor: brandStyles.color }}
                                                    >
                                                        {brandStyles.label.substring(0, 4).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <Text weight="medium">{method.brand}</Text>
                                                        <Text color="muted" size="sm">
                                                            **** **** **** {method.last4}
                                                        </Text>
                                                    </div>
                                                </div>
                                                {method.isDefault && (
                                                    <Badge variant="secondary">Default</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <Text color="muted">{method.cardholderName}</Text>
                                                <Text color="muted">
                                                    Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                                                </Text>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Empty State */}
                        {mockPaymentMethods.length === 0 && (
                            <Card>
                                <div className="p-12 text-center">
                                    <Heading level={4} style={{ marginBottom: '0.5rem' }}>
                                        No payment methods
                                    </Heading>
                                    <Text color="muted" style={{ marginBottom: '1rem' }}>
                                        Add a payment method to start your subscription
                                    </Text>
                                    <Button variant="primary" size="md" onClick={handleAddCard}>
                                        Add Payment Method
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Billing Address Section */}
                        <Card>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <Heading level={5}>Billing Address</Heading>
                                    <Button variant="outline" size="sm">
                                        Edit
                                    </Button>
                                </div>
                                <div className="text-sm space-y-1">
                                    <Text>John Doe</Text>
                                    <Text color="muted">123 Main Street</Text>
                                    <Text color="muted">San Francisco, CA 94102</Text>
                                    <Text color="muted">United States</Text>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Payment Method Detail Drawer */}
            <BillingDrawer
                title={selectedMethod?.brand ? `${selectedMethod.brand} ending in ${selectedMethod.last4}` : 'Payment Method'}
            >
                {selectedMethod && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-16 h-10 rounded flex items-center justify-center text-white text-sm font-bold"
                                    style={{ backgroundColor: getCardBrandStyles(selectedMethod.brand).color }}
                                >
                                    {selectedMethod.brand.substring(0, 4).toUpperCase()}
                                </div>
                                {selectedMethod.isDefault && (
                                    <Badge variant="secondary">Default</Badge>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Text color="muted" size="sm">Card Number</Text>
                                <Text weight="medium">**** **** **** {selectedMethod.last4}</Text>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Text color="muted" size="sm">Expiry Date</Text>
                                    <Text weight="medium">
                                        {selectedMethod.expiryMonth.toString().padStart(2, '0')}/{selectedMethod.expiryYear}
                                    </Text>
                                </div>
                                <div>
                                    <Text color="muted" size="sm">Brand</Text>
                                    <Text weight="medium">{selectedMethod.brand}</Text>
                                </div>
                            </div>
                            <div>
                                <Text color="muted" size="sm">Cardholder Name</Text>
                                <Text weight="medium">{selectedMethod.cardholderName}</Text>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t">
                            {!selectedMethod.isDefault && (
                                <Button variant="outline" size="md" style={{ width: '100%' }}>
                                    Set as Default
                                </Button>
                            )}
                            <Button variant="destructive" size="md" style={{ width: '100%' }}>
                                Remove Card
                            </Button>
                        </div>
                    </div>
                )}
            </BillingDrawer>

            {/* Add Payment Method Drawer - using action query param */}
            {isAddMode && (
                <BillingDrawer
                    title="Add Payment Method"
                    queryParam="action"
                >
                    <div className="space-y-6">
                        <Text color="muted">
                            Add a new credit or debit card to your account. Your card information is securely stored and encrypted.
                        </Text>

                        {/* Placeholder form - will be replaced with actual Stripe Elements form */}
                        <div className="space-y-4">
                            <div>
                                <Text size="sm" weight="medium" style={{ marginBottom: '0.25rem' }}>
                                    Card Number
                                </Text>
                                <div className="h-10 border rounded-md bg-muted/20 flex items-center px-3">
                                    <Text color="muted" size="sm">**** **** **** ****</Text>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Text size="sm" weight="medium" style={{ marginBottom: '0.25rem' }}>
                                        Expiry Date
                                    </Text>
                                    <div className="h-10 border rounded-md bg-muted/20 flex items-center px-3">
                                        <Text color="muted" size="sm">MM/YY</Text>
                                    </div>
                                </div>
                                <div>
                                    <Text size="sm" weight="medium" style={{ marginBottom: '0.25rem' }}>
                                        CVC
                                    </Text>
                                    <div className="h-10 border rounded-md bg-muted/20 flex items-center px-3">
                                        <Text color="muted" size="sm">***</Text>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Text size="sm" weight="medium" style={{ marginBottom: '0.25rem' }}>
                                    Cardholder Name
                                </Text>
                                <div className="h-10 border rounded-md bg-muted/20 flex items-center px-3">
                                    <Text color="muted" size="sm">Name on card</Text>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button variant="primary" size="md" style={{ flex: 1 }}>
                                Add Card
                            </Button>
                        </div>

                        <Text color="muted" size="sm" className="text-center">
                            Your payment information is processed securely via Stripe.
                        </Text>
                    </div>
                </BillingDrawer>
            )}
        </>
    );
}
