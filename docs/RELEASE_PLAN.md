# Release Plan — Admin FE v4.0.0

**Release version:** 4.0.0
**Branch:** `stage`
**Scope:** commits `beb5d73` (v3.4.9), `aa44f1b` (v3.5.1), `cddc335` (v3.6.1) + all uncommitted working-tree changes (v4.0.0)
**Backend dependency:** `biponi-express` — a coordinated backend deploy is **required**. Several frontend features will not work (and some will break) without it.

---

## 1. What ships in this release

| Area | Since | Summary |
|---|---|---|
| Invoice totals fix | 3.4.9 | Grand total now includes delivery charge and subtracts discount |
| Activity Log | 3.5.1 | Admin audit feed, per-user timeline, CSV export |
| Delivery locations service | 3.6.1 | Server-managed zones/districts/delivery charges; Location Settings page; Quantity Timeline |
| Fraud management | 4.0.0 | Customer risk profiles, fraud group (block list), risk analysis |
| Prepayment rules | 4.0.0 | Advance-payment rules + order-creation enforcement modal |
| Pending orders | 4.0.0 | Monitor for bKash-initiated orders awaiting payment (TTL) |
| bKash transaction logs | 4.0.0 | Payment event log browser with per-payment timeline |
| Mobile UI overhaul | 4.0.0 | Material-style mobile component kit; mobile layouts across major pages |
| Weather UI | 4.0.0 | Header date/time/weather pill, sidebar weather backdrops, rain warning |
| Permissions hardening | 4.0.0 | Public routes now permission-guarded; "own orders only" restriction |
| Product meta data | 4.0.0 | Product/variant meta key-values, meta filters, meta search |
| Dashboard & analytics | 4.0.0 | Dashboard v2 redesign, product analytics redesign, inventory health |
| Notifications revamp | 4.0.0 | Backend-driven FCM config (SW 12.5.0), notification detail modal, leak fix |
| Branding / PWA | 4.0.0 | New icon set, local logo assets, expanded PWA manifest |

The major version bump (3.x → 4.0.0) is justified by **breaking backend contract changes** — see §4.

---

## 2. Release order (dependency chain)

Deploy in this order. Do not deploy the frontend before the backend.

```
1. Deploy backend (biponi-express) with all new endpoints + contract changes
2. Run the locations seed migration (§3.1)
3. Run the createdByUserId order backfill (§3.2)
4. Grant new role permissions (§3.4)
5. Deploy frontend (Netlify: yarn build → publish build/)
6. Verify with the smoke test checklist (§7)
```

### Step-by-step checklist

- [ ] **B1.** Deploy `biponi-express` containing: `/api/v1/fraud/*`, `/api/v1/pending-order/`, `/api/v1/prepayment-rule/*` (+ `/evaluate`), `/api/v1/bkash-transaction/*`, `/api/v1/weather/current`, `/api/v1/location/*`, `/api/v1/config/firebase`, `/api/v1/product/inventory-health`, `/api/v1/product/stock-timeline/*`, `/admin/audit/activity*`
- [ ] **B2.** Ship backend contract changes: `riskLevel` vocabulary `green`/`yellow`/`red` (was `low`/`medium`/`high`), inventory report field rename `lastPurchasedAt` → `lastSaleAt`, `searchProducts` accepting optional `metaFilters[]`/`metaSearch` (400 when none supplied), `register-token` without `topics[]`, removal of `POST /divisions` from admin use
- [ ] **B3.** Backfill `createdByUserId` on existing orders (§3.2)
- [ ] **F1.** Run locations seed: `node scripts/extract-locations.mjs` from admin-fe, then seed the backend from `biponi-express/scripts/data/bd-locations.json` (§3.1)
- [ ] **F2.** Set any new env vars on Netlify (§3.5 — all optional)
- [ ] **F3.** Bump `package.json` to `4.0.0`, commit the working tree, merge `stage` → `main`, push → Netlify build
- [ ] **P1.** Grant role permissions in Role Management for the new pages/actions (§3.4)
- [ ] **V1.** Run the smoke test checklist (§7)

---

## 3. Migration steps

### 3.1 Delivery service — locations seed (REQUIRED for server-driven delivery charges)

The frontend no longer hardcodes Bangladesh delivery-charge tables. All order forms
(`src/pages/order/customerInformation.tsx`, `src/pages/order/editOrderCustomer.tsx`,
`src/pages/order/v2-components/ShippingForm.tsx`, `src/pages/package/EditOrderSheet.tsx`)
resolve charges via `src/utils/deliveryCharge.ts` in this order:

