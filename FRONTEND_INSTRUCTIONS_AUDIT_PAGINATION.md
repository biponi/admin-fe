# Frontend Implementation Instructions: Audit Pagination APIs

## Overview

Two new paginated API endpoints have been added to the admin audit dashboard backend. This document provides complete instructions for implementing the corresponding frontend pages.

| API | Backend Route | Purpose |
|-----|---------------|---------|
| Stock Adjustments | `GET /admin/audit/stock-adjustments` | Paginated list of all product inventory adjustments |
| Order Modifications | `GET /admin/audit/order-modifications` | Paginated list of all order modification audit logs |

---

## 1. API Reference

### 1.1 Stock Adjustments

**Endpoint:** `GET /api/v1/admin/audit/stock-adjustments`

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | `1` | Page number (min: 1) |
| `limit` | number | `20` | Items per page (1-500) |
| `sortBy` | string | `createdAt` | Sort field |
| `sortOrder` | string | `desc` | `asc` or `desc` |
| `startDate` | string (ISO) | — | Date range start |
| `endDate` | string (ISO) | — | Date range end |
| `direction` | string | — | `increase` (stock added) or `decrease` (stock removed) |
| `adjustmentType` | string | — | `add`, `remove`, or `set` |
| `search` | string | — | Searches productName, productSku, reason |
| `userId` | string | — | Filter by who performed the adjustment |

**Response:**

```json
{
  "success": true,
  "data": {
    "adjustments": [
      {
        "id": "ADJ-1234567890-abc",
        "productId": "...",
        "productName": "T-Shirt Black M",
        "productSku": "TS-BLK-M",
        "adjustmentType": "add",
        "oldQuantity": 10,
        "newQuantity": 25,
        "quantityChange": 15,
        "reason": "Restocked from supplier",
        "notes": "PO #1234",
        "adjustedBy": {
          "userId": "...",
          "userName": "John Doe",
          "userEmail": "john@example.com",
          "userType": "admin"
        },
        "status": "applied",
        "timestamps": {
          "createdAt": "2026-07-01T10:30:00.000Z"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 200,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPreviousPage": false,
      "nextPage": 2,
      "prevPage": null
    },
    "summary": {
      "totalIncreases": 120,
      "totalDecreases": 80
    }
  }
}
```

### 1.2 Order Modifications

**Endpoint:** `GET /api/v1/admin/audit/order-modifications`

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | `1` | Page number (min: 1) |
| `limit` | number | `20` | Items per page (1-500) |
| `sortBy` | string | `createdAt` | Sort field |
| `sortOrder` | string | `desc` | `asc` or `desc` |
| `startDate` | string (ISO) | — | Date range start |
| `endDate` | string (ISO) | — | Date range end |
| `search` | string | — | Searches orderNumber, operationDescription, reason |
| `userId` | string | — | Filter by who performed the modification |

**Response:**

```json
{
  "success": true,
  "data": {
    "modifications": [
      {
        "id": "AUDIT-1234567890",
        "orderId": "...",
        "orderNumber": 100234,
        "operation": "order_modification",
        "operationDescription": "Updated quantity from 2 to 5",
        "changesummary": [
          { "field": "quantity", "oldValue": 2, "newValue": 5 }
        ],
        "performedBy": {
          "userId": "...",
          "userName": "Jane Smith",
          "userEmail": "jane@example.com",
          "userType": "admin"
        },
        "reason": "Customer requested additional items",
        "timestamps": {
          "createdAt": "2026-07-02T14:20:00.000Z"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 95,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPreviousPage": false,
      "nextPage": 2,
      "prevPage": null
    },
    "summary": {
      "totalModifications": 95
    }
  }
}
```

---

## 2. Files to Create/Modify

### 2.1 Add URL Builders

**File:** `src/utils/config.ts`

Add inside the `admin` object (after line 219):

```typescript
stockAdjustments: () => `${baseURL}/admin/audit/stock-adjustments`,
orderModifications: () => `${baseURL}/admin/audit/order-modifications`,
```

### 2.2 Add API Functions

**File:** `src/api/adminAudit.ts`

Add the following types and functions at the end of the file (before the last closing `};` if applicable, or at the bottom):

