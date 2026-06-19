import React, { useState } from "react";
import {
  Pencil,
  Save,
  X,
  User,
  Mail,
  Shield,
  Phone,
  Key,
  Upload,
  Loader2,
  CheckCircle2,
  ChevronDown,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { updateUserInfo, changeUserPassword } from "../../../api/user";
import { OTPVerificationDialog } from "../../../components/OTPVerificationDialog";

interface UserInformationPanelProps {
  profile: {
    name: string;
    email: string;
    avatar: string;
    role: string;
    mobile_number?: string;
    whatsapp_number?: string;
    id?: string;
  };
  onProfileUpdate: () => void;
}

export const UserInformationPanel: React.FC<UserInformationPanelProps> = ({
  profile,
  onProfileUpdate,
}) => {
  const [editMode, setEditMode] = useState({
    name: false,
    avatar: false,
    password: false,
  });

  const [formData, setFormData] = useState({
    name: profile.name,
    newPassword: "",
    confirmPassword: "",
    avatar: profile.avatar,
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // @ts-ignore
      setFormData((prev) => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const performPasswordChange = async (otp: string) => {
    try {
      setIsLoading(true);
      const response = await changeUserPassword({
        otp,
        newPassword: formData.newPassword,
      });
      if (response.success) {
        toast.success("Password updated successfully");
        setEditMode((prev) => ({ ...prev, password: false }));
        setFormData((prev) => ({
          ...prev,
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        toast.error(response.error || "Failed to update password");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (field: "name" | "avatar" | "password") => {
    try {
      setIsLoading(true);
      let response;

      if (field === "password") {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error("Passwords don't match");
          return;
        }
        if (formData.newPassword.length < 8) {
          toast.error("Password must be at least 8 characters");
          return;
        }
        setShowOTPDialog(true);
        return;
      } else {
        // @ts-ignore
        const isFile = field === "avatar" && formData.avatar instanceof File;
        if (isFile) {
          const fd = new FormData();
          fd.append("name", formData.name);
          fd.append("avatar", formData.avatar);
          response = await updateUserInfo(fd);
        } else {
          response = await updateUserInfo({
            name: formData.name,
            avatar: formData.avatar,
          });
        }
      }

      if (response.success) {
        toast.success(
          `${field.charAt(0).toUpperCase() + field.slice(1)} updated`,
        );
        setEditMode((prev) => ({ ...prev, [field]: false }));
        setAvatarPreview("");
        onProfileUpdate();
      } else {
        toast.error(response.error || `Failed to update ${field}`);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ── Ambient background – wrap this panel inside a positioned container in your layout ── */}
      <div className='w-full' style={styles.root}>
        {/* Decorative blobs */}
        <div style={{ ...styles.blob, ...styles.blob1 }} />
        <div style={{ ...styles.blob, ...styles.blob2 }} />

        <div style={styles.card}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerInner}>
              <div style={styles.headerIcon}>
                <User size={18} color='#6366f1' />
              </div>
              <div>
                <h2 style={styles.headerTitle}>Personal information</h2>
                <p style={styles.headerSub}>
                  Manage your account details and preferences
                </p>
              </div>
            </div>
          </div>

          <div style={styles.body}>
            {/* ── Avatar ── */}
            <div style={styles.avatarRow}>
              <div style={styles.avatarWrap}>
                {avatarPreview || profile.avatar ? (
                  <img
                    src={avatarPreview || profile.avatar}
                    alt={profile.name}
                    style={styles.avatarImg}
                  />
                ) : (
                  <span style={styles.avatarFallback}>
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                )}
                {editMode.avatar && (
                  <label style={styles.avatarOverlay}>
                    <Camera size={22} color='#fff' />
                    <input
                      type='file'
                      accept='image/*'
                      style={{ display: "none" }}
                      onChange={handleAvatarUpload}
                    />
                  </label>
                )}
              </div>

              <div style={styles.avatarInfo}>
                <p style={styles.avatarTitle}>Profile picture</p>
                <p style={styles.avatarSub}>JPG, PNG or GIF · Max 2 MB</p>
                {editMode.avatar ? (
                  <div style={styles.btnRow}>
                    <GlassButton
                      accent
                      onClick={() => handleSave("avatar")}
                      disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 size={14} className='animate-spin' />
                      ) : (
                        <Save size={14} />
                      )}
                      Save
                    </GlassButton>
                    <GlassButton
                      onClick={() => {
                        setEditMode((p) => ({ ...p, avatar: false }));
                        setAvatarPreview("");
                      }}>
                      <X size={14} />
                      Cancel
                    </GlassButton>
                  </div>
                ) : (
                  <GlassButton
                    onClick={() =>
                      setEditMode((p) => ({ ...p, avatar: true }))
                    }>
                    <Upload size={14} />
                    Change avatar
                  </GlassButton>
                )}
              </div>
            </div>

            {/* ── Name ── */}
            <FieldWrapper>
              <FieldLabel icon={<User size={14} color='#818cf8' />}>
                Full name
              </FieldLabel>
              <div
                style={{
                  ...styles.fieldValue,
                  ...(editMode.name ? styles.fieldValueEditing : {}),
                }}>
                {editMode.name ? (
                  <>
                    <input
                      name='name'
                      value={formData.name}
                      onChange={handleChange}
                      style={styles.inlineInput}
                      autoFocus
                    />
                    <div style={styles.btnRow}>
                      <IconBtn
                        accent
                        onClick={() => handleSave("name")}
                        disabled={isLoading}>
                        {isLoading ? <Loader2 size={14} /> : <Save size={14} />}
                      </IconBtn>
                      <IconBtn
                        onClick={() =>
                          setEditMode((p) => ({ ...p, name: false }))
                        }>
                        <X size={14} />
                      </IconBtn>
                    </div>
                  </>
                ) : (
                  <>
                    <span style={styles.fieldText}>{profile.name}</span>
                    <IconBtn
                      onClick={() =>
                        setEditMode((p) => ({ ...p, name: true }))
                      }>
                      <Pencil size={14} />
                    </IconBtn>
                  </>
                )}
              </div>
            </FieldWrapper>

            {/* ── Email ── */}
            <FieldWrapper>
              <FieldLabel icon={<Mail size={14} color='#818cf8' />}>
                Email address
              </FieldLabel>
              <div style={styles.fieldValue}>
                <span style={styles.fieldText}>{profile.email}</span>
                <span style={styles.badgeVerified}>
                  <CheckCircle2 size={11} />
                  Verified
                </span>
              </div>
            </FieldWrapper>

            {/* ── Role ── */}
            <FieldWrapper>
              <FieldLabel icon={<Shield size={14} color='#818cf8' />}>
                Role
              </FieldLabel>
              <div style={styles.fieldValue}>
                <span style={styles.badgeRole}>{profile.role}</span>
              </div>
            </FieldWrapper>

            {/* ── WhatsApp ── */}
            {profile.whatsapp_number && (
              <FieldWrapper>
                <FieldLabel icon={<Phone size={14} color='#818cf8' />}>
                  WhatsApp number
                </FieldLabel>
                <div style={styles.fieldValue}>
                  <span style={styles.fieldText}>
                    {profile.whatsapp_number}
                  </span>
                </div>
              </FieldWrapper>
            )}

            {/* ── Divider ── */}
            <div style={styles.divider} />

            {/* ── Password ── */}
            <div>
              <button
                style={styles.passwordToggle}
                onClick={() =>
                  setEditMode((p) => ({ ...p, password: !p.password }))
                }>
                <span
                  style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Key size={16} color='#818cf8' />
                  <span
                    style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>
                    Change password
                  </span>
                </span>
                <ChevronDown
                  size={16}
                  color='#9ca3af'
                  style={{
                    transform: editMode.password
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>

              {editMode.password && (
                <div style={styles.passwordForm}>
                  <div>
                    <label style={styles.pwLabel}>New password</label>
                    <input
                      type='password'
                      name='newPassword'
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder='At least 8 characters'
                      style={styles.pwInput}
                    />
                  </div>
                  <div>
                    <label style={styles.pwLabel}>Confirm password</label>
                    <input
                      type='password'
                      name='confirmPassword'
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder='Re-enter new password'
                      style={styles.pwInput}
                    />
                  </div>
                  <div style={{ ...styles.btnRow, paddingTop: 4 }}>
                    <GlassButton
                      accent
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={() => handleSave("password")}
                      disabled={isLoading}>
                      {isLoading ? <Loader2 size={14} /> : <Key size={14} />}
                      Update password
                    </GlassButton>
                    <GlassButton
                      onClick={() =>
                        setEditMode((p) => ({ ...p, password: false }))
                      }>
                      <X size={14} />
                    </GlassButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* OTP Dialog */}
      {profile.email && (
        <OTPVerificationDialog
          open={showOTPDialog}
          onOpenChange={setShowOTPDialog}
          mobile_number={profile.mobile_number || ""}
          email={profile.email}
          purpose='password_reset'
          title='Verify password change'
          description='For security, please verify your identity before changing your password'
          onVerificationSuccessWithOTP={performPasswordChange}
          onVerificationFailure={(error) => console.error("OTP failed:", error)}
          autoSendOnMount
        />
      )}
    </>
  );
};

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

const FieldWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {children}
  </div>
);

const FieldLabel: React.FC<{
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ icon, children }) => (
  <div style={styles.fieldLabel}>
    {icon}
    {children}
  </div>
);

const GlassButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { accent?: boolean }
> = ({ accent, children, style, ...props }) => (
  <button
    style={{
      ...styles.glassBtn,
      ...(accent ? styles.glassBtnAccent : {}),
      ...style,
    }}
    {...props}>
    {children}
  </button>
);

const IconBtn: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { accent?: boolean }
> = ({ accent, children, ...props }) => (
  <button
    style={{
      ...styles.iconBtn,
      ...(accent ? styles.iconBtnAccent : {}),
    }}
    {...props}>
    {children}
  </button>
);

/* ─────────────────────────────────────────
   Style objects
   All glass values use rgba so they work
   regardless of the page background.
───────────────────────────────────────── */

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "relative",
    width: "100%",
    padding: "2rem",
    background:
      "linear-gradient(135deg, #eef2ff 0%, #f0fdf4 50%, #faf5ff 100%)",
    borderRadius: 28,
    overflow: "hidden",
  },

  /* ambient blobs */
  blob: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(60px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  blob1: {
    width: 280,
    height: 280,
    background: "rgba(99,102,241,0.18)",
    top: -80,
    right: -60,
  },
  blob2: {
    width: 220,
    height: 220,
    background: "rgba(16,185,129,0.12)",
    bottom: -60,
    left: -40,
  },

  /* main card */
  card: {
    position: "relative",
    zIndex: 1,
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(255,255,255,0.8)",
    borderRadius: 24,
    backdropFilter: "blur(20px) saturate(1.7)",
    WebkitBackdropFilter: "blur(20px) saturate(1.7)",
    boxShadow:
      "0 8px 32px rgba(99,102,241,0.10), 0 2px 8px rgba(99,102,241,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
    overflow: "hidden",
  },

  header: {
    padding: "1.25rem 1.5rem 1rem",
    borderBottom: "1px solid rgba(255,255,255,0.65)",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.38))",
  },
  headerInner: { display: "flex", alignItems: "center", gap: 12 },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "rgba(99,102,241,0.10)",
    border: "1px solid rgba(99,102,241,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#1e1b4b",
    margin: 0,
    lineHeight: 1.3,
  },
  headerSub: {
    fontSize: 12,
    color: "#6b7280",
    margin: 0,
    marginTop: 1,
  },

  body: {
    padding: "1.25rem 1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  /* avatar */
  avatarRow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem 1.1rem",
    background: "rgba(255,255,255,0.60)",
    border: "1px solid rgba(255,255,255,0.85)",
    borderRadius: 18,
    boxShadow: "0 2px 10px rgba(99,102,241,0.07)",
  },
  avatarWrap: {
    position: "relative",
    width: 72,
    height: 72,
    borderRadius: "50%",
    flexShrink: 0,
  },
  avatarImg: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid rgba(255,255,255,0.95)",
    boxShadow: "0 4px 16px rgba(99,102,241,0.25)",
    display: "block",
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #818cf8, #6366f1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
    fontWeight: 600,
    color: "#fff",
    border: "3px solid rgba(255,255,255,0.95)",
    boxShadow: "0 4px 16px rgba(99,102,241,0.28)",
  } as React.CSSProperties,
  avatarOverlay: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    background: "rgba(99,102,241,0.72)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  avatarInfo: { flex: 1, minWidth: 0 },
  avatarTitle: { fontSize: 13, fontWeight: 600, color: "#1e1b4b", margin: 0 },
  avatarSub: { fontSize: 11, color: "#9ca3af", margin: "2px 0 10px" },

  /* field */
  fieldLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11,
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  } as React.CSSProperties,
  fieldValue: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: "11px 14px",
    background: "rgba(255,255,255,0.60)",
    border: "1px solid rgba(255,255,255,0.88)",
    borderRadius: 12,
    boxShadow: "0 1px 4px rgba(99,102,241,0.05)",
    minHeight: 44,
  },
  fieldValueEditing: {
    background: "rgba(255,255,255,0.92)",
    borderColor: "rgba(99,102,241,0.35)",
    boxShadow:
      "0 0 0 3px rgba(99,102,241,0.10), 0 1px 4px rgba(99,102,241,0.08)",
  },
  fieldText: { fontSize: 14, fontWeight: 500, color: "#1e1b4b" },
  inlineInput: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 14,
    fontWeight: 500,
    color: "#1e1b4b",
    fontFamily: "inherit",
    minWidth: 0,
  },

  /* badges */
  badgeVerified: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 10px",
    borderRadius: 99,
    fontSize: 11,
    fontWeight: 600,
    background: "rgba(16,185,129,0.10)",
    color: "#059669",
    border: "1px solid rgba(16,185,129,0.22)",
    flexShrink: 0,
  } as React.CSSProperties,
  badgeRole: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 12px",
    borderRadius: 99,
    fontSize: 12,
    fontWeight: 600,
    background: "rgba(99,102,241,0.10)",
    color: "#4338ca",
    border: "1px solid rgba(99,102,241,0.22)",
  } as React.CSSProperties,

  /* divider */
  divider: {
    borderTop: "1px solid rgba(255,255,255,0.7)",
    margin: "0.25rem 0",
  },

  /* password */
  passwordToggle: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "11px 14px",
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(255,255,255,0.82)",
    borderRadius: 12,
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(99,102,241,0.05)",
  },
  passwordForm: {
    marginTop: 10,
    padding: "1rem 1.1rem",
    background: "rgba(255,255,255,0.60)",
    border: "1px solid rgba(255,255,255,0.85)",
    borderRadius: 14,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxShadow: "0 2px 10px rgba(251,191,36,0.07)",
  } as React.CSSProperties,
  pwLabel: {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "#6b7280",
    marginBottom: 5,
  },
  pwInput: {
    width: "100%",
    padding: "10px 12px",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(255,255,255,0.9)",
    borderRadius: 10,
    fontSize: 14,
    color: "#1e1b4b",
    fontFamily: "inherit",
    outline: "none",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },

  /* buttons */
  btnRow: { display: "flex", alignItems: "center", gap: 8 },
  glassBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 10,
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.82)",
    background: "rgba(255,255,255,0.72)",
    color: "#6366f1",
    boxShadow: "0 2px 8px rgba(99,102,241,0.08)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  } as React.CSSProperties,
  glassBtnAccent: {
    background: "linear-gradient(135deg, #818cf8, #6366f1)",
    color: "#fff",
    borderColor: "transparent",
    boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.8)",
    background: "rgba(99,102,241,0.07)",
    color: "#6366f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    transition: "all 0.15s",
  } as React.CSSProperties,
  iconBtnAccent: {
    background: "linear-gradient(135deg, #818cf8, #6366f1)",
    color: "#fff",
    borderColor: "transparent",
    boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
  },
};
