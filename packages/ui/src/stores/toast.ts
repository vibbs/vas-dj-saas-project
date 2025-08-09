import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // in milliseconds, 0 means persistent
  createdAt: Date;
}

interface ToastState {
  toasts: Toast[];
  
  // Actions
  addToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  
  // Convenience methods
  success: (title: string, message?: string, duration?: number) => string;
  error: (title: string, message?: string, duration?: number) => string;
  warning: (title: string, message?: string, duration?: number) => string;
  info: (title: string, message?: string, duration?: number) => string;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = generateId();
    const newToast: Toast = {
      ...toast,
      id,
      createdAt: new Date(),
      duration: toast.duration ?? 5000, // Default 5 seconds
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove toast after duration (unless duration is 0)
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  },

  success: (title, message, duration) => {
    return get().addToast({ type: 'success', title, message, duration });
  },

  error: (title, message, duration = 7000) => {
    return get().addToast({ type: 'error', title, message, duration });
  },

  warning: (title, message, duration = 6000) => {
    return get().addToast({ type: 'warning', title, message, duration });
  },

  info: (title, message, duration) => {
    return get().addToast({ type: 'info', title, message, duration });
  },
}));

// Convenience hooks
export const useToasts = () => useToastStore((state) => state.toasts);
export const useToastActions = () => useToastStore((state) => ({
  addToast: state.addToast,
  removeToast: state.removeToast,
  clearAllToasts: state.clearAllToasts,
  success: state.success,
  error: state.error,
  warning: state.warning,
  info: state.info,
}));