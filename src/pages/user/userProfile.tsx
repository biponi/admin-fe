import React, { useState, useEffect } from "react";
import { useToast } from "../../components/ui/use-toast";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import { Pencil, Save, X, Key, User, Mail, Shield } from "lucide-react";
import {
  getUserProfile,
  updateUserInfo,
  changeUserPassword,
} from "../../api/user";
import useLoginAuth from "../auth/hooks/useLoginAuth";
import { successToast } from "../../utils/toast";
import { OTPVerificationDialog } from "../../components/OTPVerificationDialog";

const ProfilePage = () => {
  const { toast } = useToast();
  const { fetchUserById } = useLoginAuth();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "",
    role: "",
    bio: "",
    whatsapp_number: "",
  });
  const [editMode, setEditMode] = useState({
    name: false,
    avatar: false,
    password: false,
  });
  const [formData, setFormData] = useState({
    name: "",
    newPassword: "",
    confirmPassword: "",
    avatar: "",
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [showOTPDialog, setShowOTPDialog] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const response = await getUserProfile();
      if (response.success) {
        setProfile(response.data);
        setFormData((prev) => ({
          ...prev,
          name: response.data.name,
          avatar: response.data.avatar,
        }));
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to fetch profile",
          variant: "destructive",
        });
      }
    };
    fetchProfile();
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    //eslint-disable-next-line
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle avatar upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Store the File object for upload
      //@ts-ignore
      setFormData((prev) => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to actually change password after OTP verification
  const performPasswordChange = async () => {
    try {
      const response = await changeUserPassword({
        oldPassword: "", // You might need to add this field
        newPassword: formData.newPassword,
      });

      if (response.success) {
        successToast("Password updated successfully");
        setEditMode((prev) => ({ ...prev, password: false }));
        // Clear password fields
        setFormData((prev) => ({
          ...prev,
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (field: "name" | "avatar" | "password") => {
    try {
      let response;

      if (field === "password") {
        // Validate passwords match
        if (formData.newPassword !== formData.confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords don't match",
            variant: "destructive",
          });
          return;
        }

        // Validate password length
        if (formData.newPassword.length < 8) {
          toast({
            title: "Error",
            description: "Password must be at least 8 characters long",
            variant: "destructive",
          });
          return;
        }

        // Trigger OTP verification instead of directly changing password
        setShowOTPDialog(true);
        return;
      } else {
        // Create FormData only for avatar updates with a file
        const isAvatarFileUpload =
          //@ts-ignore
          field === "avatar" && formData.avatar instanceof File;
        console.log(typeof formData.avatar);
        if (isAvatarFileUpload) {
          const formDataObj = new FormData();
          formDataObj.append("name", formData.name);
          formDataObj.append("avatar", formData.avatar);

          // Append other fields if needed
          if (profile.bio) formDataObj.append("bio", profile.bio);
          if (profile.whatsapp_number)
            formDataObj.append("whatsapp_number", profile.whatsapp_number);

          response = await updateUserInfo(formDataObj);
        } else {
          // Regular JSON update for name or avatar URL
          response = await updateUserInfo({
            name: formData.name,
            avatar: formData.avatar, // This could be string URL or undefined
          });
        }
      }

      if (response.success) {
        successToast(`Profile ${field} updated successfully`);
        setEditMode((prev) => ({ ...prev, [field]: false }));

        // Refresh profile data
        const profileResponse = await getUserProfile();
        if (profileResponse.success) {
          setProfile(profileResponse.data);
          // Reset form data with updated values
          setFormData((prev) => ({
            ...prev,
            name: profileResponse.data.name,
            avatar: profileResponse.data.avatar,
          }));

          fetchUserById(profileResponse.data.id);
        }
      } else {
        toast({
          title: "Error",
          description: response.error || `Failed to update ${field}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className='max-w-4xl mx-auto py-4 sm:py-8 px-4 sm:px-6 w-[91vw]'>
      <Card className='overflow-hidden'>
        <CardHeader className='bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 sm:p-6'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
            <CardTitle className='text-xl sm:text-2xl flex items-center'>
              <User className='w-5 h-5 mr-2' />
              My Profile
            </CardTitle>
            <Button
              variant='ghost'
              size={isMobile ? "sm" : "default"}
              className='text-white hover:bg-white/10 flex items-center'
              onClick={() =>
                setEditMode((prev) => ({
                  ...prev,
                  password: !prev.password,
                  name: false,
                  avatar: false,
                }))
              }>
              <Key className='w-4 h-4 mr-2' />
              {isMobile ? "Password" : "Change Password"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className='p-4 sm:p-6'>
          <div className='flex flex-col md:flex-row gap-6 md:gap-8'>
            {/* Left Column - Avatar */}
            <div className='flex flex-col items-center w-full md:w-auto'>
              <div className='relative group mb-4'>
                <Avatar className=' w-32  h-32 sm:w-32 sm:h-32 border-4 border-white shadow-lg'>
                  <AvatarImage src={avatarPreview || profile?.avatar} />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {editMode.avatar ? (
                  <div className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-full'>
                    <label className='cursor-pointer p-2 bg-white rounded-full'>
                      <Pencil className='w-4 h-4 sm:w-5 sm:h-5' />
                      <input
                        type='file'
                        accept='image/*'
                        className='hidden'
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>
                ) : (
                  <button
                    className='absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 sm:p-2 rounded-full shadow-md hover:bg-blue-600 transition-all'
                    onClick={() =>
                      setEditMode((prev) => ({ ...prev, avatar: true }))
                    }>
                    <Pencil className='w-3 h-3 sm:w-4 sm:h-4' />
                  </button>
                )}
              </div>

              {editMode.avatar && (
                <div className='flex flex-col sm:flex-row gap-2 w-full'>
                  <Button
                    size='sm'
                    className='w-full sm:w-auto'
                    onClick={() => handleSave("avatar")}>
                    <Save className='w-4 h-4 mr-2' /> Save
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full sm:w-auto'
                    onClick={() =>
                      setEditMode((prev) => ({ ...prev, avatar: false }))
                    }>
                    <X className='w-4 h-4 mr-2' /> Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Right Column - Profile Info */}
            <div className='flex-1 space-y-4'>
              {/* Name Field */}
              <div className='space-y-1'>
                <div className='flex items-center text-sm font-medium text-gray-500'>
                  <User className='w-4 h-4 mr-2' />
                  Full Name
                </div>
                {editMode.name ? (
                  <div className='flex flex-col sm:flex-row gap-2'>
                    <Input
                      name='name'
                      value={formData.name}
                      onChange={handleChange}
                      className='flex-1'
                    />
                    <div className='flex gap-2'>
                      <Button size='sm' onClick={() => handleSave("name")}>
                        <Save className='w-4 h-4' />
                        {!isMobile && " Save"}
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          setEditMode((prev) => ({ ...prev, name: false }))
                        }>
                        <X className='w-4 h-4' />
                        {!isMobile && " Cancel"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='flex justify-between items-center p-2 bg-gray-50 rounded'>
                    <span>{profile.name}</span>
                    <button
                      className='text-blue-500 hover:text-blue-700 p-1'
                      onClick={() =>
                        setEditMode((prev) => ({ ...prev, name: true }))
                      }>
                      <Pencil className='w-4 h-4' />
                    </button>
                  </div>
                )}
              </div>

              {/* Email Field (non-editable) */}
              <div className='space-y-1'>
                <div className='flex items-center text-sm font-medium text-gray-500'>
                  <Mail className='w-4 h-4 mr-2' />
                  Email
                </div>
                <div className='p-2 bg-gray-50 rounded'>{profile.email}</div>
              </div>

              {/* Role Field (non-editable) */}
              <div className='space-y-1'>
                <div className='flex items-center text-sm font-medium text-gray-500'>
                  <Shield className='w-4 h-4 mr-2' />
                  Role
                </div>
                <div className='p-2 bg-gray-50 rounded'>{profile.role}</div>
              </div>

              {/* Password Change Section */}
              {editMode.password && (
                <div className='space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mt-6'>
                  <h3 className='font-medium flex items-center'>
                    <Key className='w-4 h-4 mr-2' />
                    Change Password
                  </h3>
                  <div className='space-y-3'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        New Password
                      </label>
                      <Input
                        type='password'
                        name='newPassword'
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder='Enter new password'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Confirm Password
                      </label>
                      <Input
                        type='password'
                        name='confirmPassword'
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder='Confirm new password'
                      />
                    </div>
                    <div className='flex flex-col sm:flex-row justify-end gap-2 pt-2'>
                      <Button
                        variant='outline'
                        className='w-full sm:w-auto'
                        onClick={() =>
                          setEditMode((prev) => ({ ...prev, password: false }))
                        }>
                        Cancel
                      </Button>
                      <Button
                        className='w-full sm:w-auto'
                        onClick={() => handleSave("password")}>
                        Update Password
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className='bg-gray-50 px-4 sm:px-6 py-3'>
          <div className='text-xs sm:text-sm text-gray-500'>
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </CardFooter>
      </Card>

      {/* OTP Verification Dialog for Password Change */}
      {profile.email && (
        <OTPVerificationDialog
          open={showOTPDialog}
          onOpenChange={setShowOTPDialog}
          email={profile.email}
          purpose='password_reset'
          title='Verify Password Change'
          description='For security, please verify your email before changing your password'
          onVerificationSuccess={performPasswordChange}
          onVerificationFailure={(error) => {
            console.error("OTP verification failed:", error);
          }}
          autoSendOnMount={true}
        />
      )}
    </div>
  );
};

export default ProfilePage;
