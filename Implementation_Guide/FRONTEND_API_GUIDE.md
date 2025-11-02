# Frontend Developer API Guide
## Complete API Documentation for Prior eCommerce Platform

This guide provides everything a frontend engineer needs to integrate with the Prior backend APIs, including request/response formats, error handling, and implementation examples.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [OTP Verification System](#otp-verification-system)
4. [Reporting & Analytics System](#reporting--analytics-system)
5. [Error Handling](#error-handling)
6. [Code Examples](#code-examples)
7. [Best Practices](#best-practices)

---

## Getting Started

### Base URLs

```
Development: http://localhost:3000
Production: https://api.priorbd.com
```

### Common Headers

```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer YOUR_TOKEN_HERE' // For protected routes
}
```

### Date Format

All dates use **ISO 8601 format**: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss.sssZ`

Example: `2025-01-31` or `2025-01-31T12:30:00.000Z`

---

## Authentication

### Admin Routes

Reports and certain OTP statistics require admin authentication. Include the admin token in headers:

```javascript
headers: {
  'Authorization': `Bearer ${adminToken}`
}
```

---

# OTP Verification System

Complete email-based OTP verification for user registration, login, password reset, and email verification.

## OTP Endpoints Overview

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/api/v1/otp/send` | POST | No | Send OTP to email |
| `/api/v1/otp/verify` | POST | No | Verify OTP code |
| `/api/v1/otp/resend` | POST | No | Resend new OTP |
| `/api/v1/otp/status/:email` | GET | No | Check OTP status |
| `/api/v1/otp/stats/:email` | GET | Admin | Get OTP statistics |
| `/api/v1/otp/cleanup` | DELETE | Admin | Cleanup old OTPs |

---

## 1. Send OTP

**Purpose:** Generate and send a 6-digit OTP to user's email

**Endpoint:** `POST /api/v1/otp/send`

**Request Body:**
```json
{
  "email": "user@example.com",
  "purpose": "email_verification"
}
```

**Field Details:**

| Field | Type | Required | Valid Values | Default |
|-------|------|----------|--------------|---------|
| email | string | ✅ Yes | Valid email address | - |
| purpose | string | ❌ No | `registration`, `login`, `password_reset`, `email_verification`, `account_verification` | `email_verification` |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent successfully to u***r@example.com. Please check your email.",
  "data": {
    "email": "u***r@example.com",
    "purpose": "email_verification",
    "expiresIn": 600,
    "attemptsRemaining": 2
  }
}
```

**Error Responses:**

**400 - Invalid Email:**
```json
{
  "success": false,
  "error": "Invalid email format"
}
```

**429 - Rate Limited:**
```json
{
  "success": false,
  "error": "Too many OTP requests",
  "message": "Too many requests. Please try again in 3m 45s.",
  "retryAfter": 225
}
```

**500 - Email Send Failed:**
```json
{
  "success": false,
  "error": "Failed to send OTP email",
  "message": "Unable to send verification email. Please try again."
}
```

**Frontend Implementation:**

```javascript
async function sendOTP(email, purpose = 'email_verification') {
  try {
    const response = await fetch('/api/v1/otp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, purpose })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }

    return data;
  } catch (error) {
    console.error('Send OTP Error:', error);
    throw error;
  }
}

// Usage
sendOTP('user@example.com', 'registration')
  .then(result => {
    console.log(result.message); // "OTP sent successfully..."
    // Show success message to user
    // Display OTP input form
  })
  .catch(error => {
    // Show error message to user
    console.error(error.message);
  });
```

---

## 2. Verify OTP

**Purpose:** Verify the 6-digit OTP code sent to user's email

**Endpoint:** `POST /api/v1/otp/verify`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "purpose": "email_verification"
}
```

**Field Details:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | ✅ Yes | Email that received the OTP |
| otp | string | ✅ Yes | 6-digit OTP code |
| purpose | string | ❌ No | Must match the purpose from send OTP |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP verified successfully!",
  "data": {
    "email": "user@example.com",
    "purpose": "email_verification",
    "verifiedAt": "2025-01-31T12:30:00.000Z"
  }
}
```

**Error Responses:**

**400 - Invalid OTP:**
```json
{
  "success": false,
  "error": "Invalid OTP",
  "message": "Invalid OTP. Please check and try again.",
  "attemptsRemaining": 3
}
```

**400 - OTP Expired:**
```json
{
  "success": false,
  "error": "OTP expired",
  "message": "OTP has expired. Please request a new one."
}
```

**400 - Max Attempts Exceeded:**
```json
{
  "success": false,
  "error": "Maximum attempts exceeded",
  "message": "Maximum verification attempts exceeded. Please request a new OTP."
}
```

**404 - OTP Not Found:**
```json
{
  "success": false,
  "error": "OTP not found",
  "message": "No OTP found for this email. Please request a new one."
}
```

**Frontend Implementation:**

```javascript
async function verifyOTP(email, otp, purpose = 'email_verification') {
  try {
    const response = await fetch('/api/v1/otp/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp, purpose })
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message,
        attemptsRemaining: data.attemptsRemaining
      };
    }

    return data;
  } catch (error) {
    console.error('Verify OTP Error:', error);
    throw error;
  }
}

// Usage
verifyOTP('user@example.com', '123456', 'registration')
  .then(result => {
    console.log('Email verified!');
    // Proceed to next step (e.g., complete registration)
  })
  .catch(error => {
    console.error(error.message);
    if (error.attemptsRemaining !== undefined) {
      console.log(`Attempts remaining: ${error.attemptsRemaining}`);
      // Show attempts remaining to user
    }
  });
```

---

## 3. Resend OTP

**Purpose:** Request a new OTP code (invalidates previous OTP)

**Endpoint:** `POST /api/v1/otp/resend`

**Request Body:**
```json
{
  "email": "user@example.com",
  "purpose": "email_verification"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP resent successfully to u***r@example.com",
  "data": {
    "email": "u***r@example.com",
    "purpose": "email_verification",
    "expiresIn": 600,
    "attemptsRemaining": 1
  }
}
```

**Error Responses:**

**429 - Too Soon to Resend:**
```json
{
  "success": false,
  "error": "Please wait before requesting another OTP",
  "message": "You can request a new OTP in 45 seconds.",
  "retryAfter": 45
}
```

**429 - Rate Limited:**
```json
{
  "success": false,
  "error": "Too many resend requests",
  "message": "Please wait before requesting another OTP. Try again in 4 minute(s).",
  "retryAfter": 240
}
```

**Frontend Implementation:**

```javascript
async function resendOTP(email, purpose = 'email_verification') {
  try {
    const response = await fetch('/api/v1/otp/resend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, purpose })
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message,
        retryAfter: data.retryAfter
      };
    }

    return data;
  } catch (error) {
    console.error('Resend OTP Error:', error);
    throw error;
  }
}

// Usage with countdown timer
async function handleResend(email) {
  try {
    await resendOTP(email, 'registration');
    alert('OTP resent! Check your email.');

    // Reset verification attempts counter
    setAttemptsRemaining(5);
  } catch (error) {
    if (error.retryAfter) {
      // Show countdown timer
      startCountdown(error.retryAfter);
    }
    console.error(error.message);
  }
}
```

---

## 4. Get OTP Status

**Purpose:** Check current OTP status (useful for debugging or showing user feedback)

**Endpoint:** `GET /api/v1/otp/status/:email`

**Query Parameters:**

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| purpose | string | No | `email_verification` |

**Example Request:**
```
GET /api/v1/otp/status/user@example.com?purpose=email_verification
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "email": "u***r@example.com",
    "purpose": "email_verification",
    "verified": false,
    "expired": false,
    "attemptsUsed": 2,
    "attemptsRemaining": 3,
    "expiresIn": 456,
    "createdAt": "2025-01-31T12:25:00.000Z"
  }
}
```

**404 - No Active OTP:**
```json
{
  "success": false,
  "message": "No active OTP found for this email"
}
```

**Frontend Implementation:**

```javascript
async function getOTPStatus(email, purpose = 'email_verification') {
  try {
    const response = await fetch(
      `/api/v1/otp/status/${encodeURIComponent(email)}?purpose=${purpose}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return data.data;
  } catch (error) {
    console.error('Get OTP Status Error:', error);
    return null;
  }
}

// Usage - Display countdown timer
async function displayOTPCountdown(email) {
  const status = await getOTPStatus(email);

  if (status && !status.expired) {
    console.log(`OTP expires in ${status.expiresIn} seconds`);
    console.log(`Attempts remaining: ${status.attemptsRemaining}`);

    // Start countdown timer
    startCountdownTimer(status.expiresIn);
  }
}
```

---

# Reporting & Analytics System

Comprehensive reporting APIs for admin dashboard with sales, customer, product, and order analytics.

## Report Endpoints Overview

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/api/v1/report/sales-overview` | GET | Admin | Sales summary & metrics |
| `/api/v1/report/sales-trend` | GET | Admin | Time-series sales data |
| `/api/v1/report/customer-insights` | GET | Admin | Customer analytics |
| `/api/v1/report/product-performance` | GET | Admin | Product sales analytics |
| `/api/v1/report/order-fulfillment` | GET | Admin | Order status & stuck orders |
| `/api/v1/report/payment-methods` | GET | Admin | Payment method breakdown |
| `/api/v1/report/export` | GET | Admin | Export orders (CSV/JSON/PDF) |

### Common Query Parameters for All Reports

| Parameter | Type | Required | Format | Default |
|-----------|------|----------|--------|---------|
| startDate | string | No | ISO 8601 (YYYY-MM-DD) | 30 days ago |
| endDate | string | No | ISO 8601 (YYYY-MM-DD) | Today |

**Example:**
```
GET /api/v1/report/sales-overview?startDate=2025-01-01&endDate=2025-01-31
```

---

## 1. Sales Overview

**Purpose:** Get comprehensive sales metrics and status breakdown

**Endpoint:** `GET /api/v1/report/sales-overview`

**Query Parameters:**
```
?startDate=2025-01-01&endDate=2025-01-31
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-31"
    },
    "summary": {
      "totalOrders": 450,
      "totalRevenue": 1250000.00,
      "totalPaid": 980000.00,
      "totalRemaining": 270000.00,
      "totalDeliveryCharges": 45000.00,
      "totalDiscounts": 75000.00,
      "averageOrderValue": 2777.78
    },
    "statusBreakdown": [
      {
        "status": "completed",
        "count": 280,
        "revenue": 780000.00
      },
      {
        "status": "processing",
        "count": 120,
        "revenue": 335000.00
      },
      {
        "status": "shipped",
        "count": 35,
        "revenue": 97500.00
      },
      {
        "status": "cancelled",
        "count": 15,
        "revenue": 37500.00
      }
    ]
  }
}
```

**Frontend Implementation:**

```javascript
async function getSalesOverview(startDate, endDate, adminToken) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(
      `/api/v1/report/sales-overview?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch sales overview');
    }

    return data.data;
  } catch (error) {
    console.error('Sales Overview Error:', error);
    throw error;
  }
}

// Usage - Display on dashboard
getSalesOverview('2025-01-01', '2025-01-31', adminToken)
  .then(report => {
    // Update dashboard cards
    updateDashboardCard('total-orders', report.summary.totalOrders);
    updateDashboardCard('total-revenue', `৳${report.summary.totalRevenue}`);
    updateDashboardCard('average-order', `৳${report.summary.averageOrderValue}`);

    // Render status breakdown chart
    renderStatusPieChart(report.statusBreakdown);
  });
```

---

## 2. Sales Trend

**Purpose:** Get time-series sales data for charts (daily/weekly/monthly)

**Endpoint:** `GET /api/v1/report/sales-trend`

**Query Parameters:**

| Parameter | Type | Required | Valid Values | Default |
|-----------|------|----------|--------------|---------|
| startDate | string | No | ISO 8601 date | 30 days ago |
| endDate | string | No | ISO 8601 date | Today |
| interval | string | No | `day`, `week`, `month` | `day` |

**Example Request:**
```
GET /api/v1/report/sales-trend?startDate=2025-01-01&endDate=2025-01-31&interval=day
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-31"
    },
    "interval": "day",
    "trend": [
      {
        "period": "2025-01-01",
        "orderCount": 15,
        "revenue": 42500.00,
        "paid": 38000.00,
        "remaining": 4500.00,
        "averageOrderValue": 2833.33
      },
      {
        "period": "2025-01-02",
        "orderCount": 18,
        "revenue": 51200.00,
        "paid": 47800.00,
        "remaining": 3400.00,
        "averageOrderValue": 2844.44
      },
      {
        "period": "2025-01-03",
        "orderCount": 12,
        "revenue": 35600.00,
        "paid": 33200.00,
        "remaining": 2400.00,
        "averageOrderValue": 2966.67
      }
    ]
  }
}
```

**Frontend Implementation:**

```javascript
async function getSalesTrend(startDate, endDate, interval = 'day', adminToken) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('interval', interval);

    const response = await fetch(
      `/api/v1/report/sales-trend?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch sales trend');
    }

    return data.data;
  } catch (error) {
    console.error('Sales Trend Error:', error);
    throw error;
  }
}

