# API Quick Reference Guide
## Prior eCommerce Platform - Frontend Integration Cheat Sheet

---

## 🔐 OTP Verification API

### Send OTP
```javascript
POST /api/v1/otp/send
{
  "email": "user@example.com",
  "purpose": "registration" // or login, password_reset, email_verification
}

// Response
{
  "success": true,
  "message": "OTP sent successfully to u***r@example.com...",
  "data": {
    "email": "u***r@example.com",
    "expiresIn": 600 // 10 minutes
  }
}
```

### Verify OTP
```javascript
POST /api/v1/otp/verify
{
  "email": "user@example.com",
  "otp": "123456",
  "purpose": "registration"
}

// Success
{
  "success": true,
  "message": "OTP verified successfully!",
  "data": { "email": "user@example.com", "verifiedAt": "..." }
}

// Error
{
  "success": false,
  "error": "Invalid OTP",
  "attemptsRemaining": 3
}
```

### Resend OTP
```javascript
POST /api/v1/otp/resend
{
  "email": "user@example.com",
  "purpose": "registration"
}

// Response
{
  "success": true,
  "message": "OTP resent successfully..."
}
```

---

## 📊 Reporting API (Admin Only)

### Sales Overview
```javascript
GET /api/v1/report/sales-overview?startDate=2025-01-01&endDate=2025-01-31
Headers: { Authorization: "Bearer ADMIN_TOKEN" }

// Response
{
  "success": true,
  "data": {
    "summary": {
      "totalOrders": 450,
      "totalRevenue": 1250000.00,
      "averageOrderValue": 2777.78
    },
    "statusBreakdown": [
      { "status": "completed", "count": 280, "revenue": 780000 }
    ]
  }
}
```

### Sales Trend
```javascript
GET /api/v1/report/sales-trend?startDate=2025-01-01&endDate=2025-01-31&interval=day
Headers: { Authorization: "Bearer ADMIN_TOKEN" }

// Response
{
  "success": true,
  "data": {
    "interval": "day",
    "trend": [
      {
        "period": "2025-01-01",
        "orderCount": 15,
        "revenue": 42500.00,
        "averageOrderValue": 2833.33
      }
    ]
  }
}
```

### Customer Insights
```javascript
GET /api/v1/report/customer-insights?startDate=2025-01-01&endDate=2025-01-31
Headers: { Authorization: "Bearer ADMIN_TOKEN" }

// Response
{
  "success": true,
  "data": {
    "summary": {
      "totalUniqueCustomers": 320,
      "newCustomers": 180,
      "returningCustomers": 140
    },
    "topCustomers": [...],
    "geographicDistribution": [...]
  }
}
```

### Product Performance
```javascript
GET /api/v1/report/product-performance?page=1&limit=20
Headers: { Authorization: "Bearer ADMIN_TOKEN" }

// Response
{
  "success": true,
  "data": {
    "products": [
      {
        "productId": "prod_123",
        "productName": "T-Shirt",
        "totalUnitsSold": 245,
        "totalRevenue": 122500.00
      }
    ],
    "pagination": {
      "page": 1,
      "totalPages": 16,
      "total": 320
    }
  }
}
```

### Export Orders
```javascript
// CSV Download
GET /api/v1/report/export?format=csv&startDate=2025-01-01&endDate=2025-01-31
Headers: { Authorization: "Bearer ADMIN_TOKEN" }
// Returns: CSV file download

// JSON Export
GET /api/v1/report/export?format=json&startDate=2025-01-01
Headers: { Authorization: "Bearer ADMIN_TOKEN" }
// Returns: JSON data
```

---

## 🎯 Complete Usage Examples

### Registration with OTP Flow
```javascript
// Step 1: Send OTP
const sendOTP = await fetch('/api/v1/otp/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    purpose: 'registration'
  })
});

// Step 2: User enters OTP from email
// Step 3: Verify OTP
const verifyOTP = await fetch('/api/v1/otp/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    otp: '123456',
    purpose: 'registration'
  })
});

// Step 4: Complete registration
const register = await fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePass123',
    name: 'John Doe'
  })
});
```

