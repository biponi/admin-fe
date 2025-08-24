import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type LayoutType = 'modern' | 'legacy';
type ThemeType = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange';

interface SettingsContextType {
  layoutType: LayoutType;
  setLayoutType: (type: LayoutType) => void;
  toggleLayout: () => void;
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'prior-admin-settings';

interface Settings {
  layoutType: LayoutType;
  theme: ThemeType;
}

const defaultSettings: Settings = {
  layoutType: 'modern', // Default to new sidebar layout
  theme: 'light' // Default to light theme
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [layoutType, setLayoutTypeState] = useState<LayoutType>(defaultSettings.layoutType);
  const [theme, setThemeState] = useState<ThemeType>(defaultSettings.theme);

  // Apply theme to document root on theme change
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark', 'theme-dark', 'theme-blue', 'theme-green', 'theme-purple', 'theme-orange');
    
    // Only apply theme classes for modern layout, always use light for legacy
    if (layoutType === 'modern') {
      if (theme === 'light') {
        root.classList.add('light');
      } else if (theme === 'dark') {
        root.classList.add('light', 'theme-dark'); // Use custom theme-dark instead of global dark
      } else {
        root.classList.add('light', `theme-${theme}`);
      }
    } else {
      // Always use light theme for legacy layout
      root.classList.add('light');
    }
  }, [theme, layoutType]);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const settings: Settings = JSON.parse(stored);
        setLayoutTypeState(settings.layoutType || defaultSettings.layoutType);
        setThemeState(settings.theme || defaultSettings.theme);
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
  }, []);

  // Save settings to localStorage whenever they change
  const saveSettings = (newLayoutType: LayoutType, newTheme: ThemeType) => {
    try {
      const settings: Settings = { layoutType: newLayoutType, theme: newTheme };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  };

  const setLayoutType = (type: LayoutType) => {
    setLayoutTypeState(type);
    saveSettings(type, theme);
  };

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    saveSettings(layoutType, newTheme);
  };

  const toggleLayout = () => {
    setLayoutType(layoutType === 'modern' ? 'legacy' : 'modern');
  };

  return (
    <SettingsContext.Provider value={{ layoutType, setLayoutType, toggleLayout, theme, setTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}