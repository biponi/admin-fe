/**
 * Create Order Store - Zustand State Management
 * Manages the multi-step order creation wizard state
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  IOrderProduct,
  ICustomer,
  IShipping,
  ITransection,
  IPayment,
  DraftOrder,
} from '../types';

interface CreateOrderState {
  // Current step (0-indexed)
  currentStep: number;
  totalSteps: number;

  // Step data
  products: IOrderProduct[];
  customer: Partial<ICustomer>;
  shipping: Partial<IShipping>;
  transaction: Partial<ITransection>;
  payments: IPayment[];
  notes: string;

  // UI State
  isSubmitting: boolean;
  validationErrors: Record<string, string[]>;
  isDirty: boolean;

  // Draft management
  draftId: string | null;
  lastSaved: Date | null;
  autoSaveDrafts: boolean;

  // Actions - Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;

  // Actions - Product management
  addProduct: (product: IOrderProduct) => void;
  removeProduct: (productId: string) => void;
  updateProduct: (productId: string, updates: Partial<IOrderProduct>) => void;
  clearProducts: () => void;

  // Actions - Customer & Shipping
  setCustomer: (customer: Partial<ICustomer>) => void;
  setShipping: (shipping: Partial<IShipping>) => void;

  // Actions - Transaction
  setTransaction: (transaction: Partial<ITransection>) => void;
  calculateTotals: () => void;

  // Actions - Payments
  addPayment: (payment: IPayment) => void;
  removePayment: (index: number) => void;

  // Actions - Notes
  setNotes: (notes: string) => void;

  // Actions - Validation
  validateStep: (step: number) => boolean;
  setValidationErrors: (errors: Record<string, string[]>) => void;
  clearValidationErrors: () => void;

  // Actions - Draft management
  saveDraft: () => Promise<void>;
  loadDraft: (draftId: string) => Promise<void>;
  clearDraft: () => void;

  // Actions - Submission
  setSubmitting: (isSubmitting: boolean) => void;

  // Actions - Reset
  reset: () => void;

  // Getters
  canProceed: () => boolean;
  isStepValid: (step: number) => boolean;
  getOrderData: () => any;
}

const initialState = {
  currentStep: 0,
  totalSteps: 3,
  products: [],
  customer: {},
  shipping: {},
  transaction: {
    totalPrice: 0,
    paid: 0,
    remaining: 0,
    discount: 0,
    deliveryCharge: 0,
  },
  payments: [],
  notes: '',
  isSubmitting: false,
  validationErrors: {},
  isDirty: false,
  draftId: null,
  lastSaved: null,
  autoSaveDrafts: true,
};

export const useCreateOrderStore = create<CreateOrderState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Navigation
        nextStep: () => {
          const { currentStep, totalSteps, validateStep } = get();
          if (currentStep < totalSteps - 1 && validateStep(currentStep)) {
            set({ currentStep: currentStep + 1, isDirty: true });
          }
        },

        prevStep: () => {
          const { currentStep } = get();
          if (currentStep > 0) {
            set({ currentStep: currentStep - 1 });
          }
        },

        goToStep: (step) => {
          const { totalSteps } = get();
          if (step >= 0 && step < totalSteps) {
            set({ currentStep: step });
          }
        },

        // Product management
        addProduct: (product) => {
          set((state) => ({
            products: [...state.products, product],
            isDirty: true,
          }));
          get().calculateTotals();
        },

        removeProduct: (productId) => {
          set((state) => ({
            products: state.products.filter((p) => p.id !== productId),
            isDirty: true,
          }));
          get().calculateTotals();
        },

        updateProduct: (productId, updates) => {
          set((state) => ({
            products: state.products.map((p) =>
              p.id === productId ? { ...p, ...updates } : p
            ),
            isDirty: true,
          }));
          get().calculateTotals();
        },

        clearProducts: () => {
          set({ products: [], isDirty: true });
          get().calculateTotals();
        },

        // Customer & Shipping
        setCustomer: (customer) => {
          set((state) => ({
            customer: { ...state.customer, ...customer },
            isDirty: true,
          }));
        },

        setShipping: (shipping) => {
          set((state) => ({
            shipping: { ...state.shipping, ...shipping },
            isDirty: true,
          }));
        },

        // Transaction
        setTransaction: (transaction) => {
          set((state) => ({
            transaction: { ...state.transaction, ...transaction },
            isDirty: true,
          }));
        },

        calculateTotals: () => {
          const { products, transaction } = get();

          const subtotal = products.reduce((sum, product) => {
            return sum + (product.totalPrice || product.unitPrice * product.quantity);
          }, 0);

          const discount = transaction.discount || 0;
          const deliveryCharge = transaction.deliveryCharge || 0;
          const totalPrice = subtotal - discount + deliveryCharge;
          const paid = transaction.paid || 0;
          const remaining = totalPrice - paid;

          set((state) => ({
            transaction: {
              ...state.transaction,
              totalPrice,
              paid,
              remaining,
            },
          }));
        },

        // Payments
        addPayment: (payment) => {
          set((state) => {
            const newPayments = [...state.payments, payment];
            const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
            return {
              payments: newPayments,
              transaction: {
                ...state.transaction,
                paid: totalPaid,
                remaining: (state.transaction.totalPrice || 0) - totalPaid,
              },
              isDirty: true,
            };
          });
        },

        removePayment: (index) => {
          set((state) => {
            const newPayments = state.payments.filter((_, i) => i !== index);
            const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
            return {
              payments: newPayments,
              transaction: {
                ...state.transaction,
                paid: totalPaid,
                remaining: (state.transaction.totalPrice || 0) - totalPaid,
              },
              isDirty: true,
            };
          });
        },

        // Notes
        setNotes: (notes) => {
          set({ notes, isDirty: true });
        },

        // Validation
        validateStep: (step) => {
          const state = get();
          const errors: Record<string, string[]> = {};

          switch (step) {
            case 0: // Products
              if (state.products.length === 0) {
                errors.products = ['Please add at least one product'];
              }
              break;

            case 1: // Customer & Shipping
              if (!state.customer.name) {
                errors.customerName = ['Customer name is required'];
              }
              if (!state.customer.phoneNumber) {
                errors.customerPhone = ['Phone number is required'];
              }
              if (!state.shipping.division) {
                errors.division = ['Division is required'];
              }
              if (!state.shipping.district) {
                errors.district = ['District is required'];
              }
              if (!state.shipping.address) {
                errors.address = ['Address is required'];
              }
              break;

            case 2: // Review
              // All validations should pass before reaching review
              break;
          }

          set({ validationErrors: errors });
          return Object.keys(errors).length === 0;
        },

        setValidationErrors: (errors) => {
          set({ validationErrors: errors });
        },

        clearValidationErrors: () => {
          set({ validationErrors: {} });
        },

        // Draft management
        saveDraft: async () => {
          const state = get();
          const draft: DraftOrder = {
            id: state.draftId || `draft_${Date.now()}`,
            createdAt: state.draftId ? (state.lastSaved || new Date()) : new Date(),
            updatedAt: new Date(),
            step: state.currentStep,
            data: {
              products: state.products,
              customer: state.customer,
              shipping: state.shipping,
              transaction: state.transaction,
              notes: state.notes,
            },
          };

          // Save to localStorage or backend
          localStorage.setItem('order_draft_v2', JSON.stringify(draft));

          set({
            draftId: draft.id,
            lastSaved: draft.updatedAt,
            isDirty: false,
          });
        },

        loadDraft: async (draftId) => {
          try {
            const draftJson = localStorage.getItem('order_draft_v2');
            if (draftJson) {
              const draft: DraftOrder = JSON.parse(draftJson);
              if (draft.id === draftId) {
                set({
                  products: draft.data.products || [],
                  customer: draft.data.customer || {},
                  shipping: draft.data.shipping || {},
                  transaction: draft.data.transaction || initialState.transaction,
                  notes: draft.data.notes || '',
                  currentStep: draft.step,
                  draftId: draft.id,
                  lastSaved: new Date(draft.updatedAt),
                  isDirty: false,
                });
                get().calculateTotals();
              }
            }
          } catch (error) {
            console.error('Failed to load draft:', error);
          }
        },

        clearDraft: () => {
          localStorage.removeItem('order_draft_v2');
          set({
            draftId: null,
            lastSaved: null,
            isDirty: false,
          });
        },

        // Submission
        setSubmitting: (isSubmitting) => {
          set({ isSubmitting });
        },

        // Reset
        reset: () => {
          set(initialState);
          get().clearDraft();
        },

        // Getters
        canProceed: () => {
          const { currentStep, validateStep } = get();
          return validateStep(currentStep);
        },

        isStepValid: (step) => {
          const { validateStep } = get();
          return validateStep(step);
        },

        getOrderData: () => {
          const state = get();
          return {
            products: state.products,
            customer: state.customer,
            shipping: state.shipping,
            totalPrice: state.transaction.totalPrice,
            paid: state.transaction.paid,
            discount: state.transaction.discount,
            deliveryCharge: state.transaction.deliveryCharge,
            payment: state.payments,
            notes: state.notes,
          };
        },
      }),
      {
        name: 'create-order-store-v2',
        partialize: (state) => ({
          // Persist draft data
          autoSaveDrafts: state.autoSaveDrafts,
        }),
      }
    )
  )
);
