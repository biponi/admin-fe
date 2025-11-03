import React, { useState, useEffect } from "react";
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
import { useOTPVerification } from "../hooks/useOTPVerification";
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

  const {
    otpSent,
    isVerifying,
    isSending,
    isResending,
    isVerified,
    error,
    remainingTime,
    canResend,
    sendOTPCode,
    verifyOTPCode,
    resendOTPCode,
    resetOTPState,
  } = useOTPVerification({
    email,
    purpose,
    onVerificationSuccess: () => {
      onVerificationSuccess();
      handleClose();
    },
    onVerificationFailure,
  });

  // Auto-send OTP ONLY once when dialog opens (safe: no loop)
  useEffect(() => {
    if (open) {
      // Reset state every time dialog opens
      setOtpValue("");
      resetOTPState();

      // Auto-send if enabled and not already sent
      if (autoSendOnMount && !otpSent && !isSending) {
        sendOTPCode();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // Only depends on `open` — safe

  const handleVerify = async () => {
    if (otpValue.length !== 6 || isVerifying || isVerified) return;

    const success = await verifyOTPCode(otpValue);
    if (!success) {
      // Optional: keep OTP so user can correct it
      // setOtpValue(""); // ← avoid this unless needed
    }
  };

  const handleClose = () => {
    setOtpValue("");
    resetOTPState();
    onOpenChange(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const MainView = () => {
    return (
      <div className='flex flex-col gap-4 py-4'>
        <div className='flex items-center gap-2 p-3 bg-muted rounded-md'>
          <Mail className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-medium'>{email}</span>
        </div>

        {!otpSent ? (
          <Button onClick={sendOTPCode} disabled={isSending} className='w-full'>
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
                onClick={resendOTPCode}
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
                    {!canResend && " (wait 60s)"}
                  </>
                )}
              </Button>
            </div>

            <Button
              onClick={handleVerify}
              disabled={otpValue.length !== 6 || isVerifying || isVerified}
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
    );
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
            <MainView />
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
              <MainView />
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
