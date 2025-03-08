import axios from "./axios";
import { handleApiError } from ".";
import config from "../utils/config";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const createReserve = async (
  reserveData: any
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post<any>(
      config.reserve.createReserve(),
      reserveData
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to create reserve",
      };
    }
  } catch (error: any) {
    console.error("Error creating reserve:", error.message);
    return handleApiError(error);
  }
};

export const getReserveStore = async (
  id: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(config.reserve.getReserveStore(id));
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to get reserve store",
      };
    }
  } catch (error: any) {
    console.error("Error getting reserve store:", error.message);
    return handleApiError(error);
  }
};

export const addRecord = async (recordData: any): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post<any>(
      config.reserve.addRecord(),
      recordData
    );
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to add record",
      };
    }
  } catch (error: any) {
    console.error("Error adding record:", error.message);
    return handleApiError(error);
  }
};

export const editStoreRecord = async (
  recordData: any
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put<any>(
      config.reserve.editStoreRecord(),
      recordData
    );
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to edit record",
      };
    }
  } catch (error: any) {
    console.error("Error editing record:", error.message);
    return handleApiError(error);
  }
};

export const deleteStoreRecord = async (
  storeId: string,
  recordId: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.delete<any>(
      `${config.reserve.deleteStoreRecord()}?storeId=${storeId}&recordId=${recordId}`
    );
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to delete record",
      };
    }
  } catch (error: any) {
    console.error("Error deleting record:", error.message);
    return handleApiError(error);
  }
};

export const deleteReserve = async (id: number): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.delete<any>(config.reserve.deleteReserve(id));
    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to delete reserve",
      };
    }
  } catch (error: any) {
    console.error("Error deleting reserve:", error.message);
    return handleApiError(error);
  }
};

export const getReserveStores = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(config.reserve.getReserveStores());
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to get reserve stores",
      };
    }
  } catch (error: any) {
    console.error("Error getting reserve stores:", error.message);
    return handleApiError(error);
  }
};
