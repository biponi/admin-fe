import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  ShieldCheck,
  KeyRound,
  Save,
  Loader2,
  ArrowLeft,
} from "lucide-react";
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
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../components/ui/accordion";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Checkbox } from "../../components/ui/checkbox";
import { pagePermissions, OWN_ONLY_ELIGIBLE } from "../../utils/permissions";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import { PageHeader } from "../../components/PageHeader";

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

  // Map of page -> ownOnly actions (subset of that page's selected actions)
  const getOwnOnlyObject = () => {
    const ownOnlyObj: Record<string, string[]> = {};
    formData.permissions?.forEach((permission) => {
      if (permission.ownOnly?.length) {
        ownOnlyObj[permission.page] = permission.ownOnly;
      }
    });
    return ownOnlyObj;
  };

  // Convert permissions object back to array format, preserving existing
  // ownOnly entries and pruning any that are no longer among the actions
  const setPermissionsFromObject = (
    permissionsObj: Record<string, string[]>
  ) => {
    const previousOwnOnly = getOwnOnlyObject();
    const permissionsArray = Object.entries(permissionsObj).map(
      ([page, actions]) => ({
        page,
        actions,
        ownOnly: (previousOwnOnly[page] || []).filter((a) =>
          actions.includes(a)
        ),
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

  // "own only" is only offered for ownership-aware pages/actions
  const isOwnOnlyEligible = (pageName: string, permission: string) =>
    (OWN_ONLY_ELIGIBLE[pageName] || []).includes(permission);

  const handleOwnOnlyChange = (
    pageName: string,
    permission: string,
    checked: boolean
  ) => {
    const currentOwnOnly = getOwnOnlyObject();
    const updatedOwnOnly = {
      ...currentOwnOnly,
      [pageName]: checked
        ? [...(currentOwnOnly[pageName] || []), permission]
        : (currentOwnOnly[pageName] || []).filter((p) => p !== permission),
    };

    const currentPermissions = getPermissionsObject();
    const permissionsArray = Object.entries(currentPermissions).map(
      ([page, actions]) => ({
        page,
        actions,
        ownOnly: updatedOwnOnly[page] || [],
      })
    );
    setFormData((prev) => ({
      ...prev,
      permissions: permissionsArray,
    }));
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
  const currentOwnOnly = getOwnOnlyObject();

  return (
    <div>
      <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 mobile:px-3 mobile:pb-[calc(5rem+env(safe-area-inset-bottom))]'>
        {/* Page Header */}
        <PageHeader
          icon={<ShieldCheck className='h-5 w-5 text-white' />}
          title='Create Role'
          subtitle='Define permissions and access controls'
          actions={
            <Button
              variant='outline'
              size='sm'
              onClick={() => navigate("/roles")}
              className='rounded-md border-slate-300 text-slate-600 hover:bg-accent hover:text-foreground hover:border-zinc-400'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back
            </Button>
          }
        />

        {error && (
          <Alert variant='destructive' className='border-rose-200 bg-rose-50'>
            <AlertDescription className='text-rose-600'>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Basic Information Card */}
          <Card className='rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(20,20,19,0.04)] overflow-hidden'>
            <CardHeader className='px-4 py-3 border-b border-slate-200 bg-muted/50 space-y-0.5'>
              <CardTitle className='flex items-center gap-2 text-[13px] font-semibold text-foreground'>
                <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground'>
                  <Shield className='h-3.5 w-3.5' />
                </span>
                Basic Information
              </CardTitle>
              <CardDescription className='text-[11px] text-slate-400'>
                Enter the basic details for the new role
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name' className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
                    Role Name <span className='text-rose-500'>*</span>
                  </Label>
                  <Input
                    id='name'
                    placeholder='e.g., Sales Manager'
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className='rounded-md border-slate-200 bg-white text-[13px] focus:border-zinc-400'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='active' className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
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
                    <Label htmlFor='active' className='text-[13px] text-slate-600 cursor-pointer'>
                      {formData.active ? "Active" : "Inactive"}
                    </Label>
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description' className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
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
                  className='rounded-md border-slate-200 bg-white text-[13px] focus:border-zinc-400 resize-none'
                />
              </div>
            </CardContent>
          </Card>

          {/* Permissions Card */}
          <Card className='rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(20,20,19,0.04)] overflow-hidden'>
            <CardHeader className='px-4 py-3 border-b border-slate-200 bg-muted/50 space-y-0.5'>
              <CardTitle className='flex items-center gap-2 text-[13px] font-semibold text-foreground'>
                <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground'>
                  <KeyRound className='h-3.5 w-3.5' />
                </span>
                Permissions
              </CardTitle>
              <CardDescription className='text-[11px] text-slate-400'>
                Define what actions this role can perform on different pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion
                type='multiple'
                defaultValue={Object.keys(pagePermissions)}
                className='space-y-2'>
                {Object.entries(pagePermissions).map(
                  ([pageName, permissions]) => {
                    const selectedCount = (currentPermissions[pageName] || []).length;
                    const totalCount = permissions.length;

                    return (
                      <AccordionItem
                        key={pageName}
                        value={pageName}
                        className='rounded-md border border-slate-200 bg-white overflow-hidden last:border-b'>
                        <AccordionTrigger className='px-3 py-2.5 hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:border-slate-100'>
                          <div className='flex items-center justify-between w-full mr-2'>
                            <div
                              className='flex items-center gap-2.5'
                              onClick={(e) => e.stopPropagation()}>
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
                                className='text-[11px] font-semibold uppercase tracking-wider text-slate-500 cursor-pointer'>
                                {pageName}
                              </Label>
                            </div>
                            <span className='text-[11px] text-slate-400 tabular-nums'>
                              {selectedCount} / {totalCount}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className='px-3 pb-3 pt-1'>
                          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
                            {permissions.map((permission) => {
                              const isActionChecked = (
                                currentPermissions[pageName] || []
                              ).includes(permission);
                              const ownOnlyChecked = (
                                currentOwnOnly[pageName] || []
                              ).includes(permission);

                              return (
                                <div key={permission} className='space-y-1'>
                                  <div className='flex items-center space-x-2'>
                                    <Checkbox
                                      id={`${pageName}-${permission}`}
                                      checked={isActionChecked}
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
                                      className='text-[13px] text-slate-600 capitalize cursor-pointer'>
                                      {permission.replace("_", " ")}
                                    </Label>
                                    {isOwnOnlyEligible(pageName, permission) && (
                                      <span
                                        className={
                                          isActionChecked
                                            ? "inline-flex items-center gap-1 text-xs text-slate-400"
                                            : "inline-flex items-center gap-1 text-xs text-slate-300"
                                        }
                                        title='Restrict to orders this role member created themselves'>
                                        <Switch
                                          id={`${pageName}-${permission}-ownonly`}
                                          checked={ownOnlyChecked}
                                          disabled={!isActionChecked}
                                          onCheckedChange={(checked) =>
                                            handleOwnOnlyChange(
                                              pageName,
                                              permission,
                                              checked
                                            )
                                          }
                                          className='scale-75'
                                        />
                                        own only
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  }
                )}
              </Accordion>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className='flex items-center justify-end gap-3 pt-4 border-t border-slate-200/70 mobile:sticky mobile:bottom-0 mobile:z-20 mobile:-mx-3 mobile:bg-background/95 mobile:backdrop-blur mobile:px-4 mobile:pt-2 mobile:pb-[calc(0.5rem+env(safe-area-inset-bottom))] mobile:border-t'>
            <Button
              type='button'
              variant='outline'
              onClick={() => navigate("/roles")}
              className='rounded-md border-slate-300 text-slate-600 hover:bg-accent hover:text-foreground hover:border-zinc-400 mobile:flex-1 mobile:h-10'>
              Cancel
            </Button>
            {hasRequiredPermission("role", "create") && (
              <Button
                type='submit'
                disabled={loading || !formData.name.trim()}
                className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-md mobile:flex-[2] mobile:h-10'>
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
