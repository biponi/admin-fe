# 🔔 Notification System Setup Guide

Firebase Cloud Messaging (FCM) notification system has been successfully integrated into your admin panel!

## ✅ What's Been Implemented

### New Files Created:

1. **`src/notification/`** - Complete notification system folder
   - `NotificationBell.tsx` - Bell icon component with badge
   - `NotificationPanel.tsx` - Dropdown panel with notification list
   - `useNotifications.ts` - Custom React hook for notifications
   - `notificationService.ts` - API client for backend communication
   - `index.ts` - Exports for easy importing
   - `README.md` - Detailed documentation

2. **`src/config/firebase.ts`** - Firebase configuration and initialization

3. **`public/firebase-messaging-sw.js`** - Service worker for background notifications

4. **`.env.example`** - Environment variables template

### Updated Files:

1. **`src/components/site-header.tsx`** - Now uses the new NotificationBell component

## 🚀 Quick Start (3 Steps)

### Step 1: Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to **Project Settings** (gear icon) → **General**
4. Scroll to **Your apps** section
5. Click **Web app** icon (</>) or **Add app**
6. Copy the Firebase configuration

### Step 2: Update Environment Variables

Add these to your `.env` file:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:xxxxx

# Get VAPID key from: Project Settings → Cloud Messaging → Web Push certificates → Generate key pair
REACT_APP_FIREBASE_VAPID_KEY=BNxXXXXXXXXXXXXXXXXX...

# Backend API (adjust if different)
REACT_APP_API_URL=http://localhost:7001/api/v1
```

### Step 3: Update Service Worker Config

Edit `public/firebase-messaging-sw.js` and replace the placeholder config with your actual Firebase values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_AUTH_DOMAIN",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_STORAGE_BUCKET",
  messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

**Important:** These values should match your `.env` file!

## 🧪 Testing

### 1. Start Your App

```bash
npm start
```

### 2. Check Browser Console

You should see:
- "Firebase messaging initialized"
- "Notification permission granted" (after accepting)
- "FCM Token: eyJhbGciOiJFUz..."

### 3. Test Notification Permission

The app will automatically request notification permission on first load. You can also test manually:

```javascript
// In browser console
Notification.requestPermission().then(permission => {
  console.log('Permission:', permission);
});
```

### 4. Send Test Notification from Backend

Use this curl command (replace with your backend URL and auth token):

```bash
curl -X POST http://localhost:7001/api/v1/notification/test \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Test Notification",
    "message": "This is a test notification from your backend!",
    "topic": "system_alert",
    "priority": "high",
    "channels": ["fcm", "inapp"]
  }'
```

## 📱 Features Included

- ✅ **Real-time Push Notifications** - Receive notifications even when app is in background
- ✅ **In-App Notification Center** - View all notifications in a beautiful dropdown panel
- ✅ **Unread Badge Counter** - Shows number of unread notifications
- ✅ **Mark as Read** - Individual or bulk mark as read
- ✅ **Delete Notifications** - Remove unwanted notifications
- ✅ **Topic Subscriptions** - Subscribe to specific notification topics
- ✅ **Priority Levels** - Visual indicators for urgent notifications
- ✅ **Action URLs** - Click notifications to navigate to relevant pages
- ✅ **Mobile Responsive** - Works on all screen sizes
- ✅ **Infinite Scroll** - Load more notifications automatically

## 🎨 Notification Topics & Icons

The system comes with pre-configured topics and emoji icons:

- 🛒 `order_created` - New order created
- 📦 `order_status_changed` - Order status updated
- 🚚 `courier_shipped` - Package shipped
- ✅ `courier_delivered` - Package delivered
- 💰 `payment_received` - Payment received
- ❌ `payment_failed` - Payment failed
- ⚠️ `low_stock` - Low stock alert
- 👤 `user_registered` - New user registered
- 🔔 `system_alert` - System alert
- 🎫 `new_ticket` - New support ticket
- 💬 `new_message` - New message
- 👥 `ticket_assigned` - Ticket assigned
- ↔️ `ticket_transferred` - Ticket transferred
- 🆘 `agent_requested` - Agent help requested

You can customize these in `src/notification/NotificationPanel.tsx`

## 🔧 Backend Integration

Your backend should implement these endpoints:

### Required Endpoints:

1. **POST** `/api/v1/notification/register-token`
   - Register FCM token for a device
   - Body: `{ token, deviceInfo, topics }`

2. **GET** `/api/v1/notification/list`
   - Get paginated notification list
   - Query: `page, limit, unreadOnly`

3. **GET** `/api/v1/notification/unread-count`
   - Get count of unread notifications

4. **PUT** `/api/v1/notification/:id/read`
   - Mark specific notification as read

5. **DELETE** `/api/v1/notification/:id`
   - Delete a notification

6. **PUT** `/api/v1/notification/mark-all-read`
   - Mark all notifications as read

7. **POST** `/api/v1/notification/subscribe-topic`
   - Subscribe to a topic
   - Body: `{ token, topic }`

8. **POST** `/api/v1/notification/unsubscribe-topic`
   - Unsubscribe from a topic
   - Body: `{ token, topic }`

## 🐛 Common Issues & Solutions

### Issue: "Notification permission denied"
**Solution:** Clear browser data and refresh. Re-request permission.

### Issue: Service worker not registering
**Solution:**
- Ensure you're on HTTPS (or localhost)
- Clear browser cache
- Check `public/firebase-messaging-sw.js` exists

### Issue: No FCM token generated
**Solution:**
- Check Firebase config in `.env`
- Verify VAPID key is correct
- Check browser console for errors

### Issue: Background notifications not working
**Solution:**
- Verify service worker is active (DevTools → Application → Service Workers)
- Check `firebase-messaging-sw.js` config matches `.env`
- Ensure Firebase Cloud Messaging is enabled in Firebase Console

### Issue: Notifications not showing in panel
**Solution:**
- Check backend API is returning data
- Verify API_URL in `.env` is correct
- Check browser network tab for API errors

## 📚 Documentation

Full documentation is available in:
- `src/notification/README.md` - Complete technical documentation
- This file - Quick setup guide

## 🔒 Security Checklist

- ✅ Never commit `.env` file to git
- ✅ Use environment variables for all sensitive data
- ✅ VAPID key is public (safe to use in frontend)
- ✅ Validate all FCM tokens on backend
- ✅ Implement rate limiting on backend
- ✅ Sanitize notification content to prevent XSS

## 🎯 Next Steps

1. **Configure Firebase** (5 minutes)
   - Get Firebase config and add to `.env`
   - Update service worker config

2. **Test Notifications** (5 minutes)
   - Start app and grant permission
   - Send test notification from backend

3. **Customize** (Optional)
   - Add more notification topics
   - Customize icons and colors
   - Add notification sounds

4. **Deploy** (When ready)
   - Ensure HTTPS is configured
   - Set environment variables in production
   - Test on production environment

## 💡 Tips

- **Development:** Use localhost for testing (HTTPS not required)
- **Production:** HTTPS is required for service workers
- **Testing:** Use browser incognito mode to test fresh installs
- **Debugging:** Check browser DevTools → Console and Application tabs

## 🤝 Need Help?

If you encounter issues:

1. Check browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure backend API is running and accessible
4. Check Firebase Console for project status
5. Review `src/notification/README.md` for detailed troubleshooting

## ✨ You're All Set!

The notification system is ready to use. Just configure Firebase and start receiving notifications! 🎉

---

**Created:** November 2025
**Framework:** React + TypeScript + Firebase
**Components:** NotificationBell, NotificationPanel, useNotifications hook
