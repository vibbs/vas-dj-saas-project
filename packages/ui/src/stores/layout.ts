import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface LayoutState {
  // Sidebar state
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Mobile states
  isMobileMenuOpen: boolean;
  
  // Theme and appearance
  isDarkMode: boolean;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      isMobileMenuOpen: false,
      isDarkMode: false,

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      
      setDarkMode: (dark) => set({ isDarkMode: dark }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'layout-store',
      storage: createJSONStorage(() => {
        // Use localStorage on web, fallback to memory on other platforms
        if (typeof window !== 'undefined' && window.localStorage) {
          return {
            getItem: (name) => localStorage.getItem(name),
            setItem: (name, value) => localStorage.setItem(name, value),
            removeItem: (name) => localStorage.removeItem(name),
          };
        }
        
        // Memory storage fallback
        const memoryStorage = new Map<string, string>();
        return {
          getItem: (name) => memoryStorage.get(name) ?? null,
          setItem: (name, value) => void memoryStorage.set(name, value),
          removeItem: (name) => void memoryStorage.delete(name),
        };
      }),
      partialize: (state) => ({
        // Only persist user preferences, not temporary states
        sidebarCollapsed: state.sidebarCollapsed,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);

// Convenience hooks
export const useSidebarState = () => useLayoutStore((state) => ({
  isOpen: state.sidebarOpen,
  isCollapsed: state.sidebarCollapsed,
  setSidebarOpen: state.setSidebarOpen,
  toggleSidebar: state.toggleSidebar,
  setSidebarCollapsed: state.setSidebarCollapsed,
  toggleSidebarCollapsed: state.toggleSidebarCollapsed,
}));

export const useMobileMenuState = () => useLayoutStore((state) => ({
  isOpen: state.isMobileMenuOpen,
  setMobileMenuOpen: state.setMobileMenuOpen,
  toggleMobileMenu: state.toggleMobileMenu,
}));

export const useThemeState = () => useLayoutStore((state) => ({
  isDarkMode: state.isDarkMode,
  setDarkMode: state.setDarkMode,
  toggleDarkMode: state.toggleDarkMode,
}));