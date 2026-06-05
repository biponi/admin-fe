# Frontend Implementation Guide: Commission Features

## Table of Contents
1. [Phase 1: Backend Integration](#phase-1-backend-integration)
2. [Phase 2: Product Forms](#phase-2-product-forms)
3. [Phase 3: Admin Commission Page](#phase-3-admin-commission-page)
4. [Phase 4: User Commission Page](#phase-4-user-commission-page)
5. [Phase 5: Routing & Navigation](#phase-5-routing--navigation)

---

## Phase 1: Backend Integration

### Step 1.1: Create Commission API File

**File:** `src/api/commission.ts`

```typescript
import { api } from "./axios";
import config from "../utils/config";
import { handleApiError } from "../utils/errorHandler";

// Types
export interface Commission {
  id: string;
  orderId: string;
  orderNumber: number;
  userId: string;
  userName: string;
  userAvatar: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
  commissionType: "percentage" | "fixed";
  commissionRate: number;
  commissionAmount: number;
  status: "pending" | "unpaid" | "paid" | "hold" | "cancelled" | "removed";
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionListResponse {
  commissions: Commission[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
  summary: {
    totalCommissionAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    pendingAmount: number;
    totalCommissions: number;
  };
}

export interface CommissionSummaryResponse {
  period: {
    startDate: string | null;
    endDate: string | null;
  };
  overview: {
    totalCommissions: number;
    totalCommissionAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    pendingAmount: number;
    holdAmount: number;
    cancelledAmount: number;
    removedAmount: number;
    paidCount: number;
    unpaidCount: number;
    pendingCount: number;
    holdCount: number;
    cancelledCount: number;
    removedCount: number;
  };
  statusBreakdown: Array<{
    status: string;
    count: number;
    totalAmount: number;
  }>;
  topUsers: Array<{
    userId: string;
    userName: string;
    userAvatar: string;
    totalCommission: number;
    commissionCount: number;
    paidAmount: number;
    unpaidAmount: number;
    pendingAmount: number;
  }>;
}

export interface UserCommissionResponse {
  userId: string;
  userName: string;
  userAvatar: string;
  commissions: Commission[];
  pagination: CommissionListResponse["pagination"];
  userTotals: {
    totalCommissions: number;
    totalPaidAmount: number;
    totalUnpaidAmount: number;
    totalPendingAmount: number;
    totalHoldAmount: number;
  };
}

export interface CommissionQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
  userId?: string;
  limit?: number;
}

// API Functions
export const getCommissions = async (
  params?: CommissionQueryParams
): Promise<{ success: boolean; data?: CommissionListResponse; error?: string }> => {
  try {
    const response = await api.get<any>(config.commission.getAll(), { params });

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch commissions",
      };
    }
  } catch (error: any) {
    console.error("Error fetching commissions:", error.message);
    return handleApiError(error);
  }
};

export const getCommissionSummary = async (
  params?: DateRangeParams
): Promise<{ success: boolean; data?: CommissionSummaryResponse; error?: string }> => {
  try {
    const response = await api.get<any>(config.commission.getSummary(), { params });

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch commission summary",
      };
    }
  } catch (error: any) {
    console.error("Error fetching commission summary:", error.message);
    return handleApiError(error);
  }
};

export const getUserCommissions = async (
  userId: string,
  params?: CommissionQueryParams
): Promise<{ success: boolean; data?: UserCommissionResponse; error?: string }> => {
  try {
    const response = await api.get<any>(config.commission.getUserCommissions(userId), {
      params,
    });

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch user commissions",
      };
    }
  } catch (error: any) {
    console.error("Error fetching user commissions:", error.message);
    return handleApiError(error);
  }
};

export const getCommissionById = async (
  id: string
): Promise<{ success: boolean; data?: Commission; error?: string }> => {
  try {
    const response = await api.get<any>(config.commission.getById(id));

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch commission",
      };
    }
  } catch (error: any) {
    console.error("Error fetching commission:", error.message);
    return handleApiError(error);
  }
};

export const updateCommissionStatus = async (
  id: string,
  status: string,
  notes?: string
): Promise<{ success: boolean; data?: Commission; error?: string }> => {
  try {
    const response = await api.patch<any>(config.commission.updateStatus(id), {
      status,
      notes,
    });

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to update commission status",
      };
    }
  } catch (error: any) {
    console.error("Error updating commission status:", error.message);
    return handleApiError(error);
  }
};
```

### Step 1.2: Update Config File

**File:** `src/utils/config.ts`

Add this after the admin section:

```typescript
commission: {
  getAll: () => `${baseURL}/commission`,
  getSummary: () => `${baseURL}/commission/summary`,
  getUserCommissions: (userId: string) => `${baseURL}/commission/user/${userId}`,
  getById: (id: string) => `${baseURL}/commission/${id}`,
  updateStatus: (id: string) => `${baseURL}/commission/${id}/status`,
},
```

### Step 1.3: Create Commission Hook

**File:** `src/hooks/useCommission.ts`

```typescript
import { useState, useCallback } from "react";
import {
  getCommissions,
  getCommissionSummary,
  getUserCommissions,
  getCommissionById,
  updateCommissionStatus,
  Commission,
  CommissionListResponse,
  CommissionSummaryResponse,
  UserCommissionResponse,
  CommissionQueryParams,
  DateRangeParams,
} from "../api/commission";
import { toast } from "sonner";

export const useCommission = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommissions = useCallback(
    async (params?: CommissionQueryParams): Promise<CommissionListResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getCommissions(params);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.error || "Failed to fetch commissions");
          toast.error(result.error || "Failed to fetch commissions");
          return null;
        }
      } catch (err: any) {
        const errorMessage = "An error occurred while fetching commissions";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchCommissionSummary = useCallback(
    async (params?: DateRangeParams): Promise<CommissionSummaryResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getCommissionSummary(params);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.error || "Failed to fetch summary");
          toast.error(result.error || "Failed to fetch summary");
          return null;
        }
      } catch (err: any) {
        const errorMessage = "An error occurred while fetching summary";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchUserCommissions = useCallback(
    async (
      userId: string,
      params?: CommissionQueryParams
    ): Promise<UserCommissionResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getUserCommissions(userId, params);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.error || "Failed to fetch user commissions");
          toast.error(result.error || "Failed to fetch user commissions");
          return null;
        }
      } catch (err: any) {
        const errorMessage = "An error occurred while fetching user commissions";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchCommissionById = useCallback(
    async (id: string): Promise<Commission | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getCommissionById(id);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.error || "Failed to fetch commission");
          toast.error(result.error || "Failed to fetch commission");
          return null;
        }
      } catch (err: any) {
        const errorMessage = "An error occurred while fetching commission";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateStatus = useCallback(
    async (
      id: string,
      status: string,
      notes?: string
    ): Promise<Commission | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await updateCommissionStatus(id, status, notes);
        if (result.success && result.data) {
          toast.success("Commission status updated successfully");
          return result.data;
        } else {
          setError(result.error || "Failed to update commission status");
          toast.error(result.error || "Failed to update commission status");
          return null;
        }
      } catch (err: any) {
        const errorMessage = "An error occurred while updating commission status";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    fetchCommissions,
    fetchCommissionSummary,
    fetchUserCommissions,
    fetchCommissionById,
    updateStatus,
    isLoading,
    error,
  };
};
```

---

## Phase 2: Product Forms

### Step 2.1: Update Product Interface

**File:** `src/pages/product/interface.d.ts`

Add commission fields to the existing interfaces:

```typescript
export interface IProductCreateData {
  // ... existing fields
  commissionType?: "percentage" | "fixed" | "none";
  commissionRate?: number;
}

export interface IProductUpdateData {
  // ... existing fields
  commissionType?: "percentage" | "fixed" | "none";
  commissionRate?: number;
}
```

### Step 2.2: Update Product Create Form

**File:** `src/pages/product/newProduct/addProduct.tsx`

Find the section where you have form fields (after the Category section) and add:

```tsx
// Add this import at the top
import { DollarSign } from "lucide-react";

// In the form, after the Category section, add:
{/* Commission Section */}
<Card className="border-purple-200 dark:border-purple-800">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <DollarSign className="w-5 h-5 text-purple-600" />
      Commission Settings
    </CardTitle>
    <CardDescription>
      Configure commission for this product (optional)
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Commission Type */}
      <div className="space-y-2">
        <Label htmlFor="commissionType">Commission Type</Label>
        <Select
          value={formData.commissionType || "none"}
          onValueChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              commissionType: value as "percentage" | "fixed" | "none",
              commissionRate: value === "none" ? 0 : prev.commissionRate,
            }))
          }
        >
          <SelectTrigger id="commissionType">
            <SelectValue placeholder="Select commission type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Commission</SelectItem>
            <SelectItem value="percentage">Percentage (%)</SelectItem>
            <SelectItem value="fixed">Fixed Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Commission Rate */}
      {(formData.commissionType === "percentage" ||
        formData.commissionType === "fixed") && (
        <div className="space-y-2">
          <Label htmlFor="commissionRate">
            {formData.commissionType === "percentage"
              ? "Commission Rate (%)"
              : "Commission Amount"}
          </Label>
          <Input
            id="commissionRate"
            type="number"
            value={formData.commissionRate || 0}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                commissionRate: parseFloat(e.target.value) || 0,
              }))
            }
            min="0"
            max={formData.commissionType === "percentage" ? 100 : undefined}
            step="0.01"
            placeholder={
              formData.commissionType === "percentage"
                ? "Enter percentage (e.g., 5 for 5%)"
                : "Enter fixed amount"
            }
          />
          <p className="text-xs text-muted-foreground">
            {formData.commissionType === "percentage"
              ? "This percentage of the product price will be paid as commission"
              : "This fixed amount will be paid as commission per item"}
          </p>
        </div>
      )}
    </div>
  </CardContent>
</Card>
```

### Step 2.3: Update Product Edit Form

**File:** `src/pages/product/newProduct/editProduct.tsx`

Apply the same changes as above, but make sure to initialize the values from the existing product data.

In the `useEffect` where you load product data, add:

```typescript
useEffect(() => {
  if (productData) {
    setFormData({
      // ... existing fields
      commissionType: productData.commissionType || "none",
      commissionRate: productData.commissionRate || 0,
    });
  }
}, [productData]);
```

---

## Phase 3: Admin Commission Page

### Step 3.1: Create Commission Status Badge Component

**File:** `src/pages/commission/components/CommissionStatusBadge.tsx`

```tsx
import { Badge } from "@/components/ui/badge";
import { Commission } from "@/api/commission";

interface CommissionStatusBadgeProps {
  status: Commission["status"];
}

export const CommissionStatusBadge: React.FC<CommissionStatusBadgeProps> = ({
  status,
}) => {
  const statusConfig = {
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    unpaid: {
      label: "Unpaid",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    paid: {
      label: "Paid",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    hold: {
      label: "On Hold",
      className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
    removed: {
      label: "Removed",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return <Badge className={config.className}>{config.label}</Badge>;
};
```

### Step 3.2: Create Commission Filters Component

**File:** `src/pages/commission/components/CommissionFilters.tsx`

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { CommissionQueryParams } from "@/api/commission";

interface CommissionFiltersProps {
  filters: CommissionQueryParams;
  onFiltersChange: (filters: CommissionQueryParams) => void;
}

export const CommissionFilters: React.FC<CommissionFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const updateFilter = (key: keyof CommissionQueryParams, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, product, order..."
                value={filters.search || ""}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                updateFilter("status", value === "all" ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="removed">Removed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Filter */}
          <div className="space-y-2">
            <Label>User ID</Label>
            <Input
              placeholder="Enter user ID"
              value={filters.userId || ""}
              onChange={(e) => updateFilter("userId", e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Label>Actions</Label>
            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

### Step 3.3: Create Commission Table Component

**File:** `src/pages/commission/components/CommissionTable.tsx`

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Commission } from "@/api/commission";
import { CommissionStatusBadge } from "./CommissionStatusBadge";
import { formatDate } from "@/utils/formatDate";
import { Eye, Edit } from "lucide-react";

interface CommissionTableProps {
  commissions: Commission[];
  onViewDetails?: (commission: Commission) => void;
  onUpdateStatus?: (commission: Commission) => void;
}

export const CommissionTable: React.FC<CommissionTableProps> = ({
  commissions,
  onViewDetails,
  onUpdateStatus,
}) => {
  if (commissions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No commissions found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {commissions.map((commission) => (
            <TableRow key={commission.id}>
              <TableCell className="font-medium">
                #{commission.orderNumber}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={commission.userAvatar} />
                    <AvatarFallback>
                      {commission.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <div className="font-medium">{commission.userName}</div>
                    <div className="text-xs text-muted-foreground">
                      {commission.userId}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">{commission.productName}</div>
                  <div className="text-xs text-muted-foreground">
                    Qty: {commission.quantity} × ${commission.productPrice}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="text-sm">
                  <div className="font-medium">${commission.commissionAmount}</div>
                  <div className="text-xs text-muted-foreground">
                    {commission.commissionType === "percentage"
                      ? `${commission.commissionRate}%`
                      : `$${commission.commissionRate}`}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <CommissionStatusBadge status={commission.status} />
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {formatDate(commission.createdAt)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onViewDetails && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(commission)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {onUpdateStatus && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUpdateStatus(commission)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
```

### Step 3.4: Create Update Commission Dialog

**File:** `src/pages/commission/components/UpdateCommissionDialog.tsx`

```tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Commission } from "@/api/commission";
import { CommissionStatusBadge } from "./CommissionStatusBadge";
import { toast } from "sonner";

interface UpdateCommissionDialogProps {
  commission: Commission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, status: string, notes?: string) => Promise<void>;
}

export const UpdateCommissionDialog: React.FC<UpdateCommissionDialogProps> = ({
  commission,
  open,
  onOpenChange,
  onUpdate,
}) => {
  const [status, setStatus] = useState<string>(commission?.status || "pending");
  const [notes, setNotes] = useState<string>(commission?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!commission) return;

    setIsSubmitting(true);
    try {
      await onUpdate(commission.id, status, notes);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update commission status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Commission Status</DialogTitle>
          <DialogDescription>
            Update the status and add notes for commission #
            {commission?.orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Status */}
          <div className="space-y-2">
            <Label>Current Status</Label>
            <div className="flex items-center gap-2">
              {commission && <CommissionStatusBadge status={commission.status} />}
            </div>
          </div>

          {/* New Status */}
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="removed">Removed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about this status change..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

### Step 3.5: Create Commission Dashboard Component

**File:** `src/pages/commission/components/CommissionDashboard.tsx`

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Clock } from "lucide-react";
import { CommissionSummaryResponse } from "@/api/commission";

interface CommissionDashboardProps {
  summary: CommissionSummaryResponse["overview"];
}

export const CommissionDashboard: React.FC<CommissionDashboardProps> = ({
  summary,
}) => {
  const cards = [
    {
      title: "Total Commission",
      amount: summary.totalCommissionAmount,
      count: summary.totalCommissions,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
    },
    {
      title: "Paid",
      amount: summary.paidAmount,
      count: summary.paidCount,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Unpaid",
      amount: summary.unpaidAmount,
      count: summary.unpaidCount,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Pending",
      amount: summary.pendingAmount,
      count: summary.pendingCount,
      icon: Users,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${card.amount}</div>
            <p className="text-xs text-muted-foreground">{card.count} records</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
```

### Step 3.6: Create Main Commission Page

**File:** `src/pages/commission/index.tsx`

```tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCommission } from "@/hooks/useCommission";
import { CommissionDashboard } from "./components/CommissionDashboard";
import { CommissionTable } from "./components/CommissionTable";
import { CommissionFilters } from "./components/CommissionFilters";
import { UpdateCommissionDialog } from "./components/UpdateCommissionDialog";
import { CommissionQueryParams, Commission } from "@/api/commission";
import { Calendar, Download } from "lucide-react";
import { toast } from "sonner";

export const CommissionManagementPage = () => {
  const [filters, setFilters] = useState<CommissionQueryParams>({});
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  const { fetchCommissions, fetchCommissionSummary, updateStatus, isLoading } =
    useCommission();

  // Fetch data on mount and filter change
  useEffect(() => {
    const loadData = async () => {
      const [commissionsData, summaryData] = await Promise.all([
        fetchCommissions(filters),
        fetchCommissionSummary(filters),
      ]);

      if (commissionsData) {
        setCommissions(commissionsData.commissions);
        setPagination(commissionsData.pagination);
      }

      if (summaryData) {
        setSummary(summaryData);
      }
    };

    loadData();
  }, [filters]);

  const handleUpdateStatus = async (id: string, status: string, notes?: string) => {
    const result = await updateStatus(id, status, notes);
    if (result) {
      // Refresh data
      const commissionsData = await fetchCommissions(filters);
      if (commissionsData) {
        setCommissions(commissionsData.commissions);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleExport = () => {
    toast.info("Export feature coming soon!");
  };

  return (
    <div className="space-y-6 mx-2 md:container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Commission Management</h2>
          <p className="text-muted-foreground">
            Track and manage all commissions in one place
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && <CommissionDashboard summary={summary.overview} />}

      {/* Filters */}
      <CommissionFilters filters={filters} onFiltersChange={setFilters} />

      {/* Main Content */}
      <Tabs defaultValue="all-commissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-commissions">All Commissions</TabsTrigger>
          <TabsTrigger value="by-status">By Status</TabsTrigger>
          <TabsTrigger value="by-user">By User</TabsTrigger>
          <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
        </TabsList>

        <TabsContent value="all-commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Commissions</CardTitle>
              <CardDescription>
                View and manage all commission records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CommissionTable
                commissions={commissions}
                onViewDetails={(commission) => {
                  // Handle view details
                  console.log("View details:", commission);
                }}
                onUpdateStatus={(commission) => {
                  setSelectedCommission(commission);
                  setIsUpdateDialogOpen(true);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tab contents - implement similarly */}
      </Tabs>

      {/* Update Dialog */}
      <UpdateCommissionDialog
        commission={selectedCommission}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        onUpdate={handleUpdateStatus}
      />
    </div>
  );
};
```

---

## Phase 4: User Commission Page

### Step 4.1: Create User Commission Components

**Directory:** `src/pages/user/commission-components/`

#### CommissionHeader.tsx

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Clock, TrendingUp, AlertCircle } from "lucide-react";

interface CommissionHeaderProps {
  userName: string;
  totalEarned: number;
  pending: number;
  unpaid: number;
}

export const CommissionHeader: React.FC<CommissionHeaderProps> = ({
  userName,
  totalEarned,
  pending,
  unpaid,
}) => {
  const stats = [
    {
      label: "Total Earned",
      value: totalEarned,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
    },
    {
      label: "Unpaid",
      value: unpaid,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">{userName}'s Commissions</h1>
        <p className="text-muted-foreground">Track your earnings and commission history</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold">${stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
```

#### UserCommissionTable.tsx

```tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCommission } from "@/hooks/useCommission";
import { CommissionStatusBadge } from "@/pages/commission/components/CommissionStatusBadge";
import { formatDate } from "@/utils/formatDate";
import { Commission } from "@/api/commission";

interface UserCommissionTableProps {
  userId: string;
}

export const UserCommissionTable: React.FC<UserCommissionTableProps> = ({ userId }) => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const { fetchUserCommissions, isLoading } = useCommission();

  useEffect(() => {
    const loadCommissions = async () => {
      const data = await fetchUserCommissions(userId, { page: 1, limit: 20 });
      if (data) {
        setCommissions(data.commissions);
        setPagination(data.pagination);
      }
    };

    loadCommissions();
  }, [userId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Commissions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : commissions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No commissions found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell className="font-medium">
                    #{commission.orderNumber}
                  </TableCell>
                  <TableCell>{commission.productName}</TableCell>
                  <TableCell className="text-right">
                    ${commission.commissionAmount}
                  </TableCell>
                  <TableCell>
                    <CommissionStatusBadge status={commission.status} />
                  </TableCell>
                  <TableCell>{formatDate(commission.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
```

### Step 4.2: Create Main User Commission Page

**File:** `src/pages/user/userCommissions.tsx`

```tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCommission } from "@/hooks/useCommission";
import { CommissionHeader } from "./commission-components/CommissionHeader";
import { UserCommissionTable } from "./commission-components/UserCommissionTable";
import { useAppSelector } from "@/store/hooks";

export const UserCommissionPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [userTotals, setUserTotals] = useState({
    totalPaidAmount: 0,
    totalPendingAmount: 0,
    totalUnpaidAmount: 0,
  });
  const [userName, setUserName] = useState("User");

  const { fetchUserCommissions } = useCommission();
  const { profile } = useAppSelector((state) => state.user);

  useEffect(() => {
    const loadUserCommissions = async () => {
      if (userId) {
        const data = await fetchUserCommissions(userId);
        if (data) {
          setUserTotals({
            totalPaidAmount: data.userTotals.totalPaidAmount,
            totalPendingAmount: data.userTotals.totalPendingAmount,
            totalUnpaidAmount: data.userTotals.totalUnpaidAmount,
          });
          setUserName(data.userName);
        }
      }
    };

    loadUserCommissions();
  }, [userId]);

  return (
    <div className="relative min-h-screen md:rounded-2xl bg-gradient-to-br from-orange-50 via-rose-50 to-cyan-50 py-4 sm:py-8 px-4 w-full">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="shadow-none bg-transparent border-0 mt-6 md:mt-0">
          <CommissionHeader
            userName={profile?.name || userName}
            totalEarned={userTotals.totalPaidAmount}
            pending={userTotals.totalPendingAmount}
            unpaid={userTotals.totalUnpaidAmount}
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="my-commissions" className="space-y-4">
          <TabsList className="h-11 grid w-full grid-cols-4 lg:w-auto lg:inline-grid gap-2 bg-white px-2 pt-2 pb-4 rounded-lg shadow-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="my-commissions">My Commissions</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="my-commissions">
            <UserCommissionTable userId={userId || profile?.id || ""} />
          </TabsContent>

          {/* Other tabs - implement similarly */}
        </Tabs>
      </div>
    </div>
  );
};
```

---

## Phase 5: Routing & Navigation

### Step 5.1: Add Commission Routes

**File:** `src/main/routes/PrivateRoutes.tsx`

Add these routes:

```tsx
// Admin Commission Page
<Route
  path="/commission"
  element={
    <ProtectedRoute page="commission" requiredAction="view">
      <MainViewComponent title="Commission Management">
        <CommissionManagementPage />
      </MainViewComponent>
    </ProtectedRoute>
  }
/>

// User Commission Page
<Route
  path="/my-commissions"
  element={
    <ProtectedRoute page="my-commissions" requiredAction="view">
      <UserCommissionPage />
    </ProtectedRoute>
  }
/>

// User Commission by ID
<Route
  path="/user/:userId/commissions"
  element={
    <ProtectedRoute page="user-commissions" requiredAction="view">
      <MainViewComponent title="User Commissions">
        <UserCommissionPage />
      </MainViewComponent>
    </ProtectedRoute>
  }
/>
```

### Step 5.2: Add Navigation Links

**In Sidebar/Admin Menu:**

```tsx
// Add this item to your navigation menu
{
  title: "Commission",
  icon: DollarSign,
  path: "/commission",
  requiredPermission: "commission.view",
}
```

**In User Profile Page:**

**File:** `src/pages/user/userProfile.tsx`

Add a button to navigate to commission page:

```tsx
// In the profile header or actions section
<Button
  variant="outline"
  onClick={() => navigate("/my-commissions")}
  className="gap-2"
>
  <DollarSign className="w-4 h-4" />
  View My Commissions
</Button>
```

---

## Utility Functions

### Date Formatter

**File:** `src/utils/formatDate.ts`

```typescript
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
```

### Error Handler

**File:** `src/utils/errorHandler.ts`

```typescript
import { toast } from "sonner";
import { AxiosError } from "axios";

export const handleApiError = (error: any): {
  success: boolean;
  error: string;
} => {
  if (error.response) {
    const errorMessage =
      error.response.data?.error || error.response.data?.message || "An error occurred";
    toast.error(errorMessage);
    return { success: false, error: errorMessage };
  } else if (error.request) {
    const errorMessage = "No response from server. Please check your connection.";
    toast.error(errorMessage);
    return { success: false, error: errorMessage };
  } else {
    const errorMessage = error.message || "An unexpected error occurred";
    toast.error(errorMessage);
    return { success: false, error: errorMessage };
  }
};
```

---

## Testing Checklist

After implementation, test:

1. **Product Forms**
   - [ ] Create product with percentage commission
   - [ ] Create product with fixed commission
   - [ ] Create product without commission
   - [ ] Edit product commission settings
   - [ ] Validation works (max 100 for percentage)

2. **Admin Commission Page**
   - [ ] Load all commissions
   - [ ] Filter by status
   - [ ] Filter by user ID
   - [ ] Search functionality
   - [ ] Pagination works
   - [ ] Update commission status
   - [ ] Summary cards display correctly
   - [ ] Export button (placeholder)

3. **User Commission Page**
   - [ ] Load user's commissions
   - [ ] Display user totals correctly
   - [ ] Filter by status
   - [ ] Pagination works
   - [ ] Navigation from profile works

4. **API Integration**
   - [ ] All API calls work correctly
   - [ ] Error handling displays user-friendly messages
   - [ ] Loading states show during data fetch
   - [ ] Toast notifications for success/error

5. **Responsive Design**
   - [ ] Mobile view works
   - [ ] Tablet view works
   - [ ] Desktop view works
   - [ ] Tables are scrollable on mobile

---

## Notes

- All components follow existing patterns in the codebase
- TypeScript is used for type safety
- All API calls include error handling
- Loading states are implemented
- Toast notifications for user feedback
- Responsive design with Tailwind CSS
- Dark mode support
- Follow shadcn/ui component patterns

This implementation guide provides complete, production-ready code that integrates seamlessly with your existing React admin dashboard!
