# Report API — Calculation Methodology

Detailed documentation of how every metric, trend, and data point is calculated across all 14 report endpoints.

---

## Table of Contents

1. [Core Concepts & Formulas](#1-core-concepts--formulas)
2. [Date Handling & Presets](#2-date-handling--presets)
3. [Dashboard Report](#3-dashboard-report)
4. [Sales Report](#4-sales-report)
5. [Order Report](#5-order-report)
6. [Product Report](#6-product-report)
7. [Customer Report](#7-customer-report)
8. [Payment Report](#8-payment-report)
9. [Finance Report](#9-finance-report)
10. [Inventory Report](#10-inventory-report)
11. [Shipping Report](#11-shipping-report)
12. [Refund Report](#12-refund-report)
13. [Coupon Report](#13-coupon-report)
14. [Vendor Report](#14-vendor-report)
15. [Warehouse Report](#15-warehouse-report)
16. [User Activity Report](#16-user-activity-report)
17. [Discount Calculation Logic](#17-discount-calculation-logic)
18. [Cost Calculation (Purchase Orders)](#18-cost-calculation-purchase-orders)
19. [Caching Layer](#19-caching-layer)
20. [Data Model Reference](#20-data-model-reference)

---

## 1. Core Concepts & Formulas

### Revenue Formulas

Every monetary calculation in the report system follows these rules:

```
grossRevenue      = SUM(totalPrice)              -- Subtotal before any discount
discount          = SUM(discount)                -- Total discount given
netRevenue        = grossRevenue - discount      -- What customers actually paid (excl. shipping)
actualRevenue     = totalPrice - discount        -- Per-order net revenue

// Per order:
productCost       = avgPurchaseCost * quantity   -- From PurchaseOrder collection
                  \-- fallback: 30% * unitPrice  -- If no PO data exists

grossProfit       = netRevenue - productCost
netProfit         = grossProfit - refundAmount
```

### Order-Level Fields

| Field | Source | Description |
|-------|--------|-------------|
| `totalPrice` | `priorOrder.totalPrice` | Gross subtotal (`SUM(unitPrice * quantity)`) before discount |
| `discount` | `priorOrder.discount` | Total discount applied to the order |
| `paid` | `priorOrder.paid` | Amount already paid by customer |
| `remaining` | `priorOrder.remaining` | Outstanding balance (`totalPrice - discount - paid`) |
| `deliveryCharge` | `priorOrder.deliveryCharge` | Shipping fee charged |
| `status` | `priorOrder.status` | Order status (processing, completed, shipped, cancel, return, etc.) |

### Per-Product-Item Fields (inside `order.products[]`)

| Field | Source | Description |
|-------|--------|-------------|
| `products.totalPrice` | `orderProductSchema.totalPrice` | `unitPrice * quantity` (gross, before discount) |
| `products.discount` | `orderProductSchema.discount` | Discount applied to this specific line item |
| `products.unitPrice` | `orderProductSchema.unitPrice` | Original unit price |
| `products.quantity` | `orderProductSchema.quantity` | Units ordered |
| `products.categoryId` | `orderProductSchema.categoryId` | String reference to `categories.id` |

### Key Relationships

- **Revenue per product line** = `products.totalPrice - products.discount`
- **AOV** = `netRevenue / totalOrders` (average order value after discount)
- **Discount %** = `(discount / grossRevenue) * 100`
- **Order-level net** = `totalPrice - discount`

---

## 2. Date Handling & Presets

### Supported Presets

| Preset | Start | End |
|--------|-------|-----|
| `today` | BD midnight today | BD 23:59:59 today |
| `yesterday` | BD midnight yesterday | BD 23:59:59 yesterday |
| `last_7_days` | BD midnight 6 days ago | BD now |
| `last_30_days` | BD midnight 29 days ago | BD now |
| `this_month` | BD midnight 1st of month | BD now |
| `last_month` | BD midnight 1st of prev month | BD 23:59:59 last day of prev month |
| `last_3_months` | BD midnight 89 days ago | BD now |
| `last_6_months` | BD midnight 179 days ago | BD now |
| `this_year` | BD midnight Jan 1 | BD now |
| `last_year` | BD midnight Jan 1 last year | BD 23:59:59 Dec 31 last year |

### Comparison Period

Every trend report computes a **previous period** of equal length:

```
periodLength = endDate - startDate
previousStart = startDate - periodLength
previousEnd   = startDate
```

Growth % = `((current - previous) / previous) * 100`

### Timezone

All dates are interpreted as **Asia/Dhaka (UTC+6)**. MongoDB stores UTC. Conversion:
```
UTC = BD time - 6 hours
```

---

## 3. Dashboard Report

**Endpoint:** `GET /api/v1/report/dashboard`

### 3.1 Sales KPIs

Aggregation pipeline on `priorOrder` collection:

```
Match: active=true, timestamps.createdAt within date range
AddFields: actualRevenue = totalPrice - discount
Group (single bucket):
  totalOrders      = COUNT(*)
  grossRevenue     = SUM(totalPrice)
  netRevenue       = SUM(actualRevenue)
  totalDiscount    = SUM(discount)
  totalPaid        = SUM(paid)
  completedOrders  = COUNT WHERE status="completed"
  pendingOrders    = COUNT WHERE status="pending"
  processingOrders = COUNT WHERE status="processing"
  shippedOrders    = COUNT WHERE status="shipped"
  cancelledOrders  = COUNT WHERE status IN ("cancel","failed")
  returnedOrders   = COUNT WHERE status="return"
  refundedOrders   = COUNT WHERE status="refund"
  aov              = AVG(actualRevenue)
```

### 3.2 Growth Calculation

```
revenueGrowth = ((currentPeriod.netRevenue - prevPeriod.netRevenue) / prevPeriod.netRevenue) * 100
ordersGrowth  = ((currentPeriod.totalOrders - prevPeriod.totalOrders) / prevPeriod.totalOrders) * 100
```

If previous period = 0 and current > 0: growth = 100%.
If both = 0: growth = 0%.

### 3.3 Financial KPIs

```
Match: active=true, status!="delete", within date range
netRevenue      = SUM(totalPrice - discount)
totalDiscount   = SUM(discount)
shippingIncome  = SUM(deliveryCharge)

// Separate query on ReturnOrder:
refundAmount    = SUM(refundAmount) WHERE timestamp in range

estimatedCost   = netRevenue * 0.3   // Placeholder -- see Section 18
totalProfit     = netRevenue - estimatedCost
```

### 3.4 Customer KPIs

```
Group by customer.phoneNumber:
  orderCount = COUNT(*)

Facet:
  totalCustomers    = COUNT(DISTINCT phone)
  newCustomers      = COUNT WHERE orderCount=1
  returningCustomers = COUNT WHERE orderCount>1
```

### 3.5 Performance KPIs

```
aov                    = netRevenue / totalOrders
avgRevenuePerCustomer  = netRevenue / COUNT(DISTINCT phone)
orderCompletionRate    = (completedOrders / totalOrders) * 100
refundRate             = (returnedOrders / totalOrders) * 100
returnRate             = (returnedOrders / totalOrders) * 100
```

### 3.6 Sales Trend (Daily)

```
Match: active=true, status IN ("processing","completed","shipped")
Group by DATE(timestamps.createdAt):
  sales = SUM(totalPrice - discount)
  orders = COUNT(*)
Sort by date ascending
```

### 3.7 Revenue Distribution (Pie Chart)

```
productRevenue = SUM(totalPrice - discount)  // net product sales
shippingRevenue = SUM(deliveryCharge)
discounts = SUM(discount)
refunds = SUM(refundAmount) FROM ReturnOrder
```

Returns array: `[{ segment, value }]`

### 3.8 Top Categories

```
Match: active=true, status!="delete"
Unwind: $products
Group by products.categoryId:
  revenue = SUM(products.totalPrice)
  totalSold = SUM(products.quantity)
Lookup: categories collection on "id" field
Sort by revenue DESC, limit 10
```

### 3.9 Hourly Sales Heatmap

```
Match: active=true, status!="delete"
Group by HOUR(timestamps.createdAt):
  sales = SUM(totalPrice - discount)
  orders = COUNT(*)
Sort by hour ascending (0-23)
```

---

## 4. Sales Report

**Endpoint:** `GET /api/v1/report/sales`

### 4.1 Daily Sales

Same as Dashboard Sales Trend (Section 3.6) but returns all dates, not filtered by status subset.

```
Group by DATE(timestamps.createdAt):
  grossRevenue  = SUM(totalPrice)
  netRevenue    = SUM(totalPrice - discount)
  discounts     = SUM(discount)
  paid          = SUM(paid)
  remaining     = SUM(remaining)
  orders        = COUNT(*)
  aov           = netRevenue / orders
```

### 4.2 Period Comparison

Runs the same daily aggregation for both `currentRange` and `previousRange`, then computes:

```
current.sumRevenue  vs previous.sumRevenue  -> revenueGrowth %
current.sumOrders   vs previous.sumOrders   -> ordersGrowth %
current.avgAOV      vs previous.avgAOV      -> aovGrowth %
```

### 4.3 Sales by Category

```
Unwind: $products
Group by products.categoryId:
  netRevenue = SUM(products.totalPrice - products.discount)
  totalSold  = SUM(products.quantity)
  orders     = COUNT(DISTINCT order ID)
Lookup: categories -> categoryName
Sort by netRevenue DESC
```

### 4.4 Sales by Brand

```
Unwind: $products
Group by products.brand:
  netRevenue = SUM(products.totalPrice - products.discount)
  totalSold  = SUM(products.quantity)
Sort by netRevenue DESC
```

### 4.5 Sales by Payment Method

```
Unwind: $payment
Group by payment.paymentType:
  totalAmount  = SUM(payment.amount)
  count        = COUNT(*)
  avgAmount    = AVG(payment.amount)
```

### 4.6 Sales by Channel

```
Group by orderCreatedBy:
  netRevenue = SUM(totalPrice - discount)
  orders     = COUNT(*)
```

---

## 5. Order Report

**Endpoint:** `GET /api/v1/report/orders`

### 5.1 Order Summary

```
Match: active=true, status!="delete"
totalOrders      = COUNT(*)
totalRevenue     = SUM(totalPrice - discount)
completedOrders  = COUNT WHERE status="completed"
pendingOrders    = COUNT WHERE status="pending"
processingOrders = COUNT WHERE status="processing"
shippedOrders    = COUNT WHERE status="shipped"
cancelledOrders  = COUNT WHERE status="cancel"
returnOrders     = COUNT WHERE status="return"
avgOrderValue    = totalRevenue / totalOrders
avgProcessingTime = AVG(now - createdAt) FOR processing orders
```

### 5.2 Daily Order Report

```
Group by DATE(timestamps.createdAt):
  totalOrders = COUNT(*)
  grossRevenue = SUM(totalPrice)
  netRevenue = SUM(totalPrice - discount)
  discounts = SUM(discount)
  completedOrders = COUNT WHERE status="completed"
  cancelledOrders = COUNT WHERE status="cancel"
  returnOrders = COUNT WHERE status="return"
  avgOrderValue = netRevenue / totalOrders

  // Status counts using $filter (corrected syntax):
  processingCount = SIZE($filter({ input: "$statuses", as: "s", cond: $$s.status == "processing" }))
  completedCount  = SIZE($filter({ ..., cond: $$s.status == "completed" }))
  ...
```

### 5.3 Top Cancelled Products

```
Match: status="cancel" OR status="return"
Unwind: $products
Group by products.productId:
  cancelCount = COUNT(*)
  totalLostRevenue = SUM(products.totalPrice - products.discount)
  avgRefundPerOrder = totalLostRevenue / cancelCount
Sort by cancelCount DESC
```

### 5.4 Order Lifecycle

```
statusDistribution: Group by status -> { count, percentage }
stuckOrders: WHERE status="processing" AND createdAt > 72 hours ago
  -> { orderNumber, customerName, createdAt, ageInDays }
averageAgeByStatus: AVG(now - createdAt) per status
```

---

## 6. Product Report

**Endpoint:** `GET /api/v1/report/products`

### 6.1 Product Summary

```
totalProducts  = COUNT(*) FROM Product WHERE active=true, deletedAt=null
activeProducts = COUNT(*) WHERE quantity>0
outOfStock     = COUNT(*) WHERE quantity=0
totalStock     = SUM(quantity)
totalValue     = SUM(quantity * effectivePrice)  // see Section 17 for discount
```

### 6.2 Best/Worst Selling Products

```
Match: active=true, within date range
Unwind: $products
Group by products.productId:
  totalSold     = SUM(products.quantity)
  totalRevenue  = SUM(products.totalPrice - products.discount)
  orderCount    = COUNT(*)
  avgUnitPrice  = AVG(products.unitPrice)
Sort: totalSold DESC (best) or ASC (worst)
```

### 6.3 Highest Revenue Products

Same aggregation as 6.2, sorted by `totalRevenue DESC`.

### 6.4 Highest Profit Products

```
For each sold product:
  totalRevenue  = SUM(products.totalPrice - products.discount)
  productCost   = SUM(avgPurchaseCost * quantity)  // from PO data
  profit        = totalRevenue - productCost
  margin        = (profit / totalRevenue) * 100
Sort by profit DESC
```

Cost lookup: `buildPurchaseCostMap()` -> `productId -> avgCost` from `PurchaseOrder` collection.

### 6.5 Never Sold Products

```
soldProductIds = DISTINCT(products.productId) FROM Order WHERE active=true, date in range
Match Product: id NOT IN soldProductIds, active=true, deletedAt=null
Return: { productId, productName, sku, stock, unitPrice, totalPrice }
```

### 6.6 Category Performance

```
Unwind: $products
Group by products.categoryId:
  totalSold    = SUM(products.quantity)
  totalRevenue = SUM(products.totalPrice - products.discount)
  orderCount   = COUNT(*)
  uniqueProducts = COUNT(DISTINCT products.productId)
  avgOrderValue  = totalRevenue / orderCount
Lookup: categories -> categoryName
Sort by totalRevenue DESC
```

### 6.7 Brand Performance

Same as 6.6 but grouped by `products.brand`.

---

## 7. Customer Report

**Endpoint:** `GET /api/v1/report/customers`

### 7.1 Customer Summary

```
Group by customer.phoneNumber:
  totalOrders = COUNT(*)
  totalSpent  = SUM(totalPrice - discount)
  firstOrder  = MIN(timestamps.createdAt)
  lastOrder   = MAX(timestamps.createdAt)

Facet:
  totalCustomers    = COUNT(DISTINCT phone)
  newCustomers      = COUNT WHERE totalOrders=1 (in date range)
  returningCustomers = COUNT WHERE totalOrders>1
  avgOrdersPerCustomer = SUM(totalOrders) / totalCustomers
  avgSpendPerCustomer  = SUM(totalSpent) / totalCustomers
```

### 7.2 Customer Lifetime Value (CLV)

```
Group by customer.phoneNumber:
  totalSpent     = SUM(totalPrice - discount)
  totalOrders    = COUNT(*)
  avgOrderValue  = totalSpent / totalOrders
  firstOrderDate = MIN(timestamps.createdAt)
  lastOrderDate  = MAX(timestamps.createdAt)
  customerTenure = (lastOrderDate - firstOrderDate) in days
Sort by totalSpent DESC, limit 20
```

### 7.3 Inactive Customers

```
inactiveDays = param (default 90)
cutoffDate = now - inactiveDays

Find customers whose lastOrderDate < cutoffDate (from all-time orders)
Group by customer.phoneNumber:
  lastOrderDate = MAX(timestamps.createdAt)
  totalOrders   = COUNT(*)
  totalSpent    = SUM(totalPrice - discount)
  daysSinceLastOrder = (now - lastOrderDate) in days
Filter: lastOrderDate < cutoffDate
Sort by daysSinceLastOrder DESC
```

### 7.4 Location Report

```
Unwind: $products
Group by shipping.district:
  orderCount    = COUNT(*)
  totalRevenue  = SUM(totalPrice - discount)
  uniqueCustomers = COUNT(DISTINCT customer.phoneNumber)
  avgOrderValue = totalRevenue / orderCount
Sort by orderCount DESC
```

### 7.5 Repeat Purchase Analysis

```
Group by customer.phoneNumber:
  orderCount = COUNT(*)

Facet:
  oneTimeBuyers   = COUNT WHERE orderCount=1
  twoTimeBuyers   = COUNT WHERE orderCount=2
  threeTimeBuyers = COUNT WHERE orderCount=3
  fourPlusBuyers  = COUNT WHERE orderCount>=4
  avgFrequency    = AVG(orderCount) across all customers
  repeatRate      = (customers with >1 order / total customers) * 100
```

---

## 8. Payment Report

**Endpoint:** `GET /api/v1/report/payments`

### 8.1 Payment Summary

```
Unwind: $payment
totalTransactions = COUNT(payment records)
totalCollected    = SUM(payment.amount)
totalPending      = SUM(remaining) across all orders
byStatus:
  paidInFull     = COUNT WHERE remaining=0
  partialPayment = COUNT WHERE remaining>0 AND paid>0
  noPayment      = COUNT WHERE paid=0
```

### 8.2 Payment Method Analysis

```
Unwind: $payment
Group by payment.paymentType:
  transactionCount = COUNT(*)
  totalAmount      = SUM(payment.amount)
  avgAmount        = AVG(payment.amount)
  successRate      = (completed orders with this payment / total) * 100
Sort by totalAmount DESC
```

### 8.3 Failed Payments

```
Match: status="failed" OR (payment with amount>0 but remaining>0)
Group by failure reason or payment type:
  count      = COUNT(*)
  totalDue   = SUM(remaining)
  avgDue     = totalDue / count
```

### 8.4 Payment Success Trend

```
Group by DATE(timestamps.createdAt):
  successful = COUNT WHERE status IN ("completed","shipped","processing")
  failed     = COUNT WHERE status IN ("failed","cancel")
  successRate = (successful / (successful + failed)) * 100
Sort by date ascending
```

---

## 9. Finance Report

**Endpoint:** `GET /api/v1/report/finance`

### 9.1 Financial Summary

```
Match: active=true, status!="delete"
grossRevenue = SUM(totalPrice)
netRevenue   = SUM(totalPrice - discount)
totalDiscounts = SUM(discount)
totalDeliveryCharges = SUM(deliveryCharge)
totalPaid     = SUM(paid)
totalRemaining = SUM(remaining)
totalOrders   = COUNT(*)
aov           = AVG(totalPrice - discount)

// From ReturnOrder:
totalRefunds = SUM(refundAmount)
refundCount  = COUNT(*)

// Product cost from PurchaseOrder:
totalProductCost = SUM(avgPurchaseCost * quantity)  // per product line
  \-- fallback: 30% * netRevenue if no PO data

grossProfit = netRevenue - totalProductCost
netProfit   = grossProfit - totalRefunds
```

### 9.2 Profit Trend

```
Fetch all orders in range + costMap from PurchaseOrders
Group by period (day/week/month):
  For each order:
    periodKey = DATE(timestamps.createdAt) formatted by interval
    revenue += (totalPrice - discount)
    discounts += discount
    deliveryCharges += deliveryCharge
    cost += SUM(getLineItemCost(product) for each product)
    orders += 1

  profit = revenue - cost
  margin = (profit / revenue) * 100
Sort by period ascending
```

### 9.3 Gross Margin by Category

```
Fetch orders + costMap
Group by products.categoryId:
  grossRevenue = SUM(products.totalPrice)
  totalDiscount = SUM(products.discount)
  netRevenue = SUM(products.totalPrice - products.discount)
  cost = SUM(getLineItemCost(product))
  profit = netRevenue - cost
  margin = (profit / netRevenue) * 100
Lookup: categories -> categoryName
Sort by netRevenue DESC
```

### 9.4 Profit by Product

```
Fetch orders + costMap
Group by products.productId:
  grossRevenue = SUM(products.totalPrice)
  totalDiscount = SUM(products.discount)
  netRevenue = SUM(products.totalPrice - products.discount)
  cost = SUM(getLineItemCost(product))
  profit = netRevenue - cost
  quantity = SUM(products.quantity)
Sort by profit DESC, limit 20
```

### 9.5 Cash Flow Summary

```
productSales = SUM(totalPrice - discount)
shippingCharges = SUM(deliveryCharge)
totalPaid = SUM(paid)
totalRemaining = SUM(remaining)
totalRefunds = SUM(refundAmount) FROM ReturnOrder
totalProductCost = SUM(real PO costs)

moneyIn  = productSales + shippingCharges
moneyOut = totalRefunds + totalProductCost
netCashFlow = moneyIn - moneyOut
collected = totalPaid
outstanding = totalRemaining
```

---

## 10. Inventory Report

**Endpoint:** `GET /api/v1/report/inventory`

All inventory calculations use **real purchase order costs** from the `PurchaseOrder` collection, with a 30% fallback.

### 10.1 Inventory Summary

```
For each Product WHERE active=true, deletedAt=null:
  qty = quantity
  unitCost = costMap[productId].avgCost  OR  30% * unitPrice
  effectivePrice = unitPrice - discountAmount  (see Section 17)
  discountAmount = computed per discount priority

  totalStock       += qty
  totalCostValue   += qty * unitCost
  totalSellingValue += qty * effectivePrice
  totalDiscountValue += qty * discountAmount
  outOfStock        (qty == 0)
  lowStock          (qty <= 10)

potentialProfit = totalSellingValue - totalCostValue
```

### 10.2 Current Inventory (Paginated)

Per product:
```
unitCost       = costMap[productId].avgCost  OR  30% * unitPrice
effectivePrice = unitPrice - discountAmount  (see Section 17)
costValue      = quantity * unitCost
sellingValue   = quantity * effectivePrice
potentialProfit = quantity * (effectivePrice - unitCost)
```

### 10.3 Inventory Value Report

Same as 10.2 but not paginated. Sorted by `sellingValue DESC`.

### 10.4 Dead Stock

```
cutoffDate = now - days (default 90)
soldProductIds = DISTINCT(products.productId) FROM Order WHERE createdAt >= cutoffDate

Products WHERE id NOT IN soldProductIds, active=true, quantity>0:
  effectivePrice = computed with discount priority
  unitCost = from PO data
  value = quantity * effectivePrice
  costValue = quantity * unitCost
Sort by value DESC
```

### 10.5 Inventory Aging

```
For each age bracket (0-30, 31-60, 61-90, 90+ days):
  Products WHERE lastPurchasedAt in range, quantity>0:
    totalStock += quantity
    totalValue += quantity * effectivePrice
    totalCostValue += quantity * unitCost
```

---

## 11. Shipping Report

**Endpoint:** `GET /api/v1/report/shipping`

### 11.1 Shipping Summary

```
totalShipments      = COUNT(*) WHERE deliveryStatus IS NOT NULL
pendingShipments    = COUNT WHERE deliveryStatus="pending"
inTransitShipments  = COUNT WHERE deliveryStatus="in_transit"
deliveredShipments  = COUNT WHERE deliveryStatus="delivered"
failedShipments     = COUNT WHERE deliveryStatus IN ("cancelled","returned","unknown")
deliveryRate        = (delivered / totalShipments) * 100
totalDeliveryCharges = SUM(deliveryCharge)
```

### 11.2 Courier Performance

```
Group by shipping.provider (courier name):
  totalOrders   = COUNT(*)
  delivered     = COUNT WHERE deliveryStatus="delivered"
  failed        = COUNT WHERE deliveryStatus IN ("cancelled","returned","unknown")
  avgDeliveryTime = AVG(deliveryDate - orderDate) for delivered
  deliveryRate  = (delivered / totalOrders) * 100
Sort by totalOrders DESC
```

### 11.3 Failed Deliveries

```
Match: deliveryStatus IN ("cancelled","returned","unknown")
Group by reason or courier:
  count       = COUNT(*)
  totalCost   = SUM(deliveryCharge)
  returnRate  = (returns / total) * 100
```

---

## 12. Refund Report

**Endpoint:** `GET /api/v1/report/refunds`

### 12.1 Refund Summary

```
Match ReturnOrder WHERE timestamp in range:
totalRefunds    = COUNT(*)
totalRefundAmount = SUM(refundAmount)
avgRefundAmount = totalRefundAmount / totalRefunds
refundRate      = (totalRefunds / totalOrders) * 100
refundRevenue   = netRevenue - totalRefundAmount
```

### 12.2 Refunds by Reason

```
Group by refundReason:
  count       = COUNT(*)
  totalAmount = SUM(refundAmount)
  avgAmount   = totalAmount / count
Sort by totalAmount DESC
```

### 12.3 Most Returned Products

```
Join ReturnOrder with Order products
Group by products.productId:
  returnCount    = COUNT(*)
  totalReturned  = SUM(quantity)
  totalRefundAmt = SUM(refundAmount)
Sort by returnCount DESC
```

### 12.4 Refund Trend

```
Group by DATE(timestamps.createdAt):
  refundCount = COUNT(*)
  refundAmount = SUM(refundAmount)
Sort by date ascending
```

---

## 13. Coupon Report

**Endpoint:** `GET /api/v1/report/coupons`

### 13.1 Coupon Usage Summary

```
Match orders WHERE couponCode IS NOT NULL AND couponCode != ""
totalCouponsUsed = COUNT(DISTINCT couponCode)
totalDiscountGiven = SUM(discount) WHERE coupon applied
avgDiscountPerCoupon = totalDiscountGiven / totalCouponsUsed
couponOrderRate = (orders with coupon / total orders) * 100
```

### 13.2 Coupon Performance

```
Group by couponCode:
  usageCount   = COUNT(*)
  totalDiscount = SUM(discount)
  avgDiscount  = totalDiscount / usageCount
  totalRevenue = SUM(totalPrice - discount)
Sort by usageCount DESC
```

### 13.3 Discount Impact

```
With coupon orders:
  avgOrderValue    = AVG(totalPrice - discount) WHERE coupon applied
  avgDiscountPct   = AVG((discount / totalPrice) * 100) WHERE coupon applied

Without coupon orders:
  avgOrderValue    = AVG(totalPrice - discount) WHERE no coupon

impact = (withCouponAOV - withoutCouponAOV) / withoutCouponAOV * 100
```

---

## 14. Vendor Report

**Endpoint:** `GET /api/v1/report/vendors`

### 14.1 Vendor Summary

```
PurchaseOrder aggregate:
totalPurchases       = COUNT(*)
totalPurchaseCost    = SUM(totalAmount)
avgPurchaseValue     = totalPurchaseCost / totalPurchases
uniqueProductsPurchased = COUNT(DISTINCT products.productId)
lastPurchaseDate     = MAX(createdAt)
lastOrderTotal       = totalAmount of most recent PO
```

### 14.2 Supplier Performance

```
Unwind PO products
Group by products.productId:
  purchaseValue  = SUM(quantity * unitPrice)
  totalQuantity  = SUM(quantity)
  purchaseCount  = COUNT(*)
  avgUnitCost    = purchaseValue / totalQuantity
Sort by purchaseValue DESC
```

### 14.3 Product Cost Analysis

```
Unwind PO products
Group by products.productId:
  avgPurchaseCost = AVG(unitPrice)
  minPurchaseCost = MIN(unitPrice)
  maxPurchaseCost = MAX(unitPrice)
  totalPurchased  = SUM(quantity)
  orderCount      = COUNT(*)

Enrich with Product catalog:
  currentSellingPrice = product.totalPrice || product.unitPrice
  margin = ((currentSellingPrice - avgPurchaseCost) / currentSellingPrice) * 100
```

### 14.4 Purchase Trend

```
Group by DATE/ WEEK/ MONTH(createdAt):
  totalOrders  = COUNT(*)
  totalCost    = SUM(totalAmount)
  avgOrderValue = totalCost / totalOrders
  totalItems   = SUM(SUM(products.quantity))
Sort by period ascending
```

---

## 15. Warehouse Report

**Endpoint:** `GET /api/v1/report/warehouses`

### 15.1 Warehouse Summary

```
totalProducts = COUNT(*) FROM Product WHERE active=true
totalStock    = SUM(quantity)
totalValue    = SUM(quantity * effectivePrice)  // with discount
avgStockPerProduct = totalStock / totalProducts
```

### 15.2 Warehouse Inventory

```
Product find WHERE active=true, deletedAt=null:
  Each product enriched with:
    costValue    = quantity * unitCost (from PO)
    sellingValue = quantity * effectivePrice (with discount)
    potentialProfit = sellingValue - costValue
Paginated
```

### 15.3 Warehouse Movement

```
Recent orders (last 30 days):
Group by DATE(timestamps.createdAt):
  inbound  = SUM(products.quantity) -- items ordered (stock leaving)
  outbound = SUM(products.quantity) FROM ReturnOrder -- items returned (stock coming back)
  netMovement = inbound - outbound
```

---

## 16. User Activity Report

**Endpoint:** `GET /api/v1/report/user-activity`

### 16.1 Audit Log Summary

```
Group by action:
  count = COUNT(*)
Sort by count DESC
```

### 16.2 Activity Detail

```
Match auditLog WHERE timestamp in range
Group by { userId, userName }:
  actionCounts: { action: count } per action
  lastActivity = MAX(timestamp)
  totalActions = SUM(count)
Paginated, sorted by totalActions DESC
```

---

## 17. Discount Calculation Logic

All inventory and product valuation uses a **three-tier discount priority**:

### Priority Order

```
1. Campaign discount  (highest -- if product is in active campaign)
2. Category discount  (medium -- if category.discount > 0)
3. Product discount   (lowest -- if product.discount > 0)
```

### Discount Type Handling

```javascript
// % type -- percentage off unitPrice
discountAmount = Math.floor((unitPrice * discount) / 100)

// flat / - type -- fixed amount off
discountAmount = discount

effectivePrice = Math.max(0, unitPrice - discountAmount)
```

### Implementation

```javascript
function computeEffectivePrice(product, categoryMap, activeCampaign) {
  // Priority 1: Campaign
  if (activeCampaign.products.includes(product.id)) {
    discount = activeCampaign.discount
    discountType = activeCampaign.discountType
  }
  // Priority 2: Category
  else if (categoryMap[product.categoryId]?.discount > 0) {
    discount = category.discount
    discountType = category.discountType
  }
  // Priority 3: Product's own
  else if (product.discount > 0) {
    discount = product.discount
    discountType = product.discountType
  }

  discountAmount = computeAmount(unitPrice, discount, discountType)
  effectivePrice = max(0, unitPrice - discountAmount)
}
```

### Data Sources

| Source | Collection | Fields Used |
|--------|-----------|-------------|
| Campaign | `campaigns` | `id`, `products[]`, `discount`, `discountType`, `active`, `startDate`, `endDate` |
| Category | `categories` | `id`, `discount`, `discountType` |
| Product | `products` | `id`, `unitPrice`, `discount`, `discountType`, `categoryId` |

### Where Applied

- **Inventory Report**: `effectivePrice` used for selling value, `unitCost` from PO for cost value
- **Product Report**: `effectivePrice` for valuation, profit margin calculations
- **Financial Report**: `products.totalPrice - products.discount` for net revenue per line item
- **Order Report**: `totalPrice - discount` for order-level net revenue

---

## 18. Cost Calculation (Purchase Orders)

### How Product Cost is Determined

```javascript
// reportHelpers.js
async function buildPurchaseCostMap() {
  // Aggregates ALL PurchaseOrder documents
  // Groups by products.productId
  // Returns: { productId: { avgCost, totalPurchased, lastPurchaseDate } }
}

function getLineItemCost(productId, quantity, unitPrice, costMap) {
  const po = costMap[productId]
  if (po && po.avgCost > 0) {
    return po.avgCost * quantity     // Real cost from PO
  }
  return unitPrice * quantity * 0.3  // Fallback: 30% of selling price
}
```

### Priority

1. **Primary**: Average unit price from `PurchaseOrder.products[].unitPrice`
2. **Fallback**: 30% of `unitPrice` (placeholder when no PO data exists)

### Used By

| Report | How Cost is Used |
|--------|-----------------|
| **Financial Summary** | `totalProductCost` = sum of real PO costs per product line |
| **Profit Trend** | Per-period cost = sum of real PO costs for products sold that period |
| **Gross Margin by Category** | Per-category cost from PO data |
| **Profit by Product** | Per-product cost from PO data |
| **Cash Flow** | `moneyOut.productCost` from PO data |
| **Inventory Summary** | `totalCostValue` = qty * avgPurchaseCost |
| **Current Inventory** | Per-product `unitCost` and `costValue` |
| **Inventory Value** | Per-product `costValue` |
| **Dead Stock** | Per-product `costValue` |
| **Inventory Aging** | Per-bracket `totalCostValue` |

---

## 19. Caching Layer

### Configuration

- **TTL**: 12 hours (43200 seconds)
- **Prefix**: `report:`
- **Storage**: Redis (same instance as product cache)

### Cache Key Format

```
report:{reportName}:{sorted_query_params}
```

Example:
```
report:sales:interval=day&preset=last_7_days
report:inventory:default
report:orders:preset=today
```

### How It Works

1. On request, `withCache()` interceptor checks Redis for cached response
2. If cache hit: returns cached JSON immediately (no DB query)
3. If cache miss: executes handler, intercepts `res.json()`, stores result in Redis with TTL
4. Bypass: append `?nocache=1` to any report endpoint

### Cache Invalidation

```javascript
const { invalidateReportCache } = require("./utils/reportCache");

// Invalidate specific report
await invalidateReportCache("sales");

// Invalidate all reports
await invalidateReportCache("*");
```

---

## 20. Data Model Reference

### PriorOrder (priorOrders collection)

```
{
  id: String (UUID),
  orderNumber: Number,
  totalPrice: Number,         // Gross subtotal (before discount)
  discount: Number,           // Total order discount
  paid: Number,
  remaining: Number,
  deliveryCharge: Number,
  status: String,             // "processing"|"completed"|"shipped"|"pending"|"cancel"|"return"|"refund"|"failed"|"delete"
  deliveryStatus: String,     // "pending"|"in_transit"|"delivered"|"cancelled"|"returned"|"unknown"
  customer: { name, email, phoneNumber },
  shipping: { division, district, address },
  payment: [{ paymentType, amount, date }],
  orderCreatedBy: String,
  couponCode: String,
  couponType: String,
  products: [{
    productId: String,
    name: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,       // unitPrice * quantity (gross)
    discount: Number,         // Line-item discount
    categoryId: String,       // References categories.id
    brand: String,
    thumbnail: String,
  }],
  timestamps: { createdAt: Date, updatedAt: Date },
  active: Boolean,
}
```

### Product (products collection)

```
{
  id: String (UUID),
  name: String,
  sku: String,
  unitPrice: Number,          // Base selling price
  totalPrice: Number,         // Current selling price (after product discount)
  discount: Number,           // Product-level discount value
  discountType: String,       // "%" | "flat" | "-"
  quantity: Number,           // Current stock
  categoryId: String,         // References categories.id
  categoryIds: [String],      // Multi-category support
  brand: String,
  active: Boolean,
  deletedAt: Date | null,
  lastPurchasedAt: Date,
  hasVariation: Boolean,
  variation: [{ id, unitPrice, quantity, ... }],
}
```

### Category (categories collection)

```
{
  id: String,
  name: String,
  discount: Number,           // Category-level discount
  discountType: String,       // "%" | "fixed"
  active: Boolean,
  parentId: String,
  level: Number,
}
```

### Campaign (campaigns collection)

```
{
  id: String (UUID),
  title: String,
  products: [String],         // Array of product IDs
  discount: Number,           // Campaign discount value
  discountType: String,       // "%" | "-"
  startDate: Date,
  endDate: Date,
  active: Boolean,
}
```

### PurchaseOrder (purchaseorders collection)

```
{
  id: String (UUID),
  purchaseNumber: Number,
  products: [{
    productId: String,
    quantity: Number,
    unitPrice: Number,        // Purchase cost per unit
    variantId: String,
    title: String,
    sku: String,
  }],
  totalAmount: Number,
  createdAt: Date,
}
```

### ReturnOrder (priorOrderReturns collection)

```
{
  refundAmount: Number,
  products: [{ productId, quantity, ... }],
  timestamps: { createdAt: Date },
}
```
