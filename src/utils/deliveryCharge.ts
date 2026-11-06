import { BDDeliveryCharge, BDDistrictList } from './contents';
import { getPublicLocations, type PublicLocation } from '../api/location';

export interface DeliveryChargeInfo {
  charge: number;
  category: string;
  zoneName: string;
}

/**
 * Server-backed delivery charge lookup.
 *
 * The locations collection (admin-configurable, Settings → Location Settings)
 * is the source of truth; the hardcoded tables below are only a fallback for
 * when the API is unreachable. The backend recomputes the authoritative
 * charge on order creation regardless of what the client sends.
 */

// Module-level cache of the public locations tree — fetched lazily, shared by
// all callers, refreshed at most every 5 minutes.
let locationsCache: {
  at: number;
  // normalized "division|district" → charge info
  byKey: Map<string, DeliveryChargeInfo>;
} | null = null;
let locationsFetch: Promise<void> | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

function normalize(name: string): string {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+(sadar|district)$/i, '')
    .trim();
}

async function ensureLocations(): Promise<void> {
  if (locationsCache && Date.now() - locationsCache.at < CACHE_TTL_MS) return;
  if (locationsFetch) return locationsFetch;

  locationsFetch = (async () => {
    const res = await getPublicLocations();
    if (!res.success || !res.data) return; // keep stale/fallback data
    const byKey = new Map<string, DeliveryChargeInfo>();
    for (const division of res.data.divisions) {
      for (const d of division.districts as PublicLocation[]) {
        byKey.set(`${normalize(division.division)}|${normalize(d.name)}`, {
          charge: d.charge,
          category: d.zone?.name || 'unknown',
          zoneName: d.zone?.label || d.zone?.name || d.name,
        });
        byKey.set(`*|${normalize(d.name)}`, {
          charge: d.charge,
          category: d.zone?.name || 'unknown',
          zoneName: d.zone?.label || d.zone?.name || d.name,
        });
      }
    }
    locationsCache = { at: Date.now(), byKey };
  })();

  try {
    await locationsFetch;
  } finally {
    locationsFetch = null;
  }
}

/**
 * Legacy hardcoded-table lookup (fallback path).
 */
function calculateFromConstants(
  districtName: string,
  divisionName: string
): DeliveryChargeInfo {
  const district = BDDistrictList.find((d) => d.name === districtName);
  if (!district) {
    return { charge: 150, category: 'outside_dhaka', zoneName: 'Unknown' };
  }
  const chargeInfo = BDDeliveryCharge.find((dc) => dc.district_id === district.id);
  return {
    charge: chargeInfo?.deliveryCharge || 150,
    category: chargeInfo?.category || 'outside_dhaka',
    zoneName: chargeInfo?.zoneName || districtName,
  };
}

/**
 * Calculate delivery charge based on district and division names.
 * Prefers the admin-configured locations API; falls back to the legacy
 * hardcoded tables (then ৳150) if the API is unavailable.
 *
 * Synchronous by contract (existing call sites) — resolution against the
 * cached API data happens immediately; the cache refresh runs in background
 * so the first call may use fallback data.
 *
 * @param districtName - Name of the district (e.g., "Dhaka")
 * @param divisionName - Name of the division (e.g., "Dhaka")
 * @returns DeliveryChargeInfo with charge amount and metadata
 */
export const calculateDeliveryCharge = (
  districtName: string,
  divisionName: string
): DeliveryChargeInfo => {
  // Kick off a background refresh (no-op when cache is fresh)
  void ensureLocations();

  const divKey = normalize(divisionName);
  const distKey = normalize(districtName);
  const cache = locationsCache?.byKey;

  if (cache) {
    const fromApi = cache.get(`${divKey}|${distKey}`) || cache.get(`*|${distKey}`);
    if (fromApi) return fromApi;
    // District unknown to the server config — fall through to constants
  }

  return calculateFromConstants(districtName, divisionName);
};
