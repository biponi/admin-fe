import axios from "axios";
import axiosInstance from "./axios";
import { handleApiError } from ".";

const baseURL = "/api/v1/location";
// Public locations endpoint lives on the public API mount, not /api/v1
const publicLocationsURL = `${
  import.meta.env.VITE_API_BASE_URL
}/prior/location/locations`;

export interface DeliveryZone {
  _id: string;
  name: string;
  label: string;
  charge: number;
  description?: string;
  active: boolean;
  districtCount?: number;
}

export interface CourierMapping {
  cityId: string | null;
  zoneId: string | null;
  areaId?: string | null;
  mappingSource: "auto" | "manual";
  needsReview: boolean;
  syncedAt: string | null;
}

export interface LocationDistrict {
  _id: string;
  sourceId: string;
  divisionId: string;
  division: string;
  name: string;
  bnName: string;
  normalizedName: string;
  parentDistrict: string;
  zone: { _id: string; name: string; label: string; charge: number } | null;
  chargeOverride: number | null;
  effectiveCharge: number;
  active: boolean;
  courierMappings: { pathao?: CourierMapping; carrybee?: CourierMapping };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ------------------------------------------------------------------ Zones

export const getZones = async (): Promise<ApiResponse<DeliveryZone[]>> => {
  try {
    const response = await axiosInstance.get(`${baseURL}/zones`);
    return { success: true, data: response.data.data.zones };
  } catch (error: any) {
    console.error("Error fetching zones:", error.message);
    return handleApiError(error);
  }
};

export const createZone = async (
  payload: { name: string; label?: string; charge: number; description?: string }
): Promise<ApiResponse<DeliveryZone>> => {
  try {
    const response = await axiosInstance.post(`${baseURL}/zones`, payload);
    return { success: true, data: response.data.data.zone };
  } catch (error: any) {
    console.error("Error creating zone:", error.message);
    return handleApiError(error);
  }
};

export const updateZone = async (
  id: string,
  payload: { label?: string; charge?: number; description?: string; active?: boolean }
): Promise<ApiResponse<DeliveryZone>> => {
  try {
    const response = await axiosInstance.put(`${baseURL}/zones/${id}`, payload);
    return { success: true, data: response.data.data.zone };
  } catch (error: any) {
    console.error("Error updating zone:", error.message);
    return handleApiError(error);
  }
};

export const deleteZone = async (
  id: string,
  reassignTo?: string
): Promise<ApiResponse<{ deleted: boolean }>> => {
  try {
    const response = await axiosInstance.delete(
      `${baseURL}/zones/${id}${reassignTo ? `?reassignTo=${reassignTo}` : ""}`
    );
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error deleting zone:", error.message);
    return handleApiError(error);
  }
};

// -------------------------------------------------------------- Districts

export const getDistricts = async (params: {
  division?: string;
  zone?: string;
  search?: string;
  needsCourierReview?: boolean;
  provider?: string;
  page?: number;
  limit?: number;
}): Promise<
  ApiResponse<{ districts: LocationDistrict[]; total: number; page: number; limit: number }>
> => {
  try {
    const response = await axiosInstance.get(`${baseURL}/districts`, { params });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error fetching districts:", error.message);
    return handleApiError(error);
  }
};

export const updateDistrict = async (
  id: string,
  payload: {
    zone?: string | null;
    chargeOverride?: number | null;
    active?: boolean;
    /** move the area under a different district (divisionId) */
    divisionId?: string;
    courierMappings?: {
      pathao?: Partial<CourierMapping>;
      carrybee?: Partial<CourierMapping>;
    };
  }
): Promise<ApiResponse<LocationDistrict>> => {
  try {
    const body: Record<string, unknown> = { ...payload };
    // Backend validator expects dotted courier mapping keys
    if (payload.courierMappings?.pathao) {
      for (const [k, v] of Object.entries(payload.courierMappings.pathao))
        body[`courierMappings.pathao.${k}`] = v;
      delete body.courierMappings;
    }
    if (payload.courierMappings?.carrybee) {
      for (const [k, v] of Object.entries(payload.courierMappings.carrybee))
        body[`courierMappings.carrybee.${k}`] = v;
    }
    const response = await axiosInstance.put(`${baseURL}/districts/${id}`, body);
    return { success: true, data: response.data.data.district };
  } catch (error: any) {
    console.error("Error updating district:", error.message);
    return handleApiError(error);
  }
};

export const bulkUpdateDistricts = async (
  districtIds: string[],
  zone: string | null
): Promise<ApiResponse<{ modified: number }>> => {
  try {
    const response = await axiosInstance.put(`${baseURL}/districts/bulk`, {
      districtIds,
      zone,
    });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error bulk updating districts:", error.message);
    return handleApiError(error);
  }
};

/**
 * Create a new area. Backend naming: "district" = an area/upazila row,
 * "division" = its parent district. `zone` assigns it to a charge group.
 */
export const createDistrict = async (payload: {
  name: string;
  divisionId: string;
  division: string;
  bnName?: string;
  zone?: string | null;
  chargeOverride?: number | null;
}): Promise<ApiResponse<LocationDistrict>> => {
  try {
    const response = await axiosInstance.post(`${baseURL}/districts`, payload);
    return { success: true, data: response.data.data.district };
  } catch (error: any) {
    console.error("Error creating district:", error.message);
    return handleApiError(error);
  }
};

export const getDivisions = async (): Promise<
  ApiResponse<{ divisionId: string; division: string; districtCount: number }[]>
> => {
  try {
    const response = await axiosInstance.get(`${baseURL}/divisions`);
    return { success: true, data: response.data.data.divisions };
  } catch (error: any) {
    console.error("Error fetching divisions:", error.message);
    return handleApiError(error);
  }
};

// ---------------------------------------------------------- Courier sync

export const syncCourierMappings = async (
  provider: "pathao" | "carrybee",
  force = false
): Promise<ApiResponse<Record<string, number | string>>> => {
  try {
    const response = await axiosInstance.post(
      `${baseURL}/courier-sync/${provider}`,
      { force }
    );
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error(`Error syncing ${provider} mappings:`, error.message);
    return handleApiError(error);
  }
};

export const getCourierSyncStatus = async (
  provider: "pathao" | "carrybee"
): Promise<
  ApiResponse<{
    provider: string;
    total: number;
    matched: number;
    needsReview: number;
    manual: number;
    unmatched: number;
    lastSyncedAt: string | null;
  }>
> => {
  try {
    const response = await axiosInstance.get(
      `${baseURL}/courier-sync/${provider}/status`
    );
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error(`Error fetching ${provider} sync status:`, error.message);
    return handleApiError(error);
  }
};

// ------------------------------------------------------ Charge resolution

export interface ChargeResolution {
  matched: boolean;
  charge: number | null;
  zone: { id: string; name: string } | null;
  district: { id: string; name: string; division: string } | null;
}

/**
 * Resolve the authoritative delivery charge for a district/division from the
 * backend (zone charge / district override). Same source of truth the order
 * flows use — always wins over the cached locations tree / legacy tables.
 */
export const getCharge = async (
  district: string,
  division?: string
): Promise<ApiResponse<ChargeResolution>> => {
  try {
    const response = await axiosInstance.get(`${baseURL}/charge`, {
      params: { district, division },
    });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error resolving delivery charge:", error.message);
    return handleApiError(error);
  }
};

// ------------------------------------------------- Public locations tree

export interface PublicLocation {
  id: string;
  name: string;
  bnName: string;
  zone: { id: string; name: string; label: string } | null;
  charge: number;
}

export interface PublicDivision {
  divisionId: string;
  division: string;
  districts: PublicLocation[];
}

/**
 * Fetch the public locations tree (divisions → districts with charges).
 * Plain axios (no auth header) — this is the same endpoint the customer
 * website uses; responses are ETag-cached.
 */
export const getPublicLocations = async (): Promise<
  ApiResponse<{ version: number; divisions: PublicDivision[] }>
> => {
  try {
    const response = await axios.get(publicLocationsURL);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error fetching public locations:", error.message);
    return { success: false, error: error.message };
  }
};
