/**
 * OTP Verification Usage Examples
 *
 * This file contains various examples of how to use the reusable
 * OTP verification system in different contexts.
 *
 * Copy and adapt these examples to your specific use cases.
 */

import React, { useState } from "react";
import { OTPVerificationDialog } from "../components/OTPVerificationDialog";
import { useOTPVerification } from "../hooks/useOTPVerification";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import useLoginAuth from "../pages/auth/hooks/useLoginAuth";

// ============================================================================
// EXAMPLE 1: Simple Download Verification (Like Reports)
// ============================================================================

export const Example1_DownloadWithOTP = () => {
  const [showOTP, setShowOTP] = useState(false);
  const { user } = useLoginAuth();

  const handleDownload = () => {
    // Your download logic here
    console.log("Downloading file...");
    // downloadFile();
  };

  return (
    <>
      <Button onClick={() => setShowOTP(true)}>
        Download Sensitive File
      </Button>

      {user?.email && (
        <OTPVerificationDialog
          open={showOTP}
          onOpenChange={setShowOTP}
          email={user.email}
          purpose="download_file"
          title="Verify Download"
          description="Please verify your email to download this file"
          onVerificationSuccess={handleDownload}
          autoSendOnMount={true}
        />
      )}
    </>
  );
};

// ============================================================================
// EXAMPLE 2: Account Deletion with Confirmation
// ============================================================================

export const Example2_AccountDeletion = () => {
  const [showOTP, setShowOTP] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { user } = useLoginAuth();

  const handleDeleteAccount = async () => {
    try {
      // Your account deletion logic
      console.log("Deleting account...");
      // await deleteAccount();
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <p className="text-destructive font-semibold">Danger Zone</p>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.checked)}
          />
          <span>I understand this action is irreversible</span>
        </label>

        <Button
          variant="destructive"
          onClick={() => setShowOTP(true)}
          disabled={!confirmDelete}
        >
          Delete My Account
        </Button>
      </div>

      {user?.email && (
        <OTPVerificationDialog
          open={showOTP}
          onOpenChange={setShowOTP}
          email={user.email}
          purpose="account_deletion"
          title="Confirm Account Deletion"
          description="This action cannot be undone. Please verify your email to proceed."
          onVerificationSuccess={handleDeleteAccount}
          onVerificationFailure={(error) => {
            console.error("Verification failed:", error);
          }}
          autoSendOnMount={true}
        />
      )}
    </>
  );
};

// ============================================================================
// EXAMPLE 3: Password Change Verification
// ============================================================================

