'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthActions } from '@vas-dj-saas/auth';
import type { Account } from '@vas-dj-saas/api-client';
import { env } from '@/lib/env';

export interface DashboardNavProps {
  account: Account;
}

/**
 * Dashboard Navigation
 * Top navigation bar for authenticated users
 */
export function DashboardNav({ account }: DashboardNavProps) {
  const router = useRouter();
  const { logout } = useAuthActions();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if API call fails
      router.push('/login');
    }
  };

  return (
    <nav
      className="border-b"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span
                className="text-xl font-semibold"
                style={{ color: 'var(--color-foreground)' }}
              >
                {env.appName}
              </span>
            </Link>

            {/* Main Navigation */}
            <div className="hidden md:flex space-x-6">
              <Link
                href="/dashboard"
                className="font-medium transition-colors"
                style={{ color: 'var(--color-foreground)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = 'var(--color-primary)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = 'var(--color-foreground)')
                }
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/projects"
                className="font-medium transition-colors"
                style={{ color: 'var(--color-foreground)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = 'var(--color-primary)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = 'var(--color-foreground)')
                }
              >
                Projects
              </Link>
              <Link
                href="/dashboard/team"
                className="font-medium transition-colors"
                style={{ color: 'var(--color-foreground)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = 'var(--color-primary)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = 'var(--color-foreground)')
                }
              >
                Team
              </Link>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 focus:outline-none"
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <span className="text-white font-semibold text-sm">
                  {account.abbreviatedName}
                </span>
              </div>

              {/* User Info */}
              <div className="hidden md:block text-left">
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  {account.fullName}
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  {account.email}
                </p>
              </div>

              {/* Dropdown Icon */}
              <svg
                className={`w-5 h-5 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
                style={{ color: 'var(--color-muted-foreground)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-2 z-50"
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <Link
                  href="/settings/personal?tab=profile"
                  className="block px-4 py-2 text-sm transition-colors"
                  style={{ color: 'var(--color-foreground)' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      'var(--color-secondary)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm transition-colors"
                  style={{ color: 'var(--color-foreground)' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      'var(--color-secondary)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Settings
                </Link>
                <hr
                  className="my-2"
                  style={{ borderColor: 'var(--color-border)' }}
                />
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full text-left px-4 py-2 text-sm disabled:opacity-50 transition-colors"
                  style={{ color: 'var(--color-destructive)' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      'var(--color-secondary)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                >
                  {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </nav>
  );
}
