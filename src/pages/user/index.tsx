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
import { Edit, Plus, Trash } from "lucide-react";
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
  adminChangeUserData,
  deleteUser,
  getAllUsers,
  signupUser,
} from "../../api/user";
import toast from "react-hot-toast";
import { useRoles } from "../role/hooks/useRoleHook";
import useRoleCheck from "../auth/hooks/useRoleCheck";

export function UserComponent() {
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();
  const { roles, fetchRoles } = useRoles();
  const [users, setUsers] = useState<IUser[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [editData, setEditData] = useState<Partial<IUser>>({});
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    mobile_number: "",
    password: "",
    role: -1, // Default role
  });

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
      // Optionally, refresh the user list here
    } else {
      toast.error(response.error || "Failed to create user.");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      if (!response?.success) {
        console.error("Failed to fetch users:", response?.error);
        toast.error(response?.error || "Failed to fetch users");
        return;
      }
      setUsers(response?.data);
    } catch (error) {
      console.error("Error fetching the user data:", error);
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

  const renderCreateUserModal = () => {
    return (
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <Input
              placeholder='Name'
              name='name'
              value={newUser.name}
              onChange={handleInputChange}
            />
            <Input
              placeholder='Email'
              name='email'
              value={newUser.email}
              onChange={handleInputChange}
            />
            <Input
              placeholder='Mobile Number'
              name='mobile_number'
              value={newUser.mobile_number}
              onChange={handleInputChange}
            />
            <Input
              placeholder='Password'
              name='password'
              type='password'
              value={newUser.password}
              onChange={handleInputChange}
            />
            <Select
              value={`${newUser.role}`}
              onValueChange={handleNewUserRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder='Select Role' />
              </SelectTrigger>
              <SelectContent>
                {roles.map(
                  (
                    role // UserRoleList is a constant array of roles
                  ) => (
                    <SelectItem key={role?.id} value={`${role?.roleNumber}`}>
                      {role?.name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Card className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold'>User List</h2>
        {hasRequiredPermission("user", "create") && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className='mr-2 h-4 w-4' /> Create User
          </Button>
        )}
      </div>
      <Table>
        <TableCaption>A list of users fetched from the API.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>SL No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mobile Number</TableHead>
            <TableHead>Role</TableHead>
            {hasSomePermissionsForPage("user", ["edit", "delete"]) && (
              <TableHead>Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user: IUser, index: number) => (
            <TableRow key={user.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.mobile_number}</TableCell>
              <TableCell>
                <Select
                  value={`${user.role_id}`}
                  onValueChange={(newRole) =>
                    handleRoleChange(`${user.id}`, newRole)
                  }
                  disabled={user.role.includes("admin")}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select Role' />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(
                      (
                        rol // UserRoleList is a constant array of roles
                      ) => (
                        <SelectItem key={rol?.id} value={`${rol?.roleNumber}`}>
                          {rol?.name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </TableCell>
              {hasSomePermissionsForPage("user", ["edit", "delete"]) && (
                <TableCell>
                  {hasRequiredPermission("user", "edit") && (
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleEdit(user)}
                      disabled={user.role === "admin"}>
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
                      disabled={user.role === "admin"}>
                      <Trash className='h-4 w-4' />
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6}>Total Users: {users.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <Input
              type='password'
              placeholder='Password'
              value={editData.password || ""}
              onChange={(e) =>
                setEditData({ ...editData, password: e.target.value })
              }
            />
            <Input
              placeholder='Email'
              value={editData.email || ""}
              onChange={(e) =>
                setEditData({ ...editData, email: e.target.value })
              }
            />
            <Input
              placeholder='Mobile Number'
              value={editData.mobile_number || ""}
              onChange={(e) =>
                setEditData({ ...editData, mobile_number: e.target.value })
              }
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {renderCreateUserModal()}
    </Card>
  );
}
