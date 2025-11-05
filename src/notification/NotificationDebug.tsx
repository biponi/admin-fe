import React, { useEffect, useState } from 'react';
import { useNotifications } from './useNotifications';
import { Button } from '../components/ui/button';

/**
 * Debug component to test notification system
 * Add this temporarily to your app to debug notification issues
 */
export const NotificationDebug: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    fcmToken,
    fetchNotifications,
    fetchUnreadCount,
  } = useNotifications();

  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const info = {
      fcmToken: fcmToken || 'Not generated',
      authToken: localStorage.getItem('token') ? 'Present' : 'Missing',
      apiUrl: process.env.REACT_APP_API_BASE_URL,
      notificationPermission: Notification.permission,
      notificationCount: notifications.length,
      unreadCount,
    };
    setDebugInfo(info);
  }, [fcmToken, notifications, unreadCount]);

  const testFetch = async () => {
    try {
      console.log('🧪 Testing notification fetch...');
      await fetchNotifications(1, false);
      await fetchUnreadCount();
      console.log('✅ Fetch successful!');
    } catch (error) {
      console.error('❌ Fetch failed:', error);
    }
  };

  return (
    <div className='fixed bottom-4 right-4 bg-white border-2 border-blue-500 rounded-lg shadow-xl p-4 max-w-md z-[9999]'>
      <h3 className='font-bold text-lg mb-2'>🔧 Notification Debug</h3>

      <div className='space-y-2 text-sm mb-4'>
        <div>
          <strong>FCM Token:</strong>
          <span className='text-xs block truncate'>{debugInfo.fcmToken}</span>
        </div>
        <div>
          <strong>Auth Token:</strong> {debugInfo.authToken}
        </div>
        <div>
          <strong>API URL:</strong> {debugInfo.apiUrl}
        </div>
        <div>
          <strong>Permission:</strong> {debugInfo.notificationPermission}
        </div>
        <div>
          <strong>Notifications:</strong> {debugInfo.notificationCount}
        </div>
        <div>
          <strong>Unread:</strong> {debugInfo.unreadCount}
        </div>
        <div>
          <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
        </div>
      </div>

      <Button onClick={testFetch} className='w-full mb-2'>
        🔄 Refresh Notifications
      </Button>

      <div className='mt-3 p-2 bg-gray-100 rounded text-xs max-h-40 overflow-y-auto'>
        <strong>Recent Notifications:</strong>
        {notifications.length === 0 ? (
          <div className='text-gray-500 mt-1'>No notifications</div>
        ) : (
          notifications.slice(0, 3).map((n, i) => (
            <div key={i} className='border-t pt-1 mt-1'>
              <div><strong>{n.subject}</strong></div>
              <div className='text-gray-600'>{n.message}</div>
            </div>
          ))
        )}
      </div>

      <div className='mt-2 text-xs text-gray-500'>
        Check browser console for detailed logs
      </div>
    </div>
  );
};

export default NotificationDebug;
