import React from 'react';
import { View, TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { PaginationProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  size = 'md',
  variant = 'default',
  onPress,
  style,
  testID,
  accessibilityLabel,
  disabled = false,
  loading = false,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  firstLabel = 'First',
  lastLabel = 'Last',
  // Filter out web-specific props
  className,
  onClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const { theme } = useTheme();

  const handlePagePress = (page: number) => {
    if (disabled || loading || page === currentPage) return;
    onPageChange(page);
    onPress?.(page);
  };

  const generatePageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const half = Math.floor(maxVisiblePages / 2);
    
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);
    
    // Adjust if we're near the beginning or end
    if (currentPage <= half) {
      end = Math.min(totalPages, maxVisiblePages);
    } else if (currentPage > totalPages - half) {
      start = Math.max(1, totalPages - maxVisiblePages + 1);
    }
    
    // Add first page and ellipsis if needed
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('ellipsis');
      }
    }
    
    // Add visible pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis and last page if needed
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const sizeStyles = {
    sm: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      minWidth: 32,
      height: 32,
      borderRadius: theme.borders.radius.sm,
    },
    md: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      minWidth: 40,
      height: 40,
      borderRadius: theme.borders.radius.sm,
    },
    lg: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      minWidth: 48,
      height: 48,
      borderRadius: theme.borders.radius.sm,
    },
  };

  const sizeTextStyles = {
    sm: { fontSize: theme.typography.fontSize.sm },
    md: { fontSize: theme.typography.fontSize.base },
    lg: { fontSize: theme.typography.fontSize.lg },
  };

  const variantStyles = {
    default: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
      borderWidth: 1,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
      borderWidth: 1,
    },
    minimal: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 1,
    },
  };

  const variantTextStyles = {
    default: { color: theme.colors.foreground },
    outline: { color: theme.colors.foreground },
    minimal: { color: theme.colors.foreground },
  };

  const activeStyles = {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  };

  const activeTextStyles = {
    color: theme.colors.primaryForeground,
  };

  const baseItemStyles: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled || loading ? 0.5 : 1,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  const baseTextStyles: TextStyle = {
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.medium as any,
    ...sizeTextStyles[size],
    ...variantTextStyles[variant],
  };

  const PaginationItem: React.FC<{
    page: number | 'prev' | 'next' | 'first' | 'last' | 'ellipsis';
    isActive?: boolean;
    onPress?: () => void;
    children: React.ReactNode;
    disabled?: boolean;
    accessibilityLabel?: string;
  }> = ({ page, isActive, onPress, children, disabled: itemDisabled, accessibilityLabel: itemAccessibilityLabel }) => {
    
    if (page === 'ellipsis') {
      return (
        <View
          style={{
            ...baseItemStyles,
            borderColor: 'transparent',
            backgroundColor: 'transparent',
          }}
        >
          <Text style={baseTextStyles}>⋯</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[
          baseItemStyles,
          isActive ? activeStyles : {},
          { opacity: itemDisabled || disabled || loading ? 0.5 : 1 }
        ]}
        onPress={itemDisabled || disabled || loading ? undefined : onPress}
        disabled={itemDisabled || disabled || loading}
        activeOpacity={0.7}
        accessible={true}
        accessibilityLabel={
          itemAccessibilityLabel ||
          (typeof page === 'number' 
            ? `Page ${page}` 
            : page === 'prev' 
            ? previousLabel
            : page === 'next'
            ? nextLabel
            : page === 'first'
            ? firstLabel
            : page === 'last'
            ? lastLabel
            : undefined)
        }
        accessibilityRole="button"
        accessibilityState={{
          disabled: itemDisabled || disabled || loading,
          selected: isActive,
        }}
        testID={testID ? `${testID}-${page}` : undefined}
      >
        <Text style={[baseTextStyles, isActive ? activeTextStyles : {}]}>
          {children}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
        },
        style,
      ]}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel || 'Pagination navigation'}
      accessibilityRole="none"
    >
      {/* First page button */}
      {showFirstLast && totalPages > maxVisiblePages && (
        <PaginationItem
          page="first"
          onPress={() => handlePagePress(1)}
          disabled={currentPage === 1}
        >
          ⇤
        </PaginationItem>
      )}

      {/* Previous page button */}
      {showPrevNext && (
        <PaginationItem
          page="prev"
          onPress={() => handlePagePress(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ‹
        </PaginationItem>
      )}

      {/* Page numbers */}
      {generatePageNumbers().map((page, index) => (
        <PaginationItem
          key={page === 'ellipsis' ? `ellipsis-${index}` : page}
          page={page}
          isActive={page === currentPage}
          onPress={page !== 'ellipsis' ? () => handlePagePress(page as number) : undefined}
          disabled={page === 'ellipsis'}
        >
          {page === 'ellipsis' ? '⋯' : page}
        </PaginationItem>
      ))}

      {/* Next page button */}
      {showPrevNext && (
        <PaginationItem
          page="next"
          onPress={() => handlePagePress(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          ›
        </PaginationItem>
      )}

      {/* Last page button */}
      {showFirstLast && totalPages > maxVisiblePages && (
        <PaginationItem
          page="last"
          onPress={() => handlePagePress(totalPages)}
          disabled={currentPage === totalPages}
        >
          ⇥
        </PaginationItem>
      )}
    </View>
  );
};