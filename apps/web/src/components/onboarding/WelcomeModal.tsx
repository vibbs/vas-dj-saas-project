'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, Button } from '@vas-dj-saas/ui';

export interface WelcomeModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** User's first name for personalization */
  userName?: string;
  /** Callback when user clicks Get Started */
  onGetStarted: () => void;
  /** Callback when user clicks Skip */
  onSkip: () => void;
  /** Callback when modal is closed */
  onClose: () => void;
}

// Feature icons
const ProfileIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: 24, height: 24 }}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const TeamIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: 24, height: 24 }}
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const DashboardIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: 24, height: 24 }}
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const RocketIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: 48, height: 48 }}
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

// Feature items for the welcome screen
const FEATURES = [
  {
    icon: ProfileIcon,
    title: 'Set up your profile',
    description: 'Personalize your account with your details',
  },
  {
    icon: TeamIcon,
    title: 'Collaborate with your team',
    description: 'Invite members and work together',
  },
  {
    icon: DashboardIcon,
    title: 'Explore the dashboard',
    description: 'Discover powerful tools and insights',
  },
];

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  userName,
  onGetStarted,
  onSkip,
  onClose,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Trigger animation on open
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const greeting = userName ? `Welcome, ${userName}!` : 'Welcome!';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      position="center"
      showCloseButton={false}
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      <div style={{ textAlign: 'center' }}>
        {/* Animated rocket icon */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 24,
            color: 'var(--color-primary)',
            animation: isAnimating ? 'bounceIn 0.6s ease-out' : 'none',
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RocketIcon />
          </div>
        </div>

        {/* Greeting */}
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--color-foreground)',
            margin: 0,
            marginBottom: 8,
          }}
        >
          {greeting}
        </h2>

        <p
          style={{
            fontSize: 15,
            color: 'var(--color-muted-foreground)',
            margin: 0,
            marginBottom: 32,
            lineHeight: 1.5,
          }}
        >
          Let&apos;s get you set up so you can make the most of your experience.
          It only takes a few minutes.
        </p>

        {/* Features list */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: 16,
                backgroundColor: 'var(--color-muted)',
                borderRadius: 12,
                border: '1px solid var(--color-secondary)',
                textAlign: 'left',
                animation: isAnimating
                  ? `slideInUp 0.4s ease-out ${0.1 + index * 0.1}s both`
                  : 'none',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  backgroundColor: 'var(--color-primary-muted)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <feature.icon />
              </div>
              <div>
                <h4
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--color-foreground)',
                    margin: 0,
                    marginBottom: 2,
                  }}
                >
                  {feature.title}
                </h4>
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--color-muted-foreground)',
                    margin: 0,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={onGetStarted}
            style={{ width: '100%' }}
          >
            Get Started
          </Button>
          <button
            onClick={onSkip}
            style={{
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--color-muted-foreground)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 8,
              transition: 'color 0.2s ease-in-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-foreground)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-muted-foreground)';
            }}
          >
            Skip for now
          </button>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes bounceIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Dialog>
  );
};

export default WelcomeModal;
