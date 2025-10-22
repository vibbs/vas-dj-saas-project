/**
 * Mock implementation of next/navigation for Storybook
 * This allows components using Next.js routing to work in Storybook
 */

let currentSearchParams = new URLSearchParams(
  typeof window !== "undefined" ? window.location.search : ""
);
let currentPathname =
  typeof window !== "undefined" ? window.location.pathname : "/";

// Listen for URL changes
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    currentSearchParams = new URLSearchParams(window.location.search);
    currentPathname = window.location.pathname;
  });
}

export const useRouter = () => ({
  __isStorybookMockRouter: true,
  push: (url: string, options?: { scroll?: boolean }) => {
    console.log("[Mock Router] push:", url, options);
    if (typeof window !== "undefined") {
      const fullUrl = url.startsWith("?")
        ? `${window.location.pathname}${url}`
        : url;
      window.history.pushState({}, "", fullUrl);
      currentSearchParams = new URLSearchParams(window.location.search);
      currentPathname = window.location.pathname;
      // Trigger re-render
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  },
  replace: (url: string, options?: { scroll?: boolean }) => {
    console.log("[Mock Router] replace:", url, options);
    if (typeof window !== "undefined") {
      const fullUrl = url.startsWith("?")
        ? `${window.location.pathname}${url}`
        : url;
      window.history.replaceState({}, "", fullUrl);
      currentSearchParams = new URLSearchParams(window.location.search);
      currentPathname = window.location.pathname;
    }
  },
  prefetch: () => Promise.resolve(),
  back: () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  },
  forward: () => {
    if (typeof window !== "undefined") {
      window.history.forward();
    }
  },
  refresh: () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  },
  pathname: currentPathname,
});

export const useSearchParams = () => {
  if (typeof window !== "undefined") {
    // Return current search params
    return new URLSearchParams(window.location.search);
  }
  return new URLSearchParams();
};

export const usePathname = () => {
  if (typeof window !== "undefined") {
    return window.location.pathname;
  }
  return "/";
};

// Re-export other hooks that might be used
export const useParams = () => ({});
export const useSelectedLayoutSegment = () => null;
export const useSelectedLayoutSegments = () => [];

console.log("[Storybook] Next.js navigation mocks loaded");
