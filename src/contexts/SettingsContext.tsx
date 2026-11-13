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
const VALID_THEMES = ["default", "dark", "blue", "green", "purple", "orange"] as const;
type ThemeType = (typeof VALID_THEMES)[number];

// Validation function to check if a theme value is valid
const isValidTheme = (theme: string): theme is ThemeType => {
  return VALID_THEMES.includes(theme as ThemeType);
};

// Valid sidebar weather background styles - must match the options in settings-panel
export const VALID_SIDEBAR_WEATHER_STYLES = ["image", "animated"] as const;
type SidebarWeatherStyle = (typeof VALID_SIDEBAR_WEATHER_STYLES)[number];

const isValidSidebarWeatherStyle = (
  style: string,
): style is SidebarWeatherStyle => {
  return VALID_SIDEBAR_WEATHER_STYLES.includes(style as SidebarWeatherStyle);
};

interface SettingsContextType {
  layoutType: LayoutType;
  setLayoutType: (type: LayoutType) => void;
  toggleLayout: () => void;
  theme: ThemeType;
  setTheme: (theme: ThemeType | string) => void;
  createOrderLayoutType: CreateOrderLayoutType;
  setCreateOrderLayoutType: (type: CreateOrderLayoutType) => void;
  sidebarWeatherStyle: SidebarWeatherStyle;
  setSidebarWeatherStyle: (style: SidebarWeatherStyle) => void;
  onekoEnabled: boolean;
  setOnekoEnabled: (enabled: boolean) => void;
  onekoCat: string;
  setOnekoCat: (cat: string) => void;
  onekoSpeed: string;
  setOnekoSpeed: (speed: string) => void;
  onekoFriend: boolean;
  setOnekoFriend: (friend: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

const SETTINGS_STORAGE_KEY = "prior-admin-settings";

interface Settings {
  layoutType: LayoutType;
  theme: ThemeType;
  createOrderLayoutType: CreateOrderLayoutType;
  sidebarWeatherStyle: SidebarWeatherStyle;
  onekoEnabled: boolean;
  onekoCat: string;
  onekoSpeed: string;
  onekoFriend: boolean;
}

const defaultSettings: Settings = {
  layoutType: "modern",
  theme: "default", // shadcn default light sidebar
  createOrderLayoutType: "product-first",
  sidebarWeatherStyle: "animated", // live CSS weather scene (sidebar + header)
  onekoEnabled: false, // cursor-chasing cat easter egg
  onekoCat: "classic",
  onekoSpeed: "normal",
  onekoFriend: false, // second critter joins the chase
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [layoutType, setLayoutTypeState] = useState<LayoutType>(
    defaultSettings.layoutType,
  );
  const [theme, setThemeState] = useState<ThemeType>(defaultSettings.theme);
  const [createOrderLayoutType, setCreateOrderLayoutTypeState] =
    useState<CreateOrderLayoutType>(defaultSettings.createOrderLayoutType);
  const [sidebarWeatherStyle, setSidebarWeatherStyleState] =
    useState<SidebarWeatherStyle>(defaultSettings.sidebarWeatherStyle);
  const [onekoEnabled, setOnekoEnabledState] = useState<boolean>(
    defaultSettings.onekoEnabled,
  );
  const [onekoCat, setOnekoCatState] = useState<string>(
    defaultSettings.onekoCat,
  );
  const [onekoSpeed, setOnekoSpeedState] = useState<string>(
    defaultSettings.onekoSpeed,
  );
  const [onekoFriend, setOnekoFriendState] = useState<boolean>(
    defaultSettings.onekoFriend,
  );

  // Apply theme classes to the document root. The theme-* classes repaint
  // --primary/--ring (app accents, dashboard gradients) but must NOT tint the
  // sidebar — the weather background (image/animated) owns that surface, so
  // index.scss re-pins the --sidebar-* variables on the sidebar container.
  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove(
      "light",
      "dark",
      "theme-default",
      "theme-dark",
      "theme-blue",
      "theme-green",
      "theme-purple",
      "theme-orange",
    );

    // Only apply theme classes for modern layout, always use light for legacy
    if (layoutType === "modern") {
      if (theme === "default") {
        // shadcn default — just light, no extra theme class
        root.classList.add("light");
      } else if (theme === "dark") {
        root.classList.add("light", "theme-dark");
      } else {
        root.classList.add("light", `theme-${theme}`);
      }
    } else {
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

        // Validate theme - fallback to default if invalid
        const loadedTheme = settings.theme;
        const validatedTheme = isValidTheme(loadedTheme) ? loadedTheme : defaultSettings.theme;
        setThemeState(validatedTheme);

        setCreateOrderLayoutTypeState(
          settings.createOrderLayoutType ||
            defaultSettings.createOrderLayoutType,
        );

        // Validate sidebar weather style - fallback to image if invalid
        const loadedSidebarWeatherStyle = settings.sidebarWeatherStyle;
        const validatedSidebarWeatherStyle =
          isValidSidebarWeatherStyle(loadedSidebarWeatherStyle)
            ? loadedSidebarWeatherStyle
            : defaultSettings.sidebarWeatherStyle;
        setSidebarWeatherStyleState(validatedSidebarWeatherStyle);

        if (typeof settings.onekoEnabled === "boolean") {
          setOnekoEnabledState(settings.onekoEnabled);
        }
        if (typeof settings.onekoCat === "string") {
          setOnekoCatState(settings.onekoCat);
        }
        if (typeof settings.onekoSpeed === "string") {
          setOnekoSpeedState(settings.onekoSpeed);
        }
        if (typeof settings.onekoFriend === "boolean") {
          setOnekoFriendState(settings.onekoFriend);
        }
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
    }
  }, []);

