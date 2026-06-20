import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type LayoutType = "modern" | "legacy";
type CreateOrderLayoutType = "wizard" | "product-first";

// Valid theme options - must match the options available in settings-panel
const VALID_THEMES = ["dark", "blue", "green", "purple", "orange"] as const;
type ThemeType = (typeof VALID_THEMES)[number];

// Validation function to check if a theme value is valid
const isValidTheme = (theme: string): theme is ThemeType => {
  return VALID_THEMES.includes(theme as ThemeType);
};

interface SettingsContextType {
  layoutType: LayoutType;
  setLayoutType: (type: LayoutType) => void;
  toggleLayout: () => void;
  theme: ThemeType;
  setTheme: (theme: ThemeType | string) => void;
  createOrderLayoutType: CreateOrderLayoutType;
  setCreateOrderLayoutType: (type: CreateOrderLayoutType) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

const SETTINGS_STORAGE_KEY = "prior-admin-settings";

interface Settings {
  layoutType: LayoutType;
  theme: ThemeType;
  createOrderLayoutType: CreateOrderLayoutType;
}

const defaultSettings: Settings = {
  layoutType: "modern", // Default to new sidebar layout
  theme: "blue", // Default to ocean (blue) theme
  createOrderLayoutType: "product-first", // Default to product-first layout for create order
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [layoutType, setLayoutTypeState] = useState<LayoutType>(
    defaultSettings.layoutType,
  );
  const [theme, setThemeState] = useState<ThemeType>(defaultSettings.theme);
  const [createOrderLayoutType, setCreateOrderLayoutTypeState] =
    useState<CreateOrderLayoutType>(defaultSettings.createOrderLayoutType);

  // Apply theme to document root on theme change
  useEffect(() => {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove(
      "light",
      "dark",
      "theme-dark",
      "theme-blue",
      "theme-green",
      "theme-purple",
      "theme-orange",
    );

    // Only apply theme classes for modern layout, always use light for legacy
    if (layoutType === "modern") {
      if (theme === "dark") {
        root.classList.add("light", "theme-dark"); // Use custom theme-dark instead of global dark
      } else {
        // For colored themes (blue, green, purple, orange)
        root.classList.add("light", `theme-${theme}`);
      }
    } else {
      // Always use light theme for legacy layout
      root.classList.add("light");
    }
  }, [theme, layoutType]);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const settings: Settings = JSON.parse(stored);

        setLayoutTypeState(settings.layoutType || defaultSettings.layoutType);

        // Validate theme - use blue (ocean) as fallback if invalid
        const loadedTheme = settings.theme;
        const validatedTheme = isValidTheme(loadedTheme) ? loadedTheme : defaultSettings.theme;
        setThemeState(validatedTheme);

        setCreateOrderLayoutTypeState(
          settings.createOrderLayoutType ||
            defaultSettings.createOrderLayoutType,
        );
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
    }
  }, []);

  // Save settings to localStorage whenever they change
  const saveSettings = (
    newLayoutType: LayoutType,
    newTheme: ThemeType,
    newCreateOrderLayoutType: CreateOrderLayoutType,
  ) => {
    try {
      const settings: Settings = {
        layoutType: newLayoutType,
        theme: newTheme,
        createOrderLayoutType: newCreateOrderLayoutType,
      };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  };

  const setLayoutType = (type: LayoutType) => {
    setLayoutTypeState(type);
    saveSettings(type, theme, createOrderLayoutType);
  };

  const setTheme = (newTheme: ThemeType | string) => {
    // Validate theme - use blue (ocean) as fallback if invalid
    const validatedTheme = isValidTheme(newTheme) ? newTheme : defaultSettings.theme;
    setThemeState(validatedTheme);
    saveSettings(layoutType, validatedTheme, createOrderLayoutType);
  };

  const setCreateOrderLayoutType = (type: CreateOrderLayoutType) => {
    setCreateOrderLayoutTypeState(type);
    saveSettings(layoutType, theme, type);
  };

  const toggleLayout = () => {
    setLayoutType(layoutType === "modern" ? "legacy" : "modern");
  };

  return (
    <SettingsContext.Provider
      value={{
        layoutType,
        setLayoutType,
        toggleLayout,
        theme,
        setTheme,
        createOrderLayoutType,
        setCreateOrderLayoutType,
      }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
