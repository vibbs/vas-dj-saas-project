import React from 'react';
import { TableProps, TableColumn } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Table: React.FC<TableProps> = ({
  data,
  columns,
  loading = false,
  emptyText = 'No data available',
  showHeader = true,
  striped = false,
  bordered = true,
  hoverable = true,
  size = 'md',
  onRowPress,
  onRowLongPress,
  rowKey = 'id',
  maxHeight,
  className,
  style,
  headerStyle,
  rowStyle,
  cellStyle,
  testID,
  // Accessibility props
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-rowcount': ariaRowCount,
  'aria-colcount': ariaColCount,
  role = 'table',
  // Filter out React Native specific props
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  const { theme } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          fontSize: theme.typography.fontSize.sm,
          padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
        };
      case 'md':
        return {
          fontSize: theme.typography.fontSize.base,
          padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
        };
      case 'lg':
        return {
          fontSize: theme.typography.fontSize.lg,
          padding: `${theme.spacing.md}px ${theme.spacing.lg}px`,
        };
      default:
        return {
          fontSize: theme.typography.fontSize.base,
          padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const tableStyles: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: theme.colors.background,
    color: theme.colors.foreground,
    fontFamily: theme.typography.fontFamily,
    borderRadius: theme.borders.radius.md,
    overflow: 'hidden',
    ...(bordered && {
      border: `1px solid ${theme.colors.border}`,
    }),
    ...style,
  };

  const containerStyles: React.CSSProperties = {
    ...(maxHeight && {
      maxHeight: maxHeight,
      overflowY: 'auto',
    }),
    borderRadius: theme.borders.radius.md,
    ...(bordered && {
      border: `1px solid ${theme.colors.border}`,
    }),
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  };

  const headerCellStyles: React.CSSProperties = {
    backgroundColor: theme.colors.secondary || theme.colors.muted,
    color: theme.colors.foreground,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'left',
    borderBottom: `2px solid ${theme.colors.border}`,
    borderRight: bordered ? `1px solid ${theme.colors.border}` : 'none',
    borderTop: bordered ? `1px solid ${theme.colors.border}` : 'none',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    ...sizeStyles,
    fontSize: sizeStyles.fontSize ? `${parseFloat(sizeStyles.fontSize.toString()) * 0.9}px` : '12px',
    ...headerStyle,
  };

  const cellStyles: React.CSSProperties = {
    borderBottom: `1px solid ${theme.colors.border}`,
    borderRight: bordered ? `1px solid ${theme.colors.border}` : 'none',
    textAlign: 'left',
    ...sizeStyles,
    ...cellStyle,
  };

  const getRowKey = (record: any, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || index.toString();
  };

  const getAlignmentStyle = (align?: 'left' | 'center' | 'right') => {
    return { textAlign: align || 'left' };
  };

  const renderCell = (column: TableColumn, record: any, index: number) => {
    const value = column.dataIndex ? record[column.dataIndex] : record;
    
    if (column.render) {
      return column.render(value, record, index);
    }
    
    return value;
  };

  if (loading) {
    return (
      <div style={{
        padding: theme.spacing.xl,
        textAlign: 'center',
        color: theme.colors.mutedForeground,
      }}>
        Loading...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{
        padding: theme.spacing.xl,
        textAlign: 'center',
        color: theme.colors.mutedForeground,
        border: bordered ? `1px solid ${theme.colors.border}` : 'none',
        borderRadius: theme.borders.radius.md,
        backgroundColor: theme.colors.background,
      }}>
        {emptyText}
      </div>
    );
  }

  return (
    <div style={containerStyles} className={className} data-testid={testID} {...props}>
      <table
        style={tableStyles}
        // Accessibility attributes (WCAG 2.1 AA compliant)
        role={role}
        aria-label={ariaLabel || accessibilityLabel}
        aria-describedby={ariaDescribedBy}
        aria-rowcount={ariaRowCount || data.length + (showHeader ? 1 : 0)}
        aria-colcount={ariaColCount || columns.length}
      >
        {showHeader && (
          <thead>
            <tr role="row">
              {columns.map((column, columnIndex) => (
                <th
                  key={column.key}
                  style={{
                    ...headerCellStyles,
                    ...getAlignmentStyle(column.align),
                    ...(column.width && { width: column.width }),
                    cursor: column.sortable || column.onHeaderPress ? 'pointer' : 'default',
                  }}
                  onClick={column.onHeaderPress}
                  role="columnheader"
                  aria-colindex={columnIndex + 1}
                  aria-sort={column.sortable ? 'none' : undefined}
                  tabIndex={column.sortable || column.onHeaderPress ? 0 : -1}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && column.onHeaderPress) {
                      e.preventDefault();
                      column.onHeaderPress();
                    }
                  }}
                >
                  {column.title}
                  {column.sortable && (
                    <span style={{ marginLeft: theme.spacing.xs, opacity: 0.5 }}>
                      ↕
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {data.map((record, rowIndex) => (
            <tr
              key={getRowKey(record, rowIndex)}
              role="row"
              aria-rowindex={rowIndex + (showHeader ? 2 : 1)}
              style={{
                ...(striped && rowIndex % 2 === 1 && {
                  backgroundColor: `${theme.colors.muted}40`, // Much lighter opacity
                }),
                ...(hoverable && {
                  cursor: onRowPress ? 'pointer' : 'default',
                }),
                ...rowStyle,
              }}
              onClick={() => onRowPress?.(record, rowIndex)}
              onContextMenu={(e) => {
                if (onRowLongPress) {
                  e.preventDefault();
                  onRowLongPress(record, rowIndex);
                }
              }}
              onMouseEnter={(e) => {
                if (hoverable) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = theme.colors.accent;
                }
              }}
              onMouseLeave={(e) => {
                if (hoverable) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 
                    striped && rowIndex % 2 === 1 ? `${theme.colors.muted}40` : 'transparent';
                }
              }}
              tabIndex={onRowPress ? 0 : -1}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && onRowPress) {
                  e.preventDefault();
                  onRowPress(record, rowIndex);
                }
              }}
            >
              {columns.map((column, columnIndex) => (
                <td
                  key={`${getRowKey(record, rowIndex)}-${column.key}`}
                  style={{
                    ...cellStyles,
                    ...getAlignmentStyle(column.align),
                  }}
                  role="cell"
                  aria-colindex={columnIndex + 1}
                >
                  {renderCell(column, record, rowIndex)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};