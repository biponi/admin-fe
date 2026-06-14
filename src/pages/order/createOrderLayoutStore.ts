/**
 * Create Order Layout Store - Zustand State Management
 * Manages the new product-first create order layout state
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
import type { IProduct, IVariation } from "../product/interface.d";

// UUID generator for cart items
const generateCartItemId = (): string => {
  return `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export interface CartItem extends IOrderProduct {
  cartItemId: string; // Unique identifier for cart items (UUID)
  selectedVariant?: IVariation;
  availableStock?: number; // Available stock for the product
  variantStock?: number; // Available stock for the variant (if applicable)
}

interface CreateOrderLayoutState {
  // Product Section State
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

  // Cart State
  cart: CartItem[];
  isCartOpen: boolean;

  // Customer State
  selectedCustomer: ICustomer | null;
  customerInfo: Partial<ICustomer>;
  shippingInfo: Partial<IShipping>;

  // Transaction State
  transaction: Partial<ITransection>;
  notes: string;

  // UI State
  isSubmitting: boolean;
  variationModalOpen: boolean;
  selectedProductForVariation: IProduct | null;

  // Validation State
  validationErrors: Record<string, string[]>;

  // Draft management
  draftId: string | null;
  lastSaved: Date | null;
  isDirty: boolean;

  // Actions - Product Management
  setProducts: (products: IProduct[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string) => void;
  setSelectedBrand: (brandId: string) => void;
  filterProducts: () => void;
  setLoadingProducts: (isLoading: boolean) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setPaginationInfo: (info: { totalPages: number; totalProducts: number }) => void;

  // Actions - Cart Management
  addToCart: (product: IProduct, variant?: IVariation) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Actions - Customer Management
  setCustomer: (customer: Partial<ICustomer>) => void;
  setSelectedCustomer: (customer: ICustomer | null) => void;
  setShippingInfo: (shipping: Partial<IShipping>) => void;

  // Actions - Transaction
  setTransaction: (transaction: Partial<ITransection>) => void;
  calculateTotals: () => void;
  setNotes: (notes: string) => void;

  // Actions - Variation Modal
  openVariationModal: (product: IProduct) => void;
  closeVariationModal: () => void;

  // Actions - Validation
  validateOrder: () => boolean;
  setValidationErrors: (errors: Record<string, string[]>) => void;
  clearValidationErrors: () => void;

  // Actions - Draft Management
  saveDraft: () => Promise<void>;
  loadDraft: (draftId: string) => Promise<void>;
  clearDraft: () => void;

  // Actions - Submission
  setSubmitting: (isSubmitting: boolean) => void;

  // Actions - Reset
  reset: () => void;

  // Getters
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

        // Product Management
        setProducts: (products) => {
          set({ products, filteredProducts: products });
        },

        setSearchQuery: (query) => {
          set({ searchQuery: query });
          get().filterProducts();
        },

        setSelectedCategory: (categoryId) => {
          set({ selectedCategory: categoryId });
          get().filterProducts();
        },

        setSelectedBrand: (brandId) => {
          set({ selectedBrand: brandId });
          get().filterProducts();
        },

        filterProducts: () => {
          const { products, searchQuery, selectedCategory, selectedBrand } =
            get();

          let filtered = products;

          // Filter by search query
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
              (product) =>
                product.name.toLowerCase().includes(query) ||
                product.sku.toLowerCase().includes(query),
            );
          }

          // Filter by category
          if (selectedCategory) {
            filtered = filtered.filter((product) =>
              product.categoryIds?.includes(selectedCategory),
            );
          }

          // Filter by brand (manufacturer)
          if (selectedBrand) {
            filtered = filtered.filter(
              (product) => product.manufactureId === selectedBrand,
            );
          }

          set({ filteredProducts: filtered });
        },

        setLoadingProducts: (isLoading) => {
          set({ isLoadingProducts: isLoading });
        },

        setCurrentPage: (page) => {
          set({ currentPage: page });
        },

        setPageSize: (size) => {
          set({ pageSize: size, currentPage: 1 }); // Reset to page 1 when changing page size
        },

        setPaginationInfo: (info) => {
          set({ totalPages: info.totalPages, totalProducts: info.totalProducts });
        },

        // Cart Management
        addToCart: (product, variant) => {
          // Determine available stock
          const availableStock = product.quantity || 0;
          const variantStock = variant ? variant.quantity : 0;
          const maxStock = variant ? variantStock : availableStock;

          set((state) => {
            // Check if item already exists by comparing both productId and variantId
            const existingItemIndex = state.cart.findIndex(
              (item) =>
                item.productId === product.id &&
                (variant ? item.variantId === variant.id : !item.variantId),
            );

            if (existingItemIndex > -1) {
              // Item exists - check if we can increase quantity
              const existingItem = state.cart[existingItemIndex];
              const newQuantity = existingItem.quantity + 1;

              if (newQuantity > maxStock) {
                toast.error(`Only ${maxStock} items available in stock`);
                return state;
              }

              // Update quantity - use the correct price source
              const updatedCart = [...state.cart];
              updatedCart[existingItemIndex].quantity = newQuantity;
              // Use variant price if available, otherwise use the item's unit price
              const priceSource =
                existingItem.selectedVariant?.unitPrice ||
                existingItem.unitPrice;
              updatedCart[existingItemIndex].totalPrice =
                newQuantity * priceSource -
                newQuantity * (existingItem?.discount ?? 0);
              return { cart: updatedCart, isDirty: true };
            } else {
              // Add new item with plain productId and unique cartItemId
              const cartItem: CartItem = {
                cartItemId: generateCartItemId(),
                id: product.id, // Use plain product ID
                productId: product.id,
                name: product.name,
                thumbnail: product.thumbnail,
                quantity: 1,
                // Use variant price if it exists and is greater than 0, otherwise use product price
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
                  ? {
                      id: variant.id,
                      size: variant.size,
                      color: variant.color,
                    }
                  : undefined,
                selectedVariant: variant,
                availableStock,
                variantStock: variant ? variantStock : undefined,
              };
              return { cart: [...state.cart, cartItem], isDirty: true };
            }
          });

          get().calculateTotals();
        },

        removeFromCart: (cartItemId) => {
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

          set((state) => {
            const cartItem = state.cart.find(
              (item) => item.cartItemId === cartItemId,
            );
            if (!cartItem) return state;

            // Determine max stock
            const maxStock = cartItem.selectedVariant
              ? cartItem.variantStock || cartItem.selectedVariant.quantity || 0
              : cartItem.availableStock || cartItem.quantity || 0;

            // Validate against stock
            if (quantity > maxStock) {
              toast.error(`Maximum quantity is ${maxStock}`);
              return state;
            }

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

          get().calculateTotals();
        },

        clearCart: () => {
          set({ cart: [], isDirty: true });
          get().calculateTotals();
        },

        toggleCart: () => {
          set((state) => ({ isCartOpen: !state.isCartOpen }));
        },

        openCart: () => {
          set({ isCartOpen: true });
        },

        closeCart: () => {
          set({ isCartOpen: false });
        },

        // Customer Management
        setCustomer: (customer) => {
          set((state) => ({
            customerInfo: { ...state.customerInfo, ...customer },
            isDirty: true,
          }));
        },

        setSelectedCustomer: (customer) => {
          set({ selectedCustomer: customer });
          if (customer) {
            get().setCustomer(customer);
          }
        },

        setShippingInfo: (shipping) => {
          set((state) => ({
            shippingInfo: { ...state.shippingInfo, ...shipping },
            isDirty: true,
          }));
        },

        // Transaction
        setTransaction: (transaction) => {
          set((state) => ({
            transaction: { ...state.transaction, ...transaction },
            isDirty: true,
          }));

          // Automatically recalculate totals when delivery charge, discount, or paid amount changes
          if (
            transaction.deliveryCharge !== undefined ||
            transaction.discount !== undefined ||
            transaction.paid !== undefined
          ) {
            get().calculateTotals();
          }
        },

        calculateTotals: () => {
          const { cart, transaction } = get();

          const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

          const discount = transaction.discount || 0;
          const deliveryCharge = transaction.deliveryCharge || 0;
          const totalPrice = subtotal + deliveryCharge - discount;
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

        setNotes: (notes) => {
          set({ notes, isDirty: true });
        },

        // Variation Modal
        openVariationModal: (product) => {
          set({
            variationModalOpen: true,
            selectedProductForVariation: product,
          });
        },

        closeVariationModal: () => {
          set({
            variationModalOpen: false,
            selectedProductForVariation: null,
          });
        },

        // Validation
        validateOrder: () => {
          const state = get();
          const errors: Record<string, string[]> = {};

          // Validate cart
          if (state.cart.length === 0) {
            errors.cart = ["Please add at least one product"];
          }

          // Validate stock levels for all cart items
          state.cart.forEach((item) => {
            const maxStock = item.selectedVariant
              ? item.variantStock || item.selectedVariant.quantity || 0
              : item.availableStock || item.quantity || 0;

            if (item.quantity > maxStock) {
              errors[item.cartItemId] = [
                `Only ${maxStock} ${item.selectedVariant ? "of this variant" : "of this product"} available, you have ${item.quantity} in cart`,
              ];
            }
          });

          // Validate customer
          if (!state.customerInfo.name) {
            errors.customerName = ["Customer name is required"];
          }
          if (!state.customerInfo.phoneNumber) {
            errors.customerPhone = ["Phone number is required"];
          }

          // Validate shipping
          if (!state.shippingInfo.division) {
            errors.division = ["District is required"];
          }
          if (!state.shippingInfo.district) {
            errors.district = ["Area is required"];
          }
          if (!state.shippingInfo.address) {
            errors.address = ["Address is required"];
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

        // Draft Management
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

          // Save to localStorage
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
        getCartTotal: () => {
          const { cart } = get();
          return cart.reduce((sum, item) => sum + item.totalPrice, 0);
        },

        getCartItemCount: () => {
          const { cart } = get();
          return cart.reduce((sum, item) => sum + item.quantity, 0);
        },

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
          // Persist draft data
          draftId: state.draftId,
          lastSaved: state.lastSaved,
        }),
      },
    ),
  ),
);
