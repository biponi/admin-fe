# 📚 Frontend Developer Documentation
## Prior eCommerce Platform - Complete Integration Guide

Welcome! This guide will help you integrate with the Prior backend APIs for OTP verification and reporting systems.

---

## 🚀 Quick Start

### 1. Documentation Files

We've created **4 comprehensive documentation files** for you:

| File | Purpose | Best For |
|------|---------|----------|
| **[FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md)** | Complete API documentation with detailed request/response examples | Full reference when implementing APIs |
| **[API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)** | Quick cheat sheet with code snippets | Quick lookups during development |
| **[INTEGRATION_EXAMPLES.md](INTEGRATION_EXAMPLES.md)** | Complete, ready-to-use code examples (Vanilla JS & React) | Copy-paste implementation |
| **Individual README files** | Detailed docs for each system | Deep dive into specific features |

### 2. API Systems Available

#### 🔐 OTP Email Verification System
- Send OTP codes via email
- Verify 6-digit codes
- Resend functionality
- Rate limiting protection
- Multiple purposes (registration, login, password reset, etc.)

**Location:** `/api/v1/otp/*`
**Detailed Docs:** [routes/v1/OTP/README.md](routes/v1/OTP/README.md)

#### 📊 Reports & Analytics System
- Sales overview & trends
- Customer insights
- Product performance
- Order fulfillment status
- Payment method breakdown
- CSV/JSON/PDF exports

**Location:** `/api/v1/report/*`
**Detailed Docs:** [routes/v1/Report/README.md](routes/v1/Report/README.md)

---

## 📖 How to Use This Documentation

### For New Developers

1. **Start here:** Read this README for an overview
2. **Quick reference:** Check [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md) for endpoint summary
3. **Implementation:** Use [INTEGRATION_EXAMPLES.md](INTEGRATION_EXAMPLES.md) for ready-to-use code
4. **Deep dive:** Read [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md) for complete details

### For Experienced Developers

1. **Quick lookup:** [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md) for endpoints and responses
2. **Copy code:** [INTEGRATION_EXAMPLES.md](INTEGRATION_EXAMPLES.md) for service classes
3. **Edge cases:** [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md) for error handling

---

## 🎯 Common Integration Tasks

### Task 1: Implement User Registration with OTP

**Time:** ~30 minutes
**Difficulty:** Easy

1. Read: [OTP README](routes/v1/OTP/README.md) - Section "Complete Registration Flow"
2. Copy: Complete HTML/React component from [INTEGRATION_EXAMPLES.md](INTEGRATION_EXAMPLES.md)
3. Customize: Update styling and error messages for your app
4. Test: Follow test scenarios in documentation

**Files you'll need:**
- Complete registration form (HTML or React)
- OTP service class
- Email validation utils

### Task 2: Build Admin Dashboard with Reports

**Time:** ~2-3 hours
**Difficulty:** Medium

1. Read: [Report README](routes/v1/Report/README.md) - All endpoints overview
2. Copy: Dashboard component from [INTEGRATION_EXAMPLES.md](INTEGRATION_EXAMPLES.md)
3. Integrate: Add chart library (Recharts/Chart.js)
4. Customize: Adjust date ranges and filters

**Files you'll need:**
- Dashboard layout component
- Reports service class
- Chart components (sales trend, status breakdown, etc.)

### Task 3: Add CSV Export to Reports

**Time:** ~15 minutes
**Difficulty:** Easy

1. Read: [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md) - Export section
2. Copy: Export function from examples
3. Add: Export button to your dashboard

---

## 🔑 API Endpoints Quick Reference

### OTP System

```javascript
// Send OTP
POST /api/v1/otp/send
Body: { "email": "user@example.com", "purpose": "registration" }

// Verify OTP
POST /api/v1/otp/verify
Body: { "email": "user@example.com", "otp": "123456", "purpose": "registration" }

// Resend OTP
POST /api/v1/otp/resend
Body: { "email": "user@example.com", "purpose": "registration" }
```

### Reports System (Requires Admin Auth)

```javascript
// Sales Overview
GET /api/v1/report/sales-overview?startDate=2025-01-01&endDate=2025-01-31
Headers: { Authorization: "Bearer ADMIN_TOKEN" }

// Sales Trend
GET /api/v1/report/sales-trend?startDate=2025-01-01&endDate=2025-01-31&interval=day
Headers: { Authorization: "Bearer ADMIN_TOKEN" }

// Export CSV
GET /api/v1/report/export?format=csv&startDate=2025-01-01&endDate=2025-01-31
Headers: { Authorization: "Bearer ADMIN_TOKEN" }
```

