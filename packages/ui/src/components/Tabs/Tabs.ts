// Platform-aware Tabs exports
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Tabs as WebTabs, TabsList as WebTabsList, TabsTrigger as WebTabsTrigger, TabsContent as WebTabsContent } from './Tabs.web';
import { Tabs as NativeTabs, TabsList as NativeTabsList, TabsTrigger as NativeTabsTrigger, TabsContent as NativeTabsContent } from './Tabs.native';

// Export the platform-aware components
export const Tabs = createPlatformComponent(NativeTabs, WebTabs);
export const TabsList = createPlatformComponent(NativeTabsList, WebTabsList);
export const TabsTrigger = createPlatformComponent(NativeTabsTrigger, WebTabsTrigger);
export const TabsContent = createPlatformComponent(NativeTabsContent, WebTabsContent);

// Re-export types
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps } from './types';
