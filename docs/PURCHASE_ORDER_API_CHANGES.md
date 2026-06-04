# Purchase Order API Changes - Variant Image Support

## Overview

This document details the changes made to Purchase Order APIs to support variant-specific images. The changes enable the API to return variant images when available, falling back to the main product thumbnail when variant images are not present.

**Date:** June 4, 2026
**Version:** 2.0
**Affected Endpoints:**
- `GET /api/v1/purchase-order/search`
- `GET /api/v1/purchase-order/all`

---

## Summary of Changes

### What Changed?

Two Purchase Order APIs have been modified to include image data in their responses:

1. **searchProducts API** - Now uses variant images instead of only product thumbnails
2. **getPurchaseOrders API** - Now enriches responses with product and variant images

### Why These Changes?

Previously, purchase order responses either:
- Did not include image data at all (`getPurchaseOrders`)
- Only included the main product thumbnail for all variants (`searchProducts`)

These changes ensure:
- Variant-specific images are displayed when available
- Consistent behavior across order and purchase order APIs
- Better user experience with accurate product imagery

---

## API #1: Search Products for Purchase Orders

### Endpoint

```
GET /api/v1/purchase-order/search
```

### Purpose

Search for products by name, SKU, or ID to add them to purchase orders. This API returns individual variants as separate items for products with variations.

### Request Parameters

| Parameter | Type   | Required | Description                |
|-----------|--------|----------|----------------------------|
| query     | string | Yes      | Search term (name/SKU/ID)  |

### Example Request

```bash
GET /api/v1/purchase-order/search?query=t-shirt
```

---

### Response Structure

#### Before Changes (OLD)

```json
[
  {
    "id": "PROD-123",
    "name": "Cotton T-Shirt",
    "sku": "TSHIRT-RED-L",
    "image": "https://example.com/images/tshirt-thumbnail.jpg",
    "unitPrice": 25.00,
    "quantity": 100,
    "variant": {
      "id": "VAR-001",
      "size": "L",
      "color": "Red"
    }
  },
  {
    "id": "PROD-123",
    "name": "Cotton T-Shirt",
    "sku": "TSHIRT-BLUE-M",
    "image": "https://example.com/images/tshirt-thumbnail.jpg",
    "unitPrice": 25.00,
    "quantity": 50,
    "variant": {
      "id": "VAR-002",
      "size": "M",
      "color": "Blue"
    }
  }
]
```

**Issue:** All variants showed the same `tshirt-thumbnail.jpg` image (main product thumbnail), even if variant-specific images were available.

---

#### After Changes (NEW)

```json
[
  {
    "id": "PROD-123",
    "name": "Cotton T-Shirt",
    "sku": "TSHIRT-RED-L",
    "image": "https://example.com/images/tshirt-red-large.jpg",
    "unitPrice": 25.00,
    "quantity": 100,
    "variant": {
      "id": "VAR-001",
      "size": "L",
      "color": "Red"
    }
  },
  {
    "id": "PROD-123",
    "name": "Cotton T-Shirt",
    "sku": "TSHIRT-BLUE-M",
    "image": "https://example.com/images/tshirt-blue-medium.jpg",
    "unitPrice": 25.00,
    "quantity": 50,
    "variant": {
      "id": "VAR-002",
      "size": "M",
      "color": "Blue"
    }
  }
]
```

**Improvement:** Each variant now shows its specific image (`tshirt-red-large.jpg`, `tshirt-blue-medium.jpg`).

---

#### Variant Without Image (Fallback Behavior)

```json
[
  {
    "id": "PROD-456",
    "name": "Basic T-Shirt",
    "sku": "TSHIRT-GRN-S",
    "image": "https://example.com/images/tshirt-thumbnail.jpg",
    "unitPrice": 20.00,
    "quantity": 75,
    "variant": {
      "id": "VAR-003",
      "size": "S",
      "color": "Green"
    }
  }
]
```

**Fallback:** When a variant has no specific image, the API returns the main product thumbnail (`tshirt-thumbnail.jpg`).

---

#### Product Without Variants

```json
[
  {
    "id": "PROD-789",
    "name": "Single Size Poster",
    "sku": "POSTER-001",
    "image": "https://example.com/images/poster.jpg",
    "unitPrice": 15.00,
    "quantity": 200,
    "variant": null
  }
]
```

