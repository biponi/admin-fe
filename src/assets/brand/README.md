# Brand Assets Architecture

This directory houses the unified brand logo and icon assets for the application, based on the Bumblebee Glassmorphism design system.

## File Organization & Purposes

| File | Resolution | Format | Purpose & Best Use Case |
|---|---|---|---|
| `logo.png` | 512x512 | PNG (RGBA) | Master brand logo, high-resolution UI hero headers, invoices, modal branding |
| `logo-lg.png` | 512x512 | PNG (RGBA) | Large display, authentication screens, high-DPI retina screens |
| `logo-md.png` | 192x192 | PNG (RGBA) | Standard app headers, drawer headers, cards, system notifications |
| `logo-sm.png` | 96x96 | PNG (RGBA) | Sidebar brand switcher, navigation bars, mobile topbars & bottom navs |
| `logo-xs.png` | 48x48 | PNG (RGBA) | Compact badges, inline icons, table headers, compact avatar fallbacks |
| `logo.svg` | Scalable | SVG | High-fidelity vector rendering across all display scales |
| `favicon.ico` | Multi-size | ICO | Browser tab icon (16x16, 24x24, 32x32, 48x48, 64x64 embedded) |

## Public Web & PWA Assets (`/public`)

The public directory contains all web-facing standard assets:
- **Favicons**: `favicon.ico`, `favicon.svg`, `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png`
- **Apple Touch Icons**: `apple-touch-icon.png`, `apple-touch-icon-180x180.png`, `apple-touch-icon-152x152.png`, `apple-touch-icon-120x120.png`, `apple-touch-icon-76x76.png`, `apple-touch-icon-60x60.png`
- **PWA Manifest Icons**:
  - `pwa-64x64.png` (Standard PWA icon)
  - `pwa-192x192.png` (Standard PWA icon, transparent background)
  - `pwa-512x512.png` (High-res PWA icon, transparent background)
  - `pwa-maskable-192x192.png` (Safe-zone padded with solid canvas for Android adaptive icons)
  - `pwa-maskable-512x512.png` (Safe-zone padded with solid canvas for Android adaptive icons)
  - `masked-icon.svg` (Safari pinned tabs & maskable vector)
- **Notification & SW**: `logo192.png`, `logo512.png` (Push notifications & Service Worker)

## Usage in React

```typescript
import { BrandLogo, BrandLogoSm, BrandLogoSvg } from '@/assets/brand';

// Or via contents utility:
import { BrandLogo } from '@/utils/contents';
```
