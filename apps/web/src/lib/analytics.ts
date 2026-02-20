/**
 * Analytics Provider
 *
 * Lightweight analytics abstraction. Configure with PostHog, Mixpanel,
 * or any provider by implementing the AnalyticsProvider interface.
 *
 * Set NEXT_PUBLIC_POSTHOG_KEY to enable PostHog.
 * Falls back to console logging in development when no provider is configured.
 */

interface AnalyticsProvider {
  init(): void;
  track(event: string, properties?: Record<string, unknown>): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
  page(name?: string, properties?: Record<string, unknown>): void;
  reset(): void;
}

class ConsoleAnalytics implements AnalyticsProvider {
  init() {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Initialized (console mode)');
    }
  }
  track(event: string, properties?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Track:', event, properties);
    }
  }
  identify(userId: string, traits?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Identify:', userId, traits);
    }
  }
  page(name?: string, properties?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Page:', name, properties);
    }
  }
  reset() {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Reset');
    }
  }
}

class PostHogAnalytics implements AnalyticsProvider {
  private posthog: any = null;

  async init() {
    if (typeof window === 'undefined') return;
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
    if (!key) return;

    try {
      const posthog = (await import('posthog-js')).default;
      posthog.init(key, {
        api_host: host,
        capture_pageview: false, // We capture manually
        capture_pageleave: true,
      });
      this.posthog = posthog;
    } catch {
      console.warn('[Analytics] Failed to initialize PostHog');
    }
  }

  track(event: string, properties?: Record<string, unknown>) {
    this.posthog?.capture(event, properties);
  }

  identify(userId: string, traits?: Record<string, unknown>) {
    this.posthog?.identify(userId, traits);
  }

  page(name?: string, properties?: Record<string, unknown>) {
    this.posthog?.capture('$pageview', { ...properties, $current_url: name || window.location.href });
  }

  reset() {
    this.posthog?.reset();
  }
}

// Select provider based on environment
function createProvider(): AnalyticsProvider {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return new PostHogAnalytics();
  }
  return new ConsoleAnalytics();
}

export const analytics = createProvider();

// Initialize on module load (client-side only)
if (typeof window !== 'undefined') {
  analytics.init();
}
