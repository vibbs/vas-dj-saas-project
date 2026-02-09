import React from 'react';
import { BreadcrumbProps, BreadcrumbItem } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react';

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator,
  showHomeIcon = false,
  maxItems,
  size = 'md',
  variant = 'default',
  onItemClick,
  className,
  testID,
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    if (!item.disabled && item.href) {
      onItemClick?.(item, index);
    }
  };

  const processItems = (): BreadcrumbItem[] => {
    if (!maxItems || items.length <= maxItems) {
      return items;
    }

    const firstItem = items[0];
    const lastItems = items.slice(-(maxItems - 2));
    
    return [
      firstItem,
      { label: '...', disabled: true },
      ...lastItems,
    ];
  };

  const processedItems = processItems();

  const sizeStyles = {
    sm: {
      fontSize: theme.typography.fontSize.sm,
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      iconSize: 12,
    },
    md: {
      fontSize: theme.typography.fontSize.base,
      padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
      iconSize: 14,
    },
    lg: {
      fontSize: theme.typography.fontSize.lg,
      padding: `${theme.spacing.sm}px ${theme.spacing.lg}px`,
      iconSize: 16,
    },
  };

  const variantStyles = {
    default: {
      color: theme.colors.foreground,
      linkColor: theme.colors.primary,
      hoverColor: theme.colors.primary,
    },
    minimal: {
      color: theme.colors.mutedForeground,
      linkColor: theme.colors.foreground,
      hoverColor: theme.colors.primary,
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  const defaultSeparator = separator || <ChevronRight size={currentSize.iconSize} />;

  const BreadcrumbItemComponent: React.FC<{
    item: BreadcrumbItem;
    index: number;
    isLast: boolean;
  }> = ({ item, index, isLast }) => {
    const isClickable = !item.disabled && item.href;
    const isEllipsis = item.label === '...';

    const itemStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: theme.spacing.xs,
      fontSize: currentSize.fontSize,
      fontFamily: theme.typography.fontFamily,
      color: isLast 
        ? theme.colors.foreground 
        : isClickable 
        ? currentVariant.linkColor 
        : currentVariant.color,
      textDecoration: 'none',
      cursor: isClickable ? 'pointer' : 'default',
      opacity: item.disabled ? 0.5 : 1,
      transition: 'color 0.2s ease-in-out',
      fontWeight: isLast ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal,
    };

    const hoverStyles = isClickable ? {
      ':hover': {
        color: currentVariant.hoverColor,
      },
    } : {};

    if (isEllipsis) {
      return (
        <span
          style={{
            ...itemStyles,
            cursor: 'default',
          }}
          aria-hidden="true"
        >
          <MoreHorizontal size={currentSize.iconSize} />
        </span>
      );
    }

    const content = (
      <>
        {item.icon && (
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            {item.icon}
          </span>
        )}
        {index === 0 && showHomeIcon && !item.icon && (
          <Home size={currentSize.iconSize} />
        )}
        <span>{item.label}</span>
      </>
    );

    if (isClickable) {
      return (
        <a
          href={item.href}
          style={{...itemStyles, ...hoverStyles}}
          onClick={(e) => {
            e.preventDefault();
            handleItemClick(item, index);
          }}
          aria-current={isLast ? 'page' : undefined}
          data-testid={testID ? `${testID}-item-${index}` : undefined}
        >
          {content}
        </a>
      );
    }

    return (
      <span
        style={itemStyles}
        aria-current={isLast ? 'page' : undefined}
        data-testid={testID ? `${testID}-item-${index}` : undefined}
      >
        {content}
      </span>
    );
  };

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.sm,
        flexWrap: 'wrap',
        ...style,
      }}
      className={className}
      data-testid={testID}
      aria-label={ariaLabel || accessibilityLabel || 'Breadcrumb navigation'}
      aria-describedby={ariaDescribedBy}
      role="navigation"
      {...props}
    >
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm,
          listStyle: 'none',
          margin: 0,
          padding: 0,
          flexWrap: 'wrap',
        }}
      >
        {processedItems.map((item, index) => (
          <li
            key={`${item.label}-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
            }}
          >
            <BreadcrumbItemComponent
              item={item}
              index={index}
              isLast={index === processedItems.length - 1}
            />
            
            {index < processedItems.length - 1 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: currentVariant.color,
                  opacity: 0.6,
                }}
                aria-hidden="true"
              >
                {defaultSeparator}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};