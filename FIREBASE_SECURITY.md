# Firebase Security Configuration

## Overview

This project uses a secure approach to manage Firebase credentials. Firebase keys are no longer hardcoded in the service worker file. Instead, they are:

1. **Stored in `.env` file** (never committed to git)
2. **Auto-injected at build time** into the service worker
3. **Validated before build** to ensure all required variables are present

## Setup Instructions

### 1. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then edit `.env` and add your actual Firebase credentials:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_actual_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
REACT_APP_FIREBASE_VAPID_KEY=your_vapid_key
```

### 2. Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on ⚙️ Settings → Project Settings
4. Scroll to "Your apps" section
5. Select or create a Web app
6. Copy all the config values to your `.env` file

### 3. Run the Application

The service worker will be automatically generated when you start or build:

```bash
# Development
npm start
# or
yarn start

# Production Build
npm run build
# or
yarn build
```

## How It Works

### Build-Time Generation

1. **Before build/start**: The `scripts/generate-sw.js` script runs automatically
2. **Reads environment variables**: Gets Firebase config from `.env`
3. **Validates required values**: Ensures all necessary keys are present
4. **Generates service worker**: Creates `public/firebase-messaging-sw.js` with actual values
5. **Continues with build**: React build process proceeds normally

### File Structure

```
admin-fe/
├── .env                              # Your actual credentials (gitignored)
├── .env.example                      # Template with placeholder values
├── scripts/
│   └── generate-sw.js               # Script to generate service worker
├── public/
│   ├── firebase-messaging-sw.js     # Auto-generated (gitignored)
│   └── firebase-messaging-sw.template.js  # Template file
└── FIREBASE_SECURITY.md             # This file
```

## Security Best Practices

### ✅ DO:
- Keep your `.env` file secure and never commit it
- Use different Firebase projects for dev/staging/production
- Regenerate keys if they're accidentally exposed
- Set up Firebase App Check for additional security
- Configure Firebase Security Rules properly

### ❌ DON'T:
- Never commit `.env` file to git
- Never hardcode credentials in source files
- Never share your `.env` file publicly
- Never use production credentials in development

## Troubleshooting

### Missing Environment Variables Error

If you see an error like:

```
❌ Missing required Firebase environment variables:
   - REACT_APP_FIREBASE_API_KEY
   - REACT_APP_FIREBASE_PROJECT_ID
```

**Solution**: Make sure your `.env` file exists and contains all required variables.

### Service Worker Not Updating

If changes to Firebase config don't reflect:

```bash
# Manually regenerate the service worker
npm run generate-sw
# or
yarn generate-sw
```

### Build Fails

1. Check that all environment variables are set correctly in `.env`
2. Ensure no syntax errors in `.env` (no quotes needed for values)
3. Restart your dev server after changing `.env`

## CI/CD Integration

### GitHub Actions

Add Firebase secrets to your repository:

```yaml
# .github/workflows/deploy.yml
- name: Build
  env:
    REACT_APP_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
    REACT_APP_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
    REACT_APP_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
    REACT_APP_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
    REACT_APP_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
    REACT_APP_FIREBASE_MEASUREMENT_ID: ${{ secrets.FIREBASE_MEASUREMENT_ID }}
  run: npm run build
```

### Netlify/Vercel

Add environment variables in your hosting platform's dashboard:

1. Go to Site Settings → Environment Variables
2. Add each `REACT_APP_FIREBASE_*` variable
3. Redeploy your site

## Additional Security

### Firebase App Check

Add App Check for additional protection:

```javascript
// In your main app
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('your-recaptcha-site-key'),
  isTokenAutoRefreshEnabled: true
});
```

### Security Rules

Ensure your Firebase Security Rules are properly configured:

```javascript
// Firestore Rules Example
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Support

For issues or questions:
1. Check this documentation first
2. Review Firebase documentation: https://firebase.google.com/docs
3. Contact the development team

---

**Last Updated**: 2025-01-06
**Version**: 1.0.0
