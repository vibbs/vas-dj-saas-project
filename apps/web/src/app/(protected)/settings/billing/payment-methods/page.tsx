'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SecondarySidebar, Card, Heading, Text, Button, Badge, Spinner, Dialog, Input } from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { convertToSecondarySidebarConfig } from '@/utils/navigation-helpers';
import { BillingDrawer } from '@/components/settings/billing/BillingDrawer';
import { usePaymentMethods, type PaymentMethod, type BillingAddress } from '@/hooks/usePaymentMethods';

/**
 * Payment Methods Page
 *
 * Detail page with:
 * - Secondary sidebar for in-section navigation
 * - Payment methods list with default indicator
 * - Add/edit payment method drawer
 * - Billing address management
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

    const {
        paymentMethods,
        defaultPaymentMethod,
        billingAddress,
        isLoading,
        isUpdating,
        error,
        refresh,
        addPaymentMethod,
        removePaymentMethod,
        setDefaultPaymentMethod,
        updateBillingAddress,
    } = usePaymentMethods();

    // Dialog state for remove confirmation
    const [showRemoveDialog, setShowRemoveDialog] = React.useState(false);
    const [methodToRemove, setMethodToRemove] = React.useState<PaymentMethod | null>(null);

    // Edit billing address state
    const [showEditAddressDialog, setShowEditAddressDialog] = React.useState(false);
    const [editedAddress, setEditedAddress] = React.useState<BillingAddress | null>(null);

    // Get billing settings config
    const billingConfig = React.useMemo(() => {
        return navigationConfig.sections
            .find(s => s.id === 'settings')
            ?.items.find(i => i.id === 'settings-billing');
    }, []);

    // Find selected payment method
    const selectedMethod = paymentMethods.find(pm => pm.id === selectedMethodId);

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
     * Handle close drawer
     */
    const handleCloseDrawer = () => {
        router.push(pathname, { scroll: false });
    };

    /**
     * Handle set as default
     */
    const handleSetDefault = async (method: PaymentMethod) => {
        const success = await setDefaultPaymentMethod(method.id);
        if (success) {
            console.log('Set as default:', method.id);
        }
    };

    /**
     * Handle remove payment method
     */
    const handleRemove = async () => {
        if (!methodToRemove) return;

        const success = await removePaymentMethod(methodToRemove.id);
        if (success) {
            setShowRemoveDialog(false);
            setMethodToRemove(null);
            handleCloseDrawer();
        }
    };

    /**
     * Handle save billing address
     */
    const handleSaveAddress = async () => {
        if (!editedAddress) return;

        const success = await updateBillingAddress(editedAddress);
        if (success) {
            setShowEditAddressDialog(false);
            setEditedAddress(null);
        }
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
            case 'american express':
                return { color: '#006FCF', label: 'Amex' };
            case 'discover':
                return { color: '#FF6000', label: 'Discover' };
            default:
                return { color: '#6B7280', label: brand };
        }
    };

    /**
     * Check if card is expiring soon (within 3 months)
     */
    const isExpiringSoon = (method: PaymentMethod): boolean => {
        if (!method.expiryMonth || !method.expiryYear) return false;

        const now = new Date();
        const expiryDate = new Date(method.expiryYear, method.expiryMonth - 1);
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

        return expiryDate <= threeMonthsFromNow && expiryDate >= now;
    };

    /**
     * Check if card is expired
     */
    const isExpired = (method: PaymentMethod): boolean => {
        if (!method.expiryMonth || !method.expiryYear) return false;

        const now = new Date();
        const expiryDate = new Date(method.expiryYear, method.expiryMonth);
        return expiryDate < now;
    };

    if (!billingConfig?.secondarySidebar) {
        return (
            <div className="flex-1 p-6">
                <p style={{ color: 'var(--color-destructive)' }}>
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

                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
                                <Spinner size="lg" />
                                <Text color="muted">Loading payment methods...</Text>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <Card>
                                <div className="p-6 text-center">
                                    <Text color="muted">{error}</Text>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={refresh}
                                        style={{ marginTop: '1rem' }}
                                    >
                                        Try Again
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Payment Methods Grid */}
                        {!isLoading && paymentMethods.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {paymentMethods.map((method) => {
                                    const brandStyles = getCardBrandStyles(method.brand);
                                    const expiringSoon = isExpiringSoon(method);
                                    const expired = isExpired(method);

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
                                                    <div className="flex flex-col items-end gap-1">
                                                        {method.isDefault && (
                                                            <Badge variant="secondary">Default</Badge>
                                                        )}
                                                        {expired && (
                                                            <Badge variant="destructive">Expired</Badge>
                                                        )}
                                                        {expiringSoon && !expired && (
                                                            <Badge variant="warning">Expiring Soon</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <Text color="muted">{method.cardholderName}</Text>
                                                    {method.expiryMonth && method.expiryYear && (
                                                        <Text color={expired ? 'muted' : 'muted'}>
                                                            Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                                                        </Text>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && paymentMethods.length === 0 && !error && (
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
                        {billingAddress && (
                            <Card>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <Heading level={5}>Billing Address</Heading>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setEditedAddress(billingAddress);
                                                setShowEditAddressDialog(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                    <div className="text-sm space-y-1">
                                        <Text>{billingAddress.name}</Text>
                                        <Text color="muted">{billingAddress.line1}</Text>
                                        {billingAddress.line2 && (
                                            <Text color="muted">{billingAddress.line2}</Text>
                                        )}
                                        <Text color="muted">
                                            {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}
                                        </Text>
                                        <Text color="muted">{billingAddress.country}</Text>
                                    </div>
                                </div>
                            </Card>
                        )}
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
                                <div className="flex flex-col gap-1">
                                    {selectedMethod.isDefault && (
                                        <Badge variant="secondary">Default</Badge>
                                    )}
                                    {isExpired(selectedMethod) && (
                                        <Badge variant="destructive">Expired</Badge>
                                    )}
                                </div>
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
                                        {selectedMethod.expiryMonth?.toString().padStart(2, '0')}/{selectedMethod.expiryYear}
                                    </Text>
                                </div>
                                <div>
                                    <Text color="muted" size="sm">Brand</Text>
                                    <Text weight="medium">{selectedMethod.brand}</Text>
                                </div>
                            </div>
                            {selectedMethod.cardholderName && (
                                <div>
                                    <Text color="muted" size="sm">Cardholder Name</Text>
                                    <Text weight="medium">{selectedMethod.cardholderName}</Text>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 pt-4 border-t">
                            {!selectedMethod.isDefault && (
                                <Button
                                    variant="outline"
                                    size="md"
                                    style={{ width: '100%' }}
                                    onClick={() => handleSetDefault(selectedMethod)}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? 'Updating...' : 'Set as Default'}
                                </Button>
                            )}
                            <Button
                                variant="destructive"
                                size="md"
                                style={{ width: '100%' }}
                                onClick={() => {
                                    setMethodToRemove(selectedMethod);
                                    setShowRemoveDialog(true);
                                }}
                                disabled={isUpdating || (selectedMethod.isDefault && paymentMethods.length > 1)}
                            >
                                Remove Card
                            </Button>
                            {selectedMethod.isDefault && paymentMethods.length > 1 && (
                                <Text color="muted" size="sm" className="text-center">
                                    Set another card as default before removing this one.
                                </Text>
                            )}
                        </div>
                    </div>
                )}
            </BillingDrawer>

            {/* Add Payment Method Drawer */}
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
                                <div className="h-10 border rounded-md bg-[--color-muted] flex items-center px-3">
                                    <Text color="muted" size="sm">Stripe Elements will be integrated here</Text>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Text size="sm" weight="medium" style={{ marginBottom: '0.25rem' }}>
                                        Expiry Date
                                    </Text>
                                    <div className="h-10 border rounded-md bg-[--color-muted] flex items-center px-3">
                                        <Text color="muted" size="sm">MM/YY</Text>
                                    </div>
                                </div>
                                <div>
                                    <Text size="sm" weight="medium" style={{ marginBottom: '0.25rem' }}>
                                        CVC
                                    </Text>
                                    <div className="h-10 border rounded-md bg-[--color-muted] flex items-center px-3">
                                        <Text color="muted" size="sm">***</Text>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Text size="sm" weight="medium" style={{ marginBottom: '0.25rem' }}>
                                    Cardholder Name
                                </Text>
                                <div className="h-10 border rounded-md bg-[--color-muted] flex items-center px-3">
                                    <Text color="muted" size="sm">Name on card</Text>
                                </div>
                            </div>
                        </div>

                        <div
                            className="p-4 rounded-md"
                            style={{
                                backgroundColor: 'color-mix(in srgb, var(--color-info) 10%, transparent)',
                                border: '1px solid color-mix(in srgb, var(--color-info) 30%, transparent)',
                            }}
                        >
                            <Text size="sm" style={{ color: 'var(--color-info)' }}>
                                Note: Stripe Elements integration required for secure card collection.
                                This is a placeholder UI.
                            </Text>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="outline"
                                size="md"
                                style={{ flex: 1 }}
                                onClick={handleCloseDrawer}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                size="md"
                                style={{ flex: 1 }}
                                disabled
                            >
                                Add Card
                            </Button>
                        </div>

                        <Text color="muted" size="sm" className="text-center">
                            Your payment information is processed securely via Stripe.
                        </Text>
                    </div>
                </BillingDrawer>
            )}

            {/* Remove Payment Method Dialog */}
            <Dialog
                isOpen={showRemoveDialog}
                onClose={() => {
                    setShowRemoveDialog(false);
                    setMethodToRemove(null);
                }}
                title="Remove Payment Method?"
            >
                <div className="space-y-4">
                    <Text>
                        Are you sure you want to remove {methodToRemove?.brand} ending in {methodToRemove?.last4}?
                        This action cannot be undone.
                    </Text>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRemoveDialog(false);
                                setMethodToRemove(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRemove}
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Removing...' : 'Remove'}
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Edit Billing Address Dialog */}
            <Dialog
                isOpen={showEditAddressDialog}
                onClose={() => {
                    setShowEditAddressDialog(false);
                    setEditedAddress(null);
                }}
                title="Edit Billing Address"
            >
                {editedAddress && (
                    <div className="space-y-4">
                        <div>
                            <Text size="sm" weight="medium" style={{ marginBottom: '0.25rem' }}>
                                Full Name
                            </Text>
                            <Input
                                value={editedAddress.name}
                                onChange={(e) => setEditedAddress({ ...editedAddress, name: e.target.value })}
                                placeholder="Full name"
                            />
                        </div>
                        <div>
                            <Text size="sm" weight="medium" style={{ marginBottom: '0.25rem' }}>
                                Address Line 1
                            </Text>
                            <Input
                                value={editedAddress.line1}
                                onChange={(e) => setEditedAddress({ ...editedAddress, line1: e.target.value })}
                                placeholder="Street address"
                            />
                        </div>
                        <div>
                            <Text size="sm" weight="medium" style={{ marginBottom: '0.25rem' }}>
                                Address Line 2 (optional)
                            </Text>
                            <Input
                                value={editedAddress.line2 || ''}
                                onChange={(e) => setEditedAddress({ ...editedAddress, line2: e.target.value })}
                                placeholder="Apartment, suite, etc."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Text size="sm" weight="medium" style={{ marginBottom: '0.25rem' }}>
                                    City
                                </Text>
                                <Input
                                    value={editedAddress.city}
                                    onChange={(e) => setEditedAddress({ ...editedAddress, city: e.target.value })}
                                    placeholder="City"
                                />
                            </div>
                            <div>
                                <Text size="sm" weight="medium" style={{ marginBottom: '0.25rem' }}>
                                    State
                                </Text>
                                <Input
                                    value={editedAddress.state}
                                    onChange={(e) => setEditedAddress({ ...editedAddress, state: e.target.value })}
                                    placeholder="State"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Text size="sm" weight="medium" style={{ marginBottom: '0.25rem' }}>
                                    Postal Code
                                </Text>
                                <Input
                                    value={editedAddress.postalCode}
                                    onChange={(e) => setEditedAddress({ ...editedAddress, postalCode: e.target.value })}
                                    placeholder="Postal code"
                                />
                            </div>
                            <div>
                                <Text size="sm" weight="medium" style={{ marginBottom: '0.25rem' }}>
                                    Country
                                </Text>
                                <Input
                                    value={editedAddress.country}
                                    onChange={(e) => setEditedAddress({ ...editedAddress, country: e.target.value })}
                                    placeholder="Country"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowEditAddressDialog(false);
                                    setEditedAddress(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSaveAddress}
                                disabled={isUpdating}
                            >
                                {isUpdating ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>
        </>
    );
}
