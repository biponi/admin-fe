# Report Page with OTP Verification

This implementation provides a complete reporting system with secure OTP verification for downloading reports.

## Features

✅ **Reusable OTP Verification System**
- Loosely coupled and can be used for any feature requiring email verification
- Hook-based architecture for easy integration
- Automatic OTP expiry and resend functionality
- Clean, modern UI with countdown timer

✅ **Report Page**
- Sales Overview Report
- Sales Trend Analysis
- Customer Insights
- Product Performance Metrics
- Date range filtering with calendar picker
- CSV and PDF export with OTP verification

## File Structure

```
src/
├── api/
│   ├── otp.ts                      # OTP API service
│   └── report.ts                   # Report API service
├── hooks/
│   └── useOTPVerification.tsx      # Reusable OTP verification hook
├── components/
│   └── OTPVerificationDialog.tsx   # Reusable OTP dialog component
└── pages/
    └── report/
        ├── index.tsx               # Main report page
        └── README.md               # This file
```

## Usage Examples

### 1. Using OTP Verification for Reports (Already Implemented)

The report page already implements OTP verification for downloads:

```tsx
// In src/pages/report/index.tsx
<OTPVerificationDialog
  open={showOTPDialog}
  onOpenChange={setShowOTPDialog}
  email={user.email}
  purpose="download_report"
  title="Verify Download Request"
  description="For security, please verify your email to download the report"
  onVerificationSuccess={handleDownloadAfterVerification}
  autoSendOnMount={true}
/>
```

### 2. Using OTP Verification for Other Features

The OTP system is designed to be reusable. Here's how to use it in other parts of your application:

#### Example 1: Password Reset

```tsx
import { OTPVerificationDialog } from "../../components/OTPVerificationDialog";

function PasswordResetPage() {
  const [showOTP, setShowOTP] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleResetPassword = () => {
    // After OTP is verified, reset the password
    resetPassword();
  };

  return (
    <>
      <Button onClick={() => setShowOTP(true)}>
        Reset Password
      </Button>

      <OTPVerificationDialog
        open={showOTP}
        onOpenChange={setShowOTP}
        email={userEmail}
        purpose="password_reset"
        title="Reset Password Verification"
        onVerificationSuccess={handleResetPassword}
        autoSendOnMount={true}
      />
    </>
  );
}
```

#### Example 2: Account Deletion

```tsx
import { OTPVerificationDialog } from "../../components/OTPVerificationDialog";

function AccountSettings() {
  const [showDeleteOTP, setShowDeleteOTP] = useState(false);
  const { user } = useLoginAuth();

  const handleDeleteAccount = async () => {
    // Delete account after verification
    await deleteUserAccount();
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setShowDeleteOTP(true)}
      >
        Delete Account
      </Button>

      <OTPVerificationDialog
        open={showDeleteOTP}
        onOpenChange={setShowDeleteOTP}
        email={user.email}
        purpose="account_deletion"
        title="Confirm Account Deletion"
        description="Please verify your email to delete your account"
        onVerificationSuccess={handleDeleteAccount}
        autoSendOnMount={true}
      />
    </>
  );
}
```

#### Example 3: Using the Hook Directly (Custom UI)

If you need custom UI instead of the dialog component:

```tsx
import { useOTPVerification } from "../../hooks/useOTPVerification";
import { useState } from "react";

function CustomOTPComponent() {
  const [otpValue, setOtpValue] = useState("");
  const email = "user@example.com";

  const {
    otpSent,
    isVerifying,
    isSending,
    remainingTime,
    canResend,
    sendOTPCode,
    verifyOTPCode,
    resendOTPCode,
  } = useOTPVerification({
    email,
    purpose: "custom_action",
    onVerificationSuccess: () => {
      console.log("OTP verified successfully!");
      // Perform your action here
    },
  });

  return (
    <div>
      {!otpSent ? (
        <button onClick={sendOTPCode} disabled={isSending}>
          {isSending ? "Sending..." : "Send OTP"}
        </button>
      ) : (
        <>
          <input
            type="text"
            value={otpValue}
            onChange={(e) => setOtpValue(e.target.value)}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
          />
          <button
            onClick={() => verifyOTPCode(otpValue)}
            disabled={isVerifying || otpValue.length !== 6}
          >
            {isVerifying ? "Verifying..." : "Verify OTP"}
          </button>

          <p>Time remaining: {Math.floor(remainingTime / 60)}:{remainingTime % 60}</p>

          <button
            onClick={resendOTPCode}
            disabled={!canResend}
          >
            Resend OTP
          </button>
        </>
      )}
    </div>
  );
}
```

## API Endpoints

### OTP Endpoints

