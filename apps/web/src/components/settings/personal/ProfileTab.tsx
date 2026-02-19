'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  Heading,
  Text,
  Input,
  Select,
  Textarea,
  Button,
  Avatar,
  Spinner,
} from '@vas-dj-saas/ui';
import { User, Save, RefreshCw } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import type { ProfileFormData } from '@/hooks/useProfile';
import { AccountGender } from '@vas-dj-saas/api-client';

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

const genderOptions = [
  { label: 'Prefer not to say', value: '' },
  { label: 'Male', value: AccountGender.MALE },
  { label: 'Female', value: AccountGender.FEMALE },
  { label: 'Other', value: AccountGender.OTHER },
];

/**
 * Profile Tab
 * Personal profile information and settings with edit functionality
 */
export function ProfileTab() {
  const { profile, isLoading, isSaving, error, updateProfile, refresh } = useProfile();

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    dateOfBirth: null,
    gender: '',
    avatar: null,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        dateOfBirth: profile.dateOfBirth || null,
        gender: (profile.gender as AccountGender) || '',
        avatar: profile.avatar || null,
      });
      setHasChanges(false);
    }
  }, [profile]);

  const handleInputChange = useCallback((field: keyof ProfileFormData, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaveSuccess(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);

    const success = await updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      bio: formData.bio,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender as AccountGender,
    });

    if (success) {
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleReset = useCallback(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        dateOfBirth: profile.dateOfBirth || null,
        gender: (profile.gender as AccountGender) || '',
        avatar: profile.avatar || null,
      });
      setHasChanges(false);
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--spacing-3xl) 0',
        }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
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
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <Heading
            level={3}
            style={{
              fontFamily: 'var(--font-family-display)',
              color: 'var(--color-foreground)',
              marginBottom: 'var(--spacing-xs)',
            }}
          >
            Personal Information
          </Heading>
          <Text
            color="muted"
            size="sm"
            style={{
              fontFamily: 'var(--font-family-body)',
            }}
          >
            Manage your personal profile details
          </Text>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
          }}
        >
          <RefreshCw size={14} />
          Refresh
        </Button>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            padding: 'var(--spacing-md)',
            background: 'color-mix(in srgb, var(--color-destructive) 10%, var(--color-card))',
            border: '1px solid var(--color-destructive)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <Text size="sm" style={{ color: 'var(--color-destructive)', margin: 0 }}>
            {error}
          </Text>
        </motion.div>
      )}

      {/* Success Message */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            padding: 'var(--spacing-md)',
            background: 'color-mix(in srgb, var(--color-success) 10%, var(--color-card))',
            border: '1px solid var(--color-success)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <Text size="sm" style={{ color: 'var(--color-success)', margin: 0 }}>
            Profile updated successfully!
          </Text>
        </motion.div>
      )}

      {/* Avatar Section */}
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <Card
          style={{
            padding: 'var(--spacing-lg)',
            background: 'var(--color-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
            <Avatar
              src={formData.avatar || undefined}
              name={`${formData.firstName} ${formData.lastName}`}
              size="xl"
            />
            <div>
              <Text style={{ fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                Profile Photo
              </Text>
              <Text size="sm" color="muted">
                JPG, PNG or GIF. Max size 2MB.
              </Text>
              <div style={{ marginTop: 'var(--spacing-sm)', display: 'flex', gap: 'var(--spacing-sm)' }}>
                <Button type="button" variant="outline" size="sm" disabled>
                  Upload Photo
                </Button>
                {formData.avatar && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInputChange('avatar', null)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Basic Information */}
      <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
        <Card
          style={{
            padding: 'var(--spacing-lg)',
            background: 'var(--color-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
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
              <User size={20} />
            </div>
            <div>
              <h4 style={{ fontWeight: 600, margin: 0, marginBottom: 'var(--spacing-xs)' }}>
                Basic Information
              </h4>
              <Text size="sm" color="muted">
                Your name and primary details
              </Text>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--spacing-md)',
            }}
          >
            <Input
              label="First Name"
              value={formData.firstName}
              onChangeText={(text) => handleInputChange('firstName', text)}
              placeholder="Enter your first name"
              maxLength={30}
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChangeText={(text) => handleInputChange('lastName', text)}
              placeholder="Enter your last name"
              maxLength={30}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              disabled
              helpText="Email cannot be changed here"
            />
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              placeholder="+1 (555) 000-0000"
              maxLength={20}
            />
            <Select
              label="Gender"
              options={genderOptions}
              value={formData.gender}
              onChange={(value) => handleInputChange('gender', value as string)}
              placeholder="Select gender"
            />
            <Input
              label="Date of Birth"
              type="text"
              value={formData.dateOfBirth || ''}
              onChangeText={(text) => handleInputChange('dateOfBirth', text || null)}
              placeholder="YYYY-MM-DD"
              helpText="Format: YYYY-MM-DD"
            />
          </div>
        </Card>
      </motion.div>

      {/* Bio Section */}
      <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
        <Card
          style={{
            padding: 'var(--spacing-lg)',
            background: 'var(--color-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h4 style={{ fontWeight: 600, margin: 0, marginBottom: 'var(--spacing-md)' }}>
            About You
          </h4>
          <Textarea
            value={formData.bio}
            onChange={(value) => handleInputChange('bio', value)}
            placeholder="Tell us a bit about yourself..."
            rows={4}
            style={{ width: '100%' }}
          />
          <Text size="sm" color="muted" style={{ marginTop: 'var(--spacing-xs)' }}>
            {formData.bio.length}/500 characters
          </Text>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div
        custom={3}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 'var(--spacing-md)',
        }}
      >
        {hasChanges && (
          <Button type="button" variant="ghost" onClick={handleReset} disabled={isSaving}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={!hasChanges || isSaving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
          }}
        >
          {isSaving ? (
            <>
              <Spinner size="sm" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </Button>
      </motion.div>
    </form>
  );
}
