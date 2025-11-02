# OTP Verification Quick Reference

> Copy-paste ready code snippets for using the OTP verification system

## 🚀 Quick Start (3 Steps)

### Step 1: Import
```tsx
import { OTPVerificationDialog } from "../components/OTPVerificationDialog";
```

### Step 2: Add State
```tsx
const [showOTP, setShowOTP] = useState(false);
const { user } = useLoginAuth();
```

### Step 3: Use Component
```tsx
<OTPVerificationDialog
  open={showOTP}
  onOpenChange={setShowOTP}
  email={user.email}
  purpose="your_purpose"
  onVerificationSuccess={() => {
    // Your secure action here
  }}
  autoSendOnMount={true}
/>
```

## 📋 Common Use Cases

### Download Protection
```tsx
<Button onClick={() => setShowOTP(true)}>Download File</Button>

<OTPVerificationDialog
  open={showOTP}
  onOpenChange={setShowOTP}
  email={user.email}
  purpose="download_file"
  onVerificationSuccess={downloadFile}
  autoSendOnMount={true}
/>
```

### Password Change
```tsx
<OTPVerificationDialog
  open={showOTP}
  onOpenChange={setShowOTP}
  email={user.email}
  purpose="password_change"
  title="Verify Password Change"
  onVerificationSuccess={changePassword}
  autoSendOnMount={true}
/>
```

### Account Deletion
```tsx
<OTPVerificationDialog
  open={showOTP}
  onOpenChange={setShowOTP}
  email={user.email}
  purpose="account_deletion"
  title="Confirm Account Deletion"
  description="This action cannot be undone"
  onVerificationSuccess={deleteAccount}
  autoSendOnMount={true}
/>
```

## 🎣 Using the Hook (Custom UI)

```tsx
import { useOTPVerification } from "../hooks/useOTPVerification";

const {
  sendOTPCode,
  verifyOTPCode,
  resendOTPCode,
  otpSent,
  isVerifying,
  remainingTime,
  canResend
} = useOTPVerification({
  email: "user@example.com",
  purpose: "custom_action",
  onVerificationSuccess: () => console.log("Success!"),
});

// Then build your own UI using these methods
```

## 📚 Component Props

| Prop | Type | Required | Example |
|------|------|----------|---------|
| `open` | boolean | ✅ | `showOTP` |
| `onOpenChange` | function | ✅ | `setShowOTP` |
| `email` | string | ✅ | `user.email` |
| `onVerificationSuccess` | function | ✅ | `() => download()` |
| `purpose` | string | ❌ | `"download_file"` |
| `title` | string | ❌ | `"Verify Email"` |
| `description` | string | ❌ | `"Enter the code"` |
| `autoSendOnMount` | boolean | ❌ | `true` |
| `onVerificationFailure` | function | ❌ | `(err) => log(err)` |

## 🔑 Common Purposes

```tsx
"download_report"    // Report downloads
"download_file"      // File downloads
"password_change"    // Password updates
"password_reset"     // Forgot password
"account_deletion"   // Delete account
"email_change"       // Change email
"registration"       // User signup
"bulk_delete"        // Bulk actions
"admin_action"       // Admin operations
"custom_action"      // Your custom use
```

## ⚡ Hook API Quick Reference

```tsx
const {
  // State
  otpSent: boolean,           // OTP was sent
  isVerifying: boolean,       // Currently verifying
  isSending: boolean,         // Currently sending
  isResending: boolean,       // Currently resending
  isVerified: boolean,        // Successfully verified
  error: string | null,       // Current error
  remainingTime: number,      // Seconds until expiry
  canResend: boolean,         // Can resend now?

  // Actions
  sendOTPCode: () => Promise<void>,
  verifyOTPCode: (otp: string) => Promise<boolean>,
  resendOTPCode: () => Promise<void>,
  resetOTPState: () => void,
} = useOTPVerification({...});
```

## 💡 Tips

### ✅ DO
```tsx
// Specify purpose for different actions
<OTPVerificationDialog purpose="password_reset" ... />

// Use autoSendOnMount for better UX
<OTPVerificationDialog autoSendOnMount={true} ... />

// Handle both success and failure
<OTPVerificationDialog
  onVerificationSuccess={() => doAction()}
  onVerificationFailure={(err) => logError(err)}
/>
```

### ❌ DON'T
```tsx
// Don't forget to pass email
<OTPVerificationDialog email="" ... /> // ❌

// Don't use same purpose for different actions
<OTPVerificationDialog purpose="generic" ... /> // ❌

// Don't ignore verification failure
<OTPVerificationDialog
  onVerificationSuccess={() => doAction()}
  // Missing onVerificationFailure ❌
/>
```

## 🎨 Styling

The components use Tailwind CSS and shadcn/ui. Customize by:

```tsx
// Override dialog styles
<OTPVerificationDialog
  className="custom-class"
  ...
/>

// Or modify the component file directly
```

## 🔍 Debugging

```tsx
// Enable console logs
const {
  error,  // Check error state
  ...
} = useOTPVerification({
  onVerificationSuccess: () => console.log("✅ Success"),
  onVerificationFailure: (err) => console.error("❌ Failed:", err),
});

// Check OTP state
console.log({
  otpSent,
  isVerifying,
  remainingTime,
  canResend,
});
```

## 📂 Import Paths

```tsx
// Components
import { OTPVerificationDialog } from "../components/OTPVerificationDialog";

// Hooks
import { useOTPVerification } from "../hooks/useOTPVerification";

// API (if needed directly)
import { sendOTP, verifyOTP, resendOTP } from "../api/otp";
```

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| OTP not received | Check spam folder, wait 1-2 minutes |
| Can't resend | Wait 60 seconds between resends |
| Invalid OTP error | Check if OTP expired (10 min limit) |
| Email undefined | Ensure user is logged in and has email |

## 📱 Full Example

```tsx
import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { OTPVerificationDialog } from "../components/OTPVerificationDialog";
import useLoginAuth from "../pages/auth/hooks/useLoginAuth";

export const SecureDownload = () => {
  const [showOTP, setShowOTP] = useState(false);
  const { user } = useLoginAuth();

  const handleDownload = () => {
    console.log("Downloading file...");
    // Your download logic here
  };

  return (
    <>
      <Button onClick={() => setShowOTP(true)}>
        Download Secure File
      </Button>

      {user?.email && (
        <OTPVerificationDialog
          open={showOTP}
          onOpenChange={setShowOTP}
          email={user.email}
          purpose="download_file"
          title="Verify Download"
          description="Please verify your email to download"
          onVerificationSuccess={handleDownload}
          onVerificationFailure={(error) => {
            console.error("Verification failed:", error);
          }}
          autoSendOnMount={true}
        />
      )}
    </>
  );
};
```

## 🔗 Resources

- [Full Documentation](src/pages/report/README.md)
- [Usage Examples](src/examples/OTPUsageExamples.tsx)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
- [Backend API Docs](Implementation_Guide/README_FRONTEND.md)

---

**Need help?** Check the [Report README](src/pages/report/README.md) for detailed documentation.
