import axios from "./axios";
import config from "../utils/config";
import { handleApiError } from ".";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const signupUser = async (userData: {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  nid?: string;
  type: string;
  avatar?: string;
}): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post<any>(config.user.signup(), userData);
    if (response.status === 201) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to sign up user",
      };
    }
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const getAllUsers = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(config.user.allUsers());
    if (response.status === 200) {
      return { success: true, data: response.data.dataSource };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch users",
      };
    }
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const deleteUser = async (userId: string): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.delete<any>(config.user.deleteMember(userId));
    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to delete user",
      };
    }
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const getUserProfile = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(config.user.getUserProfile());
    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch profile",
      };
    }
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const updateUserInfo = async (
  userData:
    | FormData
    | {
        name?: string;
        avatar?: string | File;
        bio?: string;
        whatsapp_number?: string;
      }
): Promise<ApiResponse<any>> => {
  try {
    // Determine if we're sending FormData or JSON
    const isFormData = userData instanceof FormData;

    const apiConfig = {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    };

    const response = await axios.put<any>(
      config.user.updateUserData(),
      isFormData ? userData : JSON.stringify(userData),
      apiConfig
    );

    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to update user",
      };
    }
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const changeUserPassword = async (passwordData: {
  oldPassword: string;
  newPassword: string;
}): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put<any>(
      config.user.updatePasssword(),
      passwordData
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to change password",
      };
    }
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const adminChangeUserData = async (
  userId: string,
  userData: {
    newPassword?: string;
    email?: string;
    mobile_number?: string;
    role?: string;
  }
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put<any>(
      config.user.updateMemberData(userId),
      userData
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to update user data",
      };
    }
  } catch (error: any) {
    return handleApiError(error);
  }
};
