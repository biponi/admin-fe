import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit,
  Shield,
  Calendar,
  User,
  Loader2,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Label } from "../../components/ui/label";

import { Permission } from "./interface";
import { useRole } from "./hooks/useRoleHook";
import { useNavigate, useParams } from "react-router-dom";
import { pagePermissions } from "../../utils/permissions";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import { PageHeader } from "../../components/PageHeader";

const ViewRolePage: React.FC = () => {
  const navigate = useNavigate();
  const { hasRequiredPermission } = useRoleCheck();
  const { id } = useParams<{ id: string }>();
  const { role, fetchRole } = useRole();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRole();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadRole = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchRole(id ?? "-1");
    } catch (error) {
      console.error("Error loading role:", error);
      setError("Failed to load role");
    } finally {
      setLoading(false);
    }
  };

  const getTotalPermissions = (permissions: Permission[]) => {
    return permissions.reduce((total, perm) => total + perm.actions.length, 0);
  };

  const getPermissionByPage = (permissions: Permission[], pageName: string) => {
    return permissions.find((perm) => perm.page === pageName);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex flex-col items-center justify-center py-20'>
            <div className='relative'>
              <div className='absolute inset-0 bg-primary/20 rounded-full animate-ping' />
              <div className='relative h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-sm'>
                <Loader2 className='h-8 w-8 text-primary-foreground animate-spin' />
              </div>
            </div>
            <p className='mt-6 text-lg font-semibold text-foreground'>
              Loading role...
            </p>
            <p className='text-[13px] text-slate-400 mt-1'>
              Please wait while we fetch the data
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !role) {
    return (
      <div>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex flex-col items-center justify-center py-20'>
            <div className='bg-rose-50 border border-rose-200 rounded-xl p-6 mb-4'>
              <p className='text-rose-600 mb-4'>{error || "Role not found"}</p>
              <Button
                onClick={() => navigate("/roles")}
                className='rounded-md border-slate-300 text-slate-600 hover:bg-accent hover:text-foreground hover:border-zinc-400'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Roles
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalPermissions = getTotalPermissions(role.permissions);

  return (
    <div>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 mobile:px-3 mobile:pb-[calc(5rem+env(safe-area-inset-bottom))]'>
        {/* Page Header */}
        <PageHeader
          icon={<ShieldCheck className='h-5 w-5 text-white' />}
          title='Role Details'
          subtitle='View role permissions and settings'
          count={
            <span className='rounded-md px-2.5 py-1 text-base font-semibold text-slate-500 tabular-nums'>
              #{role.roleNumber}
            </span>
          }
          actions={
            <>
              <Button
                variant='outline'
                size='sm'
                onClick={() => navigate("/roles")}
                className='rounded-md border-slate-300 text-slate-600 hover:bg-accent hover:text-foreground hover:border-zinc-400'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back
              </Button>
              {hasRequiredPermission("role", "edit") && (
                <Button
                  onClick={() => navigate(`/roles/${role.id}/edit`)}
                  className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-md'>
                  <Edit className='h-4 w-4 mr-2' />
                  Edit Role
                </Button>
              )}
            </>
          }
        />

        {/* Summary Strip */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
          {[
            {
              label: "Pages",
              value: role.permissions.length,
            },
            {
              label: "Permissions",
              value: totalPermissions,
            },
            {
              label: "Status",
              value: role.active ? "Active" : "Inactive",
            },
            {
              label: "Role #",
              value: `#${role.roleNumber}`,
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

        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 space-y-6'>
            {/* Role Information Card */}
            <Card className='rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(20,20,19,0.04)] overflow-hidden'>
              <CardHeader className='px-4 py-3 border-b border-slate-200 bg-muted/50 space-y-0.5'>
                <CardTitle className='flex items-center gap-2 text-[13px] font-semibold text-foreground'>
                  <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground'>
                    <Shield className='h-3.5 w-3.5' />
                  </span>
                  Role Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
                      Role Name
                    </Label>
                    <p className='text-base font-semibold text-foreground mt-1'>
                      {role.name}
                    </p>
                  </div>
                  <div>
                    <Label className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
                      Role Number
                    </Label>
                    <p className='text-base font-semibold text-foreground mt-1'>
                      #{role.roleNumber}
                    </p>
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
                      Role ID
                    </Label>
                    <p className='text-sm font-mono text-slate-400 mt-1'>
                      {role.id}
                    </p>
                  </div>
                  <div>
                    <Label className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
                      Status
                    </Label>
                    <div className='mt-1'>
                      <Badge
                        className={role.active
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"}>
                        {role.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
                    Description
                  </Label>
                  <p className='text-sm text-slate-600 mt-1'>
                    {role.description || "No description provided"}
                  </p>
                </div>
                <Separator className='my-4' />
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='flex items-center gap-3'>
                    <div className='h-8 w-8 rounded-lg bg-primary/10 border border-primary flex items-center justify-center'>
                      <Calendar className='h-4 w-4 text-primary' />
                    </div>
                    <div>
                      <Label className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
                        Created
                      </Label>
                      <p className='text-sm text-slate-600'>
                        {role.createdAt ? formatDate(role.createdAt) : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='h-8 w-8 rounded-lg bg-primary/10 border border-primary flex items-center justify-center'>
                      <Calendar className='h-4 w-4 text-primary' />
                    </div>
                    <div>
                      <Label className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
                        Last Updated
                      </Label>
                      <p className='text-sm text-slate-600'>
                        {role.updatedAt ? formatDate(role.updatedAt) : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Permissions Card */}
            <Card className='rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(20,20,19,0.04)] overflow-hidden'>
              <CardHeader className='px-4 py-3 border-b border-slate-200 bg-muted/50 space-y-0.5'>
                <CardTitle className='flex items-center gap-2 text-[13px] font-semibold text-foreground'>
                  <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground'>
                    <User className='h-3.5 w-3.5' />
                  </span>
                  Permissions
                  <Badge
                    variant='outline'
                    className='ml-2 rounded-md border-border bg-muted text-[10px] font-medium text-slate-500 tabular-nums'>
                    {totalPermissions} total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {role.permissions.map((permission) => (
                    <div
                      key={permission._id || permission.page}
                      className='rounded-md border border-slate-200 bg-white overflow-hidden'>
                      <div className='flex items-center justify-between px-3 py-2.5 border-b border-slate-100 bg-slate-50/70'>
                        <h3 className='text-[11px] font-semibold uppercase tracking-wider text-slate-500'>{permission.page}</h3>
                        <span className='text-[11px] text-slate-400 tabular-nums'>
                          {permission.actions.length} /{" "}
                          {pagePermissions[permission.page]?.length || 0}
                        </span>
                      </div>
                      <div className='flex flex-wrap gap-1.5 px-3 py-2.5'>
                        {permission.actions.map((action) => (
                          <Badge
                            key={action}
                            className='rounded-md border-border bg-muted text-[10px] font-medium text-slate-500'>
                            {action.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                  {role.permissions.length === 0 && (
                    <div className='text-center py-8'>
                      <p className='text-slate-500'>No permissions assigned to this role</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Quick Stats Card */}
            <Card className='rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(20,20,19,0.04)] overflow-hidden'>
              <CardHeader className='px-4 py-3 border-b border-slate-200 bg-muted/50'>
                <CardTitle className='flex items-center gap-2 text-[13px] font-semibold text-foreground'>
                  <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground'>
                    <Shield className='h-3.5 w-3.5' />
                  </span>
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='bg-muted/40 rounded-lg p-4'>
                  <div className='text-center'>
                    <div className='text-2xl font-semibold text-foreground tabular-nums'>
                      {role.permissions.length}
                    </div>
                    <p className='text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-1'>Pages with access</p>
                  </div>
                </div>
                <Separator />
                <div className='bg-muted/40 rounded-lg p-4'>
                  <div className='text-center'>
                    <div className='text-2xl font-semibold text-foreground tabular-nums'>
                      {totalPermissions}
                    </div>
                    <p className='text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-1'>Total permissions</p>
                  </div>
                </div>
                <Separator />
                <div className='bg-muted/40 rounded-lg p-4'>
                  <div className='text-center'>
                    <div className='text-2xl font-semibold text-foreground tabular-nums'>
                      {role.active ? "Active" : "Inactive"}
                    </div>
                    <p className='text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-1'>Current status</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Pages Card */}
            <Card className='rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(20,20,19,0.04)] overflow-hidden'>
              <CardHeader className='px-4 py-3 border-b border-slate-200 bg-muted/50'>
                <CardTitle className='flex items-center gap-2 text-[13px] font-semibold text-foreground'>
                  <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground'>
                    <Eye className='h-3.5 w-3.5' />
                  </span>
                  Available Pages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {Object.keys(pagePermissions).map((pageName) => {
                    const permission = getPermissionByPage(
                      role.permissions,
                      pageName
                    );
                    return (
                      <div
                        key={pageName}
                        className='flex items-center justify-between p-2 rounded-md hover:bg-slate-50 transition-colors'>
                        <span className='text-[13px] text-slate-600'>{pageName}</span>
                        <Badge
                          className={permission
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"}>
                          {permission ? "Granted" : "Not granted"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRolePage;
