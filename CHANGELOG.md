# Changelog

All notable changes to the admin panel frontend are documented here.

## Version lineage of this release

The current release (**4.0.0**) ships everything from **3.4.9** onward in one deployment:

| Version | Commit | Date | Theme |
|---|---|---|---|
| 3.4.9 | `beb5d73` | 2026-10-20 | Invoice grand-total fix |
| 3.5.1 | `aa44f1b` | 2026-10-20 | Activity Log (audit trail) |
| 3.6.1 | `cddc335` | 2026-11-06 | Delivery locations service, Location Settings, Quantity Timeline |
| 4.0.0 | *(working tree)* | 2026-11-13 | Fraud, prepayment, pending orders, bKash logs, mobile UI, permissions, product meta, notifications, rebrand |

Release/migration details: [`docs/RELEASE_PLAN.md`](docs/RELEASE_PLAN.md) · Management summary:
[`docs/MANAGEMENT_RELEASE_NOTES.md`](docs/MANAGEMENT_RELEASE_NOTES.md)

---

## [4.0.0] — 2026-11-13

Major version bump: contains breaking backend contract changes (risk-level vocabulary, inventory
report field rename, guarded routes). Backend `biponi-express` must deploy first — see
[`docs/RELEASE_PLAN.md`](docs/RELEASE_PLAN.md).

### Added

#### Fraud management
- New Fraud Management page at `/fraud` (admin + manager): risk dashboard, high-risk/medium-risk/recently-flagged customer lists, phone-number search, customer risk detail sheet, and fraud-group tabs.
- New API client `src/api/fraud.ts` against `/api/v1/fraud`: `dashboard`, `high-risk`, `medium-risk`, `recently-flagged`, `search`, `customer/:phone`, `fraud-group` (list/add/remove), `analyze-customer/:phone`, `analyze-all`, risk-level override, notes, report export.
- New components `src/components/fraud/`: `RiskBadge`, `BlockedBadge`, `FraudDetailPanel`, `RiskOverrideDialog`.
- Order details now show risk badges and blocked-customer state.
- **Backend contract:** `riskLevel` is now `green` / `yellow` / `red` (previously `low` / `medium` / `high`).
- New permissions: `Fraud: view, manage, block`.

#### Prepayment rules (advance payment)
- New settings page `/settings/prepayment-rules` with CRUD for rules (permission `settings:prepayment_management`).
- New API client `src/api/prepaymentRule.ts` against `/api/v1/prepayment-rule` incl. `POST /evaluate`.
- Rule model: bases `delivery_charge` | `percentage` | `fixed` | `full_amount`; conditions on zones, order total range, risk levels (green/yellow/red), campaign products.
- Create Order flow: advisory banner and a typed-confirmation `PrepaymentWarningModal` when the required advance is not collected (`src/pages/order/components/PrepaymentWarningModal.tsx`, `preview.tsx`, `customerInformation.tsx`, `createOrderLayoutStore.ts`).

#### Pending orders
- New read-only page `/pending-orders` monitoring bKash-initiated orders awaiting payment, with statuses `awaiting_payment | converted | cancelled | payment_failed | product_unavailable` and `expiresAt` TTL.
- New API client `src/api/pendingOrder.ts` (`GET /api/v1/pending-order/`).
- New permission: `PendingOrder: view`.

#### bKash transaction logs
- New page `/bkash-transactions` (admin): filterable event log, per-payment timeline sheet, stats.
- New API client `src/api/bkashTransaction.ts`: `GET /api/v1/bkash-transaction/`, `/payment/:paymentId`, `/stats`.
- New permission: `BkashTransaction: view`.

#### Mobile UI overhaul
- New Material-style mobile component kit `src/components/mobile/` (18 files): `MobilePage`, `MobileListCard`, `MobileBottomTabs`, `MobileFilterSheet`, ripple, etc.
- New Tailwind `mobile:` breakpoint (max-width 767px) aligned with `useIsMobile()` (`tailwind.config.js`).
- Mobile presentations added across: Order list/details, Package details, Daily Report, User management, Role pages, Location Settings, product pages, commission, purchase orders, reserve store, campaign/blog/bulk-communication pages.
- Bulk-action bars repositioned above the bottom tab bar.

