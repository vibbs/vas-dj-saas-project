import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarProps, SidebarItem } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { springConfig, staggerContainer, staggerItem } from '../../animations';
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import { Button } from '../Button';

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  collapsed = false,
  collapsible = true,
  position = 'left',
  overlay = false,
  width = 280,
  collapsedWidth = 64,
  variant = 'default',
  onItemClick,
  onToggle,
  className,
  testID,
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  header,
  footer,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const currentWidth = collapsed ? collapsedWidth : width;

  const handleItemClick = (item: SidebarItem) => {
    if (item.children && item.children.length > 0) {
      setExpandedItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(item.id)) {
          newSet.delete(item.id);
        } else {
          newSet.add(item.id);
        }
        return newSet;
      });
    } else if (!item.disabled) {
      onItemClick?.(item);
    }
  };

  const handleToggle = () => {
    if (collapsible) {
      onToggle?.(!collapsed);
    }
  };

  const variantStyles = {
    default: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
      shadow: overlay ? theme.shadows.xl : 'none',
    },
    minimal: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      shadow: 'none',
    },
    floating: {
      backgroundColor: theme.colors.card,
      borderColor: 'transparent',
      shadow: theme.shadows.xl,
      borderRadius: theme.borders.radius.xl,
      margin: theme.spacing.md,
    },
    glass: {
      backgroundColor: theme.colors.glass,
      borderColor: theme.colors.glassBorder,
      shadow: theme.shadows.lg,
      backdropFilter: 'blur(16px)',
    },
  };

  const currentVariant =
    variantStyles[variant as keyof typeof variantStyles] ||
    variantStyles.default;

  const sidebarStyles: React.CSSProperties = {
    position: overlay ? 'fixed' : 'relative',
    top: overlay ? 0 : 'auto',
    [position]: overlay ? 0 : 'auto',
    width: typeof currentWidth === 'number' ? `${currentWidth}px` : currentWidth,
    height: overlay ? '100vh' : '100%',
    backgroundColor: currentVariant.backgroundColor,
    border:
      variant !== 'minimal'
        ? `${theme.borders.width.thin}px solid ${currentVariant.borderColor}`
        : 'none',
    boxShadow: currentVariant.shadow,
    borderRadius:
      variant === 'floating'
        ? (currentVariant as typeof variantStyles.floating).borderRadius || 0
        : 0,
    backdropFilter:
      'backdropFilter' in currentVariant
        ? (currentVariant as typeof variantStyles.glass).backdropFilter
        : undefined,
    WebkitBackdropFilter:
      'backdropFilter' in currentVariant
        ? (currentVariant as typeof variantStyles.glass).backdropFilter
        : undefined,
    zIndex: overlay ? 1000 : 'auto',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: theme.typography.fontFamilyBody,
    ...style,
  };

  const SidebarItemComponent: React.FC<{
    item: SidebarItem;
    level: number;
  }> = ({ item, level }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isHovered = hoveredItem === item.id;
    const paddingLeft = theme.spacing.md + level * theme.spacing.lg;

    const itemStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.sm,
      padding: `${theme.spacing.sm + 2}px ${theme.spacing.md}px`,
      paddingLeft: collapsed ? theme.spacing.md : paddingLeft,
      minHeight: 44,
      cursor: item.disabled ? 'not-allowed' : 'pointer',
      color: item.active
        ? theme.colors.primary
        : item.disabled
          ? theme.colors.mutedForeground
          : theme.colors.foreground,
      backgroundColor: 'transparent',
      borderRadius: theme.borders.radius.lg,
      margin: `2px ${theme.spacing.sm}px`,
      opacity: item.disabled ? 0.5 : 1,
      textDecoration: 'none',
      fontSize: theme.typography.fontSize.sm,
      fontWeight: item.active
        ? theme.typography.fontWeight.medium
        : theme.typography.fontWeight.normal,
      position: 'relative',
      border: 'none',
      outline: 'none',
      textAlign: 'left',
      width: `calc(100% - ${theme.spacing.sm * 2}px)`,
    };

    return (
      <div key={item.id}>
        <motion.button
          style={itemStyles}
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-current={item.active ? 'page' : undefined}
          data-testid={testID ? `${testID}-item-${item.id}` : undefined}
          type="button"
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          whileHover={
            item.disabled
              ? undefined
              : {
                  backgroundColor: item.active
                    ? `${theme.colors.primary}20`
                    : theme.colors.muted,
                  x: 2,
                }
          }
          whileTap={item.disabled ? undefined : { scale: 0.98 }}
          transition={springConfig.snappy}
        >
          {/* Active indicator */}
          <AnimatePresence>
            {item.active && (
              <motion.div
                layoutId="activeIndicator"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  width: 3,
                  height: '60%',
                  backgroundColor: theme.colors.primary,
                  borderRadius: `0 ${theme.borders.radius.full}px ${theme.borders.radius.full}px 0`,
                }}
                initial={{ opacity: 0, y: '-50%', scaleY: 0 }}
                animate={{ opacity: 1, y: '-50%', scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={springConfig.snappy}
              />
            )}
          </AnimatePresence>

          {/* Active background glow */}
          {item.active && (
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: `${theme.colors.primary}12`,
                borderRadius: theme.borders.radius.lg,
                zIndex: -1,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}

          {item.icon && (
            <motion.span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                flexShrink: 0,
                color: item.active ? theme.colors.primary : 'inherit',
              }}
              animate={{
                scale: isHovered && !item.disabled ? 1.1 : 1,
              }}
              transition={springConfig.snappy}
            >
              {item.icon}
            </motion.span>
          )}

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.sm,
                  flex: 1,
                  minWidth: 0,
                }}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </span>

                {item.badge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={springConfig.bouncy}
                    style={{
                      backgroundColor: item.active
                        ? theme.colors.primary
                        : theme.colors.primaryMuted,
                      color: item.active
                        ? theme.colors.primaryForeground
                        : theme.colors.primary,
                      fontSize: theme.typography.fontSize.xs,
                      padding: `2px ${theme.spacing.xs}px`,
                      borderRadius: theme.borders.radius.full,
                      minWidth: 20,
                      height: 20,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: theme.typography.fontWeight.semibold,
                    }}
                  >
                    {item.badge}
                  </motion.span>
                )}

                {hasChildren && (
                  <motion.span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      color: theme.colors.mutedForeground,
                    }}
                    animate={{ rotate: isExpanded ? 0 : -90 }}
                    transition={springConfig.snappy}
                  >
                    <ChevronDown size={14} />
                  </motion.span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Children items */}
        <AnimatePresence>
          {hasChildren && isExpanded && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={springConfig.gentle}
              style={{ overflow: 'hidden' }}
            >
              {item.children!.map((child) => (
                <SidebarItemComponent
                  key={child.id}
                  item={child}
                  level={level + 1}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      {/* Overlay backdrop */}
      <AnimatePresence>
        {overlay && !collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: theme.colors.overlay,
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 999,
            }}
            onClick={() => onToggle?.(true)}
          />
        )}
      </AnimatePresence>

      <motion.nav
        style={sidebarStyles}
        className={className}
        data-testid={testID}
        aria-label={ariaLabel || accessibilityLabel || 'Sidebar navigation'}
        aria-describedby={ariaDescribedBy}
        role="navigation"
        initial={false}
        animate={{
          width: currentWidth,
          x: overlay && collapsed ? (position === 'left' ? -width : width) : 0,
        }}
        transition={springConfig.gentle}
        {...props}
      >
        {/* Header */}
        {header && (
          <motion.div
            style={{
              padding: theme.spacing.md,
              borderBottom:
                variant !== 'minimal'
                  ? `${theme.borders.width.thin}px solid ${theme.colors.border}`
                  : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'space-between',
              gap: theme.spacing.sm,
            }}
            layout
          >
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={springConfig.snappy}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  {header}
                </motion.div>
              )}
            </AnimatePresence>
            {collapsible && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggle}
                  aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  style={{
                    padding: theme.spacing.sm,
                    minWidth: 'auto',
                    width: 36,
                    height: 36,
                  }}
                >
                  <motion.div
                    animate={{ rotate: collapsed ? 180 : 0 }}
                    transition={springConfig.snappy}
                  >
                    {collapsed ? <Menu size={18} /> : <X size={18} />}
                  </motion.div>
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: theme.spacing.xs,
          }}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              variants={staggerItem}
              custom={index}
              initial="hidden"
              animate="visible"
            >
              <SidebarItemComponent item={item} level={0} />
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <AnimatePresence>
          {footer && !collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={springConfig.gentle}
              style={{
                padding: theme.spacing.md,
                borderTop:
                  variant !== 'minimal'
                    ? `${theme.borders.width.thin}px solid ${theme.colors.border}`
                    : 'none',
              }}
            >
              {footer}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};