// Usage - Render line chart
getSalesTrend('2025-01-01', '2025-01-31', 'day', adminToken)
  .then(report => {
    const labels = report.trend.map(item => item.period);
    const revenueData = report.trend.map(item => item.revenue);
    const orderData = report.trend.map(item => item.orderCount);

    // Render using Chart.js or similar
    renderLineChart({
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: revenueData,
          borderColor: 'rgb(75, 192, 192)'
        },
        {
          label: 'Orders',
          data: orderData,
          borderColor: 'rgb(255, 99, 132)'
        }
      ]
    });
  });
```

---

## 3. Customer Insights

**Purpose:** Get customer analytics including new vs returning, top customers, and geographic distribution

**Endpoint:** `GET /api/v1/report/customer-insights`

**Query Parameters:**
```
?startDate=2025-01-01&endDate=2025-01-31
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-31"
    },
    "summary": {
      "totalUniqueCustomers": 320,
      "newCustomers": 180,
      "returningCustomers": 140
    },
    "topCustomers": [
      {
        "phoneNumber": "01712345678",
        "customerName": "Ahmed Hassan",
        "email": "ahmed@example.com",
        "orderCount": 8,
        "totalSpent": 45000.00,
        "firstOrderDate": "2024-12-15",
        "lastOrderDate": "2025-01-28"
      },
      {
        "phoneNumber": "01898765432",
        "customerName": "Fatima Rahman",
        "email": "fatima@example.com",
        "orderCount": 6,
        "totalSpent": 38500.00,
        "firstOrderDate": "2025-01-05",
        "lastOrderDate": "2025-01-30"
      }
    ],
    "geographicDistribution": [
      {
        "division": "Dhaka",
        "orderCount": 245,
        "revenue": 685000.00
      },
      {
        "division": "Chittagong",
        "orderCount": 108,
        "revenue": 302000.00
      },
      {
        "division": "Sylhet",
        "orderCount": 52,
        "revenue": 145000.00
      }
    ]
  }
}
```

**Frontend Implementation:**

```javascript
async function getCustomerInsights(startDate, endDate, adminToken) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(
      `/api/v1/report/customer-insights?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    return data.data;
  } catch (error) {
    console.error('Customer Insights Error:', error);
    throw error;
  }
}

// Usage - Display customer analytics
getCustomerInsights('2025-01-01', '2025-01-31', adminToken)
  .then(report => {
    // Update customer summary cards
    displayMetric('total-customers', report.summary.totalUniqueCustomers);
    displayMetric('new-customers', report.summary.newCustomers);
    displayMetric('returning-customers', report.summary.returningCustomers);

    // Render top customers table
    renderTopCustomersTable(report.topCustomers);

    // Render geographic distribution map/chart
    renderGeographicChart(report.geographicDistribution);
  });
```

---

## 4. Product Performance

**Purpose:** Get product sales analytics with pagination

**Endpoint:** `GET /api/v1/report/product-performance`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| startDate | string | No | 30 days ago | Start date |
| endDate | string | No | Today | End date |
| page | number | No | 1 | Page number |
| limit | number | No | 50 | Items per page (max: 1000) |

**Example Request:**
```
GET /api/v1/report/product-performance?startDate=2025-01-01&endDate=2025-01-31&page=1&limit=20
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-31"
    },
    "products": [
      {
        "productId": "prod_12345",
        "productName": "Premium Cotton T-Shirt",
        "thumbnail": "https://example.com/images/tshirt.jpg",
        "totalUnitsSold": 245,
        "totalRevenue": 122500.00,
        "averageUnitPrice": 500.00,
        "orderCount": 180
      },
      {
        "productId": "prod_12346",
        "productName": "Denim Jeans",
        "thumbnail": "https://example.com/images/jeans.jpg",
        "totalUnitsSold": 156,
        "totalRevenue": 187200.00,
        "averageUnitPrice": 1200.00,
        "orderCount": 142
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 320,
      "totalPages": 16
    }
  }
}
```

**Frontend Implementation:**

```javascript
async function getProductPerformance(startDate, endDate, page = 1, limit = 20, adminToken) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('page', page);
    params.append('limit', limit);

    const response = await fetch(
      `/api/v1/report/product-performance?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    return data.data;
  } catch (error) {
    console.error('Product Performance Error:', error);
    throw error;
  }
}

