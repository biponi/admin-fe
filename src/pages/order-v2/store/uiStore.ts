/**
 * UI Store - Zustand State Management
 * Manages UI state, modals, sheets, toasts, and user preferences
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  UserPreferences,
  OnboardingState,
  OrderListViewMode,
  OrderListDensity,
} from "../types";

interface Sheet {
  id: string;
  type:
    | "order-details"
    | "order-edit"
    | "fraud-details"
    | "courier-tracking"
    | "modification-history";
  data?: any;
}

interface Modal {
  id: string;
  type:
    | "confirm"
    | "bulk-action"
    | "create-order"
    | "modify-order"
    | "keyboard-shortcuts"
    | "onboarding";
  data?: any;
}

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}

interface UIState {
  // User preferences
  preferences: UserPreferences;

  // View state
  viewMode: OrderListViewMode["mode"];
  density: OrderListDensity["density"];
  sidebarCollapsed: boolean;

  // Modals & Sheets
  activeSheet: Sheet | null;
  activeModal: Modal | null;
  sheetHistory: Sheet[];

  // Toasts
  toasts: Toast[];

  // Command palette
  commandPaletteOpen: boolean;

  // Keyboard shortcuts
  keyboardShortcutsEnabled: boolean;
  showKeyboardShortcuts: boolean;

  // Onboarding
  onboarding: OnboardingState;

  // Loading states
  globalLoading: boolean;

  // Actions - Preferences
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  setViewMode: (mode: OrderListViewMode["mode"]) => void;
  setDensity: (density: OrderListDensity["density"]) => void;
  toggleSidebar: () => void;
  toggleAnimations: () => void;
  toggleKeyboardShortcuts: () => void;

  // Actions - Sheets
  openSheet: (sheet: Sheet) => void;
  closeSheet: () => void;
  goBackSheet: () => void;

  // Actions - Modals
  openModal: (modal: Modal) => void;
  closeModal: () => void;

  // Actions - Toasts
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Actions - Command Palette
  toggleCommandPalette: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;

  // Actions - Keyboard Shortcuts
  toggleKeyboardShortcutsModal: () => void;

  // Actions - Onboarding
  startOnboarding: () => void;
  completeOnboardingStep: (step: string) => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // Actions - Loading
  setGlobalLoading: (loading: boolean) => void;
}

const defaultPreferences: UserPreferences = {
  theme: "system",
  viewMode: "table",
  density: "normal",
  savedFilters: [],
  recentSearches: [],
  keyboardShortcutsEnabled: true,
  customKeyboardShortcuts: {},
  animationsEnabled: true,
  compactMobileView: false,
};

const initialOnboarding: OnboardingState = {
  completed: false,
  currentStep: 0,
  totalSteps: 5,
  skipped: false,
  completedSteps: [],
};

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        preferences: defaultPreferences,
        viewMode: "table",
        density: "normal",
        sidebarCollapsed: false,
        activeSheet: null,
        activeModal: null,
        sheetHistory: [],
        toasts: [],
        commandPaletteOpen: false,
        keyboardShortcutsEnabled: true,
        showKeyboardShortcuts: false,
        onboarding: initialOnboarding,
        globalLoading: false,

        // Preferences
        setPreferences: (preferences) => {
          set((state) => ({
            preferences: { ...state.preferences, ...preferences },
          }));
        },

        setViewMode: (mode) => {
          set((state) => ({
            viewMode: mode,
            preferences: { ...state.preferences, viewMode: mode },
          }));
        },

        setDensity: (density) => {
          set((state) => ({
            density,
            preferences: { ...state.preferences, density },
          }));
        },

        toggleSidebar: () => {
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
        },

        toggleAnimations: () => {
          set((state) => ({
            preferences: {
              ...state.preferences,
              animationsEnabled: !state.preferences.animationsEnabled,
            },
          }));
        },

        toggleKeyboardShortcuts: () => {
          set((state) => ({
            keyboardShortcutsEnabled: !state.keyboardShortcutsEnabled,
            preferences: {
              ...state.preferences,
              keyboardShortcutsEnabled: !state.keyboardShortcutsEnabled,
            },
          }));
        },

        // Sheets
        openSheet: (sheet) => {
          const currentSheet = get().activeSheet;
          set((state) => ({
            activeSheet: sheet,
            sheetHistory: currentSheet
              ? [...state.sheetHistory, currentSheet]
              : state.sheetHistory,
          }));
        },

        closeSheet: () => {
          set({ activeSheet: null, sheetHistory: [] });
        },

        goBackSheet: () => {
          const { sheetHistory } = get();
          if (sheetHistory.length > 0) {
            const previousSheet = sheetHistory[sheetHistory.length - 1];
            set({
              activeSheet: previousSheet,
              sheetHistory: sheetHistory.slice(0, -1),
            });
          } else {
            set({ activeSheet: null });
          }
        },

        // Modals
        openModal: (modal) => {
          set({ activeModal: modal });
        },

        closeModal: () => {
          set({ activeModal: null });
        },

        // Toasts
        showToast: (toast) => {
          const id = `toast_${Date.now()}`;
          const newToast: Toast = { ...toast, id };
          set((state) => ({ toasts: [...state.toasts, newToast] }));

          // Auto-remove toast after duration
          const duration = toast.duration || 5000;
          setTimeout(() => {
            get().removeToast(id);
          }, duration);
        },

        removeToast: (id) => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }));
        },

        clearToasts: () => {
          set({ toasts: [] });
        },

        // Command Palette
        toggleCommandPalette: () => {
          set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen }));
        },

        openCommandPalette: () => {
          set({ commandPaletteOpen: true });
        },

        closeCommandPalette: () => {
          set({ commandPaletteOpen: false });
        },

        // Keyboard Shortcuts
        toggleKeyboardShortcutsModal: () => {
          set((state) => ({
            showKeyboardShortcuts: !state.showKeyboardShortcuts,
          }));
        },

        // Onboarding
        startOnboarding: () => {
          set({
            onboarding: {
              ...initialOnboarding,
              completed: false,
              skipped: false,
            },
          });
        },

        completeOnboardingStep: (step) => {
          set((state) => ({
            onboarding: {
              ...state.onboarding,
              completedSteps: [...state.onboarding.completedSteps, step],
              currentStep: state.onboarding.currentStep + 1,
            },
          }));
        },

        skipOnboarding: () => {
          set((state) => ({
            onboarding: {
              ...state.onboarding,
              skipped: true,
              completed: true,
            },
          }));
        },

        completeOnboarding: () => {
          set((state) => ({
            onboarding: {
              ...state.onboarding,
              completed: true,
            },
          }));
        },

        resetOnboarding: () => {
          set({ onboarding: initialOnboarding });
        },

        // Loading
        setGlobalLoading: (loading) => {
          set({ globalLoading: loading });
        },
      }),
      {
        name: "ui-store-v2",
        partialize: (state) => ({
          // Persist preferences and onboarding state
          preferences: state.preferences,
          viewMode: state.viewMode,
          density: state.density,
          sidebarCollapsed: state.sidebarCollapsed,
          keyboardShortcutsEnabled: state.keyboardShortcutsEnabled,
          onboarding: state.onboarding,
        }),
      }
    )
  )
);