#### Weather-themed UI
- New authenticated weather API client `src/api/weather.ts` (`GET /api/v1/weather/current?lat=&lon=`; WMO `weatherCode`, `rainProbability`, `rainWarning`).
- Header date/time/weather pill (`src/components/HeaderDateTimeWeather.tsx`) with rain-warning banner.
- Sidebar weather backdrops (`src/components/weather/`: image crossfade or animated CSS scene) and weather-based sidebar text ink; `WeatherContext`, `src/config/weather-theme.ts`, `src/lib/weather-scene.ts`.
- Settings toggles: weather style, refresh interval; env `VITE_WEATHER_REFRESH_MINUTES` (default 20), `VITE_RAIN_WARNING_DURATION_SECONDS` (default 60).

#### Permissions hardening
- `PublicRoutes.tsx`: previously unprotected routes (products, category, order, campaign CRUD) are now wrapped in `ProtectedRoute` with per-page required actions.
- New **own-only** role restriction: role permission objects support `ownOnly: string[]`; order ownership resolved via `order.createdByUserId` (`src/utils/orderPermission.ts`, `useRoleCheck` `canModifyOrder`/`isOwnOnlyForPage`). Requires backend `createdByUserId` backfill — orders without a known creator never count as "own".
- Role create/edit/view pages: accordion permission matrix with own-only toggles.
- New permission keys: `Order: cancel`, `Order: update_status`; `OWN_ONLY_ELIGIBLE` map; `VITE_DEFAULT_PRODUCT_SORT` env for product listing default sort.

#### Product meta data
- Admin-defined key/value meta at product and variant level: `MetaEntriesEditor`, `BulkVariantMetaPanel`.
- Meta filtering in product listings (`MetaFilterPopover`, `MobileMetaFilterSheet`, `ProductMetaDetail`).
- `searchProducts` (`src/api/index.ts`) now accepts optional `metaFilters[]` (`{key, value?, min?, max?}`) and `metaSearch`; `query` is optional — backend returns 400 if none of query/metaFilters/metaSearch is set.
- `searchActiveProducts` (`src/api/product.ts`) gains optional `sortBy`/`sortOrder`.

#### Dashboard & analytics redesign
- Dashboard v2 (`SimpleDashboardPage`) rewritten on `dashboardTheme.ts` tokens with new activity panels and breakdown rings.
- Product analytics page redesigned on the Claude design language (`src/lib/claude.ts`, `claudeChart.tsx`) with desktop/mobile split and export menu.
- New inventory health card backed by `GET /api/v1/product/inventory-health` (healthy/low/out-of-stock, fast/slow movers, dead stock).
- Inventory reports refactored onto a shared report scaffold (`reportScaffold/`, `useInventoryReportsState.ts`) with numeric formatting fixes.
- **Backend contract:** report fields renamed `lastPurchasedAt` → `lastSaleAt` (nullable, plus `neverSold`); `TopSellingProduct` gains nullable `sku`/`categoryId`/`totalStock`, new `productId`, `categoryName`, `netRevenue`; new `discountPercent` / `effectiveDiscountAmount`; `CategoryPerformance.netRevenue`.

#### Notifications revamp
- `NotificationDetailModal` for full-message view; shared topic styling table `src/notification/notificationTopics.ts`.
- Foreground message handling consolidated in `useNotifications` (fixes duplicate handling); FCM listener leak fixed (`onMessageListener` → `onForegroundMessage` returning unsubscribe); 5-minute unread polling.
- `firebase-messaging-sw.js`: Firebase compat SDK 9.0.0 → **12.5.0**; hardcoded Firebase config removed — SW initializes from a `FIREBASE_CONFIG` postMessage sourced from `GET /api/v1/config/firebase` (`src/services/firebaseConfigService.ts`).
- `register-token` no longer sends `topics[]` (server-side topic targeting).

#### Branding / PWA
- New favicon/apple-touch/maskable PWA icon suite generated by `scripts/generate-brand-assets.py`; expanded PWA manifest in `vite.config.ts`.
- Brand defaults now use local assets (`/pwa-512x512.png`, `/favicon-32x32.png`) instead of Cloudinary URLs; `logo` added to `BRAND_CONFIG`; PDF/thermal invoice/report generators render local logos.
- Electron window icon set from `public/favicon.ico`.
- New shared `PageHeader` component adopted across pages; `team-switcher` component and `oneko` cursor-cat easter egg (settings-gated).

