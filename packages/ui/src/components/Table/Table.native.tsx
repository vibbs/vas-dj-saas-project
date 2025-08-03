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
  accessibilityRole = 'list' as any,
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
          cardPadding: theme.spacing.sm,
          spacing: theme.spacing.xs,
        };
      case 'md':
        return {
          fontSize: theme.typography.fontSize.base,
          padding: theme.spacing.sm,
          cardPadding: theme.spacing.md,
          spacing: theme.spacing.sm,
        };
      case 'lg':
        return {
          fontSize: theme.typography.fontSize.lg,
          padding: theme.spacing.md,
          cardPadding: theme.spacing.lg,
          spacing: theme.spacing.md,
        };
      default:
        return {
          fontSize: theme.typography.fontSize.base,
          padding: theme.spacing.sm,
          cardPadding: theme.spacing.md,
          spacing: theme.spacing.sm,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const containerStyles: ViewStyle = {
    backgroundColor: theme.colors.background,
    ...style,
  };

  const cardStyles: ViewStyle = {
    backgroundColor: theme.colors.card,
    marginBottom: sizeStyles.spacing,
    marginHorizontal: sizeStyles.spacing,
    padding: sizeStyles.cardPadding,
    borderRadius: theme.borders.radius.lg,
    ...(bordered && {
      borderWidth: 1,
      borderColor: theme.colors.border,
    }),
    // Add subtle shadow for card appearance
    shadowColor: theme.colors.foreground,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    ...rowStyle,
  };

  const keyTextStyles: TextStyle = {
    fontFamily: theme.typography.fontFamily,
    fontSize: sizeStyles.fontSize,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.xs / 2,
  };

  const valueTextStyles: TextStyle = {
    fontFamily: theme.typography.fontFamily,
    fontSize: sizeStyles.fontSize,
    fontWeight: theme.typography.fontWeight.normal as any,
    color: theme.colors.foreground,
  };

  const cardHeaderStyles: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: sizeStyles.spacing,
    paddingBottom: sizeStyles.spacing / 2,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  };

  const primaryFieldStyles: TextStyle = {
    fontFamily: theme.typography.fontFamily,
    fontSize: sizeStyles.fontSize * 1.1,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.foreground,
    flex: 1,
  };

  const fieldRowStyles: ViewStyle = {
    marginBottom: sizeStyles.spacing,
  };


  const getRowKey = (record: any, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || index.toString();
  };

  // Separate actions column from data columns
  const dataColumns = columns.filter(col => col.key !== 'actions' && col.key !== 'action');
  const actionsColumn = columns.find(col => col.key === 'actions' || col.key === 'action');
  
  // Find primary field (usually the first non-action column or one with special designation)
  const primaryColumn = dataColumns[0];

  const renderFieldValue = (column: TableColumn, record: any, index: number) => {
    const value = column.dataIndex ? record[column.dataIndex] : record;
    
    if (column.render) {
      return column.render(value, record, index);
    }
    
    if (typeof value === 'string' || typeof value === 'number') {
      return (
        <Text style={valueTextStyles}>
          {value}
        </Text>
      );
    }
    
    return (
      <Text style={valueTextStyles}>
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
          valueTextStyles,
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
          valueTextStyles,
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
      accessibilityLabel={accessibilityLabel || ariaLabel || 'Data list'}
      accessibilityHint={accessibilityHint || 'Scroll through data items'}
      {...props}
    >
      <ScrollView
        style={maxHeight ? { maxHeight: maxHeight as number } : undefined}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingVertical: sizeStyles.spacing }}
      >
        {data.map((record, rowIndex) => (
          <TouchableOpacity
            key={getRowKey(record, rowIndex)}
            style={cardStyles}
            onPress={() => onRowPress?.(record, rowIndex)}
            onLongPress={() => onRowLongPress?.(record, rowIndex)}
            disabled={!onRowPress && !onRowLongPress}
            activeOpacity={hoverable ? 0.8 : 1}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Item ${rowIndex + 1}`}
            accessibilityHint={onRowPress ? 'Tap to select item' : undefined}
          >
            {/* Card Header with Primary Field and Actions */}
            <View style={cardHeaderStyles}>
              {primaryColumn && (
                <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
                  <Text style={primaryFieldStyles}>
                    {renderFieldValue(primaryColumn, record, rowIndex)}
                  </Text>
                </View>
              )}
              
              {/* Actions in header if present */}
              {actionsColumn && (
                <View>
                  {renderFieldValue(actionsColumn, record, rowIndex)}
                </View>
              )}
            </View>

            {/* Key-Value Pairs for remaining fields */}
            {dataColumns.slice(1).map((column) => (
              <View key={column.key} style={fieldRowStyles}>
                <Text style={keyTextStyles}>
                  {column.title}
                </Text>
                {renderFieldValue(column, record, rowIndex)}
              </View>
            ))}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};