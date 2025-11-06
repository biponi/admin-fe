import { sendOTP, verifyOTP, resendOTP } from "../api/otp";
import { toast } from "react-hot-toast";

export const OTP_EXPIRY_TIME = 600; // 10 minutes in seconds
export const RESEND_COOLDOWN = 60; // 1 minute in seconds

interface SendOTPParams {
  email: string;
  purpose: string;
}

interface VerifyOTPParams {
  email: string;
  otp: string;
  purpose: string;
}

interface ResendOTPParams {
  email: string;
  purpose: string;
}

/**
 * Send OTP code to email
 */
export const sendOTPCode = async ({ email, purpose }: SendOTPParams) => {
  if (!email) {
    const errorMsg = "Email is required";
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const response = await sendOTP(email, purpose);

    if (response.success) {
      toast.success(
        response.message || "OTP sent successfully. Please check your email."
      );
      return {
        success: true,
        expiresIn: response.data?.expiresIn || OTP_EXPIRY_TIME,
      };
    } else {
      const errorMsg = response.error || "Failed to send OTP";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  } catch (err: any) {
    const errorMsg = err.message || "Failed to send OTP";
    toast.error(errorMsg);
    return { success: false, error: errorMsg };
  }
};

/**
 * Verify OTP code
 */
export const verifyOTPCode = async ({ email, otp, purpose }: VerifyOTPParams) => {
  if (!email || !otp) {
    const errorMsg = "Email and OTP are required";
    toast.error(errorMsg);
    return { success: false, error: errorMsg };
  }

  if (otp.length !== 6) {
    const errorMsg = "OTP must be 6 digits";
    toast.error(errorMsg);
    return { success: false, error: errorMsg };
  }

  try {
    const response = await verifyOTP(email, otp, purpose);

    if (response.success && response.data?.verified) {
      toast.success(response.message || "OTP verified successfully!");
      return { success: true };
    } else {
      const errorMsg = response.error || "Invalid OTP code";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  } catch (err: any) {
    const errorMsg = err.message || "Failed to verify OTP";
    toast.error(errorMsg);
    return { success: false, error: errorMsg };
  }
};

/**
 * Resend OTP code
 */
export const resendOTPCode = async ({ email, purpose }: ResendOTPParams) => {
  try {
    const response = await resendOTP(email, purpose);

    if (response.success) {
      toast.success(
        response.message ||
          "OTP resent successfully. Please check your email."
      );
      return {
        success: true,
        expiresIn: response.data?.expiresIn || OTP_EXPIRY_TIME,
      };
    } else {
      const errorMsg = response.error || "Failed to resend OTP";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  } catch (err: any) {
    const errorMsg = err.message || "Failed to resend OTP";
    toast.error(errorMsg);
    return { success: false, error: errorMsg };
  }
};
