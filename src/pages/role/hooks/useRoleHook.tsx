import { useState, useCallback } from "react";
import {
  Role,
  RoleQueryParams,
  CreateRoleInput,
  UpdateRoleInput,
  Permission,
} from "../interface";
import * as roleApi from "../../../api/roles";

interface UseRolesReturn {
  // State
  roles: Role[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRoles: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;

  // Actions
  fetchRoles: (params?: RoleQueryParams) => Promise<void>;
  createRole: (role: CreateRoleInput) => Promise<Role | null>;
  updateRole: (id: string, role: UpdateRoleInput) => Promise<Role | null>;
  deleteRole: (id: string) => Promise<boolean>;
  permanentDeleteRole: (id: string) => Promise<boolean>;
  getRoleById: (id: string) => Promise<Role | null>;
  updateRolePermissions: (
    id: string,
    permissions: Permission[]
  ) => Promise<Role | null>;
  searchRoles: (
    searchTerm: string,
    options?: { active?: boolean; limit?: number }
  ) => Promise<void>;
  bulkDeleteRoles: (ids: string[]) => Promise<boolean>;
  refresh: () => Promise<void>;

  // Utility
  clearError: () => void;
  setQueryParams: (params: RoleQueryParams) => void;
}

export const useRoles = (initialParams?: RoleQueryParams): UseRolesReturn => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    totalPages: number;
    totalRoles: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);
  const [queryParams, setQueryParams] = useState<RoleQueryParams>(
    initialParams || { page: 1, limit: 10 }
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchRoles = useCallback(
    async (params?: RoleQueryParams) => {
      setLoading(true);
      setError(null);

      try {
        const finalParams = params || queryParams;
        const result = await roleApi.fetchRoles(finalParams);

        setRoles(result.roles);
        setPagination(result.pagination || null);

        if (params) {
          setQueryParams(finalParams);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch roles");
      } finally {
        setLoading(false);
      }
    },
    [queryParams]
  );

  const createRole = useCallback(
    async (role: CreateRoleInput): Promise<Role | null> => {
      setLoading(true);
      setError(null);

      try {
        const newRole = await roleApi.createRole(role);
        if (newRole) {
          // Add to current list if it matches current filters
          setRoles((prev) => [newRole, ...prev]);
          if (pagination) {
            setPagination((prev) =>
              prev ? { ...prev, totalRoles: prev.totalRoles + 1 } : null
            );
          }
        }
        return newRole;
      } catch (err: any) {
        setError(err.message || "Failed to create role");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [pagination]
  );

  const updateRole = useCallback(
    async (id: string, role: UpdateRoleInput): Promise<Role | null> => {
      setLoading(true);
      setError(null);

      try {
        const updatedRole = await roleApi.updateRole(id, role);
        if (updatedRole) {
          setRoles((prev) => prev.map((r) => (r.id === id ? updatedRole : r)));
        }
        return updatedRole;
      } catch (err: any) {
        setError(err.message || "Failed to update role");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteRole = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const success = await roleApi.deleteRole(id);
        if (success) {
          setRoles((prev) => prev.filter((r) => r.id !== id));
          if (pagination) {
            setPagination((prev) =>
              prev ? { ...prev, totalRoles: prev.totalRoles - 1 } : null
            );
          }
        }
        return success;
      } catch (err: any) {
        setError(err.message || "Failed to delete role");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [pagination]
  );

  const permanentDeleteRole = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const success = await roleApi.permanentDeleteRole(id);
        if (success) {
          setRoles((prev) => prev.filter((r) => r.id !== id));
          if (pagination) {
            setPagination((prev) =>
              prev ? { ...prev, totalRoles: prev.totalRoles - 1 } : null
            );
          }
        }
        return success;
      } catch (err: any) {
        setError(err.message || "Failed to permanently delete role");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [pagination]
  );

  const getRoleById = useCallback(async (id: string): Promise<Role | null> => {
    setLoading(true);
    setError(null);

    try {
      const role = await roleApi.fetchRoleById(id);
      return role;
    } catch (err: any) {
      setError(err.message || "Failed to fetch role");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRolePermissions = useCallback(
    async (id: string, permissions: Permission[]): Promise<Role | null> => {
      setLoading(true);
      setError(null);

      try {
        const updatedRole = await roleApi.updateRolePermissions(
          id,
          permissions
        );
        if (updatedRole) {
          setRoles((prev) => prev.map((r) => (r.id === id ? updatedRole : r)));
        }
        return updatedRole;
      } catch (err: any) {
        setError(err.message || "Failed to update role permissions");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const searchRoles = useCallback(
    async (
      searchTerm: string,
      options?: { active?: boolean; limit?: number }
    ): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const searchResults = await roleApi.searchRoles(searchTerm, options);
        setRoles(searchResults);
        setPagination(null); // Clear pagination for search results
      } catch (err: any) {
        setError(err.message || "Failed to search roles");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const bulkDeleteRoles = useCallback(
    async (ids: string[]): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const success = await roleApi.bulkDeleteRoles(ids);
        if (success) {
          setRoles((prev) => prev.filter((r) => !ids.includes(r.id)));
          if (pagination) {
            setPagination((prev) =>
              prev
                ? { ...prev, totalRoles: prev.totalRoles - ids.length }
                : null
            );
          }
        }
        return success;
      } catch (err: any) {
        setError(err.message || "Failed to bulk delete roles");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [pagination]
  );

  const refresh = useCallback(async () => {
    await fetchRoles(queryParams);
  }, [fetchRoles, queryParams]);

  const handleSetQueryParams = useCallback((params: RoleQueryParams) => {
    setQueryParams(params);
  }, []);

  return {
    // State
    roles,
    loading,
    error,
    pagination,

    // Actions
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    permanentDeleteRole,
    getRoleById,
    updateRolePermissions,
    searchRoles,
    bulkDeleteRoles,
    refresh,

    // Utility
    clearError,
    setQueryParams: handleSetQueryParams,
  };
};

// Hook for managing a single role (useful for edit forms)
export const useRole = () => {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRole = useCallback(async (roleId: string) => {
    setLoading(true);
    setError(null);

    try {
      const fetchedRole = await roleApi.fetchRoleById(roleId);
      setRole(fetchedRole);
    } catch (err: any) {
      setError(err.message || "Failed to fetch role");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRole = useCallback(
    async (updates: UpdateRoleInput): Promise<Role | null> => {
      if (!role) return null;

      setLoading(true);
      setError(null);

      try {
        const updatedRole = await roleApi.updateRole(role.id, updates);
        if (updatedRole) {
          setRole(updatedRole);
        }
        return updatedRole;
      } catch (err: any) {
        setError(err.message || "Failed to update role");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [role]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    role,
    loading,
    error,
    fetchRole,
    updateRole,
    clearError,
    setRole,
  };
};