// Usage - Display paginated product list
async function displayProductPerformance(page = 1) {
  const report = await getProductPerformance(
    '2025-01-01',
    '2025-01-31',
    page,
    20,
    adminToken
  );

  // Render products table
  renderProductsTable(report.products);

  // Render pagination
  renderPagination({
    currentPage: report.pagination.page,
    totalPages: report.pagination.totalPages,
    onPageChange: (newPage) => displayProductPerformance(newPage)
  });
}
```

---

## 5. Order Fulfillment

**Purpose:** Get order status distribution and identify stuck orders

**Endpoint:** `GET /api/v1/report/order-fulfillment`

**Query Parameters:**
```
?startDate=2025-01-01&endDate=2025-01-31
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-31"
    },
    "statusDistribution": [
      {
        "status": "completed",
        "count": 280,
        "totalValue": 780000.00,
        "averageValue": 2785.71
      },
      {
        "status": "processing",
        "count": 120,
        "totalValue": 335000.00,
        "averageValue": 2791.67
      },
      {
        "status": "shipped",
        "count": 35,
        "totalValue": 97500.00,
        "averageValue": 2785.71
      },
      {
        "status": "cancelled",
        "count": 15,
        "totalValue": 37500.00,
        "averageValue": 2500.00
      }
    ],
    "stuckOrders": {
      "count": 12,
      "orders": [
        {
          "orderNumber": 10245,
          "customerName": "Fatima Rahman",
          "customerPhone": "01898765432",
          "totalPrice": 3500.00,
          "createdAt": "2024-12-28",
          "ageInDays": 34
        },
        {
          "orderNumber": 10198,
          "customerName": "Karim Ahmed",
          "customerPhone": "01755443322",
          "totalPrice": 4200.00,
          "createdAt": "2024-12-30",
          "ageInDays": 32
        }
      ]
    },
    "averageAgeByStatus": [
      {
        "status": "processing",
        "averageAgeInDays": 4.5
      },
      {
        "status": "shipped",
        "averageAgeInDays": 2.1
      },
      {
        "status": "completed",
        "averageAgeInDays": 6.8
      }
    ]
  }
}
```

**Frontend Implementation:**

```javascript
async function getOrderFulfillment(startDate, endDate, adminToken) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(
      `/api/v1/report/order-fulfillment?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    return data.data;
  } catch (error) {
    console.error('Order Fulfillment Error:', error);
    throw error;
  }
}

// Usage - Operations dashboard
getOrderFulfillment('2025-01-01', '2025-01-31', adminToken)
  .then(report => {
    // Render status distribution chart
    renderStatusChart(report.statusDistribution);

    // Show stuck orders alert
    if (report.stuckOrders.count > 0) {
      showAlert(`${report.stuckOrders.count} orders need attention!`);
      renderStuckOrdersTable(report.stuckOrders.orders);
    }

    // Display average processing time
    renderAverageAgeChart(report.averageAgeByStatus);
  });
```

---

## 6. Payment Method Breakdown

**Purpose:** Get payment method analytics

**Endpoint:** `GET /api/v1/report/payment-methods`

**Query Parameters:**
```
?startDate=2025-01-01&endDate=2025-01-31
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-31"
    },
    "summary": {
      "totalTransactions": 520,
      "totalAmount": 980000.00
    },
    "breakdown": [
      {
        "paymentType": "bkash",
        "transactionCount": 285,
        "totalAmount": 520000.00,
        "averageAmount": 1824.56
      },
      {
        "paymentType": "cash",
        "transactionCount": 180,
        "totalAmount": 320000.00,
        "averageAmount": 1777.78
      },
      {
        "paymentType": "nagad",
        "transactionCount": 55,
        "totalAmount": 140000.00,
        "averageAmount": 2545.45
      }
    ]
  }
}
```

**Frontend Implementation:**

```javascript
async function getPaymentMethodBreakdown(startDate, endDate, adminToken) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(
      `/api/v1/report/payment-methods?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    return data.data;
  } catch (error) {
    console.error('Payment Breakdown Error:', error);
    throw error;
  }
}

