# API Implementation Request - Order Confirmation Panel

## Overview
This document outlines the API requirements for the Order Confirmation Panel feature. Moderators need to verify "processing" orders by calling customers and checking inventory before confirming them for packaging.

---

## Required API Endpoints

### 1. Get Processing Orders (Sorted Ascending)

**Endpoint**: `GET /order/prior/processing`

**Description**: Retrieve all orders with "processing" status, sorted in ascending order by creation date (oldest first).

**Query Parameters**:
```typescript
{
  limit?: number;      // Default: 10
  page?: number;       // Default: 0
  sortBy?: string;     // Default: "createdAt"
  sortOrder?: string;  // Default: "asc"
}
```

**Example Request**:
```http
GET /order/prior/processing?limit=10&page=0&sortBy=createdAt&sortOrder=asc
```

**Success Response**: `200 OK`
```typescript
{
  success: true;
  data: {
    orders: IOrder[];      // Array of processing orders
    totalCount: number;    // Total count of processing orders
    currentPage: number;
    totalPages: number;
  };
}
```

**Order Interface Requirements**:
```typescript
interface IOrder {
  _id: string;
  orderNumber: string;
  createdAt: string;      // ISO date
  customer: {
    _id: string;
    name: string;
    phoneNumber: string;  // Note: using phoneNumber field
    email?: string;
  };
  shipping: {
    address: string;
    district: string;
    division: string;
  };
  products: {
    _id: string;
    productId: string;
    name: string;
    thumbnail?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discount?: number;
  }[];
  totalPrice: number;  // Note: using totalPrice field
  paid: number;
  discount: number;
  deliveryCharge: number;
  remaining: number;
  timestamps: {
    createdAt: string;
    updatedAt: string;
  };
  payment: Array<{
    paymentType: string;
    paymentBy: string;
    amount: number;
    date: Date;
  }>;
  status: 'processing';
  fraudDetection?: {
    isFraud: boolean;
    riskLevel: 'green' | 'yellow' | 'red';
    riskScore: number;
    fraudFlags: string[];
  };
  courier?: {
    provider: string;
    consignmentId?: string;
  };
  deliveryStatus: string;
}

// Note: No inventory data needed - quantity already deducted when order was created
// The frontend just needs order data for verification purposes
```

**Error Response**: `400 Bad Request` / `500 Internal Server Error`
```typescript
{
  success: false;
  message: string;
  error?: string;
}
```

---

### 2. Confirm Order for Packaging

**Endpoint**: `POST /order/prior/:orderId/confirm`

**Description**: Confirm a processing order after moderator verification. This marks the order as ready for packaging.

**URL Parameters**:
```typescript
{
  orderId: string;  // Order ID or order number
}
```

**Request Body**:
```typescript
{
  orderNumber: string;  // Order number for confirmation
}
```

**Example Request**:
```http
POST /order/prior/507f1f77bcf86cd799439011/confirm
Content-Type: application/json

{
  "orderNumber": "ORD-2024-12345"
}
```

**Success Response**: `200 OK`
```typescript
{
  success: true;
  message: "Order confirmed successfully";
  data: {
    order: IOrder;  // Updated order with confirmation timestamp
    confirmation: {
      confirmedAt: string;      // ISO timestamp
      confirmedBy: string;      // User ID of moderator
      orderNumber: string;
    };
  };
}
```

**Order Status Update**:
- Order should remain in "processing" status OR move to a new status like "confirmed" (backend decision)
- Add `confirmedAt` timestamp to order
- Add audit log entry with operation: "order_verified"

**Error Responses**:

**400 Bad Request** - Invalid order number
```typescript
{
  success: false;
  message: "Order number mismatch";
  error: "The provided order number does not match this order";
}
```

**404 Not Found** - Order not found
```typescript
{
  success: false;
  message: "Order not found";
  error: "Order with ID xxx not found";
}
```

**422 Unprocessable Entity** - Order not in processing status
```typescript
{
  success: false;
  message: "Order cannot be confirmed";
  error: "Order is not in processing status";
}
```

---

### 3. Cancel Order from Confirmation Panel

