import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Save, Loader2, ArrowLeft } from "lucide-react";
import { useRoles } from "./hooks/useRoleHook";
import { CreateRoleInput } from "./interface";
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
import useRoleCheck from "../auth/hooks/useRoleCheck";

const CreateRolePage: React.FC = () => {
  const navigate = useNavigate();
  const { hasRequiredPermission } = useRoleCheck();
  const { createRole, loading, error, clearError } = useRoles();

  const [formData, setFormData] = useState<CreateRoleInput>({
    name: "",
    description: "",
    active: true,
    permissions: [],
  });

  const handleInputChange = (
    field: keyof CreateRoleInput,
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

    if (!formData.name.trim()) {
      return;
    }

    const result = await createRole(formData);
    if (result) {
      navigate("/roles");
    }
  };

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
                  Create Role
                </h1>
                <p className='text-sm text-slate-500 mt-0.5'>
                  Define permissions and access controls
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
                Enter the basic details for the new role
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
                    value={formData.name}
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
                  value={formData.description}
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
                Define what actions this role can perform on different pages
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
            {hasRequiredPermission("role", "create") && (
              <Button
                type='submit'
                disabled={loading || !formData.name.trim()}
                className='bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200'>
                {loading ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className='h-4 w-4 mr-2' />
                    Create Role
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRolePage;