---

## 🛠️ Setup & Configuration

### Environment Variables

Create a `.env` file in your frontend project:

```env
# API Configuration
REACT_APP_API_BASE=http://localhost:3000/api/v1

# For Production
# REACT_APP_API_BASE=https://api.priorbd.com/api/v1
```

### Required Dependencies

```bash
# For React projects
npm install axios recharts

# For vanilla JavaScript
# No dependencies needed! All examples use native fetch API
```

---

## 📦 Ready-to-Use Code

### Service Classes

We've created production-ready service classes for you:

**OTPService.js** - Complete OTP management
```javascript
import OTPService from './services/otpService';

// Send OTP
await OTPService.sendOTP('user@example.com', 'registration');

// Verify OTP
await OTPService.verifyOTP('user@example.com', '123456', 'registration');
```

**ReportsService.js** - All reporting endpoints
```javascript
import ReportsService from './services/reportsService';

// Get sales overview
const overview = await ReportsService.getSalesOverview('2025-01-01', '2025-01-31');

// Export CSV
await ReportsService.exportCSV('2025-01-01', '2025-01-31');
```

**Full code available in:** [INTEGRATION_EXAMPLES.md](INTEGRATION_EXAMPLES.md)

---

## ⚠️ Important Notes

### Authentication

- **OTP endpoints:** No authentication required (public)
- **Report endpoints:** Require admin authentication token
- **Token format:** `Authorization: Bearer YOUR_TOKEN`

### Rate Limits

**OTP System:**
- Send OTP: 3 requests per 5 minutes per email
- Resend OTP: 2 requests per 5 minutes per email
- Verify OTP: 5 attempts per code
- Minimum resend interval: 1 minute

**Reports System:**
- No strict rate limits
- Recommended: Cache reports for 5-10 minutes

### Date Formats

All dates must be in **ISO 8601 format**: `YYYY-MM-DD`

Examples:
- ✅ `2025-01-31`
- ✅ `2025-01-01`
- ❌ `31/01/2025`
- ❌ `01-31-2025`

---

## 🎨 UI/UX Best Practices

### OTP Verification

1. **Show countdown timer** - Display time remaining for OTP expiry
2. **Auto-format input** - Only allow 6 digits in OTP field
3. **Auto-submit** - Submit form when 6 digits entered
4. **Show attempts** - Display remaining verification attempts
5. **Disable resend** - Add cooldown period after resending

### Reports Dashboard

1. **Loading states** - Show spinners during data fetch
2. **Date validation** - Prevent invalid date ranges
3. **Cache data** - Reduce API calls with local caching
4. **Error handling** - Show user-friendly error messages
5. **Export feedback** - Indicate when CSV is downloading

---

## 🐛 Troubleshooting

### OTP Issues

**Problem:** OTP email not received
**Solutions:**
- Check spam/junk folder
- Verify email address is correct
- Wait 1-2 minutes (email may be delayed)
- Try resend after 1 minute

**Problem:** "Invalid OTP" error
**Solutions:**
- Ensure 6-digit code is correct
- Check if OTP has expired (10 min limit)
- Request new OTP if expired

**Problem:** "Rate limited" error
**Solutions:**
- Wait for the specified retry period
- Check `retryAfter` field in response
- Show countdown to user

### Report Issues

**Problem:** "Unauthorized" error
**Solutions:**
- Verify admin token is included in headers
- Check token hasn't expired
- Re-authenticate if needed

**Problem:** Empty data in reports
**Solutions:**
- Verify date range has orders
- Check if filters are too restrictive
- Ensure database has data for period

**Problem:** CSV download not working
**Solutions:**
- Use `responseType: 'blob'` in axios
- Check browser pop-up blocker
- Verify file download permissions

---

## 📞 Support & Resources

### Documentation Files

- **Complete API Guide:** [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md)
- **Quick Reference:** [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)
- **Code Examples:** [INTEGRATION_EXAMPLES.md](INTEGRATION_EXAMPLES.md)
- **OTP Details:** [routes/v1/OTP/README.md](routes/v1/OTP/README.md)
- **Reports Details:** [routes/v1/Report/README.md](routes/v1/Report/README.md)

### Getting Help

