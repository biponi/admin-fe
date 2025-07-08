import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { ArrowLeft, Save, Loader2 } from "lucide-react";
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
    <div className='mx-auto px-2 py-6 w-[90vw] grid-cols-3'>
      <div className='flex items-center gap-4 mb-6'>
        <Button variant='outline' onClick={() => navigate("/roles")}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back to Roles
        </Button>
        <div>
          <h1 className='text-3xl font-bold'>Create Role</h1>
          <p className='text-muted-foreground mt-1'>
            Create a new role with specific permissions and settings
          </p>
        </div>
      </div>

      {error && (
        <Alert variant='destructive' className='mb-6'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the basic details for the new role.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Role Name *</Label>
                <Input
                  id='name'
                  placeholder='Enter role name'
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='active'>Status</Label>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='active'
                    checked={formData.active}
                    onCheckedChange={(checked) =>
                      handleInputChange("active", checked)
                    }
                  />
                  <Label htmlFor='active'>
                    {formData.active ? "Active" : "Inactive"}
                  </Label>
                </div>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                placeholder='Enter role description'
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>
              Define what actions this role can perform on different pages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {Object.entries(pagePermissions).map(
                ([pageName, permissions]) => (
                  <div key={pageName} className='border rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          id={`page-${pageName}`}
                          checked={isPageSelected(pageName)}
                          onCheckedChange={(checked) =>
                            handlePageToggle(pageName, checked as boolean)
                          }
                          className={
                            isPagePartiallySelected(pageName)
                              ? "data-[state=checked]:bg-orange-500"
                              : ""
                          }
                        />
                        <Label
                          htmlFor={`page-${pageName}`}
                          className='text-lg font-medium'>
                          {pageName}
                        </Label>
                      </div>
                      <span className='text-sm text-muted-foreground'>
                        {(currentPermissions[pageName] || []).length} /{" "}
                        {permissions.length} selected
                      </span>
                    </div>
                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 ml-6'>
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
                            className='text-sm capitalize'>
                            {permission.replace("_", " ")}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <div className='flex justify-end gap-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate("/roles")}>
            Cancel
          </Button>
          {hasRequiredPermission("role", "create") && (
            <Button type='submit' disabled={loading || !formData.name.trim()}>
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
  );
};

export default CreateRolePage;
