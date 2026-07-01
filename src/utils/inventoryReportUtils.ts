/**
 * Utility functions for inventory reports
 */

// ============================================================================
// NUMBER & CURRENCY FORMATTING
// ============================================================================

/**
 * Format number with thousands separators
 */
export const formatNumber = (num: number | undefined): string => {
  if (num === undefined || num === null) return "0";
  return Number(num) % 1 < 1
    ? Number(num).toFixed(2).toLocaleString()
    : num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
};

/**
 * Format currency with BDT symbol
 */
export const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return "৳0";
  return `৳${formatNumber(amount)}`;
};

/**
 * Format percentage
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1,
): string => {
  return `${value.toFixed(decimals)}%`;
};

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format date to readable string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return "Just now";
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
  if (diffMonths < 12)
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
};

// ============================================================================
// COLOR CODING HELPERS
// ============================================================================

/**
 * Get stock level color class
 */
export const getStockLevelColor = (stock: number): string => {
  if (stock === 0) return "text-red-600 bg-red-50 border-red-200";
  if (stock <= 3) return "text-red-600 bg-red-50 border-red-200";
  if (stock <= 10) return "text-amber-600 bg-amber-50 border-amber-200";
  if (stock <= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  return "text-green-600 bg-green-50 border-green-200";
};

/**
 * Get return rate color class
 */
export const getReturnRateColor = (rate: number): string => {
  if (rate <= 5) return "text-green-600 bg-green-50";
  if (rate <= 10) return "text-yellow-600 bg-yellow-50";
  if (rate <= 15) return "text-orange-600 bg-orange-50";
  return "text-red-600 bg-red-50";
};

/**
 * Get rating color class
 */
export const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return "text-green-600";
  if (rating >= 4.0) return "text-green-500";
  if (rating >= 3.5) return "text-yellow-600";
  if (rating >= 3.0) return "text-orange-600";
  return "text-red-600";
};

/**
 * Get dead stock severity color
 */
export const getDeadStockColor = (days: number): string => {
  if (days <= 120) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  if (days <= 180) return "text-orange-600 bg-orange-50 border-orange-200";
  return "text-red-600 bg-red-50 border-red-200";
};

/**
 * Get discount level color
 */
export const getDiscountColor = (discount: number): string => {
  if (discount >= 50) return "text-red-600 bg-red-50";
  if (discount >= 20) return "text-orange-600 bg-orange-50";
  return "text-green-600 bg-green-50";
};

// ============================================================================
// STAR RATING HELPERS
// ============================================================================

/**
 * Generate star rating display
 */
export const generateStarRating = (rating: number): string => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    "★".repeat(fullStars) + (hasHalfStar ? "½" : "") + "☆".repeat(emptyStars)
  );
};

/**
 * Calculate average rating from distribution
 */
export const calculateAverageRating = (
  distribution: Array<{ rating: string; totalVotes: number }>,
): number => {
  let totalVotes = 0;
  let weightedSum = 0;

  distribution.forEach((item) => {
    const stars = parseInt(item.rating);
    const votes = item.totalVotes;
    totalVotes += votes;
    weightedSum += stars * votes;
  });

  return totalVotes > 0 ? weightedSum / totalVotes : 0;
};

// ============================================================================
// DATA TRANSFORMATION HELPERS
// ============================================================================

/**
 * Transform inventory distribution data for chart
 */
export const transformDistributionData = (
  data: Array<{ range: string; count: number }>,
) => {
  return {
    labels: data.map((d) => d.range),
    values: data.map((d) => d.count),
  };
};

/**
 * Transform rating distribution data for chart
 */
export const transformRatingData = (
  data: Array<{ rating: string; totalVotes: number }>,
) => {
  return {
    labels: data.map((d) => d.rating),
    values: data.map((d) => d.totalVotes),
  };
};

/**
 * Calculate percentage of total
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

// ============================================================================
// REPORT TYPE CONFIGURATION
// ============================================================================

export const REPORT_CATEGORIES = {
  INVENTORY_HEALTH: {
    label: "Inventory Health",
    icon: "📊",
    color: "blue",
    description: "Overview of your inventory status",
  },
  SALES_ANALYTICS: {
    label: "Sales Analytics",
    icon: "📈",
    color: "green",
    description: "Sales performance metrics",
  },
  PRODUCT_QUALITY: {
    label: "Product Quality",
    icon: "⭐",
    color: "amber",
    description: "Customer ratings and reviews",
  },
  PRICING: {
    label: "Pricing",
    icon: "💰",
    color: "purple",
    description: "Price and discount analysis",
  },
  PERFORMANCE: {
    label: "Performance",
    icon: "🎯",
    color: "teal",
    description: "Category and manufacturer metrics",
  },
  CATALOG: {
    label: "Catalog",
    icon: "📦",
    color: "orange",
    description: "Product catalog changes",
  },
  STOCK_ANALYSIS: {
    label: "Stock Analysis",
    icon: "🔍",
    color: "rose",
    description: "Slow-moving inventory",
  },
} as const;

export const REPORT_TYPES = {
  "inventory-summary": {
    category: "INVENTORY_HEALTH",
    label: "Inventory Summary",
    description: "High-level inventory statistics",
  },
  "low-stock": {
    category: "INVENTORY_HEALTH",
    label: "Low Stock",
    description: "Products below stock threshold",
  },
  "out-of-stock": {
    category: "INVENTORY_HEALTH",
    label: "Out of Stock",
    description: "Products with zero inventory",
  },
  "inventory-distribution": {
    category: "INVENTORY_HEALTH",
    label: "Inventory Distribution",
    description: "Products grouped by stock ranges",
  },
  "top-selling": {
    category: "SALES_ANALYTICS",
    label: "Top Selling",
    description: "Best-performing products by sales",
  },
  "sales-activity": {
    category: "SALES_ANALYTICS",
    label: "Sales Activity",
    description: "Recently sold products",
  },
  "return-rate": {
    category: "SALES_ANALYTICS",
    label: "Return Rate",
    description: "Products with highest return rates",
  },
  "dead-stock": {
    category: "STOCK_ANALYSIS",
    label: "Dead Stock",
    description: "Products not sold recently",
  },
  "top-rated": {
    category: "PRODUCT_QUALITY",
    label: "Top Rated",
    description: "Highest customer-rated products",
  },
  "rating-distribution": {
    category: "PRODUCT_QUALITY",
    label: "Rating Distribution",
    description: "Customer ratings breakdown",
  },
  "discounted-products": {
    category: "PRICING",
    label: "Discounted Products",
    description: "Products currently on discount",
  },
  "highest-discount": {
    category: "PRICING",
    label: "Highest Discount",
    description: "Products with biggest discounts",
  },
  "price-distribution": {
    category: "PRICING",
    label: "Price Distribution",
    description: "Products grouped by price ranges",
  },
  "category-performance": {
    category: "PERFORMANCE",
    label: "Category Performance",
    description: "Sales by category",
  },
  "manufacturer-report": {
    category: "PERFORMANCE",
    label: "Manufacturer Report",
    description: "Sales by manufacturer",
  },
  "recently-added": {
    category: "CATALOG",
    label: "Recently Added",
    description: "Newest products in catalog",
  },
  "recently-updated": {
    category: "CATALOG",
    label: "Recently Updated",
    description: "Recently modified products",
  },
} as const;