```typescript
// ===== Stock Adjustment Pagination Types =====

export interface StockAdjustmentItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  variationId?: string;
  variationDetails?: {
    size?: string;
    color?: string;
    sku?: string;
  };
  adjustmentType: "add" | "remove" | "set";
  oldQuantity: number;
  newQuantity: number;
  quantityChange: number;
  reason: string;
  notes?: string;
  referenceNumber?: string;
  adjustedBy: {
    userId: string;
    userName: string;
    userEmail: string;
    userType: string;
  };
  status: string;
  timestamps: {
    createdAt: string;
  };
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface StockAdjustmentsResponse {
  adjustments: StockAdjustmentItem[];
  pagination: PaginationMeta;
  summary: {
    totalIncreases: number;
    totalDecreases: number;
  };
}

// ===== Order Modification Pagination Types =====

export interface OrderModificationItem {
  id: string;
  orderId: string;
  orderNumber: number;
  operation: string;
  operationDescription: string;
  changesummary?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  performedBy: {
    userId: string;
    userName: string;
    userEmail: string;
    userType: string;
  };
  reason?: string;
  notes?: string;
  timestamps: {
    createdAt: string;
  };
}

export interface OrderModificationsResponse {
  modifications: OrderModificationItem[];
  pagination: PaginationMeta;
  summary: {
    totalModifications: number;
  };
}

// ===== API Functions =====

export const getStockAdjustments = async (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  startDate?: string;
  endDate?: string;
  direction?: "increase" | "decrease";
  adjustmentType?: "add" | "remove" | "set";
  search?: string;
  userId?: string;
}): Promise<ApiResponse<StockAdjustmentsResponse>> => {
  try {
    const response = await axios.get<any>(config.admin.stockAdjustments(), {
      params,
    });

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch stock adjustments",
      };
    }
  } catch (error: any) {
    console.error("Error fetching stock adjustments:", error.message);
    return handleApiError(error);
  }
};

export const getOrderModifications = async (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  userId?: string;
}): Promise<ApiResponse<OrderModificationsResponse>> => {
  try {
    const response = await axios.get<any>(config.admin.orderModifications(), {
      params,
    });

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch order modifications",
      };
    }
  } catch (error: any) {
    console.error("Error fetching order modifications:", error.message);
    return handleApiError(error);
  }
};
```

### 2.3 Create Custom Hooks

Create **two new hook files** following the existing pattern (`src/hooks/useAdminAudit.ts`):

**File:** `src/hooks/useStockAdjustments.ts`

```typescript
import { useState, useEffect, useCallback } from "react";
import {
  getStockAdjustments,
  StockAdjustmentItem,
  PaginationMeta,
} from "../api/adminAudit";

export const useStockAdjustments = () => {
  const [adjustments, setAdjustments] = useState<StockAdjustmentItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [summary, setSummary] = useState<{
    totalIncreases: number;
    totalDecreases: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dateRange, setDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});
  const [direction, setDirection] = useState<"increase" | "decrease" | "">("");
  const [adjustmentType, setAdjustmentType] = useState<
    "add" | "remove" | "set" | ""
  >("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAdjustments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = {
        page: currentPage,
        limit,
        sortBy,
        sortOrder,
      };

      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      if (direction) params.direction = direction;
      if (adjustmentType) params.adjustmentType = adjustmentType;
      if (searchQuery) params.search = searchQuery;

      const result = await getStockAdjustments(params);

      if (result.success && result.data) {
        setAdjustments(result.data.adjustments);
        setPagination(result.data.pagination);
        setSummary(result.data.summary);
      } else {
        setError(result.error || "Failed to fetch data");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, sortBy, sortOrder, dateRange, direction, adjustmentType, searchQuery]);

  useEffect(() => {
    fetchAdjustments();
  }, [fetchAdjustments]);

  const goToPage = (page: number) => setCurrentPage(page);
  const nextPage = () => {
    if (pagination?.hasNextPage) setCurrentPage((p) => p + 1);
  };
  const prevPage = () => {
    if (pagination?.hasPreviousPage) setCurrentPage((p) => p - 1);
  };
  const resetFilters = () => {
    setCurrentPage(1);
    setSortBy("createdAt");
    setSortOrder("desc");
    setDateRange({});
    setDirection("");
    setAdjustmentType("");
    setSearchQuery("");
  };

  return {
    adjustments,
    pagination,
    summary,
    isLoading,
    error,
    // Filter state
    currentPage,
    limit,
    sortBy,
    sortOrder,
    dateRange,
    direction,
    adjustmentType,
    searchQuery,
    // Filter setters
    setCurrentPage: goToPage,
    setLimit,
    setSortBy,
    setSortOrder,
    setDateRange,
    setDirection,
    setAdjustmentType,
    setSearchQuery,
    // Actions
    nextPage,
    prevPage,
    resetFilters,
    refetch: fetchAdjustments,
  };
};
```

