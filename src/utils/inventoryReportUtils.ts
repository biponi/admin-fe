/**
 * Utility functions for inventory reports.
 *
 * Report metadata (labels, icons, pagination/dateRange support) lives in
 * src/pages/product/components/inventory/reportScaffold/reportRegistry.ts;
 * status colors live in src/lib/claudeChart.tsx.
 */

// ============================================================================
// NUMBER & CURRENCY FORMATTING
// ============================================================================

/**
 * Format number with thousands separators.
 * Integers stay integers; decimals keep up to 2 places.
 */
export const formatNumber = (num: number | undefined): string => {
  if (num === undefined || num === null || Number.isNaN(Number(num))) return "0";
  return Number(num).toLocaleString(undefined, {
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
 * Format percentage (tolerates string values from the API, e.g. "12.5")
 */
export const formatPercentage = (
  value: number | string,
  decimals: number = 1,
): string => {
  const n = Number(value);
  return `${(Number.isNaN(n) ? 0 : n).toFixed(decimals)}%`;
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
// DATA TRANSFORMATION HELPERS
// ============================================================================

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

/**
 * Calculate percentage of total
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};
