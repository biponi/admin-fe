import axios from "./axios";
import { handleApiError } from "./index";

const baseURL = `/api/v1`;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface SendOTPResponse {
  email: string;
  purpose: string;
  expiresIn: number;
}

interface VerifyOTPResponse {
  verified: boolean;
  email: string;
  purpose: string;
}

/**
 * OTP API Service
 * Provides methods for OTP email verification
 */

// Send OTP to email
export const sendOTP = async (
  email: string,
  purpose: string = "verification"
): Promise<ApiResponse<SendOTPResponse>> => {
  try {
    const response = await axios.post<any>(`${baseURL}/otp/send`, {
      email,
      purpose,
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to send OTP",
      };
    }
  } catch (error: any) {
    console.error("Error sending OTP:", error.message);
    return handleApiError(error);
  }
};

// Verify OTP code
export const verifyOTP = async (
  email: string,
  otp: string,
  purpose: string = "verification"
): Promise<ApiResponse<VerifyOTPResponse>> => {
  try {
    const response = await axios.post<any>(`${baseURL}/otp/verify`, {
      email,
      otp,
      purpose,
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to verify OTP",
      };
    }
  } catch (error: any) {
    console.error("Error verifying OTP:", error.message);
    return handleApiError(error);
  }
};

// Resend OTP
export const resendOTP = async (
  email: string,
  purpose: string = "verification"
): Promise<ApiResponse<SendOTPResponse>> => {
  try {
    const response = await axios.post<any>(`${baseURL}/otp/resend`, {
      email,
      purpose,
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to resend OTP",
      };
    }
  } catch (error: any) {
    console.error("Error resending OTP:", error.message);
    return handleApiError(error);
  }
};