  // Save settings to localStorage whenever they change
  const saveSettings = (partial: Partial<Settings>) => {
    try {
      const settings: Settings = {
        layoutType,
        theme,
        createOrderLayoutType,
        sidebarWeatherStyle,
        onekoEnabled,
        onekoCat,
        onekoSpeed,
        onekoFriend,
        ...partial,
      };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  };

  const setLayoutType = (type: LayoutType) => {
    setLayoutTypeState(type);
    saveSettings({ layoutType: type });
  };

  const setTheme = (newTheme: ThemeType | string) => {
    // Validate theme - fallback to default if invalid
    const validatedTheme = isValidTheme(newTheme) ? newTheme : defaultSettings.theme;
    setThemeState(validatedTheme);
    saveSettings({ theme: validatedTheme });
  };

  const setCreateOrderLayoutType = (type: CreateOrderLayoutType) => {
    setCreateOrderLayoutTypeState(type);
    saveSettings({ createOrderLayoutType: type });
  };

  const setSidebarWeatherStyle = (style: SidebarWeatherStyle) => {
    setSidebarWeatherStyleState(style);
    saveSettings({ sidebarWeatherStyle: style });
  };

  const setOnekoEnabled = (enabled: boolean) => {
    setOnekoEnabledState(enabled);
    saveSettings({ onekoEnabled: enabled });
  };

  const setOnekoCat = (cat: string) => {
    setOnekoCatState(cat);
    saveSettings({ onekoCat: cat });
  };

  const setOnekoSpeed = (speed: string) => {
    setOnekoSpeedState(speed);
    saveSettings({ onekoSpeed: speed });
  };

  const setOnekoFriend = (friend: boolean) => {
    setOnekoFriendState(friend);
    saveSettings({ onekoFriend: friend });
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
        sidebarWeatherStyle,
        setSidebarWeatherStyle,
        onekoEnabled,
        setOnekoEnabled,
        onekoCat,
        setOnekoCat,
        onekoSpeed,
        setOnekoSpeed,
        onekoFriend,
        setOnekoFriend,
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
