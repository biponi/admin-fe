/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_URL: string

  // Firebase Configuration
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_VAPID_KEY: string

  // Notification Features
  readonly VITE_ADD_NOTIFICATION: string

  // Brand Configuration
  readonly VITE_BRAND_NAME: string
  readonly VITE_BRAND_SHORT_NAME: string
  readonly VITE_BRAND_COMPANY_NAME: string
  readonly VITE_BRAND_WEBSITE: string
  readonly VITE_BRAND_EMAIL: string
  readonly VITE_BRAND_ADDRESS: string
  readonly VITE_BRAND_PHONE: string
  readonly VITE_BRAND_LOGO_URL: string
  readonly VITE_BRAND_INVOICE_LOGO_URL: string
  readonly VITE_BRAND_PACKING_LOGO_URL: string
  readonly VITE_BRAND_ICON_URL: string

  // Node environment (works same in Vite)
  readonly NODE_ENV: 'development' | 'production' | 'test'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}