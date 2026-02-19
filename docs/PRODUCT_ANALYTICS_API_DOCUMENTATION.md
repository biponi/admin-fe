# Product Analytics API Documentation

**Version:** 1.0.0
**Base URL:** `/api/v1/product/analytics`
**Authentication:** Bearer Token required for all endpoints

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Common Features](#common-features)
4. [API Endpoints](#api-endpoints)
   - [Product Order History](#1-product-order-history-api)
   - [Product Purchase History](#2-product-purchase-history-api)
   - [Product Adjustment History](#3-product-adjustment-history-api)
5. [Error Handling](#error-handling)
6. [Frontend Implementation Guide](#frontend-implementation-guide)
7. [Example Code](#example-code)

---

## Overview

The Product Analytics API provides comprehensive data about product performance through three main endpoints:

1. **Order History** - Customer orders and sales analytics
2. **Purchase History** - Supplier purchase orders and restocking data
3. **Adjustment History** - Inventory adjustments and stock modifications

All endpoints support pagination, filtering, sorting, and date range queries for flexible data retrieval.

---

## Authentication

All API endpoints require a valid Bearer Token in the Authorization header.

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Example Request:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  https://api.example.com/api/v1/product/analytics/order-history/PRODUCT_ID
```

---

## Common Features

### Pagination

All endpoints support pagination with the following query parameters:

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| page | number | 1 | - | Page number to retrieve |
| limit | number | 20 | 100 | Number of items per page |

**Pagination Response Object:**
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 8,
    "totalItems": 156,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPreviousPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

### Sorting

All endpoints support sorting with the following query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| sortBy | string | createdAt | Field to sort by (endpoint-specific) |
| sortOrder | string | desc | Sort direction: 'asc' or 'desc' |

### Date Range Filtering

Filter results by date range using ISO 8601 format:

| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | string (ISO 8601) | Filter records from this date (inclusive) |
| endDate | string (ISO 8601) | Filter records until this date (inclusive) |

**Example:**
```bash
GET /api/v1/product/analytics/order-history/PRODUCT_ID?startDate=2024-01-01T00:00:00Z&endDate=2024-12-31T23:59:59Z
```

---

## API Endpoints

---

## 1. Product Order History API

### Endpoint

```
GET /api/v1/product/analytics/order-history/:productId
```

### Description

Retrieves complete order history for a specific product including:
- All customer orders containing the product
- Customer statistics and summaries
- Sales analytics and revenue data
- Order status breakdown

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string (UUID) | Yes | Unique product identifier |

### Query Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| page | number | 1 | - | Page number |
| limit | number | 20 | 100 | Items per page |
| sortBy | string | createdAt | - | Sort field: createdAt, orderNumber, totalPrice, quantity, status |
| sortOrder | string | desc | - | Sort direction: asc, desc |
| startDate | string (ISO 8601) | - | - | Filter from start date |
| endDate | string (ISO 8601) | - | - | Filter until end date |
| status | string | - | - | Filter by order status: pending, processing, shipped, completed, cancelled, cancel, delete, failed |

### Example Request

```bash
curl -X GET \
  'https://api.example.com/api/v1/product/analytics/order-history/507f1f77bcf86cd799439011?page=1&limit=20&sortBy=createdAt&sortOrder=desc&status=completed' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### Response Structure

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Product order history retrieved successfully",
  "data": {
    "product": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Premium Cotton T-Shirt",
      "sku": "TSHIRT-001",
      "slug": "premium-cotton-t-shirt",
      "thumbnail": "https://cdn.example.com/products/tshirt.jpg",
      "unitPrice": 1500,
      "currentStock": 250
    },
    "summary": {
      "totalOrders": 156,
      "totalQuantitySold": 485,
      "totalRevenue": 727500,
      "averageOrderValue": 4663.46,
      "averageQuantityPerOrder": 3.11,
      "uniqueCustomers": 128,
      "statusBreakdown": {
        "completed": 120,
        "processing": 25,
        "pending": 8,
        "cancelled": 3
      }
    },
    "orders": [
      {
        "orderId": "507f191e810c19729de860ea",
        "orderNumber": 10523,
        "customer": {
          "name": "Rahim Ahmed",
          "email": "rahim@example.com",
          "phoneNumber": "+880171234567"
        },
        "productDetails": {
          "quantity": 2,
          "unitPrice": 1500,
          "totalPrice": 3000,
          "discount": 0,
          "variantId": "var_507f1f77bcf86cd799439011",
          "variation": {
            "size": "L",
            "color": "Blue"
          }
        },
        "orderDate": "2025-01-15T10:30:00.000Z",
        "status": "completed",
        "orderTotal": 3000,
        "deliveryStatus": "delivered"
      }
    ],
    "customers": [
      {
        "customerPhone": "+880171234567",
        "customerName": "Rahim Ahmed",
        "customerEmail": "rahim@example.com",
        "totalOrders": 8,
        "totalQuantity": 24,
        "totalSpent": 36000,
        "averageOrderValue": 4500,
        "firstOrderDate": "2024-08-10T08:15:00.000Z",
        "lastOrderDate": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 8,
      "totalItems": 156,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPreviousPage": false,
      "nextPage": 2,
      "prevPage": null
    }
  }
}
```

### Response Fields

#### Product Object
| Field | Type | Description |
|-------|------|-------------|
| id | string | Product UUID |
| name | string | Product name |
| sku | string | Product SKU |
| slug | string | URL-friendly slug |
| thumbnail | string | Product image URL |
| unitPrice | number | Current unit price |
| currentStock | number | Current stock quantity |

#### Summary Object
| Field | Type | Description |
|-------|------|-------------|
| totalOrders | number | Total number of orders |
| totalQuantitySold | number | Total units sold |
| totalRevenue | number | Total revenue from orders |
| averageOrderValue | number | Average order value |
| averageQuantityPerOrder | number | Average quantity per order |
| uniqueCustomers | number | Number of unique customers |
| statusBreakdown | object | Order count by status |

#### Order Object
| Field | Type | Description |
|-------|------|-------------|
| orderId | string | Order UUID |
| orderNumber | number | Human-readable order number |
| customer | object | Customer information |
| productDetails | object | Product-specific order details |
| orderDate | string (ISO 8601) | Order creation date |
| status | string | Order status |
| orderTotal | number | Total order amount |
| deliveryStatus | string | Delivery status |

#### Customer Object
| Field | Type | Description |
|-------|------|-------------|
| customerPhone | string | Customer phone number |
| customerName | string | Customer name |
| customerEmail | string | Customer email |
| totalOrders | number | Total orders by customer |
| totalQuantity | number | Total quantity purchased |
| totalSpent | number | Total amount spent |
| averageOrderValue | number | Average order value |
| firstOrderDate | string (ISO 8601) | First order date |
| lastOrderDate | string (ISO 8601) | Last order date |

---

## 2. Product Purchase History API

### Endpoint

```
GET /api/v1/product/analytics/purchase-history/:productId
```

### Description

Retrieves complete purchase order history for product restocking including:
- All supplier purchase orders for the product
- Cost analytics and pricing data
- Purchase statistics

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string (UUID) | Yes | Unique product identifier |

### Query Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| page | number | 1 | - | Page number |
| limit | number | 20 | 100 | Items per page |
| sortBy | string | createdAt | - | Sort field: createdAt, purchaseNumber, quantity, unitPrice |
| sortOrder | string | desc | - | Sort direction: asc, desc |
| startDate | string (ISO 8601) | - | - | Filter from start date |
| endDate | string (ISO 8601) | - | - | Filter until end date |

### Example Request

```bash
curl -X GET \
  'https://api.example.com/api/v1/product/analytics/purchase-history/507f1f77bcf86cd799439011?page=1&limit=20&sortBy=createdAt&sortOrder=desc' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### Response Structure

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Product purchase history retrieved successfully",
  "data": {
    "product": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Premium Cotton T-Shirt",
      "sku": "TSHIRT-001",
      "currentStock": 250,
      "lastPurchasedAt": "2025-01-10T14:00:00.000Z"
    },
    "summary": {
      "totalPurchaseOrders": 28,
      "totalQuantityPurchased": 1500,
      "totalCost": 1200000,
      "averagePurchaseQuantity": 53.57,
      "averageCostPerUnit": 800,
      "lastPurchaseOrder": {
        "purchaseNumber": 5023,
        "date": "2025-01-10T14:00:00.000Z",
        "quantity": 100,
        "unitPrice": 800
      }
    },
    "purchaseOrders": [
      {
        "purchaseOrderId": "507f191e810c19729de860ea",
        "purchaseNumber": 5023,
        "productDetails": {
          "quantity": 100,
          "unitPrice": 800,
          "totalCost": 80000,
          "variantId": "var_507f1f77bcf86cd799439011",
          "title": "Premium Cotton T-Shirt",
          "sku": "TSHIRT-001"
        },
        "purchaseDate": "2025-01-10T14:00:00.000Z",
        "totalAmount": 80000,
        "createdAt": "2025-01-10T14:00:00.000Z"
      }
    ],
    "suppliers": [],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 28,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPreviousPage": false,
      "nextPage": 2,
      "prevPage": null
    }
  }
}
```

### Response Fields

#### Product Object
| Field | Type | Description |
|-------|------|-------------|
| id | string | Product UUID |
| name | string | Product name |
| sku | string | Product SKU |
| currentStock | number | Current stock quantity |
| lastPurchasedAt | string (ISO 8601) | Last purchase date |

#### Summary Object
| Field | Type | Description |
|-------|------|-------------|
| totalPurchaseOrders | number | Total number of purchase orders |
| totalQuantityPurchased | number | Total quantity purchased |
| totalCost | number | Total cost of purchases |
| averagePurchaseQuantity | number | Average quantity per order |
| averageCostPerUnit | number | Average cost per unit |
| lastPurchaseOrder | object | Details of last purchase |

#### Purchase Order Object
| Field | Type | Description |
|-------|------|-------------|
| purchaseOrderId | string | Purchase order UUID |
| purchaseNumber | number | Human-readable purchase number |
| productDetails | object | Product-specific details |
| purchaseDate | string (ISO 8601) | Purchase date |
| totalAmount | number | Total amount |
| createdAt | string (ISO 8601) | Creation timestamp |

---

## 3. Product Adjustment History API

### Endpoint

```
GET /api/v1/product/analytics/adjustment-history/:productId
```

### Description

Retrieves complete inventory adjustment history including:
- All stock adjustments (add, remove, set)
- Approval workflow details
- User audit trail
- Adjustment statistics

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string (UUID) | Yes | Unique product identifier |

### Query Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| page | number | 1 | - | Page number |
| limit | number | 20 | 100 | Items per page |
| sortBy | string | createdAt | - | Sort field: createdAt, quantityChange, adjustmentType, status |
| sortOrder | string | desc | - | Sort direction: asc, desc |
| startDate | string (ISO 8601) | - | - | Filter from start date |
| endDate | string (ISO 8601) | - | - | Filter until end date |
| adjustmentType | string | - | - | Filter by type: add, remove, set |
| status | string | - | - | Filter by status: pending, approved, rejected, applied |

### Example Request

```bash
curl -X GET \
  'https://api.example.com/api/v1/product/analytics/adjustment-history/507f1f77bcf86cd799439011?page=1&limit=20&sortBy=createdAt&sortOrder=desc&status=approved' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### Response Structure

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Product adjustment history retrieved successfully",
  "data": {
    "product": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Premium Cotton T-Shirt",
      "sku": "TSHIRT-001",
      "currentQuantity": 250
    },
    "summary": {
      "totalAdjustments": 35,
      "totalAdded": 500,
      "totalRemoved": 180,
      "totalSet": 0,
      "netChange": 320,
      "pendingApprovals": 2,
      "approvedAdjustments": 30,
      "rejectedAdjustments": 3,
      "typeBreakdown": {
        "add": 18,
        "remove": 12,
        "set": 5
      },
      "statusBreakdown": {
        "approved": 30,
        "pending": 2,
        "rejected": 3,
        "applied": 0
      }
    },
    "adjustments": [
      {
        "adjustmentId": "ADJ-1705305600000-abc123",
        "adjustmentType": "add",
        "oldQuantity": 200,
        "newQuantity": 250,
        "quantityChange": 50,
        "variationId": "var_507f1f77bcf86cd799439011",
        "variationDetails": {
          "size": "L",
          "color": "Blue",
          "sku": "TSHIRT-001-L-BLU"
        },
        "reason": "Stock replenishment from monthly purchase order",
        "notes": "Received from supplier, quality checked",
        "referenceNumber": "PO-5023",
        "adjustedBy": {
          "userId": "507f1f77bcf86cd799439011",
          "userName": "Admin User",
          "userEmail": "admin@example.com",
          "userType": "admin"
        },
        "status": "approved",
        "approvedBy": {
          "userId": "507f191e810c19729de860ea",
          "userName": "Inventory Manager",
          "approvedAt": "2025-01-12T09:15:00.000Z"
        },
        "createdAt": "2025-01-12T08:00:00.000Z",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0..."
      }
    ],
    "adjustmentSummary": [
      {
        "type": "add",
        "count": 18,
        "totalQuantity": 500,
        "percentage": 51.43
      },
      {
        "type": "remove",
        "count": 12,
        "totalQuantity": 180,
        "percentage": 34.29
      },
      {
        "type": "set",
        "count": 5,
        "totalQuantity": 0,
        "percentage": 14.29
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 35,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPreviousPage": false,
      "nextPage": 2,
      "prevPage": null
    }
  }
}
```

### Response Fields

#### Product Object
| Field | Type | Description |
|-------|------|-------------|
| id | string | Product UUID |
| name | string | Product name |
| sku | string | Product SKU |
| currentQuantity | number | Current quantity |

#### Summary Object
| Field | Type | Description |
|-------|------|-------------|
| totalAdjustments | number | Total number of adjustments |
| totalAdded | number | Total quantity added |
| totalRemoved | number | Total quantity removed |
| totalSet | number | Number of 'set' operations |
| netChange | number | Net change (added - removed) |
| pendingApprovals | number | Number of pending approvals |
| approvedAdjustments | number | Number of approved adjustments |
| rejectedAdjustments | number | Number of rejected adjustments |
| typeBreakdown | object | Count by adjustment type |
| statusBreakdown | object | Count by status |

#### Adjustment Object
| Field | Type | Description |
|-------|------|-------------|
| adjustmentId | string | Adjustment ID |
| adjustmentType | string | Type: add, remove, set |
| oldQuantity | number | Quantity before adjustment |
| newQuantity | number | Quantity after adjustment |
| quantityChange | number | Net change (+/-) |
| variationId | string | Variation ID (if applicable) |
| variationDetails | object | Variation details |
| reason | string | Adjustment reason |
| notes | string | Additional notes |
| referenceNumber | string | Reference number |
| adjustedBy | object | User who made adjustment |
| status | string | Approval status |
| approvedBy | object | Approver details (if approved) |
| createdAt | string (ISO 8601) | Creation timestamp |
| ipAddress | string | IP address |
| userAgent | string | Browser/client info |

---

## Error Handling

All endpoints follow a consistent error response format:

### 404 Not Found

```json
{
  "success": false,
  "message": "Product not found",
  "error": "Product with id 507f1f77bcf86cd799439011 does not exist"
}
```

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "page",
      "message": "Page must be a positive number"
    },
    {
      "field": "sortBy",
      "message": "Invalid sort field. Must be one of: createdAt, orderNumber, totalPrice, quantity, status"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Authentication required",
  "error": "No authorization token provided"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error message details"
}
```

---

## Frontend Implementation Guide

### Using Fetch API

#### Example 1: Get Product Order History

```javascript
const getOrderHistory = async (productId, page = 1, limit = 20) => {
  const token = localStorage.getItem('authToken');
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  try {
    const response = await fetch(
      `/api/v1/product/analytics/order-history/${productId}?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch order history');
    }

    return data;
  } catch (error) {
    console.error('Error fetching order history:', error);
    throw error;
  }
};

