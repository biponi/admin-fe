import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
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
      //@ts-ignore
      setFormData((prev) => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const performPasswordChange = async () => {
    try {
      setIsLoading(true);
      const response = await changeUserPassword({
        oldPassword: "",
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
    } catch (error) {
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
          toast.error("Password must be at least 8 characters long");
          return;
        }

        setShowOTPDialog(true);
        return;
      } else {
        const isAvatarFileUpload =
          //@ts-ignore
          field === "avatar" && formData.avatar instanceof File;

        if (isAvatarFileUpload) {
          const formDataObj = new FormData();
          formDataObj.append("name", formData.name);
          formDataObj.append("avatar", formData.avatar);
          response = await updateUserInfo(formDataObj);
        } else {
          response = await updateUserInfo({
            name: formData.name,
            avatar: formData.avatar,
          });
        }
      }

      if (response.success) {
        toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
        setEditMode((prev) => ({ ...prev, [field]: false }));
        setAvatarPreview("");
        onProfileUpdate();
      } else {
        toast.error(response.error || `Failed to update ${field}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Manage your account details and preferences
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="relative group">
              <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                <AvatarImage src={avatarPreview || profile.avatar} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-400 to-purple-600 text-white">
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {editMode.avatar && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="w-6 h-6 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Profile Picture</h4>
              <p className="text-sm text-gray-500 mb-2">
                JPG, PNG or GIF. Max size 2MB
              </p>
              {editMode.avatar ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSave("avatar")}
                    disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditMode((prev) => ({ ...prev, avatar: false }));
                      setAvatarPreview("");
                    }}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditMode((prev) => ({ ...prev, avatar: true }))}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Change Avatar
                </Button>
              )}
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <User className="w-4 h-4 mr-2 text-gray-500" />
              Full Name
            </label>
            {editMode.name ? (
              <div className="flex gap-2">
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="flex-1"
                  placeholder="Enter your name"
                />
                <Button
                  size="sm"
                  onClick={() => handleSave("name")}
                  disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditMode((prev) => ({ ...prev, name: false }))
                  }>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <span className="font-medium text-gray-900">{profile.name}</span>
                <button
                  className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-all"
                  onClick={() =>
                    setEditMode((prev) => ({ ...prev, name: true }))
                  }>
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Mail className="w-4 h-4 mr-2 text-gray-500" />
              Email Address
            </label>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-gray-900">{profile.email}</span>
              <Badge variant="secondary" className="text-xs">
                Verified
              </Badge>
            </div>
          </div>

          {/* Role Field */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Shield className="w-4 h-4 mr-2 text-gray-500" />
              Role
            </label>
            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <Badge variant="default" className="text-sm">
                {profile.role}
              </Badge>
            </div>
          </div>

          {/* WhatsApp Number */}
          {profile.whatsapp_number && (
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                WhatsApp Number
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-900">{profile.whatsapp_number}</span>
              </div>
            </div>
          )}

          {/* Password Section */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() =>
                setEditMode((prev) => ({
                  ...prev,
                  password: !prev.password,
                }))
              }>
              <Key className="w-4 h-4 mr-2" />
              Change Password
            </Button>

            {editMode.password && (
              <div className="mt-4 p-4 space-y-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <Input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password (min 8 characters)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter new password"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleSave("password")}
                    disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Key className="w-4 h-4 mr-2" />
                    )}
                    Update Password
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setEditMode((prev) => ({ ...prev, password: false }))
                    }>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* OTP Verification Dialog */}
      {profile.email && (
        <OTPVerificationDialog
          open={showOTPDialog}
          onOpenChange={setShowOTPDialog}
          email={profile.email}
          purpose="password_reset"
          title="Verify Password Change"
          description="For security, please verify your email before changing your password"
          onVerificationSuccess={performPasswordChange}
          onVerificationFailure={(error) => {
            console.error("OTP verification failed:", error);
          }}
          autoSendOnMount={true}
        />
      )}
    </>
  );
};
