// Firebase Cloud Messaging Service Worker (Dynamic Config)
// This service worker receives Firebase config from the main app at runtime

// Import Firebase scripts
importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js'
);

// Firebase config - will be set dynamically
let firebaseConfig = null;
let messaging = null;

// Listen for config from main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    console.log('📥 Received Firebase config from main app');

    firebaseConfig = event.data.config;

    // Initialize Firebase with received config
    if (!messaging && firebaseConfig) {
      try {
        firebase.initializeApp(firebaseConfig);
        messaging = firebase.messaging();
        console.log('✅ Firebase initialized in service worker');

        // Set up background message handler
        setupMessageHandler();
      } catch (error) {
        console.error('❌ Error initializing Firebase in service worker:', error);
      }
    }
  }
});

// Setup background message handler
function setupMessageHandler() {
  if (!messaging) return;

  messaging.onBackgroundMessage((payload) => {
    console.log('📬 Received background message:', payload);

    const notificationTitle =
      payload.notification?.title ||
      payload.data?.subject ||
      'New Notification';

    const notificationOptions = {
      body:
        payload.notification?.body ||
        payload.data?.message ||
        'You have a new notification',
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: payload.data?.notificationId || 'notification',
      data: payload.data,
      requireInteraction: false,
      vibrate: [200, 100, 200],
    };

    // Show notification
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);

  event.notification.close();

  // Open app or navigate to specific page
  const urlToOpen = event.notification.data?.actionUrl || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }

        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('🚀 Service worker activated');
  event.waitUntil(clients.claim());
});

console.log('📝 Firebase Messaging Service Worker loaded (Dynamic Config Mode)');
