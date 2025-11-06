# Audit & Admin Dashboard System - Frontend Implementation

## Overview
This document describes the complete frontend implementation for the Product Stock Adjustment, Order Audit Trail, and Admin Audit Dashboard systems. All systems follow your project's established patterns and conventions.

---

## 📁 File Structure

```
src/
├── api/
│   ├── productAdjustment.ts      # Product adjustment API calls
│   ├── orderAudit.ts              # Order audit trail API calls
│   └── adminAudit.ts              # Admin dashboard API calls
│
├── types/
│   ├── audit.types.ts             # Product & Order audit types
│   └── adminAudit.types.ts        # Admin dashboard types
│
├── hooks/
│   ├── useProductAdjustment.ts    # Product adjustment hook
│   ├── useOrderAudit.ts           # Order audit hook
│   └── useAdminAudit.ts           # Admin dashboard hook
│
├── pages/
│   ├── product/components/
│   │   └── ProductAdjustmentForm.tsx
│   ├── order/components/
│   │   └── OrderAuditTimeline.tsx
│   └── admin/components/
│       ├── AuditDashboard.tsx
│       └── UserPerformanceTable.tsx
│
└── utils/
    └── config.ts                  # Updated with new endpoints
```

---

## 🔌 API Endpoints Configuration

All endpoints have been added to [src/utils/config.ts](src/utils/config.ts):

### Product Adjustment Endpoints
```typescript
product: {
  // ... existing endpoints
  adjustStock: () => `${baseURL}/product/adjust`,
  getAdjustments: (productId?: string) =>
    productId ? `${baseURL}/product/adjustments/${productId}`
              : `${baseURL}/product/adjustments`,
  getAdjustmentStats: () => `${baseURL}/product/adjustment-stats`,
}
```

### Order Audit Endpoints
```typescript
order: {
  // ... existing endpoints
  getOrderAudit: (orderId: string) => `${baseURL}/order/prior/${orderId}/audit`,
  getAllAudits: () => `${baseURL}/order/audit`,
  getUserAudits: (userId: string) => `${baseURL}/order/audit/user/${userId}`,
  getAuditStats: () => `${baseURL}/order/audit/stats`,
}
```

### Admin Dashboard Endpoints
```typescript
admin: {
  auditDashboard: () => `${baseURL}/admin/audit/dashboard`,
  userPerformanceOverview: () => `${baseURL}/admin/audit/users`,
  userPerformanceDetail: (userId: string) => `${baseURL}/admin/audit/users/${userId}`,
  topPerformers: () => `${baseURL}/admin/audit/top-performers`,
}
```

---

## 🎯 Usage Examples

### 1. Product Stock Adjustment

#### Using the Hook
```typescript
import { useProductAdjustment } from '@/hooks/useProductAdjustment';

const ProductManager = ({ productId }) => {
  const { adjustStock, fetchAdjustmentHistory, isLoading, error } = useProductAdjustment();

  const handleAdjustment = async () => {
    const result = await adjustStock({
      productId: productId,
      adjustmentType: 'add',
      quantity: 50,
      reason: 'Received new stock from supplier XYZ',
      notes: 'Invoice #INV-2024-001',
      referenceNumber: 'PO-2024-001'
    });

    if (result) {
      console.log('New quantity:', result.product.newQuantity);
    }
  };

  return (
    <div>
      <button onClick={handleAdjustment} disabled={isLoading}>
        Adjust Stock
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
};
```

#### Using the Component
```typescript
import { ProductAdjustmentForm } from '@/pages/product/components/ProductAdjustmentForm';

const ProductDetail = ({ product }) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <button onClick={() => setShowForm(true)}>Adjust Stock</button>

      {showForm && (
        <ProductAdjustmentForm
          productId={product.id}
          productName={product.name}
          currentStock={product.quantity}
          onSuccess={() => {
            setShowForm(false);
            // Refresh product data
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};
```

### 2. Order Audit Trail

#### Using the Hook
```typescript
import { useOrderAudit } from '@/hooks/useOrderAudit';

const OrderDetails = ({ orderId }) => {
  const { fetchOrderAudit, isLoading } = useOrderAudit();
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    loadAudit();
  }, [orderId]);

  const loadAudit = async () => {
    const data = await fetchOrderAudit(orderId, { limit: 50 });
    if (data) {
      setAuditLogs(data.auditLogs);
    }
  };

  return (
    <div>
      {auditLogs.map(log => (
        <div key={log.id}>
          {log.performedBy.userName} - {log.operation}
        </div>
      ))}
    </div>
  );
};
```

