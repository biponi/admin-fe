/**
 * Firebase Messaging Service
 * Handles Firebase Cloud Messaging registration and setup
 */

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirebaseConfig } from "./firebaseConfigService";

let firebaseApp: FirebaseApp | null = null;
let messaging: any = null;

/**
 * Initialize Firebase and register service worker
 */
export const initializeFirebaseMessaging = async () => {
  try {
    // Get Firebase config from backend
    const config = await getFirebaseConfig();

    // Initialize Firebase app
    if (!firebaseApp) {
      firebaseApp = initializeApp(config);
    }

    // Check if service workers are supported
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Workers are not supported in this browser");
      return null;
    }

    // Register service worker with Firebase config
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" }
    );

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;

    // Send Firebase config to service worker
    if (registration.active) {
      registration.active.postMessage({
        type: "FIREBASE_CONFIG",
        config: config,
      });
    }

    // Initialize messaging
    messaging = getMessaging(firebaseApp);

    console.log("✅ Firebase Messaging initialized successfully");
    return messaging;
  } catch (error) {
    console.error("❌ Error initializing Firebase Messaging:", error);
    return null;
  }
};

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<
  string | null
> => {
  try {
    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    // Initialize messaging if not already done
    if (!messaging) {
      await initializeFirebaseMessaging();
    }

    if (!messaging) {
      console.error("Messaging not initialized");
      return null;
    }

    // Get Firebase config for VAPID key
    const config = await getFirebaseConfig();

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: config.vapidKey,
    });

    if (token) {
      return token;
    } else {
      console.log("No registration token available");
      return null;
    }
  } catch (error) {
    console.error("Error getting notification permission:", error);
    return null;
  }
};

/**
 * Listen for foreground messages
 */
export const onMessageListener = (callback: (payload: any) => void) => {
  if (!messaging) {
    console.error(
      "Messaging not initialized. Call initializeFirebaseMessaging first."
    );
    return;
  }

  return onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);
    callback(payload);
  });
};

/**
 * Get the current FCM token
 */
export const getCurrentToken = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      await initializeFirebaseMessaging();
    }

    if (!messaging) {
      return null;
    }

    const config = await getFirebaseConfig();
    const token = await getToken(messaging, {
      vapidKey: config.vapidKey,
    });

    return token || null;
  } catch (error) {
    console.error("Error getting current token:", error);
    return null;
  }
};
