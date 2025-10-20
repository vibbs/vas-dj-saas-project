'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStatus } from '@vas-dj-saas/auth';
import { env } from '@/lib/env';

/**
 * Landing Page
 * Main entry point for the application
 */
export default function Home() {
  const router = useRouter();
  const authStatus = useAuthStatus();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (authStatus === 'authenticated') {
      router.push('/dashboard');
    }
  }, [authStatus, router]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {env.appName}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                Sign In
              </Link>
              {env.features.registration && (
                <Link
                  href="/register-organization"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            Build Amazing Things
            <br />
            <span className="text-blue-600 dark:text-blue-400">Together</span>
          </h2>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            The all-in-one platform for managing your projects, teams, and workflows.
            Get started today and transform the way you work.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            {env.features.registration && (
              <Link
                href="/register-organization"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              >
                Create Free Account
              </Link>
            )}
            <Link
              href="/login"
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-lg transition-all w-full sm:w-auto"
            >
              Sign In
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
            <FeatureCard
              title="Collaborative"
              description="Work together seamlessly with your team in real-time"
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
            <FeatureCard
              title="Secure"
              description="Enterprise-grade security to keep your data safe"
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />
            <FeatureCard
              title="Scalable"
              description="Grow from startup to enterprise with ease"
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-8 bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} {env.appName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="text-blue-600 dark:text-blue-400 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
