# Complete Integration Examples
## Ready-to-Use Code for Prior eCommerce APIs

This document contains complete, copy-paste ready code examples for integrating with the Prior backend APIs.

---

## Table of Contents

1. [Vanilla JavaScript Examples](#vanilla-javascript-examples)
2. [React Examples](#react-examples)
3. [API Service Classes](#api-service-classes)
4. [UI Components](#ui-components)

---

# Vanilla JavaScript Examples

## Complete OTP Registration Form

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration with OTP</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 5px; font-weight: bold; }
    input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
    button { width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
    button:hover { background: #5568d3; }
    button:disabled { background: #ccc; cursor: not-allowed; }
    .hidden { display: none; }
    .error { color: #e53e3e; background: #fff5f5; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
    .success { color: #38a169; background: #f0fff4; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
    .info { color: #3182ce; background: #ebf8ff; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
    .countdown { text-align: center; font-size: 24px; color: #667eea; margin: 15px 0; }
    .attempts { text-align: center; color: #e53e3e; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Create Account</h1>

    <div id="message-area"></div>

    <!-- Step 1: Email -->
    <div id="email-section">
      <div class="form-group">
        <label for="email">Email Address</label>
        <input type="email" id="email" placeholder="your@email.com" required>
      </div>
      <button id="send-otp-btn">Send Verification Code</button>
    </div>

    <!-- Step 2: OTP Verification -->
    <div id="otp-section" class="hidden">
      <div class="info">
        We've sent a 6-digit code to <strong id="masked-email"></strong>
      </div>
      <div class="countdown">
        <div>Time remaining</div>
        <div id="countdown-timer">10:00</div>
      </div>
      <div class="form-group">
        <label for="otp">Enter Verification Code</label>
        <input type="text" id="otp" maxlength="6" placeholder="123456" pattern="[0-9]{6}">
      </div>
      <div class="attempts hidden" id="attempts-display"></div>
      <button id="verify-otp-btn">Verify Code</button>
      <button id="resend-otp-btn" style="margin-top: 10px; background: #718096;">Resend Code</button>
    </div>

    <!-- Step 3: Complete Registration -->
    <div id="registration-section" class="hidden">
      <div class="success">✓ Email verified successfully!</div>
      <div class="form-group">
        <label for="name">Full Name</label>
        <input type="text" id="name" required>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" required>
      </div>
      <div class="form-group">
        <label for="confirm-password">Confirm Password</label>
        <input type="password" id="confirm-password" required>
      </div>
      <button id="register-btn">Complete Registration</button>
    </div>
  </div>

  <script>
    const API_BASE = 'http://localhost:3000/api/v1';
    let userEmail = '';
    let countdownInterval = null;

    // Utility Functions
    function showMessage(message, type = 'info') {
      const messageArea = document.getElementById('message-area');
      const className = type === 'error' ? 'error' : type === 'success' ? 'success' : 'info';
      messageArea.innerHTML = `<div class="${className}">${message}</div>`;

      if (type !== 'error') {
        setTimeout(() => { messageArea.innerHTML = ''; }, 5000);
      }
    }

    function showSection(sectionId) {
      ['email-section', 'otp-section', 'registration-section'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
      });
      document.getElementById(sectionId).classList.remove('hidden');
    }

    function startCountdown(seconds) {
      let remaining = seconds;
      const display = document.getElementById('countdown-timer');

      if (countdownInterval) clearInterval(countdownInterval);

      countdownInterval = setInterval(() => {
        remaining--;
        const minutes = Math.floor(remaining / 60);
        const secs = remaining % 60;
        display.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;

        if (remaining <= 0) {
          clearInterval(countdownInterval);
          showMessage('OTP has expired. Please request a new one.', 'error');
        }
      }, 1000);
    }

    function disableButton(btn, seconds, originalText) {
      btn.disabled = true;
      let remaining = seconds;

      const interval = setInterval(() => {
        remaining--;
        btn.textContent = `${originalText} (${remaining}s)`;

        if (remaining <= 0) {
          clearInterval(interval);
          btn.disabled = false;
          btn.textContent = originalText;
        }
      }, 1000);
    }

    // Step 1: Send OTP
    document.getElementById('send-otp-btn').addEventListener('click', async () => {
      const emailInput = document.getElementById('email');
      const email = emailInput.value.trim();

      if (!email) {
        showMessage('Please enter your email address', 'error');
        return;
      }

      const btn = document.getElementById('send-otp-btn');
      btn.disabled = true;
      btn.textContent = 'Sending...';

      try {
        const response = await fetch(`${API_BASE}/otp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            purpose: 'registration'
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to send OTP');
        }

        userEmail = email;
        document.getElementById('masked-email').textContent = data.data.email;
        showMessage(data.message, 'success');
        showSection('otp-section');
        startCountdown(600); // 10 minutes
      } catch (error) {
        showMessage(error.message, 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Send Verification Code';
      }
    });

    // Auto-format OTP input
    document.getElementById('otp').addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
    });

    // Step 2: Verify OTP
    document.getElementById('verify-otp-btn').addEventListener('click', async () => {
      const otp = document.getElementById('otp').value.trim();

      if (otp.length !== 6) {
        showMessage('Please enter a 6-digit code', 'error');
        return;
      }

      const btn = document.getElementById('verify-otp-btn');
      btn.disabled = true;
      btn.textContent = 'Verifying...';

      try {
        const response = await fetch(`${API_BASE}/otp/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            otp: otp,
            purpose: 'registration'
          })
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.attemptsRemaining !== undefined) {
            const attemptsDiv = document.getElementById('attempts-display');
            attemptsDiv.textContent = `⚠️ ${data.attemptsRemaining} attempts remaining`;
            attemptsDiv.classList.remove('hidden');
          }
          throw new Error(data.message || 'Verification failed');
        }

        if (countdownInterval) clearInterval(countdownInterval);
        showMessage(data.message, 'success');
        showSection('registration-section');
      } catch (error) {
        showMessage(error.message, 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Verify Code';
      }
    });

    // Resend OTP
    document.getElementById('resend-otp-btn').addEventListener('click', async () => {
      const btn = document.getElementById('resend-otp-btn');
      const originalText = 'Resend Code';

      try {
        const response = await fetch(`${API_BASE}/otp/resend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            purpose: 'registration'
          })
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.retryAfter) {
            disableButton(btn, data.retryAfter, originalText);
          }
          throw new Error(data.message || 'Failed to resend OTP');
        }

        document.getElementById('otp').value = '';
        document.getElementById('attempts-display').classList.add('hidden');
        showMessage(data.message, 'success');
        startCountdown(600);
      } catch (error) {
        showMessage(error.message, 'error');
      }
    });

    // Step 3: Complete Registration
    document.getElementById('register-btn').addEventListener('click', async () => {
      const name = document.getElementById('name').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;

      if (!name || !password || !confirmPassword) {
        showMessage('Please fill in all fields', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
      }

      if (password.length < 8) {
        showMessage('Password must be at least 8 characters', 'error');
        return;
      }

      const btn = document.getElementById('register-btn');
      btn.disabled = true;
      btn.textContent = 'Creating Account...';

      try {
        const response = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            name: name,
            password: password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.requiresVerification) {
            showMessage('Email verification required. Please verify your email first.', 'error');
            showSection('otp-section');
            return;
          }
          throw new Error(data.message || 'Registration failed');
        }

        showMessage('✓ Registration successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } catch (error) {
        showMessage(error.message, 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Complete Registration';
      }
    });
  </script>
</body>
</html>
```

---

# React Examples

## Complete OTP Registration Component

```jsx
import React, { useState, useEffect } from 'react';
import './Registration.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000/api/v1';

function Registration() {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: details
  const [email, setEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(true);

  // Countdown timer
  useEffect(() => {
    if (step !== 2 || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(c => c > 0 ? c - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, countdown]);

  useEffect(() => {
    if (countdown === 0) {
      setMessage({ text: 'OTP has expired. Please request a new one.', type: 'error' });
    }
  }, [countdown]);

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    if (type !== 'error') {
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'registration' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setMaskedEmail(data.data.email);
      showMessage(data.message, 'success');
      setStep(2);
      setCountdown(600);
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, purpose: 'registration' })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        throw new Error(data.message || 'Verification failed');
      }

      showMessage(data.message, 'success');
      setStep(3);
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/otp/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'registration' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setOtp('');
      setAttemptsRemaining(5);
      setCountdown(600);
      showMessage(data.message, 'success');

      // Disable resend for 60 seconds
      setCanResend(false);
      setTimeout(() => setCanResend(true), 60000);
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showMessage('Passwords do not match', 'error');
      return;
    }

    if (password.length < 8) {
      showMessage('Password must be at least 8 characters', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresVerification) {
          showMessage('Email verification required', 'error');
          setStep(2);
          return;
        }
        throw new Error(data.message || 'Registration failed');
      }

      showMessage('Registration successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        <h1>Create Account</h1>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <>
            <div className="info-box">
              We've sent a 6-digit code to <strong>{maskedEmail}</strong>
            </div>

            <div className="countdown">
              <div>Time remaining</div>
              <div className="countdown-timer">{formatCountdown(countdown)}</div>
            </div>

            <form onSubmit={handleVerifyOTP}>
              <div className="form-group">
                <label>Enter Verification Code</label>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  disabled={loading}
                />
              </div>

              {attemptsRemaining < 5 && (
                <div className="attempts-warning">
                  ⚠️ {attemptsRemaining} attempts remaining
                </div>
              )}

              <button type="submit" disabled={loading || otp.length !== 6}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading || !canResend}
              className="resend-btn"
            >
              {!canResend ? 'Wait 60s to resend' : 'Resend Code'}
            </button>
          </>
        )}

        {/* Step 3: Registration Details */}
        {step === 3 && (
          <>
            <div className="success-box">
              ✓ Email verified successfully!
            </div>

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength="8"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength="8"
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Registration;
```

## Admin Dashboard Component

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000/api/v1';

function AdminDashboard() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [salesOverview, setSalesOverview] = useState(null);
  const [salesTrend, setSalesTrend] = useState(null);
  const [customerInsights, setCustomerInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const adminToken = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const headers = { 'Authorization': `Bearer ${adminToken}` };

      const [overviewRes, trendRes, customersRes] = await Promise.all([
        axios.get(`${API_BASE}/report/sales-overview`, {
          params: dateRange,
          headers
        }),
        axios.get(`${API_BASE}/report/sales-trend`, {
          params: { ...dateRange, interval: 'day' },
          headers
        }),
        axios.get(`${API_BASE}/report/customer-insights`, {
          params: dateRange,
          headers
        })
      ]);

      setSalesOverview(overviewRes.data.data);
      setSalesTrend(trendRes.data.data);
      setCustomerInsights(customersRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
      console.error('Dashboard Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await axios.get(`${API_BASE}/report/export`, {
        params: { ...dateRange, format: 'csv' },
        headers: { 'Authorization': `Bearer ${adminToken}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to export data');
      console.error('Export Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>Error: {error}</p>
        <button onClick={fetchDashboardData}>Retry</button>
      </div>
    );
  }

  const COLORS = ['#667eea', '#38a169', '#e53e3e', '#ed8936', '#3182ce'];

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Sales Dashboard</h1>

        <div className="date-controls">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            max={dateRange.endDate}
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            min={dateRange.startDate}
            max={new Date().toISOString().split('T')[0]}
          />
          <button onClick={fetchDashboardData}>Refresh</button>
          <button onClick={handleExportCSV} className="export-btn">Export CSV</button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <h3>Total Orders</h3>
          <p className="metric">{salesOverview?.summary.totalOrders.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Total Revenue</h3>
          <p className="metric">৳{salesOverview?.summary.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Average Order Value</h3>
          <p className="metric">৳{salesOverview?.summary.averageOrderValue.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Remaining</h3>
          <p className="metric">৳{salesOverview?.summary.totalRemaining.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-row">
        {/* Sales Trend Line Chart */}
        <div className="chart-card">
          <h3>Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrend?.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#667eea"
                strokeWidth={2}
                name="Revenue (৳)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orderCount"
                stroke="#38a169"
                strokeWidth={2}
                name="Orders"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Breakdown Pie Chart */}
        <div className="chart-card">
          <h3>Order Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={salesOverview?.statusBreakdown}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {salesOverview?.statusBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer Insights */}
      <div className="insights-section">
        <h2>Customer Insights</h2>
        <div className="customer-stats">
          <div className="stat-box">
            <p className="stat-label">Total Customers</p>
            <p className="stat-value">{customerInsights?.summary.totalUniqueCustomers}</p>
          </div>
          <div className="stat-box">
            <p className="stat-label">New Customers</p>
            <p className="stat-value">{customerInsights?.summary.newCustomers}</p>
          </div>
          <div className="stat-box">
            <p className="stat-label">Returning Customers</p>
            <p className="stat-value">{customerInsights?.summary.returningCustomers}</p>
          </div>
        </div>

        {/* Top Customers Table */}
        <h3>Top 10 Customers</h3>
        <table className="customers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Orders</th>
              <th>Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {customerInsights?.topCustomers.map((customer, index) => (
              <tr key={index}>
                <td>{customer.customerName}</td>
                <td>{customer.phoneNumber}</td>
                <td>{customer.orderCount}</td>
                <td>৳{customer.totalSpent.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Geographic Distribution */}
        <h3>Geographic Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={customerInsights?.geographicDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="division" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="orderCount" fill="#667eea" name="Orders" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AdminDashboard;
```

---

# API Service Classes

## OTP Service

```javascript
// services/otpService.js
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000/api/v1';

class OTPService {
  /**
   * Send OTP to email
   */
  static async sendOTP(email, purpose = 'email_verification') {
    try {
      const response = await fetch(`${API_BASE}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose })
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message,
          retryAfter: data.retryAfter
        };
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify OTP
   */
  static async verifyOTP(email, otp, purpose = 'email_verification') {
    try {
      const response = await fetch(`${API_BASE}/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, purpose })
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message,
          attemptsRemaining: data.attemptsRemaining
        };
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Resend OTP
   */
  static async resendOTP(email, purpose = 'email_verification') {
    try {
      const response = await fetch(`${API_BASE}/otp/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose })
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message,
          retryAfter: data.retryAfter
        };
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get OTP status
   */
  static async getStatus(email, purpose = 'email_verification') {
    try {
      const response = await fetch(
        `${API_BASE}/otp/status/${encodeURIComponent(email)}?purpose=${purpose}`
      );

      const data = await response.json();

      if (!response.ok) {
        return null;
      }

      return data.data;
    } catch (error) {
      console.error('Get OTP Status Error:', error);
      return null;
    }
  }
}

export default OTPService;
```

## Reports Service

```javascript
// services/reportsService.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000/api/v1';

class ReportsService {
  static getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Get sales overview
   */
  static async getSalesOverview(startDate, endDate) {
    try {
      const response = await axios.get(`${API_BASE}/report/sales-overview`, {
        params: { startDate, endDate },
        headers: this.getAuthHeaders()
      });

      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get sales trend
   */
  static async getSalesTrend(startDate, endDate, interval = 'day') {
    try {
      const response = await axios.get(`${API_BASE}/report/sales-trend`, {
        params: { startDate, endDate, interval },
        headers: this.getAuthHeaders()
      });

      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get customer insights
   */
  static async getCustomerInsights(startDate, endDate) {
    try {
      const response = await axios.get(`${API_BASE}/report/customer-insights`, {
        params: { startDate, endDate },
        headers: this.getAuthHeaders()
      });

      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get product performance
   */
  static async getProductPerformance(startDate, endDate, page = 1, limit = 20) {
    try {
      const response = await axios.get(`${API_BASE}/report/product-performance`, {
        params: { startDate, endDate, page, limit },
        headers: this.getAuthHeaders()
      });

      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Export orders as CSV
   */
  static async exportCSV(startDate, endDate) {
    try {
      const response = await axios.get(`${API_BASE}/report/export`, {
        params: { startDate, endDate, format: 'csv' },
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get all dashboard data
   */
  static async getDashboardData(startDate, endDate) {
    try {
      const [overview, trend, customers] = await Promise.all([
        this.getSalesOverview(startDate, endDate),
        this.getSalesTrend(startDate, endDate, 'day'),
        this.getCustomerInsights(startDate, endDate)
      ]);

      return { overview, trend, customers };
    } catch (error) {
      throw error;
    }
  }
}

export default ReportsService;
```

---

**Version:** 1.0.0
**Last Updated:** 2025-01-31

For more detailed documentation, see:
- `/FRONTEND_API_GUIDE.md` - Complete API documentation
- `/API_QUICK_REFERENCE.md` - Quick reference guide