**No Change:** Products without variants continue to use their main thumbnail.

---

### Image Logic

```javascript
// For products with variants
image: (variant.images && variant.images.length > 0)
  ? variant.images[0]           // Use variant image if available
  : product.thumbnail           // Fallback to product thumbnail

// For products without variants
image: product.thumbnail        // Always use product thumbnail
```

---

## API #2: Get Purchase Orders List

### Endpoint

```
GET /api/v1/purchase-order/all?page=1
```

### Purpose

Retrieve a paginated list of all purchase orders with enriched product details, including images.

### Request Parameters

| Parameter | Type    | Required | Default | Description                        |
|-----------|---------|----------|---------|------------------------------------|
| page      | number  | No       | 1       | Page number for pagination         |

### Example Request

```bash
GET /api/v1/purchase-order/all?page=1
```

---

### Response Structure

#### Before Changes (OLD)

```json
{
  "totalDocs": 50,
  "totalPages": 5,
  "currentPage": 1,
  "purchaseOrders": [
    {
      "id": "PO-2026-001",
      "purchaseNumber": "PO-2026-001",
      "products": [
        {
          "productId": "PROD-123",
          "quantity": 50,
          "unitPrice": 25.00,
          "variantId": "VAR-001",
          "title": "Cotton T-Shirt Red - L",
          "sku": "TSHIRT-RED-L"
        }
      ],
      "totalAmount": 1250.00,
      "createdAt": "2026-06-01T10:30:00.000Z"
    }
  ]
}
```

**Issue:** Products in the response had NO image data at all.

---

#### After Changes (NEW)

```json
{
  "totalDocs": 50,
  "totalPages": 5,
  "currentPage": 1,
  "purchaseOrders": [
    {
      "id": "PO-2026-001",
      "purchaseNumber": "PO-2026-001",
      "products": [
        {
          "productId": "PROD-123",
          "quantity": 50,
          "unitPrice": 25.00,
          "variantId": "VAR-001",
          "title": "Cotton T-Shirt Red - L",
          "sku": "TSHIRT-RED-L",
          "image": "https://example.com/images/tshirt-red-large.jpg",
          "thumbnail": "https://example.com/images/tshirt-red-large.jpg"
        }
      ],
      "totalAmount": 1250.00,
      "createdAt": "2026-06-01T10:30:00.000Z"
    }
  ]
}
```

**Improvement:** Products now include `image` and `thumbnail` fields with variant-specific images.

---

#### Product Without Variant Image (Fallback)

```json
{
  "totalDocs": 50,
  "totalPages": 5,
  "currentPage": 1,
  "purchaseOrders": [
    {
      "id": "PO-2026-002",
      "purchaseNumber": "PO-2026-002",
      "products": [
        {
          "productId": "PROD-456",
          "quantity": 30,
          "unitPrice": 20.00,
          "variantId": "VAR-003",
          "title": "Basic T-Shirt Green - S",
          "sku": "TSHIRT-GRN-S",
          "image": "https://example.com/images/tshirt-thumbnail.jpg",
          "thumbnail": "https://example.com/images/tshirt-thumbnail.jpg"
        }
      ],
      "totalAmount": 600.00,
      "createdAt": "2026-06-02T14:20:00.000Z"
    }
  ]
}
```

**Fallback:** Variant has no specific image, so uses the main product thumbnail.

---

#### Product Without Variants

```json
{
  "totalDocs": 50,
  "totalPages": 5,
  "currentPage": 1,
  "purchaseOrders": [
    {
      "id": "PO-2026-003",
      "purchaseNumber": "PO-2026-003",
      "products": [
        {
          "productId": "PROD-789",
          "quantity": 100,
          "unitPrice": 15.00,
          "title": "Single Size Poster",
          "sku": "POSTER-001",
          "image": "https://example.com/images/poster.jpg",
          "thumbnail": "https://example.com/images/poster.jpg"
        }
      ],
      "totalAmount": 1500.00,
      "createdAt": "2026-06-03T09:15:00.000Z"
    }
  ]
}
```

**No Variant:** Product without variants uses its main thumbnail.

---

### New Fields Added