**Endpoint**: `POST /order/prior/:orderId/cancel`

**Description**: Cancel a processing order from the confirmation panel with a reason.

**URL Parameters**:
```typescript
{
  orderId: string;  // Order ID
}
```

**Request Body**:
```typescript
{
  reason: string;  // Cancellation reason (required)
}
```

**Example Request**:
```http
POST /order/prior/507f1f77bcf86cd799439011/cancel
Content-Type: application/json

{
  "reason": "Customer not reachable"
}
```

**Success Response**: `200 OK`
```typescript
{
  success: true;
  message: "Order cancelled successfully";
  data: {
    order: IOrder;  // Updated order with cancelled status
    cancellation: {
      cancelledAt: string;
      cancelledBy: string;
      reason: string;
    };
    inventoryRestored?: {
      items: Array<{
        productId: string;
        quantityRestored: number;
      }>;
    };
  };
}
```

**Order Status Update**:
- Change status to "cancelled"
- Add `cancelledAt` timestamp
- Add `cancellationReason` field
- Restore inventory quantities for all products
- Add audit log entry with operation: "cancel" and reason

**Error Responses**:

**400 Bad Request** - Missing reason
```typescript
{
  success: false;
  message: "Cancellation reason is required";
  error: "Please provide a reason for cancellation";
}
```

**404 Not Found** - Order not found
```typescript
{
  success: false;
  message: "Order not found";
}
```

**422 Unprocessable Entity** - Order already shipped/completed
```typescript
{
  success: false;
  message: "Order cannot be cancelled";
  error: "Order has already been shipped or completed";
}
```

---

### 4. Get Processing Order Status Count (Optional but Recommended)

**Endpoint**: `GET /order/prior/processing/count`

**Description**: Get the total count of orders in processing status.

**Success Response**: `200 OK`
```typescript
{
  success: true;
  data: {
    processingCount: number;
  };
}
```

**Note**: This can also be included in the response of endpoint #1 to reduce API calls.

---

## Additional Notes

### Authentication & Authorization
- All endpoints require valid authentication token
- Required permission: `"order_verify"` or similar

### Audit Trail
- All confirmations and cancellations must be logged in the audit trail
- Audit log should include: timestamp, user ID, action type, order ID, and relevant details (reason for cancellation)

### Inventory Management
- **No inventory endpoint needed** - quantity was already deducted when order was created
- The frontend only displays order data (product name, quantity, price) for verification
- No need to check inventory again during confirmation

### Sorting Priority
- Default sort should be by `createdAt` ascending (oldest orders first)
- Consider adding priority field in future for high-priority orders

### Error Handling
- All error responses should follow the consistent format shown above
- Include descriptive error messages for debugging
- Use appropriate HTTP status codes

---

## Backend Implementation Checklist

- [ ] Create/get processing orders endpoint with sorting
- [ ] Create confirm order endpoint (accepts order number only)
- [ ] Create cancel order endpoint (accepts reason only)
- [ ] Add audit trail operations for "order_verified"
- [ ] Include inventory status in order response or create bulk inventory endpoint
- [ ] Add permission check for "order_verify"
- [ ] Add validation for order number mismatch
- [ ] Add validation for order status transitions
- [ ] Test inventory restoration on cancellation
- [ ] Add API documentation (Swagger/OpenAPI)

---

## Frontend Integration

The frontend will:
1. Fetch processing orders using endpoint #1
2. Display orders in a confirmation panel UI
3. Call confirm endpoint with order number when moderator verifies
4. Call cancel endpoint with reason when moderator rejects
5. Refresh order list after successful operations
6. Show toast notifications for success/error
7. Display audit trail for verification history

---

## Questions for Backend Team

1. Should confirmed orders stay in "processing" status or move to a new status like "confirmed"?
2. Should we include inventory data directly in the order response, or use a separate endpoint?
3. Is there a rate limit for confirmation/cancellation actions?
4. Should there be a time window for confirming processing orders?
5. Do you need webhook notifications for order confirmations?

---

**Document Version**: 1.0
**Last Updated**: 2025-02-03
**Status**: Ready for Backend Implementation