1. Check documentation files above
2. Review error responses in API guide
3. See troubleshooting section
4. Contact backend team with specific error messages

---

## ✅ Integration Checklist

### OTP System Integration

- [ ] Read OTP documentation
- [ ] Implement send OTP endpoint
- [ ] Create OTP input component with auto-format
- [ ] Add countdown timer (10 minutes)
- [ ] Implement verify OTP endpoint
- [ ] Add resend OTP with cooldown (60 seconds)
- [ ] Show remaining attempts (max 5)
- [ ] Handle all error cases
- [ ] Add loading states and spinners
- [ ] Test complete registration flow
- [ ] Test rate limiting scenarios
- [ ] Test OTP expiry handling

### Reports System Integration

- [ ] Read reports documentation
- [ ] Set up admin authentication
- [ ] Add date range picker component
- [ ] Implement sales overview endpoint
- [ ] Implement sales trend endpoint
- [ ] Implement customer insights endpoint
- [ ] Implement product performance endpoint
- [ ] Add chart library (Recharts/Chart.js)
- [ ] Create dashboard layout
- [ ] Implement CSV export functionality
- [ ] Add loading states for all reports
- [ ] Implement error handling
- [ ] Add report caching (5-10 min)
- [ ] Test all report endpoints
- [ ] Test date range validation
- [ ] Test CSV export download

---

## 🚀 Example Workflows

### 1. User Registration with Email Verification

```
User enters email
    ↓
Frontend: POST /api/v1/otp/send
    ↓
User receives email with 6-digit code
    ↓
User enters OTP code
    ↓
Frontend: POST /api/v1/otp/verify
    ↓
If verified: Show registration form
    ↓
User completes registration
    ↓
Frontend: POST /api/v1/auth/register
    ↓
Success: Redirect to dashboard
```

### 2. Admin Viewing Sales Report

```
Admin logs in
    ↓
Frontend: Store admin token
    ↓
Admin selects date range
    ↓
Frontend: Fetch all reports in parallel
  - GET /api/v1/report/sales-overview
  - GET /api/v1/report/sales-trend
  - GET /api/v1/report/customer-insights
    ↓
Display dashboard with charts
    ↓
Admin clicks "Export CSV"
    ↓
Frontend: GET /api/v1/report/export?format=csv
    ↓
Download CSV file
```

---

## 📊 API Response Examples

### OTP Send Success
```json
{
  "success": true,
  "message": "OTP sent successfully to u***r@example.com. Please check your email.",
  "data": {
    "email": "u***r@example.com",
    "purpose": "registration",
    "expiresIn": 600
  }
}
```

### Sales Overview Success
```json
{
  "success": true,
  "data": {
    "period": { "startDate": "2025-01-01", "endDate": "2025-01-31" },
    "summary": {
      "totalOrders": 450,
      "totalRevenue": 1250000.00,
      "averageOrderValue": 2777.78
    },
    "statusBreakdown": [
      { "status": "completed", "count": 280, "revenue": 780000.00 }
    ]
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Invalid email format",
  "message": "Please provide a valid email address"
}
```

---

## 🎓 Learning Path

### Beginner (Day 1)
1. Read this README completely
2. Review [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)
3. Copy basic OTP form from [INTEGRATION_EXAMPLES.md](INTEGRATION_EXAMPLES.md)
4. Test sending and verifying OTP

### Intermediate (Day 2-3)
1. Read [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md) - OTP section
2. Implement complete registration flow
3. Add error handling and loading states
4. Test edge cases (rate limiting, expiry, etc.)

### Advanced (Week 1)
1. Read [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md) - Reports section
2. Implement admin dashboard
3. Add all report endpoints
4. Integrate charts library
5. Implement CSV export
6. Add caching and optimization

---

## 📝 Changelog

### Version 1.0.0 (2025-01-31)
- Initial release
- OTP Email Verification System
- Comprehensive Reporting & Analytics System
- Complete frontend documentation
- Ready-to-use code examples

---

## 📄 License

This documentation is part of the Prior eCommerce Platform.

---

## 🎉 You're Ready!

You now have everything you need to integrate with the Prior backend APIs. Choose your starting point:

- **Quick learner?** → [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)
- **Want examples?** → [INTEGRATION_EXAMPLES.md](INTEGRATION_EXAMPLES.md)
- **Need details?** → [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md)

**Happy coding! 🚀**

---

**Last Updated:** 2025-01-31
**Version:** 1.0.0
