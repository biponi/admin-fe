# Order-wise Commission Management API Documentation

## Table of Contents

1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [API 1: Order-wise Commission Listing](#api-1-order-wise-commission-listing)
4. [API 2: Order Commission Details](#api-2-order-commission-details)
5. [API 3: Order Commission Count](#api-3-order-commission-count)
6. [Bulk Commission Status Update APIs](#bulk-commission-status-update-apis)
7. [Response Schema Reference](#response-schema-reference)
8. [Key Features](#key-features)
9. [Usage Examples](#usage-examples)
10. [Error Handling](#error-handling)
11. [Performance & Optimization](#performance--optimization)
12. [Changes from Existing APIs](#changes-from-existing-apis)

---

## Overview

The Order-wise Commission Management APIs provide a new way to view and manage commissions at the **order level** rather than the **product level**. This gives businesses a clearer view of commission data by aggregating multiple product commissions into a single order-level view.

### Why Order-wise?

**Before (Product-wise):**
```
Order #12345
├── Product A - Commission: $20.00
├── Product B - Commission: $15.50
└── Product C - Commission: $10.25
```
**After (Order-wise):**
```
Order #12345 - Total Commission: $45.75
└── Recipient: John Doe (3 products)
```

### Key Benefits

- **Aggregated View**: See total commission per order instead of per product
- **Multiple Recipients**: Handle cases where different users modified an order
- **Product-Recipient Mapping**: Know exactly which user gets commission for which product
- **2-Decimal Precision**: All monetary calculations use precise 2-decimal formatting
- **Efficient Queries**: Single MongoDB aggregation pipeline (no N+1 problems)

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/commission/orders` | GET | Get order-wise commission listing with pagination |
| `/api/v1/commission/order/:orderId` | GET | Get detailed commission breakdown for a specific order |
| `/api/v1/commission/order/:orderId/count` | GET | Get commission count for an order |
| `/api/v1/commission/bulk-status` | POST | Bulk update commission status by IDs (Queue-based, async) |
| `/api/v1/commission/bulk-status-direct` | POST | Bulk update commission status by IDs (Direct, sync, max 10) |
| `/api/v1/commission/bulk-status-by-orders` | POST | Bulk update commission status by order numbers (Queue-based, async) |
| `/api/v1/commission/bulk-status-by-orders-direct` | POST | Bulk update commission status by order numbers (Direct, sync, max 10) |
| `/api/v1/commission/bulk-operation/:jobId` | GET | Get bulk operation status by job ID |

### Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## API 1: Order-wise Commission Listing

### Endpoint

```
GET /api/v1/commission/orders
```

### Description

Returns commission records grouped by order. Each row represents one order with aggregated commission data from all products in that order.

### Query Parameters

#### Pagination Parameters

| Parameter | Type | Default | Limits | Description |
|-----------|------|---------|---------|-------------|
| `page` | Integer | 1 | ≥ 1 | Page number |
| `limit` | Integer | 20 | 1-500 | Items per page |

#### Sorting Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sortBy` | String | createdAt | Field to sort by: `createdAt`, `totalCommissionAmount`, `orderNumber`, `productCount` |
| `sortOrder` | String | desc | Sort order: `asc` or `desc` |

#### Filter Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | String | Filter by commission status: `pending`, `unpaid`, `paid`, `hold`, `cancelled`, `removed` |
| `userId` | String | Filter by commission recipient user ID |
| `orderId` | String | Filter by specific order ID |
| `orderNumber` | Number | Filter by order number |
| `startDate` | String (ISO 8601) | Filter by creation date (start) |
| `endDate` | String (ISO 8601) | Filter by creation date (end) |
| `paidOffStartDate` | String (ISO 8601) | Filter by paid off date (start) |
| `paidOffEndDate` | String (ISO 8601) | Filter by paid off date (end) |
| `search` | String | Search in `userName` and `orderNumber` fields |

### Example Request

```bash
# Get first page of order-wise commissions
GET /api/v1/commission/orders

# Get second page with 50 items, sorted by total commission amount
GET /api/v1/commission/orders?page=2&limit=50&sortBy=totalCommissionAmount&sortOrder=desc

# Filter by status and date range
GET /api/v1/commission/orders?status=unpaid&startDate=2025-01-01&endDate=2025-12-31

# Search for specific user or order
GET /api/v1/commission/orders?search=John

# Filter by specific user
GET /api/v1/commission/orders?userId=user_uuid_here
```

### Example Response

```json
{
  "success": true,
  "data": {
    "commissions": [
      {
        "orderId": "550e8400-e29b-41d4-a716-446655440000",
        "orderNumber": 12345,
        "totalCommissionAmount": 45.75,
        "productCount": 3,
        "recipients": [
          {
            "userId": "user1_uuid",
            "userName": "John Doe",
            "userAvatar": "https://example.com/avatar1.jpg",
            "commissionAmount": 30.50,
            "productCount": 2
          },
          {
            "userId": "user2_uuid",
            "userName": "Jane Smith",
            "userAvatar": "https://example.com/avatar2.jpg",
            "commissionAmount": 15.25,
            "productCount": 1
          }
        ],
        "statusBreakdown": {
          "pending": { "count": 1, "amount": 15.25 },
          "unpaid": { "count": 2, "amount": 30.50 }
        },
        "createdAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPreviousPage": false,
      "nextPage": 2,
      "prevPage": null
    },
    "summary": {
      "totalOrders": 100,
      "totalCommissionAmount": 15000.75,
      "paidAmount": 5000.50,
      "unpaidAmount": 8000.25,
      "pendingAmount": 2000.00,
      "holdAmount": 0,
      "cancelledAmount": 0,
      "removedAmount": 0
    }
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `commissions` | Array | Array of order-wise commission objects |
| `pagination` | Object | Pagination metadata |
| `summary` | Object | Summary statistics for all matching orders |

#### Commission Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `orderId` | String | Unique order identifier (UUID) |
| `orderNumber` | Number | Human-readable order number |
| `totalCommissionAmount` | Number | Sum of all commission amounts (2 decimals) |
| `productCount` | Number | Total number of commissionable products |
| `recipients` | Array | List of users receiving commission from this order |
| `statusBreakdown` | Object | Breakdown by commission status |
| `createdAt` | String (ISO 8601) | Date of first commission creation |

---

## API 2: Order Commission Details

### Endpoint

```
GET /api/v1/commission/order/:orderId
```

### Description

Returns complete commission details for a specific order, including product-level breakdown showing which user receives commission for each product.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `orderId` | String (UUID) | Yes | Order ID |

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `includeProducts` | Boolean | true | Include product-level details |

### Example Request

```bash
# Get commission details for an order
GET /api/v1/commission/order/550e8400-e29b-41d4-a716-446655440000

# Without product details
GET /api/v1/commission/order/550e8400-e29b-41d4-a716-446655440000?includeProducts=false
```

### Example Response

```json
{
  "success": true,
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": 12345,
    "summary": {
      "totalProducts": 3,
      "totalCommissionAmount": 45.75,
      "totalQuantity": 10
    },
    "statusBreakdown": {
      "pending": { "count": 1, "amount": 15.25 },
      "unpaid": { "count": 2, "amount": 30.50 }
    },
    "products": [
      {
        "productId": "prod1_uuid",
        "productName": "Product A",
        "productImage": "https://example.com/product1.jpg",
        "quantity": 5,
        "productPrice": 100.00,
        "totalPrice": 500.00,
        "commission": {
          "recipient": {
            "userId": "user1_uuid",
            "userName": "John Doe",
            "userAvatar": "https://example.com/avatar1.jpg"
          },
          "type": "percentage",
          "rate": 10,
          "amount": 50.00,
          "status": "unpaid",
          "commissionId": "comm1_uuid",
          "createdAt": "2025-01-15T10:30:00.000Z",
          "paidOffDate": null
        }
      },
      {
        "productId": "prod2_uuid",
        "productName": "Product B",
        "productImage": "https://example.com/product2.jpg",
        "quantity": 3,
        "productPrice": 50.00,
        "totalPrice": 150.00,
        "commission": {
          "recipient": {
            "userId": "user1_uuid",
            "userName": "John Doe",
            "userAvatar": "https://example.com/avatar1.jpg"
          },
          "type": "fixed",
          "rate": 5.00,
          "amount": 15.00,
          "status": "unpaid",
          "commissionId": "comm2_uuid",
          "createdAt": "2025-01-15T10:30:00.000Z",
          "paidOffDate": null
        }
      },
      {
        "productId": "prod3_uuid",
        "productName": "Product C",
        "productImage": "https://example.com/product3.jpg",
        "quantity": 2,
        "productPrice": 75.00,
        "totalPrice": 150.00,
        "commission": {
          "recipient": {
            "userId": "user2_uuid",
            "userName": "Jane Smith",
            "userAvatar": "https://example.com/avatar2.jpg"
          },
          "type": "percentage",
          "rate": 10,
          "amount": 15.00,
          "status": "pending",
          "commissionId": "comm3_uuid",
          "createdAt": "2025-01-15T10:30:00.000Z",
          "paidOffDate": null
        }
      }
    ],
    "recipients": [
      {
        "userId": "user1_uuid",
        "userName": "John Doe",
        "userAvatar": "https://example.com/avatar1.jpg",
        "totalCommissionAmount": 65.00,
        "productCount": 2
      },
      {
        "userId": "user2_uuid",
        "userName": "Jane Smith",
        "userAvatar": "https://example.com/avatar2.jpg",
        "totalCommissionAmount": 15.00,
        "productCount": 1
      }
    ],
    "orderDates": {
      "createdAt": "2025-01-15T10:30:00.000Z",
      "firstCommissionCreated": "2025-01-15T10:30:00.000Z"
    }
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `orderId` | String | Order identifier (UUID) |
| `orderNumber` | Number | Human-readable order number |
| `summary` | Object | Order-level summary |
| `statusBreakdown` | Object | Status breakdown with counts and amounts |
| `products` | Array | Product-level commission details |
| `recipients` | Array | Grouped recipients by user |
| `orderDates` | Object | Order date information |

#### Product Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `productId` | String | Product identifier |
| `productName` | String | Product name |
| `productImage` | String | Product image URL |
| `quantity` | Number | Quantity ordered |
| `productPrice` | Number | Unit price (2 decimals) |
| `totalPrice` | Number | Total price (2 decimals) |
| `commission` | Object | Commission details with recipient information |

#### Commission Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `recipient` | Object | User who receives this commission |
| `type` | String | Commission type: `percentage` or `fixed` |
| `rate` | Number | Commission rate (percentage or fixed amount) |
| `amount` | Number | Commission amount (2 decimals) |
| `status` | String | Commission status |
| `commissionId` | String | Commission record identifier |
| `createdAt` | String (ISO 8601) | Creation date |
| `paidOffDate` | String (ISO 8601) \| null | Date commission was paid |

---

## API 3: Order Commission Count

### Endpoint

```
GET /api/v1/commission/order/:orderId/count
```

### Description

Returns the number of commission records for a specific order.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `orderId` | String (UUID) | Yes | Order ID |

### Example Request

```bash
GET /api/v1/commission/order/550e8400-e29b-41d4-a716-446655440000/count
```

### Example Response

```json
{
  "success": true,
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "commissionCount": 3
  }
}
```

---

## Bulk Commission Status Update APIs

The bulk commission status update APIs provide two approaches for updating multiple commission records at once:

1. **Queue-based (Async)** - For large batches (> 10 commissions). Returns immediately with job ID.
2. **Direct (Sync)** - For small batches (≤ 10 commissions). Waits for completion.

### When to Use Which Approach?

| Scenario | Commissions | Method | Response Time | API |
|----------|-------------|---------|---------------|-----|
| Single update | 1 | Existing API | < 50ms | `PATCH /api/v1/commission/:id/status` |
| Small batch | 2-10 | Direct | < 2s | `POST /api/v1/commission/bulk-status-direct` |
| Medium batch | 11-50 | Queue | < 100ms | `POST /api/v1/commission/bulk-status` |
| Large batch | 51-500 | Queue | < 100ms | `POST /api/v1/commission/bulk-status` |
| By order numbers | Any | Queue or Direct | < 100ms or < 2s | `POST /api/v1/commission/bulk-status-by-orders` |

---

### API 4: Bulk Update by Commission IDs (Queue-based)

#### Endpoint

```
POST /api/v1/commission/bulk-status
```

#### Description

Updates commission status for multiple commission IDs using a background queue. Returns immediately with a job ID for tracking. Best for large batches.

#### Request Body

```json
{
  "commissionIds": ["id1", "id2", "id3"],
  "status": "paid",
  "notes": "Batch payment #123",
  "paidOffDate": "2026-06-04T10:00:00Z"
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `commissionIds` | Array | Yes | Array of commission IDs (max 1000) |
| `status` | String | Yes | New status: `pending`, `unpaid`, `paid`, `hold`, `cancelled`, `removed` |
| `notes` | String | No | Optional notes (max 500 characters) |
| `paidOffDate` | String (ISO 8601) | No | Required when status=`paid` if auto-set not desired |

#### Response (< 100ms)

```json
{
  "success": true,
  "data": {
    "bulkOperationId": "BULK-COMM-1704451200000-abc123",
    "jobId": "123",
    "commissionsCount": 15,
    "estimatedTime": "5 seconds",
    "message": "Bulk commission status update queued for processing"
  }
}
```

#### Example Request

```bash
curl -X POST "https://api.example.com/api/v1/commission/bulk-status" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "commissionIds": ["comm-id-1", "comm-id-2", "comm-id-3"],
    "status": "paid",
    "notes": "Batch payment #123"
  }'
```

---

### API 5: Bulk Update by Commission IDs (Direct)

#### Endpoint

```
POST /api/v1/commission/bulk-status-direct
```

#### Description

Updates commission status for multiple commission IDs synchronously. Waits for completion before returning. Limited to 10 commissions per request.

#### Request Body

Same as API 4

#### Response (1-2 seconds)

```json
{
  "success": true,
  "data": {
    "totalRequested": 10,
    "updatedCount": 10,
    "skippedCount": 0,
    "message": "Successfully updated 10 commission(s)."
  }
}
```

#### Example Request

```bash
curl -X POST "https://api.example.com/api/v1/commission/bulk-status-direct" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "commissionIds": ["comm-id-1", "comm-id-2"],
    "status": "paid",
    "notes": "Batch payment #456"
  }'
```

---

### API 6: Bulk Update by Order Numbers (Queue-based)

#### Endpoint

```
POST /api/v1/commission/bulk-status-by-orders
```

#### Description

Updates commission status for all commissions associated with specific order numbers using a background queue. Returns immediately with a job ID.

#### Request Body

```json
{
  "orderNumbers": [12345, 12346, 12347],
  "status": "paid",
  "notes": "Batch payment for orders",
  "paidOffDate": "2026-06-04T10:00:00Z"
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `orderNumbers` | Array of Numbers | Yes | Array of order numbers (max 1000) |
| `status` | String | Yes | New status |
| `notes` | String | No | Optional notes |
| `paidOffDate` | String (ISO 8601) | No | Optional paid off date |

#### Response (< 100ms)

```json
{
  "success": true,
  "data": {
    "bulkOperationId": "BULK-COMM-1704451200000-xyz789",
    "jobId": "124",
    "ordersCount": 3,
    "estimatedTime": "3 seconds",
    "message": "Bulk commission status update by orders queued for processing"
  }
}
```

#### Example Request

```bash
curl -X POST "https://api.example.com/api/v1/commission/bulk-status-by-orders" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumbers": [12345, 12346, 12347],
    "status": "paid",
    "notes": "Batch payment for orders"
  }'
```

---

### API 7: Bulk Update by Order Numbers (Direct)

#### Endpoint

```
POST /api/v1/commission/bulk-status-by-orders-direct
```

#### Description

Updates commission status for all commissions associated with specific order numbers synchronously. Waits for completion. Limited to 10 orders per request.

#### Request Body

Same as API 6

#### Response (1-2 seconds)

```json
{
  "success": true,
  "data": {
    "totalOrders": 3,
    "updatedCount": 15,
    "message": "Successfully updated 15 commission(s) across 3 order(s)."
  }
}
```

#### Example Request

```bash
curl -X POST "https://api.example.com/api/v1/commission/bulk-status-by-orders-direct" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumbers": [12345, 12346],
    "status": "unpaid",
    "notes": "Marking as unpaid"
  }'
```

---

### API 8: Get Bulk Operation Status

#### Endpoint

```
GET /api/v1/commission/bulk-operation/:jobId
```

#### Description

Check the status of a queue-based bulk operation using the job ID returned from the bulk update endpoints.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jobId` | String | Yes | Bull Queue job ID (returned from bulk update API) |

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `queueType` | String | 'commission-ids' | Queue type: `'commission-ids'` or `'order-numbers'` |

#### Response

```json
{
  "success": true,
  "data": {
    "jobId": "123",
    "status": "completed",
    "progress": 100,
    "createdAt": "2026-06-04T10:00:00.000Z",
    "processedAt": "2026-06-04T10:00:01.000Z",
    "finishedAt": "2026-06-04T10:00:05.000Z",
    "attempts": 1,
    "result": {
      "success": true,
      "updatedCount": 15,
      "totalRequested": 15
    }
  }
}
```

#### Job Status Values

| Status | Description |
|--------|-------------|
| `waiting` | Job is queued, waiting to be processed |
| `active` | Job is currently being processed |
| `completed` | Job completed successfully |
| `failed` | Job failed after all retry attempts |

#### Example Request

```bash
curl -X GET "https://api.example.com/api/v1/commission/bulk-operation/123?queueType=commission-ids" \
  -H "Authorization: Bearer your_jwt_token"
```

---

### Bulk API Features

#### Queue-based APIs

✅ **Non-blocking**: Returns immediately (< 100ms)
✅ **Automatic Retries**: 3 attempts with exponential backoff
✅ **Job Persistence**: Stored in Redis
✅ **Notifications**: FCM + In-app notifications on completion
✅ **Progress Tracking**: Monitor operation status
✅ **Scalable**: Handles up to 1000 commissions per batch

#### Direct APIs

✅ **Immediate Results**: Returns actual updated count
✅ **Synchronous**: Waits for completion
✅ **Simple**: No job tracking needed
✅ **Fast**: < 2 seconds for up to 10 commissions
✅ **Validation**: Real-time validation of all IDs

#### Shared Features

✅ **Flexible Selection**: By commission IDs OR order numbers
✅ **Auto-set paidOffDate**: When status changes to "paid"
✅ **Clear paidOffDate**: When status changes away from "paid"
✅ **Notes Support**: Add notes to all updated commissions
✅ **Audit Trail**: User who performed the update is tracked
✅ **Validation**: Pre-validation of all inputs

---

### Bulk API Error Handling

#### Common Errors

| Error | Status | Description |
|-------|--------|-------------|
| `commissionIds is required` | 400 | Missing commission IDs array |
| `orderNumbers is required` | 400 | Missing order numbers array |
| `status is required` | 400 | Missing status field |
| `Invalid status` | 400 | Status must be one of the valid values |
| `Cannot update more than 1000 items` | 400 | Queue-based API limit exceeded |
| `Direct updates limited to 10 commissions` | 400 | Direct API limit exceeded |
| `Invalid order numbers` | 400 | Order numbers must be numeric |
| `Invalid paidOffDate format` | 400 | Date must be ISO 8601 format |
| `notes cannot exceed 500 characters` | 400 | Notes too long |
| `Job not found` | 404 | Invalid job ID when checking status |

#### Error Response Format

```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## Response Schema Reference

### Status Breakdown Schema

```json
{
  "pending": { "count": Number, "amount": Number },
  "unpaid": { "count": Number, "amount": Number },
  "paid": { "count": Number, "amount": Number },
  "hold": { "count": Number, "amount": Number },
  "cancelled": { "count": Number, "amount": Number },
  "removed": { "count": Number, "amount": Number }
}
```

### Recipient Schema

```json
{
  "userId": "String (UUID)",
  "userName": "String",
  "userAvatar": "String (URL)",
  "commissionAmount": "Number (2 decimals)",
  "productCount": "Number"
}
```

### Pagination Schema

```json
{
  "currentPage": "Number",
  "totalPages": "Number",
  "totalItems": "Number",
  "itemsPerPage": "Number",
  "hasNextPage": "Boolean",
  "hasPreviousPage": "Boolean",
  "nextPage": "Number or null",
  "prevPage": "Number or null"
}
```

### Summary Schema

```json
{
  "totalOrders": "Number",
  "totalCommissionAmount": "Number (2 decimals)",
  "paidAmount": "Number (2 decimals)",
  "unpaidAmount": "Number (2 decimals)",
  "pendingAmount": "Number (2 decimals)",
  "holdAmount": "Number (2 decimals)",
  "cancelledAmount": "Number (2 decimals)",
  "removedAmount": "Number (2 decimals)"
}
```

---

## Key Features

### 1. Multiple Recipients per Order

When an order is modified by different users, the system correctly tracks and displays multiple commission recipients.

**Scenario:**
1. User A creates order with 2 products → Gets commission for 2 products
2. User B modifies order and adds 1 product → Gets commission for 1 product
3. Order now has 3 products with 2 different recipients

**Result:**
```json
{
  "orderId": "...",
  "totalCommissionAmount": 75.50,
  "productCount": 3,
  "recipients": [
    { "userName": "User A", "commissionAmount": 50.00, "productCount": 2 },
    { "userName": "User B", "commissionAmount": 25.50, "productCount": 1 }
  ]
}
```

### 2. Product-Recipient Mapping

The Details API shows exactly which user receives commission for which product.

**Use Case:**
- Commission disputes
- Audit trails
- Transparency in commission allocation

### 3. 2-Decimal Precision

All monetary values are formatted to exactly 2 decimal places.

**Calculation Examples:**

| Type | Price | Quantity | Rate | Old Result | New Result |
|------|-------|----------|------|------------|------------|
| Percentage | 100.50 | 2 | 10.55 | 21 | **21.21** |
| Fixed | 10.55 | 3 | 5.25 | 15 | **15.75** |

**Implementation:**
```javascript
// Percentage: (price × quantity × rate) / 100
Number(((100.50 * 2 * 10.55) / 100).toFixed(2)) // = 21.21

// Fixed: rate × quantity
Number((5.25 * 3).toFixed(2)) // = 15.75
```

### 4. Efficient Aggregation

Uses MongoDB aggregation pipeline with `$facet` for efficient pagination:

```javascript
[
  { $match: filters },
  { $sort: sortObj },
  { $group: { /* aggregation logic */ } },
  {
    $facet: {
      data: [{ $skip: skip }, { $limit: limit }],
      totalCount: [{ $count: "count" }]
    }
  }
]
```

**Benefits:**
- Single database query for data + count
- No N+1 query problems
- Reduced network overhead
- Better performance with large datasets

---

## Usage Examples

### JavaScript (Fetch)

```javascript
// Get order-wise commissions
const token = 'your_jwt_token';
const response = await fetch('https://api.example.com/api/v1/commission/orders?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.data.commissions); // Array of order-wise commissions

// Get order details
const orderId = '550e8400-e29b-41d4-a716-446655440000';
const detailsResponse = await fetch(`https://api.example.com/api/v1/commission/order/${orderId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const details = await detailsResponse.json();
console.log(details.data.products); // Product-level breakdown
```

### cURL

```bash
# Order-wise listing
curl -X GET "https://api.example.com/api/v1/commission/orders?page=1&limit=20" \
  -H "Authorization: Bearer your_jwt_token"

# Order details
curl -X GET "https://api.example.com/api/v1/commission/order/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer your_jwt_token"

# With filters
curl -X GET "https://api.example.com/api/v1/commission/orders?status=unpaid&startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer your_jwt_token"
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

function useOrderCommissions(page = 1, filters = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams({
      page,
      ...filters
    });

    fetch(`/api/v1/commission/orders?${queryParams}`)
      .then(res => res.json())
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [page, filters]);

  return { data, loading, error };
}

// Usage
function CommissionList() {
  const { data, loading, error } = useOrderCommissions(1, { status: 'unpaid' });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.commissions.map(order => (
        <div key={order.orderId}>
          <h3>Order #{order.orderNumber}</h3>
          <p>Total Commission: ${order.totalCommissionAmount}</p>
          <p>Products: {order.productCount}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common Error Codes

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | Invalid query parameters |
| 401 | Unauthorized | Missing or invalid JWT token |
| 404 | Not Found | No commissions found for order |
| 500 | Internal Server Error | Server error |

### Error Examples

**Invalid Order ID:**
```json
{
  "success": false,
  "error": "Invalid order ID format"
}
```

**No Commissions Found:**
```json
{
  "success": false,
  "error": "No commissions found for this order"
}
```

**Invalid Sort Field:**
```json
{
  "success": false,
  "error": "Invalid sortBy field. Allowed values: createdAt, totalCommissionAmount, orderNumber, productCount"
}
```

---

## Performance & Optimization

### Database Indexes

The following indexes are used for optimal query performance:

```javascript
// Commission model indexes
{ orderId: 1, productId: 1 }
{ userId: 1, status: 1 }
{ userId: 1, status: 1, createdAt: -1 }
{ orderId: 1, status: 1 }
{ createdAt: -1 }
```

### Query Optimization

1. **Early Filtering**: `$match` stage applied first to reduce dataset
2. **Single Aggregation**: `$facet` used for data + count in one query
3. **Projection**: Only required fields returned
4. **Pagination**: Database-driven with skip/limit

### Performance Benchmarks

| Dataset Size | Query Time | Notes |
|--------------|------------|-------|
| 1,000 commissions | < 100ms | Fast response |
| 10,000 commissions | < 500ms | Good performance |
| 100,000 commissions | < 2s | With proper indexes |

### Best Practices

1. **Use Filters**: Apply status, date, or user filters to reduce dataset
2. **Reasonable Page Size**: Use default 20 or max 500 items per page
3. **Specific Queries**: Use `orderId` filter when looking for specific orders
4. **Caching**: Consider caching summary data (5-10 minutes)

---

## Changes from Existing APIs

### Commission Calculation Precision

**Old Implementation (with Math.floor):**
```javascript
calculateCommission(price, quantity, type, rate) {
  if (type === "percentage") {
    return Math.floor((price * quantity * rate) / 100);
  } else {
    return Math.floor(rate * quantity);
  }
}
```

**New Implementation (2-decimal precision):**
```javascript
calculateCommission(price, quantity, type, rate) {
  if (type === "percentage") {
    return Number(((price * quantity * rate) / 100).toFixed(2));
  } else {
    return Number((rate * quantity).toFixed(2));
  }
}
```

**Impact:**
- ✅ More accurate monetary calculations
- ✅ Consistent 2-decimal formatting across all APIs
- ✅ Historical data preserved (change applies to new commissions only)
- ✅ No breaking changes to existing APIs

### API Comparison

| Feature | Product-wise API | Order-wise API |
|---------|-----------------|----------------|
| **Endpoint** | `/api/v1/commission` | `/api/v1/commission/orders` |
| **Granularity** | One row per product | One row per order |
| **Commission Display** | Individual product commissions | Aggregated order totals |
| **Recipients** | Single recipient per row | Multiple recipients per order |
| **Use Case** | Detailed product-level view | Order-level overview |
| **Breakdown** | Not available | Product-recipient mapping |

### When to Use Which API?

**Use Product-wise API (`/api/v1/commission`) when:**
- You need detailed product-level commission data
- You're tracking individual product performance
- You're auditing specific commission records

**Use Order-wise API (`/api/v1/commission/orders`) when:**
- You need order-level overview
- You're displaying commission dashboards
- You want to see total commission per order
- You need to track multiple recipients per order

**Use Details API (`/api/v1/commission/order/:orderId`) when:**
- You need complete breakdown for a specific order
- You want to see product-recipient mapping
- You're investigating commission disputes

---

## Migration Guide

### For Existing Applications

If you're currently using the product-wise commission API:

**Step 1: Update API calls**
```javascript
// Old way
const response = await fetch('/api/v1/commission?page=1&limit=20');

// New way
const response = await fetch('/api/v1/commission/orders?page=1&limit=20');
```

**Step 2: Update response handling**
```javascript
// Old response structure
{
  data: {
    commissions: [/* product-level commissions */],
    summary: { /* product-wise summary */ }
  }
}

// New response structure
{
  data: {
    commissions: [/* order-wise aggregated commissions */],
    summary: { /* order-wise summary */ }
  }
}
```

**Step 3: Update display logic**
```javascript
// Old: Display product rows
commissions.map(comm => (
  <div key={comm.id}>
    <p>{comm.productName}: ${comm.commissionAmount}</p>
  </div>
))

// New: Display order rows
commissions.map(order => (
  <div key={order.orderId}>
    <p>Order #{order.orderNumber}: ${order.totalCommissionAmount}</p>
    <p>{order.productCount} products</p>
  </div>
))
```

---

## FAQ

**Q: Are the old product-wise APIs being deprecated?**

A: No. The product-wise APIs (`/api/v1/commission`) remain fully functional. The order-wise APIs are additional endpoints for different use cases.

**Q: Will existing commission records be affected?**

A: No. Existing commission records remain unchanged. Only new commissions will use the 2-decimal precision calculation.

**Q: Can I switch between product-wise and order-wise views?**

A: Yes. Both APIs are independent and can be used based on your needs.

**Q: How are multiple recipients handled?**

A: If an order was modified by different users, each user gets commission for the products they added. The order-wise API shows all recipients grouped by user.

**Q: What happens to commissions when an order is cancelled?**

A: Commissions are marked as "cancelled" and excluded from unpaid/pending totals in the summary.

**Q: Can I filter by multiple statuses at once?**

A: Not directly in a single parameter. You would need to make separate API calls for each status or process the results client-side.

**Q: Is there a rate limit on these APIs?**

A: Rate limiting depends on your application configuration. Check your middleware setup for rate limiting rules.

---

## Support

For questions or issues related to the Order-wise Commission APIs:

1. Check this documentation first
2. Review the error response for specific error messages
3. Check server logs for detailed error information
4. Contact the development team for further assistance

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-15 | Initial release of order-wise commission APIs |
| - | - | • Added GET /api/v1/commission/orders |
| - | - | • Added GET /api/v1/commission/order/:orderId |
| - | - | • Added GET /api/v1/commission/order/:orderId/count |
| - | - | • Updated commission calculation to 2-decimal precision |
| - | - | • Added product-recipient mapping |
| - | - | • Added multiple recipients support |

---

## Additional Resources

- [Product-wise Commission API Documentation](./COMMISSION_API.md)
- [Order API Documentation](./ORDER_API.md)
- [User API Documentation](./USER_API.md)
- [Database Schema Documentation](./DATABASE_SCHEMA.md)

---

*Last Updated: January 15, 2025*