// Usage - Payment analytics
getPaymentMethodBreakdown('2025-01-01', '2025-01-31', adminToken)
  .then(report => {
    // Display total summary
    displayMetric('total-transactions', report.summary.totalTransactions);
    displayMetric('total-amount', `৳${report.summary.totalAmount}`);

    // Render payment breakdown pie chart
    renderPaymentPieChart(report.breakdown);
  });
```

---

## 7. Export Orders

**Purpose:** Export order data in CSV, JSON, or PDF-ready format

**Endpoint:** `GET /api/v1/report/export`

**Query Parameters:**

| Parameter | Type | Required | Valid Values | Default |
|-----------|------|----------|--------------|---------|
| startDate | string | No | ISO 8601 date | 30 days ago |
| endDate | string | No | ISO 8601 date | Today |
| format | string | No | `csv`, `json`, `pdf` | `csv` |

**Example Requests:**
```
GET /api/v1/report/export?format=csv&startDate=2025-01-01&endDate=2025-01-31
GET /api/v1/report/export?format=json&startDate=2025-01-01
```

### CSV Export

**Success Response:**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="orders_export_2025-01-01_to_2025-01-31.csv"`

**CSV Content:**
```csv
Order Number,Order Date,Customer Name,Customer Phone,Customer Email,Division,District,Address,Status,Total Price,Paid,Remaining,Delivery Charge,Discount,Payment Methods,Products
10245,2025-01-15,Ahmed Hassan,01712345678,ahmed@example.com,Dhaka,Mirpur,House 12 Road 5,completed,3500.00,3500.00,0.00,100.00,200.00,bkash; cash,Premium Cotton T-Shirt (2); Denim Jeans (1)
10246,2025-01-16,Fatima Rahman,01898765432,fatima@example.com,Chittagong,GEC,Flat 3A,processing,4200.00,2000.00,2200.00,120.00,150.00,bkash,Cotton Shirt (3)
```

