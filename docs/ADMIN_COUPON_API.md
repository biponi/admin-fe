# Admin Coupon Management API Documentation

## Base URL
```
Development: http://localhost:5000/api/v1/coupons
Production: https://your-domain.com/api/v1/coupons
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

---

## Global Coupon Management

### 1. Create Global Coupon

**Endpoint:** `POST /api/v1/coupons/global`

**Description:** Creates a new global/public coupon that any customer can use.

**Request Body:**
```typescript
interface CreateGlobalCouponRequest {
  code: string;                    // Unique coupon code (3-20 chars, uppercase letters & numbers only)
  name: string;                     // Display name (3-100 chars)
  description?: string;               // Optional description (max 500 chars)
  discountType: 'fixed' | 'percentage';  // Discount type
  discountValue: number;              // Discount amount (> 0)
  maxUsesPerCustomer: number;         // 1-5 uses per customer (default: 1)
  totalUsageLimit?: number;            // Optional total usage limit (null = unlimited)
  validFrom: string;                   // ISO date string "2025-01-01T00:00:00.000Z"
  validUntil: string;                  // ISO date string (must be after validFrom)
  minOrderAmount?: number;             // Minimum order amount required (default: 0)
  maxDiscountAmount?: number;           // Max discount cap for percentage (optional)
  firstOrderOnly?: boolean;            // Only valid for first orders (default: false)
  autoApply?: boolean;                // Automatically apply best coupon (default: false)
  priority?: number;                   // Auto-apply priority (default: 0)
  applicableProducts?: string[];        // Array of product IDs (optional)
  applicableCategories?: string[];      // Array of categories (optional)
}

