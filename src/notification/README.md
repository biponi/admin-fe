# Notification System - Firebase Cloud Messaging Integration

This folder contains the complete Firebase Cloud Messaging (FCM) notification system for the admin panel.

## 📁 File Structure

```
src/notification/
├── NotificationBell.tsx      # Bell icon component with badge
├── NotificationPanel.tsx      # Dropdown panel showing notification list
├── useNotifications.ts        # Custom hook for notification management
├── notificationService.ts     # API service for backend communication
└── README.md                  # This file

src/config/
└── firebase.ts                # Firebase configuration and initialization

public/
└── firebase-messaging-sw.js   # Service worker for background notifications
```

## 🚀 Setup Instructions

### 1. Install Dependencies

Firebase is already installed. If you need to reinstall:

```bash
npm install firebase
```

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_VAPID_KEY=your_vapid_key

# Backend API
REACT_APP_API_URL=http://localhost:7001/api/v1
```

**Get Firebase values from:**
1. [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **General** → **Your apps** → **Web app**
4. For VAPID key: **Cloud Messaging** → **Web Push certificates** → **Generate key pair**

### 3. Update Service Worker

Edit `public/firebase-messaging-sw.js` and replace the placeholder values with your actual Firebase config:

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

### 4. Backend API Setup

Ensure your backend has the following endpoints:

- `POST /api/v1/notification/register-token` - Register FCM token
- `GET /api/v1/notification/list` - Get notification list
- `GET /api/v1/notification/unread-count` - Get unread count
- `PUT /api/v1/notification/:id/read` - Mark as read
- `DELETE /api/v1/notification/:id` - Delete notification
- `PUT /api/v1/notification/mark-all-read` - Mark all as read
- `POST /api/v1/notification/subscribe-topic` - Subscribe to topic
- `POST /api/v1/notification/unsubscribe-topic` - Unsubscribe from topic

## 📖 Usage

### Using the NotificationBell Component

The `NotificationBell` component is already integrated in `site-header.tsx`:

```tsx
import NotificationBell from '../notification/NotificationBell';

<NotificationBell size='sm' variant='ghost' />
```

### Using the Hook Directly

You can use the `useNotifications` hook in any component:

```tsx
import { useNotifications } from '../notification/useNotifications';

function MyComponent() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      {notifications.map(notification => (
        <div key={notification._id}>
          <h4>{notification.subject}</h4>
          <p>{notification.message}</p>
          <button onClick={() => markAsRead(notification._id)}>
            Mark as read
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 🔧 API Reference

### useNotifications Hook

```tsx
const {
  notifications,       // Array of notification objects
  unreadCount,         // Number of unread notifications
  loading,             // Loading state
  hasMore,             // Whether more notifications are available
  fcmToken,            // FCM device token
  fetchNotifications,  // (page, append) => void
  fetchUnreadCount,    // () => void
  markAsRead,          // (notificationId) => void
  markAllAsRead,       // () => void
  deleteNotification,  // (notificationId) => void
  loadMore,            // () => void - Load next page
  initializeFCM        // () => void - Request permission
} = useNotifications();
```

### Notification Object

```typescript
{
  _id: string;
  subject: string;
  message: string;
  topic: string;
  data?: any;
  createdAt: string;
  read?: boolean;
  recipients?: Array<{ read: boolean }>;
  broadcast?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
}
```

## 🎨 Customization

### Notification Topics

The system supports topic-based notifications. Topics are defined in `NotificationPanel.tsx`:

```tsx
const getTopicIcon = (topic: string): string => {
  const icons: Record<string, string> = {
    order_created: '🛒',
    order_status_changed: '📦',
    courier_shipped: '🚚',
    courier_delivered: '✅',
    payment_received: '💰',
    payment_failed: '❌',
    low_stock: '⚠️',
    user_registered: '👤',
    system_alert: '🔔',
    // Add more topics here
  };
  return icons[topic] || '📨';
};
```

### Priority Colors

Customize priority badge colors in `NotificationPanel.tsx`:

```tsx
const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    normal: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };
  return colors[priority] || colors.normal;
};
```

## 🧪 Testing

### 1. Check Browser Permissions

```javascript
// In browser console
console.log('Notification permission:', Notification.permission);
```

### 2. Test FCM Token Generation

Open your app and check the console for:
```
FCM Token: eyJhbGciOiJFUz...
```

### 3. Send Test Notification from Backend

Use Postman or curl:

```bash
curl -X POST http://localhost:7001/api/v1/notification/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Test Notification",
    "message": "This is a test",
    "topic": "system_alert",
    "channels": ["fcm", "inapp"]
  }'
```

## 🐛 Troubleshooting

### Notifications Not Appearing

1. **Check permissions:**
   - Browser notification permission must be granted
   - Check in browser settings

2. **Check service worker:**
   - Open DevTools → Application → Service Workers
   - Verify `firebase-messaging-sw.js` is active

3. **Check FCM token:**
   - Console should show "FCM Token: ..."
   - Token should be registered in backend

4. **Check HTTPS:**
   - Service workers require HTTPS (or localhost)

### Service Worker Issues

1. **Clear cache:**
   - DevTools → Application → Clear storage
   - Reload page

2. **Update service worker:**
   - DevTools → Application → Service Workers → Update

### Firebase Errors

1. **Invalid VAPID key:**
   - Regenerate in Firebase Console
   - Update `.env` file

2. **Config mismatch:**
   - Ensure React and service worker configs match
   - Check project ID

## 📱 Features

- ✅ Real-time push notifications (foreground & background)
- ✅ In-app notification list with dropdown panel
- ✅ Unread badge counter
- ✅ Mark as read / Mark all as read
- ✅ Delete notifications
- ✅ Topic-based subscriptions
- ✅ Priority levels (low, normal, high, urgent)
- ✅ Action URLs and navigation
- ✅ Infinite scroll pagination
- ✅ Mobile responsive
- ✅ Sound notifications (can be enabled)
- ✅ Custom notification icons per topic

## 🔒 Security Notes

- Never expose Firebase private key in frontend
- Use VAPID key (public key) in frontend
- Always validate tokens on backend
- Implement rate limiting on notification endpoints
- Sanitize notification content before displaying

## 📚 Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notification)

## 🤝 Support

If you encounter issues:

1. Check browser console for errors
2. Verify all environment variables are set
3. Ensure backend API is running
4. Check Firebase Console for errors
5. Review service worker status in DevTools

## 📝 Notes

- Notifications are automatically fetched on mount
- Unread count updates every 30 seconds
- FCM token is saved to localStorage
- Background notifications work even when tab is closed
- Click handlers navigate to relevant pages based on topic/data
