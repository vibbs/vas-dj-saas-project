'use client';

import React from 'react';
import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';
import { EntityDrawer } from '@vas-dj-saas/ui';

interface MemberDrawerProps {
    children?: React.ReactNode;
    title?: string;
    description?: string;
    headerActions?: React.ReactNode;
}

/**
 * MemberDrawer component using EntityDrawer from UI package
 *
 * This component wraps the EntityDrawer with the Next.js router adapter,
 * providing a convenient API for the settings pages.
 */
export function MemberDrawer({ children, title, description, headerActions }: MemberDrawerProps) {
    const router = useNextTabRouter();

    return (
        <EntityDrawer
            router={router}
            title={title}
            description={description}
            headerActions={headerActions}
            queryParam="selected"
            side="right"
            size="md"
        >
            {children}
        </EntityDrawer>
    );
}