#### Using the Component
```typescript
import { OrderAuditTimeline } from '@/pages/order/components/OrderAuditTimeline';

const OrderPage = ({ orderId }) => {
  return (
    <div>
      <h1>Order Details</h1>
      {/* Order information */}

      {/* Audit Timeline */}
      <OrderAuditTimeline orderId={orderId} limit={50} />
    </div>
  );
};
```

### 3. Admin Audit Dashboard

#### Using the Hook
```typescript
import { useAdminAudit } from '@/hooks/useAdminAudit';

const AdminDashboard = () => {
  const { fetchDashboard, fetchTopPerformers, isLoading } = useAdminAudit();
  const [dashboardData, setDashboardData] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const dashboard = await fetchDashboard({
      startDate: '2025-01-01',
      endDate: '2025-11-06'
    });

    const performers = await fetchTopPerformers({
      limit: 10,
      metric: 'total'
    });

    if (dashboard) setDashboardData(dashboard);
    if (performers) setTopPerformers(performers.topPerformers);
  };

  return (
    <div>
      <h1>Total Operations: {dashboardData?.orderAudits.totalAudits}</h1>
      {/* Display data */}
    </div>
  );
};
```

#### Using the Components
```typescript
import { AuditDashboard } from '@/pages/admin/components/AuditDashboard';
import { UserPerformanceTable } from '@/pages/admin/components/UserPerformanceTable';

const AdminPage = () => {
  return (
    <div>
      {/* Dashboard Overview */}
      <AuditDashboard />

      {/* User Performance */}
      <UserPerformanceTable
        limit={50}
        showTopPerformers={true}
      />
    </div>
  );
};
```

---

## 🔐 Authentication

All API calls automatically include authentication via the axios interceptor in [src/api/axios.ts](src/api/axios.ts):

```typescript
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    if (config.headers && token) {
      config.headers.set("x-access-token", token);
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

No additional authentication setup is required for the new endpoints.

---

## 📊 TypeScript Types

All TypeScript interfaces are properly typed and exported:

### Product Adjustment Types
```typescript
import {
  AdjustmentType,
  ProductAdjustmentRequest,
  AdjustmentHistoryItem,
  AdjustmentStatsResponse
} from '@/types/audit.types';
```

### Order Audit Types
```typescript
import {
  AuditOperation,
  AuditLogEntry,
  OrderAuditResponse
} from '@/types/audit.types';
```

### Admin Dashboard Types
```typescript
import {
  DashboardOverview,
  UserPerformanceSummary,
  TopPerformer,
  PerformanceMetric
} from '@/types/adminAudit.types';
```

---

## 🎨 Styling

The components include detailed CSS examples in their comments. Key styling classes:

### Product Adjustment Form
- `.product-adjustment-form`
- `.form-group`
- `.form-actions`
- `.error-message`

### Order Audit Timeline
- `.order-audit-timeline`
- `.timeline-container`
- `.timeline-entry`
- `.timeline-marker`
- `.timeline-connector`

### Admin Dashboard
- `.audit-dashboard`
- `.stats-grid`
- `.stat-card`
- `.operations-grid`
- `.hourly-chart`

### User Performance Table
- `.user-performance-container`
- `.performance-table`
- `.leaderboard`
- `.top-performers-section`

---

## 🚀 Integration Steps

### Step 1: Import the Hook
```typescript
import { useProductAdjustment } from '@/hooks/useProductAdjustment';
// or
import { useOrderAudit } from '@/hooks/useOrderAudit';
// or
import { useAdminAudit } from '@/hooks/useAdminAudit';
```

### Step 2: Use the Hook in Your Component
```typescript
const MyComponent = () => {
  const { adjustStock, isLoading, error } = useProductAdjustment();

  // Your component logic
};
```

### Step 3: Handle Loading and Error States
```typescript
if (isLoading) return <div>Loading...</div>;
if (error) return <div className="error">{error}</div>;
```

### Step 4: Call API Functions
```typescript
const handleAction = async () => {
  const result = await adjustStock(data);
  if (result) {
    // Success handling
  }
};
```

---

## 🔍 Best Practices

### Product Stock Adjustments
1. **Always provide clear reasons** (minimum 5 characters)
2. **Include reference numbers** for traceability (PO numbers, invoice numbers)
3. **Use `add` type** for receiving stock
4. **Use `remove` type** for damage, theft, or returns
5. **Use `set` type** only for physical inventory counts

### Order Audits
1. **Regularly review audit logs** for unusual patterns
2. **Use date filters** for performance (don't query all logs at once)
3. **Implement pagination** on frontend for large datasets
4. **Cache user activity data** for dashboard views
5. **Monitor high-risk operations** (bulk actions, deletions)

### Admin Dashboard
1. **Implement role-based access** control
2. **Use date range filters** to limit data
3. **Cache dashboard metrics** (1-5 minutes)
4. **Export reports securely**
5. **Log dashboard access** for security audit

---

## 📝 Migration Notes

### Deprecated Endpoint Warning

The direct product update endpoint (`PUT /v1/product/update`) is deprecated. A notice has been added to [src/api/product.ts](src/api/product.ts):

```typescript
/**
 * IMPORTANT: Direct product quantity updates are deprecated
 * Use adjustProductStock() from './productAdjustment' instead
 *
 * This ensures proper audit trail and accountability for all stock changes
 */
