import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Eye, MoreHorizontal } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { useRoles } from "./hooks/useRoleHook";
import useRoleCheck from "../auth/hooks/useRoleCheck";

const RolesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();

  const {
    roles,
    loading,
    error,
    pagination,
    fetchRoles,
    deleteRole,
    bulkDeleteRoles,
    clearError,
  } = useRoles();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Search and filter handler
  const handleSearch = () => {
    const params = {
      page: 1,
      limit: pageSize,
      search: searchTerm.trim() || undefined,
      active: statusFilter === "all" ? undefined : statusFilter === "active",
    };
    fetchRoles(params);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = {
      page,
      limit: pageSize,
      search: searchTerm.trim() || undefined,
      active: statusFilter === "all" ? undefined : statusFilter === "active",
    };
    fetchRoles(params);
  };

  // Handle page size change
  const handlePageSizeChange = (size: string) => {
    const newSize = parseInt(size);
    setPageSize(newSize);
    setCurrentPage(1);
    const params = {
      page: 1,
      limit: newSize,
      search: searchTerm.trim() || undefined,
      active: statusFilter === "all" ? undefined : statusFilter === "active",
    };
    fetchRoles(params);
  };

  // Handle single role selection
  const handleRoleSelect = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  // Handle select all roles
  const handleSelectAll = () => {
    if (selectedRoles.length === roles.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(roles.map((role) => role.id));
    }
  };

  // Handle single delete
  const handleDelete = async () => {
    if (roleToDelete) {
      const success = await deleteRole(roleToDelete);
      if (success) {
        setDeleteDialogOpen(false);
        setRoleToDelete(null);
      }
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRoles.length > 0) {
      const success = await bulkDeleteRoles(selectedRoles);
      if (success) {
        setSelectedRoles([]);
        setBulkDeleteDialogOpen(false);
      }
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Initial load
  useEffect(() => {
    fetchRoles({ page: 1, limit: pageSize });
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-search on enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className=' mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'></div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span className='text-lg font-bold text-gray-900'>Filters</span>{" "}
            {hasRequiredPermission("role", "create") && (
              <Button
                onClick={() => navigate("/roles/create")}
                className='flex items-center gap-2'>
                <Plus className='w-4 h-4' />
                Create Role
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search roles...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className='pl-10'
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: "all" | "active" | "inactive") =>
                setStatusFilter(value)
              }>
              <SelectTrigger className='w-48'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Roles</SelectItem>
                <SelectItem value='active'>Active Only</SelectItem>
                <SelectItem value='inactive'>Inactive Only</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {hasRequiredPermission("role", "delete") && selectedRoles?.length > 0 && (
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-4'>
              <span className='text-sm text-muted-foreground'>
                {selectedRoles?.length} role(s) selected
              </span>
              <Button
                variant='destructive'
                size='sm'
                onClick={() => setBulkDeleteDialogOpen(true)}>
                <Trash2 className='w-4 h-4 mr-2' />
                Delete Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <CardTitle>Roles ({pagination?.totalRoles || 0})</CardTitle>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted-foreground'>Show</span>
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}>
                <SelectTrigger className='w-20'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='5'>5</SelectItem>
                  <SelectItem value='10'>10</SelectItem>
                  <SelectItem value='20'>20</SelectItem>
                  <SelectItem value='50'>50</SelectItem>
                </SelectContent>
              </Select>
              <span className='text-sm text-muted-foreground'>entries</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className='flex justify-center items-center h-32'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
          )}

          {error && (
            <div className='bg-destructive/15 border border-destructive/20 rounded-md p-4 mb-4'>
              <div className='flex items-center gap-2'>
                <span className='text-destructive font-medium'>Error:</span>
                <span className='text-destructive'>{error}</span>
                <Button variant='ghost' size='sm' onClick={clearError}>
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  {hasRequiredPermission("role", "delete") && (
                    <TableHead className='w-12'>
                      <Checkbox
                        checked={
                          selectedRoles.length === roles.length &&
                          roles.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  <TableHead>#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Created</TableHead>
                  {hasSomePermissionsForPage("role", ["edit", "delete"]) && (
                    <TableHead className='w-12'>Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    {hasRequiredPermission("role", "delete") && (
                      <TableCell>
                        <Checkbox
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={() => handleRoleSelect(role.id)}
                        />
                      </TableCell>
                    )}
                    <TableCell className='font-medium'>
                      {role.roleNumber}
                    </TableCell>
                    <TableCell>
                      <div className='font-medium'>{role.name}</div>
                    </TableCell>
                    <TableCell className='max-w-xs truncate'>
                      {role.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.active ? "default" : "secondary"}>
                        {role.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='flex gap-1'>
                        {role.permissions
                          .slice(0, 2)
                          .map((permission, index) => (
                            <Badge
                              key={index}
                              variant='outline'
                              className='text-xs'>
                              {permission.page}
                            </Badge>
                          ))}
                        {role.permissions.length > 2 && (
                          <Badge variant='outline' className='text-xs'>
                            +{role.permissions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(role.createdAt)}</TableCell>
                    {hasSomePermissionsForPage("role", ["edit", "delete"]) && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm'>
                              <MoreHorizontal className='w-4 h-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => navigate(`/role/${role.id}`)}>
                              <Eye className='w-4 h-4 mr-2' />
                              View
                            </DropdownMenuItem>
                            {hasRequiredPermission("role", "edit") && (
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/roles/${role.id}/edit`)
                                }>
                                <Edit className='w-4 h-4 mr-2' />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {hasRequiredPermission("role", "delete") && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setRoleToDelete(role.id);
                                  setDeleteDialogOpen(true);
                                }}
                                className='text-destructive'>
                                <Trash2 className='w-4 h-4 mr-2' />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && !error && roles.length === 0 && (
            <div className='text-center py-8'>
              <p className='text-muted-foreground'>No roles found.</p>
              <Button
                variant='outline'
                onClick={() => navigate("/roles/create")}
                className='mt-2'>
                Create your first role
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div className='text-sm text-muted-foreground'>
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, pagination.totalRoles)} of{" "}
                {pagination.totalRoles} entries
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrev}>
                  Previous
                </Button>
                <div className='flex items-center gap-1'>
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size='sm'
                          onClick={() => handlePageChange(pageNum)}>
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNext}>
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will deactivate the role. The role will not be
              permanently deleted and can be reactivated later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Roles</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRoles.length} role(s)?
              This action will deactivate the selected roles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RolesListPage;
