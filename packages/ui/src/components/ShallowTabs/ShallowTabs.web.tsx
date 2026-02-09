"use client";

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../Tabs';
import type { ShallowTabsProps } from './types';
import { Badge } from '../Badge';

/**
 * ShallowTabs Component (Framework-Agnostic)
 *
 * Tab navigation that syncs with URL query parameters using a router adapter.
 * This component follows the Hexagonal Architecture pattern:
 * - Accepts a TabRouterPort implementation via props
 * - No direct framework dependencies (Next.js, React Navigation, etc.)
 * - Fully portable across web and mobile platforms
 *
 * Features:
 * - Preserves page state and scroll position
 * - Makes tabs bookmarkable and shareable
 * - Uses ?tab= query parameter for state
 * - Validates tab existence and falls back gracefully
 *
 * @example
 * ```tsx
 * // Web (Next.js)
 * import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';
 * import { ShallowTabs } from '@vas-dj-saas/ui';
 *
 * function SettingsPage() {
 *   const router = useNextTabRouter();
 *   return (
 *     <ShallowTabs
 *       router={router}
 *       tabs={[
 *         { value: "overview", label: "Overview", component: <Overview /> },
 *         { value: "members", label: "Members", component: <Members /> },
 *         { value: "roles", label: "Roles", component: <Roles />, badge: 5 },
 *       ]}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Mobile (React Navigation)
 * import { useReactNavTabRouter } from '@vas-dj-saas/adapters/react-navigation-router';
 * import { ShallowTabs } from '@vas-dj-saas/ui';
 *
 * function SettingsScreen() {
 *   const router = useReactNavTabRouter();
 *   return <ShallowTabs router={router} tabs={tabs} />;
 * }
 * ```
 */
export const ShallowTabs: React.FC<ShallowTabsProps> = ({
    tabs,
    router,
    defaultTab,
    className,
    style,
    testID,
    onTabChange,
}) => {
    // Determine fallback tab (default or first tab)
    const fallbackTab = React.useMemo(
        () => defaultTab || tabs[0]?.value || '',
        [defaultTab, tabs]
    );

    // Get current tab from router (URL query param)
    const currentTabFromUrl = React.useMemo(() => {
        return router.getValue('tab') || '';
    }, [router]);

    // Local state for active tab
    const [activeTab, setActiveTab] = React.useState<string>(
        () => currentTabFromUrl || fallbackTab
    );

    /**
     * Handle tab change with router sync
     * Preserves all other query params and updates only the tab param
     */
    const handleTabChange = React.useCallback((value: string) => {
        setActiveTab(value);
        router.setValue('tab', value);
        onTabChange?.(value);
    }, [router, onTabChange]);

    /**
     * Keep active tab synced with URL/defaults and fall back when needed
     * This effect handles:
     * 1. Tab validation (ensure tab exists in tabs array)
     * 2. Fallback to default when URL has invalid tab
     * 3. Syncing local state with URL changes
     */
    React.useEffect(() => {
        if (tabs.length === 0) return;

        const urlTab = currentTabFromUrl;
        const tabExists = tabs.some((tab) => tab.value === urlTab);
        const nextTab = tabExists ? urlTab : fallbackTab;

        if (!nextTab) return;

        // Update local state if needed
        setActiveTab((previous) => (previous === nextTab ? previous : nextTab));

        // If URL has invalid tab, update URL to valid fallback
        if (!tabExists && urlTab) {
            router.setValue('tab', nextTab);
        }
    }, [tabs, currentTabFromUrl, fallbackTab, router]);

    return (
        <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className={className}
            style={style}
            testID={testID}
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
};

ShallowTabs.displayName = 'ShallowTabs';
