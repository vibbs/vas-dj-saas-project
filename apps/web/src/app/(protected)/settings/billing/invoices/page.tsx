'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SecondarySidebar, Card, Heading, Text, Button, Table, Badge, Spinner, Pagination } from '@vas-dj-saas/ui';
import type { TableColumn } from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { convertToSecondarySidebarConfig } from '@/utils/navigation-helpers';
import { BillingDrawer } from '@/components/settings/billing/BillingDrawer';
import { useBilling } from '@/hooks/useBilling';
import type { Invoice } from '@vas-dj-saas/api-client';

/**
 * Invoices Page
 *
 * Detail page with:
 * - Secondary sidebar for in-section navigation
 * - Invoice history table with sorting and pagination
 * - Invoice detail drawer
 * - Download functionality
 *
 * URL: /settings/billing/invoices
 * Drawer: /settings/billing/invoices?selected=inv123
 */
export default function InvoicesPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selectedInvoiceId = searchParams.get('selected');

    const {
        invoices,
        billingOverview,
        isLoadingInvoices,
        error,
        refreshInvoices,
    } = useBilling();

    // Pagination state
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;

    // Get billing settings config
    const billingConfig = React.useMemo(() => {
        return navigationConfig.sections
            .find(s => s.id === 'settings')
            ?.items.find(i => i.id === 'settings-billing');
    }, []);

    // Find selected invoice
    const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId);

    // Calculate summary metrics
    const summaryMetrics = React.useMemo(() => {
        const thisYear = new Date().getFullYear();
        const thisYearInvoices = invoices.filter(inv => {
            const invoiceDate = new Date(inv.createdAt);
            return invoiceDate.getFullYear() === thisYear;
        });

        const totalThisYear = thisYearInvoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + parseFloat(inv.total), 0);

        const paidCount = invoices.filter(inv => inv.status === 'paid').length;

        const outstanding = invoices
            .filter(inv => inv.status === 'open')
            .reduce((sum, inv) => sum + parseFloat(inv.total), 0);

        return { totalThisYear, paidCount, outstanding };
    }, [invoices]);

    // Paginated invoices
    const paginatedInvoices = React.useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return invoices.slice(startIndex, startIndex + itemsPerPage);
    }, [invoices, currentPage]);

    const totalPages = Math.ceil(invoices.length / itemsPerPage);

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

    /**
     * Handle download invoice PDF
     */
    const handleDownloadPdf = (invoice: Invoice) => {
        if (invoice.invoicePdfUrl) {
            window.open(invoice.invoicePdfUrl, '_blank');
        } else if (invoice.hostedInvoiceUrl) {
            window.open(invoice.hostedInvoiceUrl, '_blank');
        }
    };

    /**
     * Handle download all invoices
     */
    const handleDownloadAll = () => {
        // In production, this would trigger a bulk download or zip file generation
        console.log('Downloading all invoices...');
        invoices.forEach(inv => {
            if (inv.invoicePdfUrl) {
                // Note: Opening multiple windows may be blocked by popup blockers
                // A proper implementation would generate a zip file on the server
            }
        });
    };

    /**
     * Get status badge variant
     */
    const getStatusVariant = (status: string): 'success' | 'warning' | 'destructive' | 'secondary' => {
        switch (status) {
            case 'paid':
                return 'success';
            case 'open':
                return 'warning';
            case 'uncollectible':
            case 'void':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    /**
     * Format currency
     */
    const formatCurrency = (amount: string, currency: string = 'usd'): string => {
        const value = parseFloat(amount);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(value);
    };

    /**
     * Format date
     */
    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Table columns
    const columns: TableColumn<Invoice>[] = [
        {
            key: 'number',
            title: 'Invoice',
            sortable: true,
            render: (value) => <span className="font-medium">{String(value)}</span>,
        },
        {
            key: 'createdAt',
            title: 'Date',
            sortable: true,
            render: (value) => <span>{formatDate(String(value))}</span>,
        },
        {
            key: 'subscriptionPlan',
            title: 'Description',
            render: (value, invoice) => (
                <span>
                    {String(value) || `Invoice for ${formatDate(invoice.periodStart)} - ${formatDate(invoice.periodEnd)}`}
                </span>
            ),
        },
        {
            key: 'total',
            title: 'Amount',
            sortable: true,
            render: (value, invoice) => (
                <span>{formatCurrency(String(value), invoice.currency)}</span>
            ),
        },
        {
            key: 'status',
            title: 'Status',
            render: (value, invoice) => (
                <Badge variant={getStatusVariant(invoice.status)}>
                    {invoice.statusDisplay || invoice.status}
                </Badge>
            ),
        },
        {
            key: 'actions' as keyof Invoice,
            title: '',
            render: (_, invoice) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        handleDownloadPdf(invoice);
                    }}
                    disabled={!invoice.invoicePdfUrl && !invoice.hostedInvoiceUrl}
                >
                    Download
                </Button>
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
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="md"
                                    onClick={refreshInvoices}
                                    disabled={isLoadingInvoices}
                                >
                                    Refresh
                                </Button>
                                <Button
                                    variant="outline"
                                    size="md"
                                    onClick={handleDownloadAll}
                                    disabled={invoices.length === 0}
                                >
                                    Download All
                                </Button>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <div className="p-4">
                                    <Text color="muted" size="sm">Total This Year</Text>
                                    <Heading level={4}>
                                        {formatCurrency(summaryMetrics.totalThisYear.toFixed(2))}
                                    </Heading>
                                </div>
                            </Card>
                            <Card>
                                <div className="p-4">
                                    <Text color="muted" size="sm">Invoices Paid</Text>
                                    <Heading level={4}>{summaryMetrics.paidCount}</Heading>
                                </div>
                            </Card>
                            <Card>
                                <div className="p-4">
                                    <Text color="muted" size="sm">Outstanding</Text>
                                    <Heading level={4}>
                                        {formatCurrency(summaryMetrics.outstanding.toFixed(2))}
                                    </Heading>
                                </div>
                            </Card>
                        </div>

                        {/* Loading State */}
                        {isLoadingInvoices && (
                            <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
                                <Spinner size="lg" />
                                <Text color="muted">Loading invoices...</Text>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <Card>
                                <div className="p-6 text-center">
                                    <Text color="muted">{error}</Text>
                                </div>
                            </Card>
                        )}

                        {/* Invoice Table */}
                        {!isLoadingInvoices && invoices.length > 0 && (
                            <Card>
                                <Table
                                    data={paginatedInvoices}
                                    columns={columns}
                                    onRowPress={handleRowClick}
                                    hoverable
                                />

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="p-4 border-t flex justify-center">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                        />
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* Empty State */}
                        {!isLoadingInvoices && invoices.length === 0 && !error && (
                            <Card>
                                <div className="p-12 text-center">
                                    <Heading level={4} style={{ marginBottom: '0.5rem' }}>
                                        No invoices yet
                                    </Heading>
                                    <Text color="muted">
                                        Your invoices will appear here once you subscribe to a plan.
                                    </Text>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Invoice Detail Drawer */}
            <BillingDrawer
                title={selectedInvoice?.number || 'Invoice Details'}
                headerActions={
                    selectedInvoice && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPdf(selectedInvoice)}
                            disabled={!selectedInvoice.invoicePdfUrl && !selectedInvoice.hostedInvoiceUrl}
                        >
                            Download PDF
                        </Button>
                    )
                }
            >
                {selectedInvoice && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Badge variant={getStatusVariant(selectedInvoice.status)}>
                                {selectedInvoice.statusDisplay || selectedInvoice.status}
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Text color="muted" size="sm">Invoice Number</Text>
                                <Text weight="medium">{selectedInvoice.number}</Text>
                            </div>
                            <div>
                                <Text color="muted" size="sm">Description</Text>
                                <Text>
                                    {selectedInvoice.subscriptionPlan ||
                                        `Invoice for ${formatDate(selectedInvoice.periodStart)} - ${formatDate(selectedInvoice.periodEnd)}`}
                                </Text>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Text color="muted" size="sm">Issue Date</Text>
                                    <Text weight="medium">{formatDate(selectedInvoice.createdAt)}</Text>
                                </div>
                                <div>
                                    <Text color="muted" size="sm">Due Date</Text>
                                    <Text weight="medium">
                                        {selectedInvoice.dueDate ? formatDate(selectedInvoice.dueDate) : '-'}
                                    </Text>
                                </div>
                            </div>

                            {/* Line items */}
                            <div className="pt-4 border-t space-y-2">
                                <div className="flex justify-between items-center">
                                    <Text color="muted">Subtotal</Text>
                                    <Text>{formatCurrency(selectedInvoice.subtotal, selectedInvoice.currency)}</Text>
                                </div>
                                {parseFloat(selectedInvoice.tax) > 0 && (
                                    <div className="flex justify-between items-center">
                                        <Text color="muted">Tax</Text>
                                        <Text>{formatCurrency(selectedInvoice.tax, selectedInvoice.currency)}</Text>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t">
                                    <Text weight="medium">Total Amount</Text>
                                    <Heading level={4}>
                                        {formatCurrency(selectedInvoice.total, selectedInvoice.currency)}
                                    </Heading>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <Heading level={5} style={{ marginBottom: '0.5rem' }}>
                                Payment Details
                            </Heading>
                            <Text color="muted" size="sm">
                                {selectedInvoice.isPaid
                                    ? `Paid on ${selectedInvoice.paidAt ? formatDate(selectedInvoice.paidAt) : formatDate(selectedInvoice.createdAt)}`
                                    : selectedInvoice.status === 'open'
                                        ? 'Payment pending'
                                        : `Status: ${selectedInvoice.statusDisplay || selectedInvoice.status}`
                                }
                            </Text>
                        </div>

                        {/* View on Stripe link */}
                        {selectedInvoice.hostedInvoiceUrl && (
                            <div className="pt-4">
                                <Button
                                    variant="outline"
                                    size="md"
                                    onClick={() => window.open(selectedInvoice.hostedInvoiceUrl, '_blank')}
                                    style={{ width: '100%' }}
                                >
                                    View Invoice Online
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </BillingDrawer>
        </>
    );
}
