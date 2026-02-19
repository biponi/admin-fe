import { create } from 'zustand';

interface OrderModalStore {
  isOpen: boolean;
  orderNumber: number | null;
  openModal: (orderNumber: number) => void;
  closeModal: () => void;
}

export const useOrderModalStore = create<OrderModalStore>((set) => ({
  isOpen: false,
  orderNumber: null,
  openModal: (orderNumber) => set({ isOpen: true, orderNumber }),
  closeModal: () => set({ isOpen: false, orderNumber: null }),
}));
