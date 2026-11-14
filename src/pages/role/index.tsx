import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Shield,
  Crown,
  UserCheck,
  Calendar,
  MoreVertical,
  ShieldCheck,
} from "lucide-react";
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
import {
  MobilePage,
  MobileListCard,
  MobileStaggeredList,
  MobileStatTile,
  MobileStatRow,
  MobileEmptyState,
  MobileSkeletonList,
  MobilePagination,
  MobileActionSheet,
  rippleProps,
} from "../../components/mobile";
import { PageHeader } from "../../components/PageHeader";
import { InlineLoader } from "../../components/loaders";

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
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">(
    "all",
  );
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
  const [actionRole, setActionRole] = useState<(typeof roles)[number] | null>(
    null,
  );
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

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
        : [...prev, roleId],
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
      r.name.toLowerCase().includes("admin"),
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
    <div>
      {/* ═══════════ DESKTOP — unchanged ═══════════ */}
      <div className='hidden md:block'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
        {/* Page Header */}
        <PageHeader
          icon={<ShieldCheck className='h-5 w-5 text-white' />}
          title='Roles'
          subtitle='Manage user roles and permissions'
          count={
            <span className='text-base font-semibold text-slate-500 tabular-nums'>
              {stats.total} total
            </span>
          }
          actions={
            <>
              {hasRequiredPermission("role", "create") && (
                <button
                  onClick={() => navigate("/roles/create")}
                  className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors duration-150'>
                  <Plus className='h-4 w-4' />
                  Create Role
                </button>
              )}
            </>
          }
        />

        {/* Summary Strip */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
          {[
            {
              label: "Total Roles",
              value: stats.total,
            },
            {
              label: "Active",
              value: stats.active,
            },
            {
              label: "Inactive",
              value: stats.inactive,
            },
            {
              label: "Admin Roles",
              value: stats.admin,
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
            placeholder='Search by role name or description...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className='pl-10 h-10 bg-white border border-slate-200 focus:border-zinc-400 rounded-md text-sm shadow-sm'
          />
        </div>

        {/* Tabs */}
        <div className='bg-white rounded-xl border border-slate-200 shadow-[0_1px_2px_rgba(20,20,19,0.04)] overflow-hidden'>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as typeof activeTab)}
            className='w-full'>
            {/* Tab Bar */}
            <div className='border-b border-slate-200'>
              <TabsList className='h-auto bg-transparent p-0 gap-0 rounded-none flex justify-start'>
                <TabsTrigger
                  value='all'
                  className='relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-foreground data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'>
                  <Shield className='h-4 w-4' />
                  All Roles ({stats.total})
                </TabsTrigger>
                <TabsTrigger
                  value='active'
                  className='relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-foreground data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'>
                  <UserCheck className='h-4 w-4' />
                  Active ({stats.active})
                </TabsTrigger>
                <TabsTrigger
                  value='inactive'
                  className='relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-foreground data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'>
                  <Crown className='h-4 w-4' />
                  Inactive ({stats.inactive})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Bulk Actions */}
            {hasRequiredPermission("role", "delete") &&
              selectedRoles?.length > 0 && (
                <div className='bg-muted/50 border-b border-slate-200 px-4 py-3'>
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
                <InlineLoader domain='settings' text='Loading Roles' />
              ) : error ? (
                <div className='bg-rose-50 border border-rose-200 rounded-xl p-4 mb-4'>
                  <div className='flex items-center justify-between gap-4'>
                    <div className='flex items-center gap-2'>
                      <span className='text-rose-600 font-medium text-sm'>
                        Error:
                      </span>
                      <span className='text-rose-600 text-sm'>{error}</span>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={clearError}
                      className='h-8 text-xs'>
                      Dismiss
                    </Button>
                  </div>
                </div>
              ) : filteredRoles.length === 0 ? (
                <div className='py-20 px-4 text-center bg-white'>
                  <div className='mx-auto h-20 w-20 rounded-xl bg-muted ring-1 ring-border flex items-center justify-center mb-6'>
                    <Shield className='h-10 w-10 text-slate-400' />
                  </div>
                  <p className='text-base font-semibold text-foreground mb-2'>
                    No roles found
                  </p>
                  <p className='text-[13px] text-slate-500 mb-6 max-w-sm mx-auto'>
                    {searchTerm
                      ? "Try adjusting your search criteria"
                      : "Get started by creating your first role"}
                  </p>
                  {!searchTerm && hasRequiredPermission("role", "create") && (
                    <Button
                      onClick={() => navigate("/roles/create")}
                      className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-md'>
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
                            "group relative p-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(20,20,19,0.04)] transition-all duration-300 hover:border-zinc-400",
                            isDeleting && "opacity-50 pointer-events-none",
                          )}>
                          <div className='bg-slate-50/70'>
                            {/* Header with checkbox */}
                            <div className='flex items-start justify-between gap-2 border-b border-slate-200 p-4 bg-white'>
                              <div className='flex flex-1 items-start gap-3 min-w-0'>
                                {/* {hasRequiredPermission("role", "delete") && (
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() =>
                                      handleRoleSelect(role.id)
                                    }
                                    className='mt-1 shrink-0'
                                  />
                                )} */}

                                <div className='min-w-0 flex-1 pt-0.5'>
                                  <div className='mb-1 flex items-center gap-1.5'>
                                    <h3 className='truncate text-[15px] font-semibold leading-tight text-foreground uppercase'>
                                      {role.name}
                                    </h3>
                                    {role.name
                                      .toLowerCase()
                                      .includes("admin") && (
                                      <Crown className='h-3.5 w-3.5 shrink-0 text-amber-500' />
                                    )}
                                  </div>
                                  <p className='truncate text-xs leading-relaxed text-slate-500'>
                                    {role.description || "No description"}
                                  </p>
                                </div>
                              </div>

                              <Badge
                                variant={role.active ? "default" : "secondary"}
                                className={cn(
                                  "shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                                  role.active
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-slate-200 bg-slate-50 text-slate-500",
                                )}>
                                {role.active ? "Active" : "Inactive"}
                              </Badge>
                            </div>

                            {/* Permissions Preview */}
                            <div className='rounded-xl bg-slate-50/70 p-3'>
                              <p className='mb-2 text-[11px] font-medium uppercase tracking-widest text-slate-400'>
                                Permissions · {role.permissions.length}
                              </p>
                              <div className='flex flex-wrap gap-1.5'>
                                {role.permissions
                                  .slice(0, 3)
                                  .map((permission, index) => (
                                    <Badge
                                      key={index}
                                      variant='outline'
                                      className='rounded-md border-slate-200 bg-white px-2 py-0.5 text-[11px] font-normal text-slate-600'>
                                      {permission.page}
                                    </Badge>
                                  ))}
                                {role.permissions.length > 3 && (
                                  <Badge
                                    variant='outline'
                                    className='rounded-md border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-slate-500'>
                                    +{role.permissions.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Footer */}
                            <div className=' flex items-center justify-between gap-3 rounded-xl m-1.5 bg-white shadow-sm  border border-slate-100 px-3 py-2'>
                              <div className='flex items-center gap-1.5 text-[11px] text-slate-400'>
                                <Calendar className='h-3 w-3' />
                                <span className='truncate'>
                                  {formatDate(role.createdAt)}
                                </span>
                              </div>

                              {hasSomePermissionsForPage("role", [
                                "edit",
                                "delete",
                              ]) && (
                                <div className='flex items-center gap-1 shrink-0'>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={() => navigate(`/role/${role.id}`)}
                                    title='View'
                                    className='h-7 w-7 rounded-md text-slate-500 hover:bg-white hover:text-foreground hover:shadow-sm'>
                                    <Eye className='h-3.5 w-3.5' />
                                  </Button>
                                  {hasRequiredPermission("role", "edit") && (
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      onClick={() =>
                                        navigate(`/roles/${role.id}/edit`)
                                      }
                                      title='Edit'
                                      className='h-7 w-7 rounded-md text-slate-500 hover:bg-white hover:text-foreground hover:shadow-sm'>
                                      <Edit className='h-3.5 w-3.5' />
                                    </Button>
                                  )}
                                  {hasRequiredPermission("role", "delete") && (
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      onClick={() => {
                                        setRoleToDelete(role.id);
                                        setDeleteDialogOpen(true);
                                      }}
                                      title='Delete'
                                      className='h-7 w-7 rounded-lg text-rose-500 hover:bg-white hover:text-rose-700 hover:shadow-sm'>
                                      <Trash2 className='h-3.5 w-3.5' />
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
                        {Math.min(
                          currentPage * pageSize,
                          pagination.totalRoles,
                        )}{" "}
                        of {pagination.totalRoles} entries
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!pagination.hasPrev}
                          className='h-8 rounded-md text-xs border-slate-300 text-slate-600 hover:bg-accent hover:text-foreground hover:border-zinc-400'>
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
                                    currentPage === pageNum
                                      ? "default"
                                      : "outline"
                                  }
                                  size='sm'
                                  onClick={() => handlePageChange(pageNum)}
                                  className={cn(
                                    "h-8 w-8 rounded-md text-xs",
                                    currentPage === pageNum
                                      ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                                      : "border-slate-300 text-slate-600 hover:bg-accent hover:text-foreground hover:border-zinc-400",
                                  )}>
                                  {pageNum}
                                </Button>
                              );
                            },
                          )}
                        </div>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!pagination.hasNext}
                          className='h-8 rounded-md text-xs border-slate-300 text-slate-600 hover:bg-accent hover:text-foreground hover:border-zinc-400'>
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
      </div>

      {/* ═══════════ MOBILE — Material list + FAB + action sheet ═══════════ */}
      <div className='md:hidden'>
        <MobilePage
          title='Roles'
          icon={<ShieldCheck className='h-5 w-5' />}
          subtitle='Manage user roles and permissions'
          actions={
            hasRequiredPermission("role", "create") ? (
              <button
                onClick={() => navigate("/roles/create")}
                aria-label='Create role'
                className='m3-ripple grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm active:scale-95 transition-transform'
                {...rippleProps()}>
                <Plus className='h-5 w-5' />
              </button>
            ) : undefined
          }>
          <div className='px-4 pt-4 pb-2 space-y-4'>
            {/* Stat strip */}
            <MobileStatRow>
              <MobileStatTile label='Roles' value={stats.total} />
              <MobileStatTile
                label='Active'
                value={stats.active}
                icon={<UserCheck className='h-4 w-4' />}
                tone='bg-emerald-100 text-emerald-700'
              />
              <MobileStatTile
                label='Inactive'
                value={stats.inactive}
                tone='bg-slate-200 text-slate-600'
              />
              <MobileStatTile
                label='Admin'
                value={stats.admin}
                icon={<Crown className='h-4 w-4' />}
                tone='bg-amber-100 text-amber-700'
              />
            </MobileStatRow>

            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search roles…'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className='pl-10 h-10 rounded-full bg-card'
              />
            </div>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
              <TabsList className='w-full flex'>
                <TabsTrigger value='all' className='flex-1'>
                  All ({stats.total})
                </TabsTrigger>
                <TabsTrigger value='active' className='flex-1'>
                  Active ({stats.active})
                </TabsTrigger>
                <TabsTrigger value='inactive' className='flex-1'>
                  Inactive ({stats.inactive})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {error && (
              <div className='rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600'>
                {error}
              </div>
            )}

            {/* Role list */}
            {loading ? (
              <MobileSkeletonList count={5} />
            ) : filteredRoles.length === 0 ? (
              <MobileEmptyState
                icon={<Shield className='h-7 w-7' />}
                title='No roles found'
                description={
                  searchTerm
                    ? "Try adjusting your search criteria"
                    : "Get started by creating your first role"
                }
                action={
                  !searchTerm && hasRequiredPermission("role", "create") ? (
                    <Button
                      className='rounded-full'
                      onClick={() => navigate("/roles/create")}>
                      <Plus className='mr-2 h-4 w-4' /> Create role
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <MobileStaggeredList key={`${activeTab}-${currentPage}`}>
                {filteredRoles.map((role) => {
                  const isDeleting = deletingRoleId === role.id;
                  const isAdminRole = role.name
                    .toLowerCase()
                    .includes("admin");

                  return (
                    <MobileListCard
                      key={role.id}
                      className={cn(
                        isDeleting && "opacity-50 pointer-events-none",
                      )}
                      onClick={() => navigate(`/role/${role.id}`)}
                      leading={
                        <div className='grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary'>
                          {isAdminRole ? (
                            <Crown className='h-5 w-5 text-amber-500' />
                          ) : (
                            <Shield className='h-5 w-5' />
                          )}
                        </div>
                      }
                      title={
                        <span className='uppercase'>{role.name}</span>
                      }
                      subtitle={role.description || "No description"}
                      badge={
                        <Badge
                          variant={role.active ? "default" : "secondary"}
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                            role.active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-500",
                          )}>
                          {role.active ? "Active" : "Inactive"}
                        </Badge>
                      }
                      trailing={
                        <div className='flex items-center gap-1'>
                          <span className='text-[11px] text-muted-foreground'>
                            {role.permissions.length} perms
                          </span>
                          {hasSomePermissionsForPage("role", [
                            "edit",
                            "delete",
                          ]) && (
                            <button
                              onClick={() => {
                                setActionRole(role);
                                setActionSheetOpen(true);
                              }}
                              aria-label={`Actions for ${role.name}`}
                              className='m3-ripple grid h-9 w-9 place-items-center rounded-full text-muted-foreground'
                              {...rippleProps()}>
                              <MoreVertical className='h-4 w-4' />
                            </button>
                          )}
                        </div>
                      }>
                      <div className='mt-2 flex flex-wrap gap-1.5'>
                        {role.permissions.slice(0, 3).map((permission, i) => (
                          <Badge
                            key={i}
                            variant='outline'
                            className='rounded-md px-2 py-0.5 text-[11px] font-normal text-muted-foreground'>
                            {permission.page}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge
                            variant='outline'
                            className='rounded-md px-2 py-0.5 text-[11px] font-medium text-muted-foreground'>
                            +{role.permissions.length - 3}
                          </Badge>
                        )}
                      </div>
                      <div className='mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground'>
                        <Calendar className='h-3 w-3' />
                        {formatDate(role.createdAt)}
                      </div>
                    </MobileListCard>
                  );
                })}
              </MobileStaggeredList>
            )}

            {/* Pagination */}
            {!loading && !error && pagination && pagination.totalPages > 1 && (
              <MobilePagination
                page={currentPage}
                totalPages={pagination.totalPages}
                onChange={handlePageChange}
              />
            )}

            {/* Page size */}
            {!loading && !error && filteredRoles.length > 0 && (
              <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
                <span>Show</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={handlePageSizeChange}>
                  <SelectTrigger className='w-16 h-8 rounded-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='6'>6</SelectItem>
                    <SelectItem value='12'>12</SelectItem>
                    <SelectItem value='24'>24</SelectItem>
                    <SelectItem value='48'>48</SelectItem>
                  </SelectContent>
                </Select>
                <span>per page</span>
              </div>
            )}
          </div>
        </MobilePage>
      </div>

      {/* Row actions (mobile) */}
      <MobileActionSheet
        open={actionSheetOpen}
        onOpenChange={setActionSheetOpen}
        title={actionRole?.name}
        description={actionRole?.description || undefined}
        actions={[
          {
            icon: <Eye className='h-5 w-5' />,
            label: "View role",
            onClick: () => actionRole && navigate(`/role/${actionRole.id}`),
          },
          ...(hasRequiredPermission("role", "edit")
            ? [
                {
                  icon: <Edit className='h-5 w-5' />,
                  label: "Edit role",
                  onClick: () =>
                    actionRole && navigate(`/roles/${actionRole.id}/edit`),
                },
              ]
            : []),
          ...(hasRequiredPermission("role", "delete")
            ? [
                {
                  icon: <Trash2 className='h-5 w-5' />,
                  label: "Delete role",
                  destructive: true,
                  onClick: () => {
                    if (actionRole) {
                      setRoleToDelete(actionRole.id);
                      setDeleteDialogOpen(true);
                    }
                  },
                },
              ]
            : []),
        ]}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className='sm:max-w-[440px]'>
          <AlertDialogHeader>
            <div className='flex items-center gap-3 mb-3'>
              <div className='h-12 w-12 rounded-xl bg-rose-600 flex items-center justify-center shadow-sm'>
                <Trash2 className='h-6 w-6 text-white' />
              </div>
              <div>
                <AlertDialogTitle className='text-base font-semibold text-foreground'>
                  Delete Role
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className='text-sm text-slate-600 pl-1'>
              Are you sure you want to delete this role? This action will
              deactivate the role. The role will not be permanently deleted and
              can be reactivated later.
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
                <AlertDialogTitle className='text-base font-semibold text-foreground'>
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