// Example Request
{
  "code": "SUMMER2025",
  "name": "Summer Sale 2025",
  "description": "Special summer discount for all customers",
  "discountType": "percentage",
  "discountValue": 15,
  "maxUsesPerCustomer": 3,
  "totalUsageLimit": 1000,
  "validFrom": "2025-01-01T00:00:00.000Z",
  "validUntil": "2025-03-31T23:59:59.999Z",
  "minOrderAmount": 500,
  "maxDiscountAmount": 500,
  "firstOrderOnly": false,
  "autoApply": true,
  "priority": 10,
  "applicableProducts": [],
  "applicableCategories": []
}
```

**Response (201 Created):**
```typescript
interface CreateGlobalCouponResponse {
  success: true;
  message: "Global coupon created successfully";
  data: {
    _id: string;
    code: string;
    name: string;
    description: string;
    discountType: 'fixed' | 'percentage';
    discountValue: number;
    maxUsesPerCustomer: number;
    totalUsageLimit: number;
    usedCount: number;
    validFrom: Date;
    validUntil: Date;
    status: 'active' | 'expired' | 'disabled' | 'scheduled';
    minOrderAmount: number;
    maxDiscountAmount: number;
    firstOrderOnly: boolean;
    autoApply: boolean;
    priority: number;
    applicableProducts: string[];
    applicableCategories: string[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }
}
```

**Error Response (400):**
```typescript
interface ErrorResponse {
  success: false;
  message: "Validation error";
  error: string;  // Specific validation error message
}
```

---

### 2. Get All Global Coupons

**Endpoint:** `GET /api/v1/coupons/global`

**Query Parameters:**
```typescript
interface GetGlobalCouponsQuery {
  status?: 'active' | 'expired' | 'disabled' | 'scheduled';
  discountType?: 'fixed' | 'percentage';
}

// Examples
GET /api/v1/coupons/global?status=active
GET /api/v1/coupons/global?discountType=percentage
GET /api/v1/coupons/global?status=active&discountType=fixed
```

**Response (200 OK):**
```typescript
interface GetGlobalCouponsResponse {
  success: true;
  count: number;
  data: Array<{
    _id: string;
    code: string;
    name: string;
    discountType: 'fixed' | 'percentage';
    discountValue: number;
    maxUsesPerCustomer: number;
    totalUsageLimit: number;
    usedCount: number;
    validFrom: Date;
    validUntil: Date;
    status: string;
    minOrderAmount: number;
    maxDiscountAmount: number;
    firstOrderOnly: boolean;
    autoApply: boolean;
    priority: number;
  }>;
}
```

---

### 3. Get Global Coupon by Code

**Endpoint:** `GET /api/v1/coupons/global/:code`

**URL Parameter:**
- `code` - Coupon code (case-insensitive, will be converted to uppercase)

**Response (200 OK):**
```typescript
interface GetGlobalCouponResponse {
  success: true;
  data: {
    _id: string;
    code: string;
    name: string;
    description: string;
    discountType: 'fixed' | 'percentage';
    discountValue: number;
    maxUsesPerCustomer: number;
    totalUsageLimit: number;
    usedCount: number;
    validFrom: Date;
    validUntil: Date;
    status: string;
    minOrderAmount: number;
    maxDiscountAmount: number;
    firstOrderOnly: boolean;
    autoApply: boolean;
    priority: number;
    applicableProducts: string[];
    applicableCategories: string[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  };
}
```

**Error Response (404):**
```typescript
interface ErrorResponse {
  success: false;
  message: "Coupon not found";
}
```

---

### 4. Update Global Coupon

**Endpoint:** `PATCH /api/v1/coupons/global/:code`

**URL Parameter:**
- `code` - Coupon code to update

**Request Body (all fields optional):**
```typescript
interface UpdateGlobalCouponRequest {
  name?: string;
  description?: string;
  discountType?: 'fixed' | 'percentage';
  discountValue?: number;
  maxUsesPerCustomer?: number;  // 1-5
  totalUsageLimit?: number;
  validFrom?: string;  // ISO date
  validUntil?: string;  // ISO date
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  firstOrderOnly?: boolean;
  autoApply?: boolean;
  priority?: number;
  status?: 'active' | 'disabled';
  applicableProducts?: string[];
  applicableCategories?: string[];
}

// Example Request
{
  "status": "active",
  "autoApply": true,
  "priority": 20
}
```

**Response (200 OK):**
```typescript
interface UpdateGlobalCouponResponse {
  success: true;
  message: "Global coupon updated successfully";
  data: {
    // Updated coupon object
  };
}
```

---

### 5. Disable Global Coupon

**Endpoint:** `POST /api/v1/coupons/global/:code/disable`

**Description:** Immediately disables a global coupon (cannot be used until re-enabled).

**URL Parameter:**
- `code` - Coupon code to disable

**Response (200 OK):**
```typescript
interface DisableCouponResponse {
  success: true;
  message: "Global coupon disabled successfully";
  data: {
    _id: string;
    code: string;
    status: 'disabled';
  };
}
```

---

### 6. Delete Global Coupon

**Endpoint:** `DELETE /api/v1/coupons/global/:code`

**Description:** Permanently deletes a global coupon.

**URL Parameter:**
- `code` - Coupon code to delete

**Response (200 OK):**
```typescript
interface DeleteCouponResponse {
  success: true;
  message: "Global coupon deleted successfully";
}
```

---

### 7. Get Global Coupon Statistics

**Endpoint:** `GET /api/v1/coupons/global/stats`

**Description:** Returns usage statistics for all global coupons.

**Response (200 OK):**
```typescript
interface GlobalCouponStatsResponse {
  success: true;
  data: {
    totalCoupons: number;      // Total global coupons created
    activeCoupons: number;      // Currently active
    expiredCoupons: number;     // Expired but not deleted
    disabledCoupons: number;    // Manually disabled
    mostUsed: Array<{
      code: string;
      usageCount: number;
      totalDiscount: number;    // Total discount given in BDT
    }>;
  };
}
```

---

## Customer-Specific Coupon Management

### 8. Assign Coupon to Customer(s)

**Endpoint:** `POST /api/v1/coupons/customer/assign`

**Description:** Assigns a coupon to one or more customers. Supports single or bulk assignment.

**Request Body:**
```typescript
interface AssignCouponToCustomerRequest {
  phoneNumbers: string[];              // Array of 11-digit BD phone numbers (max 1000)
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  maxUses: number;                     // 1-5 uses per customer
  validFrom: string;                   // ISO date string
  validUntil: string;                  // ISO date string
  minOrderAmount?: number;               // Default: 0
  maxDiscountAmount?: number;             // For percentage discounts
  applicableProducts?: string[];          // Optional product restrictions
  applicableCategories?: string[];        // Optional category restrictions
  code?: string;                        // Optional custom code (auto-generated if not provided)
  metadata?: {
    source?: 'single' | 'bulk' | 'campaign' | 'automation';
    notes?: string;
    campaignId?: string;
  };
}

// Example: Single Customer
{
  "phoneNumbers": ["01712345678"],
  "discountType": "fixed",
  "discountValue": 100,
  "maxUses": 3,
  "validFrom": "2025-01-01T00:00:00.000Z",
  "validUntil": "2025-06-30T23:59:59.999Z",
  "minOrderAmount": 0,
  "metadata": {
    "source": "single",
    "notes": "VIP customer compensation"
  }
}

// Example: Bulk Assignment
{
  "phoneNumbers": [
    "01712345678",
    "01812345678",
    "01912345678"
  ],
  "discountType": "percentage",
  "discountValue": 10,
  "maxUses": 2,
  "validFrom": "2025-01-01T00:00:00.000Z",
  "validUntil": "2025-03-31T23:59:59.999Z",
  "minOrderAmount": 500,
  "maxDiscountAmount": 300
}
```

**Response (201 Created):**
```typescript
interface AssignCouponResponse {
  success: true;
  message: "Coupons assigned to 3 customer(s)";
  data: Array<{
    phoneNumber: string;
    success: boolean;
    couponId?: string;
    code?: string;
    error?: string;  // Present if success: false
  }>;
}
```

---

### 9. Bulk Assign Coupons by Customer Segment

**Endpoint:** `POST /api/v1/coupons/customer/bulk-assign`

**Description:** Assigns coupons to all customers matching specific criteria (segmentation).

**Request Body:**
```typescript
interface BulkAssignCouponsRequest {
  // Option 1: Provide phone numbers directly
  phoneNumbers?: string[];

