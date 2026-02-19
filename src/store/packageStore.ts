import { create } from "zustand";
import {
  getPackage,
  getPackagesByStatus,
  getPackageDashboard,
  getPackageActivities,
  createPackage,
  markPackageAsPacked,
  requestPackageShipping,
  bulkRequestShipping,
  cancelPackage,
} from "../api/package";
import type {
  Package,
  PackageStatus,
  DashboardStats,
  PackageActivity,
  PackageCourier,
} from "../pages/package/interface";
import { toast } from "sonner";

interface SelectionState {
  selectedIds: Set<string>;
  isAllSelected: boolean;
}

interface ScanEntry {
  barcode: string;
  orderNumber: number;
  timestamp: Date;
  status?: PackageStatus;
  success: boolean;
  error?: string;
}

interface PackageStore {
  // State
  packages: Package[];
  currentPackage: Package | null;
  dashboardStats: DashboardStats | null;
  activities: PackageActivity[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;

  // Scanner State
  scannedPackages: Package[];
  scanHistory: ScanEntry[];
  isScanning: boolean;
  scanResult: Package | null;

  // Search
  searchQuery: string;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalPackages: number;
  pageSize: number;

  // Selection
  selection: SelectionState;

  // Actions
  loadDashboard: () => Promise<void>;
  loadPackagesByStatus: (status: PackageStatus, page?: number, limit?: number) => Promise<void>;
  searchPackages: (query: string, page?: number) => Promise<void>;
  refreshPackages: () => Promise<void>;
  loadPackage: (orderNumber: number) => Promise<void>;
  loadActivities: (orderNumber: number) => Promise<void>;
  createPackage: (orderNumber: number) => Promise<void>;
  markAsPacked: (orderNumber: number, notes?: string) => Promise<void>;
  requestShipping: (orderNumber: number, courier: PackageCourier) => Promise<void>;
  bulkRequestShipping: (
    orderNumbers: number[],
    courier: PackageCourier
  ) => Promise<void>;
  cancelPackage: (orderNumber: number, reason?: string) => Promise<void>;
  clearCurrentPackage: () => void;

  // Scanner Actions
  addScannedPackage: (pkg: Package) => void;
  addScanHistoryEntry: (entry: ScanEntry) => void;
  setScanning: (scanning: boolean) => void;
  setScanResult: (pkg: Package | null) => void;
  clearScanHistory: () => void;
  clearScannedPackages: () => void;

  // Search Actions
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;

  // Pagination Actions
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  // Selection Actions
  toggleSelection: (packageId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  getSelectedPackages: () => Package[];
  getSelectedOrderNumbers: () => number[];
}

export const usePackageStore = create<PackageStore>((set, get) => ({
  // Initial state
  packages: [],
  currentPackage: null,
  dashboardStats: null,
  activities: [],
  loading: false,
  refreshing: false,
  error: null,

  // Scanner initial state
  scannedPackages: [],
  scanHistory: [],
  isScanning: false,
  scanResult: null,

  searchQuery: "",
  currentPage: 1,
  totalPages: 1,
  totalPackages: 0,
  pageSize: 50,
  selection: {
    selectedIds: new Set(),
    isAllSelected: false,
  },

  // Load dashboard
  loadDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getPackageDashboard();
      if (data.success && data.data) {
        set({
          dashboardStats: data.data.stats,
          activities: data.data.recentActivity,
          loading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load dashboard",
        loading: false,
      });
      toast.error("Failed to load dashboard");
    }
  },

  // Load packages by status
  loadPackagesByStatus: async (status: PackageStatus, page = 1, limit = 50) => {
    set({ loading: true, error: null });
    try {
      const data = await getPackagesByStatus(status, page, limit);
      if (data.success && data.data) {
        set({
          packages: data.data.packages || [],
          currentPage: data.data.pagination?.currentPage || page,
          totalPages: data.data.pagination?.totalPages || 1,
          totalPackages: data.data.pagination?.totalItems || 0,
          pageSize: limit,
          loading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load packages",
        loading: false,
      });
      toast.error("Failed to load packages");
    }
  },

  // Search packages (placeholder - API endpoint needs to be implemented)
  searchPackages: async (query: string, page = 1) => {
    set({ loading: true, error: null, searchQuery: query });
    try {
      // TODO: Implement search API endpoint
      // For now, just filter client-side as a fallback
      const { packages: allPackages } = get();
      const filtered = allPackages.filter(
        (pkg) =>
          pkg.packageCode.toLowerCase().includes(query.toLowerCase()) ||
          pkg.orderNumber.toString().includes(query) ||
          pkg.order?.customer.name?.toLowerCase().includes(query.toLowerCase()) ||
          pkg.order?.customer.phoneNumber?.includes(query)
      );

      set({
        packages: filtered,
        currentPage: page,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to search packages",
        loading: false,
      });
      toast.error("Failed to search packages");
    }
  },

  // Refresh packages
  refreshPackages: async () => {
    const { currentPage, pageSize, searchQuery } = get();
    if (searchQuery) {
      await get().searchPackages(searchQuery, currentPage);
    } else {
      // Need to know current status - this is a limitation
      set({ refreshing: true });
      setTimeout(() => set({ refreshing: false }), 1000);
    }
  },

  // Load single package
  loadPackage: async (orderNumber: number) => {
    set({ loading: true, error: null });
    try {
      const pkg = await getPackage(orderNumber);
      if (pkg.success && pkg.data) {
        set({ currentPackage: pkg.data, loading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load package",
        loading: false,
      });
      toast.error("Failed to load package");
    }
  },

  // Load activities
  loadActivities: async (orderNumber: number) => {
    set({ loading: true, error: null });
    try {
      const data = await getPackageActivities(orderNumber);
      if (data.success && data.data) {
        set({ activities: data.data.activities || [], loading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load activities",
        loading: false,
      });
      toast.error("Failed to load activities");
    }
  },

  // Create package
  createPackage: async (orderNumber: number) => {
    set({ loading: true, error: null });
    try {
      await createPackage(orderNumber);
      toast.success("Package created successfully");
      await get().loadDashboard(); // Refresh dashboard
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create package",
        loading: false,
      });
      toast.error(error instanceof Error ? error.message : "Failed to create package");
      throw error;
    }
  },

  // Mark as packed
  markAsPacked: async (orderNumber: number, notes?: string) => {
    set({ loading: true, error: null });
    try {
      const pkg = await markPackageAsPacked(orderNumber, notes);
      if (pkg.success && pkg.data) {
        set({ currentPackage: pkg.data, loading: false });
        toast.success("Package marked as packed");
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to mark as packed",
        loading: false,
      });
      toast.error(error instanceof Error ? error.message : "Failed to mark as packed");
      throw error;
    }
  },

  // Request shipping
  requestShipping: async (orderNumber: number, courier: PackageCourier) => {
    set({ loading: true, error: null });
    try {
      const pkg = await requestPackageShipping(orderNumber, courier);
      if (pkg.success && pkg.data) {
        set({ currentPackage: pkg.data, loading: false });
        toast.success("Shipping requested successfully");
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to request shipping",
        loading: false,
      });
      toast.error(error instanceof Error ? error.message : "Failed to request shipping");
      throw error;
    }
  },

  // Bulk shipping request
  bulkRequestShipping: async (
    orderNumbers: number[],
    courier: PackageCourier
  ) => {
    set({ loading: true, error: null });
    try {
      const result = await bulkRequestShipping(orderNumbers, courier);
      if (result.success && result.data) {
        set({ loading: false });
        toast.success(
          `Bulk operation ${result.data.bulkOperationId} queued. Estimated time: ${result.data.estimatedTime}`
        );
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to request bulk shipping",
        loading: false,
      });
      toast.error(error instanceof Error ? error.message : "Failed to request bulk shipping");
      throw error;
    }
  },

  // Cancel package
  cancelPackage: async (orderNumber: number, reason?: string) => {
    set({ loading: true, error: null });
    try {
      const pkg = await cancelPackage(orderNumber, reason);
      if (pkg.success && pkg.data) {
        set({ currentPackage: pkg.data, loading: false });
        toast.success("Package cancelled successfully");
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to cancel package",
        loading: false,
      });
      toast.error(error instanceof Error ? error.message : "Failed to cancel package");
      throw error;
    }
  },