### JSON Export

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-31"
    },
    "totalOrders": 450,
    "orders": [
      {
        "orderNumber": 10245,
        "orderDate": "2025-01-15",
        "customerName": "Ahmed Hassan",
        "customerPhone": "01712345678",
        "customerEmail": "ahmed@example.com",
        "division": "Dhaka",
        "district": "Mirpur",
        "address": "House 12, Road 5",
        "status": "completed",
        "totalPrice": 3500.00,
        "paid": 3500.00,
        "remaining": 0.00,
        "deliveryCharge": 100.00,
        "discount": 200.00,
        "paymentMethods": "bkash, cash",
        "products": "Premium Cotton T-Shirt (2); Denim Jeans (1)"
      }
    ]
  }
}
```

### PDF-Ready Export

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "meta": {
      "title": "Orders Export Report",
      "generatedAt": "2025-01-31T12:30:00.000Z",
      "period": {
        "start": "2025-01-01",
        "end": "2025-01-31"
      }
    },
    "data": [
      {
        "orderNumber": 10245,
        "orderDate": "2025-01-15",
        "customerName": "Ahmed Hassan",
        "totalPrice": 3500.00,
        "status": "completed"
      }
    ],
    "formatting": {
      "currency": "BDT",
      "locale": "en-BD"
    }
  }
}
```

