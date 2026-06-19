import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Shield, Save, Loader2, ArrowLeft } from "lucide-react";
import { useRole } from "./hooks/useRoleHook";
import { UpdateRoleInput } from "./interface";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Checkbox } from "../../components/ui/checkbox";
import { Badge } from "../../components/ui/badge";
import { pagePermissions } from "../../utils/permissions";

const EditRolePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { role, loading, error, updateRole, clearError, fetchRole } = useRole();

  const [formData, setFormData] = useState<UpdateRoleInput>({
    name: "",
    description: "",
    active: true,
    permissions: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRole(id);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Update form data when role is loaded
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        active: role.active,
        permissions: role.permissions || [],
      });
    }
  }, [role]);

  const handleInputChange = (
    field: keyof UpdateRoleInput,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) clearError();
  };

  // Convert permissions array to object format for easier handling
  const getPermissionsObject = () => {
    const permissionsObj: Record<string, string[]> = {};
    formData.permissions?.forEach((permission) => {
      permissionsObj[permission.page] = permission.actions;
    });
    return permissionsObj;
  };

  // Convert permissions object back to array format
  const setPermissionsFromObject = (
    permissionsObj: Record<string, string[]>
  ) => {
    const permissionsArray = Object.entries(permissionsObj).map(
      ([page, actions]) => ({
        page,
        actions,
      })
    );
    setFormData((prev) => ({
      ...prev,
      permissions: permissionsArray,
    }));
  };

  const handlePermissionChange = (
    pageName: string,
    permission: string,
    checked: boolean
  ) => {
    const currentPermissions = getPermissionsObject();
    const updatedPermissions = {
      ...currentPermissions,
      [pageName]: checked
        ? [...(currentPermissions[pageName] || []), permission]
        : (currentPermissions[pageName] || []).filter((p) => p !== permission),
    };
    setPermissionsFromObject(updatedPermissions);
  };

  const handlePageToggle = (pageName: string, checked: boolean) => {
    const currentPermissions = getPermissionsObject();
    const updatedPermissions = {
      ...currentPermissions,
      [pageName]: checked ? [...pagePermissions[pageName]] : [],
    };
    setPermissionsFromObject(updatedPermissions);
  };

  const isPageSelected = (pageName: string) => {
    const currentPermissions = getPermissionsObject();
    const rolePagePermissions = currentPermissions[pageName] || [];
    const allPagePermissions = pagePermissions[pageName] || [];
    return (
      rolePagePermissions.length === allPagePermissions.length &&
      allPagePermissions.every((p) => rolePagePermissions.includes(p))
    );
  };

  const isPagePartiallySelected = (pageName: string) => {
    const currentPermissions = getPermissionsObject();
    const rolePagePermissions = currentPermissions[pageName] || [];
    return rolePagePermissions.length > 0 && !isPageSelected(pageName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      return;
    }

    setIsSubmitting(true);
    const result = await updateRole(formData);
    setIsSubmitting(false);

    if (result) {
      navigate("/roles");
    }
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

  if (error && !role) {
    return (
      <div className='min-h-screen bg-slate-50/60'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex flex-col items-center justify-center py-20'>
            <div className='bg-rose-50 border border-rose-200 rounded-xl p-6 mb-4'>
              <p className='text-rose-600 mb-4'>{error}</p>
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

  if (!role) {
    return (
      <div className='min-h-screen bg-slate-50/60'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex flex-col items-center justify-center py-20'>
            <p className='text-rose-600 mb-4'>Role not found.</p>
            <Button
              onClick={() => navigate("/roles")}
              className='border-slate-200'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Roles
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentPermissions = getPermissionsObject();

  return (
    <div className='min-h-screen bg-slate-50/60'>
      <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
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
                <Shield className='h-5 w-5 text-white' />
              </div>
              <div>
                <h1 className='text-xl font-semibold text-slate-900 leading-tight'>
                  Edit Role
                </h1>
                <p className='text-sm text-slate-500 mt-0.5'>
                  Update role permissions and settings
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant='destructive' className='border-rose-200 bg-rose-50'>
            <AlertDescription className='text-rose-600'>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Basic Information Card */}
          <Card className='border-slate-100 shadow-sm'>
            <CardHeader>
              <CardTitle className='text-lg'>Basic Information</CardTitle>
              <CardDescription className='text-slate-500'>
                Update role details
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name' className='text-sm font-medium text-slate-700'>
                    Role Name <span className='text-rose-500'>*</span>
                  </Label>
                  <Input
                    id='name'
                    placeholder='e.g., Sales Manager'
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className='border-slate-200 focus:border-indigo-400'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='active' className='text-sm font-medium text-slate-700'>
                    Status
                  </Label>
                  <div className='flex items-center space-x-2 h-10'>
                    <Switch
                      id='active'
                      checked={formData.active}
                      onCheckedChange={(checked) =>
                        handleInputChange("active", checked)
                      }
                    />
                    <Label htmlFor='active' className='text-sm text-slate-600 cursor-pointer'>
                      {formData.active ? "Active" : "Inactive"}
                    </Label>
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description' className='text-sm font-medium text-slate-700'>
                  Description
                </Label>
                <Textarea
                  id='description'
                  placeholder='Briefly describe this role...'
                  value={formData.description || ""}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className='border-slate-200 focus:border-indigo-400 resize-none'
                />
              </div>
            </CardContent>
          </Card>

          {/* Permissions Card */}
          <Card className='border-slate-100 shadow-sm'>
            <CardHeader>
              <CardTitle className='text-lg'>Permissions</CardTitle>
              <CardDescription className='text-slate-500'>
                Manage what actions this role can perform on different pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {Object.entries(pagePermissions).map(
                  ([pageName, permissions]) => {
                    const selectedCount = (currentPermissions[pageName] || []).length;
                    const totalCount = permissions.length;

                    return (
                      <div
                        key={pageName}
                        className='border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors'>
                        <div className='flex items-center justify-between mb-4'>
                          <div className='flex items-center space-x-3'>
                            <Checkbox
                              id={`page-${pageName}`}
                              checked={isPageSelected(pageName)}
                              onCheckedChange={(checked) =>
                                handlePageToggle(pageName, checked as boolean)
                              }
                              className={
                                isPagePartiallySelected(pageName)
                                  ? "data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                                  : ""
                              }
                            />
                            <Label
                              htmlFor={`page-${pageName}`}
                              className='text-base font-semibold text-slate-900 cursor-pointer'>
                              {pageName}
                            </Label>
                          </div>
                          <Badge
                            variant='outline'
                            className='text-xs border-slate-200 text-slate-600'>
                            {selectedCount} / {totalCount}
                          </Badge>
                        </div>
                        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ml-9'>
                          {permissions.map((permission) => (
                            <div
                              key={permission}
                              className='flex items-center space-x-2'>
                              <Checkbox
                                id={`${pageName}-${permission}`}
                                checked={(
                                  currentPermissions[pageName] || []
                                ).includes(permission)}
                                onCheckedChange={(checked) =>
                                  handlePermissionChange(
                                    pageName,
                                    permission,
                                    checked as boolean
                                  )
                                }
                              />
                              <Label
                                htmlFor={`${pageName}-${permission}`}
                                className='text-sm text-slate-600 capitalize cursor-pointer'>
                                {permission.replace("_", " ")}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className='flex items-center justify-end gap-3 pt-4 border-t border-slate-100'>
            <Button
              type='button'
              variant='outline'
              onClick={() => navigate("/roles")}
              className='border-slate-200'>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting || !formData.name?.trim()}
              className='bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200'>
              {isSubmitting ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Updating...
                </>
              ) : (
                <>
                  <Save className='h-4 w-4 mr-2' />
                  Update Role
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRolePage;