1. Live API `GET /api/v1/location/charge?district=&division=`
2. Cached locations tree (5-min TTL, `src/hooks/useLocations.ts`)
3. Legacy hardcoded tables (still shipped as fallback)
4. Flat ৳150

**Migration script — `scripts/extract-locations.mjs`** (already written, one-off):

```bash
# from admin-fe/
node scripts/extract-locations.mjs
```

- Reads `BDDivisions`, `BDDistrictList`, `BDDeliveryCharge` out of `src/utils/contents.tsx`
- Writes `../../biponi-express/scripts/data/bd-locations.json`
- The backend repo seeds its locations collection from that JSON

After seeding, verify charge resolution:

```bash
curl "$API/api/v1/location/charge?district=Dhaka&division=Dhaka" -H "x-access-token: ..."
# expect the legacy Dhaka value (80) — not the ৳150 fallback
```

**Rollout safety:** if the backend locations service is missing or empty, the frontend silently
falls back to the legacy tables, so this migration can land after the FE deploy without user-facing
breakage — but charges will not be editable from the admin UI until it completes.

Also note: courier mapping sync (`POST /api/v1/location/courier-sync/{provider}` for
`pathao` / `carrybee`, status at `/courier-sync/{provider}/status`) should be triggered once
after seeding so courier zone IDs align.

### 3.2 Order ownership backfill (REQUIRED for "own orders only" permissions)

Role permissions now support an `ownOnly: string[]` array; for orders, ownership is determined by
`order.createdByUserId` (Sequelize id of the panel user who created the order,
`src/utils/orderPermission.ts`).

**The backend must backfill `createdByUserId` on existing orders.** Orders with no known creator
(customer-placed or un-backfilled) never count as "own" — until backfill, an own-only restricted
user will see **zero** historical orders. Backfill before enabling any own-only restriction on
Order for a role.

### 3.3 Breaking contract changes (ship in the same window as backend)

| Change | Old | New | Files |
|---|---|---|---|
| Fraud `riskLevel` | `low` / `medium` / `high` | `green` / `yellow` / `red` | `src/pages/order/components/OrderDetails.tsx`, `src/api/fraud.ts` |
| Inventory report fields | `lastPurchasedAt` | `lastSaleAt` (nullable, + `neverSold`) | `src/api/inventoryReport.ts`, `src/utils/inventoryReportUtils.ts` |
| `searchProducts` body | `query` required | `query` optional; `metaFilters[]` / `metaSearch`; backend 400s if none set | `src/api/index.ts` |
| Notification register | `topics[]` sent | no topics (server-side targeting) | `src/notification/notificationService.ts` |
| Divisions | creatable from admin UI | read-only (divisions no longer created from FE) | `src/api/location.ts`, `src/pages/settings/LocationSettings.tsx` |

A mismatch on the first two will visibly corrupt the fraud badges and inventory reports —
**backend and frontend must deploy together** for these.

### 3.4 Role permission grants (post-deploy, via Role Management UI)

New permission keys introduced in `src/utils/permissions.ts`:

| Page / action | Key | Suggested grant |
|---|---|---|
| Fraud | `Fraud: view, manage, block` | Admin + Manager |
| bKash Transactions | `BkashTransaction: view` | Admin |
| Pending Orders | `PendingOrder: view` | Admin |
| Prepayment rules | `Settings → prepayment_management` | Admin |
| Locations | `Settings → locations_management` (from 3.6.1) | Admin |
| Activity Log | `Activity: view` (from 3.5.1) | Admin |
| Order actions | `Order: cancel`, `Order: update_status` | Per business policy |
| Own-only orders | role `ownOnly: ["order"]` | Only where intended (see §3.2) |

Until granted, the new pages stay hidden from navigation — this is expected behavior.

### 3.5 New environment variables (all optional)

| Variable | Default | Purpose |
|---|---|---|
| `VITE_DEFAULT_PRODUCT_SORT` | `priority` | Default sort for Create Order product listing (`priority` \| `lastPurchased` \| `createdAt` \| `name` \| `price` \| `quantity`) |
| `VITE_WEATHER_REFRESH_MINUTES` | `20` | Header weather pill refresh interval |
| `VITE_RAIN_WARNING_DURATION_SECONDS` | `60` | How long the rain-warning banner stays visible |

