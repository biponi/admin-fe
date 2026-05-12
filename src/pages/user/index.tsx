import React, { useEffect, useState } from "react";

import { Card } from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Edit,
  Plus,
  Trash,
  Search,
  User,
  Mail,
  Phone,
  Lock,
  Users,
  Loader2,
  Shield,
  UserCheck,
  Crown,
  Sparkles,
} from "lucide-react";
import { IUser } from "./interface";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../../components/ui/drawer";
import {
  adminChangeUserData,
  deleteUser,
  getAllUsers,
  signupUser,
} from "../../api/user";
import toast from "react-hot-toast";
import { useRoles } from "../role/hooks/useRoleHook";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { cn } from "../../lib/utils";

export function UserComponent() {
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();
  const { roles, fetchRoles } = useRoles();
  const [users, setUsers] = useState<IUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [editData, setEditData] = useState<Partial<IUser>>({});
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    mobile_number: "",
    password: "",
    role: -1, // Default role
  });

  // Optimistic loading states
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Detect mobile screen size
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  // Handle role change
  const handleNewUserRoleChange = (value: string) => {
    //@ts-ignore
    setNewUser((prev) => ({ ...prev, role: value ?? -1 }));
  };

  // Handle form submission
  const handleCreateUser = async () => {
    // Validate required fields
    if (
      !newUser.name ||
      !newUser.email ||
      !newUser.mobile_number ||
      !newUser.password
    ) {
      toast.error("All fields are required.");
      return;
    }

    setIsCreating(true);
    try {
      // Call the signup API
      const response = await signupUser({
        name: newUser.name,
        email: newUser.email,
        mobileNumber: newUser.mobile_number,
        password: newUser.password,
        type: newUser.role, // Role is passed as `type` in the API
      });

      if (response.success) {
        toast.success("User created successfully.");
        // Silent refresh without full page loader
        await fetchUsers(false);
        setIsCreateModalOpen(false);
        setNewUser({
          name: "",
          email: "",
          mobile_number: "",
          password: "",
          role: -1,
        });
      } else {
        toast.error(response.error || "Failed to create user.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Search and filter users with tabs
  useEffect(() => {
    let filtered = users;

    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter((user) => {
        if (activeTab === "admins")
          return user.role.toLowerCase().includes("admin");
        if (activeTab === "managers")
          return user.role.toLowerCase().includes("manager");
        if (activeTab === "regular")
          return (
            !user.role.toLowerCase().includes("admin") &&
            !user.role.toLowerCase().includes("manager")
          );
        return true;
      });
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.mobile_number.includes(query) ||
          user.role.toLowerCase().includes(query),
      );
    }

    setFilteredUsers(filtered);
  }, [searchQuery, users, activeTab]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await getAllUsers();
      if (!response?.success) {
        console.error("Failed to fetch users:", response?.error);
        toast.error(response?.error || "Failed to fetch users");
        return;
      }
      setUsers(response?.data);
      setFilteredUsers(response?.data);
    } catch (error) {
      console.error("Error fetching the user data:", error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Optimistic update wrapper functions
  const handleOptimisticUpdate = async (
    userId: string,
    updateFn: () => Promise<void>,
  ) => {
    setLoadingUserId(userId);
    try {
      await updateFn();
      // Silent refresh without showing full page loader
      await fetchUsers(false);
      toast.success("User updated successfully");
    } catch (error) {
      toast.error("Failed to update user");
      // Refresh to ensure data consistency
      await fetchUsers(false);
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    await handleOptimisticUpdate(userId, async () => {
      const response = await adminChangeUserData(userId, { role: newRole });
      if (!response?.success) {
        throw new Error(response?.error || "Failed to update role");
      }
    });
  };

  const handleEdit = (user: IUser) => {
    setSelectedUser(user);
    setEditData({ email: user.email, mobile_number: user.mobile_number });
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedUser || !editData.email || !editData.mobile_number) {
      console.error("Missing required fields");
      return;
    }

    const updateAbleData = !!editData?.password
      ? {
          email: editData?.email,
          mobile_number: editData?.mobile_number,
          newPassword: editData?.password,
        }
      : {
          email: editData?.email,
          mobile_number: editData?.mobile_number,
        };

    await handleOptimisticUpdate(`${selectedUser?.id}`, async () => {
      const response = await adminChangeUserData(
        `${selectedUser?.id}`,
        updateAbleData,
      );
      if (!response?.success) {
        throw new Error(response?.error || "Failed to update user");
      }
    });

    setIsEditModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;

    const userIdToDelete = deleteUserId;

    await handleOptimisticUpdate(userIdToDelete, async () => {
      const response = await deleteUser(userIdToDelete);
      if (!response?.success) {
        throw new Error(response?.error || "Failed to delete user");
      }
    });

    setIsDeleteModalOpen(false);
  };

  const renderCreateUserForm = () => (
    <div className='space-y-5 py-2'>
      <div className='space-y-2.5'>
        <Label
          htmlFor='name'
          className='text-sm font-bold flex items-center gap-2 text-gray-700'>
          <div className='h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center'>
            <User className='h-4 w-4 text-blue-600' />
          </div>
          Full Name
        </Label>
        <Input
          id='name'
          placeholder='Enter full name'
          name='name'
          value={newUser.name}
          onChange={handleInputChange}
          className='h-11 border-2 focus:border-blue-400 font-medium'
        />
      </div>

      <div className='space-y-2.5'>
        <Label
          htmlFor='email'
          className='text-sm font-bold flex items-center gap-2 text-gray-700'>
          <div className='h-7 w-7 rounded-lg bg-purple-100 flex items-center justify-center'>
            <Mail className='h-4 w-4 text-purple-600' />
          </div>
          Email Address
        </Label>
        <Input
          id='email'
          type='email'
          placeholder='user@example.com'
          name='email'
          value={newUser.email}
          onChange={handleInputChange}
          className='h-11 border-2 focus:border-purple-400 font-medium'
        />
      </div>

      <div className='space-y-2.5'>
        <Label
          htmlFor='mobile'
          className='text-sm font-bold flex items-center gap-2 text-gray-700'>
          <div className='h-7 w-7 rounded-lg bg-green-100 flex items-center justify-center'>
            <Phone className='h-4 w-4 text-green-600' />
          </div>
          Mobile Number
        </Label>
        <Input
          id='mobile'
          placeholder='Enter mobile number'
          name='mobile_number'
          value={newUser.mobile_number}
          onChange={handleInputChange}
          className='h-11 border-2 focus:border-green-400 font-medium'
        />
      </div>

      <div className='space-y-2.5'>
        <Label
          htmlFor='password'
          className='text-sm font-bold flex items-center gap-2 text-gray-700'>
          <div className='h-7 w-7 rounded-lg bg-orange-100 flex items-center justify-center'>
            <Lock className='h-4 w-4 text-orange-600' />
          </div>
          Password
        </Label>
        <Input
          id='password'
          placeholder='Enter password'
          name='password'
          type='password'
          value={newUser.password}
          onChange={handleInputChange}
          className='h-11 border-2 focus:border-orange-400 font-medium'
        />
      </div>

      <div className='space-y-2.5'>
        <Label className='text-sm font-bold flex items-center gap-2 text-gray-700'>
          <div className='h-7 w-7 rounded-lg bg-indigo-100 flex items-center justify-center'>
            <Users className='h-4 w-4 text-indigo-600' />
          </div>
          User Role
        </Label>
        <Select
          value={`${newUser.role}`}
          onValueChange={handleNewUserRoleChange}>
          <SelectTrigger className='h-11 border-2 focus:border-indigo-400 font-medium'>
            <SelectValue placeholder='Select a role' />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem
                key={role?.id}
                value={`${role?.roleNumber}`}
                className='font-medium'>
                {role?.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderCreateUserModal = () => {
    if (isMobile) {
      return (
        <Drawer open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DrawerContent className='max-h-[90vh]'>
            <DrawerHeader className='text-left pb-4'>
              <div className='flex items-center gap-3 mb-2'>
                <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg'>
                  <Users className='h-6 w-6 text-white' />
                </div>
                <div className='flex-1'>
                  <DrawerTitle className='text-2xl font-bold text-gray-900'>
                    Create New User
                  </DrawerTitle>
                  <DrawerDescription className='text-sm mt-1'>
                    Fill in the details to create a new user account
                  </DrawerDescription>
                </div>
              </div>
            </DrawerHeader>
            <div className='overflow-y-auto px-4'>{renderCreateUserForm()}</div>
            <DrawerFooter className='pt-4 gap-2'>
              <Button
                onClick={handleCreateUser}
                disabled={isCreating}
                className='h-12 w-full shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 text-base font-semibold'>
                {isCreating ? (
                  <>
                    <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className='mr-2 h-5 w-5' />
                    Create User
                  </>
                )}
              </Button>
              <DrawerClose asChild>
                <Button
                  variant='outline'
                  disabled={isCreating}
                  className='h-12 w-full border-2 text-base font-semibold'>
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );
    }

    return (
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className='sm:max-w-[520px] p-0'>
          <div className='p-6 pb-2'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg'>
                <Users className='h-6 w-6 text-white' />
              </div>
              <div className='flex-1'>
                <DialogTitle className='text-2xl font-bold text-gray-900'>
                  Create New User
                </DialogTitle>
                <DialogDescription className='text-sm mt-1'>
                  Fill in the details to create a new user account
                </DialogDescription>
              </div>
            </div>
          </div>
          <div className='px-6'>{renderCreateUserForm()}</div>
          <DialogFooter className='p-6 pt-2 gap-2 sm:gap-0'>
            <Button
              variant='outline'
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreating}
              className='h-11 border-2 font-semibold'>
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={isCreating}
              className='h-11 shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 font-semibold'>
              {isCreating ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className='mr-2 h-4 w-4' />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Helper function to get role configuration
  const getRoleConfig = (roleName: string) => {
    if (roleName.toLowerCase().includes("admin")) {
      return {
        gradient: "from-red-500 to-pink-600",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        borderColor: "border-red-200",
        icon: Crown,
      };
    }
    if (roleName.toLowerCase().includes("manager")) {
      return {
        gradient: "from-purple-500 to-indigo-600",
        bgColor: "bg-purple-50",
        textColor: "text-purple-700",
        borderColor: "border-purple-200",
        icon: Shield,
      };
    }
    return {
      gradient: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
      icon: UserCheck,
    };
  };

  // Helper function to get user initials
  const getUserInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Calculate user statistics
  const getUserStats = () => {
    const adminCount = users.filter((u) =>
      u.role.toLowerCase().includes("admin"),
    ).length;
    const managerCount = users.filter((u) =>
      u.role.toLowerCase().includes("manager"),
    ).length;
    const regularCount = users.length - adminCount - managerCount;

    return { adminCount, managerCount, regularCount, total: users.length };
  };

  const stats = getUserStats();

  return (
    <div className='space-y-6'>
      {/* Header Section with Gradient */}
      <div className='rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-100 p-6 md:p-8 shadow-sm'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
          <div className='flex-1'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm'>
                <Users className='h-6 w-6 text-white' />
              </div>
              <div>
                <h2 className='text-3xl font-bold tracking-tight text-gray-900'>
                  User Management
                </h2>
                <p className='text-muted-foreground mt-1'>
                  Manage and organize your team members efficiently
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards - Desktop */}
          <div className='hidden md:grid grid-cols-3 gap-3'>
            <div className='flex items-center gap-2 px-4 py-3 bg-white rounded-xl border-2 border-purple-200 shadow-sm'>
              <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center'>
                <Crown className='h-5 w-5 text-white' />
              </div>
              <div>
                <p className='text-[10px] font-medium text-purple-600 uppercase tracking-wide'>
                  Admins
                </p>
                <p className='text-xl font-bold text-gray-900'>
                  {stats.adminCount}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2 px-4 py-3 bg-white rounded-xl border-2 border-indigo-200 shadow-sm'>
              <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center'>
                <Shield className='h-5 w-5 text-white' />
              </div>
              <div>
                <p className='text-[10px] font-medium text-indigo-600 uppercase tracking-wide'>
                  Managers
                </p>
                <p className='text-xl font-bold text-gray-900'>
                  {stats.managerCount}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2 px-4 py-3 bg-white rounded-xl border-2 border-blue-200 shadow-sm'>
              <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center'>
                <UserCheck className='h-5 w-5 text-white' />
              </div>
              <div>
                <p className='text-[10px] font-medium text-blue-600 uppercase tracking-wide'>
                  Regular
                </p>
                <p className='text-xl font-bold text-gray-900'>
                  {stats.regularCount}
                </p>
              </div>
            </div>
          </div>

          {hasRequiredPermission("user", "create") && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size='lg'
              className='shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 h-12 px-6'>
              <Sparkles className='mr-2 h-5 w-5' /> Create User
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className='relative mt-6 max-w-2xl'>
          <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground' />
          <Input
            placeholder='Search by name, email, mobile, or role...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-12 h-12 bg-white border-2 border-gray-200 focus:border-blue-400 rounded-xl text-base shadow-sm'
          />
        </div>

        {/* Mobile Stats */}
        <div className='grid grid-cols-3 gap-2 mt-4 md:hidden'>
          <div className='flex flex-col items-center p-3 bg-white rounded-xl border-2 border-purple-200'>
            <Crown className='h-5 w-5 text-purple-600 mb-1' />
            <p className='text-[10px] font-medium text-purple-600'>Admins</p>
            <p className='text-lg font-bold text-gray-900'>
              {stats.adminCount}
            </p>
          </div>
          <div className='flex flex-col items-center p-3 bg-white rounded-xl border-2 border-indigo-200'>
            <Shield className='h-5 w-5 text-indigo-600 mb-1' />
            <p className='text-[10px] font-medium text-indigo-600'>Managers</p>
            <p className='text-lg font-bold text-gray-900'>
              {stats.managerCount}
            </p>
          </div>
          <div className='flex flex-col items-center p-3 bg-white rounded-xl border-2 border-blue-200'>
            <UserCheck className='h-5 w-5 text-blue-600 mb-1' />
            <p className='text-[10px] font-medium text-blue-600'>Regular</p>
            <p className='text-lg font-bold text-gray-900'>
              {stats.regularCount}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        {/* Tab Navigation */}
        <TabsList className='h-12 w-full grid grid-cols-2 md:grid-cols-4 bg-white border-2 border-gray-200 rounded-xl p-1.5 shadow-sm gap-1.5'>
          <TabsTrigger
            value='all'
            className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg font-semibold text-sm'>
            <Users className='w-4 h-4 mr-2' />
            All Users ({users.length})
          </TabsTrigger>
          <TabsTrigger
            value='admins'
            className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg font-semibold text-sm'>
            <Crown className='w-4 h-4 mr-2' />
            Admins ({stats.adminCount})
          </TabsTrigger>
          <TabsTrigger
            value='managers'
            className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg font-semibold text-sm'>
            <Shield className='w-4 h-4 mr-2' />
            Managers ({stats.managerCount})
          </TabsTrigger>
          <TabsTrigger
            value='regular'
            className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white rounded-lg font-semibold text-sm'>
            <UserCheck className='w-4 h-4 mr-2' />
            Regular ({stats.regularCount})
          </TabsTrigger>
        </TabsList>

        {/* All Tabs Content - Shared */}
        <TabsContent value={activeTab} className='mt-6 space-y-4'>
          <Card className='shadow-sm border-2 border-gray-100 bg-transparent'>
            {isLoading ? (
              <div className='flex flex-col items-center justify-center py-20 px-4'>
                <div className='relative'>
                  <div className='absolute inset-0 bg-blue-500/20 rounded-full animate-ping' />
                  <div className='relative h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg'>
                    <Loader2 className='h-8 w-8 text-white animate-spin' />
                  </div>
                </div>
                <p className='mt-6 text-lg font-semibold text-gray-900'>
                  Loading users...
                </p>
                <p className='text-sm text-muted-foreground mt-1'>
                  Please wait while we fetch the data
                </p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className='py-20 px-4 text-center bg-white rounded-2xl'>
                <div className='mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6'>
                  <Users className='h-10 w-10 text-gray-400' />
                </div>
                <p className='text-xl font-bold text-gray-900 mb-2'>
                  No users found
                </p>
                <p className='text-sm text-muted-foreground mb-6 max-w-sm mx-auto'>
                  {searchQuery
                    ? "Try adjusting your search criteria to find what you're looking for"
                    : "Get started by creating your first user account"}
                </p>
                {!searchQuery && hasRequiredPermission("user", "create") && (
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    size='lg'
                    className='shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0'>
                    <Plus className='mr-2 h-5 w-5' /> Create First User
                  </Button>
                )}
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6'>
                {filteredUsers.map((user: IUser) => {
                  const roleConfig = getRoleConfig(user.role);
                  const RoleIcon = roleConfig.icon;
                  const isCardLoading = loadingUserId === user.id;

                  return (
                    <Card
                      key={user.id}
                      className={cn(
                        "group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2",
                        isCardLoading
                          ? "opacity-50 pointer-events-none"
                          : "hover:border-blue-200",
                      )}>
                      {/* Loading Overlay */}
                      {isCardLoading && (
                        <div className='absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center'>
                          <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
                        </div>
                      )}

                      {/* Gradient Top Bar */}
                      <div className='h-2 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500' />

                      <div className='p-6'>
                        {/* User Avatar & Header */}
                        <div className='flex flex-col items-center text-center mb-6'>
                          <div className='relative mb-4'>
                            <div className='h-24 w-24 rounded-full bg-gradient-to-br shadow-lg flex items-center justify-center text-white font-bold text-2xl border-4 border-white'>
                              {user.avatar ? (
                                <Avatar className='h-24 w-24 rounded-full border-4 border-white shadow-lg'>
                                  <AvatarImage
                                    src={user.avatar}
                                    alt={user.name}
                                  />
                                  <AvatarFallback
                                    className={cn(
                                      "rounded-xl text-white font-bold text-2xl border-2",
                                      roleConfig.gradient,
                                    )}>
                                    {getUserInitials(user.name)}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div
                                  className={cn(
                                    "h-24 w-24 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-white/20",
                                    roleConfig.gradient,
                                  )}>
                                  {getUserInitials(user.name)}
                                </div>
                              )}
                            </div>
                          </div>

                          <h3 className='text-xl font-bold text-gray-900 mb-2'>
                            {user.name}
                          </h3>

                          {/* Role Badge */}
                          <div
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-sm font-semibold mb-3",
                              roleConfig.bgColor,
                              roleConfig.textColor,
                              roleConfig.borderColor,
                            )}>
                            <RoleIcon className='h-3.5 w-3.5' />
                            {user.role}
                          </div>

                          {/* Quick Stats */}
                          <div className='flex items-center gap-4 text-sm text-gray-600 mb-4'>
                            <div className='flex items-center gap-1'>
                              <Mail className='h-3.5 w-3.5' />
                              <span className='truncate max-w-[150px]'>
                                {user.email}
                              </span>
                            </div>
                          </div>

                          <div className='flex items-center gap-1 text-sm text-gray-600 mb-6'>
                            <Phone className='h-3.5 w-3.5' />
                            <span>{user.mobile_number}</span>
                          </div>

                          {/* Role Change Selector */}
                          <div className='w-full mb-4'>
                            <Select
                              value={`${user.role_id}`}
                              onValueChange={(newRole) =>
                                handleRoleChange(`${user.id}`, newRole)
                              }
                              disabled={
                                user.role.includes("admin") || isCardLoading
                              }>
                              <SelectTrigger className='h-10 border-2 shadow-sm'>
                                <SelectValue placeholder='Change Role' />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((rol) => (
                                  <SelectItem
                                    key={rol?.id}
                                    value={`${rol?.roleNumber}`}
                                    className='font-medium'>
                                    {rol?.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Action Buttons */}
                          {hasSomePermissionsForPage("user", [
                            "edit",
                            "delete",
                          ]) && (
                            <div className='flex gap-2 w-full'>
                              {hasRequiredPermission("user", "edit") && (
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => handleEdit(user)}
                                  disabled={
                                    user.role.includes("admin") || isCardLoading
                                  }
                                  className='flex-1 border-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 font-semibold'>
                                  <Edit className='h-4 w-4 mr-1' />
                                  Edit
                                </Button>
                              )}
                              {hasRequiredPermission("user", "delete") && (
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => {
                                    setDeleteUserId(`${user.id}`);
                                    setIsDeleteModalOpen(true);
                                  }}
                                  disabled={
                                    user.role.includes("admin") || isCardLoading
                                  }
                                  className='flex-1 border-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300 font-semibold'>
                                  <Trash className='h-4 w-4 mr-1' />
                                  Delete
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Total Users Footer */}
          {filteredUsers.length > 0 && (
            <Card className='bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-6'>
              <div className='flex items-center justify-center gap-4'>
                <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg'>
                  <Users className='h-6 w-6 text-white' />
                </div>
                <div className='text-center'>
                  <p className='text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1'>
                    Showing {filteredUsers.length} of {users.length} Users
                  </p>
                  <p className='text-xs text-gray-600'>
                    {activeTab !== "all"
                      ? `Filtered by: ${activeTab}`
                      : "All users"}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className='sm:max-w-[520px] p-0'>
          <div className='p-6 pb-2'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg'>
                <Edit className='h-6 w-6 text-white' />
              </div>
              <div className='flex-1'>
                <DialogTitle className='text-2xl font-bold text-gray-900'>
                  Edit User Information
                </DialogTitle>
                <DialogDescription className='text-sm mt-1'>
                  Update user details and credentials
                </DialogDescription>
              </div>
            </div>
          </div>
          <div className='px-6 space-y-5 py-2'>
            <div className='space-y-2.5'>
              <Label
                htmlFor='edit-email'
                className='text-sm font-bold flex items-center gap-2 text-gray-700'>
                <div className='h-7 w-7 rounded-lg bg-purple-100 flex items-center justify-center'>
                  <Mail className='h-4 w-4 text-purple-600' />
                </div>
                Email Address
              </Label>
              <Input
                id='edit-email'
                type='email'
                placeholder='user@example.com'
                value={editData.email || ""}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
                className='h-11 border-2 focus:border-purple-400 font-medium'
              />
            </div>

            <div className='space-y-2.5'>
              <Label
                htmlFor='edit-mobile'
                className='text-sm font-bold flex items-center gap-2 text-gray-700'>
                <div className='h-7 w-7 rounded-lg bg-green-100 flex items-center justify-center'>
                  <Phone className='h-4 w-4 text-green-600' />
                </div>
                Mobile Number
              </Label>
              <Input
                id='edit-mobile'
                placeholder='Enter mobile number'
                value={editData.mobile_number || ""}
                onChange={(e) =>
                  setEditData({ ...editData, mobile_number: e.target.value })
                }
                className='h-11 border-2 focus:border-green-400 font-medium'
              />
            </div>

            <div className='space-y-2.5'>
              <Label
                htmlFor='edit-password'
                className='text-sm font-bold flex items-center gap-2 text-gray-700'>
                <div className='h-7 w-7 rounded-lg bg-orange-100 flex items-center justify-center'>
                  <Lock className='h-4 w-4 text-orange-600' />
                </div>
                New Password (Optional)
              </Label>
              <Input
                id='edit-password'
                type='password'
                placeholder='Leave empty to keep current password'
                value={editData.password || ""}
                onChange={(e) =>
                  setEditData({ ...editData, password: e.target.value })
                }
                className='h-11 border-2 focus:border-orange-400 font-medium'
              />
              <p className='text-xs text-muted-foreground flex items-center gap-1'>
                <Lock className='h-3 w-3' />
                Only enter a password if you want to change it
              </p>
            </div>
          </div>
          <DialogFooter className='p-6 pt-2 gap-2 sm:gap-0'>
            <Button
              variant='outline'
              onClick={() => setIsEditModalOpen(false)}
              className='h-11 border-2 font-semibold'>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className='h-11 shadow-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 font-semibold'>
              <Sparkles className='mr-2 h-4 w-4' />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className='sm:max-w-[480px]'>
          <AlertDialogHeader>
            <div className='flex items-center gap-3 mb-3'>
              <div className='h-14 w-14 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg'>
                <Trash className='h-7 w-7 text-white' />
              </div>
              <div>
                <AlertDialogTitle className='text-2xl font-bold text-gray-900'>
                  Delete User
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className='text-base text-gray-600 pl-1'>
              Are you sure you want to delete this user? This action cannot be
              undone and will permanently remove the user from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='gap-2 sm:gap-0'>
            <AlertDialogCancel className='h-11 border-2 font-semibold'>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='h-11 shadow-lg bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-0 font-semibold'>
              <Trash className='mr-2 h-4 w-4' />
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {renderCreateUserModal()}
    </div>
  );
}
