import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Eye, Shield, Crown, UserCheck, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
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
import { cn } from "../../lib/utils";

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
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">("all");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);

  // Search and filter handler
  const handleSearch = () => {
    const params = {
      page: 1,
      limit: pageSize,
      search: searchTerm.trim() || undefined,
      active: activeTab === "all" ? undefined : activeTab === "active",
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
      active: activeTab === "all" ? undefined : activeTab === "active",
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
      active: activeTab === "all" ? undefined : activeTab === "active",
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
      setDeletingRoleId(roleToDelete);
      const success = await deleteRole(roleToDelete);
      if (success) {
        setDeleteDialogOpen(false);
        setRoleToDelete(null);
        setDeletingRoleId(null);
      }
      setDeletingRoleId(null);
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

  // Get role stats
  const getRoleStats = () => {
    const activeCount = roles.filter((r) => r.active).length;
    const inactiveCount = roles.length - activeCount;
    const adminCount = roles.filter((r) =>
      r.name.toLowerCase().includes("admin")
    ).length;

    return {
      total: roles.length,
      active: activeCount,
      inactive: inactiveCount,
      admin: adminCount,
    };
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

  // Filter roles based on active tab
  const filteredRoles = roles.filter((role) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return role.active;
    if (activeTab === "inactive") return !role.active;
    return true;
  });

  const stats = getRoleStats();

  return (
    <div className='min-h-screen bg-slate-50/60'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
        {/* Page Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200'>
              <Shield className='h-5 w-5 text-white' />
            </div>
            <div>
              <h1 className='text-xl font-semibold text-slate-900 leading-tight'>
                Role Management
              </h1>
              <p className='text-sm text-slate-500 mt-0.5'>
                Manage user roles and permissions
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {hasRequiredPermission("role", "create") && (
              <button
                onClick={() => navigate("/roles/create")}
                className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-150 shadow-sm shadow-indigo-200'>
                <Plus className='h-4 w-4' />
                Create Role
              </button>
            )}
          </div>
        </div>

        {/* Summary Strip */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
          {[
            {
              label: "Total Roles",
              value: stats.total,
              accent: "text-indigo-600",
              bg: "bg-indigo-50",
            },
            {
              label: "Active",
              value: stats.active,
              accent: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: "Inactive",
              value: stats.inactive,
              accent: "text-slate-600",
              bg: "bg-slate-50",
            },
            {
              label: "Admin Roles",
              value: stats.admin,
              accent: "text-rose-600",
              bg: "bg-rose-50",
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
            placeholder='Search by role name or description...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className='pl-10 h-10 bg-white border border-slate-200 focus:border-indigo-400 rounded-lg text-sm shadow-sm'
          />
        </div>

        {/* Tabs */}
        <div className='bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden'>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as typeof activeTab)}
            className='w-full'>
            {/* Tab Bar */}
            <div className='border-b border-slate-100'>
              <TabsList className='h-auto bg-transparent p-0 gap-0 rounded-none flex justify-start'>
                <TabsTrigger
                  value='all'
                  className='relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'>
                  <Shield className='h-4 w-4' />
                  All Roles ({stats.total})
                </TabsTrigger>
                <TabsTrigger
                  value='active'
                  className='relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'>
                  <UserCheck className='h-4 w-4' />
                  Active ({stats.active})
                </TabsTrigger>
                <TabsTrigger
                  value='inactive'
                  className='relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'>
                  <Crown className='h-4 w-4' />
                  Inactive ({stats.inactive})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Bulk Actions */}
            {hasRequiredPermission("role", "delete") && selectedRoles?.length > 0 && (
              <div className='bg-slate-50 border-b border-slate-100 px-4 py-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Checkbox
                      checked={selectedRoles.length === filteredRoles.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className='text-sm text-slate-600'>
                      {selectedRoles?.length} role(s) selected
                    </span>
                  </div>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => setBulkDeleteDialogOpen(true)}
                    className='h-8 text-xs'>
                    <Trash2 className='w-3 h-3 mr-1.5' />
                    Delete Selected
                  </Button>
                </div>
              </div>
            )}

            {/* Tab Content */}
            <TabsContent
              value={activeTab}
              className='p-4 sm:p-6 mt-0 focus-visible:outline-none'>
              {loading ? (
                <div className='flex flex-col items-center justify-center py-20 px-4'>
                  <div className='relative'>
                    <div className='absolute inset-0 bg-indigo-500/20 rounded-full animate-ping' />
                    <div className='relative h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg'>
                      <Loader2 className='h-8 w-8 text-white animate-spin' />
                    </div>
                  </div>
                  <p className='mt-6 text-lg font-semibold text-slate-900'>
                    Loading roles...
                  </p>
                  <p className='text-sm text-slate-500 mt-1'>
                    Please wait while we fetch the data
                  </p>
                </div>
              ) : error ? (
                <div className='bg-rose-50 border border-rose-200 rounded-xl p-4 mb-4'>
                  <div className='flex items-center justify-between gap-4'>
                    <div className='flex items-center gap-2'>
                      <span className='text-rose-600 font-medium text-sm'>Error:</span>
                      <span className='text-rose-600 text-sm'>{error}</span>
                    </div>
                    <Button variant='ghost' size='sm' onClick={clearError} className='h-8 text-xs'>
                      Dismiss
                    </Button>
                  </div>
                </div>
              ) : filteredRoles.length === 0 ? (
                <div className='py-20 px-4 text-center bg-white rounded-2xl'>
                  <div className='mx-auto h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6'>
                    <Shield className='h-10 w-10 text-slate-400' />
                  </div>
                  <p className='text-xl font-bold text-slate-900 mb-2'>
                    No roles found
                  </p>
                  <p className='text-sm text-slate-500 mb-6 max-w-sm mx-auto'>
                    {searchTerm
                      ? "Try adjusting your search criteria"
                      : "Get started by creating your first role"}
                  </p>
                  {!searchTerm && hasRequiredPermission("role", "create") && (
                    <Button
                      onClick={() => navigate("/roles/create")}
                      className='bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200'>
                      <Plus className='mr-2 h-4 w-4' />
                      Create First Role
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {filteredRoles.map((role) => {
                      const isSelected = selectedRoles.includes(role.id);
                      const isDeleting = deletingRoleId === role.id;

                      return (
                        <Card
                          key={role.id}
                          className={cn(
                            "group relative overflow-hidden transition-all duration-200 hover:shadow-md border border-slate-100",
                            isDeleting && "opacity-50 pointer-events-none",
                          )}>
                          <div className='p-5'>
                            {/* Header with checkbox */}
                            <div className='flex items-start justify-between mb-4'>
                              <div className='flex items-center gap-3 flex-1'>
                                {hasRequiredPermission("role", "delete") && (
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => handleRoleSelect(role.id)}
                                    className='mt-1'
                                  />
                                )}
                                <div className='flex-1 min-w-0'>
                                  <div className='flex items-center gap-2 mb-1'>
                                    <h3 className='text-base font-semibold text-slate-900 truncate'>
                                      {role.name}
                                    </h3>
                                    {role.name.toLowerCase().includes("admin") && (
                                      <Crown className='h-3.5 w-3.5 text-rose-500 flex-shrink-0' />
                                    )}
                                  </div>
                                  <p className='text-xs text-slate-500 line-clamp-2'>
                                    {role.description || "No description"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className='mb-3'>
                              <Badge
                                variant={role.active ? "default" : "secondary"}
                                className={cn(
                                  "text-xs",
                                  role.active
                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                    : "bg-slate-100 text-slate-600 border-slate-200",
                                )}>
                                {role.active ? "Active" : "Inactive"}
                              </Badge>
                            </div>

                            {/* Permissions Preview */}
                            <div className='mb-4'>
                              <p className='text-xs font-medium text-slate-600 mb-2'>
                                Permissions ({role.permissions.length})
                              </p>
                              <div className='flex flex-wrap gap-1.5'>
                                {role.permissions.slice(0, 3).map((permission, index) => (
                                  <Badge
                                    key={index}
                                    variant='outline'
                                    className='text-xs border-slate-200 text-slate-600'>
                                    {permission.page}
                                  </Badge>
                                ))}
                                {role.permissions.length > 3 && (
                                  <Badge variant='outline' className='text-xs border-slate-200 text-slate-600'>
                                    +{role.permissions.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Footer */}
                            <div className='flex items-center justify-between pt-3 border-t border-slate-100'>
                              <p className='text-xs text-slate-500'>
                                Created {formatDate(role.createdAt)}
                              </p>
                              {hasSomePermissionsForPage("role", ["edit", "delete"]) && (
                                <div className='flex items-center gap-1'>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => navigate(`/role/${role.id}`)}
                                    className='h-7 px-2 text-xs text-slate-600 hover:text-slate-900'>
                                    <Eye className='h-3 w-3 mr-1' />
                                    View
                                  </Button>
                                  {hasRequiredPermission("role", "edit") && (
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() => navigate(`/roles/${role.id}/edit`)}
                                      className='h-7 px-2 text-xs text-slate-600 hover:text-slate-900'>
                                      <Edit className='h-3 w-3 mr-1' />
                                      Edit
                                    </Button>
                                  )}
                                  {hasRequiredPermission("role", "delete") && (
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() => {
                                        setRoleToDelete(role.id);
                                        setDeleteDialogOpen(true);
                                      }}
                                      className='h-7 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50'>
                                      <Trash2 className='h-3 w-3 mr-1' />
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

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className='mt-6 flex items-center justify-between'>
                      <div className='text-sm text-slate-500'>
                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(currentPage * pageSize, pagination.totalRoles)} of{" "}
                        {pagination.totalRoles} entries
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!pagination.hasPrev}
                          className='h-8 text-xs'>
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
                                  onClick={() => handlePageChange(pageNum)}
                                  className={cn(
                                    'h-8 w-8 text-xs',
                                    currentPage === pageNum && 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                  )}>
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
                          disabled={!pagination.hasNext}
                          className='h-8 text-xs'>
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Page Size Selector */}
        {!loading && !error && filteredRoles.length > 0 && (
          <div className='flex items-center justify-center gap-2 text-sm'>
            <span className='text-slate-500'>Show</span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}>
              <SelectTrigger className='w-16 h-8'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='6'>6</SelectItem>
                <SelectItem value='12'>12</SelectItem>
                <SelectItem value='24'>24</SelectItem>
                <SelectItem value='48'>48</SelectItem>
              </SelectContent>
            </Select>
            <span className='text-slate-500'>per page</span>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className='sm:max-w-[440px]'>
          <AlertDialogHeader>
            <div className='flex items-center gap-3 mb-3'>
              <div className='h-12 w-12 rounded-xl bg-rose-600 flex items-center justify-center shadow-sm'>
                <Trash2 className='h-6 w-6 text-white' />
              </div>
              <div>
                <AlertDialogTitle className='text-xl font-semibold text-slate-900'>
                  Delete Role
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className='text-sm text-slate-600 pl-1'>
              Are you sure you want to delete this role? This action will deactivate the role.
              The role will not be permanently deleted and can be reactivated later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='gap-2 sm:gap-0'>
            <AlertDialogCancel className='h-10 border border-slate-200'>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='h-10 bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-200'>
              <Trash2 className='mr-2 h-4 w-4' />
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent className='sm:max-w-[440px]'>
          <AlertDialogHeader>
            <div className='flex items-center gap-3 mb-3'>
              <div className='h-12 w-12 rounded-xl bg-rose-600 flex items-center justify-center shadow-sm'>
                <Trash2 className='h-6 w-6 text-white' />
              </div>
              <div>
                <AlertDialogTitle className='text-xl font-semibold text-slate-900'>
                  Delete Multiple Roles
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className='text-sm text-slate-600 pl-1'>
              Are you sure you want to delete {selectedRoles.length} role(s)?
              This action will deactivate the selected roles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='gap-2 sm:gap-0'>
            <AlertDialogCancel className='h-10 border border-slate-200'>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className='h-10 bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-200'>
              <Trash2 className='mr-2 h-4 w-4' />
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RolesListPage;
