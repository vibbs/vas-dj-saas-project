"use client";

import React from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Heading } from '../Heading';
import { Text } from '../Text';
import { useTheme } from '../../theme/ThemeProvider';
import type { EntityDrawerProps } from './types';

/**
 * EntityDrawer Component (Framework-Agnostic)
 *
 * Lightweight drawer that opens based on URL query parameter (default: ?selected=id).
 * This component follows the Hexagonal Architecture pattern:
 * - Accepts a TabRouterPort implementation via props
 * - No direct framework dependencies (Next.js, React Navigation, etc.)
 * - Fully portable across web and mobile platforms
 *
 * Features:
 * - Preserves list context (table/grid remains mounted)
 * - Shareable deep links
 * - Slides from right on desktop, bottom sheet on mobile
 * - Uses router adapter for URL management
 *
 * @example
 * ```tsx
 * // Web (Next.js)
 * import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';
 * import { EntityDrawer } from '@vas-dj-saas/ui';
 *
 * function MembersPage() {
 *   const router = useNextTabRouter();
 *   const selectedId = router.getValue('selected');
 *
 *   function handleRowClick(id: string) {
 *     router.setValue('selected', id);
 *   }
 *
 *   return (
 *     <>
 *       <MembersTable onRowClick={handleRowClick} />
 *       <EntityDrawer router={router} title="Member Details">
 *         <MemberDetails id={selectedId} />
 *       </EntityDrawer>
 *     </>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Mobile (React Navigation)
 * import { useReactNavTabRouter } from '@vas-dj-saas/adapters/react-navigation-router';
 * import { EntityDrawer } from '@vas-dj-saas/ui';
 *
 * function MembersScreen() {
 *   const router = useReactNavTabRouter();
 *   return <EntityDrawer router={router} title="Member Details">...</EntityDrawer>;
 * }
 * ```
 */
export const EntityDrawer: React.FC<EntityDrawerProps> = ({
    children,
    title,
    description,
    router,
    queryParam = 'selected',
    side = 'right',
    size = 'md',
    showCloseButton = true,
    className,
    style,
    testID,
    onOpen,
    onClose,
    headerActions,
}) => {
    const { theme } = useTheme();

    // Get the selected entity ID from router
    const selectedId = router.getValue(queryParam);
    const isOpen = !!selectedId;

    // Track previous open state to trigger onOpen callback
    const prevIsOpen = React.useRef(isOpen);

    React.useEffect(() => {
        if (isOpen && !prevIsOpen.current && selectedId) {
            onOpen?.(selectedId);
        }
        prevIsOpen.current = isOpen;
    }, [isOpen, selectedId, onOpen]);

    /**
     * Close drawer by removing the query parameter
     */
    const handleClose = React.useCallback(() => {
        router.setValue(queryParam, ''); // Empty string triggers deletion in adapter
        onClose?.();
    }, [router, queryParam, onClose]);

    // Size mapping for drawer width
    const getSizeStyles = () => {
        const sizes = {
            sm: { maxWidth: '360px', width: '100%' },
            md: { maxWidth: '480px', width: '100%' },
            lg: { maxWidth: '640px', width: '100%' },
            xl: { maxWidth: '800px', width: '100%' },
            full: { maxWidth: '100vw', width: '100%' },
        };
        return sizes[size];
    };

    // Drawer animation styles based on side
    const getDrawerStyles = () => {
        const sizeStyles = getSizeStyles();

        const baseStyles: React.CSSProperties = {
            position: 'fixed' as const,
            ...sizeStyles,
            height: '100vh',
            backgroundColor: theme.colors.background,
            boxShadow: theme.shadows.lg,
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            ...style,
        };

        switch (side) {
            case 'right':
                return {
                    ...baseStyles,
                    top: 0,
                    right: 0,
                    borderLeft: `1px solid ${theme.colors.border}`,
                };
            case 'left':
                return {
                    ...baseStyles,
                    top: 0,
                    left: 0,
                    borderRight: `1px solid ${theme.colors.border}`,
                };
            case 'bottom':
                return {
                    ...baseStyles,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 'auto',
                    maxHeight: '85vh',
                    borderTop: `1px solid ${theme.colors.border}`,
                };
            case 'top':
                return {
                    ...baseStyles,
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 'auto',
                    maxHeight: '85vh',
                    borderBottom: `1px solid ${theme.colors.border}`,
                };
            default:
                return baseStyles;
        }
    };

    // Use Modal as base with custom variant
    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            variant="default"
            closeOnBackdropClick={true}
            closeOnEscape={true}
            showCloseButton={false}
            testID={testID}
            aria-labelledby={title ? 'drawer-title' : undefined}
            aria-describedby={description ? 'drawer-description' : undefined}
        >
            <div style={getDrawerStyles()} className={className}>
                {/* Header */}
                {(title || showCloseButton || headerActions) && (
                    <div
                        style={{
                            padding: `${theme.spacing.lg}px`,
                            borderBottom: `1px solid ${theme.colors.border}`,
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: theme.spacing.md,
                        }}
                    >
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {title && (
                                <Heading
                                    id="drawer-title"
                                    level={3}
                                    style={{ marginBottom: description ? theme.spacing.xs : 0 }}
                                >
                                    {title}
                                </Heading>
                            )}
                            {description && (
                                <Text
                                    id="drawer-description"
                                    color="secondary"
                                    size="sm"
                                >
                                    {description}
                                </Text>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                            {headerActions}
                            {showCloseButton && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onPress={handleClose}
                                    aria-label="Close drawer"
                                    style={{ padding: theme.spacing.xs }}
                                >
                                    <Icon name="X" size={20} />
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Content */}
                <div
                    style={{
                        flex: 1,
                        overflow: 'auto',
                        padding: `${theme.spacing.lg}px`,
                    }}
                >
                    {children}
                </div>
            </div>
        </Modal>
    );
};

EntityDrawer.displayName = 'EntityDrawer';
