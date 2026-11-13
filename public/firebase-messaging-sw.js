// Firebase Messaging service worker
// Config is NOT hardcoded here — the app posts it via `FIREBASE_CONFIG`
// (see src/config/firebase.ts). Until the message arrives we stay
// uninitialized, so a wrong/stale project can never receive pushes.
importScripts(
  "https://www.gstatic.com/firebasejs/12.5.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.5.0/firebase-messaging-compat.js"
);

let messaging = null;

function initializeMessaging(config) {
  if (messaging) return messaging;
  try {
    firebase.initializeApp(config);
    messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      console.log("Received background message:", payload);

      const notificationTitle =
        payload.notification?.title || payload.data?.subject || "New Notification";
      const notificationOptions = {
        body:
          payload.notification?.body ||
          payload.data?.message ||
          "You have a new notification",
        icon: "/logo192.png",
        badge: "/logo192.png",
        tag: payload.data?.notificationId || "notification",
        data: payload.data,
        requireInteraction: false,
        vibrate: [200, 100, 200],
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });

    console.log("Firebase messaging initialized in service worker");
    return messaging;
  } catch (error) {
    console.error("Failed to initialize Firebase in service worker:", error);
    return null;
  }
}

// Receive config from the app (posted right after SW registration)
self.addEventListener("message", (event) => {
  const { type, config } = event.data || {};
  if (type === "FIREBASE_CONFIG" && config) {
    initializeMessaging(config);
  }
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  const urlToOpen = new URL(event.notification.data?.actionUrl || "/", self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus an existing window whose origin path matches the target
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
