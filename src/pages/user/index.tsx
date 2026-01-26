import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
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
import { Badge } from "../../components/ui/badge";
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
  DialogHeader,
  DialogTitle,
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
        fetchUsers(); // Refresh the user list
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

  // Search and filter users
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.mobile_number.includes(query) ||
          user.role.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await adminChangeUserData(userId, { role: newRole });
      if (!response?.success) {
        console.error("Failed to fetch users:", response?.error);
        toast.error(response?.error || "Failed to fetch users");
        return;
      } else {
        toast.success("User role updated successfully");
      }
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error updating user role:", error);
    }
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

    try {
      const response = await adminChangeUserData(
        `${selectedUser?.id}`,
        updateAbleData
      );
      if (!response?.success) {
        console.error("Failed to fetch users:", response?.error);
        toast.error(response?.error || "Failed to fetch users");
        return;
      } else {
        toast.success("User information updated successfully");
        setIsEditModalOpen(false);
        fetchUsers(); // Refresh the user list
      }
    } catch (error) {
      console.error("Error updating user information:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;

    try {
      const response = await deleteUser(deleteUserId);
      if (response?.success) {
        fetchUsers(); // Refresh the user list
        setIsDeleteModalOpen(false);
        toast.success("User deleted successfully");
      } else {
        console.error("Failed to delete user:", response?.error);
        toast.error(response?.error || "Failed to delete user");
        return;
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const renderCreateUserForm = () => (
    <div className='space-y-5 py-4'>
      <div className='space-y-2'>
        <Label
          htmlFor='name'
          className='text-sm font-medium flex items-center gap-2'>
          <User className='h-4 w-4' />
          Full Name
        </Label>
        <Input
          id='name'
          placeholder='Enter full name'
          name='name'
          value={newUser.name}
          onChange={handleInputChange}
          className='h-11'
        />
      </div>

      <div className='space-y-2'>
        <Label
          htmlFor='email'
          className='text-sm font-medium flex items-center gap-2'>
          <Mail className='h-4 w-4' />
          Email Address
        </Label>
        <Input
          id='email'
          type='email'
          placeholder='user@example.com'
          name='email'
          value={newUser.email}
          onChange={handleInputChange}
          className='h-11'
        />
      </div>

      <div className='space-y-2'>
        <Label
          htmlFor='mobile'
          className='text-sm font-medium flex items-center gap-2'>
          <Phone className='h-4 w-4' />
          Mobile Number
        </Label>
        <Input
          id='mobile'
          placeholder='Enter mobile number'
          name='mobile_number'
          value={newUser.mobile_number}
          onChange={handleInputChange}
          className='h-11'
        />
      </div>

      <div className='space-y-2'>
        <Label
          htmlFor='password'
          className='text-sm font-medium flex items-center gap-2'>
          <Lock className='h-4 w-4' />
          Password
        </Label>
        <Input
          id='password'
          placeholder='Enter password'
          name='password'
          type='password'
          value={newUser.password}
          onChange={handleInputChange}
          className='h-11'
        />
      </div>

      <div className='space-y-2'>
        <Label className='text-sm font-medium flex items-center gap-2'>
          <Users className='h-4 w-4' />
          User Role
        </Label>
        <Select
          value={`${newUser.role}`}
          onValueChange={handleNewUserRoleChange}>
          <SelectTrigger className='h-11'>
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
            <DrawerHeader className='text-left'>
              <DrawerTitle className='flex items-center gap-2 text-2xl'>
                <Users className='h-6 w-6' />
                Create New User
              </DrawerTitle>
              <DrawerDescription>
                Fill in the details to create a new user account
              </DrawerDescription>
            </DrawerHeader>
            <div className='overflow-y-auto px-4'>{renderCreateUserForm()}</div>
            <DrawerFooter className='pt-4'>
              <Button
                onClick={handleCreateUser}
                disabled={isCreating}
                className='h-11 w-full'>
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
                  className='h-11 w-full'>
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
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-2xl'>
              <Users className='h-6 w-6' />
              Create New User
            </DialogTitle>
          </DialogHeader>
          {renderCreateUserForm()}
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreating}
              className='h-11'>
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={isCreating}
              className='h-11'>
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

  // Helper function to get role color
  const getRoleBadgeColor = (roleName: string) => {
    if (roleName.toLowerCase().includes("admin")) return "destructive";
    if (roleName.toLowerCase().includes("manager")) return "default";
    return "secondary";
  };

  // Helper function to get user initials
  const getUserInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className='space-y-6'>
      {/* Header Section */}
      <Card className='p-6'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              User Management
            </h2>
            <p className='text-muted-foreground mt-1'>
              Manage and organize your team members
            </p>
          </div>
          {hasRequiredPermission("user", "create") && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size='lg'
              className='shadow-sm'>
              <Plus className='mr-2 h-5 w-5' /> Create User
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className='relative mt-6'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search by name, email, mobile, or role...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10 h-11'
          />
        </div>
      </Card>

      {/* Users Table / Cards */}
      <Card className='shadow-sm'>
        {isLoading ? (
          <div className='flex items-center justify-center py-16'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className='py-16 text-center'>
            <Users className='mx-auto h-12 w-12 text-muted-foreground/50' />
            <p className='mt-4 text-lg font-medium'>No users found</p>
            <p className='text-sm text-muted-foreground mt-1'>
              {searchQuery
                ? "Try adjusting your search"
                : "Get started by creating a new user"}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className='md:hidden space-y-4 p-4'>
              {filteredUsers.map((user: IUser) => (
                <Card key={user.id} className='p-4 shadow-sm border-2'>
                  <div className='flex items-start gap-4'>
                    <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0'>
                      {getUserInitials(user.name)}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-2 mb-2'>
                        <div className='flex-1 min-w-0'>
                          <h3 className='font-semibold text-base truncate'>
                            {!!user.name && user?.name.length > 7
                              ? user.name.slice(0, 7) + "..."
                              : user.name}
                          </h3>
                          <Badge
                            variant={getRoleBadgeColor(user.role)}
                            className='mt-1 font-medium text-xs'>
                            {user.role}
                          </Badge>
                        </div>
                        {hasSomePermissionsForPage("user", [
                          "edit",
                          "delete",
                        ]) && (
                          <div className='flex gap-1 flex-shrink-0'>
                            {hasRequiredPermission("user", "edit") && (
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => handleEdit(user)}
                                disabled={user.role === "admin"}
                                className='h-8 w-8 hover:bg-primary/10 hover:text-primary'>
                                <Edit className='h-4 w-4' />
                              </Button>
                            )}
                            {hasRequiredPermission("user", "delete") && (
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => {
                                  setDeleteUserId(`${user.id}`);
                                  setIsDeleteModalOpen(true);
                                }}
                                disabled={user.role === "admin"}
                                className='h-8 w-8 hover:bg-destructive/10 hover:text-destructive'>
                                <Trash className='h-4 w-4' />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className='space-y-2 text-sm'>
                        <div className='flex items-center gap-2 text-muted-foreground'>
                          <Mail className='h-3.5 w-3.5 flex-shrink-0' />
                          <span className='truncate'>{user.email}</span>
                        </div>
                        <div className='flex items-center gap-2 text-muted-foreground'>
                          <Phone className='h-3.5 w-3.5 flex-shrink-0' />
                          <span>{user.mobile_number}</span>
                        </div>
                      </div>
                      <div className='mt-3'>
                        <Select
                          value={`${user.role_id}`}
                          onValueChange={(newRole) =>
                            handleRoleChange(`${user.id}`, newRole)
                          }
                          disabled={user.role.includes("admin")}>
                          <SelectTrigger className='h-9 w-full'>
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
                    </div>
                  </div>
                </Card>
              ))}
              <div className='pt-4 pb-2'>
                <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
                  <Users className='h-4 w-4' />
                  <span className='font-medium'>Total Users:</span>{" "}
                  {users.length}
                </div>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className='hidden md:block overflow-x-auto'>
              <Table>
                <TableCaption>
                  Showing {filteredUsers.length} of {users.length} users
                </TableCaption>
                <TableHeader>
                  <TableRow className='hover:bg-transparent'>
                    <TableHead className='w-16'>SL</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    {hasSomePermissionsForPage("user", ["edit", "delete"]) && (
                      <TableHead className='text-right'>Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: IUser, index: number) => (
                    <TableRow key={user.id} className='group'>
                      <TableCell className='font-medium text-muted-foreground'>
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm'>
                            <Avatar>
                              <AvatarImage
                                src={user?.avatar || ""}
                                alt='avatar'
                              />
                              <AvatarFallback>
                                {getUserInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <div className='font-medium'>{user.name}</div>
                            <div className='text-sm text-muted-foreground'>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2 text-sm'>
                          <Phone className='h-3.5 w-3.5 text-muted-foreground' />
                          {user.mobile_number}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Badge
                            variant={getRoleBadgeColor(user.role)}
                            className='font-medium'>
                            {user.role}
                          </Badge>
                          <Select
                            value={`${user.role_id}`}
                            onValueChange={(newRole) =>
                              handleRoleChange(`${user.id}`, newRole)
                            }
                            disabled={user.role.includes("admin")}>
                            <SelectTrigger className='h-9 w-[140px]'>
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
                      </TableCell>
                      {hasSomePermissionsForPage("user", [
                        "edit",
                        "delete",
                      ]) && (
                        <TableCell className='text-right'>
                          <div className='flex items-center justify-end gap-1'>
                            {hasRequiredPermission("user", "edit") && (
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => handleEdit(user)}
                                disabled={user.role === "admin"}
                                className='h-8 w-8 hover:bg-primary/10 hover:text-primary'>
                                <Edit className='h-4 w-4' />
                              </Button>
                            )}
                            {hasRequiredPermission("user", "delete") && (
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => {
                                  setDeleteUserId(`${user.id}`);
                                  setIsDeleteModalOpen(true);
                                }}
                                disabled={user.role === "admin"}
                                className='h-8 w-8 hover:bg-destructive/10 hover:text-destructive'>
                                <Trash className='h-4 w-4' />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={6} className='bg-muted/50'>
                      <div className='flex items-center gap-2'>
                        <Users className='h-4 w-4' />
                        <span className='font-medium'>Total Users:</span>{" "}
                        {users.length}
                      </div>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </>
        )}
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-2xl'>
              <Edit className='h-6 w-6' />
              Edit User Information
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-5 py-4'>
            <div className='space-y-2'>
              <Label
                htmlFor='edit-email'
                className='text-sm font-medium flex items-center gap-2'>
                <Mail className='h-4 w-4' />
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
                className='h-11'
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='edit-mobile'
                className='text-sm font-medium flex items-center gap-2'>
                <Phone className='h-4 w-4' />
                Mobile Number
              </Label>
              <Input
                id='edit-mobile'
                placeholder='Enter mobile number'
                value={editData.mobile_number || ""}
                onChange={(e) =>
                  setEditData({ ...editData, mobile_number: e.target.value })
                }
                className='h-11'
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='edit-password'
                className='text-sm font-medium flex items-center gap-2'>
                <Lock className='h-4 w-4' />
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
                className='h-11'
              />
              <p className='text-xs text-muted-foreground'>
                Only enter a password if you want to change it
              </p>
            </div>
          </div>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              onClick={() => setIsEditModalOpen(false)}
              className='h-11'>
              Cancel
            </Button>
            <Button onClick={handleSave} className='h-11'>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2 text-xl'>
              <Trash className='h-5 w-5 text-destructive' />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription className='text-base'>
              Are you sure you want to delete this user? This action cannot be
              undone and will permanently remove the user from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='h-11'>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='h-11 bg-destructive hover:bg-destructive/90'>
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {renderCreateUserModal()}
    </div>
  );
}