```

Always use the new adjustment API for stock changes.

---

## 🧪 Testing Checklist

- [ ] Product stock adjustment creates audit record
- [ ] Adjustment history displays correctly
- [ ] Order audit timeline shows all operations
- [ ] Admin dashboard loads metrics
- [ ] User performance table sorts correctly
- [ ] Top performers display accurately
- [ ] Date filters work properly
- [ ] Authentication tokens are included
- [ ] Error handling works
- [ ] Loading states display

---

## 📚 Component API Reference

### ProductAdjustmentForm Props
```typescript
interface ProductAdjustmentFormProps {
  productId: string;
  productName: string;
  currentStock: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}
```

### OrderAuditTimeline Props
```typescript
interface OrderAuditTimelineProps {
  orderId: string;
  limit?: number;
}
```

### UserPerformanceTable Props
```typescript
interface UserPerformanceTableProps {
  limit?: number;
  showTopPerformers?: boolean;
}
```

---

## 🔗 Related Files

### Core API Files
- [src/api/productAdjustment.ts](src/api/productAdjustment.ts) - Product adjustment API
- [src/api/orderAudit.ts](src/api/orderAudit.ts) - Order audit API
- [src/api/adminAudit.ts](src/api/adminAudit.ts) - Admin dashboard API

### Type Definitions
- [src/types/audit.types.ts](src/types/audit.types.ts) - Audit system types
- [src/types/adminAudit.types.ts](src/types/adminAudit.types.ts) - Admin dashboard types

### Custom Hooks
- [src/hooks/useProductAdjustment.ts](src/hooks/useProductAdjustment.ts)
- [src/hooks/useOrderAudit.ts](src/hooks/useOrderAudit.ts)
- [src/hooks/useAdminAudit.ts](src/hooks/useAdminAudit.ts)

### Components
- [src/pages/product/components/ProductAdjustmentForm.tsx](src/pages/product/components/ProductAdjustmentForm.tsx)
- [src/pages/order/components/OrderAuditTimeline.tsx](src/pages/order/components/OrderAuditTimeline.tsx)
- [src/pages/admin/components/AuditDashboard.tsx](src/pages/admin/components/AuditDashboard.tsx)
- [src/pages/admin/components/UserPerformanceTable.tsx](src/pages/admin/components/UserPerformanceTable.tsx)

---

## 🆘 Support

For questions or issues:
1. Check this documentation
2. Review component comments and examples
3. Verify API endpoint configuration in `config.ts`
4. Check authentication token in localStorage
5. Review network requests in browser DevTools

---

## ✅ Implementation Complete

All systems are ready for integration:
- ✅ Product Stock Adjustment System
- ✅ Order Audit Trail System
- ✅ Admin Audit Dashboard System

**Next Steps:**
1. Import components into your pages
2. Add routing for admin dashboard
3. Apply custom styling
4. Test with backend API
5. Add to navigation menu

---

**Version:** 1.0.0
**Last Updated:** November 6, 2025
**Maintained By:** Frontend Team