**File:** `src/hooks/useOrderModifications.ts`

```typescript
import { useState, useEffect, useCallback } from "react";
import {
  getOrderModifications,
  OrderModificationItem,
  PaginationMeta,
} from "../api/adminAudit";

export const useOrderModifications = () => {
  const [modifications, setModifications] = useState<OrderModificationItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [summary, setSummary] = useState<{
    totalModifications: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dateRange, setDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetchModifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = {
        page: currentPage,
        limit,
        sortBy,
        sortOrder,
      };

      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      if (searchQuery) params.search = searchQuery;

      const result = await getOrderModifications(params);

      if (result.success && result.data) {
        setModifications(result.data.modifications);
        setPagination(result.data.pagination);
        setSummary(result.data.summary);
      } else {
        setError(result.error || "Failed to fetch data");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, sortBy, sortOrder, dateRange, searchQuery]);

  useEffect(() => {
    fetchModifications();
  }, [fetchModifications]);

  const goToPage = (page: number) => setCurrentPage(page);
  const nextPage = () => {
    if (pagination?.hasNextPage) setCurrentPage((p) => p + 1);
  };
  const prevPage = () => {
    if (pagination?.hasPreviousPage) setCurrentPage((p) => p - 1);
  };
  const resetFilters = () => {
    setCurrentPage(1);
    setSortBy("createdAt");
    setSortOrder("desc");
    setDateRange({});
    setSearchQuery("");
  };

  return {
    modifications,
    pagination,
    summary,
    isLoading,
    error,
    // Filter state
    currentPage,
    limit,
    sortBy,
    sortOrder,
    dateRange,
    searchQuery,
    // Filter setters
    setCurrentPage: goToPage,
    setLimit,
    setSortBy,
    setSortOrder,
    setDateRange,
    setSearchQuery,
    // Actions
    nextPage,
    prevPage,
    resetFilters,
    refetch: fetchModifications,
  };
};
```

### 2.4 Create Page Components

**File:** `src/pages/admin/components/StockAdjustmentsPage.tsx`

Follow the exact same structure as `AuditDashboard.tsx`:
- Use `<MainView title="Stock Adjustments">` or the `container space-y-6` wrapper
- Header with icon + title + description
- Date range filter inputs
- Direction filter buttons/tabs (All / Increase / Decrease)
- Adjustment type filter dropdown (All / Add / Remove / Set)
- Search input with `useDebounce`
- Summary cards (Increases count, Decreases count)
- Table using shadcn `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableHead>`
- Inline pagination (Previous/Next buttons + page size Select)

**File:** `src/pages/admin/components/OrderModificationsPage.tsx`

Same structure as above but:
- No direction filter
- No adjustment type filter
- Table shows: Order #, Description, Changed By, Reason, Date
- Click row to expand `changesummary` details (use existing pattern from order audit trail)

### 2.5 Register Routes

**File:** `src/main/routes.tsx` (or equivalent route config)

Add routes inside the admin/audit section:

```tsx
// Stock Adjustments page
<Route path="/audit/stock-adjustments" element={<StockAdjustmentsPage />} />

// Order Modifications page
<Route path="/audit/order-modifications" element={<OrderModificationsPage />} />
```

### 2.6 Add Navigation Links

**File:** `src/utils/navItem.tsx`

Add sub-menu items under the existing "Audit" nav item (around line 198):

```tsx
{
  label: "Stock Adjustments",
  link: "/audit/stock-adjustments",
  icon: Package, // or appropriate icon
  id: "audit-stock-adjustments",
},
{
  label: "Order Modifications",
  link: "/audit/order-modifications",
  icon: FileEdit, // or appropriate icon from lucide-react
  id: "audit-order-modifications",
},
```

---

## 3. Theme & Styling Rules

### MUST follow (match existing AuditDashboard.tsx exactly):

