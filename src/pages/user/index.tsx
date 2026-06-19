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
    role: -1,
  });

  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewUserRoleChange = (value: string) => {
    //@ts-ignore
    setNewUser((prev) => ({ ...prev, role: value ?? -1 }));
  };

  const handleCreateUser = async () => {
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
      const response = await signupUser({
        name: newUser.name,
        email: newUser.email,
        mobileNumber: newUser.mobile_number,
        password: newUser.password,
        type: newUser.role,
      });

      if (response.success) {
        toast.success("User created successfully.");
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

  useEffect(() => {
    let filtered = users;

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

  const handleOptimisticUpdate = async (
    userId: string,
    updateFn: () => Promise<void>,
  ) => {
    setLoadingUserId(userId);
    try {
      await updateFn();
      await fetchUsers(false);
      toast.success("User updated successfully");
    } catch (error) {
      toast.error("Failed to update user");
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

  const getRoleConfig = (roleName: string) => {
    if (roleName.toLowerCase().includes("admin")) {
      return {
        bgColor: "bg-rose-50",
        textColor: "text-rose-700",
        borderColor: "border-rose-200",
        icon: Crown,
      };
    }
    if (roleName.toLowerCase().includes("manager")) {
      return {
        bgColor: "bg-amber-50",
        textColor: "text-amber-700",
        borderColor: "border-amber-200",
        icon: Shield,
      };
    }
    return {
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-200",
      icon: UserCheck,
    };
  };

  const getUserInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

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

  const renderCreateUserForm = () => (
    <div className='space-y-4 py-2'>
      <div className='space-y-2'>
        <Label
          htmlFor='name'
          className='text-sm font-medium text-slate-700'>
          Full Name
        </Label>
        <Input
          id='name'
          placeholder='Enter full name'
          name='name'
          value={newUser.name}
          onChange={handleInputChange}
          className='h-10 border border-slate-200 focus:border-indigo-400'
        />
      </div>

      <div className='space-y-2'>
        <Label
          htmlFor='email'
          className='text-sm font-medium text-slate-700'>
          Email Address
        </Label>
        <Input
          id='email'
          type='email'
          placeholder='user@example.com'
          name='email'
          value={newUser.email}
          onChange={handleInputChange}
          className='h-10 border border-slate-200 focus:border-indigo-400'
        />
      </div>

      <div className='space-y-2'>
        <Label
          htmlFor='mobile'
          className='text-sm font-medium text-slate-700'>
          Mobile Number
        </Label>
        <Input
          id='mobile'
          placeholder='Enter mobile number'
          name='mobile_number'
          value={newUser.mobile_number}
          onChange={handleInputChange}
          className='h-10 border border-slate-200 focus:border-indigo-400'
        />
      </div>

      <div className='space-y-2'>
        <Label
          htmlFor='password'
          className='text-sm font-medium text-slate-700'>
          Password
        </Label>
        <Input
          id='password'
          placeholder='Enter password'
          name='password'
          type='password'
          value={newUser.password}
          onChange={handleInputChange}
          className='h-10 border border-slate-200 focus:border-indigo-400'
        />
      </div>

      <div className='space-y-2'>
        <Label className='text-sm font-medium text-slate-700'>
          User Role
        </Label>
        <Select
          value={`${newUser.role}`}
          onValueChange={handleNewUserRoleChange}>
          <SelectTrigger className='h-10 border border-slate-200 focus:border-indigo-400'>
            <SelectValue placeholder='Select a role' />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem
                key={role?.id}
                value={`${role?.roleNumber}`}>
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
                <div className='h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm'>
                  <Users className='h-5 w-5 text-white' />
                </div>
                <div className='flex-1'>
                  <DrawerTitle className='text-xl font-semibold text-slate-900'>
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
                className='h-11 w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200'>
                {isCreating ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className='mr-2 h-4 w-4' />
                    Create User
                  </>
                )}
              </Button>
              <DrawerClose asChild>
                <Button
                  variant='outline'
                  disabled={isCreating}
                  className='h-11 w-full border border-slate-200'>
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
        <DialogContent className='sm:max-w-[480px] p-0'>
          <div className='p-6 pb-2'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm'>
                <Users className='h-5 w-5 text-white' />
              </div>
              <div className='flex-1'>
                <DialogTitle className='text-xl font-semibold text-slate-900'>
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
              className='h-10 border border-slate-200'>
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={isCreating}
              className='h-10 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200'>
              {isCreating ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className='mr-2 h-4 w-4' />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className='min-h-screen bg-slate-50/60'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
        {/* Page Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200'>
              <Users className='h-5 w-5 text-white' />
            </div>
            <div>
              <h1 className='text-xl font-semibold text-slate-900 leading-tight'>
                User Management
              </h1>
              <p className='text-sm text-slate-500 mt-0.5'>
                Manage and organize your team members efficiently
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {hasRequiredPermission("user", "create") && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-150 shadow-sm shadow-indigo-200'>
                <Plus className='h-4 w-4' />
                Create User
              </button>
            )}
          </div>
        </div>

        {/* Summary Strip */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
          {[
            {
              label: "Total Users",
              value: stats.total,
              accent: "text-indigo-600",
              bg: "bg-indigo-50",
            },
            {
              label: "Admins",
              value: stats.adminCount,
              accent: "text-rose-600",
              bg: "bg-rose-50",
            },
            {
              label: "Managers",
              value: stats.managerCount,
              accent: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Regular",
              value: stats.regularCount,
              accent: "text-emerald-600",
              bg: "bg-emerald-50",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className='flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm'>
              <div
                className={`w-2 h-2 rounded-full ${stat.bg.replace("bg-", "bg-").replace("50", "400")}`}
              />
              <div className='min-w-0'>
                <p
                  className={`text-lg font-semibold ${stat.accent} leading-none`}>
                  {stat.value}
                </p>
                <p className='text-xs text-slate-500 mt-0.5 truncate'>
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className='relative max-w-2xl'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400' />
          <Input
            placeholder='Search by name, email, mobile, or role...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10 h-10 bg-white border border-slate-200 focus:border-indigo-400 rounded-lg text-sm shadow-sm'
          />
        </div>

        {/* Tabs */}
        <div className='bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'>
            {/* Tab Bar */}
            <div className='border-b border-slate-100'>
              <TabsList className='h-auto bg-transparent p-0 gap-0 rounded-none flex justify-start'>
                <TabsTrigger
                  value='all'
                  className='relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'>
                  <Users className='h-4 w-4' />
                  All Users ({users.length})
                </TabsTrigger>
                <TabsTrigger
                  value='admins'
                  className='relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'>
                  <Crown className='h-4 w-4' />
                  Admins ({stats.adminCount})
                </TabsTrigger>
                <TabsTrigger
                  value='managers'
                  className='relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'>
                  <Shield className='h-4 w-4' />
                  Managers ({stats.managerCount})
                </TabsTrigger>
                <TabsTrigger
                  value='regular'
                  className='relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'>
                  <UserCheck className='h-4 w-4' />
                  Regular ({stats.regularCount})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <TabsContent
              value={activeTab}
              className='p-4 sm:p-6 mt-0 focus-visible:outline-none'>
              {isLoading ? (
                <div className='flex flex-col items-center justify-center py-20 px-4'>
                  <div className='relative'>
                    <div className='absolute inset-0 bg-indigo-500/20 rounded-full animate-ping' />
                    <div className='relative h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg'>
                      <Loader2 className='h-8 w-8 text-white animate-spin' />
                    </div>
                  </div>
                  <p className='mt-6 text-lg font-semibold text-slate-900'>
                    Loading users...
                  </p>
                  <p className='text-sm text-slate-500 mt-1'>
                    Please wait while we fetch the data
                  </p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className='py-20 px-4 text-center bg-white rounded-2xl'>
                  <div className='mx-auto h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6'>
                    <Users className='h-10 w-10 text-slate-400' />
                  </div>
                  <p className='text-xl font-bold text-slate-900 mb-2'>
                    No users found
                  </p>
                  <p className='text-sm text-slate-500 mb-6 max-w-sm mx-auto'>
                    {searchQuery
                      ? "Try adjusting your search criteria to find what you're looking for"
                      : "Get started by creating your first user account"}
                  </p>
                  {!searchQuery && hasRequiredPermission("user", "create") && (
                    <Button
                      onClick={() => setIsCreateModalOpen(true)}
                      size='lg'
                      className='bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200'>
                      <Plus className='mr-2 h-5 w-5' /> Create First User
                    </Button>
                  )}
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {filteredUsers.map((user: IUser) => {
                    const roleConfig = getRoleConfig(user.role);
                    const RoleIcon = roleConfig.icon;
                    const isCardLoading = loadingUserId === user.id;

                    return (
                      <Card
                        key={user.id}
                        className={cn(
                          "group relative overflow-hidden transition-all duration-200 hover:shadow-md border border-slate-100",
                          isCardLoading
                            ? "opacity-50 pointer-events-none"
                            : "hover:border-slate-200",
                        )}>
                        {isCardLoading && (
                          <div className='absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center'>
                            <Loader2 className='h-6 w-6 animate-spin text-indigo-600' />
                          </div>
                        )}

                        <div className='p-5'>
                          <div className='flex flex-col items-center text-center'>
                            <div className='relative mb-4'>
                              {user.avatar ? (
                                <Avatar className='h-16 w-16 rounded-full border-2 border-white shadow-md'>
                                  <AvatarImage
                                    src={user.avatar}
                                    alt={user.name}
                                  />
                                  <AvatarFallback className='rounded-full bg-indigo-100 text-indigo-600 font-semibold text-lg'>
                                    {getUserInitials(user.name)}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className='h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xl border-2 border-white shadow-md'>
                                  {getUserInitials(user.name)}
                                </div>
                              )}
                            </div>

                            <h3 className='text-base font-semibold text-slate-900 mb-2'>
                              {user.name}
                            </h3>

                            <div
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium mb-3",
                                roleConfig.bgColor,
                                roleConfig.textColor,
                                roleConfig.borderColor,
                              )}>
                              <RoleIcon className='h-3 w-3' />
                              {user.role}
                            </div>

                            <div className='w-full space-y-2 mb-4'>
                              <div className='flex items-center justify-center gap-1.5 text-xs text-slate-600'>
                                <Mail className='h-3 w-3' />
                                <span className='truncate max-w-[180px]'>
                                  {user.email}
                                </span>
                              </div>
                              <div className='flex items-center justify-center gap-1.5 text-xs text-slate-600'>
                                <Phone className='h-3 w-3' />
                                <span>{user.mobile_number}</span>
                              </div>
                            </div>

                            <div className='w-full mb-4'>
                              <Select
                                value={`${user.role_id}`}
                                onValueChange={(newRole) =>
                                  handleRoleChange(`${user.id}`, newRole)
                                }
                                disabled={
                                  user.role.includes("admin") || isCardLoading
                                }>
                                <SelectTrigger className='h-9 border border-slate-200 text-xs'>
                                  <SelectValue placeholder='Change Role' />
                                </SelectTrigger>
                                <SelectContent>
                                  {roles.map((rol) => (
                                    <SelectItem
                                      key={rol?.id}
                                      value={`${rol?.roleNumber}`}>
                                      {rol?.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

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
                                    className='flex-1 border border-slate-200 hover:bg-slate-50 hover:text-slate-700 text-xs'>
                                    <Edit className='h-3 w-3 mr-1' />
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
                                    className='flex-1 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs'>
                                    <Trash className='h-3 w-3 mr-1' />
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
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className='sm:max-w-[480px] p-0'>
          <div className='p-6 pb-2'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm'>
                <Edit className='h-5 w-5 text-white' />
              </div>
              <div className='flex-1'>
                <DialogTitle className='text-xl font-semibold text-slate-900'>
                  Edit User Information
                </DialogTitle>
                <DialogDescription className='text-sm mt-1'>
                  Update user details and credentials
                </DialogDescription>
              </div>
            </div>
          </div>
          <div className='px-6 space-y-4 py-2'>
            <div className='space-y-2'>
              <Label
                htmlFor='edit-email'
                className='text-sm font-medium text-slate-700'>
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
                className='h-10 border border-slate-200 focus:border-indigo-400'
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='edit-mobile'
                className='text-sm font-medium text-slate-700'>
                Mobile Number
              </Label>
              <Input
                id='edit-mobile'
                placeholder='Enter mobile number'
                value={editData.mobile_number || ""}
                onChange={(e) =>
                  setEditData({ ...editData, mobile_number: e.target.value })
                }
                className='h-10 border border-slate-200 focus:border-indigo-400'
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='edit-password'
                className='text-sm font-medium text-slate-700'>
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
                className='h-10 border border-slate-200 focus:border-indigo-400'
              />
              <p className='text-xs text-slate-500'>
                Only enter a password if you want to change it
              </p>
            </div>
          </div>
          <DialogFooter className='p-6 pt-2 gap-2 sm:gap-0'>
            <Button
              variant='outline'
              onClick={() => setIsEditModalOpen(false)}
              className='h-10 border border-slate-200'>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className='h-10 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200'>
              <Plus className='mr-2 h-4 w-4' />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className='sm:max-w-[440px]'>
          <AlertDialogHeader>
            <div className='flex items-center gap-3 mb-3'>
              <div className='h-12 w-12 rounded-xl bg-rose-600 flex items-center justify-center shadow-sm'>
                <Trash className='h-6 w-6 text-white' />
              </div>
              <div>
                <AlertDialogTitle className='text-xl font-semibold text-slate-900'>
                  Delete User
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className='text-sm text-slate-600 pl-1'>
              Are you sure you want to delete this user? This action cannot be
              undone and will permanently remove the user from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='gap-2 sm:gap-0'>
            <AlertDialogCancel className='h-10 border border-slate-200'>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='h-10 bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-200'>
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
