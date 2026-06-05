/**
 * Brand Configuration
 *
 * Central brand configuration loaded from environment variables.
 * All brand-related values should be sourced from this file to maintain
 * a single source of truth across the application.
 *
 * Environment Variables:
 * - VITE_BRAND_NAME: Full application name (e.g., "Prior Admin")
 * - VITE_BRAND_SHORT_NAME: Short brand name (e.g., "Prior")
 * - VITE_BRAND_COMPANY_NAME: Legal company name (e.g., "PriorBD")
 * - VITE_BRAND_WEBSITE: Company website URL
 * - VITE_BRAND_EMAIL: Company contact email
 * - VITE_BRAND_ADDRESS: Physical address (e.g., "Shop 134, Genetic Plaza, Dhanmondi-27, Dhaka")
 * - VITE_BRAND_PHONE: Contact phone (e.g., "+880 1700-534317")
 * - VITE_BRAND_LOGO_URL: Main logo URL
 * - VITE_BRAND_INVOICE_LOGO_URL: Logo URL for PDF invoices
 * - VITE_BRAND_PACKING_LOGO_URL: Logo URL for packing slips
 * - VITE_BRAND_ICON_URL: Small icon URL
 */

export const BRAND_CONFIG = {
  /** Full application name displayed in titles, headers, and documents */
  name: import.meta.env.VITE_BRAND_NAME || 'Prior Admin',

  /** Short brand name for compact displays (mobile, badges, etc.) */
  shortName: import.meta.env.VITE_BRAND_SHORT_NAME || 'Prior',

  /** Legal company name for invoices, documents, and copyright notices */
  companyName: import.meta.env.VITE_BRAND_COMPANY_NAME || 'PriorBD',

  /** Company website URL used in documents and links */
  website: import.meta.env.VITE_BRAND_WEBSITE || 'https://priorbd.com',

  /** Company contact email for support and inquiries */
  email: import.meta.env.VITE_BRAND_EMAIL || 'prior.retailshop.info.bd@gmail.com',

  /** Physical company address for invoices and documents */
  address: import.meta.env.VITE_BRAND_ADDRESS || 'Shop 134, Genetic Plaza, Dhanmondi-27, Dhaka',

  /** Contact phone number for customer support */
  phone: import.meta.env.VITE_BRAND_PHONE || '+880 1700-534317',

  /** Main logo URL for general use */
  logoUrl: import.meta.env.VITE_BRAND_LOGO_URL || 'https://res.cloudinary.com/emerging-it/image/upload/v1755976159/2193d5ff-ffb3-4fb7-ae67-c7a79e89c3f6__1_-removebg-preview_sobjwy.png',

  /** High-resolution logo URL for PDF invoices */
  invoiceLogoUrl: import.meta.env.VITE_BRAND_INVOICE_LOGO_URL || 'https://res.cloudinary.com/emerging-it/image/upload/v1755976159/2193d5ff-ffb3-4fb7-ae67-c7a79e89c3f6__1_-removebg-preview_sobjwy.png',

  /** Compact logo URL for thermal printer packing slips */
  packingLogoUrl: import.meta.env.VITE_BRAND_PACKING_LOGO_URL || 'https://res.cloudinary.com/emerging-it/image/upload/v1755976159/2193d5ff-ffb3-4fb7-ae67-c7a79e89c3f6__1_-removebg-preview_sobjwy.png',

  /** Small icon URL for favicons and compact displays */
  iconUrl: import.meta.env.VITE_BRAND_ICON_URL || 'https://res.cloudinary.com/emerging-it/image/upload/v1755976159/2193d5ff-ffb3-4fb7-ae67-c7a79e89c3f6__1_-removebg-preview_sobjwy.png',

  /** Order tracking URL template */
  trackingUrl: (orderNumber: string) =>
    `${import.meta.env.VITE_BRAND_WEBSITE || 'https://priorbd.com'}/order/${orderNumber}`,

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
