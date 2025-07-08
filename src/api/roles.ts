import axios from "./axios";
import { Role, Permission } from "../pages/role/interface";
import config from "../utils/config";
import toast from "react-hot-toast";

// Updated API response interface to match the controller
interface ApiResponse<T> {
  success: boolean;
  dataSource?: T;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

// Pagination response interface
interface PaginationResponse<T> {
  success: boolean;
  error?: string;
  dataSource: {
    roles: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRoles: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// Query parameters for fetching roles
interface RoleQueryParams {
  page?: number;
  limit?: number;
  active?: boolean;
  search?: string;
}

// Role creation/update interface
interface RoleInput {
  name: string;
  description: string;
  active?: boolean;
  permissions?: Permission[];
}

// Error handling helper
const handleApiError = (err: any, defaultMessage: string): void => {
  if (err.response?.data?.errors) {
    // Handle validation errors
    const validationErrors = err.response.data.errors
      .map((error: any) => `${error.field}: ${error.message}`)
      .join(", ");
    toast.error(`Validation Error: ${validationErrors}`);
  } else if (err.response?.data?.error) {
    toast.error(err.response.data.error);
  } else if (err.response?.data?.message) {
    toast.error(err.response.data.message);
  } else {
    toast.error(err.message || defaultMessage);
  }
};

// Fetch all roles with pagination and filtering
export const fetchRoles = async (
  params?: RoleQueryParams
): Promise<{
  roles: Role[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRoles: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> => {
  try {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.active !== undefined)
      queryParams.append("active", params.active.toString());
    if (params?.search) queryParams.append("search", params.search);

    const url = queryParams.toString()
      ? `${config.role.fetchRoles()}?${queryParams.toString()}`
      : config.role.fetchRoles();

    const res = await axios.get<PaginationResponse<Role>>(url);

    if (res.data.success) {
      return {
        roles: res.data.dataSource.roles,
        pagination: res.data.dataSource.pagination,
      };
    }

    toast.error(res.data.error || "Failed to fetch roles");
    return { roles: [] };
  } catch (err: any) {
    handleApiError(err, "Failed to fetch roles");
    return { roles: [] };
  }
};

// Fetch role by ID
export const fetchRoleById = async (id: string): Promise<Role | null> => {
  try {
    const res = await axios.get<ApiResponse<Role>>(
      config.role.fetchRoleById(id)
    );

    if (res.data.success) {
      return res.data.dataSource!;
    }

    toast.error(res.data.error || "Failed to fetch role");
    return null;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch role");
    return null;
  }
};

// Create a new role
export const createRole = async (role: RoleInput): Promise<Role | null> => {
  try {
    const res = await axios.post<ApiResponse<Role>>(
      config.role.createRole(),
      role
    );

    if (res.data.success) {
      toast.success("Role created successfully");
      return res.data.dataSource!;
    }

    toast.error(res.data.error || "Failed to create role");
    return null;
  } catch (err: any) {
    handleApiError(err, "Failed to create role");
    return null;
  }
};

// Update an existing role
export const updateRole = async (
  id: string,
  role: Partial<RoleInput>
): Promise<Role | null> => {
  try {
    const res = await axios.put<ApiResponse<Role>>(
      config.role.updateRole(id),
      role
    );

    if (res.data.success) {
      toast.success("Role updated successfully");
      return res.data.dataSource!;
    }

    toast.error(res.data.error || "Failed to update role");
    return null;
  } catch (err: any) {
    handleApiError(err, "Failed to update role");
    return null;
  }
};

// Soft delete a role (set active to false)
export const deleteRole = async (id: string): Promise<boolean> => {
  try {
    const res = await axios.delete<ApiResponse<Role>>(
      config.role.deleteRole(id)
    );

    if (res.data.success) {
      toast.success("Role deleted successfully");
      return true;
    }

    toast.error(res.data.error || "Failed to delete role");
    return false;
  } catch (err: any) {
    handleApiError(err, "Failed to delete role");
    return false;
  }
};

// Permanently delete a role
export const permanentDeleteRole = async (id: string): Promise<boolean> => {
  try {
    const res = await axios.delete<ApiResponse<Role>>(
      config.role.permanentDeleteRole(id)
    );

    if (res.data.success) {
      toast.success("Role permanently deleted");
      return true;
    }

    toast.error(res.data.error || "Failed to permanently delete role");
    return false;
  } catch (err: any) {
    handleApiError(err, "Failed to permanently delete role");
    return false;
  }
};

// Get role permissions
export const getRolePermissions = async (
  id: string
): Promise<Permission[] | null> => {
  try {
    const res = await axios.get<ApiResponse<Permission[]>>(
      config.role.getRolePermissions(id)
    );

    if (res.data.success) {
      return res.data.dataSource!;
    }

    toast.error(res.data.error || "Failed to fetch role permissions");
    return null;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch role permissions");
    return null;
  }
};

// Update role permissions
export const updateRolePermissions = async (
  id: string,
  permissions: Permission[]
): Promise<Role | null> => {
  try {
    const res = await axios.put<ApiResponse<Role>>(
      config.role.updateRolePermissions(id),
      { permissions }
    );

    if (res.data.success) {
      toast.success("Role permissions updated successfully");
      return res.data.dataSource!;
    }

    toast.error(res.data.error || "Failed to update role permissions");
    return null;
  } catch (err: any) {
    handleApiError(err, "Failed to update role permissions");
    return null;
  }
};

// Bulk operations
export const bulkUpdateRoles = async (
  updates: Array<{ id: string; data: Partial<RoleInput> }>
): Promise<Role[]> => {
  try {
    const promises = updates.map((update) =>
      updateRole(update.id, update.data)
    );

    const results = await Promise.allSettled(promises);
    const successful = results
      .filter(
        (result): result is PromiseFulfilledResult<Role> =>
          result.status === "fulfilled" && result.value !== null
      )
      .map((result) => result.value);

    const failed = results.filter(
      (result) => result.status === "rejected"
    ).length;

    if (failed > 0) {
      toast.error(`${failed} role(s) failed to update`);
    }

    if (successful.length > 0) {
      toast.success(`${successful.length} role(s) updated successfully`);
    }

    return successful;
  } catch (err: any) {
    handleApiError(err, "Failed to bulk update roles");
    return [];
  }
};

// Bulk delete roles
export const bulkDeleteRoles = async (ids: string[]): Promise<boolean> => {
  try {
    const promises = ids.map((id) => deleteRole(id));
    const results = await Promise.allSettled(promises);

    const successful = results.filter(
      (result) => result.status === "fulfilled" && result.value === true
    ).length;

    const failed = results.filter(
      (result) =>
        result.status === "rejected" ||
        (result.status === "fulfilled" && result.value === false)
    ).length;

    if (failed > 0) {
      toast.error(`${failed} role(s) failed to delete`);
    }

    if (successful > 0) {
      toast.success(`${successful} role(s) deleted successfully`);
    }

    return successful > 0;
  } catch (err: any) {
    handleApiError(err, "Failed to bulk delete roles");
    return false;
  }
};

// Search roles with debounced functionality
export const searchRoles = async (
  searchTerm: string,
  options?: { active?: boolean; limit?: number }
): Promise<Role[]> => {
  try {
    const params: RoleQueryParams = {
      search: searchTerm,
      limit: options?.limit || 50,
      ...(options?.active !== undefined && { active: options.active }),
    };

    const result = await fetchRoles(params);
    return result.roles;
  } catch (err: any) {
    handleApiError(err, "Failed to search roles");
    return [];
  }
};

// Check if role name exists
export const checkRoleNameExists = async (
  name: string,
  excludeId?: string
): Promise<boolean> => {
  try {
    const roles = await searchRoles(name);
    return roles.some(
      (role) =>
        role.name.toLowerCase() === name.toLowerCase() &&
        (!excludeId || role.id !== excludeId)
    );
  } catch (err: any) {
    return false;
  }
};

// Export all functions as default object for easier importing
const roleApiService = {
  fetchRoles,
  fetchRoleById,
  createRole,
  updateRole,
  deleteRole,
  permanentDeleteRole,
  getRolePermissions,
  updateRolePermissions,
  bulkUpdateRoles,
  bulkDeleteRoles,
  searchRoles,
  checkRoleNameExists,
};

export default roleApiService;
