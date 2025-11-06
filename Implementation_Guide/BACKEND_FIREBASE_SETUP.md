# Backend Firebase Configuration Setup

## Overview

The frontend now fetches Firebase configuration dynamically from the backend API instead of exposing keys in the frontend code. This ensures sensitive Firebase credentials are never exposed in the client bundle or repository.

## Architecture

```
┌─────────────────┐
│   React App     │
│  (Frontend)     │
└────────┬────────┘
         │
         │ GET /api/v1/config/firebase
         │
         ▼
┌─────────────────┐
│   Backend API   │
│  Returns config │
└────────┬────────┘
         │
         │ Config stored in .env
         │
         ▼
┌─────────────────┐
│   Firebase      │
│   Services      │
└─────────────────┘
```

## Backend Implementation Required

### 1. Create Firebase Config Endpoint

You need to create an API endpoint in your backend that returns the Firebase configuration:

**Endpoint:** `GET /api/v1/config/firebase`

**Response Format:**
```json
{
  "apiKey": "your-firebase-api-key",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project-id",
  "storageBucket": "your-project.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abcdef",
  "measurementId": "G-XXXXXXXXXX",
  "vapidKey": "your-vapid-key-here"
}
```

### 2. Backend Environment Variables

Add these to your backend's `.env` file:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
FIREBASE_APP_ID=1:your_app_id:web:xxxxx
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
FIREBASE_VAPID_KEY=your_vapid_key_here
```

### 3. Example Backend Implementation

#### Node.js/Express Example:

```javascript
// routes/config.js
const express = require('express');
const router = express.Router();

router.get('/firebase', (req, res) => {
  try {
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
      vapidKey: process.env.FIREBASE_VAPID_KEY,
    };

    // Validate that all required fields are present
    const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

    if (missingFields.length > 0) {
      return res.status(500).json({
        error: 'Firebase configuration incomplete',
        missingFields,
      });
    }

    res.json(firebaseConfig);
  } catch (error) {
    console.error('Error fetching Firebase config:', error);
    res.status(500).json({ error: 'Failed to fetch Firebase configuration' });
  }
});

module.exports = router;
```

```javascript
// app.js or index.js
const configRoutes = require('./routes/config');
app.use('/api/v1/config', configRoutes);
```

#### NestJS Example:

```typescript
// config.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('api/v1/config')
export class ConfigController {
  constructor(private configService: ConfigService) {}

  @Get('firebase')
  getFirebaseConfig() {
    return {
      apiKey: this.configService.get('FIREBASE_API_KEY'),
      authDomain: this.configService.get('FIREBASE_AUTH_DOMAIN'),
      projectId: this.configService.get('FIREBASE_PROJECT_ID'),
      storageBucket: this.configService.get('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: this.configService.get('FIREBASE_MESSAGING_SENDER_ID'),
      appId: this.configService.get('FIREBASE_APP_ID'),
      measurementId: this.configService.get('FIREBASE_MEASUREMENT_ID'),
      vapidKey: this.configService.get('FIREBASE_VAPID_KEY'),
    };
  }
}
```

## Security Considerations

### 1. Rate Limiting
Implement rate limiting on the config endpoint to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const configLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/v1/config', configLimiter);
```

### 2. CORS Configuration
Ensure CORS is properly configured to only allow your frontend domain:

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-admin-domain.com',
  credentials: true,
}));
```

### 3. Authentication (Optional but Recommended)
For additional security, you can require authentication:

```javascript
router.get('/firebase', authenticateToken, (req, res) => {
  // ... return config
});
```

### 4. Caching
Implement caching to reduce backend load:

```javascript
// Frontend already implements caching
// Backend can also add cache headers:
res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
```

## Frontend Configuration

The frontend is already configured to use this endpoint. No additional frontend changes needed.

### Frontend Files Modified:
- `src/config/firebase.ts` - Updated to fetch config from backend
- `src/services/firebaseConfigService.ts` - Service to fetch config
- `src/services/firebaseMessagingService.ts` - Service worker registration
- `public/firebase-messaging-sw.js` - Dynamic service worker

## Testing

### 1. Test Backend Endpoint

```bash
# Start your backend server
npm start

# Test the endpoint
curl http://localhost:7001/api/v1/config/firebase
```

Expected response:
```json
{
  "apiKey": "...",
  "authDomain": "...",
  ...
}
```

### 2. Test Frontend Integration

```bash
# Start frontend
npm start

# Check browser console for:
# ✅ Firebase initialized successfully
```

### 3. Test Firebase Messaging

1. Open browser console
2. Click notification permission prompt
3. Look for: `✅ FCM Token received: ...`

## Troubleshooting

### Error: "Unable to load Firebase configuration"

**Cause:** Backend endpoint not accessible or returning errors

**Solutions:**
1. Check backend server is running
2. Verify `REACT_APP_API_BASE_URL` in frontend `.env`
3. Check CORS configuration
4. Verify all Firebase env vars are set in backend

### Error: "Firebase config not found in response"

**Cause:** Backend endpoint returning empty or malformed data

**Solutions:**
1. Check backend environment variables are loaded
2. Verify endpoint is returning correct JSON structure
3. Check backend logs for errors

### Service Worker Not Registering

**Cause:** Service worker file not found or not receiving config

**Solutions:**
1. Clear browser cache and service workers
2. Check Network tab for service worker registration
3. Verify `public/firebase-messaging-sw.js` exists
4. Check service worker console for errors

## Migration from Environment Variables

If you previously had Firebase config in frontend `.env`:

1. ✅ Copy all `REACT_APP_FIREBASE_*` variables to backend `.env`
2. ✅ Remove them from frontend `.env` (keep other vars)
3. ✅ Implement backend endpoint as described above
4. ✅ Test the integration
5. ✅ Deploy backend first, then frontend

## Deployment Checklist

- [ ] Backend `.env` contains all Firebase variables
- [ ] Backend endpoint `/api/v1/config/firebase` is working
- [ ] CORS allows frontend domain
- [ ] Rate limiting is configured
- [ ] Backend is deployed and accessible
- [ ] Frontend `REACT_APP_API_BASE_URL` points to backend
- [ ] Test notification permissions in production
- [ ] Monitor backend logs for errors

## Benefits of This Approach

✅ **Security**: Firebase keys never exposed in frontend code
✅ **Flexibility**: Change Firebase config without redeploying frontend
✅ **Centralized**: Single source of truth for configuration
✅ **Deployment**: Netlify won't block builds due to exposed keys
✅ **Environment Management**: Easier to manage different environments (dev, staging, prod)

## Next Steps

1. Implement the backend endpoint as described above
2. Add Firebase environment variables to backend
3. Test the endpoint locally
4. Deploy backend
5. Test frontend integration
6. Deploy frontend

If you encounter any issues, check the browser console and backend logs for detailed error messages.
