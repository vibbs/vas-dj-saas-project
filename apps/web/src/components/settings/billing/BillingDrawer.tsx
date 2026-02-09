'use client';

import React from 'react';
import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';
import { EntityDrawer } from '@vas-dj-saas/ui';

interface BillingDrawerProps {
    children?: React.ReactNode;
    title?: string;
    description?: string;
    headerActions?: React.ReactNode;
    queryParam?: string;
}

/**
 * BillingDrawer component using EntityDrawer from UI package
 *
 * This component wraps the EntityDrawer with the Next.js router adapter,
 * providing a convenient API for the billing settings pages.
 */
export function BillingDrawer({
    children,
    title,
    description,
    headerActions,
    queryParam = 'selected'
}: BillingDrawerProps) {
    const router = useNextTabRouter();

    return (
        <EntityDrawer
            router={router}
            title={title}
            description={description}
            headerActions={headerActions}
            queryParam={queryParam}
            side="right"
            size="md"
        >
            {children}
        </EntityDrawer>
    );
}
