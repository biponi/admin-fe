import React, { useState, useEffect } from "react";
import { ArrowLeft, Edit, Shield, Calendar, User, Loader2, Eye } from "lucide-react";
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
      <div className='min-h-screen bg-slate-50/60'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex flex-col items-center justify-center py-20'>
            <div className='relative'>
              <div className='absolute inset-0 bg-indigo-500/20 rounded-full animate-ping' />
              <div className='relative h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg'>
                <Loader2 className='h-8 w-8 text-white animate-spin' />
              </div>
            </div>
            <p className='mt-6 text-lg font-semibold text-slate-900'>
              Loading role...
            </p>
            <p className='text-sm text-slate-500 mt-1'>
              Please wait while we fetch the data
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className='min-h-screen bg-slate-50/60'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex flex-col items-center justify-center py-20'>
            <div className='bg-rose-50 border border-rose-200 rounded-xl p-6 mb-4'>
              <p className='text-rose-600 mb-4'>{error || "Role not found"}</p>
              <Button
                onClick={() => navigate("/roles")}
                className='border-slate-200'>
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
    <div className='min-h-screen bg-slate-50/60'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
        {/* Page Header */}
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => navigate("/roles")}
              className='border-slate-200'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back
            </Button>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200'>
                <Eye className='h-5 w-5 text-white' />
              </div>
              <div>
                <h1 className='text-xl font-semibold text-slate-900 leading-tight'>
                  Role Details
                </h1>
                <p className='text-sm text-slate-500 mt-0.5'>
                  View role permissions and settings
                </p>
              </div>
            </div>
          </div>
          {hasRequiredPermission("role", "edit") && (
            <Button
              onClick={() => navigate(`/roles/${role.id}/edit`)}
              className='bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200'>
              <Edit className='h-4 w-4 mr-2' />
              Edit Role
            </Button>
          )}
        </div>

        {/* Summary Strip */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
          {[
            {
              label: "Pages",
              value: role.permissions.length,
              accent: "text-indigo-600",
              bg: "bg-indigo-50",
            },
            {
              label: "Permissions",
              value: totalPermissions,
              accent: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: "Status",
              value: role.active ? "Active" : "Inactive",
              accent: role.active ? "text-emerald-600" : "text-slate-600",
              bg: role.active ? "bg-emerald-50" : "bg-slate-50",
            },
            {
              label: "Role #",
              value: `#${role.roleNumber}`,
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

        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 space-y-6'>
            {/* Role Information Card */}
            <Card className='border-slate-100 shadow-sm'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Shield className='h-5 w-5 text-indigo-600' />
                  Role Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-slate-500'>
                      Role Name
                    </Label>
                    <p className='text-base font-semibold text-slate-900 mt-1'>
                      {role.name}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-slate-500'>
                      Role Number
                    </Label>
                    <p className='text-base font-semibold text-slate-900 mt-1'>
                      #{role.roleNumber}
                    </p>
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-slate-500'>
                      Role ID
                    </Label>
                    <p className='text-sm font-mono text-slate-400 mt-1'>
                      {role.id}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-slate-500'>
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
                  <Label className='text-sm font-medium text-slate-500'>
                    Description
                  </Label>
                  <p className='text-sm text-slate-700 mt-1'>
                    {role.description || "No description provided"}
                  </p>
                </div>
                <Separator className='my-4' />
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='flex items-center gap-3'>
                    <div className='h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center'>
                      <Calendar className='h-4 w-4 text-indigo-600' />
                    </div>
                    <div>
                      <Label className='text-sm font-medium text-slate-500'>
                        Created
                      </Label>
                      <p className='text-sm text-slate-700'>
                        {role.createdAt ? formatDate(role.createdAt) : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center'>
                      <Calendar className='h-4 w-4 text-indigo-600' />
                    </div>
                    <div>
                      <Label className='text-sm font-medium text-slate-500'>
                        Last Updated
                      </Label>
                      <p className='text-sm text-slate-700'>
                        {role.updatedAt ? formatDate(role.updatedAt) : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Permissions Card */}
            <Card className='border-slate-100 shadow-sm'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <User className='h-5 w-5 text-indigo-600' />
                  Permissions
                  <Badge
                    variant='outline'
                    className='ml-2 border-indigo-200 text-indigo-600'>
                    {totalPermissions} total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {role.permissions.map((permission) => (
                    <div
                      key={permission._id || permission.page}
                      className='border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors'>
                      <div className='flex items-center justify-between mb-3'>
                        <h3 className='font-semibold text-slate-900'>{permission.page}</h3>
                        <Badge
                          variant='outline'
                          className='text-xs border-slate-200 text-slate-600'>
                          {permission.actions.length} /{" "}
                          {pagePermissions[permission.page]?.length || 0}
                        </Badge>
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        {permission.actions.map((action) => (
                          <Badge
                            key={action}
                            className='text-xs bg-indigo-50 text-indigo-700 border-indigo-200'>
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
            <Card className='border-slate-100 shadow-sm'>
              <CardHeader>
                <CardTitle className='text-base'>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='bg-slate-50 rounded-lg p-4'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-indigo-600'>
                      {role.permissions.length}
                    </div>
                    <p className='text-sm text-slate-500 mt-1'>Pages with access</p>
                  </div>
                </div>
                <Separator />
                <div className='bg-slate-50 rounded-lg p-4'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-emerald-600'>
                      {totalPermissions}
                    </div>
                    <p className='text-sm text-slate-500 mt-1'>Total permissions</p>
                  </div>
                </div>
                <Separator />
                <div className='bg-slate-50 rounded-lg p-4'>
                  <div className='text-center'>
                    <div
                      className={`text-2xl font-bold ${
                        role.active ? "text-emerald-600" : "text-slate-600"
                      }`}>
                      {role.active ? "Active" : "Inactive"}
                    </div>
                    <p className='text-sm text-slate-500 mt-1'>Current status</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Pages Card */}
            <Card className='border-slate-100 shadow-sm'>
              <CardHeader>
                <CardTitle className='text-base'>Available Pages</CardTitle>
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
                        className='flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors'>
                        <span className='text-sm text-slate-700'>{pageName}</span>
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