// Usage
getOrderHistory('507f1f77bcf86cd799439011', 1, 20)
  .then(result => {
    console.log('Orders:', result.data.orders);
    console.log('Summary:', result.data.summary);
    console.log('Customers:', result.data.customers);
  })
  .catch(error => {
    // Handle error
  });
```

#### Example 2: With Date Filter

```javascript
const getOrderHistoryByDate = async (productId, startDate, endDate) => {
  const token = localStorage.getItem('authToken');
  const queryParams = new URLSearchParams({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    status: 'completed'
  });

  const response = await fetch(
    `/api/v1/product/analytics/order-history/${productId}?${queryParams}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return await response.json();
};
```

### Using Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1/product/analytics',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
});

// Get order history
const getOrderHistory = async (productId, params = {}) => {
  try {
    const response = await api.get(`/order-history/${productId}`, {
      params: {
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ...params
      }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get purchase history
const getPurchaseHistory = async (productId, params = {}) => {
  try {
    const response = await api.get(`/purchase-history/${productId}`, {
      params
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get adjustment history
const getAdjustmentHistory = async (productId, params = {}) => {
  try {
    const response = await api.get(`/adjustment-history/${productId}`, {
      params
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';

const ProductOrderHistory = ({ productId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('authToken');
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: '20',
          ...(status && { status })
        });

        const response = await fetch(
          `/api/v1/product/analytics/order-history/${productId}?${queryParams}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message);
        }

        setData(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, page, status]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return (
    <div>
      <h2>Order History for {data.product.name}</h2>

      {/* Summary */}
      <div className="summary">
        <h3>Summary</h3>
        <p>Total Orders: {data.summary.totalOrders}</p>
        <p>Total Revenue: ${data.summary.totalRevenue}</p>
        <p>Unique Customers: {data.summary.uniqueCustomers}</p>
      </div>

      {/* Filter */}
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All Statuses</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
        <option value="cancelled">Cancelled</option>
      </select>

      {/* Orders Table */}
      <table>
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.orders.map(order => (
            <tr key={order.orderId}>
              <td>{order.orderNumber}</td>
              <td>{order.customer.name}</td>
              <td>{order.productDetails.quantity}</td>
              <td>${order.productDetails.totalPrice}</td>
              <td>{new Date(order.orderDate).toLocaleDateString()}</td>
              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={!data.pagination.hasPreviousPage}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span>
          Page {data.pagination.currentPage} of {data.pagination.totalPages}
        </span>
        <button
          disabled={!data.pagination.hasNextPage}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductOrderHistory;
```

### Pagination Implementation

```javascript
const usePagination = (data) => {
  const { currentPage, totalPages, hasNextPage, hasPreviousPage } = data.pagination;

  const goToPage = (page) => {
    // Update page state
    setPage(page);
  };

  const goToNextPage = () => {
    if (hasNextPage) {
      goToPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (hasPreviousPage) {
      goToPage(currentPage - 1);
    }
  };

  return {
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
    goToPage
  };
};
```

---

## Testing

### Test with cURL

```bash
# Order History
curl -X GET \
  'https://api.example.com/api/v1/product/analytics/order-history/507f1f77bcf86cd799439011?page=1&limit=20' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Purchase History
curl -X GET \
  'https://api.example.com/api/v1/product/analytics/purchase-history/507f1f77bcf86cd799439011?page=1&limit=20' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Adjustment History
curl -X GET \
  'https://api.example.com/api/v1/product/analytics/adjustment-history/507f1f77bcf86cd799439011?page=1&limit=20&status=approved' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

---

## Best Practices

1. **Always handle errors** - Check response status and handle errors gracefully
2. **Implement loading states** - Show loading indicators during API calls
3. **Cache responses** - Consider caching product data to reduce API calls
4. **Use pagination** - Don't fetch all data at once, use pagination for large datasets
5. **Validate inputs** - Validate query parameters before making API calls
6. **Handle date formats** - Always use ISO 8601 format for dates
7. **Secure tokens** - Store and handle authentication tokens securely
8. **Optimize re-renders** - Use React.memo, useMemo, or useCallback to optimize performance

---

## Support

For issues or questions about the Product Analytics API, please contact the development team or create an issue in the project repository.

---

**Last Updated:** January 2025
**API Version:** 1.0.0
