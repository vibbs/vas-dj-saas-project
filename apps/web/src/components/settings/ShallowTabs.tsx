"use client";

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent, Badge } from '@vas-dj-saas/ui';

export interface ShallowTab {
    value: string;
    label: string;
    icon?: React.ReactNode;
    component: React.ReactNode;
    badge?: string | number;
    disabled?: boolean;
}

export interface ShallowTabsProps {
    tabs: ShallowTab[];
    defaultTab?: string;
    className?: string;
    onTabChange?: (value: string) => void;
}

/**
 * Temporary ShallowTabs implementation
 * Will be replaced with @vas-dj-saas/ui ShallowTabs once package is rebuilt
 */
export function ShallowTabs({ tabs, defaultTab, className, onTabChange }: ShallowTabsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentTab = searchParams.get('tab') || defaultTab || tabs[0]?.value || '';

    const handleTabChange = React.useCallback((value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', value);

        router.push(`${pathname}?${params.toString()}`, { scroll: false });

        onTabChange?.(value);
    }, [router, pathname, searchParams, onTabChange]);

    React.useEffect(() => {
        const tabExists = tabs.some(tab => tab.value === currentTab);
        if (!tabExists && tabs.length > 0) {
            handleTabChange(tabs[0].value);
        }
    }, [currentTab, tabs, handleTabChange]);

    return (
        <Tabs
            value={currentTab}
            onValueChange={handleTabChange}
            className={className}
        >
            <TabsList>
                {tabs.map((tab) => (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        disabled={tab.disabled}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {tab.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{tab.icon}</span>}
                        <span>{tab.label}</span>
                        {tab.badge !== undefined && (
                            <Badge variant="secondary" size="sm">
                                {tab.badge}
                            </Badge>
                        )}
                    </TabsTrigger>
                ))}
            </TabsList>

            {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                    {tab.component}
                </TabsContent>
            ))}
        </Tabs>
    );
}
