# Password Change with OTP - Visual Flow Diagram

## 🔄 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER PROFILE PAGE                            │
│  /profile                                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ User clicks
                              │ "Change Password"
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              PASSWORD CHANGE SECTION APPEARS                     │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │  New Password:      [__________________]           │         │
│  │  Confirm Password:  [__________________]           │         │
│  │                                                     │         │
│  │  [Cancel]  [Update Password]                       │         │
│  └────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ User fills passwords
                              │ and clicks "Update Password"
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VALIDATION CHECKS                             │
│                                                                  │
│  ✓ Both fields filled?                                          │
│  ✓ Passwords match?                                             │
│  ✓ Password >= 8 characters?                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                ❌ FAIL              ✅ PASS
                    │                   │
                    ▼                   ▼
         ┌──────────────────┐  ┌──────────────────┐
         │  Show Error      │  │  Open OTP        │
         │  Toast Message   │  │  Dialog          │
         └──────────────────┘  └──────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              OTP VERIFICATION DIALOG                             │
│  ┌──────────────────────────────────────────────────┐           │
│  │  📧 Verify Password Change                       │           │
│  │                                                   │           │
│  │  Email: user@example.com                         │           │
│  │                                                   │           │
│  │  [Auto-Send OTP to Email]                        │           │
│  │                                                   │           │
│  │  Enter 6-digit code:                             │           │
│  │  [_] [_] [_] [_] [_] [_]                         │           │
│  │                                                   │           │
│  │  ⏱️ Expires in 9:45                               │           │
│  │                                                   │           │
│  │  [Resend OTP (wait 60s)]                         │           │
│  │                                                   │           │
│  │  [Verify OTP]                                    │           │
│  │                                                   │           │
│  │  [Cancel]                                        │           │
│  └──────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ OTP sent to email
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     USER'S EMAIL INBOX                           │
│                                                                  │
│  From: Prior eCommerce <noreply@priorbd.com>                    │
│  Subject: Password Change Verification Code                     │
│                                                                  │
│  Your verification code is: 123456                              │
│  This code expires in 10 minutes.                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ User copies code
                              │ and enters it
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OTP VERIFICATION                              │
│                                                                  │
│  POST /api/v1/otp/verify                                        │
│  {                                                               │
│    email: "user@example.com",                                   │
│    otp: "123456",                                               │
│    purpose: "password_change"                                   │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                ❌ FAIL              ✅ SUCCESS
                    │                   │
                    ▼                   ▼
         ┌──────────────────┐  ┌──────────────────┐
         │  Show Error:     │  │  Call            │
         │  "Invalid OTP"   │  │  performPassword │
         │  Clear OTP       │  │  Change()        │
         │  input           │  │                  │
         └──────────────────┘  └──────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              PASSWORD CHANGE API CALL                            │
│                                                                  │
│  POST /api/v1/user/member/change-password                       │
│  {                                                               │
│    oldPassword: "",                                             │
│    newPassword: "newSecurePassword123"                          │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                ❌ FAIL              ✅ SUCCESS
                    │                   │
                    ▼                   ▼
         ┌──────────────────┐  ┌──────────────────┐
         │  Show Error      │  │  ✅ Success!     │
         │  Toast           │  │  - Close dialog  │
         └──────────────────┘  │  - Show toast    │
                               │  - Clear fields  │
                               │  - Close edit    │
                               └──────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUCCESS STATE                                 │
│                                                                  │
│  ✅ Toast: "Password updated successfully"                      │
│  ✅ OTP Dialog: Closed                                          │
│  ✅ Password fields: Cleared                                    │
│  ✅ Edit mode: Disabled                                         │
│  ✅ User: Can log in with new password                          │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 Security Checkpoints

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                               │
└─────────────────────────────────────────────────────────────────┘

1️⃣  User Authentication
    ├─ User must be logged in
    └─ Valid session token required

2️⃣  Password Validation
    ├─ Passwords must match
    ├─ Minimum 8 characters
    └─ Both fields required

3️⃣  Email Verification (OTP)
    ├─ 6-digit code sent to registered email
    ├─ Code expires in 10 minutes
    ├─ Maximum 5 verification attempts
    └─ 60-second cooldown between resends

4️⃣  Backend Validation
    ├─ Verify user identity
    ├─ Validate new password
    └─ Update password hash
```

## 📊 State Management Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    COMPONENT STATES                             │
└────────────────────────────────────────────────────────────────┘

Initial State:
├─ editMode.password: false
├─ formData.newPassword: ""
├─ formData.confirmPassword: ""
└─ showOTPDialog: false

↓ User clicks "Change Password"

Edit Mode Active:
├─ editMode.password: true
├─ formData.newPassword: ""
├─ formData.confirmPassword: ""
└─ showOTPDialog: false

↓ User fills passwords & clicks "Update Password"

OTP Dialog Active:
├─ editMode.password: true
├─ formData.newPassword: "userPassword123"
├─ formData.confirmPassword: "userPassword123"
└─ showOTPDialog: true ← OPENED

↓ User verifies OTP successfully

Password Changed:
├─ editMode.password: false ← CLOSED
├─ formData.newPassword: "" ← CLEARED
├─ formData.confirmPassword: "" ← CLEARED
└─ showOTPDialog: false ← CLOSED
```

## ⏱️ Timeline Example

```
00:00  User clicks "Change Password"
00:05  User enters new password
00:10  User enters confirmation password
00:12  User clicks "Update Password"
00:12  ✓ Validation passes
00:13  OTP Dialog opens
00:13  → OTP sent to email
00:15  User receives email with code: 123456
00:20  User enters: 1-2-3-4-5-6
00:21  Auto-submit (all 6 digits entered)
00:22  → Verifying OTP...
00:23  ✓ OTP verified successfully
00:23  → Changing password...
00:24  ✓ Password changed successfully
00:24  ✓ Success toast appears
00:24  ✓ Dialog closes
00:24  ✓ Fields cleared
```

## 🎯 Key Implementation Details

### OTP Dialog Props:
```tsx
<OTPVerificationDialog
  open={showOTPDialog}              // State: dialog visibility
  onOpenChange={setShowOTPDialog}   // State setter
  email={profile.email}             // User's email
  purpose="password_change"         // Tracking purpose
  title="Verify Password Change"   // Dialog title
  description="..."                 // Dialog description
  onVerificationSuccess={           // Success callback
    performPasswordChange
  }
  autoSendOnMount={true}           // Auto-send OTP
/>
```

### Validation Logic:
```tsx
// Check passwords match
if (formData.newPassword !== formData.confirmPassword) {
  toast({ ... });
  return;
}

// Check password length
if (formData.newPassword.length < 8) {
  toast({ ... });
  return;
}

// All validations passed → Open OTP dialog
setShowOTPDialog(true);
```

### Password Change Function:
```tsx
const performPasswordChange = async () => {
  const response = await changeUserPassword({
    oldPassword: "",
    newPassword: formData.newPassword,
  });

  if (response.success) {
    // Success: close, clear, notify
  } else {
    // Error: show message
  }
};
```

## 🎨 UI Component Hierarchy

```
ProfilePage
│
├─ Header
│  └─ "Change Password" button
│
├─ Content
│  ├─ Avatar section
│  ├─ Name field
│  ├─ Email field (read-only)
│  ├─ Role field (read-only)
│  │
│  └─ Password Change Section (conditional)
│     ├─ New Password input
│     ├─ Confirm Password input
│     ├─ Cancel button
│     └─ Update Password button
│        └─ (triggers OTP dialog)
│
└─ OTP Verification Dialog (conditional)
   ├─ Email display
   ├─ OTP input (6 digits)
   ├─ Timer countdown
   ├─ Resend button
   ├─ Verify button
   └─ Cancel button
```

---

**Implementation:** ✅ Complete
**Security:** ✅ Enhanced with OTP
**User Experience:** ✅ Smooth and intuitive
**Ready to Use:** ✅ Navigate to `/profile`
