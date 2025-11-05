# Notifications Page

A comprehensive notifications management page with read/unread tabs and notification creation functionality.

## Features

### 📋 Notification List
- **All / Unread / Read Tabs** - Filter notifications by read status
- **Topic Filter** - Filter by notification topic (orders, payments, etc.)
- **Stats Cards** - Quick overview of total, unread, and read notifications
- **Infinite Scroll** - Automatically loads more notifications as you scroll
- **Mark as Read** - Individual or bulk mark as read
- **Delete Notifications** - Remove unwanted notifications
- **Action Links** - Click notifications to navigate to related pages

### ✨ Create Notification
- **Subject & Message** - Required fields for notification content
- **Topic Selection** - Choose from 15+ predefined topics with emoji icons
- **Priority Levels** - Low, Normal, High, Urgent
- **Multi-Channel** - Send via In-App, Push (FCM), Email, SMS
- **Recipients** - Add specific user IDs or broadcast to all
- **Action URLs** - Add clickable links with custom text

## Usage

### Access the Page

Navigate to `/notifications` or click "Notifications" in the sidebar menu.

### View Notifications

```tsx
// The page automatically loads notifications on mount
// Click tabs to filter:
// - All: Shows all notifications
// - Unread: Shows only unread notifications
// - Read: Shows only read notifications
```

### Filter by Topic

Use the dropdown in the top-right to filter notifications by specific topics like:
- Orders (created, status changed)
- Courier (shipped, delivered)
- Payments (received, failed)
- System alerts
- Support tickets
- And more...

### Create a Notification

1. Click **"Create Notification"** button
2. Fill in the form:
   - **Subject** (required) - Short title
   - **Message** (required) - Detailed content
   - **Topic** - Select relevant topic
   - **Priority** - Choose urgency level
   - **Channels** - Select delivery methods
   - **Recipients** - Add user IDs or enable broadcast
   - **Action URL** (optional) - Link to related page
   - **Action Text** (optional) - Custom button text
3. Click **"Send Notification"**

### Example: Create Order Notification

```javascript
Subject: New Order Received
Message: Order #12345 has been placed successfully
Topic: Order Created
Priority: Normal
Channels: In-App, Push
Recipients: [user123, user456]
Action URL: /order/12345
Action Text: View Order
```

## Components

### NotificationPage.tsx
Main page component with tabs, filters, and notification list.

### CreateNotificationModal.tsx
Modal dialog for creating new notifications with full form validation.

## API Endpoints Used

- `GET /api/v1/notification/list` - Fetch notifications
- `GET /api/v1/notification/unread-count` - Get unread count
- `PUT /api/v1/notification/:id/read` - Mark as read
- `DELETE /api/v1/notification/:id` - Delete notification
- `PUT /api/v1/notification/mark-all-read` - Mark all as read
- `POST /api/v1/notification/send` - Create new notification

## Notification Topics

### Available Topics:
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
- 📨 `custom` - Custom notification

## Priority Levels

- **Low** - Gray badge, informational
- **Normal** - Blue badge, standard notifications
- **High** - Orange badge, important notifications
- **Urgent** - Red badge, requires immediate attention

## Channels

- **In-App** - Shows in notification panel and page
- **Push (FCM)** - Browser/mobile push notifications
- **Email** - Email notifications (if backend configured)
- **SMS** - SMS notifications (if backend configured)

## Permissions

All authenticated users can:
- View notifications sent to them
- Mark notifications as read
- Delete their own notifications

Admins/Managers can additionally:
- Create new notifications
- Send to specific users
- Broadcast to all users

## Customization

### Add New Topic

Edit `NotificationPage.tsx` and `CreateNotificationModal.tsx`:

```typescript
// In getTopicIcon function
const icons: Record<string, string> = {
  my_new_topic: '🎉',
  // ...
};

// In topics array (CreateNotificationModal)
const topics = [
  { value: 'my_new_topic', label: '🎉 My New Topic', icon: '🎉' },
  // ...
];
```

### Customize Colors

Edit `NotificationPage.tsx`:

```typescript
const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800 border-gray-300',
    // Customize colors here
  };
  return colors[priority] || colors.normal;
};
```

## Integration

The notification page is already integrated with:
- ✅ Navigation sidebar (`/notifications`)
- ✅ Protected routes (requires authentication)
- ✅ useNotifications hook (shared state)
- ✅ NotificationBell component (updates in real-time)

## Testing

### Test Notification Flow

1. Navigate to `/notifications`
2. Click "Create Notification"
3. Fill form and send to yourself
4. Check notification appears in list
5. Check bell icon shows unread count
6. Click notification to mark as read
7. Verify count decreases

### Test Filters

1. Create multiple notifications with different topics
2. Use topic filter to view specific types
3. Toggle between All/Unread/Read tabs
4. Verify correct notifications appear

## Troubleshooting

### Notifications not appearing
- Check backend is running
- Verify user is logged in
- Check auth token in localStorage
- Open Network tab and verify API calls succeed

### Cannot create notifications
- Verify user has admin/manager permissions
- Check backend `/api/v1/notification/send` endpoint exists
- Verify recipients are valid user IDs

### Toast notifications not showing
- Component uses shadcn/ui toast
- Ensure Toaster component is in App.tsx
- Check `use-toast` hook is working

## Screenshots

The page includes:
- 📊 Stats cards showing total/unread/read counts
- 🔖 Tabs for filtering (All/Unread/Read)
- 🔍 Topic filter dropdown
- 📝 Notification list with icons and badges
- ➕ Create notification button
- ✏️ Full-featured notification creation modal

## Future Enhancements

Potential improvements:
- [ ] Notification categories
- [ ] Advanced filtering (date range, priority)
- [ ] Bulk actions (select multiple)
- [ ] Export notifications to CSV
- [ ] Notification templates
- [ ] Scheduled notifications
- [ ] Notification analytics/statistics
- [ ] Rich text editor for messages
- [ ] File attachments
- [ ] Notification preview before sending

## Notes

- Notifications auto-refresh every 30 seconds
- Infinite scroll loads 20 notifications at a time
- Unread notifications have blue background
- Priority badges only shown for non-normal priorities
- Action URLs can be relative (/order/123) or absolute (https://...)