  // Option 2: Or specify segment and criteria
  segment?: 'inactive' | 'highValue' | 'new' | 'frequent' | 'firstTime' | 'churned' | 'byProduct' | 'byOrderValue';
  segmentCriteria?: {
    // For 'inactive', 'churned'
    days?: number;              // Days since last order (default: 60)

    // For 'highValue'
    minSpent?: number;          // Minimum total spent (default: 5000)

    // For 'new'
    days?: number;              // Days since registration (default: 30)

    // For 'frequent', 'churned'
    minOrders?: number;         // Minimum order count (default: 5)

    // For 'byProduct'
    productId?: string;         // Product ID

    // For 'byOrderValue'
    minOrderValue?: number;     // Minimum order amount
    maxOrderValue?: number;     // Maximum order amount
  };

  // Coupon data to assign
  couponData: {
    discountType: 'fixed' | 'percentage';
    discountValue: number;
    maxUses: number;
    validFrom: string;
    validUntil: string;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    applicableProducts?: string[];
    applicableCategories?: string[];
  };

  adminId?: string;
}

// Example: Inactive Customers
{
  "segment": "inactive",
  "segmentCriteria": {
    "days": 60
  },
  "couponData": {
    "discountType": "percentage",
    "discountValue": 15,
    "maxUses": 3,
    "validFrom": "2025-01-01T00:00:00.000Z",
    "validUntil": "2025-03-31T23:59:59.999Z",
    "minOrderAmount": 300
  }
}

// Example: High-Value Customers
{
  "segment": "highValue",
  "segmentCriteria": {
    "minSpent": 10000
  },
  "couponData": {
    "discountType": "fixed",
    "discountValue": 200,
    "maxUses": 5,
    "validFrom": "2025-01-01T00:00:00.000Z",
    "validUntil": "2025-06-30T23:59:59.999Z"
  }
}

// Example: New Customers
{
  "segment": "new",
  "segmentCriteria": {
    "days": 30
  },
  "couponData": {
    "discountType": "fixed",
    "discountValue": 50,
    "maxUses": 1,
    "validFrom": "2025-01-01T00:00:00.000Z",
    "validUntil": "2025-03-31T23:59:59.999Z"
  }
}
```

**Response (201 Created):**
```typescript
interface BulkAssignResponse {
  success: true;
  message: "Bulk assignment completed for 156 customers";
  data: {
    success: Array<{
      phoneNumber: string;
      couponId: string;
      code: string;
    }>;
    failed: Array<{
      phoneNumber: string;
      error: string;
    }>;
    total: number;
  };
}
```

---

### 10. Get Customer's Coupons

**Endpoint:** `GET /api/v1/coupons/customer/:phone`

**URL Parameter:**
- `phone` - Customer's 11-digit phone number

**Query Parameters:**
```typescript
// No query parameters - returns all active coupons
GET /api/v1/coupons/customer/01712345678

// Returns both customer-specific and applicable global coupons
```

**Response (200 OK):**
```typescript
interface GetCustomerCouponsResponse {
  success: true;
  count: number;
  data: Array<{
    _id: string;
    customerId: string;
    code: string;
    discountType: 'fixed' | 'percentage';
    discountValue: number;
    maxUses: number;
    usedCount: number;
    remainingUses: number;      // Virtual: maxUses - usedCount
    validFrom: Date;
    validUntil: Date;
    status: 'active' | 'expired' | 'disabled' | 'fully_used';
    minOrderAmount: number;
    maxDiscountAmount: number;
    applicableProducts?: string[];
    applicableCategories?: string[];
    assignedBy: string;
    assignedAt: Date;
    metadata?: {
      source: string;
      notes?: string;
      campaignId?: string;
    };
  }>;
}
```

---

### 11. Get Customer Coupon Usage History

**Endpoint:** `GET /api/v1/coupons/customer/:phone/history`

**Description:** Returns all coupon usage history for a specific customer.

**URL Parameter:**
- `phone` - Customer's 11-digit phone number

**Response (200 OK):**
```typescript
interface CustomerUsageHistoryResponse {
  success: true;
  count: number;
  data: Array<{
    _id: string;
    couponType: 'global' | 'customer';
    couponId: string;
    couponCode: string;
    customerId: string;
    orderId: string;
    orderNumber: number;
    discountAmount: number;
    orderTotal: number;
    usedAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }>;
}
```

---

### 12. Get Customer Coupon by ID

**Endpoint:** `GET /api/v1/coupons/customer/details/:id`

**URL Parameter:**
- `id` - Customer coupon ID (MongoDB ObjectId)

**Response (200 OK):**
```typescript
interface GetCustomerCouponResponse {
  success: true;
  data: {
    _id: string;
    customerId: string;
    code: string;
    discountType: 'fixed' | 'percentage';
    discountValue: number;
    maxUses: number;
    usedCount: number;
    validFrom: Date;
    validUntil: Date;
    status: string;
    minOrderAmount: number;
    maxDiscountAmount: number;
    applicableProducts: string[];
    applicableCategories: string[];
    assignedBy: string;
    assignedAt: Date;
    metadata: object;
    createdAt: Date;
    updatedAt: Date;
  };
}
```

---

### 13. Update Customer Coupon

**Endpoint:** `PATCH /api/v1/coupons/customer/:id`

**URL Parameter:**
- `id` - Customer coupon ID

**Request Body (all fields optional):**
```typescript
interface UpdateCustomerCouponRequest {
  maxUses?: number;          // 1-5
  validFrom?: string;
  validUntil?: string;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  status?: 'active' | 'disabled';
  applicableProducts?: string[];
  applicableCategories?: string[];
}

// Example Request
{
  "status": "active",
  "maxUses": 5
}
```

**Response (200 OK):**
```typescript
interface UpdateCustomerCouponResponse {
  success: true;
  message: "Customer coupon updated successfully";
  data: {
    // Updated coupon object
  };
}
```

---

### 14. Disable Customer Coupon

**Endpoint:** `POST /api/v1/coupons/customer/:id/disable`

**URL Parameter:**
- `id` - Customer coupon ID

**Response (200 OK):**
```typescript
interface DisableCustomerCouponResponse {
  success: true;
  message: "Customer coupon disabled successfully";
  data: {
    _id: string;
    code: string;
    status: 'disabled';
  };
}
```

---

### 15. Delete Customer Coupon

**Endpoint:** `DELETE /api/v1/coupons/customer/:id`

**URL Parameter:**
- `id` - Customer coupon ID

**Response (200 OK):**
```typescript
interface DeleteCustomerCouponResponse {
  success: true;
  message: "Customer coupon deleted successfully";
}
```

---

## Analytics & Insights

### 16. Get Customer Segment Summary

**Endpoint:** `GET /api/v1/coupons/analytics/segments`

**Description:** Returns summary of all customer segments for targeting.

**Response (200 OK):**
```typescript
interface SegmentSummaryResponse {
  success: true;
  data: {
    newCustomers: {
      count: number;
      customers: Array<{
        phoneNumber: string;
        firstOrderDate: Date;
        orderCount: number;
        totalSpent: number;
      }>;
    };
    inactiveCustomers: {
      count: number;
      customers: Array<{
        phoneNumber: string;
        lastOrderDate: Date;
        orderCount: number;
        totalSpent: number;
      }>;
    };
    highValueCustomers: {
      count: number;
      customers: Array<{
        phoneNumber: string;
        totalSpent: number;
        orderCount: number;
        lastOrderDate: Date;
        avgOrderValue: number;
      }>;
    };
    frequentCustomers: {
      count: number;
      customers: Array<{
        phoneNumber: string;
        orderCount: number;
        totalSpent: number;
        lastOrderDate: Date;
        firstOrderDate: Date;
      }>;
    };
    firstTimeCustomers: {
      count: number;
      customers: Array<{
        phoneNumber: string;
        orderCount: number;
        totalSpent: number;
        orderDate: Date;
      }>;
    };
  };
}
```

---

### 17. Get Coupon Usage History

**Endpoint:** `GET /api/v1/coupons/analytics/usage`

**Query Parameters:**
```typescript
interface GetUsageHistoryQuery {
  couponType: 'global' | 'customer';
  couponId: string;  // MongoDB ObjectId
}

// Example
GET /api/v1/coupons/analytics/usage?couponType=global&couponId=507f1f77bcf86cd79943911
```

**Response (200 OK):**
```typescript
interface UsageHistoryResponse {
  success: true;
  count: number;
  data: Array<{
    _id: string;
    couponType: 'global' | 'customer';
    couponId: string;
    couponCode: string;
    customerId: string;
    orderId: string;
    orderNumber: number;
    discountAmount: number;
    orderTotal: number;
    usedAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }>;
}
```

---

## Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Resource not found |
| 500 | Internal server error |

---

## Common Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  message: string;
  error?: string;  // Detailed error message (optional)
  errors?: Array<{  // Validation errors (optional)
    field: string;
    message: string;
  }>;
}
```

---

## Rate Limiting

All admin endpoints are rate-limited:
- **Default:** 100 requests per 15 minutes per IP
- **Bulk Operations:** 10 requests per hour per user

Headers included in rate-limited responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640971520000
```

---

## Testing with cURL

### Create Global Coupon
```bash
curl -X POST https://your-domain.com/api/v1/coupons/global \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SUMMER2025",
    "name": "Summer Sale",
    "discountType": "percentage",
    "discountValue": 15,
    "maxUsesPerCustomer": 3,
    "validFrom": "2025-01-01T00:00:00.000Z",
    "validUntil": "2025-03-31T23:59:59.999Z",
    "minOrderAmount": 500
  }'
```

### Assign Coupon to Customer
```bash
curl -X POST https://your-domain.com/api/v1/coupons/customer/assign \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumbers": ["01712345678"],
    "discountType": "fixed",
    "discountValue": 100,
    "maxUses": 3,
    "validFrom": "2025-01-01T00:00:00.000Z",
    "validUntil": "2025-06-30T23:59:59.999Z"
  }'
