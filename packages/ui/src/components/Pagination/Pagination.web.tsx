import React from 'react';
import { PaginationProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { ChevronLeft, ChevronRight, MoreHorizontal, ChevronsLeft, ChevronsRight } from 'lucide-react';

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  size = 'md',
  variant = 'default',
  onClick,
  className,
  testID,
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  disabled = false,
  loading = false,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  firstLabel = 'First',
  lastLabel = 'Last',
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const handlePageClick = (page: number) => {
    if (disabled || loading || page === currentPage) return;
    onPageChange(page);
    onClick?.(page);
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
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      fontSize: theme.typography.fontSize.sm,
      minWidth: '32px',
      height: '32px',
    },
    md: {
      padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
      fontSize: theme.typography.fontSize.base,
      minWidth: '40px',
      height: '40px',
    },
    lg: {
      padding: `${theme.spacing.md}px ${theme.spacing.lg}px`,
      fontSize: theme.typography.fontSize.lg,
      minWidth: '48px',
      height: '48px',
    },
  };

  const variantStyles = {
    default: {
      backgroundColor: theme.colors.background,
      color: theme.colors.foreground,
      border: `1px solid ${theme.colors.border}`,
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.colors.foreground,
      border: `1px solid ${theme.colors.border}`,
    },
    minimal: {
      backgroundColor: 'transparent',
      color: theme.colors.foreground,
      border: '1px solid transparent',
    },
  };

  const activeStyles = {
    backgroundColor: theme.colors.primary,
    color: theme.colors.primaryForeground,
    border: `1px solid ${theme.colors.primary}`,
  };

  const baseItemStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    transition: 'all 0.2s ease-in-out',
    borderRadius: theme.borders.radius.sm,
    textDecoration: 'none',
    userSelect: 'none',
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : 18;

  const PaginationItem: React.FC<{
    page: number | 'prev' | 'next' | 'first' | 'last' | 'ellipsis';
    isActive?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
    disabled?: boolean;
  }> = ({ page, isActive, onClick, children, disabled: itemDisabled }) => (
    <button
      style={{
        ...baseItemStyles,
        ...(isActive ? activeStyles : {}),
        opacity: itemDisabled || disabled || loading ? 0.5 : 1,
        cursor: itemDisabled || disabled || loading ? 'not-allowed' : 'pointer',
      }}
      onClick={itemDisabled || disabled || loading ? undefined : onClick}
      disabled={itemDisabled || disabled || loading}
      aria-current={isActive ? 'page' : undefined}
      aria-label={
        typeof page === 'number' 
          ? `Page ${page}` 
          : page === 'prev' 
          ? previousLabel
          : page === 'next'
          ? nextLabel
          : page === 'first'
          ? firstLabel
          : page === 'last'
          ? lastLabel
          : undefined
      }
      data-testid={testID ? `${testID}-${page}` : undefined}
      type="button"
    >
      {children}
    </button>
  );

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.xs,
        ...style,
      }}
      className={className}
      data-testid={testID}
      aria-label={ariaLabel || accessibilityLabel || 'Pagination navigation'}
      aria-describedby={ariaDescribedBy}
      role="navigation"
      {...props}
    >
      {/* First page button */}
      {showFirstLast && totalPages > maxVisiblePages && (
        <PaginationItem
          page="first"
          onClick={() => handlePageClick(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft size={iconSize} />
        </PaginationItem>
      )}

      {/* Previous page button */}
      {showPrevNext && (
        <PaginationItem
          page="prev"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={iconSize} />
        </PaginationItem>
      )}

      {/* Page numbers */}
      {generatePageNumbers().map((page, index) => (
        page === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            style={{
              ...baseItemStyles,
              cursor: 'default',
              border: 'none',
              backgroundColor: 'transparent',
            }}
            aria-hidden="true"
          >
            <MoreHorizontal size={iconSize} />
          </span>
        ) : (
          <PaginationItem
            key={page}
            page={page}
            isActive={page === currentPage}
            onClick={() => handlePageClick(page as number)}
          >
            {page}
          </PaginationItem>
        )
      ))}

      {/* Next page button */}
      {showPrevNext && (
        <PaginationItem
          page="next"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={iconSize} />
        </PaginationItem>
      )}

      {/* Last page button */}
      {showFirstLast && totalPages > maxVisiblePages && (
        <PaginationItem
          page="last"
          onClick={() => handlePageClick(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight size={iconSize} />
        </PaginationItem>
      )}
    </nav>
  );
};