| Element | Class Pattern | Example |
|---------|---------------|---------|
| **Page wrapper** | `container space-y-6` | `<div className="container space-y-6">` |
| **Header icon** | `flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200` | Use `Package` or `FileEdit` icon inside |
| **Title** | `text-xl font-semibold text-slate-900 leading-tight` | `<h2>` |
| **Subtitle** | `text-sm text-slate-500 mt-0.5` | `<p>` |
| **Filter inputs** | `px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500` | `<input>` elements |
| **Summary cards** | `bg-white rounded-xl border border-slate-100 p-4 shadow-sm` | Card wrapper |
| **Card label** | `text-xs text-slate-500` | `<p>` |
| **Card value** | `text-lg font-semibold {accent-color} leading-none mb-1` | `<p>` |
| **Table wrapper** | `bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden` | Card around table |
| **Table header** | `bg-slate-50` on `<TableRow>` | `<TableHead>` with `text-xs font-medium text-slate-500 uppercase tracking-wider` |
| **Table rows** | `hover:bg-slate-50 transition-colors` | `<TableRow>` |
| **Table cells** | `text-sm text-slate-900` or `text-sm text-slate-600` | `<TableCell>` |
| **Increase badge** | `bg-emerald-50 text-emerald-700 border-emerald-200` | `<Badge variant="outline">` |
| **Decrease badge** | `bg-rose-50 text-rose-700 border-rose-200` | `<Badge variant="outline">` |
| **Pagination buttons** | `px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed` | Previous/Next `<button>` |
| **Page size select** | `px-2 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700` | `<select>` or `<Select>` |
| **Loading spinner** | Indigo spinner (see AuditDashboard.tsx lines 62-65) | Reuse exact markup |
| **Error state** | `bg-rose-50 border border-rose-200 rounded-xl p-4` | Error container |
| **Empty state** | `bg-slate-50 border border-slate-200 rounded-xl p-4` | No data container |
| **Search input** | Same as filter inputs, add `w-full sm:w-64` for width | `<input>` |
| **Filter tabs/buttons** | `px-3 py-1.5 text-sm font-medium rounded-lg` with active state `bg-indigo-600 text-white` and inactive `bg-white text-slate-600 border border-slate-200` | Toggle buttons for direction filter |

### Color accents for summary cards:

| Card | Accent | Background |
|------|--------|------------|
| Total Adjustments / Modifications | `text-indigo-600` | `bg-indigo-50` |
| Increases | `text-emerald-600` | `bg-emerald-50` |
| Decreases | `text-rose-600` | `bg-rose-50` |

### Icons to use (from `lucide-react`):

| Page | Header Icon | Increase Icon | Decrease Icon |
|------|-------------|---------------|---------------|
| Stock Adjustments | `Package` | `TrendingUp` | `TrendingDown` |
| Order Modifications | `FileEdit` or `ClipboardList` | — | — |

---

## 4. Page Structure Template

Both pages should follow this exact layout order:

```
<div className="container space-y-6">
  {/* 1. Header: icon + title + subtitle */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div className="flex items-center gap-3">
      {/* Icon + Title + Subtitle */}
    </div>
    {/* Date range inputs (right-aligned) */}
  </div>

  {/* 2. Filter bar: search + direction/type tabs + reset button */}
  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
    {/* Search input */}
    {/* Filter tabs/buttons */}
    {/* Reset filters button */}
  </div>

  {/* 3. Summary cards */}
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
    {/* Cards */}
  </div>

  {/* 4. Data table */}
  <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            {/* Column headers */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Skeleton rows (3-5 rows)
          ) : items.length === 0 ? (
            // Empty state message
          ) : (
            // Data rows
          )}
        </TableBody>
      </Table>
    </div>

    {/* 5. Pagination footer */}
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
      {/* Left: showing X of Y items */}
      {/* Right: page size selector + prev/next buttons */}
    </div>
  </div>
</div>
```

---

## 5. Debounced Search Pattern

Use the existing `useDebounce` hook from `src/customHook/useDebounce.tsx`:

```typescript
import { useDebounce } from "../../customHook/useDebounce";

// In component:
const [inputValue, setInputValue] = useState("");
const debouncedSearch = useDebounce(inputValue, 500);

// In useEffect, trigger fetch when debouncedSearch changes
useEffect(() => {
  setSearchQuery(debouncedSearch);
}, [debouncedSearch]);
```

---

## 6. Key Implementation Notes

1. **Server-side pagination** — never fetch all data at once. Always use `page` + `limit` params.
2. **Reset to page 1** — whenever any filter changes, reset `currentPage` to 1.
3. **Sort on click** — clicking a table header column toggles `sortOrder` between `asc`/`desc` and sets `sortBy` to that column's field name.
4. **Date handling** — use `dayjs` (already in the project) for formatting dates in the UI. Send ISO strings to the API.
5. **Loading states** — show skeleton rows during pagination (not full-page spinner). Show full-page spinner only on initial load.
6. **Error handling** — use `useToast()` to show error toasts. Display inline error state for API failures.
7. **Responsive** — use `sm:` breakpoints for mobile layout. Stack filters vertically on mobile, horizontal on desktop.
8. **Type safety** — all TypeScript. No `any` types in new code. Use the exported types from `adminAudit.ts`.