### Fetch Dashboard Reports
```javascript
async function loadDashboard() {
  const token = localStorage.getItem('adminToken');
  const startDate = '2025-01-01';
  const endDate = '2025-01-31';

  // Fetch multiple reports in parallel
  const [overview, trend, customers] = await Promise.all([
    fetch(`/api/v1/report/sales-overview?startDate=${startDate}&endDate=${endDate}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()),

    fetch(`/api/v1/report/sales-trend?startDate=${startDate}&endDate=${endDate}&interval=day`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()),

    fetch(`/api/v1/report/customer-insights?startDate=${startDate}&endDate=${endDate}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json())
  ]);

  return { overview: overview.data, trend: trend.data, customers: customers.data };
}
```

### Download CSV Export
```javascript
async function downloadCSV() {
  const token = localStorage.getItem('adminToken');

  const response = await fetch(
    '/api/v1/report/export?format=csv&startDate=2025-01-01&endDate=2025-01-31',
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'orders_export.csv';
  a.click();
}
```

---

## ⚠️ Error Handling

### Standard Error Response
```javascript
{
  "success": false,
  "error": "Error type",
  "message": "User-friendly message"
}
```

### Common Status Codes
- **400** - Bad Request (invalid parameters)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found (resource doesn't exist)
- **429** - Too Many Requests (rate limited)
- **500** - Internal Server Error

### Error Handling Example
```javascript
try {
  const response = await fetch('/api/v1/otp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@example.com' })
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle specific errors
    if (response.status === 429) {
      alert(`Rate limited. Retry after ${data.retryAfter} seconds`);
    } else if (response.status === 400) {
      alert(data.message); // Show validation error
    } else {
      alert('An error occurred. Please try again.');
    }
    return;
  }

  // Success
  console.log(data);
} catch (error) {
  console.error('Network error:', error);
  alert('Network error. Please check your connection.');
}
```

---

## 🔑 Key Parameters Reference

### OTP Parameters
| Parameter | Type | Required | Values |
|-----------|------|----------|--------|
| email | string | ✅ | Valid email |
| otp | string | ✅ (verify) | 6 digits |
| purpose | string | ❌ | `registration`, `login`, `password_reset`, `email_verification`, `account_verification` |

### Report Parameters
| Parameter | Type | Required | Values |
|-----------|------|----------|--------|
| startDate | string | ❌ | ISO 8601 (YYYY-MM-DD) |
| endDate | string | ❌ | ISO 8601 (YYYY-MM-DD) |
| interval | string | ❌ | `day`, `week`, `month` |
| page | number | ❌ | Page number (default: 1) |
| limit | number | ❌ | Items per page (default: 50, max: 1000) |
| format | string | ❌ | `csv`, `json`, `pdf` |

---

## 📝 Rate Limits

### OTP Endpoints
- **Send OTP**: 3 requests per 5 minutes per email
- **Resend OTP**: 2 requests per 5 minutes per email
- **Verify OTP**: 5 attempts per OTP code
- **Minimum Resend Interval**: 1 minute

### Report Endpoints
- No strict rate limits
- Recommended: Cache reports for 5-10 minutes
- Large exports may take 1-2 seconds

---

## 🎨 Frontend Tips

### OTP Input Component
```javascript
// Auto-format OTP input
<input
  type="text"
  maxLength="6"
  value={otp}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    setOtp(value);
    if (value.length === 6) {
      verifyOTP(value); // Auto-submit
    }
  }}
  placeholder="Enter 6-digit OTP"
/>
```

### Countdown Timer
```javascript
function CountdownTimer({ seconds }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(r => r > 0 ? r - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return <span>{minutes}:{secs.toString().padStart(2, '0')}</span>;
}
```

### Date Range Picker
```javascript
<input
  type="date"
  value={startDate}
  onChange={(e) => setStartDate(e.target.value)}
  max={new Date().toISOString().split('T')[0]} // Can't select future
/>
<input
  type="date"
  value={endDate}
  onChange={(e) => setEndDate(e.target.value)}
  min={startDate} // Can't be before start date
  max={new Date().toISOString().split('T')[0]}
/>
```

---

## 📚 Additional Resources

- **Full Documentation**: `/FRONTEND_API_GUIDE.md`
- **OTP Details**: `/routes/v1/OTP/README.md`
- **Report Details**: `/routes/v1/Report/README.md`

---

## 🚀 Integration Checklist

### OTP System
- [ ] Implement send OTP functionality
- [ ] Create OTP input component
- [ ] Add countdown timer
- [ ] Implement verify OTP
- [ ] Add resend OTP with cooldown
- [ ] Show remaining attempts
- [ ] Handle all error cases
- [ ] Add loading states

### Reports System
- [ ] Add date range picker
- [ ] Implement all report fetchers
- [ ] Create chart components
- [ ] Add CSV export button
- [ ] Implement pagination
- [ ] Add loading spinners
- [ ] Cache frequently accessed reports
- [ ] Handle authentication errors

---

**Version:** 1.0.0
**Last Updated:** 2025-01-31
