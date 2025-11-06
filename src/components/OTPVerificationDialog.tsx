import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import {
  sendOTPCode,
  verifyOTPCode,
  resendOTPCode,
  OTP_EXPIRY_TIME,
  RESEND_COOLDOWN,
} from "../hooks/useOTPVerification";
import { Loader2, Mail, Clock, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { useIsMobile } from "./hooks/use-mobile";

interface OTPVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  purpose?: string;
  title?: string;
  readonly?: boolean;
  description?: string;
  onVerificationSuccess: () => void;
  onVerificationFailure?: (error: string) => void;
  autoSendOnMount?: boolean;
}

export const OTPVerificationDialog: React.FC<OTPVerificationDialogProps> = ({
  open,
  onOpenChange,
  email,
  readonly = false,
  purpose = "verification",
  title = "Email Verification",
  description = "Please enter the 6-digit code sent to your email",
  onVerificationSuccess,
  onVerificationFailure,
  autoSendOnMount = false,
}) => {
  const isMobile = useIsMobile();
  const [otpValue, setOtpValue] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  const canResend = otpSent && resendCooldown === 0;
  const expiryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer for OTP expiry - runs every second
  useEffect(() => {
    if (expiryTimerRef.current) {
      clearInterval(expiryTimerRef.current);
    }

    if (!otpSent || remainingTime <= 0) return;

    expiryTimerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setOtpSent(false);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (expiryTimerRef.current) {
        clearInterval(expiryTimerRef.current);
      }
    };
    //eslint-disable-next-line
  }, [otpSent, remainingTime > 0]);

  // Countdown timer for resend cooldown - runs every second
  useEffect(() => {
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }

    if (resendCooldown <= 0) return;

    cooldownTimerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        const newCooldown = prev - 1;
        return newCooldown < 0 ? 0 : newCooldown;
      });
    }, 1000);

    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
    //eslint-disable-next-line
  }, [resendCooldown > 0]);

  // Auto-send OTP when dialog opens
  useEffect(() => {
    if (open) {
      resetOTPState();
      setOtpValue("");

      if (autoSendOnMount) {
        handleSendOTP();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const resetOTPState = useCallback(() => {
    setOtpSent(false);
    setIsVerifying(false);
    setIsSending(false);
    setIsResending(false);
    setIsVerified(false);
    setError(null);
    setRemainingTime(0);
    setResendCooldown(0);
  }, []);

  const handleSendOTP = useCallback(async () => {
    setIsSending(true);
    setError(null);

    const result = await sendOTPCode({ email, purpose });

    if (result.success) {
      setOtpSent(true);
      setRemainingTime(result.expiresIn || OTP_EXPIRY_TIME);
      setResendCooldown(RESEND_COOLDOWN);
    } else {
      setError(result.error || "Failed to send OTP");
    }

    setIsSending(false);
  }, [email, purpose]);

  const handleClose = useCallback(() => {
    setOtpValue("");
    resetOTPState();
    onOpenChange(false);
  }, [resetOTPState, onOpenChange]);

  const handleVerify = useCallback(async () => {
    if (otpValue.length !== 6 || isVerifying || isVerified) return;

    setIsVerifying(true);
    setError(null);

    const result = await verifyOTPCode({ email, otp: otpValue, purpose });

    if (result.success) {
      setIsVerified(true);
      onVerificationSuccess();
      handleClose();
    } else {
      setError(result.error || "Verification failed");
      onVerificationFailure?.(result.error || "Verification failed");
    }

    setIsVerifying(false);
  }, [
    otpValue,
    isVerifying,
    isVerified,
    email,
    purpose,
    onVerificationSuccess,
    onVerificationFailure,
    handleClose,
  ]);

  const handleResendOTP = useCallback(async () => {
    if (!canResend) return;

    setIsResending(true);
    setError(null);

    const result = await resendOTPCode({ email, purpose });

    if (result.success) {
      setRemainingTime(result.expiresIn || OTP_EXPIRY_TIME);
      setResendCooldown(RESEND_COOLDOWN);
    } else {
      setError(result.error || "Failed to resend OTP");
    }

    setIsResending(false);
  }, [canResend, email, purpose]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {!isMobile ? (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Mail className='h-5 w-5' />
                {title}
              </DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <div className='flex flex-col gap-4 py-4'>
              <div className='flex items-center gap-2 p-3 bg-muted rounded-md'>
                <Mail className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium'>{email}</span>
              </div>

              {!otpSent ? (
                <Button
                  onClick={handleSendOTP}
                  disabled={isSending}
                  className='w-full'>
                  {isSending ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Mail className='mr-2 h-4 w-4' />
                      Send OTP Code
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <div className='flex flex-col items-center gap-4'>
                    <InputOTP
                      maxLength={6}
                      value={otpValue}
                      onChange={setOtpValue}
                      disabled={isVerifying || isVerified}>
                      <InputOTPGroup className='gap-2.5'>
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className='border rounded-md shadow-sm border-gray-400'
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>

                    {remainingTime > 0 && (
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Clock className='h-4 w-4' />
                        <span>Expires in {formatTime(remainingTime)}</span>
                      </div>
                    )}

                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleResendOTP}
                      disabled={!canResend || isResending}
                      className='w-full'>
                      {isResending ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Resending...
                        </>
                      ) : (
                        <>
                          <RefreshCw className='mr-2 h-4 w-4' />
                          Resend OTP
                          {!canResend && ` (${resendCooldown}s)`}
                        </>
                      )}
                    </Button>
                  </div>

                  <Button
                    onClick={handleVerify}
                    disabled={
                      otpValue.length !== 6 || isVerifying || isVerified
                    }
                    className='w-full'>
                    {isVerifying ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Verifying...
                      </>
                    ) : isVerified ? (
                      "Verified ✓"
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>
                </>
              )}

              {error && (
                <Alert variant='destructive'>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={isVerifying || isSending || isResending}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className='flex items-center justify-center gap-2'>
                <Mail className='h-5 w-5' />
                {title}
              </DrawerTitle>
              <DrawerDescription>{description}</DrawerDescription>
            </DrawerHeader>

            <div className='w-full px-4'>
              <div className='flex flex-col gap-4 py-4'>
                <div className='flex items-center gap-2 p-3 bg-muted rounded-md'>
                  <Mail className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm font-medium'>{email}</span>
                </div>

                {!otpSent ? (
                  <Button
                    onClick={handleSendOTP}
                    disabled={isSending}
                    className='w-full'>
                    {isSending ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Mail className='mr-2 h-4 w-4' />
                        Send OTP Code
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <div className='flex flex-col items-center gap-4'>
                      <InputOTP
                        maxLength={6}
                        value={otpValue}
                        onChange={setOtpValue}
                        disabled={isVerifying || isVerified}>
                        <InputOTPGroup className='gap-2.5'>
                          {[0, 1, 2, 3, 4, 5].map((index) => (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className='border rounded-md shadow-sm border-gray-400'
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>

                      {remainingTime > 0 && (
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                          <Clock className='h-4 w-4' />
                          <span>Expires in {formatTime(remainingTime)}</span>
                        </div>
                      )}

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleResendOTP}
                        disabled={!canResend || isResending}
                        className='w-full'>
                        {isResending ? (
                          <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Resending...
                          </>
                        ) : (
                          <>
                            <RefreshCw className='mr-2 h-4 w-4' />
                            Resend OTP
                            {!canResend && ` (${resendCooldown}s)`}
                          </>
                        )}
                      </Button>
                    </div>

                    <Button
                      onClick={handleVerify}
                      disabled={
                        otpValue.length !== 6 || isVerifying || isVerified
                      }
                      className='w-full'>
                      {isVerifying ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Verifying...
                        </>
                      ) : isVerified ? (
                        "Verified ✓"
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>
                  </>
                )}

                {error && (
                  <Alert variant='destructive'>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <DrawerFooter>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={isVerifying || isSending || isResending}>
                Cancel
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};
