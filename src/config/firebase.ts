import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { fetchFirebaseConfig } from '../services/firebaseConfigService';

// Initialize Firebase app and messaging (will be set after config is fetched)
let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let firebaseConfigCache: any = null;
let initPromise: Promise<void> | null = null;

/**
 * Initialize Firebase with config from backend
 */
const initializeFirebase = async (): Promise<void> => {
  if (app) return; // Already initialized

  try {
    // Fetch config from backend
    const config = await fetchFirebaseConfig();
    firebaseConfigCache = config;

    // Initialize Firebase
    app = initializeApp(config);

    // Initialize Messaging
    try {
      messaging = getMessaging(app);
    } catch (error) {
      console.error('Firebase messaging not supported:', error);
    }

    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
};

/**
 * Get Firebase config (cached or fetch from backend)
 */
export const getFirebaseConfig = async () => {
  if (firebaseConfigCache) return firebaseConfigCache;
  await ensureFirebaseInitialized();
  return firebaseConfigCache;
};

/**
 * Ensure Firebase is initialized before use
 */
export const ensureFirebaseInitialized = async (): Promise<void> => {
  if (app) return; // Already initialized

  // If initialization is in progress, wait for it
  if (initPromise) {
    await initPromise;
    return;
  }

  // Start initialization
  initPromise = initializeFirebase();
  await initPromise;
};

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    // Ensure Firebase is initialized
    await ensureFirebaseInitialized();

    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return null;
    }

    // Check if messaging is initialized
    if (!messaging) {
      console.log('Firebase messaging not initialized');
      return null;
    }

    // Get config for VAPID key
    const config = await getFirebaseConfig();
    if (!config?.vapidKey) {
      console.error('VAPID key not found in Firebase config');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Notification permission granted');

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: config.vapidKey
      });

      if (token) {
        console.log('FCM Token:', token);
        return token;
      } else {
        console.log('No registration token available');
        return null;
      }
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

/**
 * Handle foreground messages
 */
export const onMessageListener = async () => {
  await ensureFirebaseInitialized();

  return new Promise((resolve) => {
    if (!messaging) {
      return;
    }

    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      resolve(payload);
    });
  });
};

export { messaging, app };
export default app;
