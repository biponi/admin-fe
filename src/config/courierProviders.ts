/**
 * Centralized Courier Provider Configuration
 *
 * To add a new provider:
 * 1. Add an entry to COURIER_PROVIDERS with key = provider slug
 * 2. That's it - icons, tracking URLs, labels will auto-propagate everywhere
 */

export interface CourierProviderConfig {
  slug: string;
  label: string;
  image: string;
  iconColor: string;
  iconBgColor: string;
  fallbackInitials?: string;
  trackingUrl?: (consignmentId: string, phone?: string) => string;
  description?: string;
}

export const COURIER_PROVIDERS: Record<string, CourierProviderConfig> = {
  steadfast: {
    slug: "steadfast",
    label: "Steadfast",
    image:
      "https://play-lh.googleusercontent.com/OQgYiwAh2d4VqZgjf0GxZM83ylNIzxOQ-Wctx_MXmrxuaSA67UeYYwVhQ2PEMBxd0hs0nxnsRvnsviPRDgWgoGU",
    iconColor: "text-blue-600",
    iconBgColor: "bg-blue-50",
    description: "Reliable delivery service with extensive coverage",
    trackingUrl: (consignmentId) =>
      `https://steadfast.com.bd/t/${consignmentId}`,
  },
  pathao: {
    slug: "pathao",
    label: "Pathao",
    image: "https://logosandtypes.com/wp-content/uploads/2025/04/Pathao.png",
    iconColor: "text-green-600",
    iconBgColor: "bg-green-50",
    description: "Fast delivery service for major cities",
    trackingUrl: (consignmentId, phone) =>
      `https://merchant.pathao.com/tracking?consignment_id=${consignmentId}&phone=${phone}`,
  },
  carrybee: {
    slug: "carrybee",
    label: "Carrybee",
    image:
      "https://play-lh.googleusercontent.com/TAPaAULv7Wk2icMdCCGKU6Zsd6tN6zQ1a9VDA4ylKdhl_tASScGVvvCXjLU0Wl8qPlEM49a6s5IbR1l-yCCc",
    iconColor: "text-amber-600",
    iconBgColor: "bg-amber-50",
    fallbackInitials: "CB",
    description: "Modern logistics solution for e-commerce",
    trackingUrl: (consignmentId, phone) =>
      `https://merchant.carrybee.com/order-track/${consignmentId}`,
  },
  manual: {
    slug: "manual",
    label: "Manual Delivery",
    image: "",
    iconColor: "text-cyan-600",
    iconBgColor: "bg-cyan-50",
    description: "Using Other Delivery Service",
  },
  self: {
    slug: "self",
    label: "By Hand",
    image: "",
    iconColor: "text-orange-600",
    iconBgColor: "bg-orange-50",
    description: "Self delivery like a panda 🥲",
  },
};

/** Ordered list of couriers for selector dropdowns */
export const COURIER_LIST = Object.values(COURIER_PROVIDERS);

/** Get config for a provider, falls back to a generic entry for unknown providers */
export function getProviderConfig(provider: string): CourierProviderConfig {
  const key = provider?.toLowerCase?.() || "";
  if (COURIER_PROVIDERS[key]) {
    return COURIER_PROVIDERS[key];
  }
  return {
    slug: key,
    label: provider || "Unknown",
    image: "",
    iconColor: "text-slate-600",
    iconBgColor: "bg-slate-50",
    fallbackInitials: (provider || "?").charAt(0).toUpperCase(),
  };
}

/** Get the logo image URL for a provider */
export function getProviderLogo(provider: string): string {
  return getProviderConfig(provider).image;
}

/** Get tracking URL for a provider and consignment */
export function getTrackingUrl(
  provider: string,
  consignmentId: string,
  phone?: string,
): string {
  const config = getProviderConfig(provider);
  if (config.trackingUrl) {
    return config.trackingUrl(consignmentId, phone);
  }
  return "";
}
