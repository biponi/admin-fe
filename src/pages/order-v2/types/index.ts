/**
 * Order V2 Type Definitions
 * Re-exports from V1 and adds V2-specific types
 */

// Import specific types from V1 for convenience
import type {
  IOrder,
  IOrderProduct,
  ICustomer,
  IShipping,
  ITransection,
  IPayment,
  IOrderFilter,
  FraudDetection,
  IOrderStatusCount,
} from '../../order/interface.d';

// Import enums (not type-only since they're used as values)
import {
  OrderStatus,
  PaymentType,
  CourierProvider,
  DeliveryStatus,
} from '../../order/interface.d';

// Re-export all V1 types for compatibility
export * from '../../order/interface.d';

// Re-export specific types
export type {
  IOrder,
  IOrderProduct,
  ICustomer,
  IShipping,
  ITransection,
  IPayment,
  IOrderFilter,
  FraudDetection,
  IOrderStatusCount,
};

// Re-export enums
export {
  OrderStatus,
  PaymentType,
  CourierProvider,
  DeliveryStatus,
};

// V2-specific UI state types
export interface OrderListViewMode {
  mode: 'table' | 'card' | 'compact';
}

export interface OrderListDensity {
  density: 'comfortable' | 'normal' | 'compact';
}

export interface SavedFilter {
  id: string;
  name: string;
  filter: IOrderFilter;
  createdAt: Date;
}

export interface BulkActionProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: boolean;
  errors: Array<{ orderId: number; error: string }>;
}

export interface OrderSelectionState {
  selectedIds: Set<number>;
  isAllSelected: boolean;
  excludedIds: Set<number>;
}

// Command palette types
export interface CommandAction {
  id: string;
  label: string;
  description?: string;
  shortcut?: string[];
  keywords?: string[];
  section?: string;
  icon?: React.ReactNode;
  perform: () => void | Promise<void>;
}

// Keyboard shortcut types
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
  enabled?: boolean;
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  viewMode: OrderListViewMode['mode'];
  density: OrderListDensity['density'];
  savedFilters: SavedFilter[];
  recentSearches: string[];
  keyboardShortcutsEnabled: boolean;
  customKeyboardShortcuts: Record<string, string[]>; // shortcut ID -> keys array
  animationsEnabled: boolean;
  compactMobileView: boolean;
}

// Onboarding state
export interface OnboardingState {
  completed: boolean;
  currentStep: number;
  totalSteps: number;
  skipped: boolean;
  completedSteps: string[];
}

// Draft order (for save draft feature)
export interface DraftOrder {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  step: number;
  data: {
    products?: IOrderProduct[];
    customer?: Partial<ICustomer>;
    shipping?: Partial<IShipping>;
    transaction?: Partial<ITransection>;
    notes?: string;
  };
}