export const Example3_PasswordChange = () => {
  const [showOTP, setShowOTP] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const { user } = useLoginAuth();

  const handleChangePassword = async () => {
    try {
      console.log("Changing password...");
      // await changePassword(newPassword);
    } catch (error) {
      console.error("Failed to change password:", error);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <Input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <Button
          onClick={() => setShowOTP(true)}
          disabled={newPassword.length < 8}
        >
          Change Password
        </Button>
      </div>

      {user?.email && (
        <OTPVerificationDialog
          open={showOTP}
          onOpenChange={setShowOTP}
          email={user.email}
          purpose="password_change"
          title="Verify Password Change"
          description="For security, please verify your email before changing password"
          onVerificationSuccess={handleChangePassword}
          autoSendOnMount={true}
        />
      )}
    </>
  );
};

// ============================================================================
// EXAMPLE 4: Email Change Verification (Verify Old Email)
// ============================================================================

export const Example4_EmailChange = () => {
  const [showOTP, setShowOTP] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const { user } = useLoginAuth();

  const handleChangeEmail = async () => {
    try {
      console.log("Changing email to:", newEmail);
      // await changeEmail(newEmail);
    } catch (error) {
      console.error("Failed to change email:", error);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Current: {user?.email}</p>

        <Input
          type="email"
          placeholder="New email address"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />

        <Button onClick={() => setShowOTP(true)}>
          Change Email
        </Button>
      </div>

      {user?.email && (
        <OTPVerificationDialog
          open={showOTP}
          onOpenChange={setShowOTP}
          email={user.email} // Verify current email
          purpose="email_change"
          title="Verify Current Email"
          description="Please verify your current email before changing to a new one"
          onVerificationSuccess={handleChangeEmail}
          autoSendOnMount={true}
        />
      )}
    </>
  );
};

// ============================================================================
// EXAMPLE 5: Custom UI with useOTPVerification Hook
// ============================================================================

export const Example5_CustomOTPUI = () => {
  const [otpValue, setOtpValue] = useState("");
  const email = "user@example.com";

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
  } = useOTPVerification({
    email,
    purpose: "custom_action",
    onVerificationSuccess: () => {
      console.log("Custom action verified!");
      // Perform your custom action
    },
    onVerificationFailure: (err) => {
      console.error("Verification failed:", err);
    },
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4 max-w-md">
      <h3 className="font-semibold">Custom OTP UI Example</h3>

      <div className="p-4 bg-muted rounded-md">
        <p className="text-sm">Email: {email}</p>
      </div>

      {!otpSent ? (
        <Button onClick={sendOTPCode} disabled={isSending} className="w-full">
          {isSending ? "Sending OTP..." : "Send OTP"}
        </Button>
      ) : (
        <div className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
              disabled={isVerifying || isVerified}
              className="text-center text-lg tracking-widest"
            />
          </div>

          {remainingTime > 0 && (
            <div className="text-sm text-center text-muted-foreground">
              OTP expires in: <span className="font-mono">{formatTime(remainingTime)}</span>
            </div>
          )}

          <Button
            onClick={() => verifyOTPCode(otpValue)}
            disabled={otpValue.length !== 6 || isVerifying || isVerified}
            className="w-full"
          >
            {isVerifying ? "Verifying..." : isVerified ? "Verified ✓" : "Verify OTP"}
          </Button>

          <Button
            variant="outline"
            onClick={resendOTPCode}
            disabled={!canResend || isResending}
            className="w-full"
          >
            {isResending ? "Resending..." : canResend ? "Resend OTP" : "Wait to Resend"}
          </Button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {isVerified && (
        <div className="p-3 bg-green-500/10 border border-green-500 rounded-md">
          <p className="text-sm text-green-600">Email verified successfully!</p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXAMPLE 6: Multi-step Form with OTP Verification
// ============================================================================

export const Example6_MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [showOTP, setShowOTP] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
  });

  const handleSubmitForm = () => {
    console.log("Form submitted with data:", formData);
    // Submit your form
  };

  return (
    <div className="space-y-4">
      {step === 1 && (
        <div className="space-y-4">
          <h3>Step 1: Basic Information</h3>
          <Input
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Button onClick={() => setStep(2)}>Next</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3>Step 2: Verify Email</h3>
          <p className="text-sm text-muted-foreground">
            Please verify your email to complete registration
          </p>
          <Button onClick={() => setShowOTP(true)}>Verify Email</Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3>✓ Registration Complete!</h3>
          <p className="text-sm text-muted-foreground">
            Your account has been created successfully.
          </p>
        </div>
      )}

      <OTPVerificationDialog
        open={showOTP}
        onOpenChange={setShowOTP}
        email={formData.email}
        purpose="registration"
        title="Verify Your Email"
        description="Please enter the verification code sent to your email"
        onVerificationSuccess={() => {
          handleSubmitForm();
          setStep(3);
        }}
        autoSendOnMount={true}
      />
    </div>
  );
};

// ============================================================================
// EXAMPLE 7: Bulk Action Confirmation
// ============================================================================

export const Example7_BulkActionConfirmation = () => {
  const [showOTP, setShowOTP] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { user } = useLoginAuth();

  const handleBulkDelete = () => {
    console.log("Deleting items:", selectedItems);
    // Perform bulk delete
  };

  return (
    <>
      <div className="space-y-4">
        <p className="font-medium">
          {selectedItems.length} items selected
        </p>

        <Button
          variant="destructive"
          onClick={() => setShowOTP(true)}
          disabled={selectedItems.length === 0}
        >
          Delete Selected Items
        </Button>
      </div>

      {user?.email && (
        <OTPVerificationDialog
          open={showOTP}
          onOpenChange={setShowOTP}
          email={user.email}
          purpose="bulk_delete"
          title="Confirm Bulk Action"
          description={`You are about to delete ${selectedItems.length} items. Please verify to continue.`}
          onVerificationSuccess={handleBulkDelete}
          autoSendOnMount={true}
        />
      )}
    </>
  );
};

// ============================================================================
// Export all examples
// ============================================================================

export const AllOTPExamples = () => {
  const [currentExample, setCurrentExample] = useState(1);

  const examples = [
    { id: 1, title: "Download with OTP", component: <Example1_DownloadWithOTP /> },
    { id: 2, title: "Account Deletion", component: <Example2_AccountDeletion /> },
    { id: 3, title: "Password Change", component: <Example3_PasswordChange /> },
    { id: 4, title: "Email Change", component: <Example4_EmailChange /> },
    { id: 5, title: "Custom OTP UI", component: <Example5_CustomOTPUI /> },
    { id: 6, title: "Multi-step Form", component: <Example6_MultiStepForm /> },
    { id: 7, title: "Bulk Actions", component: <Example7_BulkActionConfirmation /> },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">OTP Verification Examples</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {examples.map((ex) => (
          <Button
            key={ex.id}
            variant={currentExample === ex.id ? "default" : "outline"}
            onClick={() => setCurrentExample(ex.id)}
          >
            {ex.title}
          </Button>
        ))}
      </div>

      <div className="border rounded-lg p-6">
        {examples.find((ex) => ex.id === currentExample)?.component}
      </div>
    </div>
  );
};