### Changed
- Delivery page header, order forms, package pages, commission, purchase orders, reserve store, role/user pages migrated to the new layout primitives and mobile classes.
- Default settings theme for **fresh installs** changed `blue` → `default` (new neutral light sidebar); saved user themes are preserved. New settings fields merge with existing localStorage data (no key renames).
- Division/district dropdowns across order forms now source from the server locations tree (`useLocations`), falling back to legacy constants.

### Removed
- `src/components/MobileDrawerNav.tsx` and `src/components/mobile-bottom-nav.tsx` (replaced by the new mobile kit).
- `createDivision` API usage — divisions are no longer created from the admin UI; the districts tab receives zones.
- `courier_shipped` / `courier_delivered` emoji maps in favor of the shared notification topic table.

### Security
- All routes permission-guarded (see Permissions hardening).
- Firebase web config no longer shipped inside the service worker source.

---

## [3.6.1] — 2026-11-06

> Commit `cddc335` ("Refactor code structure…") — the message understates this; it is a feature release.

### Added
- **Server-driven delivery locations.** New API client `src/api/location.ts` against `/api/v1/location`: zones/districts/divisions CRUD, bulk district import, courier mapping sync (`/courier-sync/{provider}` for `pathao`/`carrybee` + `/status`), charge resolution (`/charge`), public locations tree.
- New cached hook `src/hooks/useLocations.ts` (5-min TTL, legacy-shape output, falls back to bundled constants on API failure).
- **Location Settings page** `/settings/locations` (permission `settings:locations_management`): drag-to-reorder zones via `@dnd-kit/core` / `@dnd-kit/sortable` / `@dnd-kit/utilities` (new dependencies).
- **Product Quantity Timeline:** new API `src/api/stockTimeline.ts` (`GET /product/stock-timeline/{productId}`, `/event/{eventId}`), hook `useStockTimeline`, and a new "Quantity Timeline" tab on Product Details (`QuantityTimelineTab`, `QuantityTimelineBoard`, `QuantityTimelineRail`).
- **Migration script** `scripts/extract-locations.mjs` — extracts `BDDivisions` / `BDDistrictList` / `BDDeliveryCharge` from `src/utils/contents.tsx` into `biponi-express/scripts/data/bd-locations.json` for backend seeding.
- "Locations" entry in the user dropdown menu.

### Changed
- **Delivery charges are now server-driven.** `src/utils/deliveryCharge.ts` resolves charges via API → cached tree → legacy tables → ৳150. Hardcoded per-district charge logic removed from `customerInformation.tsx`, `editOrderCustomer.tsx`, `ShippingForm.tsx`, `EditOrderSheet.tsx`; `OrderSummary` gains optional `deliveryCharge`.
- `GeoMapChart` district view switched from a table to a card grid (customers/revenue/orders with share bars).

### Backend compatibility
Requires `/api/v1/location/*` and `/product/stock-timeline/*`; delivery charges degrade to legacy tables if the locations service is absent. Backend must be seeded via `extract-locations.mjs` output; roles need `locations_management`.

---

## [3.5.1] — 2026-10-20

### Added
- **Activity Log (audit trail).** New admin page `/activity` (permission `activity:view`): stat cards, activity-by-day and by-action charts, filters (date range, user, action, method, success, IP, search), paginated feed, entry detail dialog, per-user timeline drawer, server-side CSV export.
- New API layer `src/api/activityLog.ts` against `/admin/audit/activity` (feed, `stats`, `{id}`, `user/{userId}`, `export`).
- New hooks `src/hooks/useActivityLog.ts` (`useActivityLog`, `useUserTimeline`).
- "Activity Log" nav item (admin-only).

### Backend compatibility
Requires the five `/admin/audit/activity*` endpoints; admin roles need the `activity:view` grant.

---

## [3.4.9] — 2026-10-20

### Fixed
- **Invoice grand total.** `InvoiceView.tsx` (and the printable HTML generator) previously computed `subtotal = totalPrice − deliveryCharge` and displayed `Total = totalPrice`, omitting the delivery charge and any discount from the payable amount. Now `subtotal = totalPrice` (gross product subtotal) and `Total = subtotal + deliveryCharge − discount`. Display-only — no data change.
