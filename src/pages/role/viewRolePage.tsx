import React, { useState, useEffect } from "react";
import { ArrowLeft, Edit, Shield, Calendar, User, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";

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
  // In real app, get roleId from useParams()

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

  if (error || !role) {
    return (
      <div className='container mx-auto p-6 max-w-4xl'>
        <div className='flex flex-col items-center justify-center h-64'>
          <p className='text-red-500 mb-4'>{error || "Role not found"}</p>
          <Button onClick={() => navigate("/roles")}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Roles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className=' mx-auto p-6 w-[91vw]'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <Button variant='outline' onClick={() => navigate("/roles")}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Roles
          </Button>
        </div>
        {hasRequiredPermission("role", "edit") && (
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={() => navigate(`/roles/${role.id}/edit`)}>
              <Edit className='h-4 w-4 mr-2' />
              Edit
            </Button>
          </div>
        )}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5' />
                Role Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    Role Name
                  </Label>
                  <p className='text-lg font-semibold'>{role.name}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    Role Number
                  </Label>
                  <p className='text-lg font-semibold'>#{role.roleNumber}</p>
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    Role ID
                  </Label>
                  <p className='text-sm font-mono text-muted-foreground'>
                    {role.id}
                  </p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    Status
                  </Label>
                  <div className='mt-1'>
                    <Badge variant={role.active ? "default" : "secondary"}>
                      {role.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <Label className='text-sm font-medium text-muted-foreground'>
                  Description
                </Label>
                <p className='mt-1'>
                  {role.description || "No description provided"}
                </p>
              </div>
              <Separator />
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Created
                    </Label>
                    <p className='text-sm'>
                      {role.createdAt ? formatDate(role.createdAt) : "N/A"}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Last Updated
                    </Label>
                    <p className='text-sm'>
                      {role.updatedAt ? formatDate(role.updatedAt) : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5' />
                Permissions
                <Badge variant='secondary' className='ml-2'>
                  {getTotalPermissions(role.permissions)} total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {role.permissions.map((permission) => (
                  <div
                    key={permission._id || permission.page}
                    className='border rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-3'>
                      <h3 className='font-medium text-lg'>{permission.page}</h3>
                      <Badge variant='outline'>
                        {permission.actions.length} /{" "}
                        {pagePermissions[permission.page]?.length || 0}{" "}
                        permissions
                      </Badge>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {permission.actions.map((action) => (
                        <Badge
                          key={action}
                          variant='secondary'
                          className='text-xs'>
                          {action.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
                {role.permissions.length === 0 && (
                  <p className='text-center text-muted-foreground py-8'>
                    No permissions assigned to this role
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-primary'>
                  {role.permissions.length}
                </div>
                <p className='text-sm text-muted-foreground'>
                  Pages with access
                </p>
              </div>
              <Separator />
              <div className='text-center'>
                <div className='text-2xl font-bold text-primary'>
                  {getTotalPermissions(role.permissions)}
                </div>
                <p className='text-sm text-muted-foreground'>
                  Total permissions
                </p>
              </div>
              <Separator />
              <div className='text-center'>
                <div className='text-2xl font-bold text-primary'>
                  {role.active ? "Active" : "Inactive"}
                </div>
                <p className='text-sm text-muted-foreground'>Current status</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Pages</CardTitle>
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
                      className='flex items-center justify-between'>
                      <span className='text-sm'>{pageName}</span>
                      <Badge variant={permission ? "default" : "outline"}>
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
  );
};

// Helper component for labels
const Label: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => <span className={className}>{children}</span>;

export default ViewRolePage;
