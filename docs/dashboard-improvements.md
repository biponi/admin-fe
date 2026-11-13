# Dashboard Improvements — Suggested APIs & UI Enhancements

This doc lists datapoints the renovated dashboard (`src/pages/dashboardV2/`) cannot show today because
the API layer doesn't provide them (or provides them via a separate service). For each item:
**what's missing**, a **suggested endpoint shape**, and a **UI prompt** describing how the element
should look/behave in the dashboard's design language (reference: `src/assets/fgfg.webp` —
light-gray tiles `#EFEDEB`, white pills, orange-red accent `#E1573F`, thin-line icons).

---

## 1. Period-correct growth percentages

**Missing:** `/api/v1/dashboard/analysis` only returns `previousMonthMetrics`. When the admin picks
"Today" or "This week", the growth badge still compares against the previous *month* — misleading.

**Suggested endpoint:**

```jsonc
// GET /api/v1/dashboard/analysis (extend existing response)
{
  "orderMetrics": { ... },
  "growth": {
    "totalOrders": 9.3,        // % vs the equivalent previous period
    "totalAmount": 12.1,       // (e.g. today vs yesterday, this week vs last week)
    "totalPaid": -4.0,
    "totalRemaining": 0.8,
    "totalDeliveryCharge": 2.2,
    "totalDiscount": -1.5
  }
}
```

**UI prompt:** Each `PillStatCard` shows its growth badge as an accent-tint pill
(`bg-[#F7D9D2] text-[#E1573F]`, `▲ 9.3%` / `▼ 4.0%`, `TrendingUp/TrendingDown` at 2px stroke).
With server-computed values, remove the client-side `calculateGrowthPercentage` fallback entirely.

---

## 2. Consolidated summary endpoint

**Missing:** The dashboard composes everything from one analysis call + client transforms
(`combineDailyComparison`, `structureStatusData`). A single purpose-built payload would remove
derivation logic and let tiles render without intermediate states.

**Suggested endpoint:**

```jsonc
// GET /api/v1/dashboard/summary?startDate&endDate
{
  "cards": { "orders": 0, "amount": 0, "paid": 0, "remaining": 0,
             "purchase": 0, "returns": 0, "deliveryCharge": 0, "discount": 0 },
  "growth": { ... },                      // see item 1
  "series": {
    "ordersVsPurchases": [{ "date": "2026-11-01", "orders": 0, "purchases": 0 }],
    "statusDaily": [{ "date": "2026-11-01", "processing": 0, "completed": 0 }]
  },
  "statusCounts": [{ "status": "completed", "count": 0 }],
  "completionRate": 0                      // % — server-computed
}
```

**UI prompt:** Same layout, but tiles render instantly from `cards` with no `?? 0` fallback chains;
`completionRate` feeds the donut gauge directly.

---

## 3. Visitor / traffic analytics

**Missing:** GA4 data exists in `src/api/analytics.ts` (`analyticsAPI.getDashboard`,
`getTimeSeries`) but is a separate Firebase-backed service with its own auth/failure domain, and is
not composed into the order dashboard.

**Suggested endpoint (backend proxy):**

```jsonc
// GET /api/v1/analytics/visitors?startDate&endDate
{
  "summary": { "activeUsers": 0, "sessions": 0, "conversionRate": 0 },
  "timeseries": [{ "date": "2026-11-01", "sessions": 0, "transactions": 0 }]
}
```

**UI prompt:** A compact `PillStatCard` — label "Visitors", gray label text, big bold session count,
white circular `Users` icon. Optionally overlay sessions on the "Purchase Vs Order Amount" chart as
a dashed `#F2A992` line so traffic and sales share one timeline.

---

## 4. Recent activity feed

**Missing:** No endpoint returns a unified "what just happened" stream (order created, status
changed, user login, product updated).

**Suggested endpoint:**

```jsonc
// GET /api/v1/dashboard/activity?limit=20
{
  "items": [{
    "id": "...", "type": "order" | "user" | "product" | "payment",
    "message": "Order #1042 marked completed",
    "actor": "admin@priorbd.com", "createdAt": "2026-11-13T09:24:00Z",
    "link": "/orders/1042"
  }]
}
```

**UI prompt:** An activity-manager tile (like Top Customers): light-gray `#EFEDEB` rounded-3xl tile,
white circular `Activity` icon + bold title, filter chips as white pills (`All / Orders / Users /
Payments`, active chip = black `#111` bg + white text). Rows are white rounded-2xl sub-cards with a
colored type dot, one-line message, and a relative timestamp ("2m ago") in `#9A9A98`. Rows link to
the referenced record.

---

## 5. AI insights summary

**Missing:** No endpoint produces natural-language observations ("Paid is down 12% while orders are
up — check failed payments").

**Suggested endpoint:**

```jsonc
// GET /api/v1/dashboard/insights?startDate&endDate
{ "insights": [{ "text": "...", "severity": "info" | "warning", "metric": "totalPaid" }] }
```

**UI prompt:** A short tile with a `4px` left border in `#E1573F`, light-gray background, a white
circular `Sparkles` icon, 2–3 lines of `#1A1A1A` text, and a black pill button ("Ask more")
bottom-right.

---

## 6. Courier / delivery performance

**Missing:** `config.courier.dashboard()` exists in `src/utils/config.ts` but is not surfaced here.

**Suggested endpoint:** reuse the courier dashboard response; expose per-courier success rate:

```jsonc
{ "couriers": [{ "name": "Steadfast", "successRate": 92.4, "delivered": 0, "failed": 0 }] }
```

**UI prompt:** A second donut gauge card beside the completion-rate gauge — gray `#D9D7D4` track,
accent arc, center shows average success %, with one white pill chip per courier.

---

## 7. Deferred widgets from the reference image

Intentionally skipped in this renovation (no meaningful data source yet). Prompts for if/when they
get APIs:

| Widget | Needs | UI prompt |
|---|---|---|
| Dot-matrix day tracker ("13 Days") | Derivable from `dailyComparison` — **quick win, no backend needed** | Tile: clock icon, bold "N active days", grid of small circles — accent-filled for days with orders, `#D9D7D4` for days without |
| Mood review (5 faces) | `GET /api/v1/reviews/summary` (post-delivery ratings) | Tile: gray label "Customer satisfaction", bold question, 5 white circular face buttons; selected face = accent ring; average score as accent pill |
| Wallet / balance card | `GET /api/v1/finance/balance` | Tile mimicking the reference "VISA" card: brand mark, masked account, black + white pill action buttons, monthly fee row |
| Voice input | Speech recognition on the AI-insight tile | Large white circular mic button right of the greeting; press-to-talk, transcribes into the insight input |
| Calendar date circle | — | Big outlined circle showing today's date beside the header, acts as a shortcut opening the date-range picker |
