import { useEffect, useState } from "react";
import {
  getPublicLocations,
  type PublicDivision,
} from "../api/location";
import { BDDistrictList, BDDivisions } from "../utils/contents";

/**
 * Dynamic locations (divisions → districts) + delivery charges from the
 * server-configured locations collection.
 *
 * Exposes the data in the same shape as the legacy hardcoded constants
 * (`{ id, division_id, name, bn_name, ... }`) so existing consumers keep
 * working — the API values simply replace the constants once loaded. Falls
 * back to the constants when the API is unreachable.
 *
 * The module-level cache is shared by every component; the `version` counter
 * bumps when data lands so reactive consumers can recompute charges.
 */

// Same shape as BDDivisions / BDDistrictList entries in contents.tsx
export interface DivisionOption {
  id: string;
  name: string;
  bn_name: string;
}
export interface DistrictOption {
  id: string;
  division_id: string;
  name: string;
  bn_name: string;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

interface LocationsCache {
  at: number;
  divisions: DivisionOption[];
  districts: DistrictOption[];
  // normalized "division|district" / "*|district" → charge
  chargeByName: Map<string, number>;
}

let cache: LocationsCache | null = null;
let inflight: Promise<void> | null = null;
let subscribers = new Set<(v: number) => void>();
let version = 0;

function normalize(name: string): string {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s+(sadar|district)$/i, "")
    .trim();
}

function buildCache(divisions: PublicDivision[]): LocationsCache {
  const divisionOptions: DivisionOption[] = divisions.map((d) => ({
    id: d.divisionId,
    name: d.division,
    bn_name: d.districts[0]?.bnName || "",
  }));
  const districtOptions: DistrictOption[] = divisions.flatMap((d) =>
    d.districts.map((x) => ({
      id: x.sourceId,
      division_id: d.divisionId,
      name: x.name,
      bn_name: x.bnName,
    })),
  );
  const chargeByName = new Map<string, number>();
  for (const d of divisions) {
    for (const x of d.districts) {
      if (x.charge) {
        chargeByName.set(`${normalize(d.division)}|${normalize(x.name)}`, x.charge);
        chargeByName.set(`*|${normalize(x.name)}`, x.charge);
      }
    }
  }
  return { at: Date.now(), divisions: divisionOptions, districts: districtOptions, chargeByName };
}

async function ensureLoaded(): Promise<void> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return;
  if (inflight) return inflight;
  inflight = (async () => {
    const res = await getPublicLocations();
    if (res.success && res.data?.divisions?.length) {
      cache = buildCache(res.data.divisions);
      version += 1;
      subscribers.forEach((fn) => fn(version));
    }
  })();
  try {
    await inflight;
  } finally {
    inflight = null;
  }
}

/**
 * Shared dynamic-locations hook.
 * Returns API-backed divisions/districts (legacy shape) or the hardcoded
 * constants until the API responds, plus a charge lookup and a `version`
 * that changes when server data arrives.
 */
export const useLocations = () => {
  const [, setTick] = useState(version);

  useEffect(() => {
    void ensureLoaded();
    const onUpdate = (v: number) => setTick(v);
    subscribers.add(onUpdate);
    return () => {
      subscribers.delete(onUpdate);
    };
  }, []);

  const divisions = cache?.divisions ?? (BDDivisions as DivisionOption[]);
  const districts = cache?.districts ?? (BDDistrictList as DistrictOption[]);

  const getChargeByName = (districtName: string, divisionName: string): number | undefined => {
    if (!cache) return undefined;
    return (
      cache.chargeByName.get(`${normalize(divisionName)}|${normalize(districtName)}`) ??
      cache.chargeByName.get(`*|${normalize(districtName)}`)
    );
  };

  return {
    /** true once server data has loaded (false = using hardcoded fallback) */
    loaded: !!cache,
    version,
    divisions,
    districts,
    getChargeByName,
  };
};
