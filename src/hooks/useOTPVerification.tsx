import { useState, useCallback, useEffect } from "react";
import { sendOTP, verifyOTP, resendOTP } from "../api/otp";
import { toast } from "react-hot-toast";

interface UseOTPVerificationProps {
  email: string;
  purpose?: string;
  onVerificationSuccess?: () => void;
  onVerificationFailure?: (error: string) => void;
}

interface UseOTPVerificationReturn {
  // State
  otpSent: boolean;
  isVerifying: boolean;
  isSending: boolean;
  isResending: boolean;
  isVerified: boolean;
  error: string | null;
  remainingTime: number;
  canResend: boolean;

  // Actions
  sendOTPCode: () => Promise<void>;
  verifyOTPCode: (otp: string) => Promise<boolean>;
  resendOTPCode: () => Promise<void>;
  resetOTPState: () => void;
}

const OTP_EXPIRY_TIME = 600; // 10 minutes in seconds
const RESEND_COOLDOWN = 60; // 1 minute in seconds

/**
 * Reusable hook for OTP verification functionality
 * Handles sending, verifying, and resending OTP codes
 *
 * @example
 * const { sendOTPCode, verifyOTPCode, otpSent, isVerified } = useOTPVerification({
 *   email: "user@example.com",
 *   purpose: "download_report",
 *   onVerificationSuccess: () => console.log("Verified!")
 * });
 */
export const useOTPVerification = ({
  email,
  purpose = "verification",
  onVerificationSuccess,
  onVerificationFailure,
}: UseOTPVerificationProps): UseOTPVerificationReturn => {
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [lastSentTime, setLastSentTime] = useState<number | null>(null);

  // Calculate if resend is allowed
  const canResend =
    otpSent &&
    lastSentTime !== null &&
    Date.now() - lastSentTime >= RESEND_COOLDOWN * 1000;

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (!otpSent || remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          setOtpSent(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpSent, remainingTime]);

  // Send OTP code
  const sendOTPCode = useCallback(async () => {
    if (!email) {
      const errorMsg = "Email is required";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await sendOTP(email, purpose);

      if (response.success) {
        setOtpSent(true);
        setRemainingTime(response.data?.expiresIn || OTP_EXPIRY_TIME);
        setLastSentTime(Date.now());
        toast.success(
          response.message || "OTP sent successfully. Please check your email."
        );
      } else {
        const errorMsg = response.error || "Failed to send OTP";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || "Failed to send OTP";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSending(false);
    }
  }, [email, purpose]);

  // Verify OTP code
  const verifyOTPCode = useCallback(
    async (otp: string): Promise<boolean> => {
      if (!email || !otp) {
        const errorMsg = "Email and OTP are required";
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }

      if (otp.length !== 6) {
        const errorMsg = "OTP must be 6 digits";
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }

      setIsVerifying(true);
      setError(null);

      try {
        const response = await verifyOTP(email, otp, purpose);

        if (response.success && response.data?.verified) {
          setIsVerified(true);
          toast.success(
            response.message || "OTP verified successfully!"
          );
          onVerificationSuccess?.();
          return true;
        } else {
          const errorMsg = response.error || "Invalid OTP code";
          setError(errorMsg);
          toast.error(errorMsg);
          onVerificationFailure?.(errorMsg);
          return false;
        }
      } catch (err: any) {
        const errorMsg = err.message || "Failed to verify OTP";
        setError(errorMsg);
        toast.error(errorMsg);
        onVerificationFailure?.(errorMsg);
        return false;
      } finally {
        setIsVerifying(false);
      }
    },
    [email, purpose, onVerificationSuccess, onVerificationFailure]
  );

  // Resend OTP code
  const resendOTPCode = useCallback(async () => {
    if (!canResend) {
      const waitTime = Math.ceil(
        (RESEND_COOLDOWN * 1000 - (Date.now() - (lastSentTime || 0))) / 1000
      );
      toast.error(`Please wait ${waitTime} seconds before resending`);
      return;
    }

    setIsResending(true);
    setError(null);

    try {
      const response = await resendOTP(email, purpose);

      if (response.success) {
        setRemainingTime(response.data?.expiresIn || OTP_EXPIRY_TIME);
        setLastSentTime(Date.now());
        toast.success(
          response.message || "OTP resent successfully. Please check your email."
        );
      } else {
        const errorMsg = response.error || "Failed to resend OTP";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || "Failed to resend OTP";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsResending(false);
    }
  }, [email, purpose, canResend, lastSentTime]);

  // Reset OTP state
  const resetOTPState = useCallback(() => {
    setOtpSent(false);
    setIsVerifying(false);
    setIsSending(false);
    setIsResending(false);
    setIsVerified(false);
    setError(null);
    setRemainingTime(0);
    setLastSentTime(null);
  }, []);

  return {
    // State
    otpSent,
    isVerifying,
    isSending,
    isResending,
    isVerified,
    error,
    remainingTime,
    canResend,

    // Actions
    sendOTPCode,
    verifyOTPCode,
    resendOTPCode,
    resetOTPState,
  };
};
