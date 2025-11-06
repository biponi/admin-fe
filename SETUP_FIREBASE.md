# 🔥 Firebase Setup - Quick Start Guide

## Problem Solved

Previously, Firebase API keys were **hardcoded** in `public/firebase-messaging-sw.js`, exposing them in version control. This is now fixed!

## ✅ What's Changed

1. **Firebase keys are now stored in `.env`** (not committed to git)
2. **Service worker is auto-generated** at build time with your environment variables
3. **Keys are validated** before build to prevent missing configuration errors

## 🚀 Quick Setup (3 Steps)

### Step 1: Add Firebase Keys to `.env`

Open your `.env` file and add your Firebase credentials:

```env
# Add these to your .env file
REACT_APP_FIREBASE_API_KEY=AIzaSyAXELs62hTNVbpvh0KNWIoLZ_WUWlFjjO8
REACT_APP_FIREBASE_AUTH_DOMAIN=prior-website.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=prior-website
REACT_APP_FIREBASE_STORAGE_BUCKET=prior-website.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=44621397665
REACT_APP_FIREBASE_APP_ID=1:44621397665:web:adc30500e3ce6ee2f3bae0
REACT_APP_FIREBASE_MEASUREMENT_ID=G-YYGTZPDKPM
```

### Step 2: Run the App

The service worker will be automatically generated:

```bash
npm start
# or
yarn start
```

### Step 3: Verify

Check that `public/firebase-messaging-sw.js` was created automatically.

## 📝 Important Notes

### For Development Team

- ✅ `.env` file is already in `.gitignore` - safe to add real keys
- ✅ `public/firebase-messaging-sw.js` is auto-generated - don't edit manually
- ✅ Keys are automatically injected before each build
- ✅ Template file `firebase-messaging-sw.template.js` is for reference only

### For New Team Members

1. Ask team lead for Firebase credentials
2. Copy them to your `.env` file
3. Run `npm start` - that's it!

### For CI/CD

Add Firebase environment variables to your CI/CD secrets:
- GitHub Actions → Repository Secrets
- Netlify/Vercel → Environment Variables Dashboard

## 🔒 Security Benefits

| Before | After |
|--------|-------|
| ❌ Keys in git history | ✅ Keys in `.env` (gitignored) |
| ❌ Exposed in public repo | ✅ Never committed |
| ❌ Manual key management | ✅ Auto-generated at build |
| ❌ Easy to forget to update | ✅ Validated before build |

## 🆘 Troubleshooting

### "Missing required Firebase environment variables" error

**Fix**: Add all required variables to your `.env` file. Check `.env.example` for the list.

### Service worker not updating

```bash
# Manually regenerate
npm run generate-sw
```

### Build fails after pulling latest code

```bash
# Make sure you have all required env vars
npm run generate-sw
npm start
```

## 📚 More Information

See [FIREBASE_SECURITY.md](./FIREBASE_SECURITY.md) for detailed documentation.

---

**Last Updated**: 2025-01-06
