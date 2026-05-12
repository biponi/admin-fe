/**
 * Brand Configuration
 *
 * Central brand configuration loaded from environment variables.
 * All brand-related values should be sourced from this file to maintain
 * a single source of truth across the application.
 *
 * Environment Variables:
 * - REACT_APP_BRAND_NAME: Full application name (e.g., "Prior Admin")
 * - REACT_APP_BRAND_SHORT_NAME: Short brand name (e.g., "Prior")
 * - REACT_APP_BRAND_COMPANY_NAME: Legal company name (e.g., "PriorBD")
 * - REACT_APP_BRAND_WEBSITE: Company website URL
 * - REACT_APP_BRAND_EMAIL: Company contact email
 */

export const BRAND_CONFIG = {
  /** Full application name displayed in titles, headers, and documents */
  name: process.env.REACT_APP_BRAND_NAME || 'Prior Admin',

  /** Short brand name for compact displays (mobile, badges, etc.) */
  shortName: process.env.REACT_APP_BRAND_SHORT_NAME || 'Prior',

  /** Legal company name for invoices, documents, and copyright notices */
  companyName: process.env.REACT_APP_BRAND_COMPANY_NAME || 'PriorBD',

  /** Company website URL used in documents and links */
  website: process.env.REACT_APP_BRAND_WEBSITE || 'https://priorbd.com',

  /** Company contact email for support and inquiries */
  email: process.env.REACT_APP_BRAND_EMAIL || 'prior.retailshop.info.bd@gmail.com',

  /** Order tracking URL template */
  trackingUrl: (orderNumber: string) =>
    `${process.env.REACT_APP_BRAND_WEBSITE || 'https://priorbd.com'}/order/${orderNumber}`,

  /** Default currency for the application */
  currency: '৳',

  /** Default locale/language */
  locale: 'en-BD',
} as const;

/** Type definitions for brand configuration */
export type BrandConfig = typeof BRAND_CONFIG;

/**
 * Helper function to get brand name with optional fallback
 * @param fallback - Fallback name if brand config is not available
 * @returns Brand name or fallback
 */
export const getBrandName = (fallback?: string): string => {
  return BRAND_CONFIG.name || fallback || 'Prior Admin';
};

/**
 * Helper function to get short brand name with optional fallback
 * @param fallback - Fallback name if brand config is not available
 * @returns Short brand name or fallback
 */
export const getShortBrandName = (fallback?: string): string => {
  return BRAND_CONFIG.shortName || fallback || 'Prior';
};
