/**
 * Order Store - Zustand State Management
 * Manages order list state, filters, pagination, and selection
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  IOrder,
  IOrderFilter,
  IOrderStatusCount,
  OrderSelectionState,
  BulkActionProgress,
  SavedFilter,
} from "../types";
import { getOrders, searchOrders } from "../../../api/order";

interface OrderState {
  // Data
  orders: IOrder[];
  statusCounts: IOrderStatusCount | null;
  totalOrders: number;

  // Pagination
  currentPage: number;
  pageSize: number;
  totalPages: number;

  // Filters & Search
  filters: IOrderFilter;
  searchQuery: string;
  savedFilters: SavedFilter[];
  activeFilterId: string | null;

  // Selection
  selection: OrderSelectionState;

  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Bulk Actions
  bulkActionProgress: BulkActionProgress | null;

  // Actions - Data fetching
  fetchOrders: (reset?: boolean) => Promise<void>;
  refreshOrders: () => Promise<void>;

  // Actions - Pagination
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  // Actions - Filters & Search
  setFilters: (filters: Partial<IOrderFilter>) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  saveFilter: (name: string, filter: IOrderFilter) => void;
  deleteFilter: (id: string) => void;
  applyFilter: (id: string) => void;

  // Actions - Selection
  selectOrder: (orderId: number) => void;
  deselectOrder: (orderId: number) => void;
  selectAll: () => void;
  clearSelection: () => void;
  toggleOrderSelection: (orderId: number) => void;

  // Actions - Bulk operations
  startBulkAction: (total: number) => void;
  updateBulkProgress: (
    completed: number,
    failed: number,
    errors?: Array<{ orderId: number; error: string }>
  ) => void;
  finishBulkAction: () => void;

  // Actions - Order updates
  updateOrder: (orderId: number, updates: Partial<IOrder>) => void;
  removeOrder: (orderId: number) => void;

  // Actions - Reset
  reset: () => void;
}

const initialState = {
  orders: [],
  statusCounts: null,
  totalOrders: 0,
  currentPage: 1,
  pageSize: 20,
  totalPages: 1,
  filters: {},
  searchQuery: "",
  savedFilters: [],
  activeFilterId: null,
  selection: {
    selectedIds: new Set<number>(),
    isAllSelected: false,
    excludedIds: new Set<number>(),
  },
  isLoading: false,
  isRefreshing: false,
  error: null,
  bulkActionProgress: null,
};

export const useOrderStore = create<OrderState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Fetch orders with current filters and pagination
        fetchOrders: async (reset = false) => {
          const state = get();

          if (reset) {
            set({ currentPage: 1, orders: [] });
          }

          set({ isLoading: true, error: null });

          try {
            const { filters, searchQuery, currentPage, pageSize } = reset
              ? { ...state, currentPage: 1 }
              : state;

            let response;

            // Determine the status to use for API calls
            // If isReturn filter is set, use "return" as status
            // Otherwise use the filters.status value
            const apiStatus = filters.isReturn ? "return" : (filters.status || "");

            // If there's a search query, use searchOrders API
            if (searchQuery && searchQuery.trim() !== "") {
              response = await searchOrders(searchQuery, apiStatus || "processing", pageSize, currentPage);
            } else {
              // Otherwise, use regular getOrders API
              response = await getOrders(pageSize, currentPage, apiStatus);
            }

            if (response.success && response.data) {
              // Response structure from V1: { orders, totalOrders, totalPages, currentPage, statusCounts, returnOrderCount }
              const {
                orders,
                totalOrders,
                totalPages,
                currentPage: responsePage,
                statusCounts,
                returnOrderCount,
              } = response.data;

              set({
                orders: orders || [],
                totalOrders: totalOrders || 0,
                totalPages: totalPages || 1,
                currentPage: responsePage || currentPage,
                statusCounts: statusCounts
                  ? { ...statusCounts, returnOrderCount }
                  : null,
                isLoading: false,
              });
            } else {
              set({
                error: response.error || "Failed to fetch orders",
                isLoading: false,
              });
            }
          } catch (error: any) {
            set({
              error: error.message || "An error occurred",
              isLoading: false,
            });
          }
        },

        // Refresh orders (used for pull-to-refresh)
        refreshOrders: async () => {
          set({ isRefreshing: true });
          await get().fetchOrders(true);
          set({ isRefreshing: false });
        },

        // Pagination actions
        setPage: (page) => {
          set({ currentPage: page });
          get().fetchOrders();
        },

        setPageSize: (size) => {
          set({ pageSize: size, currentPage: 1 });
          get().fetchOrders();
        },

        nextPage: () => {
          const { currentPage, totalPages } = get();
          if (currentPage < totalPages) {
            get().setPage(currentPage + 1);
          }
        },

        prevPage: () => {
          const { currentPage } = get();
          if (currentPage > 1) {
            get().setPage(currentPage - 1);
          }
        },

        // Filter actions
        setFilters: (newFilters) => {
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
            currentPage: 1,
          }));
          get().fetchOrders();
        },

        clearFilters: () => {
          set({
            filters: {},
            searchQuery: "",
            currentPage: 1,
            activeFilterId: null,
          });
          get().fetchOrders();
        },

        setSearchQuery: (query) => {
          set({ searchQuery: query, currentPage: 1 });
          get().fetchOrders();
        },

        saveFilter: (name, filter) => {
          const newFilter: SavedFilter = {
            id: Date.now().toString(),
            name,
            filter,
            createdAt: new Date(),
          };
          set((state) => ({
            savedFilters: [...state.savedFilters, newFilter],
          }));
        },

        deleteFilter: (id) => {
          set((state) => ({
            savedFilters: state.savedFilters.filter((f) => f.id !== id),
            activeFilterId:
              state.activeFilterId === id ? null : state.activeFilterId,
          }));
        },

        applyFilter: (id) => {
          const filter = get().savedFilters.find((f) => f.id === id);
          if (filter) {
            set({ filters: filter.filter, activeFilterId: id, currentPage: 1 });
            get().fetchOrders();
          }
        },

        // Selection actions
        selectOrder: (orderId) => {
          set((state) => {
            const newSelectedIds = new Set(state.selection.selectedIds);
            newSelectedIds.add(orderId);
            return {
              selection: {
                ...state.selection,
                selectedIds: newSelectedIds,
              },
            };
          });
        },

        deselectOrder: (orderId) => {
          set((state) => {
            const newSelectedIds = new Set(state.selection.selectedIds);
            newSelectedIds.delete(orderId);
            const newExcludedIds = state.selection.isAllSelected
              ? new Set(Array.from(state.selection.excludedIds).concat([orderId]))
              : state.selection.excludedIds;
            return {
              selection: {
                ...state.selection,
                selectedIds: newSelectedIds,
                excludedIds: newExcludedIds,
              },
            };
          });
        },

        selectAll: () => {
          set((state) => ({
            selection: {
              selectedIds: new Set(state.orders.map((o) => o.id).filter((id): id is number => id !== undefined)),
              isAllSelected: true,
              excludedIds: new Set(),
            },
          }));
        },

        clearSelection: () => {
          set({
            selection: {
              selectedIds: new Set(),
              isAllSelected: false,
              excludedIds: new Set(),
            },
          });
        },

        toggleOrderSelection: (orderId) => {
          const { selection } = get();
          if (selection.selectedIds.has(orderId)) {
            get().deselectOrder(orderId);
          } else {
            get().selectOrder(orderId);
          }
        },

        // Bulk action progress
        startBulkAction: (total) => {
          set({
            bulkActionProgress: {
              total,
              completed: 0,
              failed: 0,
              inProgress: true,
              errors: [],
            },
          });
        },

        updateBulkProgress: (completed, failed, errors = []) => {
          set((state) => ({
            bulkActionProgress: state.bulkActionProgress
              ? {
                  ...state.bulkActionProgress,
                  completed,
                  failed,
                  errors: [...state.bulkActionProgress.errors, ...errors],
                }
              : null,
          }));
        },

        finishBulkAction: () => {
          set({ bulkActionProgress: null });
          get().clearSelection();
          get().refreshOrders();
        },

        // Order updates
        updateOrder: (orderId, updates) => {
          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === orderId ? { ...order, ...updates } : order
            ),
          }));
        },

        removeOrder: (orderId) => {
          set((state) => ({
            orders: state.orders.filter((order) => order.id !== orderId),
            totalOrders: state.totalOrders - 1,
          }));
        },

        // Reset state
        reset: () => {
          set(initialState);
        },
      }),
      {
        name: "order-store-v2",
        partialize: (state) => ({
          // Only persist these fields
          savedFilters: state.savedFilters,
          pageSize: state.pageSize,
        }),
      }
    )
  )
);
