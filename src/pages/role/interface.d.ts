// Role and Permission interfaces
export interface Permission {
  page: string;
  actions: string[];
  _id?: string;
}

export interface Role {
  id: string;
  roleNumber: number;
  name: string;
  description: string;
  active: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
  _id?: string;
}

// Form interfaces for creating/updating roles
export interface CreateRoleInput {
  name: string;
  description: string;
  active?: boolean;
  permissions?: Permission[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  active?: boolean;
  permissions?: Permission[];
}

// Query and response interfaces
export interface RoleQueryParams {
  page?: number;
  limit?: number;
  active?: boolean;
  search?: string;
}

export interface RolePaginationData {
  roles: Role[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRoles: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

export interface PaginationResponse<T> {
  success: boolean;
  message: string;
  data: {
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

// Constants for validation
export const VALID_ACTIONS = [
  "create",
  "read",
  "update",
  "delete",
  "view",
  "edit",
] as const;

export type ValidAction = (typeof VALID_ACTIONS)[number];

// Default values
export const DEFAULT_ROLE_QUERY_PARAMS: RoleQueryParams = {
  page: 1,
  limit: 10,
  active: true,
};

export const DEFAULT_ROLE_INPUT: CreateRoleInput = {
  name: "",
  description: "",
  active: true,
  permissions: [],
};