| Field      | Type   | Description                                    |
|------------|--------|------------------------------------------------|
| image      | string | URL of the product/variant image              |
| thumbnail  | string | Same as image (duplicate for compatibility)  |

Both fields contain the same value for consistency with other APIs in the system.

---

### Image Logic

```javascript
// 1. Add product thumbnail as default
enriched.image = product.thumbnail;
enriched.thumbnail = product.thumbnail;

// 2. If has variant, override with variant image if available
if (item.variantId && product.hasVariation) {
  const variant = product.variation.find(v => v.id === item.variantId);
  if (variant) {
    enriched.image = (variant.images && variant.images.length > 0)
      ? variant.images[0]      // Use variant image
      : product.thumbnail;     // Fallback to product thumbnail
    enriched.thumbnail = enriched.image;
  }
}
```

---

## Implementation Details

### Performance Considerations

The `getPurchaseOrders` API now uses **batch fetching** to minimize database queries:

```javascript
// Collect all unique product IDs from a purchase order
const productIds = [...new Set(po.products.map(p => p.productId))];

// Fetch all products in ONE query
const products = await Product.find({ id: { $in: productIds } });

// Use Map for O(1) lookups
const productMap = new Map(products.map(p => [p.id, p]));
```

This approach ensures:
- Single database query per purchase order (not per product)
- Efficient memory usage with Map
- Scalable performance for purchase orders with many products

---

### Authentication

Both APIs require authentication through the application's standard middleware:
- JWT token required
- Admin/Staff role required
- Standard auth middleware applied at route level

---

### Error Handling

#### 400 Bad Request
```json
{
  "message": "Error searching products",
  "error": "Invalid query parameter"
}
```

#### 404 Not Found
```json
{
  "message": "No products found matching query"
}
```

#### 500 Internal Server Error
```json
{
  "message": "Error fetching purchase orders",
  "error": "Database connection failed"
}
```

---

## Migration Guide for Frontend Developers

### Breaking Changes

#### API #1: searchProducts

**What Changed:**
- `image` field may now return different URLs for variants of the same product

**Action Required:**
- ✅ **No action required** - The field name and structure remain the same
- ✅ **Benefit** - You'll now see variant-specific images automatically
- ⚠️ **Cache Consideration** - If you cache images by SKU, clear your cache

#### API #2: getPurchaseOrders

**What Changed:**
- New `image` field added to each product
- New `thumbnail` field added to each product

**Action Required:**
- ✅ **Recommended** - Update your UI to display these new image fields
- ✅ **Recommended** - Replace placeholder images with actual product images
- ❌ **Not Required** - Existing code continues to work (backward compatible)

---

### Code Examples

#### React Example (searchProducts)

```jsx
// Before - Already works, just gets variant-specific images now
const ProductSearchResults = ({ products }) => {
  return (
    <div>
      {products.map((product) => (
        <div key={`${product.id}-${product.variant?.id}`}>
          <img src={product.image} alt={product.name} />
          <h3>{product.name}</h3>
          {product.variant && (
            <p>
              {product.variant.color} - {product.variant.size}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
```

**No code changes needed!** Just refresh to see variant-specific images.

---

#### React Example (getPurchaseOrders)

```jsx
// Before - No image display
const PurchaseOrderList = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch('/api/v1/purchase-order/all?page=1')
      .then(res => res.json())
      .then(data => setOrders(data.purchaseOrders));
  }, []);

  return (
    <div>
      {orders.map((order) => (
        <div key={order.id}>
          <h3>PO: {order.purchaseNumber}</h3>
          {order.products.map((product) => (
            <div key={product.productId}>
              <p>{product.title}</p>
              {/* Before: No image */}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
```

---

```jsx
// After - Display images
const PurchaseOrderList = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch('/api/v1/purchase-order/all?page=1')
      .then(res => res.json())
      .then(data => setOrders(data.purchaseOrders));
  }, []);

  return (
    <div>
      {orders.map((order) => (
        <div key={order.id}>
          <h3>PO: {order.purchaseNumber}</h3>
          {order.products.map((product) => (
            <div key={product.productId}>
              {/* NEW: Display product image */}
              <img
                src={product.image || product.thumbnail}
                alt={product.title}
                style={{ width: 50, height: 50 }}
              />
              <p>{product.title}</p>
              <p>Qty: {product.quantity} × ${product.unitPrice}</p>
            </div>
          ))}
          <p><strong>Total: ${order.totalAmount}</strong></p>
        </div>
      ))}
    </div>
  );
};
```

