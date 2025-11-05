# 🐛 Notification System Troubleshooting

## Issues Fixed

### ✅ Issue 1: Wrong Auth Header
**Problem:** Notification service was using `authorization` header, but your app uses `x-access-token`.

**Fixed:** Updated `notificationService.ts` to use the correct header:
```typescript
config.headers.set("x-access-token", token);
```

### ✅ Issue 2: Wrong API Base URL
**Problem:** Was using `REACT_APP_API_URL` instead of `REACT_APP_API_BASE_URL`.

**Fixed:** Changed to match your existing API setup:
```typescript
const API_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:7001";
```

### ✅ Issue 3: Limited Topic Subscription
**Problem:** Only subscribed to `"all"` topic. Notifications sent to other topics weren't received.

**Fixed:** Now subscribes to all relevant topics:
- `all`
- `order_created`
- `order_status_changed`
- `courier_shipped`
- `courier_delivered`
- `payment_received`
- `payment_failed`
- `low_stock`
- `user_registered`
- `system_alert`
- `new_ticket`
- `new_message`
- `ticket_assigned`
- `ticket_transferred`
- `agent_requested`

## Current Subscribed Topics

The frontend now automatically subscribes to **all notification topics** when registering the FCM token. This ensures you receive notifications regardless of which topic they're sent to.

## How to Debug Notifications

### Method 1: Using the Debug Component (Recommended)

1. Add the debug component to your app temporarily:

```tsx
// In your App.tsx or dashboard layout
import NotificationDebug from './notification/NotificationDebug';

function App() {
  return (
    <div>
      {/* Your app content */}

      {/* Add this at the bottom during development */}
      {process.env.NODE_ENV === 'development' && <NotificationDebug />}
    </div>
  );
}
```

2. The debug panel will show:
   - FCM Token status
   - Auth Token status
   - API URL
   - Notification permission
   - Notification count
   - Recent notifications

3. Click "🔄 Refresh Notifications" to manually fetch.

### Method 2: Browser Console

Open browser DevTools (F12) and run:

```javascript
// Check if notification service is working
const token = localStorage.getItem('token');
console.log('Auth Token:', token ? 'Present' : 'Missing');

// Check notification permission
console.log('Notification Permission:', Notification.permission);

// Check FCM token
const fcmToken = localStorage.getItem('fcmToken');
console.log('FCM Token:', fcmToken);

// Manually fetch notifications
fetch('http://localhost:7001/api/v1/notification/list?page=1&limit=20', {
  headers: {
    'x-access-token': token
  }
})
.then(r => r.json())
.then(data => console.log('Notifications:', data))
.catch(err => console.error('Error:', err));
```

### Method 3: Network Tab

1. Open DevTools → Network tab
2. Filter by "notification"
3. Look for `/api/v1/notification/list` request
4. Check:
   - Status code (should be 200)
   - Request headers (should have `x-access-token`)
   - Response data

## Common Issues & Solutions

### Issue: "Courier Request Failed" notification not showing

**Possible Causes:**

1. **Backend sent to wrong topic**
   - Check backend logs to see which topic was used
   - Frontend now subscribes to all topics, so this shouldn't be an issue

2. **Notification not in database**
   - Check if notification was actually saved in MongoDB
   - Verify the backend notification service is working

3. **Wrong user/recipient**
   - Ensure the notification was sent to your user ID
   - Check `recipients` field in the notification document

4. **API endpoint mismatch**
   - Verify backend has `/api/v1/notification/list` endpoint
   - Check if endpoint returns correct format

### Issue: No notifications appearing at all

**Checklist:**

- [ ] Backend server is running on port 7001
- [ ] User is logged in (auth token in localStorage)
- [ ] Notification permission is granted
- [ ] API endpoint exists and returns data
- [ ] Network request succeeds (check Network tab)
- [ ] No CORS errors in console

### Issue: Notifications show in database but not in frontend

**Debug Steps:**

1. Check API response format:
```javascript
// Expected format:
{
  "success": true,
  "data": {
    "notifications": [...],
    "pagination": {
      "page": 1,
      "totalPages": 1,
      "totalCount": 5
    }
  }
}
```

2. If format is different, update `useNotifications.ts`:
```typescript
const { notifications: newNotifications, pagination } = response.data;
// Adjust based on your actual response structure
```

### Issue: FCM push notifications not working

**Note:** If notification was sent via **"inapp"** channel only (not "fcm"), it will only appear in the notification list, not as a push notification.

To receive push notifications, backend must send with:
```javascript
channels: ["fcm", "inapp"]  // Include both
```

## Backend Response Format

Your backend's `/api/v1/notification/list` should return:

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "notification_id",
        "subject": "Courier Request Failed",
        "message": "Unable to process courier request",
        "topic": "courier_failed",
        "priority": "high",
        "recipients": [
          {
            "userId": "user_id",
            "read": false
          }
        ],
        "createdAt": "2025-11-05T10:30:00.000Z",
        "data": {}
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalPages": 1,
      "totalCount": 1
    }
  }
}
```

## Testing the Fix

### 1. Restart your app

```bash
npm start
```

### 2. Check browser console

You should see:
```
Notification permission granted
FCM Token: ey...
```

### 3. Send a test notification from backend

```javascript
// Backend code
await notify.send(
  'Test Notification',
  'Testing the notification system',
  'system_alert',  // Any topic - frontend subscribes to all
  {},
  {
    channels: ['inapp'],  // For testing, use 'inapp' only
    recipients: [userId],
    priority: 'normal'
  }
);
```

### 4. Check if notification appears

- Open notification bell in UI
- Should show unread count
- Click to see notification in panel

## API Endpoints Checklist

Verify these endpoints exist in your backend:

- [ ] `POST /api/v1/notification/register-token`
- [ ] `GET /api/v1/notification/list`
- [ ] `GET /api/v1/notification/unread-count`
- [ ] `PUT /api/v1/notification/:id/read`
- [ ] `DELETE /api/v1/notification/:id`
- [ ] `PUT /api/v1/notification/mark-all-read`

## Quick Test Commands

### Test notification list endpoint:
```bash
curl -X GET "http://localhost:7001/api/v1/notification/list?page=1&limit=20" \
  -H "x-access-token: YOUR_TOKEN_HERE"
```

### Test unread count endpoint:
```bash
curl -X GET "http://localhost:7001/api/v1/notification/unread-count" \
  -H "x-access-token: YOUR_TOKEN_HERE"
```

## Still Not Working?

1. **Enable verbose logging:**

Add to `useNotifications.ts`:
```typescript
useEffect(() => {
  console.log('📊 Notifications state:', {
    count: notifications.length,
    unread: unreadCount,
    loading,
  });
}, [notifications, unreadCount, loading]);
```

2. **Check backend logs:**
   - Verify notification was created in database
   - Check which topic it was sent to
   - Verify recipient user ID matches your logged-in user

3. **Database query:**
```javascript
// In MongoDB
db.notifications.find({
  'recipients.userId': ObjectId('YOUR_USER_ID')
}).sort({ createdAt: -1 }).limit(5);
```

## Summary

**Main fixes applied:**
1. ✅ Auth header changed to `x-access-token`
2. ✅ API base URL updated to use `REACT_APP_API_BASE_URL`
3. ✅ Now subscribes to all notification topics
4. ✅ Created debug component for testing

**To receive notifications:**
- Backend must save to database
- Notification must be sent to your user ID
- Auth token must be valid
- API endpoint must return correct format

The notification system should now work correctly! 🎉
