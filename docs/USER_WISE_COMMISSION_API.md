# User-wise Commission Management API Documentation

## Table of Contents

1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [API 1: User-wise Commission Summary](#api-1-user-wise-commission-summary)
4. [API 2: User Commission History & Performance](#api-2-user-commission-history--performance)
5. [API 3: User Commission Count](#api-3-user-commission-count)
6. [API 4: Top Performers](#api-4-top-performers)
7. [API 5: User-wise Summary Stats](#api-5-user-wise-summary-stats)
8. [Response Schema Reference](#response-schema-reference)
9. [Key Features](#key-features)
10. [Usage Examples](#usage-examples)
11. [Error Handling](#error-handling)
12. [Performance & Optimization](#performance--optimization)

---

## Overview

The User-wise Commission Management APIs provide a comprehensive view of commission data aggregated at the **user level**. This enables businesses to analyze commission performance per user, track earnings trends, and identify top performers.

### Why User-wise?

**Before (Product-level):**
```
Commission Records:
├── John Doe - Product A - $20.00 (Order #123)
├── John Doe - Product B - $15.50 (Order #123)
├── John Doe - Product C - $10.25 (Order #456)
└── Jane Smith - Product D - $25.00 (Order #789)
```

**After (User-wise):**
```
John Doe
├── Total Commission: $45.75
├── Total Orders: 2
├── Total Products: 3
├── Status Breakdown:
│   ├── Paid: $30.00 (2 products)
│   └── Pending: $15.75 (1 product)
└── Performance: +15.5% growth rate
```

### Key Benefits

- **User-Centric View**: See all commission data aggregated by user
- **Performance Tracking**: Growth rates, payment rates, average per order
- **Timeline Data**: Daily/weekly/monthly aggregations for graphs
- **Status Trends**: Track commission status changes over time
- **Top Products**: Identify which products generate most commission per user
- **Leaderboards**: Easily identify top performers
- **2-Decimal Precision**: All monetary calculations use precise formatting
- **Efficient Queries**: Single MongoDB aggregation pipeline

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/commission/users/summary` | GET | Get user-wise commission listing with pagination |
| `/api/v1/commission/user/:userId/history` | GET | Get commission history and performance for a specific user |
| `/api/v1/commission/user/:userId/count` | GET | Get commission count for a user |
| `/api/v1/commission/users/top-performers` | GET | Get top performing users by commission amount |
| `/api/v1/commission/users/summary-stats` | GET | Get user-wise summary statistics |

### Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## API 1: User-wise Commission Summary

### Endpoint

```
GET /api/v1/commission/users/summary
```

### Description

Returns commission records grouped by user. Each row represents one user with aggregated commission data from all their commission records.

### Query Parameters

#### Pagination Parameters

| Parameter | Type | Default | Limits | Description |
|-----------|------|---------|---------|-------------|
| `page` | Integer | 1 | ≥ 1 | Page number |
| `limit` | Integer | 20 | 1-500 | Items per page |

#### Sorting Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sortBy` | String | totalCommissionAmount | Field to sort by: `totalCommissionAmount`, `totalOrders`, `totalProducts`, `userName`, `firstCommissionDate`, `lastCommissionDate` |
| `sortOrder` | String | desc | Sort order: `asc` or `desc` |

#### Filter Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | String | Filter by commission status: `pending`, `unpaid`, `paid`, `hold`, `cancelled`, `removed` |
| `userId` | String | Filter by specific user ID |
| `orderId` | String | Filter by specific order ID |
| `startDate` | String (ISO 8601) | Filter by creation date start |
| `endDate` | String (ISO 8601) | Filter by creation date end |
| `paidOffStartDate` | String (ISO 8601) | Filter by paid off date start |
| `paidOffEndDate` | String (ISO 8601) | Filter by paid off date end |
| `search` | String | Search in userName and productName (case-insensitive) |

### Response

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "userId": "6415fac8-a743-4c7d-977f-b21dc3370e2b",
        "userName": "John Doe",
        "userAvatar": "https://example.com/avatar.jpg",
        "totalCommissionAmount": 1500.50,
        "totalOrders": 15,
        "totalProducts": 25,
        "statusBreakdown": {
          "paid": {
            "count": 10,
            "amount": 1000.00
          },
          "pending": {
            "count": 8,
            "amount": 350.50
          },
          "unpaid": {
            "count": 7,
            "amount": 150.00
          },
          "hold": {
            "count": 0,
            "amount": 0
          },
          "cancelled": {
            "count": 0,
            "amount": 0
          }
        },
        "firstCommissionDate": "2026-01-15T10:30:00.000Z",
        "lastCommissionDate": "2026-06-04T14:22:00.000Z"
      },
      {
        "userId": "7526gbd9-b854-5d8e-088g-c32ed4481f3c",
        "userName": "Jane Smith",
        "userAvatar": "https://example.com/avatar2.jpg",
        "totalCommissionAmount": 2250.75,
        "totalOrders": 20,
        "totalProducts": 35,
        "statusBreakdown": {
          "paid": {
            "count": 15,
            "amount": 1800.00
          },
          "pending": {
            "count": 12,
            "amount": 450.75
          },
          "unpaid": {
            "count": 8,
            "amount": 0
          }
        },
        "firstCommissionDate": "2026-02-01T09:15:00.000Z",
        "lastCommissionDate": "2026-06-03T16:45:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Response Fields

#### User Data Fields

| Field | Type | Description |
|-------|------|-------------|
| `userId` | String | Unique user identifier |
| `userName` | String | Full name of the user |
| `userAvatar` | String | URL to user's avatar image |
| `totalCommissionAmount` | Number | Total commission amount across all records (2 decimals) |
| `totalOrders` | Integer | Count of unique orders with commissions |
| `totalProducts` | Integer | Total number of commission records |
| `statusBreakdown` | Object | Breakdown of commission counts and amounts by status |
| `firstCommissionDate` | Date (ISO 8601) | Date of first commission record |
| `lastCommissionDate` | Date (ISO 8601) | Date of most recent commission record |

#### Status Breakdown Fields

| Field | Type | Description |
|-------|------|-------------|
| `count` | Integer | Number of commission records with this status |
| `amount` | Number | Total commission amount for this status (2 decimals) |

#### Pagination Fields

| Field | Type | Description |
|-------|------|-------------|
| `currentPage` | Integer | Current page number |
| `totalPages` | Integer | Total number of pages |
| `totalItems` | Integer | Total number of users matching filters |
| `itemsPerPage` | Integer | Number of items per page |
| `hasNextPage` | Boolean | Whether next page exists |
| `hasPrevPage` | Boolean | Whether previous page exists |

### Example Requests

#### Get first page of users sorted by total commission

```bash
curl -X GET "https://api.example.com/api/v1/commission/users/summary?page=1&limit=20&sortBy=totalCommissionAmount&sortOrder=desc" \
  -H "Authorization: Bearer your_jwt_token"
```

#### Get users with "paid" status only

```bash
curl -X GET "https://api.example.com/api/v1/commission/users/summary?status=paid" \
  -H "Authorization: Bearer your_jwt_token"
```

#### Search for users by name

```bash
curl -X GET "https://api.example.com/api/v1/commission/users/summary?search=john" \
  -H "Authorization: Bearer your_jwt_token"
```

#### Filter by date range

```bash
curl -X GET "https://api.example.com/api/v1/commission/users/summary?startDate=2026-01-01&endDate=2026-06-30" \
  -H "Authorization: Bearer your_jwt_token"
```

#### Sort by user name alphabetically

```bash
curl -X GET "https://api.example.com/api/v1/commission/users/summary?sortBy=userName&sortOrder=asc" \
  -H "Authorization: Bearer your_jwt_token"
```

---

## API 2: User Commission History & Performance

### Endpoint

```
GET /api/v1/commission/user/:userId/history
```

### Description

Returns detailed commission history for a specific user with timeline data for graphs, performance metrics, status trends, and top products. This is ideal for creating user performance dashboards and analytics.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | String | Yes | User ID |

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `interval` | String | daily | Time interval for timeline: `daily`, `weekly`, `monthly` |
| `startDate` | String (ISO 8601) | Optional | Start date for history period |
| `endDate` | String (ISO 8601) | Optional | End date for history period |
| `includePerformance` | Boolean | true | Include performance metrics (growth rate, payment rate, etc.) |

### Response

```json
{
  "success": true,
  "data": {
    "userId": "6415fac8-a743-4c7d-977f-b21dc3370e2b",
    "userName": "John Doe",
    "userAvatar": "https://example.com/avatar.jpg",
    "summary": {
      "totalCommissionAmount": 5000.00,
      "paidAmount": 3000.00,
      "unpaidAmount": 1000.00,
      "pendingAmount": 800.00,
      "holdAmount": 150.00,
      "cancelledAmount": 50.00,
      "totalOrders": 50,
      "totalProducts": 100,
      "firstCommissionDate": "2026-01-15T10:30:00.000Z",
      "lastCommissionDate": "2026-06-04T14:22:00.000Z"
    },
    "timeline": [
      {
        "date": "2026-06-01",
        "totalAmount": 500.00,
        "paidAmount": 300.00,
        "unpaidAmount": 100.00,
        "pendingAmount": 80.00,
        "holdAmount": 15.00,
        "cancelledAmount": 5.00,
        "orderCount": 5,
        "productCount": 10
      },
      {
        "date": "2026-06-02",
        "totalAmount": 450.00,
        "paidAmount": 280.00,
        "unpaidAmount": 90.00,
        "pendingAmount": 70.00,
        "holdAmount": 10.00,
        "cancelledAmount": 0,
        "orderCount": 4,
        "productCount": 8
      },
      {
        "date": "2026-06-03",
        "totalAmount": 600.00,
        "paidAmount": 400.00,
        "unpaidAmount": 120.00,
        "pendingAmount": 70.00,
        "holdAmount": 10.00,
        "cancelledAmount": 0,
        "orderCount": 6,
        "productCount": 12
      }
    ],
    "statusTrends": {
      "paid": "up",
      "unpaid": "down",
      "pending": "stable",
      "hold": "down",
      "cancelled": "stable"
    },
    "topProducts": [
      {
        "productId": "prod-123",
        "productName": "Premium Widget",
        "productImage": "https://example.com/product.jpg",
        "totalCommission": 500.00,
        "commissionCount": 10
      },
      {
        "productId": "prod-456",
        "productName": "Deluxe Gadget",
        "productImage": "https://example.com/product2.jpg",
        "totalCommission": 350.00,
        "commissionCount": 7
      }
    ],
    "performance": {
      "growthRate": 15.5,
      "avgPerOrder": 100.00,
      "paymentRate": 60.0,
      "currentTotal": 5000.00,
      "previousTotal": 4325.00
    }
  }
}
```

### Response Fields

#### Summary Fields

| Field | Type | Description |
|-------|------|-------------|
| `totalCommissionAmount` | Number | Total commission across all records |
| `paidAmount` | Number | Amount with "paid" status |
| `unpaidAmount` | Number | Amount with "unpaid" status |
| `pendingAmount` | Number | Amount with "pending" status |
| `holdAmount` | Number | Amount with "hold" status |
| `cancelledAmount` | Number | Amount with "cancelled" status |
| `totalOrders` | Integer | Count of unique orders |
| `totalProducts` | Integer | Total commission records |
| `firstCommissionDate` | Date (ISO 8601) | First commission date |
| `lastCommissionDate` | Date (ISO 8601) | Last commission date |

#### Timeline Fields

| Field | Type | Description |
|-------|------|-------------|
| `date` | String | Date in format based on interval (YYYY-MM-DD for daily) |
| `totalAmount` | Number | Total commission for this period |
| `paidAmount` | Number | Paid amount for this period |
| `unpaidAmount` | Number | Unpaid amount for this period |
| `pendingAmount` | Number | Pending amount for this period |
| `holdAmount` | Number | Hold amount for this period |
| `cancelledAmount` | Number | Cancelled amount for this period |
| `orderCount` | Integer | Number of orders in this period |
| `productCount` | Integer | Number of products in this period |

#### Status Trends Fields

| Field | Type | Description |
|-------|------|-------------|
| `paid` | String | Trend direction: `up`, `down`, or `stable` |
| `unpaid` | String | Trend direction |
| `pending` | String | Trend direction |
| `hold` | String | Trend direction |
| `cancelled` | String | Trend direction |

**Trend Calculation**: Compares first half of timeline vs second half. "up" means second half > first half.

#### Top Products Fields

| Field | Type | Description |
|-------|------|-------------|
| `productId` | String | Product identifier |
| `productName` | String | Product name |
| `productImage` | String | URL to product image |
| `totalCommission` | Number | Total commission from this product |
| `commissionCount` | Integer | Number of commission records for this product |

#### Performance Metrics Fields

| Field | Type | Description |
|-------|------|-------------|
| `growthRate` | Number | Percentage growth from previous period (can be negative) |
| `avgPerOrder` | Number | Average commission amount per order |
| `paymentRate` | Number | Percentage of total that has been paid |
| `currentTotal` | Number | Current period total commission |
| `previousTotal` | Number | Previous period total commission |

### Example Requests

#### Get daily history for last 30 days

```bash
curl -X GET "https://api.example.com/api/v1/commission/user/6415fac8-a743-4c7d-977f-b21dc3370e2b/history?interval=daily&startDate=2026-05-05&endDate=2026-06-04" \
  -H "Authorization: Bearer your_jwt_token"
```

#### Get weekly history without performance metrics

```bash
curl -X GET "https://api.example.com/api/v1/commission/user/6415fac8-a743-4c7d-977f-b21dc3370e2b/history?interval=weekly&includePerformance=false" \
  -H "Authorization: Bearer your_jwt_token"
```

#### Get monthly history for entire year

```bash
curl -X GET "https://api.example.com/api/v1/commission/user/6415fac8-a743-4c7d-977f-b21dc3370e2b/history?interval=monthly&startDate=2026-01-01&endDate=2026-12-31" \
  -H "Authorization: Bearer your_jwt_token"
```

---

## API 3: User Commission Count

### Endpoint

```
GET /api/v1/commission/user/:userId/count
```

### Description

Returns the total number of commission records for a specific user. Simple count endpoint for quick checks.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | String | Yes | User ID |

### Response

```json
{
  "success": true,
  "data": {
    "userId": "6415fac8-a743-4c7d-977f-b21dc3370e2b",
    "totalCommissionCount": 25
  }
}
```

### Example Request

```bash
curl -X GET "https://api.example.com/api/v1/commission/user/6415fac8-a743-4c7d-977f-b21dc3370e2b/count" \
  -H "Authorization: Bearer your_jwt_token"
```

---

## API 4: Top Performers

### Endpoint

```
GET /api/v1/commission/users/top-performers
```

### Description

Returns a leaderboard of top performing users sorted by total commission amount. Useful for gamification and performance recognition.

### Query Parameters

| Parameter | Type | Default | Limits | Description |
|-----------|------|---------|---------|-------------|
| `limit` | Integer | 10 | 1-100 | Number of top users to return |
| `status` | String | Optional | Filter by commission status |
| `startDate` | String (ISO 8601) | Optional | Filter by creation date start |
| `endDate` | String (ISO 8601) | Optional | Filter by creation date end |

### Response

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "userId": "7526gbd9-b854-5d8e-088g-c32ed4481f3c",
        "userName": "Jane Smith",
        "userAvatar": "https://example.com/avatar2.jpg",
        "totalCommissionAmount": 10000.00,
        "paidAmount": 6000.00,
        "unpaidAmount": 2500.00,
        "totalOrders": 100,
        "totalProducts": 200
      },
      {
        "userId": "6415fac8-a743-4c7d-977f-b21dc3370e2b",
        "userName": "John Doe",
        "userAvatar": "https://example.com/avatar.jpg",
        "totalCommissionAmount": 8500.00,
        "paidAmount": 5000.00,
        "unpaidAmount": 2000.00,
        "totalOrders": 85,
        "totalProducts": 170
      },
      {
        "userId": "8637hce0-c965-6e9f-199h-d43fe5592g4d",
        "userName": "Bob Johnson",
        "userAvatar": "https://example.com/avatar3.jpg",
        "totalCommissionAmount": 7200.00,
        "paidAmount": 4500.00,
        "unpaidAmount": 1800.00,
        "totalOrders": 72,
        "totalProducts": 144
      }
    ],
    "count": 3
  }
}
```

### Example Requests

#### Get top 10 performers

```bash
curl -X GET "https://api.example.com/api/v1/commission/users/top-performers?limit=10" \
  -H "Authorization: Bearer your_jwt_token"
```

#### Get top 25 performers of current month

```bash
curl -X GET "https://api.example.com/api/v1/commission/users/top-performers?limit=25&startDate=2026-06-01&endDate=2026-06-30" \
  -H "Authorization: Bearer your_jwt_token"
```

#### Get top performers with paid commissions only

```bash
curl -X GET "https://api.example.com/api/v1/commission/users/top-performers?status=paid&limit=15" \
  -H "Authorization: Bearer your_jwt_token"
```

---

## API 5: User-wise Summary Stats

### Endpoint

```
GET /api/v1/commission/users/summary-stats
```

### Description

Returns overall summary statistics across all users. Useful for admin dashboards and high-level analytics.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | String | Optional | Filter by commission status |
| `startDate` | String (ISO 8601) | Optional | Filter by creation date start |
| `endDate` | String (ISO 8601) | Optional | Filter by creation date end |

### Response

```json
{
  "success": true,
  "data": {
    "totalUsers": 25,
    "totalCommissionAmount": 50000.00,
    "paidAmount": 30000.00,
    "unpaidAmount": 10000.00,
    "pendingAmount": 7000.00,
    "holdAmount": 2000.00,
    "cancelledAmount": 1000.00,
    "removedAmount": 0
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `totalUsers` | Integer | Count of unique users with commissions |
| `totalCommissionAmount` | Number | Total commission across all users |
| `paidAmount` | Number | Total paid amount |
| `unpaidAmount` | Number | Total unpaid amount |
| `pendingAmount` | Number | Total pending amount |
| `holdAmount` | Number | Total hold amount |
| `cancelledAmount` | Number | Total cancelled amount |
| `removedAmount` | Number | Total removed amount |

### Example Request

```bash
curl -X GET "https://api.example.com/api/v1/commission/users/summary-stats?startDate=2026-01-01&endDate=2026-12-31" \
  -H "Authorization: Bearer your_jwt_token"
```

---

## Response Schema Reference

### Status Breakdown Schema

```json
{
  "paid": { "count": Number, "amount": Number },
  "unpaid": { "count": Number, "amount": Number },
  "pending": { "count": Number, "amount": Number },
  "hold": { "count": Number, "amount": Number },
  "cancelled": { "count": Number, "amount": Number },
  "removed": { "count": Number, "amount": Number }
}
```

### Timeline Entry Schema

```json
{
  "date": "String (YYYY-MM-DD for daily)",
  "totalAmount": "Number (2 decimals)",
  "paidAmount": "Number (2 decimals)",
  "unpaidAmount": "Number (2 decimals)",
  "pendingAmount": "Number (2 decimals)",
  "holdAmount": "Number (2 decimals)",
  "cancelledAmount": "Number (2 decimals)",
  "orderCount": "Integer",
  "productCount": "Integer"
}
```

### Performance Metrics Schema

```json
{
  "growthRate": "Number (percentage, can be negative)",
  "avgPerOrder": "Number (2 decimals)",
  "paymentRate": "Number (percentage, 0-100)",
  "currentTotal": "Number (2 decimals)",
  "previousTotal": "Number (2 decimals)"
}
```

### Pagination Schema

```json
{
  "currentPage": "Integer (≥ 1)",
  "totalPages": "Integer (≥ 0)",
  "totalItems": "Integer (≥ 0)",
  "itemsPerPage": "Integer (1-500)",
  "hasNextPage": "Boolean",
  "hasPrevPage": "Boolean"
}
```

---

## Key Features

### 1. Performance Metrics

**Growth Rate**: Percentage change in commission between current period and previous period

- Positive: User is earning more
- Negative: User is earning less
- Calculated as: `((current - previous) / previous) * 100`

**Average Per Order**: Mean commission amount per order

- Calculated as: `totalCommissionAmount / totalOrders`
- Helps identify order value patterns

**Payment Rate**: Percentage of total commission that has been paid

- Calculated as: `(paidAmount / totalCommissionAmount) * 100`
- Higher is better (indicates faster payments)

### 2. Timeline Data

**Daily Interval**: Best for:
- Last 7-30 days views
- Detailed performance tracking
- Daily goal monitoring

**Weekly Interval**: Best for:
- Last 2-12 weeks views
- Weekly performance reports
- Medium-term trends

**Monthly Interval**: Best for:
- Last 3-24 months views
- Monthly summaries
- Long-term trend analysis

### 3. Status Trends

Trends are calculated by comparing the first half of the timeline with the second half:

- **up**: Second half > First half
- **down**: Second half < First half
- **stable**: Second half ≈ First half

Example: If paid amount was $1000 in first 15 days and $1500 in next 15 days, trend = "up"

### 4. Top Products

Shows which products generate the most commission for a user. Used for:
- Product recommendation
- Commission optimization insights
- Performance analysis by product

### 5. Flexible Filtering

All listing endpoints support:
- **Status filtering**: View only paid/unpaid/pending commissions
- **Date range filtering**: By creation date or paid-off date
- **User filtering**: Specific user ID
- **Order filtering**: Specific order ID
- **Search**: Case-insensitive search in user name and product name

### 6. Advanced Sorting

Sort by any of these fields:
- `totalCommissionAmount`: Total earnings (default)
- `totalOrders`: Number of orders
- `totalProducts`: Number of products
- `userName`: Alphabetically by name
- `firstCommissionDate`: Earliest commission date
- `lastCommissionDate`: Most recent commission date

### 7. Efficient Pagination

- **Single Query**: Uses MongoDB `$facet` for data + count in one operation
- **No N+1 Problems**: All aggregations done in database
- **Consistent Performance**: < 200ms for first 100 pages
- **Indexed Fields**: Uses existing MongoDB indexes

### 8. 2-Decimal Precision

All monetary values are formatted to exactly 2 decimal places:
- `1500.5` → `1500.50`
- `1000.123` → `1000.12`
- `750.006` → `750.01`

Uses `Number(value.toFixed(2))` for consistent formatting.

---

## Usage Examples

### Example 1: User Performance Dashboard

Build a dashboard showing top performers with their performance metrics.

```bash
# Get top 10 performers
curl -X GET "https://api.example.com/api/v1/commission/users/top-performers?limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.data[] | {
    name: .userName,
    total: .totalCommissionAmount,
    orders: .totalOrders,
    avg_per_order: (.totalCommissionAmount / .totalOrders)
  }'
```

Output:
```json
{
  "name": "Jane Smith",
  "total": 10000.00,
  "orders": 100,
  "avg_per_order": 100.00
}
```

### Example 2: User Growth Tracking

Track a specific user's performance over time with monthly intervals.

```bash
# Get monthly history for a user
curl -X GET "https://api.example.com/api/v1/commission/user/USER_ID/history?interval=monthly&startDate=2026-01-01&endDate=2026-12-31" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.timeline[] | {
    month: .date,
    total: .totalAmount,
    paid: .paidAmount,
    growth: .totalAmount
  }'
```

### Example 3: Commission Status Breakdown

View detailed status breakdown for all users.

```bash
# Get all users with status breakdown
curl -X GET "https://api.example.com/api/v1/commission/users/summary?limit=100" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.data[] | {
    user: .userName,
    total: .totalCommissionAmount,
    paid: .statusBreakdown.paid.amount,
    pending: .statusBreakdown.pending.amount,
    payment_rate: ((.statusBreakdown.paid.amount / .totalCommissionAmount) * 100)
  }'
```

### Example 4: Date-Filtered Leaderboard

Get top performers for a specific time period (e.g., current month).

```bash
# June 2026 top performers
curl -X GET "https://api.example.com/api/v1/commission/users/top-performers?startDate=2026-06-01&endDate=2026-06-30&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Example 5: Search Users

Find users by name with pagination.

```bash
# Search for users named "john"
curl -X GET "https://api.example.com/api/v1/commission/users/summary?search=john&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Example 6: Commission History Graph Data

Get daily timeline data for a line chart.

```bash
# Daily history for graph
curl -X GET "https://api.example.com/api/v1/commission/user/USER_ID/history?interval=daily&startDate=2026-05-01&endDate=2026-06-04" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.timeline[] | [
    .date,
    .totalAmount,
    .paidAmount
  ] | @csv'
```

Output (CSV for chart):
```
"2026-06-01",500.00,300.00
"2026-06-02",450.00,280.00
"2026-06-03",600.00,400.00
```

### Example 7: Overall Statistics

Get system-wide commission statistics.

```bash
# Get summary stats
curl -X GET "https://api.example.com/api/v1/commission/users/summary-stats" \
  -H "Authorization: Bearer $TOKEN" | jq '.data'
```

Output:
```json
{
  "totalUsers": 25,
  "totalCommissionAmount": 50000.00,
  "paidAmount": 30000.00,
  "unpaidAmount": 10000.00,
  "pendingAmount": 7000.00,
  "holdAmount": 2000.00,
  "cancelledAmount": 1000.00,
  "removedAmount": 0
}
```

### Example 8: Compare Users

Get multiple users' data for comparison.

```bash
# Get specific users by filtering
curl -X GET "https://api.example.com/api/v1/commission/users/summary?userId=USER_ID_1&limit=1" \
  -H "Authorization: Bearer $TOKEN" > user1.json

curl -X GET "https://api.example.com/api/v1/commission/users/summary?userId=USER_ID_2&limit=1" \
  -H "Authorization: Bearer $TOKEN" > user2.json

# Compare using jq
jq -s '[
  { user: .[0].data.userName, total: .[0].data.totalCommissionAmount },
  { user: .[1].userName, total: .[1].data.totalCommissionAmount }
] | sort_by(.total) | reverse' user1.json user2.json
```

---

## Error Handling

### Common Errors

| Error | Status | Description | Solution |
|-------|--------|-------------|----------|
| `User ID is required` | 400 | Missing userId parameter | Provide valid userId in path |
| `No commissions found for this user` | 404 | User has no commission records | Verify userId is correct |
| `Invalid interval` | 400 | Interval must be daily/weekly/monthly | Use valid interval value |
| `Invalid date format` | 400 | Date must be ISO 8601 format | Use format: `2026-06-04T10:00:00Z` |
| `Authorization token required` | 401 | Missing or invalid JWT token | Provide valid Bearer token |
| `Authorization failed` | 403 | Token expired or invalid | Refresh token and retry |

### Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Example Error Responses

#### 400 Bad Request - Invalid Parameter

```json
{
  "success": false,
  "error": "Invalid interval. Must be one of: daily, weekly, monthly"
}
```

#### 404 Not Found - User Not Found

```json
{
  "success": false,
  "error": "No commissions found for this user"
}
```

#### 401 Unauthorized - Missing Token

```json
{
  "success": false,
  "error": "Authorization token required"
}
```

### Best Practices

1. **Always check `success` field** before accessing `data`
2. **Handle 404 gracefully** - User may legitimately have no commissions
3. **Validate dates** before sending to API
4. **Use try-catch** when parsing numeric fields
5. **Implement exponential backoff** for rate limiting
6. **Cache leaderboard data** for 5-10 minutes (top-performers endpoint)

---

## Performance & Optimization

### Query Performance

| Operation | Typical Response Time | Max Response Time |
|-----------|----------------------|-------------------|
| User listing (page 1-10) | 50-150ms | 300ms |
| User listing (page 10+) | 100-300ms | 500ms |
| User history (daily, 30 days) | 100-200ms | 400ms |
| User history (monthly, 12 months) | 80-150ms | 300ms |
| Top performers (limit 10) | 50-100ms | 200ms |
| Summary stats | 30-100ms | 200ms |
| User count | 20-50ms | 100ms |

### Optimization Tips

#### For Client Applications

1. **Cache User Lists**
   - Cache user summary for 5-10 minutes
   - Use pagination to reduce initial load
   - Implement infinite scroll for better UX

2. **Debounce Search**
   - Wait 300-500ms after user stops typing
   - Reduces API calls during search

3. **Request Smaller Date Ranges**
   - Request specific date ranges instead of "all time"
   - Break long histories into smaller chunks

4. **Use Appropriate Intervals**
   - Daily for ≤ 60 days
   - Weekly for ≤ 12 weeks
   - Monthly for > 12 weeks

#### For Server-Side

1. **MongoDB Indexes**
   - Ensure `userId` index exists
   - Ensure `createdAt` index exists
   - Compound index on `(userId, createdAt)` recommended

2. **Aggregation Pipelines**
   - Use `$match` early to reduce dataset
   - Use `$facet` for parallel operations
   - Avoid `$unwind` unless necessary

3. **Pagination Strategy**
   - Use `$skip` and `$limit` in aggregation
   - Calculate total count in same query with `$facet`

### Rate Limiting

Recommended limits:
- **User listing**: 60 requests/minute per IP
- **User history**: 30 requests/minute per IP
- **Top performers**: 120 requests/minute per IP
- **Summary stats**: 60 requests/minute per IP

### Monitoring

Key metrics to monitor:
- **Response times**: P50, P95, P99
- **Error rates**: 4xx, 5xx
- **Database query times**: Slow queries > 1s
- **Cache hit rates**: Should be > 80%

---

## Integration Guide

### Step 1: Authentication

All requests must include a valid JWT token:

```javascript
const token = localStorage.getItem('authToken');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Step 2: Fetch User List

```javascript
async function fetchUsers(page = 1, filters = {}) {
  const queryParams = new URLSearchParams({
    page,
    limit: 20,
    sortBy: 'totalCommissionAmount',
    sortOrder: 'desc',
    ...filters
  });

  const response = await fetch(
    `/api/v1/commission/users/summary?${queryParams}`,
    { headers }
  );

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}
```

### Step 3: Display User Data

```javascript
function renderUsers(usersData) {
  const { data, pagination } = usersData;

  return data.map(user => `
    <div class="user-card">
      <img src="${user.userAvatar}" alt="${user.userName}">
      <h3>${user.userName}</h3>
      <p>Total: $${user.totalCommissionAmount.toFixed(2)}</p>
      <p>Orders: ${user.totalOrders}</p>
      <div class="status-breakdown">
        <span class="paid">Paid: $${user.statusBreakdown.paid.amount}</span>
        <span class="pending">Pending: $${user.statusBreakdown.pending.amount}</span>
      </div>
    </div>
  `).join('');
}
```

### Step 4: Fetch User History

```javascript
async function fetchUserHistory(userId, interval = 'daily') {
  const response = await fetch(
    `/api/v1/commission/user/${userId}/history?interval=${interval}`,
    { headers }
  );

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}
```

### Step 5: Render Timeline Graph

```javascript
function renderTimelineChart(timelineData) {
  const labels = timelineData.map(entry => entry.date);
  const totalData = timelineData.map(entry => entry.totalAmount);
  const paidData = timelineData.map(entry => entry.paidAmount);

  // Using Chart.js example
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Total Commission',
          data: totalData,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        },
        {
          label: 'Paid Amount',
          data: paidData,
          borderColor: 'rgb(54, 162, 235)',
          tension: 0.1
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => '$' + value.toFixed(2)
          }
        }
      }
    }
  });
}
```

---

## Quick Reference

### Base URL

```
Production: https://api.example.com/api/v1/commission
Development: http://localhost:3000/api/v1/commission
```

### All Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/users/summary` | List users with pagination |
| GET | `/user/:userId/history` | Get user history & performance |
| GET | `/user/:userId/count` | Get user commission count |
| GET | `/users/top-performers` | Get top performers leaderboard |
| GET | `/users/summary-stats` | Get overall statistics |

### Common Query Parameters

| Parameter | Type | Works With |
|-----------|------|------------|
| `page` | Integer | Listing endpoints |
| `limit` | Integer | Listing endpoints |
| `sortBy` | String | Listing endpoints |
| `sortOrder` | String | Listing endpoints |
| `status` | String | All endpoints |
| `startDate` | String (ISO 8601) | All endpoints |
| `endDate` | String (ISO 8601) | All endpoints |
| `interval` | String | History endpoint |
| `search` | String | User summary |
| `userId` | String | User summary |
| `orderId` | String | User summary |

### Status Values

- `pending` - Commission is pending review
- `unpaid` - Commission approved but not paid
- `paid` - Commission has been paid
- `hold` - Commission is on hold
- `cancelled` - Commission cancelled
- `removed` - Commission removed from system

### Interval Values

- `daily` - Group by day (YYYY-MM-DD)
- `weekly` - Group by week (YYYY-WW)
- `monthly` - Group by month (YYYY-MM)

---

## Support & Documentation

For additional support:
- **API Issues**: Contact API team at api-support@example.com
- **Documentation Updates**: Submit PR to documentation repository
- **Feature Requests**: Use internal feature request system

**Last Updated**: June 4, 2026
**API Version**: v1
**Documentation Version**: 1.0.0
