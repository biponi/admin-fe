// Advanced Analytics Configuration
export const ANALYTICS_CONFIG = {
  // API Configuration
  API: {
    ENDPOINT: '/v1/dashboard/advanced-analytics',
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },

  // Cache Configuration
  CACHE: {
    DURATION: 5 * 60 * 1000, // 5 minutes
    MAX_ENTRIES: 10,
    STORAGE_KEY: 'advanced-analytics-cache',
  },

  // UI Configuration
  UI: {
    DEBOUNCE_DELAY: 500, // 500ms for date range changes
    SKELETON_COUNT: 6, // Number of skeleton cards
    CHART_HEIGHT: {
      SMALL: 250,
      MEDIUM: 350,
      LARGE: 400,
    },
  },

  // Date Range Validation
  DATE_VALIDATION: {
    MAX_RANGE_DAYS: 365, // 1 year maximum
    MIN_RANGE_DAYS: 1, // 1 day minimum
    DEFAULT_RANGE_DAYS: 30, // Default to 30 days
  },

  // Performance
  PERFORMANCE: {
    LAZY_LOAD_THRESHOLD: 1000, // Load data when 1000px away
    VIRTUAL_SCROLL_THRESHOLD: 100, // Use virtual scrolling for tables with 100+ rows
  },

  // Feature Flags
  FEATURES: {
    EXPORT_ENABLED: true,
    REAL_TIME_UPDATES: false,
    ADVANCED_FILTERING: true,
    CHART_ANIMATIONS: true,
  },

  // Error Handling
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
    UNAUTHORIZED: 'You are not authorized to view this data. Please log in again.',
    FORBIDDEN: 'Access denied. You don\'t have permission to view this data.',
    RATE_LIMITED: 'Too many requests. Please wait a moment before trying again.',
    SERVER_ERROR: 'Server error occurred. Please try again later.',
    VALIDATION_ERROR: 'Invalid data provided. Please check your input.',
    DEFAULT_ERROR: 'An unexpected error occurred. Please try again.',
  },

  // Chart Colors (theme-aware)
  CHART_COLORS: {
    PRIMARY: '#3B82F6',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    DANGER: '#EF4444',
    INFO: '#6366F1',
    GRADIENT: {
      BLUE: ['#3B82F6', '#1E40AF'],
      GREEN: ['#10B981', '#047857'],
      PURPLE: ['#8B5CF6', '#6D28D9'],
      ORANGE: ['#F97316', '#C2410C'],
    },
  },

  // Analytics Segments
  CUSTOMER_SEGMENTS: {
    VIP: { color: '#8B5CF6', threshold: 50000 },
    PREMIUM: { color: '#3B82F6', threshold: 25000 },
    LOYAL: { color: '#10B981', threshold: 10000 },
    REGULAR: { color: '#6B7280', threshold: 0 },
  },

  // Format Configuration
  FORMAT: {
    CURRENCY: 'BDT',
    CURRENCY_SYMBOL: '৳',
    DATE_FORMAT: 'MMM dd, yyyy',
    SHORT_DATE_FORMAT: 'MMM dd',
    DECIMAL_PLACES: 2,
  },
} as const;

// Environment-specific overrides
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV;
  
  if (env === 'development') {
    return {
      ...ANALYTICS_CONFIG,
      API: {
        ...ANALYTICS_CONFIG.API,
        TIMEOUT: 60000, // Longer timeout in development
      },
      CACHE: {
        ...ANALYTICS_CONFIG.CACHE,
        DURATION: 1 * 60 * 1000, // Shorter cache in development
      },
      FEATURES: {
        ...ANALYTICS_CONFIG.FEATURES,
        REAL_TIME_UPDATES: true, // Enable in development
      },
    };
  }

  if (env === 'production') {
    return {
      ...ANALYTICS_CONFIG,
      FEATURES: {
        ...ANALYTICS_CONFIG.FEATURES,
        CHART_ANIMATIONS: false, // Disable animations for performance in production
      },
    };
  }

  return ANALYTICS_CONFIG;
};

export default getEnvironmentConfig();