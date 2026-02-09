import { create } from 'zustand';
import { ReactNode } from 'react';

export interface Modal {
  id: string;
  component: ReactNode;
  props?: Record<string, any>;
  options?: {
    closeOnOverlayClick?: boolean;
    closeOnEscKey?: boolean;
    showCloseButton?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  };
}

interface ModalState {
  modals: Modal[];
  
  // Actions
  openModal: (modal: Omit<Modal, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  updateModal: (id: string, updates: Partial<Omit<Modal, 'id'>>) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useModalStore = create<ModalState>()((set, get) => ({
  modals: [],

  openModal: (modal) => {
    const id = generateId();
    const newModal: Modal = {
      ...modal,
      id,
      options: {
        closeOnOverlayClick: true,
        closeOnEscKey: true,
        showCloseButton: true,
        size: 'md',
        ...modal.options,
      },
    };

    set((state) => ({
      modals: [...state.modals, newModal],
    }));

    return id;
  },

  closeModal: (id) => {
    set((state) => ({
      modals: state.modals.filter((modal) => modal.id !== id),
    }));
  },

  closeAllModals: () => {
    set({ modals: [] });
  },

  updateModal: (id, updates) => {
    set((state) => ({
      modals: state.modals.map((modal) =>
        modal.id === id ? { ...modal, ...updates } : modal
      ),
    }));
  },
}));

// Convenience hooks
export const useModals = () => useModalStore((state) => state.modals);
export const useModalActions = () => useModalStore((state) => ({
  openModal: state.openModal,
  closeModal: state.closeModal,
  closeAllModals: state.closeAllModals,
  updateModal: state.updateModal,
}));

// Helper hook to check if any modals are open
export const useIsModalOpen = () => useModalStore((state) => state.modals.length > 0);