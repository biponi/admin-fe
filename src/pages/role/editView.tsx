import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Checkbox } from "../../components/ui/checkbox";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
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
      <div className='container mx-auto p-6 max-w-4xl'>
        <div className='flex justify-center items-center h-64'>
          <div className='flex items-center gap-2'>
            <Loader2 className='h-6 w-6 animate-spin' />
            <span>Loading role...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto p-6 max-w-4xl'>
        <div className='flex flex-col items-center justify-center h-64'>
          <p className='text-red-500 mb-4'>{error}</p>
          <Button onClick={() => navigate("/roles")}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Roles
          </Button>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className='container mx-auto p-6 max-w-4xl'>
        <div className='flex flex-col items-center justify-center h-64'>
          <p className='text-red-500 mb-4'>Role not found.</p>
          <Button onClick={() => navigate("/roles")}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Roles
          </Button>
        </div>
      </div>
    );
  }

  const currentPermissions = getPermissionsObject();

  return (
    <div className='mx-auto px-2 py-6  grid-cols-3'>
      <div className='flex items-center gap-4 mb-6'>
        <Button variant='outline' onClick={() => navigate("/roles")}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back to Roles
        </Button>
      </div>

      {error && (
        <Alert variant='destructive' className='mb-6'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className='space-y-6'>
        <Card>
          <CardHeader className='flex flex-row w-full justify-between items-center'>
            <CardTitle>Basic Information</CardTitle>
            <div className='flex justify-end gap-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => navigate("/roles")}>
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting || !formData.name?.trim()}>
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
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Role Name *</Label>
                <Input
                  id='name'
                  placeholder='Enter role name'
                  value={formData.name || ""}
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
                value={formData.description || ""}
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
          </CardHeader>
          <CardContent>
            <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4'>
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
      </form>
    </div>
  );
};

export default EditRolePage;
