# Admin Panel — Release 4.0.0: Management Summary

**For:** Management
**Date:** November 2026
**Status:** Ready for release (requires coordinated backend deployment)

---

## At a glance

Release 4.0.0 is our largest update to the admin panel this year. It adds four new operational
modules — **fraud management, advance-payment (prepayment) rules, pending-payment order tracking,
and bKash transaction logs** — and moves delivery charges from hardcoded values controlled by
developers to **server-managed zones that the team can edit from the admin panel**. Alongside
these, the panel is now **fully usable from a mobile phone**, page access is controlled by a
tightened permission system, and the brand identity has been refreshed.

This release also folds in three earlier updates that had not yet shipped to production: the
corrected invoice totals, the Activity Log (audit trail), and server-managed delivery locations.

---

## New capabilities

### 1. Fraud risk management

The panel now maintains a risk profile for every customer, calculated by the system from their
order and return history. Staff can browse high-risk and medium-risk customers, search by phone
number, view why a customer was flagged, and **block known fraudsters** by adding them to a fraud
group — which surfaces a clear warning on any future order from that number. Risk levels can be
manually overridden by authorized staff when the system needs a human decision.

**Business value:** fewer charge-on-delivery losses and faster decisions at order confirmation time.

### 2. Advance payment (prepayment) rules

We can now define rules that require an advance payment before an order is confirmed — for
example, "red-risk customers pay a fixed advance" or "orders to specific zones pay 30% up front."
When a staff member creates an order that matches a rule and hasn't collected the advance, the
panel shows a warning and requires explicit confirmation before proceeding.

**Business value:** reduces cash-on-delivery risk on fragile orders without blocking everyone.

### 3. Pending payment order tracking

Orders paid through bKash that never completed now appear on a dedicated screen with how long they
have left before expiring. This gives the team a worklist to follow up on failed payments instead
of discovering them days later.

### 4. bKash transaction log

Every bKash payment event is now logged and searchable, with a timeline per payment and summary
statistics. Disputes with bKash or customers can be resolved from a single screen.

### 5. Server-managed delivery charges and zones _(the delivery service change)_

Previously, changing a delivery charge — even by 20 taka — required a developer to change code and
redeploy. Delivery zones, districts, and their charges are now **managed from the admin panel**
(Settings → Locations), including drag-and-drop reordering of zones and one-click syncing with
courier services (Pathao, Carrybee). All order forms instantly use the updated charges.

**Business value:** the operations team controls delivery pricing directly; changes take effect
immediately with no developer involvement or downtime.

### 6. Activity log (audit trail)

Every significant action taken in the panel is recorded — who did what, when, and from where.
Managers can view a per-user timeline, activity statistics, and export records to CSV.

### 7. Product quantity timeline

Each product now has a full history of stock changes — what came in, what went out, and why —
visible as a timeline on the product page.

### 8. Product meta data

Products and variants support custom key/value attributes defined by us (e.g. fabric, size guide,
vendor). These can be used to filter product lists and to search while creating orders.

---

## Improvements

- **Mobile admin.** The panel was redesigned for phones: bottom navigation, card-based lists, and
  filter sheets across orders, packages, products, reports, users, roles, and settings. Staff can
  now run daily operations from a phone, not just a desk.
- **Refreshed dashboard and reports.** A cleaner dashboard with activity panels, redesigned
  product analytics with an inventory health summary (healthy / low / out of stock, fast/slow
  movers, dead stock), and a district-level sales map.
- **Better notifications.** Push notifications are now configured from the server, more reliably
  delivered, and open into a detail view instead of a bare message.
- **Product listing control.** The product picker when creating orders can be sorted the way the
  team prefers (configurable).
- **New brand identity.** New logos, favicon, and app icons across web and desktop; the panel can
  be installed as an app (PWA).

---

## Security & control

- **Every page is now permission-checked** — previously some product, order, and campaign pages
  were reachable by anyone with a login. Access is now enforced per page and per action.
- **"Own orders only" restriction.** A role can be limited to seeing and editing only the orders
  that user created. _(Requires a one-time data backfill — see below.)_
- **Corrected invoice totals.** Invoices previously showed a total that omitted the delivery
  charge. The printed/total figure is now correct: products + delivery − discount. Customer
  support should be aware that previously issued totals were understated.

---
