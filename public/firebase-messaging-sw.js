// Import Firebase scripts
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Firebase config (replace with your actual config values)
// Note: These values should match your .env file
const randomConfig = {
  apiKey: "AIzaSyAXELs62hTNVbpvh0KNWIoLZ_WUWlFjjO8",
  authDomain: "prior-website.firebaseapp.com",
  projectId: "prior-website",
  storageBucket: "prior-website.firebasestorage.app",
  messagingSenderId: "44621397665",
  appId: "1:44621397665:web:adc30500e3ce6ee2f3bae0",
  measurementId: "G-YYGTZPDKPM",
};

// Initialize Firebase in service worker
firebase.initializeApp(randomConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);

  const notificationTitle =
    payload.notification?.title || payload.data?.subject || "New Notification";
  const notificationOptions = {
    body:
      payload.notification?.body ||
      payload.data?.message ||
      "You have a new notification",
    icon: "/logo192.png", // Your app icon
    badge: "/logo192.png", // Small badge icon
    tag: payload.data?.notificationId || "notification",
    data: payload.data,
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  // Open app or navigate to specific page
  const urlToOpen = event.notification.data?.actionUrl || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
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