### 3.6 Firebase / notifications behavior change

`public/firebase-messaging-sw.js` no longer hardcodes Firebase credentials:
- Firebase compat SDK bumped 9.0.0 → **12.5.0** (CDN, not an npm dependency)
- The SW stays uninitialized until the app postMessages `FIREBASE_CONFIG`, fetched from the backend at `GET /api/v1/config/firebase` (`src/services/firebaseConfigService.ts`)
- `netlify.toml` already serves the SW with `max-age=0`, so no cache purge is needed — but users with a long-cached old SW may need one hard refresh before background notifications resume.

### 3.7 Client-side state

No localStorage key renames. `SettingsContext` merges new fields (`theme: "default"`,
`sidebarWeatherStyle`, `oneko*`, `prepaymentSuggestion` store fields) with existing saved
settings. **Default theme for fresh installs changed from `blue` to `default`** (the new neutral
light sidebar); existing users keep their saved theme.

---

## 4. Scripts inventory

| Script | Status | Purpose |
|---|---|---|
| `scripts/extract-locations.mjs` | Active (one-off migration) | Extracts BD divisions/districts/charges → backend seed JSON. See §3.1. |
| `scripts/generate-brand-assets.py` | Already applied | Generated the favicon/PWA icon suite in `public/` from `src/assets/icon-set/`. Rerun only if brand assets change. |
| `scripts/build-electron.js` | Active | esbuild bundle of `electron/main.ts` + `preload.ts` for desktop builds (`yarn build:electron`). |
| `update-brand.sh` | Historical | One-off Biponi→BRAND_CONFIG replace; references deleted files. Do not run. |

---

## 5. Deployment targets

- **Web:** Netlify — `netlify.toml` runs `yarn build`, publishes `build/`, Node 22. SPA redirects and immutable asset caching already configured; SW served uncached.
- **Desktop (Electron):** `yarn electron:build` / `electron:dist` — window icon now set from `public/favicon.ico`; app name "XRN Admin" (`com.xrn.admin`). Distribute after the web deploy is verified.
- **No new npm dependencies** in 4.0.0 (dnd-kit deps arrived in 3.6.1; Firebase SW uses CDN 12.5.0). `yarn install` is sufficient.

---

## 6. Rollback plan

- **Frontend:** stateless static deploy on Netlify — instant rollback to the previous build.
- **Backend-coupled changes:** the `riskLevel` vocabulary and `lastSaleAt` rename mean a backend rollback requires a matching frontend rollback. Treat FE+BE as one deploy unit.
- **Locations service:** safe to leave forward-deployed on rollback — the frontend falls back to legacy charge tables automatically.
- **Firebase SW:** rollback restores the hardcoded-config SW; no data implications.
- **Data:** the only data migration is additive (`createdByUserId` backfill, locations seed) — no destructive schema changes in this repo.

---

## 7. Verification / smoke test checklist

After deploy, verify with an admin account (and repeat key checks with a restricted role):

- [ ] Login works; refresh-token flow intact
- [ ] Create Order: delivery charge auto-resolves to the server value for Dhaka (80) — not 150
- [ ] Settings → Locations: zones drag-reorder and save; district list loads from API
- [ ] `/fraud`: dashboard loads, high-risk list renders, risk badges show green/yellow/red on order details
- [ ] `/settings/prepayment-rules`: create a rule; Create Order for a red-risk customer shows the prepayment banner; typing "yes" in the warning modal proceeds
- [ ] `/pending-orders`: list loads with `expiresAt` countdown
- [ ] `/bkash-transactions`: log list + per-payment timeline opens
- [ ] `/activity`: feed + stats + CSV export download
- [ ] Product Details → Quantity Timeline tab renders events
- [ ] Inventory reports render with `lastSaleAt` data (no blank "last sale" columns)
- [ ] Product meta: add meta to a product/variant, filter product list by meta, search in Create Order
- [ ] Notifications: foreground toast + background push arrive (SW 12.5.0, backend config); notification detail modal opens
- [ ] Header shows date/time/weather pill (with weather backend live); rain warning appears when triggered
- [ ] Mobile (<768px): bottom tabs, order list cards, order details tree, bulk action bars usable
- [ ] Invoice print: grand total = subtotal + delivery − discount
- [ ] Permission check: a role without `Fraud: view` sees no Fraud nav item and gets blocked on `/fraud`
- [ ] Own-only: a role restricted to own orders sees only its own orders (after backfill)