**Frontend Implementation:**

```javascript
// CSV Download
async function downloadOrdersCSV(startDate, endDate, adminToken) {
  try {
    const params = new URLSearchParams();
    params.append('format', 'csv');
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(
      `/api/v1/report/export?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    // Download CSV file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders_${startDate}_to_${endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download CSV Error:', error);
    throw error;
  }
}

// JSON Export
async function exportOrdersJSON(startDate, endDate, adminToken) {
  try {
    const params = new URLSearchParams();
    params.append('format', 'json');
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(
      `/api/v1/report/export?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    return data.data;
  } catch (error) {
    console.error('Export JSON Error:', error);
    throw error;
  }
}

// Usage
document.getElementById('export-csv-btn').addEventListener('click', () => {
  downloadOrdersCSV('2025-01-01', '2025-01-31', adminToken);
});
```

---

# Error Handling

## Common Error Response Format

All APIs return errors in this format:

```json
{
  "success": false,
  "error": "Error type/code",
  "message": "User-friendly error message"
}
```

## HTTP Status Codes

| Status Code | Meaning | Common Causes |
|-------------|---------|---------------|
| 400 | Bad Request | Invalid parameters, validation errors |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

## Handling Errors in Frontend

```javascript
async function makeAPICall(url, options) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      // Handle specific error codes
      switch (response.status) {
        case 400:
          throw new Error(data.message || 'Invalid request');
        case 401:
          // Redirect to login
          window.location.href = '/login';
          break;
        case 403:
          throw new Error('You do not have permission to access this resource');
        case 429:
          throw new Error(data.message || 'Too many requests. Please try again later.');
        case 500:
          throw new Error('Server error. Please try again later.');
        default:
          throw new Error(data.message || 'An error occurred');
      }
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    // Show error to user
    showErrorNotification(error.message);
    throw error;
  }
}
```

---

# Code Examples

## Complete Registration Flow with OTP

```javascript
class RegistrationFlow {
  constructor() {
    this.email = '';
    this.purpose = 'registration';
  }

  // Step 1: Send OTP
  async sendOTP(email) {
    try {
      this.email = email;

      const response = await fetch('/api/v1/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.email,
          purpose: this.purpose
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      // Show OTP input form
      this.showOTPInput();

      // Start countdown timer
      this.startCountdown(600); // 10 minutes

      return data;
    } catch (error) {
      this.showError(error.message);
      throw error;
    }
  }

  // Step 2: Verify OTP
  async verifyOTP(otp) {
    try {
      const response = await fetch('/api/v1/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.email,
          otp: otp,
          purpose: this.purpose
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.attemptsRemaining !== undefined) {
          this.showAttemptsRemaining(data.attemptsRemaining);
        }
        throw new Error(data.message);
      }

      // OTP verified successfully
      this.showSuccess('Email verified!');

      // Enable registration form
      this.enableRegistrationForm();

      return data;
    } catch (error) {
      this.showError(error.message);
      throw error;
    }
  }

  // Step 3: Complete Registration
  async register(userData) {
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.email,
          ...userData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresVerification) {
          this.showError('Please verify your email first');
          this.showOTPInput();
          return;
        }
        throw new Error(data.message);
      }

      // Registration successful
      this.showSuccess('Registration successful!');
      window.location.href = '/dashboard';

      return data;
    } catch (error) {
      this.showError(error.message);
      throw error;
    }
  }

  // Resend OTP
  async resendOTP() {
    try {
      const response = await fetch('/api/v1/otp/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.email,
          purpose: this.purpose
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.retryAfter) {
          this.showError(`Please wait ${data.retryAfter} seconds`);
          this.disableResendButton(data.retryAfter);
        }
        throw new Error(data.message);
      }

      this.showSuccess('OTP resent!');
      this.startCountdown(600);

      return data;
    } catch (error) {
      this.showError(error.message);
      throw error;
    }
  }

  // Helper methods
  showOTPInput() {
    document.getElementById('otp-section').style.display = 'block';
  }

  startCountdown(seconds) {
    let remaining = seconds;
    const interval = setInterval(() => {
      remaining--;
      const minutes = Math.floor(remaining / 60);
      const secs = remaining % 60;
      document.getElementById('countdown').textContent =
        `${minutes}:${secs.toString().padStart(2, '0')}`;

      if (remaining <= 0) {
        clearInterval(interval);
        this.showError('OTP expired. Please request a new one.');
      }
    }, 1000);
  }

  showAttemptsRemaining(attempts) {
    document.getElementById('attempts').textContent =
      `Attempts remaining: ${attempts}`;
  }

  showError(message) {
    // Display error notification
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }

  showSuccess(message) {
    // Display success notification
    const successDiv = document.getElementById('success-message');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
  }

  enableRegistrationForm() {
    document.getElementById('registration-form').style.display = 'block';
  }

  disableResendButton(seconds) {
    const btn = document.getElementById('resend-btn');
    btn.disabled = true;

    let remaining = seconds;
    const interval = setInterval(() => {
      remaining--;
      btn.textContent = `Resend (${remaining}s)`;

      if (remaining <= 0) {
        clearInterval(interval);
        btn.disabled = false;
        btn.textContent = 'Resend OTP';
      }
    }, 1000);
  }
}

// Usage
const registration = new RegistrationFlow();

document.getElementById('send-otp-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  await registration.sendOTP(email);
});

document.getElementById('verify-otp-btn').addEventListener('click', async () => {
  const otp = document.getElementById('otp-input').value;
  await registration.verifyOTP(otp);
});

document.getElementById('register-btn').addEventListener('click', async () => {
  const userData = {
    name: document.getElementById('name').value,
    password: document.getElementById('password').value
  };
  await registration.register(userData);
});

document.getElementById('resend-btn').addEventListener('click', async () => {
  await registration.resendOTP();
});
```

## Dashboard with Reports (React Example)

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [salesOverview, setSalesOverview] = useState(null);
  const [salesTrend, setSalesTrend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '2025-01-01',
    endDate: '2025-01-31'
  });

  const adminToken = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  async function fetchDashboardData() {
    setLoading(true);

    try {
      const [overviewRes, trendRes] = await Promise.all([
        axios.get('/api/v1/report/sales-overview', {
          params: dateRange,
          headers: { 'Authorization': `Bearer ${adminToken}` }
        }),
        axios.get('/api/v1/report/sales-trend', {
          params: { ...dateRange, interval: 'day' },
          headers: { 'Authorization': `Bearer ${adminToken}` }
        })
      ]);

      setSalesOverview(overviewRes.data.data);
      setSalesTrend(trendRes.data.data);
    } catch (error) {
      console.error('Dashboard Error:', error);
      alert(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function handleExportCSV() {
    try {
      const response = await axios.get('/api/v1/report/export', {
        params: { ...dateRange, format: 'csv' },
        headers: { 'Authorization': `Bearer ${adminToken}` },
        responseType: 'blob'
      });

      // Download file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download',
        `orders_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export Error:', error);
      alert('Failed to export data');
    }
  }

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Sales Dashboard</h1>

      {/* Date Range Selector */}
      <div className="date-range">
        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) => setDateRange({
            ...dateRange,
            startDate: e.target.value
          })}
        />
        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange({
            ...dateRange,
            endDate: e.target.value
          })}
        />
        <button onClick={fetchDashboardData}>Refresh</button>
        <button onClick={handleExportCSV}>Export CSV</button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <h3>Total Orders</h3>
          <p className="metric">{salesOverview?.summary.totalOrders}</p>
        </div>
        <div className="card">
          <h3>Total Revenue</h3>
          <p className="metric">
            ৳{salesOverview?.summary.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="card">
          <h3>Average Order Value</h3>
          <p className="metric">
            ৳{salesOverview?.summary.averageOrderValue.toFixed(2)}
          </p>
        </div>
        <div className="card">
          <h3>Total Remaining</h3>
          <p className="metric">
            ৳{salesOverview?.summary.totalRemaining.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="status-breakdown">
        <h2>Order Status Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Count</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {salesOverview?.statusBreakdown.map(status => (
              <tr key={status.status}>
                <td>{status.status}</td>
                <td>{status.count}</td>
                <td>৳{status.revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sales Trend Chart */}
      <div className="sales-trend">
        <h2>Sales Trend</h2>
        {/* Integrate with Chart.js or Recharts */}
        <pre>{JSON.stringify(salesTrend?.trend, null, 2)}</pre>
      </div>
    </div>
  );
}

export default AdminDashboard;
```

---

# Best Practices

## For OTP System

### Frontend Best Practices

1. **Input Validation**
   ```javascript
   function validateOTPInput(value) {
     // Only allow 6 digits
     return /^\d{0,6}$/.test(value);
   }

   otpInput.addEventListener('input', (e) => {
     if (!validateOTPInput(e.target.value)) {
       e.target.value = e.target.value.slice(0, -1);
     }

     // Auto-submit when 6 digits entered
     if (e.target.value.length === 6) {
       submitOTP(e.target.value);
     }
   });
   ```

2. **Countdown Timer**
   ```javascript
   function startOTPCountdown(seconds) {
     const display = document.getElementById('countdown');
     let remaining = seconds;

     const timer = setInterval(() => {
       remaining--;
       const mins = Math.floor(remaining / 60);
       const secs = remaining % 60;
       display.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

       if (remaining <= 0) {
         clearInterval(timer);
         showExpiredMessage();
       }
     }, 1000);
   }
   ```

3. **Show Remaining Attempts**
   ```javascript
   function updateAttemptsDisplay(remaining) {
     const display = document.getElementById('attempts');
     display.textContent = `${remaining} attempts remaining`;

     if (remaining <= 2) {
       display.classList.add('warning');
     }
   }
   ```

## For Reports System

### Frontend Best Practices

1. **Date Range Validation**
   ```javascript
   function validateDateRange(startDate, endDate) {
     const start = new Date(startDate);
     const end = new Date(endDate);

     if (start > end) {
       throw new Error('Start date cannot be after end date');
     }

     const diffDays = (end - start) / (1000 * 60 * 60 * 24);
     if (diffDays > 730) {
       throw new Error('Date range cannot exceed 2 years');
     }

     return true;
   }
   ```

2. **Caching Reports**
   ```javascript
   class ReportCache {
     constructor(ttlMinutes = 5) {
       this.cache = new Map();
       this.ttl = ttlMinutes * 60 * 1000;
     }

     get(key) {
       const cached = this.cache.get(key);
       if (!cached) return null;

       if (Date.now() > cached.expiry) {
         this.cache.delete(key);
         return null;
       }

       return cached.data;
     }

     set(key, data) {
       this.cache.set(key, {
         data,
         expiry: Date.now() + this.ttl
       });
     }
   }

   const reportCache = new ReportCache(5); // 5 minutes TTL

   async function getSalesOverview(startDate, endDate) {
     const cacheKey = `sales-overview-${startDate}-${endDate}`;
     const cached = reportCache.get(cacheKey);

     if (cached) {
       return cached;
     }

     const data = await fetchSalesOverview(startDate, endDate);
     reportCache.set(cacheKey, data);
     return data;
   }
   ```

3. **Loading States**
   ```javascript
   function showLoading(elementId) {
     const el = document.getElementById(elementId);
     el.innerHTML = '<div class="spinner">Loading...</div>';
   }

   function hideLoading(elementId, content) {
     const el = document.getElementById(elementId);
     el.innerHTML = content;
   }

   async function loadReport() {
     showLoading('report-container');

     try {
       const data = await getSalesOverview('2025-01-01', '2025-01-31');
       hideLoading('report-container', renderReport(data));
     } catch (error) {
       hideLoading('report-container', renderError(error.message));
     }
   }
   ```

## General API Best Practices

1. **Always handle errors gracefully**
2. **Show loading states during API calls**
3. **Validate input before sending requests**
4. **Cache expensive reports when possible**
5. **Use environment variables for API base URLs**
6. **Implement retry logic for failed requests**
7. **Log errors for debugging**
8. **Show user-friendly error messages**
9. **Implement request timeouts**
10. **Use HTTPS in production**

---

## Quick Reference

### OTP Endpoints
```
POST   /api/v1/otp/send          - Send OTP
POST   /api/v1/otp/verify        - Verify OTP
POST   /api/v1/otp/resend        - Resend OTP
GET    /api/v1/otp/status/:email - Get status
GET    /api/v1/otp/stats/:email  - Get stats (Admin)
DELETE /api/v1/otp/cleanup       - Cleanup (Admin)
```

### Report Endpoints
```
GET /api/v1/report/sales-overview      - Sales summary
GET /api/v1/report/sales-trend         - Sales time-series
GET /api/v1/report/customer-insights   - Customer analytics
GET /api/v1/report/product-performance - Product analytics
GET /api/v1/report/order-fulfillment   - Order status
GET /api/v1/report/payment-methods     - Payment breakdown
GET /api/v1/report/export              - Export data
```

### Common Query Parameters
```
startDate  - ISO 8601 date (YYYY-MM-DD)
endDate    - ISO 8601 date (YYYY-MM-DD)
page       - Page number (for pagination)
limit      - Items per page
interval   - day|week|month (for trends)
format     - csv|json|pdf (for export)
purpose    - OTP purpose type
```

---

**Version:** 1.0.0
**Last Updated:** 2025-01-31
**Support:** For questions or issues, contact the backend team or refer to individual API README files.
