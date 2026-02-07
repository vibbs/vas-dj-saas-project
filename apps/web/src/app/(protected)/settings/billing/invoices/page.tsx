'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SecondarySidebar, Card, Heading, Text, Button, Table, Badge } from '@vas-dj-saas/ui';
import type { TableColumn } from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { convertToSecondarySidebarConfig } from '@/utils/navigation-helpers';
import { BillingDrawer } from '@/components/settings/billing/BillingDrawer';

// Mock invoice data - will be replaced with API integration
interface Invoice {
    id: string;
    invoiceNumber: string;
    date: string;
    dueDate: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    description: string;
}

const mockInvoices: Invoice[] = [
    {
        id: '1',
        invoiceNumber: 'INV-2025-001',
        date: '2025-01-15',
        dueDate: '2025-01-30',
        amount: 29.00,
        status: 'paid',
        description: 'Pro Plan - January 2025',
    },
    {
        id: '2',
        invoiceNumber: 'INV-2024-012',
        date: '2024-12-15',
        dueDate: '2024-12-30',
        amount: 29.00,
        status: 'paid',
        description: 'Pro Plan - December 2024',
    },
    {
        id: '3',
        invoiceNumber: 'INV-2024-011',
        date: '2024-11-15',
        dueDate: '2024-11-30',
        amount: 29.00,
        status: 'paid',
        description: 'Pro Plan - November 2024',
    },
    {
        id: '4',
        invoiceNumber: 'INV-2024-010',
        date: '2024-10-15',
        dueDate: '2024-10-30',
        amount: 29.00,
        status: 'paid',
        description: 'Pro Plan - October 2024',
    },
    {
        id: '5',
        invoiceNumber: 'INV-2024-009',
        date: '2024-09-15',
        dueDate: '2024-09-30',
        amount: 29.00,
        status: 'paid',
        description: 'Pro Plan - September 2024',
    },
];

/**
 * Invoices Page
 *
 * Detail page with:
 * - Secondary sidebar for in-section navigation
 * - Invoice history table
 * - Invoice detail drawer
 *
 * URL: /settings/billing/invoices
 * Drawer: /settings/billing/invoices?selected=inv123
 */
export default function InvoicesPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selectedInvoiceId = searchParams.get('selected');

    // Get billing settings config
    const billingConfig = React.useMemo(() => {
        return navigationConfig.sections
            .find(s => s.id === 'settings')
            ?.items.find(i => i.id === 'settings-billing');
    }, []);

    // Find selected invoice
    const selectedInvoice = mockInvoices.find(inv => inv.id === selectedInvoiceId);

    const handleNavigate = React.useCallback((href: string) => {
        router.push(href);
    }, [router]);

    /**
     * Handle row click - open drawer with shallow routing
     */
    const handleRowClick = (invoice: Invoice) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('selected', invoice.id);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Table columns
    const columns: TableColumn<Invoice>[] = [
        {
            key: 'invoiceNumber',
            title: 'Invoice',
            sortable: true,
            render: (value) => <span className="font-medium">{String(value)}</span>,
        },
        {
            key: 'date',
            title: 'Date',
            sortable: true,
            render: (value) => <span>{String(value)}</span>,
        },
        {
            key: 'description',
            title: 'Description',
            render: (value) => <span>{String(value)}</span>,
        },
        {
            key: 'amount',
            title: 'Amount',
            sortable: true,
            render: (value) => <span>${Number(value).toFixed(2)}</span>,
        },
        {
            key: 'status',
            title: 'Status',
            render: (value, invoice) => (
                <Badge
                    variant={
                        invoice.status === 'paid' ? 'success' :
                            invoice.status === 'pending' ? 'warning' :
                                'destructive'
                    }
                >
                    {invoice.status}
                </Badge>
            ),
        },
    ];

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
                                <Heading level={3}>Invoices</Heading>
                                <Text color="muted" size="sm">
                                    View and download your billing history
                                </Text>
                            </div>
                            <Button variant="outline" size="md">
                                Download All
                            </Button>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <div className="p-4">
                                    <Text color="muted" size="sm">Total This Year</Text>
                                    <Heading level={4}>$145.00</Heading>
                                </div>
                            </Card>
                            <Card>
                                <div className="p-4">
                                    <Text color="muted" size="sm">Invoices Paid</Text>
                                    <Heading level={4}>5</Heading>
                                </div>
                            </Card>
                            <Card>
                                <div className="p-4">
                                    <Text color="muted" size="sm">Outstanding</Text>
                                    <Heading level={4}>$0.00</Heading>
                                </div>
                            </Card>
                        </div>

                        {/* Invoice Table */}
                        <Card>
                            <Table
                                data={mockInvoices}
                                columns={columns}
                                onRowPress={handleRowClick}
                                hoverable
                            />
                        </Card>
                    </div>
                </div>
            </div>

            {/* Invoice Detail Drawer */}
            <BillingDrawer
                title={selectedInvoice?.invoiceNumber || 'Invoice Details'}
                headerActions={
                    selectedInvoice && (
                        <Button variant="outline" size="sm">
                            Download PDF
                        </Button>
                    )
                }
            >
                {selectedInvoice && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Badge
                                variant={
                                    selectedInvoice.status === 'paid' ? 'success' :
                                        selectedInvoice.status === 'pending' ? 'warning' :
                                            'destructive'
                                }
                            >
                                {selectedInvoice.status}
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Text color="muted" size="sm">Invoice Number</Text>
                                <Text weight="medium">{selectedInvoice.invoiceNumber}</Text>
                            </div>
                            <div>
                                <Text color="muted" size="sm">Description</Text>
                                <Text>{selectedInvoice.description}</Text>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Text color="muted" size="sm">Issue Date</Text>
                                    <Text weight="medium">{selectedInvoice.date}</Text>
                                </div>
                                <div>
                                    <Text color="muted" size="sm">Due Date</Text>
                                    <Text weight="medium">{selectedInvoice.dueDate}</Text>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex justify-between items-center">
                                    <Text weight="medium">Total Amount</Text>
                                    <Heading level={4}>${selectedInvoice.amount.toFixed(2)}</Heading>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <Heading level={5} style={{ marginBottom: '0.5rem' }}>
                                Payment Details
                            </Heading>
                            <Text color="muted" size="sm">
                                {selectedInvoice.status === 'paid'
                                    ? `Paid on ${selectedInvoice.date} via credit card ending in 4242`
                                    : 'Payment pending'}
                            </Text>
                        </div>
                    </div>
                )}
            </BillingDrawer>
        </>
    );
}