```
POST /api/v1/otp/send
POST /api/v1/otp/verify
POST /api/v1/otp/resend
```

### Report Endpoints

```
GET /api/v1/report/sales-overview
GET /api/v1/report/sales-trend
GET /api/v1/report/customer-insights
GET /api/v1/report/product-performance
GET /api/v1/report/export
```

## OTP Verification Hook API

### `useOTPVerification(options)`

#### Options

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `email` | string | Yes | Email address to send OTP to |
| `purpose` | string | No | Purpose of OTP (e.g., "verification", "download_report", "password_reset") |
| `onVerificationSuccess` | function | No | Callback when OTP is verified successfully |
| `onVerificationFailure` | function | No | Callback when OTP verification fails |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `otpSent` | boolean | Whether OTP has been sent |
| `isVerifying` | boolean | Whether verification is in progress |
| `isSending` | boolean | Whether OTP is being sent |
| `isResending` | boolean | Whether OTP is being resent |
| `isVerified` | boolean | Whether OTP has been verified |
| `error` | string \| null | Current error message |
| `remainingTime` | number | Seconds until OTP expires |
| `canResend` | boolean | Whether resend is allowed |
| `sendOTPCode` | function | Send OTP to email |
| `verifyOTPCode` | function | Verify OTP code |
| `resendOTPCode` | function | Resend OTP code |
| `resetOTPState` | function | Reset all OTP state |

## OTP Dialog Component API

### `<OTPVerificationDialog />`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `open` | boolean | Yes | - | Dialog open state |
| `onOpenChange` | function | Yes | - | Callback when dialog should open/close |
| `email` | string | Yes | - | Email address for OTP |
| `purpose` | string | No | "verification" | Purpose of OTP verification |
| `title` | string | No | "Email Verification" | Dialog title |
| `description` | string | No | "Please enter the 6-digit code..." | Dialog description |
| `onVerificationSuccess` | function | Yes | - | Callback on successful verification |
| `onVerificationFailure` | function | No | - | Callback on verification failure |
| `autoSendOnMount` | boolean | No | false | Auto-send OTP when dialog opens |

## Security Features

1. **Rate Limiting**: Built-in cooldown period for resending OTP (60 seconds)
2. **Expiry Time**: OTP expires after 10 minutes
3. **Purpose-based**: Different purposes can be used for different actions
4. **Secure Download**: Reports require OTP verification before download

## Best Practices

### 1. Always Specify Purpose

```tsx
// Good
<OTPVerificationDialog purpose="password_reset" ... />

// Avoid
<OTPVerificationDialog ... />
```

### 2. Handle Success and Failure

```tsx
<OTPVerificationDialog
  onVerificationSuccess={() => {
    // Perform secure action
    downloadSensitiveData();
  }}
  onVerificationFailure={(error) => {
    // Log error, show message, etc.
    console.error("Verification failed:", error);
  }}
/>
```

### 3. Use autoSendOnMount for Better UX

```tsx
// Automatically send OTP when dialog opens
<OTPVerificationDialog
  autoSendOnMount={true}
  ...
/>
```

## Customization

### Custom Styling

The components use Tailwind CSS and shadcn/ui. You can customize by:

1. Modifying the component classes
2. Using className props
3. Updating your Tailwind config

### Custom Messages

Pass custom titles and descriptions:

```tsx
<OTPVerificationDialog
  title="Custom Title"
  description="Custom description text"
  ...
/>
```

## Navigation

To access the Reports page:

```
/reports
```

The route is protected and requires:
- User authentication
- "Report" page permission
- "view" action permission

## Troubleshooting

### OTP not received
- Check spam folder
- Verify email address is correct
- Wait 1-2 minutes (email may be delayed)
- Try resend after cooldown period

### Cannot download report
- Ensure OTP is verified
- Check internet connection
- Verify admin authentication token

### Permission errors
- Ensure user has "Report" page access
- Check role permissions in admin panel

## Future Enhancements

Potential improvements:
- SMS OTP support
- Biometric verification option
- Report scheduling and email delivery
- More chart types and visualizations
- Export to Excel format
- Custom report builder

## Related Files

- [OTP API Service](../../api/otp.ts)
- [Report API Service](../../api/report.ts)
- [OTP Hook](../../hooks/useOTPVerification.tsx)
- [OTP Dialog Component](../../components/OTPVerificationDialog.tsx)
- [Config File](../../utils/config.ts)

## Support

For backend API documentation, see:
- [Implementation_Guide/README_FRONTEND.md](../../../Implementation_Guide/README_FRONTEND.md)
- [Implementation_Guide/FRONTEND_API_GUIDE.md](../../../Implementation_Guide/FRONTEND_API_GUIDE.md)
