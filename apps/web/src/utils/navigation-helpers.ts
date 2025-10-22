import type { HubConfig, QuickAction, SecondarySidebarConfig, SecondaryNavItem } from '@vas-dj-saas/ui';
import type { HubConfig as CoreHubConfig, SecondarySidebarConfig as CoreSecondarySidebarConfig } from '@vas-dj-saas/core';
import type { HubCardProps } from '@vas-dj-saas/ui';

/**
 * Convert core navigation hub config to UI component hub config
 */
export function convertToHubConfig(coreConfig: CoreHubConfig): HubConfig {
  return {
    title: coreConfig.title,
    description: coreConfig.description,
    cards: coreConfig.cards.map((card): HubCardProps => ({
      id: card.id,
      title: card.title,
      description: card.description,
      icon: card.icon,
      href: card.href,
      metric: card.metric,
      metricLabel: card.metricLabel,
      badge: card.badge,
      badgeVariant: card.badgeVariant as any,
      order: card.order,
    })),
    quickActions: coreConfig.quickActions?.map((action): QuickAction => ({
      id: action.id,
      label: action.label,
      icon: action.icon,
      href: action.href,
      onClick: action.onClick,
      variant: action.variant,
      order: action.order,
    })),
    summaryMetrics: coreConfig.summaryMetrics,
  };
}

/**
 * Convert core navigation secondary sidebar config to UI component config
 */
export function convertToSecondarySidebarConfig(
  coreConfig: CoreSecondarySidebarConfig
): SecondarySidebarConfig {
  return {
    items: coreConfig.items.map((item): SecondaryNavItem => ({
      id: item.id,
      label: item.label,
      icon: item.icon,
      href: item.href,
      badge: item.badge,
      order: item.order,
      children: item.children,
    })),
    showOverviewLink: coreConfig.showOverviewLink,
    overviewLabel: coreConfig.overviewLabel,
    overviewHref: coreConfig.overviewHref,
  };
}