```

### Bulk Assign to Segment
```bash
curl -X POST https://your-domain.com/api/v1/coupons/customer/bulk-assign \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "segment": "inactive",
    "segmentCriteria": {
      "days": 60
    },
    "couponData": {
      "discountType": "percentage",
      "discountValue": 10,
      "maxUses": 2,
      "validFrom": "2025-01-01T00:00:00.000Z",
      "validUntil": "2025-03-31T23:59:59.999Z"
    }
  }'
```

---

## Notes for Developers

1. **Date Format:** All dates must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)

2. **Phone Numbers:** Must be 11 digits starting with '0' (Bangladesh format)

3. **Coupon Codes:**
   - Automatically converted to uppercase
   - Must be 3-20 characters
   - Only alphanumeric characters allowed

4. **Discount Values:**
   - Fixed: Enter absolute value (e.g., 100 for 100 BDT off)
   - Percentage: Enter percentage (e.g., 15 for 15% off)
   - Percentage caps applied using `maxDiscountAmount`

5. **Usage Tracking:** Coupons automatically track usage and expire after:
   - Reaching `totalUsageLimit` (global coupons)
   - Customer uses all `maxUsesPerCustomer`
   - Passing `validUntil` date

6. **SMS Notifications:** Automatically sent for:
   - Customer coupon assignments
   - Bulk assignments
   - Coupon usage confirmation
   - Expiry reminders (2 days before)

---

## Support & Contact

For API support or questions:
- **Email:** tech@priorbd.com
- **Documentation:** https://docs.priorbd.com/api
- **Issue Tracker:** https://github.com/your-org/issues