  // Clear current package
  clearCurrentPackage: () => {
    set({ currentPackage: null, activities: [], error: null });
  },

  // Search actions
  setSearchQuery: (query: string) => {
    set({ searchQuery: query, currentPage: 1 });
  },

  clearSearch: () => {
    set({ searchQuery: "", currentPage: 1 });
  },

  // Pagination actions
  setCurrentPage: (page: number) => {
    set({ currentPage: page });
  },

  setPageSize: (size: number) => {
    set({ pageSize: size, currentPage: 1 });
  },

  nextPage: () => {
    const { currentPage, totalPages } = get();
    if (currentPage < totalPages) {
      set({ currentPage: currentPage + 1 });
    }
  },

  prevPage: () => {
    const { currentPage } = get();
    if (currentPage > 1) {
      set({ currentPage: currentPage - 1 });
    }
  },

  // Selection actions
  toggleSelection: (packageId: string) => {
    set((state) => {
      const newSelectedIds = new Set(state.selection.selectedIds);
      if (newSelectedIds.has(packageId)) {
        newSelectedIds.delete(packageId);
      } else {
        newSelectedIds.add(packageId);
      }
      return {
        selection: {
          selectedIds: newSelectedIds,
          isAllSelected: newSelectedIds.size === state.packages.length && state.packages.length > 0,
        },
      };
    });
  },

  selectAll: () => {
    set((state) => {
      if (state.selection.isAllSelected) {
        // Deselect all
        return {
          selection: {
            selectedIds: new Set(),
            isAllSelected: false,
          },
        };
      } else {
        // Select all current page
        const allIds = new Set(state.packages.map((pkg) => pkg._id));
        return {
          selection: {
            selectedIds: allIds,
            isAllSelected: true,
          },
        };
      }
    });
  },

  clearSelection: () => {
    set({
      selection: {
        selectedIds: new Set(),
        isAllSelected: false,
      },
    });
  },

  getSelectedPackages: () => {
    const { packages, selection } = get();
    return packages.filter((pkg) => selection.selectedIds.has(pkg._id));
  },

  getSelectedOrderNumbers: () => {
    const { packages, selection } = get();
    return packages
      .filter((pkg) => selection.selectedIds.has(pkg._id))
      .map((pkg) => pkg.orderNumber);
  },

  // Scanner Actions
  addScannedPackage: (pkg: Package) => {
    set((state) => ({
      scannedPackages: [...state.scannedPackages, pkg],
    }));
  },

  addScanHistoryEntry: (entry: ScanEntry) => {
    set((state) => ({
      scanHistory: [entry, ...state.scanHistory].slice(0, 50), // Keep last 50 scans
    }));
  },

  setScanning: (scanning: boolean) => {
    set({ isScanning: scanning });
  },

  setScanResult: (pkg: Package | null) => {
    set({ scanResult: pkg });
  },

  clearScanHistory: () => {
    set({ scanHistory: [] });
  },

  clearScannedPackages: () => {
    set({ scannedPackages: [] });
  },
}));
