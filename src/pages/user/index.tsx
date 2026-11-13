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
  Phone,
  Lock,
  Users,
  Loader2,
  Shield,
  UserCheck,
  Crown,
  Calendar,
  ChevronRight,
  Mail,
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
import { useIsMobile } from "../../hooks/use-mobile";
import {
  MobilePage,
  MobileCollapsingHeader,
  MobileListCard,
  MobileStaggeredList,
  MobileStatTile,
  MobileStatRow,
  MobileEmptyState,
  MobileSkeletonList,
  MobileDetailSheet,
  MobileFab,
  rippleProps,
} from "../../components/mobile";
import { PageHeader } from "../../components/PageHeader";

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
  const isMobile = useIsMobile();
  const [detailUser, setDetailUser] = useState<IUser | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  // Live mirror of the selected user so the sheet reflects refetches
  const activeDetail = detailUser
    ? (users.find((u) => u.id === detailUser.id) ?? null)
    : null;

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
    setDetailSheetOpen(false);
    setDetailUser(null);
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
        <Label htmlFor='name' className='text-sm font-medium text-slate-600'>
          Full Name
        </Label>
        <Input
          id='name'
          placeholder='Enter full name'
          name='name'
          value={newUser.name}
          onChange={handleInputChange}
          className='h-10 rounded-md border border-slate-200 focus:border-zinc-400'
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='email' className='text-sm font-medium text-slate-600'>
          Email Address
        </Label>
        <Input
          id='email'
          type='email'
          placeholder='user@example.com'
          name='email'
          value={newUser.email}
          onChange={handleInputChange}
          className='h-10 rounded-md border border-slate-200 focus:border-zinc-400'
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='mobile' className='text-sm font-medium text-slate-600'>
          Mobile Number
        </Label>
        <Input
          id='mobile'
          placeholder='Enter mobile number'
          name='mobile_number'
          value={newUser.mobile_number}
          onChange={handleInputChange}
          className='h-10 rounded-md border border-slate-200 focus:border-zinc-400'
        />
      </div>

      <div className='space-y-2'>
        <Label
          htmlFor='password'
          className='text-sm font-medium text-slate-600'>
          Password
        </Label>
        <Input
          id='password'
          placeholder='Enter password'
          name='password'
          type='password'
          value={newUser.password}
          onChange={handleInputChange}
          className='h-10 rounded-md border border-slate-200 focus:border-zinc-400'
        />
      </div>

      <div className='space-y-2'>
        <Label className='text-sm font-medium text-slate-600'>User Role</Label>
        <Select
          value={`${newUser.role}`}
          onValueChange={handleNewUserRoleChange}>
          <SelectTrigger className='h-10 rounded-md border border-slate-200 focus:border-zinc-400'>
            <SelectValue placeholder='Select a role' />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role?.id} value={`${role?.roleNumber}`}>
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
              <div className='h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-sm'>
                <Users className='h-5 w-5 text-white' />
              </div>
              <div className='flex-1'>
                <DialogTitle className='text-base font-semibold text-foreground'>
                  Create New User
                </DialogTitle>
                <DialogDescription className='text-[13px] mt-1'>
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
              className='h-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md'>
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

  const renderEditUserForm = () => (
    <div className='space-y-4 py-2'>
      <div className='space-y-2'>
        <Label
          htmlFor='edit-email'
          className='text-sm font-medium text-slate-600'>
          Email Address
        </Label>
        <Input
          id='edit-email'
          type='email'
          placeholder='user@example.com'
          value={editData.email || ""}
          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
          className='h-10 rounded-md border border-slate-200 focus:border-zinc-400'
        />
      </div>

      <div className='space-y-2'>
        <Label
          htmlFor='edit-mobile'
          className='text-sm font-medium text-slate-600'>
          Mobile Number
        </Label>
        <Input
          id='edit-mobile'
          placeholder='Enter mobile number'
          value={editData.mobile_number || ""}
          onChange={(e) =>
            setEditData({ ...editData, mobile_number: e.target.value })
          }
          className='h-10 rounded-md border border-slate-200 focus:border-zinc-400'
        />
      </div>

      <div className='space-y-2'>
        <Label
          htmlFor='edit-password'
          className='text-sm font-medium text-slate-600'>
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
          className='h-10 rounded-md border border-slate-200 focus:border-zinc-400'
        />
        <p className='text-xs text-slate-500'>
          Only enter a password if you want to change it
        </p>
      </div>
    </div>
  );

  const renderEditUserModal = () => {
    const headerIcon = (
      <div className='h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-sm'>
        <Edit className='h-5 w-5 text-white' />
      </div>
    );

    if (isMobile) {
      return (
        <Drawer open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DrawerContent className='max-h-[90vh]'>
            <DrawerHeader className='text-left pb-4'>
              <div className='flex items-center gap-3 mb-2'>
                {headerIcon}
                <div className='flex-1'>
                  <DrawerTitle className='text-base font-semibold text-foreground'>
                    Edit User Information
                  </DrawerTitle>
                  <DrawerDescription className='text-[13px] mt-1'>
                    Update user details and credentials
                  </DrawerDescription>
                </div>
              </div>
            </DrawerHeader>
            <div className='overflow-y-auto px-4'>{renderEditUserForm()}</div>
            <DrawerFooter className='pt-4 gap-2'>
              <Button
                onClick={handleSave}
                disabled={loadingUserId !== null}
                className='h-11 w-full'>
                {loadingUserId !== null ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  <>
                    <Edit className='mr-2 h-4 w-4' />
                    Save Changes
                  </>
                )}
              </Button>
              <DrawerClose asChild>
                <Button
                  variant='outline'
                  disabled={loadingUserId !== null}
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
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className='sm:max-w-[480px] p-0'>
          <div className='p-6 pb-2'>
            <div className='flex items-center gap-3 mb-2'>
              {headerIcon}
              <div className='flex-1'>
                <DialogTitle className='text-base font-semibold text-foreground'>
                  Edit User Information
                </DialogTitle>
                <DialogDescription className='text-[13px] mt-1'>
                  Update user details and credentials
                </DialogDescription>
              </div>
            </div>
          </div>
          <div className='px-6'>{renderEditUserForm()}</div>
          <DialogFooter className='p-6 pt-2 gap-2 sm:gap-0'>
            <Button
              variant='outline'
              onClick={() => setIsEditModalOpen(false)}
              className='h-10 border border-slate-200'>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className='h-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md'>
              <Edit className='mr-2 h-4 w-4' />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div>
      {/* ═══════════ DESKTOP — unchanged ═══════════ */}
      <div className='hidden md:block'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
          {/* Page Header */}
          <PageHeader
            icon={<Users className='h-5 w-5 text-white' />}
            title='Users'
            subtitle='Manage and organize your team members efficiently'
            count={
              <span className='text-base font-semibold text-slate-500 tabular-nums'>
                {users.length} total
              </span>
            }
            actions={
              <>
                {hasRequiredPermission("user", "create") && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors duration-150'>
                    <Plus className='h-4 w-4' />
                    Create User
                  </button>
                )}
              </>
            }
          />

          {/* Summary Strip */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            {[
              {
                label: "Total Users",
                value: stats.total,
              },
              {
                label: "Admins",
                value: stats.adminCount,
              },
              {
                label: "Managers",
                value: stats.managerCount,
              },
              {
                label: "Regular",
                value: stats.regularCount,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className='flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-[0_1px_2px_rgba(20,20,19,0.04)]'>
                <div className='w-2 h-2 rounded-full bg-primary/50' />
                <div className='min-w-0'>
                  <p className='text-lg font-semibold text-foreground tabular-nums leading-none'>
                    {stat.value}
                  </p>
                  <p className='text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-1 truncate'>
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
              className='pl-10 h-10 bg-white border border-slate-200 focus:border-zinc-400 rounded-md text-sm shadow-sm'
            />
          </div>

          {/* Tabs */}
          <div className='bg-white rounded-xl border border-slate-200 shadow-[0_1px_2px_rgba(20,20,19,0.04)] overflow-hidden'>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'>
              {/* Tab Bar */}
              <div className='border-b border-slate-200'>
                <TabsList className='h-auto bg-transparent p-0 gap-0 rounded-none flex justify-start'>
                  <TabsTrigger
                    value='all'
                    className='relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-foreground data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'>
                    <Users className='h-4 w-4' />
                    All Users ({users.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value='admins'
                    className='relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-foreground data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'>
                    <Crown className='h-4 w-4' />
                    Admins ({stats.adminCount})
                  </TabsTrigger>
                  <TabsTrigger
                    value='managers'
                    className='relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-foreground data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'>
                    <Shield className='h-4 w-4' />
                    Managers ({stats.managerCount})
                  </TabsTrigger>
                  <TabsTrigger
                    value='regular'
                    className='relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-foreground data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'>
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
                      <div className='absolute inset-0 bg-primary/20 rounded-full animate-ping' />
                      <div className='relative h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-sm'>
                        <Loader2 className='h-8 w-8 text-primary-foreground animate-spin' />
                      </div>
                    </div>
                    <p className='mt-6 text-lg font-semibold text-foreground'>
                      Loading users...
                    </p>
                    <p className='text-[13px] text-slate-400 mt-1'>
                      Please wait while we fetch the data
                    </p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className='py-20 px-4 text-center bg-white'>
                    <div className='mx-auto h-20 w-20 rounded-xl bg-muted ring-1 ring-border flex items-center justify-center mb-6'>
                      <Users className='h-10 w-10 text-slate-400' />
                    </div>
                    <p className='text-base font-semibold text-foreground mb-2'>
                      No users found
                    </p>
                    <p className='text-[13px] text-slate-500 mb-6 max-w-sm mx-auto'>
                      {searchQuery
                        ? "Try adjusting your search criteria to find what you're looking for"
                        : "Get started by creating your first user account"}
                    </p>
                    {!searchQuery &&
                      hasRequiredPermission("user", "create") && (
                        <Button
                          onClick={() => setIsCreateModalOpen(true)}
                          size='lg'
                          className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-md'>
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
                            "group relative overflow-hidden transition-all duration-200 rounded-lg border border-slate-200 bg-slate-50/60 shadow-[0_1px_2px_rgba(20,20,19,0.04)] p-0",
                            isCardLoading
                              ? "opacity-50 pointer-events-none"
                              : "hover:border-zinc-400",
                          )}>
                          {isCardLoading && (
                            <div className='absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center'>
                              <Loader2 className='h-6 w-6 animate-spin text-primary' />
                            </div>
                          )}

                          {/* Header strip: avatar + identity + role badge */}
                          <div className='flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3'>
                            {user.avatar ? (
                              <Avatar className='h-9 w-9 rounded-md border border-border'>
                                <AvatarImage
                                  src={user.avatar}
                                  alt={user.name}
                                />
                                <AvatarFallback className='rounded-md bg-muted text-primary font-semibold text-[13px]'>
                                  {getUserInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className='h-9 w-9 shrink-0 rounded-md bg-muted flex items-center justify-center text-primary font-semibold text-[13px] border border-border'>
                                {getUserInitials(user.name)}
                              </div>
                            )}
                            <div className='min-w-0 flex-1'>
                              <h3 className='truncate text-[13px] font-semibold text-foreground leading-tight uppercase'>
                                {user.name}
                              </h3>
                              <p className='truncate text-[11px] text-slate-400 mt-0.5'>
                                {user.email}
                              </p>
                            </div>
                            <div
                              className={cn(
                                "inline-flex shrink-0 items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-medium",
                                roleConfig.bgColor,
                                roleConfig.textColor,
                                roleConfig.borderColor,
                              )}>
                              <RoleIcon className='h-3 w-3' />
                              {user.role}
                            </div>
                          </div>

                          {/* Body: contact rows + role select */}
                          <div className='px-4 py-3 space-y-2.5'>
                            <div className='flex items-center justify-between gap-3'>
                              <span className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
                                Mobile
                              </span>
                              <span className='flex items-center gap-1.5 text-[13px] text-foreground tabular-nums'>
                                <Phone className='h-3 w-3 text-slate-400' />
                                {user.mobile_number}
                              </span>
                            </div>
                            <Select
                              value={`${user.role_id}`}
                              onValueChange={(newRole) =>
                                handleRoleChange(`${user.id}`, newRole)
                              }
                              disabled={
                                user.role.includes("admin") || isCardLoading
                              }>
                              <SelectTrigger className='h-8 rounded-md border border-slate-200 bg-white text-[11px]'>
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

                          {/* Footer strip: actions */}
                          {hasSomePermissionsForPage("user", [
                            "edit",
                            "delete",
                          ]) && (
                            <div className='flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-3 py-2'>
                              {hasRequiredPermission("user", "edit") && (
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => handleEdit(user)}
                                  disabled={
                                    user.role.includes("admin") || isCardLoading
                                  }
                                  className='h-7 rounded-md border-slate-300 px-2.5 text-[11px] text-slate-600 hover:bg-accent hover:text-foreground hover:border-zinc-400'>
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
                                  className='h-7 rounded-md border-slate-300 px-2.5 text-[11px] text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'>
                                  <Trash className='h-3 w-3 mr-1' />
                                  Delete
                                </Button>
                              )}
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* ═══════════ MOBILE — Android large-title list + detail sheet ═══════════ */}
      <div className='md:hidden'>
        <MobilePage
          fab={
            hasRequiredPermission("user", "create") ? (
              <MobileFab
                icon={<Plus className='h-6 w-6' />}
                label='Add user'
                onClick={() => setIsCreateModalOpen(true)}
              />
            ) : undefined
          }>
          <MobileCollapsingHeader
            title='Users'
            icon={<Users className='h-4 w-4 text-primary' />}
            subtitle={`${stats.total} team members`}
          />

          {/* Pinned search + filter chips */}
          <div className='sticky top-14 z-10 space-y-3 bg-background px-4 pb-2 pt-3'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search users…'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10 h-10 rounded-full bg-card'
              />
            </div>

            <div className='flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
              {[
                { value: "admins", label: "Admins", count: stats.adminCount },
                {
                  value: "managers",
                  label: "Managers",
                  count: stats.managerCount,
                },
                {
                  value: "regular",
                  label: "Regular",
                  count: stats.regularCount,
                },
              ].map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => setActiveTab(chip.value)}
                  className={cn(
                    "m3-ripple h-9 shrink-0 rounded-full border px-4 text-[13px] font-medium transition-colors",
                    activeTab === chip.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground",
                  )}
                  {...rippleProps()}>
                  {chip.label}{" "}
                  <span className='tabular-nums opacity-70'>{chip.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className='space-y-3 pb-4 pt-2 bg-white'>
            {/* Stat strip */}
            <MobileStatRow className='px-4'>
              {/* <MobileStatTile label='Users' value={stats.total} /> */}
              <MobileStatTile
                label='Admins'
                value={stats.adminCount}
                icon={<Crown className='h-4 w-4' />}
                tone='bg-rose-100 text-rose-700'
              />
              <MobileStatTile
                label='Managers'
                value={stats.managerCount}
                icon={<Shield className='h-4 w-4' />}
                tone='bg-amber-100 text-amber-700'
              />
              <MobileStatTile
                label='Regular'
                value={stats.regularCount}
                icon={<UserCheck className='h-4 w-4' />}
                tone='bg-emerald-100 text-emerald-700'
              />
            </MobileStatRow>

            {/* User list */}
            {isLoading ? (
              <MobileSkeletonList count={6} />
            ) : filteredUsers.length === 0 ? (
              <MobileEmptyState
                icon={<Users className='h-7 w-7' />}
                title='No users found'
                description={
                  searchQuery
                    ? "Try adjusting your search criteria"
                    : "Get started by creating your first user"
                }
                action={
                  !searchQuery && hasRequiredPermission("user", "create") ? (
                    <Button
                      className='rounded-full'
                      onClick={() => setIsCreateModalOpen(true)}>
                      <Plus className='mr-2 h-4 w-4' /> Create user
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <MobileStaggeredList key={activeTab} className='px-4'>
                {filteredUsers.map((user: IUser) => {
                  const roleConfig = getRoleConfig(user.role);
                  const isCardLoading = loadingUserId === user.id;
                  const isAdmin = user.role.toLowerCase().includes("admin");
                  const dotColor = isAdmin
                    ? "bg-rose-500"
                    : user.role.toLowerCase().includes("manager")
                      ? "bg-amber-500"
                      : "bg-emerald-500";

                  return (
                    <MobileListCard
                      key={user.id}
                      onClick={() => {
                        setDetailUser(user);
                        setDetailSheetOpen(true);
                      }}
                      className={cn(
                        "border-x-0 border-t-0 rounded-none bg-transparent px-0",
                        isCardLoading && "opacity-50 pointer-events-none",
                      )}
                      leading={
                        user.avatar ? (
                          <Avatar className='h-11 w-11 rounded-full border border-border'>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback
                              className={cn(
                                "rounded-full font-semibold text-[13px]",
                                roleConfig.bgColor,
                                roleConfig.textColor,
                              )}>
                              {getUserInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div
                            className={cn(
                              "h-11 w-11 shrink-0 rounded-full flex items-center justify-center font-semibold text-[13px]",
                              roleConfig.bgColor,
                              roleConfig.textColor,
                            )}>
                            {getUserInitials(user.name)}
                          </div>
                        )
                      }
                      title={user.name}
                      subtitle={
                        <span className='flex items-center gap-1.5'>
                          <Mail className='h-3 w-3' />
                          {user.email}
                        </span>
                      }
                      trailing={
                        <span className='flex items-center gap-2'>
                          <span
                            className={cn("h-2 w-2 rounded-full", dotColor)}
                          />
                          <ChevronRight className='h-4 w-4 text-muted-foreground/60' />
                        </span>
                      }
                    />
                  );
                })}
              </MobileStaggeredList>
            )}
          </div>
        </MobilePage>
      </div>

      {/* User detail sheet (mobile) */}
      {(() => {
        const detail = activeDetail;
        if (!detail) return null;
        const roleConfig = getRoleConfig(detail.role);
        const RoleIcon = roleConfig.icon;
        const isDetailLoading = loadingUserId === `${detail.id}`;
        const isDetailAdmin = detail.role.toLowerCase().includes("admin");
        const canEdit = hasRequiredPermission("user", "edit") && !isDetailAdmin;
        const canDelete =
          hasRequiredPermission("user", "delete") && !isDetailAdmin;
        const joinedDate = detail.created_date
          ? new Date(detail.created_date).toLocaleDateString()
          : null;

        return (
          <MobileDetailSheet
            open={detailSheetOpen}
            onOpenChange={setDetailSheetOpen}
            title={
              <span className='flex flex-col items-center gap-2'>
                {detail.avatar ? (
                  <Avatar className='h-14 w-14 rounded-full border border-border'>
                    <AvatarImage src={detail.avatar} alt={detail.name} />
                    <AvatarFallback
                      className={cn(
                        "rounded-full font-semibold text-[15px]",
                        roleConfig.bgColor,
                        roleConfig.textColor,
                      )}>
                      {getUserInitials(detail.name)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div
                    className={cn(
                      "h-14 w-14 rounded-full flex items-center justify-center font-semibold text-[15px]",
                      roleConfig.bgColor,
                      roleConfig.textColor,
                    )}>
                    {getUserInitials(detail.name)}
                  </div>
                )}
                <span className='flex items-center gap-2'>
                  {detail.name}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium",
                      roleConfig.bgColor,
                      roleConfig.textColor,
                      roleConfig.borderColor,
                    )}>
                    <RoleIcon className='h-3 w-3' />
                    {detail.role}
                  </span>
                </span>
              </span>
            }
            description={detail.email}
            actionLabel={canEdit ? "Edit user" : undefined}
            onAction={
              canEdit
                ? () => {
                    setDetailSheetOpen(false);
                    handleEdit(detail);
                  }
                : undefined
            }>
            {/* Info rows */}
            <div className='divide-y rounded-2xl border bg-card'>
              <div className='flex items-center gap-3 px-4 py-3'>
                <Phone className='h-4 w-4 shrink-0 text-muted-foreground' />
                <span className='text-[14px] tabular-nums'>
                  {detail.mobile_number}
                </span>
              </div>
              <div className='flex items-center gap-3 px-4 py-3'>
                <Mail className='h-4 w-4 shrink-0 text-muted-foreground' />
                <span className='text-[14px] truncate'>{detail.email}</span>
              </div>
              <div className='flex items-center gap-3 px-4 py-3'>
                <RoleIcon className='h-4 w-4 shrink-0 text-muted-foreground' />
                <span className='text-[14px]'>{detail.role}</span>
              </div>
              {joinedDate && (
                <div className='flex items-center gap-3 px-4 py-3'>
                  <Calendar className='h-4 w-4 shrink-0 text-muted-foreground' />
                  <span className='text-[14px] tabular-nums'>
                    Joined {joinedDate}
                  </span>
                </div>
              )}
            </div>

            {detail.bio && (
              <p className='mt-3 px-1 text-[13px] leading-relaxed text-muted-foreground'>
                {detail.bio}
              </p>
            )}

            {/* Role change */}
            {hasRequiredPermission("user", "edit") && (
              <div className='mt-4'>
                <p className='mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'>
                  Role
                </p>
                <Select
                  value={`${detail.role_id}`}
                  onValueChange={(newRole) =>
                    handleRoleChange(`${detail.id}`, newRole)
                  }
                  disabled={isDetailAdmin || isDetailLoading}>
                  <SelectTrigger className='h-10 rounded-full border-border bg-card text-[13px]'>
                    <SelectValue placeholder='Change role' />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((rol) => (
                      <SelectItem key={rol?.id} value={`${rol?.roleNumber}`}>
                        {rol?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isDetailLoading && (
                  <p className='mt-2 flex items-center gap-1.5 px-1 text-[12px] text-muted-foreground'>
                    <Loader2 className='h-3 w-3 animate-spin' /> Updating…
                  </p>
                )}
              </div>
            )}

            {/* Delete */}
            {canDelete && (
              <button
                onClick={() => {
                  setDeleteUserId(`${detail.id}`);
                  setIsDeleteModalOpen(true);
                }}
                disabled={isDetailLoading}
                className='m3-ripple mt-4 flex w-full items-center gap-3 rounded-2xl border border-destructive/30 px-4 py-3 text-[14px] font-medium text-destructive disabled:opacity-50'
                {...rippleProps()}>
                <Trash className='h-4 w-4' />
                Delete user
              </button>
            )}
          </MobileDetailSheet>
        );
      })()}

      {/* Edit Modal (Drawer on mobile, Dialog on desktop) */}
      {renderEditUserModal()}

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className='sm:max-w-[440px]'>
          <AlertDialogHeader>
            <div className='flex items-center gap-3 mb-3'>
              <div className='h-12 w-12 rounded-xl bg-rose-600 flex items-center justify-center shadow-sm'>
                <Trash className='h-6 w-6 text-white' />
              </div>
              <div>
                <AlertDialogTitle className='text-base font-semibold text-foreground'>
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