---

#### Vue.js Example

```vue
<template>
  <div>
    <div v-for="order in orders" :key="order.id" class="order-card">
      <h3>{{ order.purchaseNumber }}</h3>
      <div v-for="product in order.products" :key="product.productId" class="product-item">
        <!-- NEW: Image display -->
        <img
          :src="product.image || product.thumbnail"
          :alt="product.title"
          class="product-image"
        />
        <div class="product-details">
          <p>{{ product.title }}</p>
          <p>Qty: {{ product.quantity }} × ${{ product.unitPrice }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      orders: []
    };
  },
  async mounted() {
    const response = await fetch('/api/v1/purchase-order/all?page=1');
    const data = await response.json();
    this.orders = data.purchaseOrders;
  }
};
</script>

<style scoped>
.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  margin-right: 10px;
}
.product-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
```

---

### Testing Checklist

- [ ] Test searchProducts with products that have variants
- [ ] Test searchProducts with products without variants
- [ ] Verify variant-specific images are displayed correctly
- [ ] Test fallback to product thumbnail when variant has no image
- [ ] Test getPurchaseOrders displays images for all products
- [ ] Verify pagination still works correctly
- [ ] Test with purchase orders containing mixed variant/non-variant products
- [ ] Verify image URLs are valid and load correctly
- [ ] Clear any cached images if needed

---

## Related APIs

### Similar Image Logic in Other APIs

The following APIs also use the same variant image logic:

1. **Order APIs:**
   - `GET /api/v1/order/products` (getOrderProducts)
   - `PUT /api/v1/order/modify/:orderId` (modifyOrderProducts)

2. **Public API:**
   - `GET /api/public/order/:orderId` (getOrderDetails)
   - `GET /api/public/customer/orders` (getOrderHistory)
   - `GET /api/public/customer/order/:orderId` (getOrderDetails)

All these APIs follow the same pattern:
- Variant images prioritized over product thumbnails
- Fallback to product thumbnail when variant has no image
- Products without variants use their thumbnail

---

## FAQs

### Q: Will this break existing frontend code?

**A:** No. The changes are backward compatible:
- `searchProducts` - Same response structure, just better image URLs
- `getPurchaseOrders` - Adds new optional fields, doesn't remove anything

### Q: Do I need to update my frontend immediately?

**A:** No immediate action required, but recommended:
- For `searchProducts`: No changes needed, automatically benefits you
- For `getPurchaseOrders`: Update to display images for better UX

### Q: What if a variant has no image?

**A:** The API automatically falls back to the main product thumbnail. You don't need to handle this case.

### Q: Are there performance implications?

**A:** Minimal impact:
- `searchProducts`: No performance change (already fetched product data)
- `getPurchaseOrders`: Adds batch queries (optimized for performance)

### Q: Do I need to update my database?

**A:** No database changes required. The schema already supports variant images.

### Q: How do I know if a product has variants?

**A:** Check the `variant` field:
- If `variant` is `null` or absent → No variants (simple product)
- If `variant` exists with `id`, `size`, `color` → Has variants

### Q: Can I still access the original product thumbnail?

**A:** For variant products, the `image` field will show the variant image (or product thumbnail as fallback). If you need the original product thumbnail separately, you would need to fetch the full product details.

---

## Changelog

### Version 2.0 (June 4, 2026)

**Added:**
- Variant image support in `searchProducts` API
- Image enrichment in `getPurchaseOrders` API
- `image` and `thumbnail` fields to purchase order products

**Changed:**
- `searchProducts` now returns variant-specific images instead of only product thumbnails
- `getPurchaseOrders` now fetches and includes product/variant images

**Performance:**
- Optimized batch fetching for `getPurchaseOrders` to minimize database queries

**Compatibility:**
- Fully backward compatible with existing implementations
- No breaking changes to response structure

---

## Support

For questions or issues related to these API changes, please contact:
- Backend Team: [backend-email@example.com]
- API Documentation: [Link to API docs]
- GitHub Issues: [Link to repository issues]

---

**Last Updated:** June 4, 2026
**Document Version:** 1.0
