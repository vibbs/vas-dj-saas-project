'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Breadcrumb } from '@vas-dj-saas/ui';
import type { BreadcrumbItem } from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { generateBreadcrumbs } from '@/utils/breadcrumb-helpers';

interface FloatingBreadcrumbProps {
  /**
   * Override auto-generated breadcrumbs
   */
  items?: BreadcrumbItem[];

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Floating Breadcrumb Component
 *
 * Displays breadcrumbs in a floating card style below the AppBar.
 * Automatically generates breadcrumbs from the current route using navigation config.
 */
export function FloatingBreadcrumb({ items, className }: FloatingBreadcrumbProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Auto-generate breadcrumbs if not provided
  const breadcrumbItems = React.useMemo(() => {
    if (items) return items;
    return generateBreadcrumbs(pathname, navigationConfig);
  }, [pathname, items]);

  // Don't render if no breadcrumbs
  if (breadcrumbItems.length === 0) {
    return null;
  }

  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.href && !item.disabled) {
      router.push(item.href);
    }
  };

  return (
    <div
      className={`
        mb-6
        ${className || ''}
      `.trim()}
    >
      <Breadcrumb
        items={breadcrumbItems}
        onItemClick={handleItemClick}
        size="sm"
        variant="minimal"
      />
    </div>
  );
}
