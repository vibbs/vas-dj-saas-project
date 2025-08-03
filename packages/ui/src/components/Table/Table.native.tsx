import React from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  ViewStyle, 
  TextStyle 
} from 'react-native';
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
  style,
  headerStyle,
  rowStyle,
  cellStyle,
  testID,
  // Accessibility props
  accessibilityRole = 'table' as const,
  accessibilityLabel,
  accessibilityHint,
  // Filter out web-specific props
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-rowcount': ariaRowCount,
  'aria-colcount': ariaColCount,
  role,
  ...props
}) => {
  const { theme } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          fontSize: theme.typography.fontSize.sm,
          padding: theme.spacing.xs,
        };
      case 'md':
        return {
          fontSize: theme.typography.fontSize.base,
          padding: theme.spacing.sm,
        };
      case 'lg':
        return {
          fontSize: theme.typography.fontSize.lg,
          padding: theme.spacing.md,
        };
      default:
        return {
          fontSize: theme.typography.fontSize.base,
          padding: theme.spacing.sm,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const containerStyles: ViewStyle = {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borders.radius.md,
    ...(bordered && {
      borderWidth: 1,
      borderColor: theme.colors.border,
    }),
    ...(maxHeight && {
      maxHeight: maxHeight,
    }),
    ...style,
  };

  const headerContainerStyles: ViewStyle = {
    flexDirection: 'row',
    backgroundColor: theme.colors.muted,
    ...(bordered && {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    }),
    ...headerStyle,
  };

  const headerCellStyles: ViewStyle = {
    flex: 1,
    padding: sizeStyles.padding,
    justifyContent: 'center',
    ...(bordered && {
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
    }),
  };

  const headerTextStyles: TextStyle = {
    fontFamily: theme.typography.fontFamily,
    fontSize: sizeStyles.fontSize,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.mutedForeground,
  };

  const rowContainerStyles: ViewStyle = {
    flexDirection: 'row',
    ...(bordered && {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    }),
    ...rowStyle,
  };

  const cellStyles: ViewStyle = {
    flex: 1,
    padding: sizeStyles.padding,
    justifyContent: 'center',
    ...(bordered && {
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
    }),
    ...cellStyle,
  };

  const cellTextStyles: TextStyle = {
    fontFamily: theme.typography.fontFamily,
    fontSize: sizeStyles.fontSize,
    color: theme.colors.foreground,
  };

  const getRowKey = (record: any, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || index.toString();
  };

  const getTextAlign = (align?: 'left' | 'center' | 'right'): TextStyle => {
    return { textAlign: align || 'left' };
  };

  const renderCell = (column: TableColumn, record: any, index: number) => {
    const value = column.dataIndex ? record[column.dataIndex] : record;
    
    if (column.render) {
      return column.render(value, record, index);
    }
    
    if (typeof value === 'string' || typeof value === 'number') {
      return (
        <Text style={[cellTextStyles, getTextAlign(column.align)]}>
          {value}
        </Text>
      );
    }
    
    return (
      <Text style={[cellTextStyles, getTextAlign(column.align)]}>
        {String(value)}
      </Text>
    );
  };

  if (loading) {
    return (
      <View style={[
        containerStyles,
        {
          padding: theme.spacing.xl,
          alignItems: 'center',
          justifyContent: 'center',
        }
      ]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[
          cellTextStyles,
          { 
            color: theme.colors.mutedForeground,
            marginTop: theme.spacing.sm,
          }
        ]}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={[
        containerStyles,
        {
          padding: theme.spacing.xl,
          alignItems: 'center',
          justifyContent: 'center',
        }
      ]}>
        <Text style={[
          cellTextStyles,
          { color: theme.colors.mutedForeground }
        ]}>
          {emptyText}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={containerStyles}
      testID={testID}
      // React Native accessibility (WCAG 2.1 AA compliant)
      accessible={true}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel || ariaLabel || 'Data table'}
      accessibilityHint={accessibilityHint || 'Navigate through table data'}
      {...props}
    >
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={true}
        style={{ maxHeight: maxHeight }}
      >
        <View style={{ minWidth: '100%' }}>
          {showHeader && (
            <View style={headerContainerStyles}>
              {columns.map((column, columnIndex) => (
                <TouchableOpacity
                  key={column.key}
                  style={[
                    headerCellStyles,
                    { 
                      flex: column.width ? 0 : 1,
                      width: column.width,
                    }
                  ]}
                  onPress={column.onHeaderPress}
                  disabled={!column.sortable && !column.onHeaderPress}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`${column.title} column header`}
                  accessibilityHint={column.sortable ? 'Tap to sort' : undefined}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[headerTextStyles, getTextAlign(column.align)]}>
                      {column.title}
                    </Text>
                    {column.sortable && (
                      <Text style={[
                        headerTextStyles,
                        { 
                          marginLeft: theme.spacing.xs,
                          opacity: 0.5,
                        }
                      ]}>
                        ↕
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <ScrollView
            style={{ maxHeight: maxHeight }}
            showsVerticalScrollIndicator={true}
          >
            {data.map((record, rowIndex) => (
              <TouchableOpacity
                key={getRowKey(record, rowIndex)}
                style={[
                  rowContainerStyles,
                  striped && rowIndex % 2 === 1 && {
                    backgroundColor: theme.colors.muted,
                  }
                ]}
                onPress={() => onRowPress?.(record, rowIndex)}
                onLongPress={() => onRowLongPress?.(record, rowIndex)}
                disabled={!onRowPress && !onRowLongPress}
                activeOpacity={hoverable ? 0.8 : 1}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Table row ${rowIndex + 1}`}
                accessibilityHint={onRowPress ? 'Tap to select row' : undefined}
              >
                {columns.map((column, columnIndex) => (
                  <View
                    key={`${getRowKey(record, rowIndex)}-${column.key}`}
                    style={[
                      cellStyles,
                      { 
                        flex: column.width ? 0 : 1,
                        width: column.width,
                      }
                    ]}
                  >
                    {renderCell(column, record, rowIndex)}
                  </View>
                ))}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};