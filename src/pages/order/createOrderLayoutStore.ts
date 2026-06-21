/**
 * Create Order Layout Store - Zustand State Management
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { toast } from "react-hot-toast";
import type {
  IOrderProduct,
  ICustomer,
  IShipping,
  ITransection,
} from "../order/interface.d";
import type { IProduct, IVariation, IImageGroup } from "../product/interface.d";
import { isValidBangladeshiMobileNumber } from "../../utils/helperFunction";

const generateCartItemId = (): string =>
  `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export interface CartItem extends IOrderProduct {
  cartItemId: string;
  selectedVariant?: IVariation;
  imageGroups?: IImageGroup[]; // Store product's image groups for image fallback
  availableStock?: number;
  variantStock?: number;
}

interface CreateOrderLayoutState {
  products: IProduct[];
  filteredProducts: IProduct[];
  searchQuery: string;
  selectedCategory: string;
  selectedBrand: string;
  isLoadingProducts: boolean;
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  pageSize: number;
  cart: CartItem[];
  isCartOpen: boolean;
  selectedCustomer: ICustomer | null;
  customerInfo: Partial<ICustomer>;
  shippingInfo: Partial<IShipping>;
  transaction: Partial<ITransection>;
  notes: string;
  isSubmitting: boolean;
  variationModalOpen: boolean;
  selectedProductForVariation: IProduct | null;
  validationErrors: Record<string, string[]>;
  draftId: string | null;
  lastSaved: Date | null;
  isDirty: boolean;

  setProducts: (products: IProduct[]) => void;
  setProductsResponse: (payload: {
    products: IProduct[];
    totalPages: number;
    totalProducts: number;
  }) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string) => void;
  setSelectedBrand: (brandId: string) => void;
  filterProducts: () => void;
  setLoadingProducts: (isLoading: boolean) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setPaginationInfo: (info: {
    totalPages: number;
    totalProducts: number;
  }) => void;
  addToCart: (product: IProduct, variant?: IVariation) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setCustomer: (customer: Partial<ICustomer>) => void;
  setSelectedCustomer: (customer: ICustomer | null) => void;
  setShippingInfo: (shipping: Partial<IShipping>) => void;
  setTransaction: (transaction: Partial<ITransection>) => void;
  calculateTotals: () => void;
  setNotes: (notes: string) => void;
  openVariationModal: (product: IProduct) => void;
  closeVariationModal: () => void;
  validateOrder: () => boolean;
  setValidationErrors: (errors: Record<string, string[]>) => void;
  clearValidationErrors: () => void;
  saveDraft: () => Promise<void>;
  loadDraft: (draftId: string) => Promise<void>;
  clearDraft: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getOrderData: () => any;
}

const initialState = {
  products: [],
  filteredProducts: [],
  searchQuery: "",
  selectedCategory: "",
  selectedBrand: "",
  isLoadingProducts: false,
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,
  pageSize: 20,
  cart: [],
  isCartOpen: false,
  selectedCustomer: null,
  customerInfo: {},
  shippingInfo: {},
  transaction: {
    totalPrice: 0,
    paid: 0,
    remaining: 0,
    discount: 0,
    deliveryCharge: 0,
  },
  notes: "",
  isSubmitting: false,
  variationModalOpen: false,
  selectedProductForVariation: null,
  validationErrors: {},
  draftId: null,
  lastSaved: null,
  isDirty: false,
};

export const useCreateOrderLayoutStore = create<CreateOrderLayoutState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ── Products ───────────────────────────────────────────────────────

        setProducts: (products) => {
          set({ products, filteredProducts: products });
        },

        // Single atomic update — replaces 3-4 separate set() calls after API
        setProductsResponse: ({ products, totalPages, totalProducts }) => {
          set({
            products,
            filteredProducts: products,
            totalPages,
            totalProducts,
            isLoadingProducts: false,
          });
        },

        setSearchQuery: (query) => {
          // Guard: skip if unchanged
          if (get().searchQuery === query) return;
          set({ searchQuery: query });
        },

        setSelectedCategory: (categoryId) => {
          if (get().selectedCategory === categoryId) return;
          set({ selectedCategory: categoryId });
        },

        setSelectedBrand: (brandId) => {
          if (get().selectedBrand === brandId) return;
          set({ selectedBrand: brandId });
        },

        filterProducts: () => {
          const { products, searchQuery, selectedCategory, selectedBrand } =
            get();
          let filtered = products;
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
              (p) =>
                p.name.toLowerCase().includes(q) ||
                p.sku.toLowerCase().includes(q),
            );
          }
          if (selectedCategory) {
            filtered = filtered.filter((p) =>
              p.categoryIds?.includes(selectedCategory),
            );
          }
          if (selectedBrand) {
            filtered = filtered.filter(
              (p) => p.manufactureId === selectedBrand,
            );
          }
          set({ filteredProducts: filtered });
        },

        setLoadingProducts: (isLoading) => {
          if (get().isLoadingProducts === isLoading) return;
          set({ isLoadingProducts: isLoading });
        },

        setCurrentPage: (page) => {
          if (get().currentPage === page) return;
          set({ currentPage: page });
        },

        setPageSize: (size) => {
          if (get().pageSize === size) return;
          set({ pageSize: size, currentPage: 1 });
        },

        setPaginationInfo: ({ totalPages, totalProducts }) => {
          if (
            get().totalPages === totalPages &&
            get().totalProducts === totalProducts
          )
            return;
          set({ totalPages, totalProducts });
        },

        // ── Cart ───────────────────────────────────────────────────────────

        addToCart: (product, variant) => {
          const availableStock = product.quantity || 0;
          const variantStock = variant ? variant.quantity : 0;
          const maxStock = variant ? variantStock : availableStock;

          let changed = false;

          set((state) => {
            const existingIndex = state.cart.findIndex(
              (item) =>
                item.productId === product.id &&
                (variant ? item.variantId === variant.id : !item.variantId),
            );

            if (existingIndex > -1) {
              const existing = state.cart[existingIndex];
              const newQty = existing.quantity + 1;
              if (newQty > maxStock) {
                toast.error(`Only ${maxStock} items available in stock`);
                return state;
              }
              const updated = [...state.cart];
              const priceSource =
                existing.selectedVariant?.unitPrice || existing.unitPrice;
              updated[existingIndex] = {
                ...existing,
                quantity: newQty,
                totalPrice:
                  newQty * priceSource - newQty * (existing.discount ?? 0),
              };
              changed = true;
              return { cart: updated, isDirty: true };
            }

            const cartItem: CartItem = {
              cartItemId: generateCartItemId(),
              id: product.id,
              productId: product.id,
              name: product.name,
              thumbnail: product.thumbnail,
              quantity: 1,
              unitPrice:
                (variant && variant.unitPrice > 0
                  ? variant.unitPrice
                  : product.unitPrice) - (product.discount ?? 0),
              totalPrice:
                (variant && variant.unitPrice > 0
                  ? variant.unitPrice
                  : product.unitPrice) - (product.discount ?? 0),
              discount: product.discount,
              hasVariation: product.hasVariation,
              variantId: variant?.id,
              variation: variant
                ? { id: variant.id, size: variant.size, color: variant.color }
                : undefined,
              selectedVariant: variant,
              imageGroups: product.imageGroups, // Store image groups for image fallback
              availableStock,
              variantStock: variant ? variantStock : undefined,
            };
            changed = true;
            return { cart: [...state.cart, cartItem], isDirty: true };
          });

          if (changed) get().calculateTotals();
        },

        removeFromCart: (cartItemId) => {
          const exists = get().cart.some(
            (item) => item.cartItemId === cartItemId,
          );
          if (!exists) return;
          set((state) => ({
            cart: state.cart.filter((item) => item.cartItemId !== cartItemId),
            isDirty: true,
          }));
          get().calculateTotals();
        },

        updateCartQuantity: (cartItemId, quantity) => {
          if (quantity <= 0) {
            get().removeFromCart(cartItemId);
            return;
          }
          let changed = false;
          set((state) => {
            const cartItem = state.cart.find(
              (item) => item.cartItemId === cartItemId,
            );
            if (!cartItem) return state;

            const maxStock = cartItem.selectedVariant
              ? cartItem.variantStock || cartItem.selectedVariant.quantity || 0
              : cartItem.availableStock || cartItem.quantity || 0;

            if (quantity > maxStock) {
              toast.error(`Maximum quantity is ${maxStock}`);
              return state;
            }
            if (cartItem.quantity === quantity) return state;

            changed = true;
            return {
              cart: state.cart.map((item) =>
                item.cartItemId === cartItemId
                  ? {
                      ...item,
                      quantity,
                      totalPrice:
                        quantity *
                        (item.selectedVariant?.unitPrice || item.unitPrice),
                    }
                  : item,
              ),
              isDirty: true,
            };
          });
          if (changed) get().calculateTotals();
        },

        clearCart: () => {
          if (get().cart.length === 0) return;
          set({ cart: [], isDirty: true });
          get().calculateTotals();
        },

        toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
        openCart: () => set({ isCartOpen: true }),
        closeCart: () => set({ isCartOpen: false }),

        // ── Customer ───────────────────────────────────────────────────────

        setCustomer: (incoming) => {
          const current = get().customerInfo;
          // Only update fields that actually changed
          const next: Partial<ICustomer> = { ...current };
          let changed = false;
          (Object.keys(incoming) as Array<keyof ICustomer>).forEach((key) => {
            if (incoming[key] !== current[key]) {
              (next as any)[key] = incoming[key];
              changed = true;
            }
          });
          if (!changed) return;
          set({ customerInfo: next, isDirty: true });
        },

        setSelectedCustomer: (customer) => {
          set({ selectedCustomer: customer });
          if (customer) get().setCustomer(customer);
        },

        setShippingInfo: (incoming) => {
          const current = get().shippingInfo;
          // Guard: only update fields that actually changed — this is the
          // critical protection against the infinite loop. If shipping values
          // haven't changed, don't emit a new state object.
          const next: Partial<IShipping> = { ...current };
          let changed = false;
          (Object.keys(incoming) as Array<keyof IShipping>).forEach((key) => {
            if (incoming[key] !== current[key]) {
              (next as any)[key] = incoming[key];
              changed = true;
            }
          });
          if (!changed) return; // ← loop stopper
          set({ shippingInfo: next, isDirty: true });
        },

        // ── Transaction ────────────────────────────────────────────────────

        setTransaction: (incoming) => {
          const current = get().transaction;
          const next: Partial<ITransection> = { ...current };
          let changed = false;
          (Object.keys(incoming) as Array<keyof ITransection>).forEach(
            (key) => {
              if (incoming[key] !== current[key]) {
                (next as any)[key] = incoming[key];
                changed = true;
              }
            },
          );
          if (!changed) return;
          set({ transaction: next, isDirty: true });

          if (
            incoming.deliveryCharge !== undefined ||
            incoming.discount !== undefined ||
            incoming.paid !== undefined
          ) {
            get().calculateTotals();
          }
        },

        calculateTotals: () => {
          const { cart, transaction } = get();
          const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
          const discount = transaction.discount || 0;
          const deliveryCharge = transaction.deliveryCharge || 0;
          const totalPrice = subtotal;
          const paid = transaction.paid || 0;
          const remaining = totalPrice + deliveryCharge - discount - paid;

          // Guard: don't emit if nothing changed
          if (
            transaction.totalPrice === totalPrice &&
            transaction.remaining === remaining
          )
            return;

          set((state) => ({
            transaction: { ...state.transaction, totalPrice, paid, remaining },
          }));
        },

        setNotes: (notes) => {
          if (get().notes === notes) return;
          set({ notes, isDirty: true });
        },

        // ── Modals ─────────────────────────────────────────────────────────

        openVariationModal: (product) => {
          set({
            variationModalOpen: true,
            selectedProductForVariation: product,
          });
        },

        closeVariationModal: () => {
          set({ variationModalOpen: false, selectedProductForVariation: null });
        },

        // ── Validation ─────────────────────────────────────────────────────

        validateOrder: () => {
          const state = get();
          const errors: Record<string, string[]> = {};

          if (state.cart.length === 0)
            errors.cart = ["Please add at least one product"];

          state.cart.forEach((item) => {
            const maxStock = item.selectedVariant
              ? item.variantStock || item.selectedVariant.quantity || 0
              : item.availableStock || item.quantity || 0;
            if (item.quantity > maxStock) {
              errors[item.cartItemId] = [
                `Only ${maxStock} ${item.selectedVariant ? "of this variant" : "of this product"} available`,
              ];
            }
          });

          if (!state.customerInfo.name)
            errors.customerName = ["Customer name is required"];
          if (!state.customerInfo.phoneNumber)
            errors.customerPhone = ["Phone number is required"];
          else if (!isValidBangladeshiMobileNumber(state.customerInfo.phoneNumber))
            errors.customerPhone = [
              "Invalid Bangladeshi phone number. Must be 11 digits starting with 01 (e.g., 01712345678)",
            ];
          if (!state.shippingInfo.division)
            errors.division = ["District is required"];
          if (!state.shippingInfo.district)
            errors.district = ["Area is required"];
          if (!state.shippingInfo.address)
            errors.address = ["Address is required"];

          set({ validationErrors: errors });
          return Object.keys(errors).length === 0;
        },

        setValidationErrors: (errors) => set({ validationErrors: errors }),
        clearValidationErrors: () => set({ validationErrors: {} }),

        // ── Draft ──────────────────────────────────────────────────────────

        saveDraft: async () => {
          const state = get();
          const draft = {
            id: state.draftId || `draft_${Date.now()}`,
            createdAt: state.draftId
              ? state.lastSaved || new Date()
              : new Date(),
            updatedAt: new Date(),
            data: {
              cart: state.cart,
              customerInfo: state.customerInfo,
              shippingInfo: state.shippingInfo,
              transaction: state.transaction,
              notes: state.notes,
            },
          };
          localStorage.setItem("order_draft_layout", JSON.stringify(draft));
          set({
            draftId: draft.id,
            lastSaved: draft.updatedAt,
            isDirty: false,
          });
        },

        loadDraft: async (draftId) => {
          try {
            const draftJson = localStorage.getItem("order_draft_layout");
            if (draftJson) {
              const draft = JSON.parse(draftJson);
              if (draft.id === draftId) {
                set({
                  cart: draft.data.cart || [],
                  customerInfo: draft.data.customerInfo || {},
                  shippingInfo: draft.data.shippingInfo || {},
                  transaction:
                    draft.data.transaction || initialState.transaction,
                  notes: draft.data.notes || "",
                  draftId: draft.id,
                  lastSaved: new Date(draft.updatedAt),
                  isDirty: false,
                });
                get().calculateTotals();
              }
            }
          } catch (error) {
            console.error("Failed to load draft:", error);
          }
        },

        clearDraft: () => {
          localStorage.removeItem("order_draft_layout");
          set({ draftId: null, lastSaved: null, isDirty: false });
        },

        setSubmitting: (isSubmitting) => {
          if (get().isSubmitting === isSubmitting) return;
          set({ isSubmitting });
        },

        reset: () => {
          set(initialState);
          get().clearDraft();
        },

        getCartTotal: () =>
          get().cart.reduce((sum, item) => sum + item.totalPrice, 0),
        getCartItemCount: () =>
          get().cart.reduce((sum, item) => sum + item.quantity, 0),

        getOrderData: () => {
          const state = get();
          return {
            products: state.cart,
            customer: state.customerInfo,
            shipping: state.shippingInfo,
            totalPrice: state.transaction.totalPrice,
            paid: state.transaction.paid,
            discount: state.transaction.discount,
            deliveryCharge: state.transaction.deliveryCharge,
            notes: state.notes,
          };
        },
      }),
      {
        name: "create-order-layout-store",
        partialize: (state) => ({
          draftId: state.draftId,
          lastSaved: state.lastSaved,
        }),
      },
    ),
  ),
);
