'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  Heading,
  Text,
  Input,
  Button,
  Spinner,
  Badge,
} from '@vas-dj-saas/ui';
import {
  Lock,
  Smartphone,
  MonitorSmartphone,
  History,
  Eye,
  EyeOff,
  Mail,
  LogOut,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useSecurity, type PasswordChangeData } from '@/hooks/useSecurity';

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

/**
 * Security Tab
 * Password, 2FA, and security settings
 */
export function SecurityTab() {
  const {
    isChangingPassword,
    passwordChangeError,
    changePassword,
    isRequestingReset,
    requestPasswordReset,
    is2FAEnabled,
    sessions,
    isLoadingSessions,
    revokeSession,
  } = useSecurity();

  // Password form state
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  const handlePasswordChange = useCallback(
    (field: keyof PasswordChangeData, value: string) => {
      setPasswordData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    await changePassword(passwordData);
  };

  const handleRequestPasswordReset = async () => {
    const success = await requestPasswordReset();
    if (success) {
      setPasswordResetSent(true);
      setTimeout(() => setPasswordResetSent(false), 5000);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-lg)',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heading
          level={3}
          style={{
            fontFamily: 'var(--font-family-display)',
            color: 'var(--color-foreground)',
            marginBottom: 'var(--spacing-xs)',
          }}
        >
          Security Settings
        </Heading>
        <Text
          color="muted"
          size="sm"
          style={{
            fontFamily: 'var(--font-family-body)',
          }}
        >
          Manage your password, two-factor authentication, and security preferences
        </Text>
      </motion.div>

      {/* Password Section */}
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <Card
          style={{
            padding: 'var(--spacing-lg)',
            background: 'var(--color-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--spacing-md)',
              marginBottom: 'var(--spacing-lg)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
                flexShrink: 0,
              }}
            >
              <Lock size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: 600, margin: 0, marginBottom: 'var(--spacing-xs)' }}>
                Password
              </h4>
              <Text size="sm" color="muted">
                Change your password or request a password reset email
              </Text>
            </div>
          </div>

          {/* Error/Success Messages */}
          {passwordChangeError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: 'var(--spacing-md)',
                background: 'color-mix(in srgb, var(--color-warning) 10%, var(--color-card))',
                border: '1px solid var(--color-warning)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--spacing-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
              }}
            >
              <AlertCircle size={16} style={{ color: 'var(--color-warning)' }} />
              <Text size="sm" style={{ color: 'var(--color-warning)', margin: 0 }}>
                {passwordChangeError}
              </Text>
            </motion.div>
          )}

          {passwordResetSent && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: 'var(--spacing-md)',
                background: 'color-mix(in srgb, var(--color-success) 10%, var(--color-card))',
                border: '1px solid var(--color-success)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--spacing-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
              }}
            >
              <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
              <Text size="sm" style={{ color: 'var(--color-success)', margin: 0 }}>
                Password reset email sent! Check your inbox.
              </Text>
            </motion.div>
          )}

          {/* Password Change Form */}
          <form onSubmit={handleSubmitPasswordChange}>
            <div
              style={{
                display: 'grid',
                gap: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Input
                  label="Current Password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChangeText={(text) => handlePasswordChange('currentPassword', text)}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '34px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-muted-foreground)',
                  }}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <Input
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChangeText={(text) => handlePasswordChange('newPassword', text)}
                  placeholder="Enter new password"
                  helpText="Minimum 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '34px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-muted-foreground)',
                  }}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Input
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChangeText={(text) => handlePasswordChange('confirmPassword', text)}
                placeholder="Confirm new password"
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
              <Button
                type="submit"
                variant="primary"
                disabled={
                  isChangingPassword ||
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword
                }
              >
                {isChangingPassword ? (
                  <>
                    <Spinner size="sm" />
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleRequestPasswordReset}
                disabled={isRequestingReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)',
                }}
              >
                <Mail size={16} />
                {isRequestingReset ? 'Sending...' : 'Send Reset Email'}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>

      {/* Two-Factor Authentication */}
      <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
        <Card
          style={{
            padding: 'var(--spacing-lg)',
            background: 'var(--color-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 'var(--spacing-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: `color-mix(in srgb, var(--color-success) 15%, transparent)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-success)',
                  flexShrink: 0,
                }}
              >
                <Smartphone size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <h4 style={{ fontWeight: 600, margin: 0 }}>Two-Factor Authentication</h4>
                  <Badge variant={is2FAEnabled ? 'success' : 'warning'}>
                    {is2FAEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <Text size="sm" color="muted" style={{ marginTop: 'var(--spacing-xs)' }}>
                  Add an extra layer of security to your account using an authenticator app.
                </Text>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              {is2FAEnabled ? 'Disable' : 'Enable'} 2FA
            </Button>
          </div>
          <Text
            size="sm"
            color="muted"
            style={{
              marginTop: 'var(--spacing-md)',
              padding: 'var(--spacing-sm)',
              background: 'var(--color-muted)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            Two-factor authentication is coming soon. Stay tuned!
          </Text>
        </Card>
      </motion.div>

      {/* Active Sessions */}
      <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
        <Card
          style={{
            padding: 'var(--spacing-lg)',
            background: 'var(--color-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--spacing-md)',
              marginBottom: 'var(--spacing-lg)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: `color-mix(in srgb, var(--color-info) 15%, transparent)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-info)',
                flexShrink: 0,
              }}
            >
              <MonitorSmartphone size={20} />
            </div>
            <div>
              <h4 style={{ fontWeight: 600, margin: 0, marginBottom: 'var(--spacing-xs)' }}>
                Active Sessions
              </h4>
              <Text size="sm" color="muted">
                View and manage devices where you&apos;re currently logged in.
              </Text>
            </div>
          </div>

          {isLoadingSessions ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-lg)' }}>
              <Spinner size="md" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {sessions.map((session) => (
                <div
                  key={session.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--spacing-md)',
                    background: 'var(--color-muted)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <MonitorSmartphone
                      size={20}
                      style={{ color: 'var(--color-muted-foreground)' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <Text style={{ fontWeight: 500, margin: 0 }}>{session.device}</Text>
                        {session.isCurrent && (
                          <Badge variant="success" size="sm">
                            Current
                          </Badge>
                        )}
                      </div>
                      <Text size="sm" color="muted" style={{ margin: 0 }}>
                        {session.location} • Last active:{' '}
                        {new Date(session.lastActive).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeSession(session.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                        color: 'var(--color-destructive)',
                      }}
                    >
                      <LogOut size={14} />
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Security Log */}
      <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
        <Card
          style={{
            padding: 'var(--spacing-lg)',
            background: 'var(--color-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: `color-mix(in srgb, var(--color-accent) 15%, transparent)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-accent)',
                flexShrink: 0,
              }}
            >
              <History size={20} />
            </div>
            <div>
              <h4 style={{ fontWeight: 600, margin: 0, marginBottom: 'var(--spacing-xs)' }}>
                Security Log
              </h4>
              <Text size="sm" color="muted">
                Recent security events and login activity.
              </Text>
              <Text
                size="sm"
                color="muted"
                style={{
                  marginTop: 'var(--spacing-sm)',
                  fontStyle: 'italic',
                }}
              >
                Security log feature coming soon.
              </Text>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
