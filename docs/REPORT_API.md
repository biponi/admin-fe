# E-Commerce Report API Documentation

Complete RESTful API documentation for all reporting endpoints. This module provides comprehensive business analytics, financial reporting, inventory management, and operational insights.

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Common Query Parameters](#common-query-parameters)
- [API Endpoints](#api-endpoints)
  - [1. Executive Dashboard](#1-executive-dashboard)
  - [2. Sales Report](#2-sales-report)
  - [3. Order Report](#3-order-report)
  - [4. Product Report](#4-product-report)
  - [5. Customer Report](#5-customer-report)
  - [6. Payment Report](#6-payment-report)
  - [7. Financial Report](#7-financial-report)
  - [8. Inventory Report](#8-inventory-report)
  - [9. Shipping Report](#9-shipping-report)
  - [10. Refund and Return Report](#10-refund-and-return-report)
  - [11. Coupon and Discount Report](#11-coupon-and-discount-report)
  - [12. Vendor Supplier Report](#12-vendor-supplier-report)
  - [13. Warehouse Report](#13-warehouse-report)
  - [14. User Activity Report](#14-user-activity-report)
  - [Legacy Endpoints](#legacy-endpoints)
- [Error Handling](#error-handling)
- [Status Codes](#status-codes)

---

## Overview

**Base URL:** `/api/v1/report`

**Authentication:** All endpoints require a valid JWT token via `Authorization: Bearer <token>` header.

**Database:** MongoDB (Mongoose). All aggregations run directly against MongoDB collections.

**Currency:** All monetary values are in BDT (Bangladeshi Taka).

**Timezone:** All date handling uses Bangladesh timezone (Asia/Dhaka, UTC+6).

---

## Authentication

Every request must include a valid JWT token:

```
Authorization: Bearer <jwt_token>
```

Or via query parameter (for testing only):

```
?token=<jwt_token>
```

---

## Common Query Parameters

Most endpoints accept these shared query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `preset` | string | - | Date preset: `today`, `yesterday`, `last_7_days`, `last_30_days`, `this_month`, `last_month`, `last_3_months`, `last_6_months`, `this_year`, `last_year` |
| `startDate` | string | 30 days ago | ISO 8601 start date (`2026-01-01` or `2026-01-01T00:00:00`) |
| `endDate` | string | today | ISO 8601 end date |
| `categoryId` | string | - | Filter by product category ID |
| `brandId` | string | - | Filter by brand |
| `supplierId` | string | - | Filter by manufacturer/supplier ID |
| `customerId` | string | - | Filter by customer phone number |
| `paymentMethod` | string | - | Filter by payment type: `cash`, `bkash`, `nagad`, `card`, `bank`, `online` |
| `orderStatus` | string | - | Filter by order status: `pending`, `processing`, `shipped`, `completed`, `cancel`, `failed`, `return`, `delete` |
| `orderCreatedBy` | string | - | Filter by order creator: `customer`, `admin`, `retailer`, etc. |
| `interval` | string | `day` | Time grouping: `day`, `week`, `month` |
| `page` | number | `1` | Pagination page number |
| `limit` | number | `50` | Items per page (max 1000) |

**Date Resolution:** If `preset` is provided, it takes precedence over `startDate`/`endDate`.

---

## API Endpoints

---

### 1. Executive Dashboard

**`GET /api/v1/report/dashboard`**

Provides a complete business overview with KPIs, charts data, and period-over-period comparison. This is the main landing page of the Reports module.

#### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `preset` or `startDate`/`endDate` | No | Date range (default: last 30 days) |

#### Response Schema

```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2026-06-01",
      "endDate": "2026-06-30"
    },
    "kpis": {
      "sales": {
        "grossRevenue": 1250000,
        "netRevenue": 1100000,
        "totalOrders": 450,
        "completedOrders": 380,
        "pendingOrders": 20,
        "processingOrders": 30,
        "shippedOrders": 15,
        "cancelledOrders": 5,
        "returnedOrders": 3,
        "refundedOrders": 2,
        "growth": {
          "revenue": 18.5,
          "orders": 12.3
        }
      },
      "financial": {
        "totalProfit": 770000,
        "totalDiscount": 150000,
        "shippingIncome": 67500,
        "refundAmount": 45000
      },
      "customer": {
        "totalCustomers": 320,
        "newCustomers": 180,
        "returningCustomers": 140
      },
      "performance": {
        "aov": 2444.44,
        "avgRevenuePerCustomer": 3437.50,
        "orderCompletionRate": 84.44,
        "refundRate": 0.67,
        "returnRate": 0.67
      }
    },
    "charts": {
      "salesTrend": [
        { "date": "2026-06-01", "sales": 45000, "orders": 18 }
      ],
      "revenueDistribution": [
        { "segment": "Product Revenue", "value": 1100000 },
        { "segment": "Shipping Revenue", "value": 67500 },
        { "segment": "Discount", "value": 150000 },
        { "segment": "Refund", "value": 45000 }
      ],
      "topCategories": [
        { "category": "Electronics", "revenue": 450000 }
      ],
      "salesHeatmap": [
        { "hour": 0, "sales": 12000, "orders": 5 }
      ]
    },
    "businessSummary": {
      "currentPeriod": {},
      "previousPeriod": {}
    }
  }
}
```

#### Example Requests

```
GET /api/v1/report/dashboard?preset=last_30_days
GET /api/v1/report/dashboard?startDate=2026-06-01&endDate=2026-06-30
```

---

### 2. Sales Report

**`GET /api/v1/report/sales`**

Detailed revenue analysis with daily breakdown, period comparison, and breakdowns by category, brand, payment method, and sales channel.

#### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `preset` or `startDate`/`endDate` | No | Date range |
| `categoryId` | No | Filter by category |
| `brandId` | No | Filter by brand |
| `paymentMethod` | No | Filter by payment method |
| `orderStatus` | No | Filter by order status |

#### Response Schema

```json
{
  "success": true,
  "data": {
    "period": { "startDate": "2026-06-01", "endDate": "2026-06-30" },
    "dailySales": [
      {
        "date": "2026-06-01",
        "orders": 18,
        "grossRevenue": 52000,
        "discounts": 5000,
        "netRevenue": 47000,
        "profit": 47000,
        "deliveryCharges": 2700,
        "aov": 2611.11
      }
    ],
    "comparison": {
      "currentPeriod": {
        "period": { "startDate": "2026-06-01", "endDate": "2026-06-30" },
        "totalOrders": 450,
        "totalRevenue": 1100000,
        "totalDiscounts": 150000,
        "aov": 2444.44
      },
      "previousPeriod": {
        "period": { "startDate": "2026-05-02", "endDate": "2026-05-31" },
        "totalOrders": 400,
        "totalRevenue": 930000,
        "totalDiscounts": 120000,
        "aov": 2325.00
      },
      "growth": {
        "orders": 12.50,
        "revenue": 18.28,
        "aov": 5.13
      }
    },
    "byCategory": [
      { "categoryId": "cat_001", "orders": 120, "revenue": 350000, "quantitySold": 240 }
    ],
    "byBrand": [
      { "brand": "Nike", "revenue": 280000, "quantitySold": 150, "orders": 80 }
    ],
    "byPaymentMethod": [
      { "paymentMethod": "bkash", "orders": 200, "revenue": 500000 }
    ],
    "byChannel": [
      { "channel": "customer", "orders": 300, "revenue": 700000, "discounts": 80000 }
    ]
  }
}
```

#### Example Requests

```
GET /api/v1/report/sales?preset=this_month
GET /api/v1/report/sales?startDate=2026-06-01&endDate=2026-06-30&categoryId=cat_001
```

---

### 3. Order Report

**`GET /api/v1/report/orders`**

Order analysis with status summary, daily breakdown, top cancelled products, and fulfillment lifecycle timing.

#### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `preset` or `startDate`/`endDate` | No | Date range |
| `orderStatus` | No | Filter by status |
| `orderCreatedBy` | No | Filter by creator |

#### Response Schema

```json
{
  "success": true,
  "data": {
    "period": { "startDate": "2026-06-01", "endDate": "2026-06-30" },
    "summary": [
      { "status": "completed", "count": 380, "revenue": 950000, "subtotal": 1050000 },
      { "status": "pending", "count": 20, "revenue": 50000, "subtotal": 55000 }
    ],
    "dailyReport": [
      {
        "date": "2026-06-01",
        "totalOrders": 18,
        "totalRevenue": 45000,
        "completed": 15,
        "cancelled": 1,
        "returned": 0
      }
    ],
    "topCancelledProducts": [
      {
        "productId": "prod_001",
        "productName": "Wireless Headphones",
        "cancelledOrders": 8,
        "totalQuantity": 8,
        "totalRevenue": 24000
      }
    ],
    "lifecycle": {
      "avgFulfillmentHours": 36.5,
      "minFulfillmentHours": 2.1,
      "maxFulfillmentHours": 168.0,
      "totalOrders": 450
    }
  }
}
```

#### Order Status Values

| Status | Description |
|--------|-------------|
| `pending` | Awaiting payment or confirmation |
| `processing` | Being prepared |
| `shipped` | Handed to courier |
| `completed` | Delivered successfully |
| `cancel` | Cancelled by customer/admin |
| `failed` | Payment or processing failed |
| `return` | Returned by customer |
| `delete` | Soft deleted |

---

### 4. Product Report

**`GET /api/v1/report/products`**

Product performance analysis with summary cards, best/worst selling products, never sold products, and category/brand performance.

#### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `preset` or `startDate`/`endDate` | No | Date range |
| `categoryId` | No | Filter by category |
| `brandId` | No | Filter by brand |
| `limit` | No | Max results per section (default: 20) |

#### Response Schema

```json
{
  "success": true,
  "data": {
    "period": { "startDate": "2026-06-01", "endDate": "2026-06-30" },
    "summary": {
      "totalProducts": 500,
      "activeProducts": 420,
      "inactiveProducts": 80,
      "outOfStock": 15,
      "lowStock": 25
    },
    "bestSellingProducts": [
      {
        "productId": "prod_001",
        "productName": "Wireless Headphones",
        "sku": "WH-100",
        "thumbnail": "https://...",
        "totalSold": 120,
        "totalRevenue": 360000,
        "avgUnitPrice": 3000,
        "orderCount": 95
      }
    ],
    "worstSellingProducts": [],
    "highestRevenueProducts": [],
    "highestProfitProducts": [
      {
        "productId": "prod_001",
        "productName": "Wireless Headphones",
        "totalRevenue": 360000,
        "totalSold": 120,
        "estimatedMargin": 108000
      }
    ],
    "neverSoldProducts": [
      {
        "productId": "prod_050",
        "productName": "USB Cable",
        "sku": "USB-01",
        "stock": 50,
        "createdAt": "2026-01-15"
      }
    ],
    "categoryPerformance": [
      { "categoryId": "cat_001", "revenue": 350000, "orders": 120, "productsSold": 240 }
    ],
    "brandPerformance": [
      { "brand": "Nike", "revenue": 280000, "orders": 80 }
    ]
  }
}
```

---

### 5. Customer Report

**`GET /api/v1/report/customers`**

Customer analytics with CLV, inactive customers, geographic distribution, and repeat purchase analysis.

#### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `preset` or `startDate`/`endDate` | No | Date range |
| `inactiveDays` | No | Days threshold for inactive (default: 90) |

#### Response Schema

```json
{
  "success": true,
  "data": {
    "period": { "startDate": "2026-06-01", "endDate": "2026-06-30" },
    "summary": {
      "totalCustomers": 320,
      "newCustomers": 180,
      "returningCustomers": 140,
      "totalRevenue": 1100000,
      "avgRevenuePerCustomer": 3437.50
    },
    "customerLifetimeValue": [
      {
        "phoneNumber": "+8801712345678",
        "customerName": "Ahmed Khan",
        "email": "ahmed@example.com",
        "totalOrders": 12,
        "totalSpend": 85000,
        "avgOrderValue": 7083.33,
        "lifetimeValue": 85000,
        "firstOrderDate": "2026-01-10",
        "lastOrderDate": "2026-06-28"
      }
    ],
    "inactiveCustomers": [
      {
        "phoneNumber": "+8801812345678",
        "customerName": "Fatima Ali",
        "email": "fatima@example.com",
        "totalOrders": 5,
        "totalSpent": 25000,
        "lastOrderDate": "2026-03-15",
        "daysSinceLastOrder": 107
      }
    ],
    "locationReport": [
      {
        "district": "Dhaka",
        "division": "Dhaka",
        "customerCount": 180,
        "orders": 250,
        "revenue": 700000
      }
    ],
    "repeatPurchaseAnalysis": {
      "summary": {
        "totalCustomers": 320,
        "oneTimeCustomers": 180,
        "repeatCustomers": 140,
        "repeatRate": 43.75,
        "avgDaysBetweenOrders": 18.5
      },
      "topRepeatCustomers": [
        {
          "phoneNumber": "+8801712345678",
          "totalOrders": 12,
          "totalSpent": 85000,
          "avgDaysBetweenOrders": 12.3
        }
      ]
    }
  }
}
```

---

### 6. Payment Report

**`GET /api/v1/report/payments`**

Payment analysis with method breakdown, failed payments, and success trend.

#### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `preset` or `startDate`/`endDate` | No | Date range |
| `interval` | No | Trend grouping: `day`, `week`, `month` |

#### Response Schema

```json
{
  "success": true,
  "data": {
    "period": { "startDate": "2026-06-01", "endDate": "2026-06-30" },
    "summary": {
      "totalPayments": 450,
      "totalAmount": 1100000,
      "successful": { "count": 420, "amount": 1050000 },
      "failed": { "count": 20, "amount": 45000 },
      "processing": { "count": 10, "amount": 5000 }
    },
    "methodAnalysis": [
      {
        "method": "bkash",
        "orders": 200,
        "revenue": 500000,
        "successRate": 97.50
      }
    ],
    "failedPayments": [
      {
        "orderNumber": 1234,
        "customerName": "Ahmed Khan",
        "customerPhone": "+8801712345678",
        "amount": 3500,
        "method": "bkash",
        "date": "2026-06-15 14:30",
        "createdAt": "2026-06-15"
      }
    ],
    "successTrend": [
      {
        "period": "2026-06-01",
        "total": 18,
        "completed": 16,
        "failed": 2,
        "totalAmount": 45000,
        "successRate": 88.89
      }
    ]
  }
}
```

---

### 7. Financial Report

**`GET /api/v1/report/finance`**

Financial analysis with profit trends, margin analysis, and cash flow summary.

#### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `preset` or `startDate`/`endDate` | No | Date range |
| `interval` | No | Trend grouping: `day`, `week`, `month` |

#### Response Schema

```json
{
  "success": true,
  "data": {
    "period": { "startDate": "2026-06-01", "endDate": "2026-06-30" },
    "summary": {
      "grossRevenue": 1250000,
      "netRevenue": 1100000,
      "totalDiscounts": 150000,
      "totalDeliveryCharges": 67500,
      "estimatedProductCost": 330000,
      "grossProfit": 770000,
      "totalRefunds": 45000,
      "netProfit": 725000,
      "totalOrders": 450,
      "aov": 2444.44
    },
    "profitTrend": [
      {
        "period": "2026-06-01",
        "revenue": 47000,
        "discounts": 5000,
        "deliveryCharges": 2700,
        "estimatedCost": 14100,
        "profit": 32900,
        "orders": 18,
        "margin": 70.00
      }
    ],
    "grossMarginByCategory": [
      {
        "categoryId": "Electronics",
        "revenue": 350000,
        "cost": 105000,
        "profit": 245000,
        "margin": 70.00
      }
    ],
    "profitByProduct": [
      {
        "productId": "prod_001",
        "productName": "Wireless Headphones",
        "revenue": 360000,
        "cost": 108000,
        "profit": 252000,
        "quantity": 120
      }
    ],
    "cashFlow": {
      "moneyIn": {
        "productSales": 1100000,
        "shippingCharges": 67500,
        "total": 1167500
      },
      "moneyOut": {
        "refunds": 45000,
        "estimatedProductCost": 330000,
        "total": 375000
      },
      "netCashFlow": 792500,
      "collected": 1050000,
      "outstanding": 50000
    }
  }
}
```

> **Note:** `estimatedProductCost` uses a 30% cost ratio placeholder. Replace with actual product cost data when available.

---

### 8. Inventory Report

**`GET /api/v1/report/inventory`**

Inventory levels, stock value, dead stock detection, and aging analysis.

#### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `page` | No | Page number (default: 1) |
| `limit` | No | Items per page (default: 50) |
| `deadStockDays` | No | Days threshold for dead stock (default: 90) |
| `categoryId` | No | Filter by category |

#### Response Schema

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalProducts": 500,
      "totalStock": 12000,
      "totalCostValue": 3600000,
      "totalSellingValue": 6000000,
      "potentialProfit": 2400000,
      "outOfStock": 15,
      "lowStock": 25
    },
    "currentInventory": {
      "products": [
        {
          "productId": "prod_001",
          "productName": "Wireless Headphones",
          "sku": "WH-100",
          "currentStock": 50,
          "unitPrice": 1500,
          "totalPrice": 3000,
          "costValue": 75000,
          "sellingValue": 150000
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 50,
        "total": 500,
        "totalPages": 10
      }
    },
    "inventoryValue": [
      {
        "productId": "prod_001",
        "productName": "Wireless Headphones",
        "sku": "WH-100",
        "stock": 50,
        "costValue": 75000,
        "sellingValue": 150000,
        "potentialProfit": 75000
      }
    ],
    "deadStock": [
      {
        "productId": "prod_050",
        "productName": "USB Cable",
        "sku": "USB-01",
        "stock": 200,
        "value": 40000
      }
    ],
    "inventoryAging": [
      { "period": "0-30 Days", "productCount": 200, "totalStock": 5000, "totalValue": 1500000 },
      { "period": "31-60 Days", "productCount": 150, "totalStock": 3000, "totalValue": 900000 },
      { "period": "61-90 Days", "productCount": 100, "totalStock": 2500, "totalValue": 750000 },
      { "period": "90+ Days", "productCount": 50, "totalStock": 1500, "totalValue": 450000 }
    ]
  }
}
```

---

### 9. Shipping Report

**`GET /api/v1/report/shipping`**

Shipping and delivery analysis with courier performance and failed deliveries.

#### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `preset` or `startDate`/`endDate` | No | Date range |

#### Response Schema

```json
{
  "success": true,
  "data": {
    "period": { "startDate": "2026-06-01", "endDate": "2026-06-30" },
    "summary": {
      "totalShipments": 400,
      "delivered": 350,
      "inTransit": 30,
      "pending": 10,
      "failed": 5,
      "returned": 5,
      "totalDeliveryCharges": 60000,
      "totalCollected": 950000,
      "providers": [
        { "provider": "steadfast", "count": 250 },
        { "provider": "pathao", "count": 100 },
        { "provider": "carrybee", "count": 50 }
      ]
    },
    "courierPerformance": [
      {
        "provider": "steadfast",
        "totalOrders": 250,
        "delivered": 230,
        "failed": 10,
        "returned": 10,
        "totalCOD": 600000,
        "totalCollected": 580000,
        "avgDeliveryCharge": 120,
        "deliveryRate": 92.00
      }
    ],
    "failedDeliveries": [
      {
        "courierOrderNumber": 1001,
        "provider": "steadfast",
        "consignmentId": "SF12345",
        "recipientName": "Test Customer",
        "recipientPhone": "+8801712345678",
        "codAmount": 3500,
        "deliveryStatus": "cancelled",
        "note": "Customer refused delivery",
        "createdAt": "2026-06-15"
      }
    ]
  }
}
```

#### Courier Delivery Status Values

```
pending, pickup_pending, picked_up, in_transit, delivered,
delivered_approval_pending, partial_delivered, cancelled, returned,
hold, on_hold, in_review, unknown
```

---

### 10. Refund and Return Report

**`GET /api/v1/report/refunds`**

Refund and return analysis with reason breakdown and trend.

#### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `preset` or `startDate`/`endDate` | No | Date range |
| `interval` | No | Trend grouping: `day`, `week`, `month` |

#### Response Schema

```json
{
  "success": true,
  "data": {
    "period": { "startDate": "2026-06-01", "endDate": "2026-06-30" },
    "summary": {
      "refundRequests": 25,
      "approvedRefunds": 18,
      "pendingRefunds": 5,
      "failedRefunds": 2,
      "returnedOrders": 15,
      "totalRefundAmount": 45000
    },
    "reasonAnalysis": [
      {
        "reason": "product_unavailable",
        "count": 10,
        "totalAmount": 20000,
        "percentage": 40.00
      },
      {
        "reason": "customer_request",
        "count": 8,
        "totalAmount": 15000,
        "percentage": 32.00
      }
    ],
    "mostReturnedProducts": [
      {
        "productId": "prod_010",
        "productName": "T-Shirt Blue",
        "returnCount": 5,
        "totalReturnedQty": 5,
        "revenueLost": 7500
      }
    ],
    "returnTrend": [
      {
        "period": "2026-06-01",
        "returns": 2,
        "refundAmount": 3000
      }
    ]
  }
}
```

#### Refund Reason Values

| Reason | Description |
|--------|-------------|
| `product_unavailable` | Product went out of stock |
| `payment_failed` | Payment processing failed |
| `order_cancelled` | Order cancelled before shipment |
| `customer_request` | Customer requested cancellation |
| `fraud_detected` | Suspected fraudulent order |
| `other` | Other reason |

#### Refund Status Values

| Status | Description |
|--------|-------------|
| `pending` | Refund requested, awaiting approval |
| `processing` | Refund approved, being processed |
| `completed` | Refund completed successfully |
| `failed` | Refund processing failed |

---

### 11. Coupon and Discount Report

**`GET /api/v1/report/coupons`**

Coupon usage and discount impact analysis.

#### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `preset` or `startDate`/`endDate` | No | Date range |

#### Response Schema

```json
{
  "success": true,
  "data": {
    "period": { "startDate": "2026-06-01", "endDate": "2026-06-30" },
    "summary": {
      "couponsUsed": 120,
      "totalDiscount": 48000,
      "revenueGenerated": 360000,
      "averageDiscount": 400
    },
    "performance": [
      {
        "couponCode": "SUMMER20",
        "couponType": "global",
        "usage": 50,
        "revenue": 150000,
        "discount": 30000
      }
    ],
    "discountImpact": {
      "withDiscount": {
        "orders": 120,
        "totalDiscount": 48000,
        "avgBasketSize": 3000,
        "revenueGenerated": 312000
      },
      "withoutDiscount": {
        "orders": 330,
        "avgBasketSize": 2424,
        "revenueGenerated": 800000
      }
    }
  }
}
```

#### Coupon Type Values

| Type | Description |
|------|-------------|
| `global` | Store-wide coupon |
| `customer` | Customer-specific coupon |

---

### 12. Vendor Supplier Report

**`GET /api/v1/report/vendors`**

Vendor/supplier performance and product cost analysis.

#### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `preset` or `startDate`/`endDate` | No | Date range |

#### Response Schema

```json
{
  "success": true,
  "data": {
    "period": { "startDate": "2026-06-01", "endDate": "2026-06-30" },
    "summary": {
      "totalSuppliers": 15,
      "activeSuppliers": 12,
      "totalPurchases": 45,
      "totalPurchaseCost": 1200000,
      "avgPurchaseValue": 26666.67
    },
    "supplierPerformance": [
      {
        "productId": "prod_001",
        "purchaseValue": 360000,
        "totalQuantity": 240,
        "purchaseCount": 8,
        "avgCost": 1500
      }
    ],
    "productCostAnalysis": {
      "products": [
        {
          "productId": "prod_001",
          "avgPurchaseCost": 1500,
          "totalPurchased": 240
        }
      ],
      "totalProducts": 20
    }
  }
}
```

---

### 13. Warehouse Report

**`GET /api/v1/report/warehouses`**

Warehouse inventory and stock movement data.

#### Query Parameters

None required.

#### Response Schema

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalWarehouses": 3,
      "totalInventoryItems": 500,
      "totalStock": 12000,
      "totalValue": 3600000
    },
    "warehouseInventory": [
      {
        "warehouseId": 1,
        "name": "Main Warehouse",
        "location": "Dhaka",
        "slug": "main-warehouse",
        "productCount": 200,
        "totalStock": 5000,
        "totalValue": 1500000
      }
    ],
    "warehouseMovement": [
      {
        "warehouseId": 1,
        "name": "Main Warehouse",
        "totalRecords": 50,
        "stockIn": 3000,
        "stockOut": 1500
      }
    ]
  }
}
```

---

### 14. User Activity Report

**`GET /api/v1/report/user-activity`**

User activity and audit log tracking.

#### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `preset` or `startDate`/`endDate` | No | Date range |
| `userId` | No | Filter by user ID |
| `action` | No | Filter by action type |
| `page` | No | Page number (default: 1) |
| `limit` | No | Items per page (default: 50) |

#### Response Schema

```json
{
  "success": true,
  "data": {
    "period": { "startDate": "2026-06-01", "endDate": "2026-06-30" },
    "summary": {
      "totalActions": 1500,
      "uniqueUsers": 8,
      "avgResponseTime": 125.5,
      "successRate": 98.50,
      "failRate": 1.50,
      "byAction": [
        { "action": "ORDER_CREATION", "count": 350 },
        { "action": "PRODUCT_MODIFICATION", "count": 200 }
      ],
      "topUsers": [
        {
          "userId": "user_001",
          "userName": "Admin",
          "actions": 450,
          "avgDuration": 110.2,
          "failures": 2
        }
      ]
    },
    "activityLog": {
      "logs": [
        {
          "userId": "user_001",
          "userName": "Admin",
          "action": "ORDER_STATUS_UPDATE",
          "endpoint": "/api/v1/order/1234/status",
          "method": "PUT",
          "duration": 85,
          "statusCode": 200,
          "success": true,
          "resourceType": "order",
          "resourceId": "1234",
          "timestamp": "2026-06-15 14:30:25"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 50,
        "total": 1500,
        "totalPages": 30
      }
    }
  }
}
```

#### Activity Action Values

| Action | Description |
|--------|-------------|
| `ORDER_CREATION` | New order created |
| `ORDER_MODIFICATION` | Order details modified |
| `ORDER_DELETION` | Order deleted |
| `ORDER_STATUS_UPDATE` | Order status changed |
| `ORDER_BULK_UPDATE` | Multiple orders updated |
| `ORDER_PRODUCT_MODIFICATION` | Order products modified |
| `ORDER_RETURN_PROCESSING` | Return processed |
| `PRODUCT_CREATION` | New product added |
| `PRODUCT_MODIFICATION` | Product details modified |
| `PRODUCT_DELETION` | Product deleted |
| `USER_LOGIN` | User logged in |
| `USER_LOGOUT` | User logged out |
| `DATA_EXPORT` | Data exported |
| `SEARCH_OPERATION` | Search performed |
| `ANALYTICS_VIEW` | Analytics page viewed |

---

## Legacy Endpoints

The following endpoints are available under `/api/v1/reports` for backward compatibility:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/reports/today` | Today's pre-computed daily report |
| `GET` | `/api/v1/reports/yesterday` | Yesterday's daily report |
| `GET` | `/api/v1/reports/daily/latest` | Most recent daily report |
| `GET` | `/api/v1/reports/daily/:date` | Report for specific YYYY-MM-DD date |
| `GET` | `/api/v1/reports/daily` | Reports in date range (`?start=&end=&limit=`) |
| `GET` | `/api/v1/reports/stats/summary` | Aggregated stats across date range |

These use pre-computed `DailyReport` snapshots, while the new endpoints compute data in real-time from the `Order` collection.

---

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common Errors

| HTTP Status | Error | Cause |
|-------------|-------|-------|
| `400` | `Invalid startDate format` | Malformed date string |
| `400` | `startDate cannot be endDate` | Start date is after end date |
| `400` | `Date range cannot exceed 2 years` | Query too broad |
| `400` | `Invalid interval` | Not one of `day`, `week`, `month` |
| `401` | `Authentication required` | Missing or invalid JWT token |
| `401` | `Token has expired` | JWT token expired |
| `403` | `Access denied` | Insufficient permissions |
| `404` | `User not found` | User account deleted |
| `500` | `Internal server error` | Unexpected server error |

---

## Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `400` | Bad Request (invalid parameters) |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (insufficient permissions) |
| `500` | Internal Server Error |

---

## Implementation Notes

1. **Revenue Formula:** `actualRevenue = totalPrice - discount` (subtotal minus discount)
2. **All monetary values** are in BDT (Bangladeshi Taka)
3. **Date handling** uses Bangladesh timezone (Asia/Dhaka, UTC+6)
4. **Product cost** in financial reports uses a 30% placeholder ratio - replace with actual cost data when available
5. **Aggregation pipelines** use MongoDB `$facet` for parallel sub-queries within a single database round-trip
6. **Caching** - Consider implementing Redis caching for frequently accessed report summaries
7. **Performance** - All pipelines are optimized with appropriate indexes on `timestamps.createdAt`, `active`, `status` fields
