# Product API Documentation

## Table of Contents
1. [Overview](#overview)
2. [POST /api/v1/product/create](#post-apiv1productcreate)
3. [PUT /api/v1/product/edit](#put-apiv1productedit)
4. [Shared Features](#shared-features)
5. [Frontend Migration Guide](#frontend-migration-guide)
6. [Examples](#examples)

---

## Overview

This documentation covers the two main product management APIs in the Biponi Express system. These APIs allow for creating and editing products with support for:

- Multiple file uploads (thumbnail, product images, variant images, image group images)
- Complex product variations with flexible attributes
- Image Groups for attribute-based image organization
- Multi-category support
- Commission and discount management
- Automatic image compression and optimization

### Important Notes

- **Authentication**: Both APIs are currently **public** (no authentication required)
- **Content Type**: Both require `multipart/form-data` for file uploads
- **File Uploads**: All images are automatically compressed to WebP format (400-600KB target)
- **Storage**: AWS S3 with CloudFront CDN
- **Rate Limits**: Max 100 files per request, 10MB per file

---

## POST /api/v1/product/create

Creates a new product with optional variations, images, and image groups.

### Endpoint
```
POST /api/v1/product/create
```

### Content Type
```
multipart/form-data
```

### Authentication
```
None (public endpoint)
```

---

### Request Parameters

#### File Upload Fields

| Field Name | Max Files | Required | Description |
|------------|-----------|----------|-------------|
| `thumbnail` | 1 | **Yes** | Main product thumbnail image |
| `images` | 100 | No | Product gallery images |
| `variantImages` | 100 | No | Variation-specific images (requires `variantImageMapping`) |
| `imageGroupImages` | 50 | No | ImageGroup-specific images (requires `imageGroupImageMapping`) |

**Accepted Formats**: JPG, PNG, WebP, GIF (auto-converted to WebP)
**Max File Size**: 10MB per file (auto-compressed on upload)

#### Body Parameters

##### Basic Product Fields

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `name` | string | **Yes** | - | Trimmed, uppercased, 2-200 chars |
| `categoryId` | string | **Yes** | - | Must exist in database, must match `categoryIds[0]` |
| `sku` | string | **Yes** | - | Unique, trimmed, uppercased, max 100 chars |
| `unitPrice` | number | No | 0 | Min 0 |
| `discount` | number | No | 0 | Min 0 |
| `discountType` | string | No | "-" | Must be: "%", "flat", or "-" |
| `quantity` | number | No | 0 | Min 0, integer. Calculated from variations if present |
| `description` | string | No | "" | Max 5000 chars |
| `active` | boolean | No | false | - |
| `manufactureId` | string | No | "" | - |

##### Multi-Category Support

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `categoryIds` | array[string] | No | [] | Array of category IDs. `categoryId` must equal `categoryIds[0]` |

##### Commission Fields

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `commissionType` | string | No | "percentage" | Must be: "fixed" or "percentage" |
| `commissionRate` | number | No | 0 | Min 0, Max 100 if percentage type |

##### Variations

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `variation` | array[object] | No | [] | Array of variation objects (see structure below) |

**Note**: The API accepts both JSON arrays and stringified JSON arrays for the `variation` field.

##### Image Groups (New Feature)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `imageGroups` | array[object] | No | [] | Array of imageGroup objects (see structure below) |

##### Image Mapping Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `variantImageMapping` | array[object] | No | Maps uploaded `variantImages` to specific variations |
| `imageGroupImageMapping` | array[object] | No | Maps uploaded `imageGroupImages` to specific imageGroups |

---

### Data Structures

#### Variation Object

```javascript
{
  id: string,              // Auto-generated UUID if not provided
  size: string,            // Size value (e.g., "M", "L", "XL")
  color: string,           // Color value (e.g., "Red", "Blue")
  sku: string,             // Variation SKU (lowercased, trimmed, defaults to "")
  unitPrice: number,       // Variation-specific price (defaults to 0)
  quantity: number,        // Variation stock quantity (defaults to 0)
  barcode: string,         // Barcode (optional)
  attributes: map,         // Generic attribute map for custom variant types
  imageGroupId: string,    // Reference to imageGroup (auto-synced if not provided)
  images: array[string],   // Variation-specific image URLs
  isActive: boolean,       // Variation active status (defaults to true)
  sortOrder: number        // Display sort order (defaults to 0)
}
```

**Validation Rule**: Either `size` or `color` must be provided (both cannot be empty).

#### ImageGroup Object

```javascript
{
  id: string,              // Auto-generated UUID (required)
  attribute: string,       // Variant attribute name (required)
                          // Examples: "color", "material", "pattern", "fit"
  value: string,          // Attribute value (required)
                          // Examples: "Red", "Cotton", "Striped", "Slim"
  displayLabel: string,   // Human-readable label (optional)
                          // Example: "Crimson Red" instead of "red"
  colorHex: string,       // Hex color code (optional, recommended for color attributes)
                          // Must match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  images: array[string],  // Array of image URLs (defaults to [])
  variantIds: array[string], // Auto-synced from variation.imageGroupId references
  variantOverrides: array[object], // Per-variant image overrides (optional)
  sortOrder: number       // Display sort order (defaults to 0)
}
```

#### Variant Image Mapping Object

```javascript
{
  variantId: string,       // ID of the variation (must exist in variation array)
  imageIndex: number       // Index in variantImages array (0-based)
}
```

#### ImageGroup Image Mapping Object

```javascript
{
  groupId: string,         // ID of the imageGroup (must exist in imageGroups array)
  imageIndex: number       // Index in imageGroupImages array (0-based)
}
```

---

### Validation Rules

#### Joi Validation

1. **Required Fields**
   - `name`: Required, trimmed, uppercased
   - `categoryId`: Required, must exist in database
   - `sku`: Required, unique across all products

2. **Category Validation**
   - All IDs in `categoryIds` must exist in database
   - `categoryId` must equal `categoryIds[0]` (consistency check)

3. **Duplicate Product Check**
   - Product with same `productCode` and `sku` cannot exist
   - `productCode` is auto-generated from `name` (uppercase, spaces→underscores)

4. **Thumbnail Requirement**
   - Thumbnail file upload is mandatory (returns 403 if missing)

5. **Variation Validation**
   - Each variation must have either `size` or `color` (not both empty)
   - Variation SKUs must be unique within the product
   - `quantity` is auto-calculated from variations if variations are present

6. **ImageGroup Validation**
   - Each imageGroup must have `attribute` and `value` fields
   - `colorHex` must match regex if provided

---

### Business Logic Flow

#### 1. Validation Phase
```javascript
- Run Joi schema validation
- Validate all category IDs exist
- Ensure categoryId matches categoryIds[0]
```

#### 2. File Upload Phase
```javascript
- Upload thumbnail to S3 (REQUIRED)
- Upload product images to S3 (OPTIONAL)
- Upload variant images to S3 (OPTIONAL)
- Upload imageGroup images to S3 (OPTIONAL)

All uploads happen in parallel for performance.
Images are compressed to WebP format (400-600KB target, 1500px max width).
```

#### 3. Image Processing Phase

**Variant Image Assignment**:
```javascript
if variantImageMapping provided:
  Assign variantImages to variations by variant ID
else:
  Fallback to sequential assignment (logs warning)
```

**ImageGroup Processing**:
```javascript
- Parse imageGroups array
- Generate UUID for groups without ID
- Sanitize images fields (handle malformed data)
- Sync imageGroupId on variations (match by color or imageGroupId)
- Map uploaded imageGroupImages using imageGroupImageMapping
```

#### 4. Product Creation Phase
```javascript
- Calculate total quantity from variations
- Generate productCode from name
- Check for duplicates
- Create product in database
- Sync variantIds in imageGroups (pre-save hook)
- Auto-generate slug from name
- Calculate totalPrice (quantity × unitPrice)
```

---

### Response Format

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1234567890",
    "name": "PRODUCT NAME",
    "slug": "product-name",
    "quantity": 100,
    "unitPrice": 29.99,
    "totalPrice": 2999,
    "discount": 0,
    "discountType": "-",
    "productCode": "PRODUCT_NAME",
    "description": "",
    "active": false,
    "sku": "SKU123",
    "thumbnail": "https://cloudfront-url/img.webp",
    "images": [
      "https://cloudfront-url/img1.webp",
      "https://cloudfront-url/img2.webp"
    ],
    "categoryId": "cat123",
    "categoryIds": ["cat123", "cat456"],
    "manu_id": "",
    "commissionType": "percentage",
    "commissionRate": 0,
    "hasVariation": true,
    "variation": [
      {
        "id": "uuid-1",
        "size": "M",
        "color": "Red",
        "sku": "sku-red-m",
        "unitPrice": 29.99,
        "quantity": 50,
        "images": ["https://cloudfront-url/variant-img.webp"],
        "imageGroupId": "group-uuid",
        "isActive": true,
        "sortOrder": 0
      },
      {
        "id": "uuid-2",
        "size": "L",
        "color": "Blue",
        "sku": "sku-blue-l",
        "unitPrice": 29.99,
        "quantity": 50,
        "images": [],
        "imageGroupId": "group-uuid-2",
        "isActive": true,
        "sortOrder": 0
      }
    ],
    "imageGroups": [
      {
        "id": "group-uuid",
        "attribute": "color",
        "value": "Red",
        "displayLabel": "Crimson Red",
        "colorHex": "#FF0000",
        "images": ["https://cloudfront-url/img.webp"],
        "variantIds": ["uuid-1"],
        "variantOverrides": [],
        "sortOrder": 0
      },
      {
        "id": "group-uuid-2",
        "attribute": "color",
        "value": "Blue",
        "displayLabel": "Royal Blue",
        "colorHex": "#0000FF",
        "images": ["https://cloudfront-url/img2.webp"],
        "variantIds": ["uuid-2"],
        "variantOverrides": [],
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-06-18T10:00:00.000Z",
    "updatedAt": "2026-06-18T10:00:00.000Z"
  }
}
```

#### Error Responses

**400 - Validation Error**
```json
{
  "error": "Product data validation error",
  "details": [
    {
      "field": "name",
      "message": "\"name\" is required"
    }
  ]
}
```

**400 - Invalid Category**
```json
{
  "success": false,
  "error": "Invalid category IDs: cat789, cat012"
}
```

**403 - Missing Thumbnail**
```json
{
  "success": false,
  "error": "Thumbnail image file is required"
}
```

**403 - Duplicate Product**
```json
{
  "success": false,
  "error": "Product already exist with same name or sku"
}
```

**500 - Internal Server Error**
```json
{
  "success": false,
  "error": "Internal Server Error"
}
```

---

## PUT /api/v1/product/edit

Updates an existing product with support for image uploads, removal, and CRUD operations on ImageGroups.

### Endpoint
```
PUT /api/v1/product/edit
```

### Content Type
```
multipart/form-data
```

### Authentication
```
None (public endpoint)
```

---

### Request Parameters

#### File Upload Fields

Same as Create API:
- `thumbnail` (max 1)
- `images` (max 100)
- `variantImages` (max 100)
- `imageGroupImages` (max 50)

#### Body Parameters

All fields from Create API PLUS the following:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | **Yes** | Product ID to update |
| `removeImageIndexes` | array[string] | No | Array of image URLs to remove from product.images |
| `removeVariantImages` | array[object] | No | Array of variation image removal requests |
| `addImageGroups` | array[object] | No | Add new imageGroups |
| `updateImageGroups` | array[object] | No | Update existing imageGroups |
| `removeImageGroupIds` | array[string] | No | Remove imageGroups by ID |
| `imageGroupImageMappings` | array[object] | No | Map uploaded imageGroupImages (note: plural "Mappings") |

**Note**: `imageGroups` (full replacement) is also supported for backward compatibility.

---

### Additional Data Structures

#### Remove Variant Images Object

```javascript
{
  variationId: string,       // ID of the variation
  imageIndexes: array[number] // Indexes of images to remove (0-based)
}
```

**Example**:
```javascript
[
  {
    "variationId": "uuid-1",
    "imageIndexes": [0, 2, 5]  // Remove images at index 0, 2, and 5
  }
]
```

---

### Business Logic Flow

#### 1. Validation Phase
```javascript
- Run Joi schema validation
- Validate categories if being updated
- Ensure categoryId matches categoryIds[0] if both provided
```

#### 2. Product Lookup Phase
```javascript
- Find product by ID
- Return 404 if not found
```

#### 3. Image Update Phase

**Thumbnail Update**:
```javascript
if new thumbnail uploaded:
  Upload to S3
  Replace existing thumbnail URL
```

**Product Images Update**:
```javascript
if removeImageIndexes provided:
  Filter out specified images from product.images
  Delete removed images from S3 storage

if new images uploaded:
  Upload to S3
  Append new image URLs to product.images
```

**Variant Images Update**:
```javascript
if removeVariantImages provided:
  For each variation:
    Filter out images at specified indexes
    Delete removed images from S3

if new variantImages uploaded:
  Upload to S3
  Assign to variations using variantImageMapping
  Append new images to existing variant images (don't replace)
```

**ImageGroup CRUD Operations**:

```javascript
if removeImageGroupIds provided:
  Filter out specified imageGroups
  Clear imageGroupId reference from affected variations

if addImageGroups provided:
  Validate each group (must have attribute and value)
  Generate UUID for groups without ID
  Sanitize images fields
  Append to imageGroups array

if updateImageGroups provided:
  Validate each group
  Sanitize images fields
  Merge updates into existing imageGroups
  Preserve existing ID and variantIds

if imageGroups provided (full replacement):
  Validate all groups
  Sanitize images fields
  Replace entire imageGroups array
  Re-sync imageGroupId on variations

if new imageGroupImages uploaded:
  Map to imageGroups using imageGroupImageMappings
  Append new images to existing group images
```

#### 4. Variation Update Phase
```javascript
if variation array provided:
  Calculate total quantity from variations
  Update product.quantity
  Update product.totalPrice (quantity × unitPrice)
  Sync imageGroupId on variations
```

#### 5. Product Update Phase
```javascript
- Update basic fields (name, description, price, etc.)
- Update commission fields if provided
- Handle categoryIds (maintain consistency)
- Update variations array
- Sync imageGroupId on variations based on imageGroups
- Save product
- Invalidate inventory report cache
```

#### 6. Notification Phase

The API sends notifications for:
- Discount changes
- Name changes
- Unit price changes
- Active/deactivated status

---

### Response Format

#### Success Response (200 OK)

Same structure as Create response, containing updated product data.

#### Error Responses

**400 - Validation Error**
```json
{
  "error": "Product data validation error",
  "details": [...]
}
```

**404 - Product Not Found**
```json
{
  "success": false,
  "error": "Product not exist"
}
```

**504 - Update Failed**
```json
{
  "success": false,
  "error": "Data Edit Failed"
}
```

**500 - Internal Server Error**
```json
{
  "success": false,
  "error": "Internal Server Error"
}
```

---

## Shared Features

### File Upload System

#### Storage Architecture

The system supports two storage providers via `STORAGE_PROVIDER` environment variable:
- **s3**: AWS S3 + CloudFront (production)
- **local**: Local disk storage (development)

#### Image Processing Pipeline

All uploaded images pass through the following pipeline:

1. **Receive via Multer**
   - Stored in memory (not disk)
   - Max 10MB per file
   - Max 100 files per request

2. **Compress with Sharp**
   - Resize to max 1500px width
   - Convert to WebP format
   - Smart quality adjustment (85-92%)
   - Target size: 400-600KB (550KB optimal)

3. **Upload to S3**
   - Bucket: `AWS_BUCKET_NAME`
   - Key: `img_${timestamp}.webp`
   - Content-Type: `image/webp`

4. **Return CloudFront URL**
   - Format: `https://cloudfront-url/img.webp`

#### Compression Strategy

```javascript
// Intelligent quality estimation
if (inputSize > 4MB) → quality = 87%
if (inputSize > 2MB) → quality = 89%
if (inputSize > 1MB) → quality = 91%
else → quality = 92%

// Binary search optimization
MAX_ITERATIONS: 3
TIMEOUT_MS: 30000 (30 seconds)
```

---

### ImageGroup System

#### Purpose

Enables flexible, attribute-based image organization for variants. Replaces the rigid `colorGroups` approach with a generic system that supports:
- Color
- Material
- Pattern
- Fit
- Any custom attribute

#### Image Resolution Priority Chain

When retrieving images for a variant:

```javascript
1. variant.images              // Variant has unique images (highest priority)
2. imageGroup.variantOverride // Same group, different images for specific variant
3. imageGroup.images          // Shared images for entire group
4. product.images            // Fallback for products without groups
```

#### Auto-Sync Behavior

The system automatically maintains consistency:

```javascript
// Pre-save hook automatically syncs variantIds
if (this.isModified("variation") || this.isModified("imageGroups")) {
  this.imageGroups.forEach((group) => {
    group.variantIds = this.variation
      .filter((v) => v.imageGroupId === group.id)
      .map((v) => v.id);
  });
}
```

#### Instance Methods

```javascript
// Get images for specific variant
product.getImagesForVariant(variantId)
// Returns: variant.images → variantOverride → imageGroup.images → product.images

// Get images for attribute value
product.getImagesForAttribute("color", "Red")
// Returns: imageGroup.images or product.images

// Get all groups by attribute
product.getGroupsByAttribute("color")
// Returns: Array of imageGroups sorted by sortOrder
```

---

### Multi-Category Support

Products can belong to multiple categories:

```javascript
{
  categoryId: string (primary, required),
  categoryIds: [string] (additional categories, optional)
}
```

**Query Support**:
```javascript
// Finds products in category (checks both fields)
productSchema.statics.findByCategory = function (categoryId, includeInactive = false) {
  return this.find({
    $or: [{ categoryId }, { categoryIds: categoryId }],
    deletedAt: null,
    ...(includeInactive ? {} : { active: true })
  });
};
```

**Validation**:
- `categoryId` must equal `categoryIds[0]`
- All category IDs must exist in database

---

### Discount System

```javascript
{
  discount: number,      // Discount amount
  discountType: string   // "%", "flat", or "-"
}
```

**Calculation Priority Chain**:
1. Campaign discount (highest priority)
2. Category discount
3. Product discount (lowest priority)

**Unified Discount Method**:
```javascript
product.calculateDiscountedPrice(campaign, category)
// Returns: { hasDiscount, discount, discountType, discountSource, updatedPrice }
```

---

### Commission System

```javascript
{
  commissionType: "fixed" | "percentage",
  commissionRate: number (0-100 for percentage, 0+ for fixed)
}
```

**Validation**:
- If `commissionType === "percentage"`, max `commissionRate` is 100
- If `commissionType === "fixed"`, no max limit

---

### Soft Delete System

Products are never hard-deleted to maintain data integrity:

```javascript
{
  deletedAt: Date (default: null),
  deletionRequestId: String (indexed),
  previousActiveState: Boolean
}
```

**Query Behavior**:
- All queries must filter: `{ deletedAt: null }`
- Never hard-delete products with order history

---

## Frontend Migration Guide

### Key Differences: Create vs Edit

| Feature | Create | Edit |
|---------|--------|------|
| **Required ID** | Auto-generated | Must provide `id` field |
| **Thumbnail** | Required file upload | Optional (keeps existing if not provided) |
| **Categories** | Validates all provided | Validates only if being changed |
| **Images** | Upload only | Upload + Remove + Append |
| **Variations** | Provide new array | Update existing array |
| **ImageGroups** | Provide new array | CRUD operations available |
| **Notifications** | None | Sends change notifications |
| **Duplicate Check** | Yes | No (updating existing) |
| **Cache Invalidation** | No | Yes (inventory report) |

---

### Image Management Strategies

#### 1. Product Images

**Create API**:
```javascript
// Upload all images at once
FormData.append('images[]', file1);
FormData.append('images[]', file2);
FormData.append('images[]', file3);
```

**Edit API - Add Images**:
```javascript
// Upload new images (they will be appended)
FormData.append('images[]', newFile1);
FormData.append('images[]', newFile2);
```

**Edit API - Remove Images**:
```javascript
// Remove specific images by URL
FormData.append('removeImageIndexes', JSON.stringify([
  'https://cloudfront-url/img1.webp',
  'https://cloudfront-url/img3.webp'
]));

// Or remove all and re-upload (not recommended)
FormData.append('removeImageIndexes', JSON.stringify(product.images));
FormData.append('images[]', newFile1);
```

#### 2. Variant Images

**Create API - Without Mapping** (not recommended):
```javascript
// Upload variant images in the same order as variations
FormData.append('variantImages[]', variantImg1); // For variation[0]
FormData.append('variantImages[]', variantImg2); // For variation[1]
FormData.append('variantImages[]', variantImg3); // For variation[2]

// Result: Sequential assignment (with warning)
```

**Create API - With Mapping** (recommended):
```javascript
// Upload variant images
FormData.append('variantImages[]', redShirtFront.jpg);
FormData.append('variantImages[]', redShirtBack.jpg);
FormData.append('variantImages[]', blueShirtFront.jpg);
FormData.append('variantImages[]', blueShirtBack.jpg);

// Map images to variations
FormData.append('variantImageMapping', JSON.stringify([
  { variantId: 'uuid-red-small', imageIndex: 0 },
  { variantId: 'uuid-red-small', imageIndex: 1 },
  { variantId: 'uuid-blue-small', imageIndex: 2 },
  { variantId: 'uuid-blue-small', imageIndex: 3 }
]));
```

**Edit API - Remove Variant Images**:
```javascript
FormData.append('removeVariantImages', JSON.stringify([
  {
    variationId: 'uuid-red-small',
    imageIndexes: [1]  // Remove image at index 1 (redShirtBack.jpg)
  }
]));

// Note: imageIndexes are 0-based and relative to the variant's current images array
```

**Edit API - Add Variant Images**:
```javascript
// Upload new variant images
FormData.append('variantImages[]', newRedShirtSide.jpg);
FormData.append('variantImages[]', newBlueShirtSide.jpg);

// Map to variations (images are appended, not replaced)
FormData.append('variantImageMapping', JSON.stringify([
  { variantId: 'uuid-red-small', imageIndex: 0 },
  { variantId: 'uuid-blue-small', imageIndex: 1 }
]));
```

#### 3. ImageGroup Images

**Create API**:
```javascript
// Upload imageGroup images
FormData.append('imageGroupImages[]', redFabric.jpg);
FormData.append('imageGroupImages[]', blueFabric.jpg);

// Define imageGroups
FormData.append('imageGroups', JSON.stringify([
  { id: 'group-1', attribute: 'color', value: 'Red', images: [] },
  { id: 'group-2', attribute: 'color', value: 'Blue', images: [] }
]));

// Map images to groups
FormData.append('imageGroupImageMapping', JSON.stringify([
  { groupId: 'group-1', imageIndex: 0 },
  { groupId: 'group-2', imageIndex: 1 }
]));
```

**Edit API - Add ImageGroups**:
```javascript
FormData.append('addImageGroups', JSON.stringify([
  {
    attribute: 'material',
    value: 'Cotton',
    displayLabel: '100% Cotton',
    images: []
  }
]));

// Upload and map images
FormData.append('imageGroupImages[]', cottonFabric.jpg);
FormData.append('imageGroupImageMappings', JSON.stringify([
  { groupId: 'cotton-material-group', imageIndex: 0 }
]));
```

**Edit API - Update ImageGroups**:
```javascript
FormData.append('updateImageGroups', JSON.stringify([
  {
    id: 'group-1',
    displayLabel: 'Crimson Red',  // Update displayLabel
    colorHex: '#FF0000'            // Update colorHex
    // Don't include images if not changing them
  }
]));
```

**Edit API - Remove ImageGroups**:
```javascript
FormData.append('removeImageGroupIds', JSON.stringify([
  'group-1',
  'group-outdated'
]));
```

---

### Common Pitfalls & Solutions

#### Pitfall 1: Inconsistent categoryId and categoryIds

**Problem**:
```javascript
{
  categoryId: 'cat-123',
  categoryIds: ['cat-456', 'cat-789']  // Error: cat-123 !== cat-456
}
```

**Solution**:
```javascript
{
  categoryId: 'cat-123',
  categoryIds: ['cat-123', 'cat-456', 'cat-789']  // Correct
}
```

#### Pitfall 2: Forgetting Thumbnail in Create API

**Problem**: Create API returns 403 error "Thumbnail image file is required"

**Solution**: Always include thumbnail file in FormData:
```javascript
FormData.append('thumbnail', thumbnailFile);
```

#### Pitfall 3: Malformed imageGroups Data

**Problem**: Backend receives stringified array as single string

**Solution**: Always parse and validate:
```javascript
// Wrong
FormData.append('imageGroups', '[{}]', '[{}]');  // Becomes ["[{}]", "[{}]"]

// Correct
FormData.append('imageGroups', JSON.stringify([
  { attribute: 'color', value: 'Red' },
  { attribute: 'color', value: 'Blue' }
]));
```

#### Pitfall 4: Using Wrong Field Name for ImageGroup Mapping

**Problem**: Using `imageGroupImageMapping` (singular) in Edit API

**Solution**: Use plural form in Edit API:
```javascript
// Create API
FormData.append('imageGroupImageMapping', JSON.stringify([...]));

// Edit API
FormData.append('imageGroupImageMappings', JSON.stringify([...]));
```

#### Pitfall 5: Not Handling Image Removal Correctly

**Problem**: Trying to remove images by index instead of URL

**Solution**: Use full URLs for removal:
```javascript
// Wrong
FormData.append('removeImageIndexes', JSON.stringify([0, 2, 5]));

// Correct
FormData.append('removeImageIndexes', JSON.stringify([
  'https://cloudfront-url/img1.webp',
  'https://cloudfront-url/img3.webp'
]));
```

#### Pitfall 6: Forgetting to Stringify JSON Arrays

**Problem**: FormData receives objects as strings "[object Object]"

**Solution**: Always stringify:
```javascript
FormData.append('variation', JSON.stringify(variationArray));
FormData.append('imageGroups', JSON.stringify(imageGroupArray));
FormData.append('variantImageMapping', JSON.stringify(mappingArray));
```

#### Pitfall 7: Assuming Edit API Replaces All Data

**Problem**: Sending partial data in Edit API and expecting fields to be cleared

**Solution**: Edit API only updates fields you send. To clear a field:
```javascript
// To clear imageGroups
FormData.append('removeImageGroupIds', JSON.stringify(
  product.imageGroups.map(g => g.id)
));

// To clear images
FormData.append('removeImageIndexes', JSON.stringify(product.images));
```

#### Pitfall 8: Not Generating UUID for New ImageGroups

**Problem**: Backend generates UUID but frontend doesn't know it for mapping

**Solution**: Generate UUID on frontend:
```javascript
const newGroup = {
  id: uuidv4(),  // Generate on frontend
  attribute: 'color',
  value: 'Red',
  images: []
};

FormData.append('imageGroups', JSON.stringify([newGroup]));
FormData.append('imageGroupImageMapping', JSON.stringify([
  { groupId: newGroup.id, imageIndex: 0 }
]));
```

#### Pitfall 9: Forgetting Commission Field Validation

**Problem**: Sending `commissionRate: 150` with `commissionType: "percentage"`

**Solution**: Validate on frontend:
```javascript
if (commissionType === 'percentage' && commissionRate > 100) {
  // Show error: Commission rate cannot exceed 100% for percentage type
}
```

#### Pitfall 10: Not Handling Image Sanitization

**Problem**: Backend receives malformed image arrays like `"[{}]"`

**Solution**: Backend handles this automatically, but frontend should validate:
```javascript
// Sanitize images field
function sanitizeImages(images) {
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch (e) {
      return [];
    }
  }

  if (!Array.isArray(images)) {
    return [];
  }

  return images.filter(img => typeof img === 'string' && img.length > 0);
}
```

---

### Frontend Implementation Checklist

#### Create Product Form

- [ ] Include thumbnail file (required)
- [ ] Validate name, categoryId, sku (required)
- [ ] Ensure categoryId equals categoryIds[0]
- [ ] Stringify all JSON arrays (variation, imageGroups, mappings)
- [ ] Generate UUID for imageGroups on frontend
- [ ] Handle variant image mapping if using variantImages
- [ ] Handle imageGroup image mapping if using imageGroupImages
- [ ] Validate commission rate based on commission type

#### Edit Product Form

- [ ] Include product ID
- [ ] Use removeImageIndexes for image removal (by URL)
- [ ] Use removeVariantImages for variant image removal (by index)
- [ ] Use imageGroup CRUD operations (add/update/remove)
- [ ] Use imageGroupImageMappings (plural) for mapping
- [ ] Handle partial updates (only send changed fields)
- [ ] Note: Images are appended, not replaced
- [ ] Note: Thumbnail is optional (keeps existing if not provided)

#### General

- [ ] Use multipart/form-data for requests
- [ ] Max file size: 10MB per file
- [ ] Max files: 100 per request
- [ ] Handle 404 errors (product not found)
- [ ] Handle 400 errors (validation, invalid categories)
- [ ] Handle 403 errors (duplicate product, missing thumbnail)
- [ ] Show image compression progress (if possible)

---

## Examples

### Example 1: Create Simple Product (No Variations)

```bash
curl -X POST https://api.example.com/api/v1/product/create \
  -F "name=Cotton T-Shirt" \
  -F "categoryId=cat-123" \
  -F "categoryIds=[\"cat-123\", \"cat-456\"]" \
  -F "sku=TSHIRT-001" \
  -F "unitPrice=29.99" \
  -F "quantity=100" \
  -F "description=Comfortable 100% cotton t-shirt" \
  -F "active=true" \
  -F "thumbnail=@/path/to/thumbnail.jpg" \
  -F "images[]=@/path/to/img1.jpg" \
  -F "images[]=@/path/to/img2.jpg"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1234567890",
    "name": "COTTON T-SHIRT",
    "slug": "cotton-t-shirt",
    "quantity": 100,
    "unitPrice": 29.99,
    "sku": "TSHIRT-001",
    "thumbnail": "https://cloudfront.net/img-123.webp",
    "images": [
      "https://cloudfront.net/img-124.webp",
      "https://cloudfront.net/img-125.webp"
    ],
    "hasVariation": false
  }
}
```

---

### Example 2: Create Product with Variations

```bash
curl -X POST https://api.example.com/api/v1/product/create \
  -F "name=Premium T-Shirt" \
  -F "categoryId=cat-123" \
  -F "sku=PREMIUM-TSHIRT" \
  -F "unitPrice=39.99" \
  -F "variation=[]" \
  -F "variation[]={
    \"size\": \"M\",
    \"color\": \"Red\",
    \"sku\": \"premium-m-red\",
    \"quantity\": 50
  }" \
  -F "variation[]={
    \"size\": \"M\",
    \"color\": \"Blue\",
    \"sku\": \"premium-m-blue\",
    \"quantity\": 50
  }" \
  -F "imageGroups=[]" \
  -F "imageGroups[]={
    \"id\": \"group-red\",
    \"attribute\": \"color\",
    \"value\": \"Red\",
    \"colorHex\": \"#FF0000\"
  }" \
  -F "imageGroups[]={
    \"id\": \"group-blue\",
    \"attribute\": \"color\",
    \"value\": \"Blue\",
    \"colorHex\": \"#0000FF\"
  }" \
  -F "thumbnail=@red-shirt-thumb.jpg" \
  -F "variantImages[]=@red-shirt-front.jpg" \
  -F "variantImages[]=@blue-shirt-front.jpg" \
  -F "variantImageMapping=[]" \
  -F "variantImageMapping[]={
    \"variantId\": \"auto-generated-uuid-1\",
    \"imageIndex\": 0
  }" \
  -F "variantImageMapping[]={
    \"variantId\": \"auto-generated-uuid-2\",
    \"imageIndex\": 1
  }"
```

---

### Example 3: Edit Product - Update Price and Add Images

```bash
curl -X PUT https://api.example.com/api/v1/product/edit \
  -F "id=1234567890" \
  -F "unitPrice=34.99" \
  -F "discount=5" \
  -F "discountType=%" \
  -F "images[]=@/path/to/new-img1.jpg" \
  -F "images[]=@/path/to/new-img2.jpg"
```

---

### Example 4: Edit Product - Remove Images

```bash
curl -X PUT https://api.example.com/api/v1/product/edit \
  -F "id=1234567890" \
  -F "removeImageIndexes=[\"https://cloudfront.net/old-img1.webp\", \"https://cloudfront.net/old-img2.webp\"]" \
  -F "images[]=@/path/to/replacement-img.jpg"
```

---

### Example 5: Edit Product - ImageGroup CRUD Operations

```bash
curl -X PUT https://api.example.com/api/v1/product/edit \
  -F "id=1234567890" \
  -F "addImageGroups=[]" \
  -F "addImageGroups[]={
    \"id\": \"group-green\",
    \"attribute\": \"color\",
    \"value\": \"Green\",
    \"colorHex\": \"#00FF00\"
  }" \
  -F "updateImageGroups=[]" \
  -F "updateImageGroups[]={
    \"id\": \"group-red\",
    \"displayLabel\": \"Crimson Red\"
  }" \
  -F "removeImageGroupIds=[\"group-outdated\"]"
```

---

### Example 6: Edit Product - Manage Variant Images

```bash
curl -X PUT https://api.example.com/api/v1/product/edit \
  -F "id=1234567890" \
  -F "removeVariantImages=[]" \
  -F "removeVariantImages[]={
    \"variationId\": \"uuid-red-small\",
    \"imageIndexes\": [2, 3]
  }" \
  -F "variantImages[]=@new-red-side.jpg" \
  -F "variantImages[]=@new-red-back.jpg" \
  -F "variantImageMapping=[]" \
  -F "variantImageMapping[]={
    \"variantId\": \"uuid-red-small\",
    \"imageIndex\": 0
  }" \
  -F "variantImageMapping[]={
    \"variantId\": \"uuid-red-small\",
    \"imageIndex\": 1
  }"
```

---

### Example 7: Complete Product Creation with All Features

```javascript
// Frontend JavaScript Example
const formData = new FormData();

// Basic fields
formData.append('name', 'Ultra Premium Hoodie');
formData.append('categoryId', 'cat-789');
formData.append('categoryIds', JSON.stringify(['cat-789', 'cat-123', 'cat-456']));
formData.append('sku', 'HOODIE-ULTRA-2024');
formData.append('unitPrice', '89.99');
formData.append('quantity', '0');  // Will be calculated from variations
formData.append('description', 'Premium quality hoodie with custom embroidery');
formData.append('active', 'true');
formData.append('commissionType', 'percentage');
formData.append('commissionRate', '5');

// Variations (3 sizes × 2 colors = 6 variations)
const variations = [
  { size: 'S', color: 'Black', sku: 'hoodie-s-black', quantity: 20, unitPrice: 89.99 },
  { size: 'M', color: 'Black', sku: 'hoodie-m-black', quantity: 30, unitPrice: 89.99 },
  { size: 'L', color: 'Black', sku: 'hoodie-l-black', quantity: 25, unitPrice: 89.99 },
  { size: 'S', color: 'Gray', sku: 'hoodie-s-gray', quantity: 15, unitPrice: 89.99 },
  { size: 'M', color: 'Gray', sku: 'hoodie-m-gray', quantity: 20, unitPrice: 89.99 },
  { size: 'L', color: 'Gray', sku: 'hoodie-l-gray', quantity: 18, unitPrice: 89.99 }
];
formData.append('variation', JSON.stringify(variations));

// ImageGroups (by color)
const imageGroups = [
  { id: 'group-black', attribute: 'color', value: 'Black', colorHex: '#000000', displayLabel: 'Matte Black' },
  { id: 'group-gray', attribute: 'color', value: 'Gray', colorHex: '#808080', displayLabel: 'Cool Gray' }
];
formData.append('imageGroups', JSON.stringify(imageGroups));

// Thumbnail
formData.append('thumbnail', blackHoodieThumbnailFile);

// Product gallery images
formData.append('images[]', productFrontFile);
formData.append('images[]', productBackFile);
formData.append('images[]', productSideFile);
formData.append('images[]', productDetailFile);

// Variant images (12 images total: 2 per variation)
const variantFiles = [
  blackSFront, blackSBack,
  blackMFront, blackMBack,
  blackLFront, blackLBack,
  graySFront, graySBack,
  grayMFront, grayMBack,
  grayLFront, grayLBack
]);
variantFiles.forEach(file => formData.append('variantImages[]', file));

// Map variant images
const variantImageMapping = [
  { variantId: 'auto-uuid-black-s', imageIndex: 0 },
  { variantId: 'auto-uuid-black-s', imageIndex: 1 },
  { variantId: 'auto-uuid-black-m', imageIndex: 2 },
  { variantId: 'auto-uuid-black-m', imageIndex: 3 },
  { variantId: 'auto-uuid-black-l', imageIndex: 4 },
  { variantId: 'auto-uuid-black-l', imageIndex: 5 },
  { variantId: 'auto-uuid-gray-s', imageIndex: 6 },
  { variantId: 'auto-uuid-gray-s', imageIndex: 7 },
  { variantId: 'auto-uuid-gray-m', imageIndex: 8 },
  { variantId: 'auto-uuid-gray-m', imageIndex: 9 },
  { variantId: 'auto-uuid-gray-l', imageIndex: 10 },
  { variantId: 'auto-uuid-gray-l', imageIndex: 11 }
];
formData.append('variantImageMapping', JSON.stringify(variantImageMapping));

// ImageGroup images (fabric closeups)
formData.append('imageGroupImages[]', blackFabricFile);
formData.append('imageGroupImages[]', grayFabricFile);

// Map imageGroup images
const imageGroupImageMapping = [
  { groupId: 'group-black', imageIndex: 0 },
  { groupId: 'group-gray', imageIndex: 1 }
];
formData.append('imageGroupImageMapping', JSON.stringify(imageGroupImageMapping));

// Send request
const response = await fetch('https://api.example.com/api/v1/product/create', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

---

## Database Models

### Product Schema

```javascript
{
  // Identity
  id: String (unique, required, default: uuidv4)
  name: String (required, trimmed, 2-200 chars)
  slug: String (unique, lowercase, auto-generated from name)
  productCode: String (auto-generated from name: NAME_WITH_UNDERSCORES)

  // Pricing
  unitPrice: Number (required, min: 0)
  totalPrice: Number (default: 0, min: 0)
  discount: Number (default: 0, min: 0)
  discountType: String (enum: ["%", "flat", "-"], default: "%")

  // Commission
  commissionType: String (enum: ["fixed", "percentage"], default: "percentage")
  commissionRate: Number (default: 0, min: 0, max: 100 for percentage)

  // Inventory
  quantity: Number (default: 0, min: 0, integer)
  sku: String (required, unique, uppercase, trimmed, max 100 chars)
  hasVariation: Boolean (default: false)
  variation: [variationSchema]

  // Image Groups
  imageGroups: [imageGroupSchema]

  // Media
  thumbnail: String
  images: [String]

  // Categorization
  categoryId: String (required)
  categoryIds: [String] (default: [])
  brand: String
  tags: [String]
  manu_id: String

  // Content
  description: String (max 5000 chars)
  seoTitle: String (max 200 chars)
  seoDescription: String (max 500 chars)

  // Physical attributes
  weight: Number (grams)
  dimensions: {
    length: Number (cm)
    width: Number (cm)
    height: Number (cm)
  }

  // Status
  active: Boolean (default: false)
  deletedAt: Date (default: null, soft delete)
  deletionRequestId: String (indexed)
  previousActiveState: Boolean

  // Ratings
  rating: Number (default: 5, min: 1, max: 5)
  ratingDetails: Array
  review: Array

  // Sales stats (cached, updated by background job)
  totalSold: Number (default: 0)
  totalReturned: Number (default: 0)
  lastPurchasedAt: Date
  lastSalesUpdate: Date

  // Timestamps (auto-managed)
  createdAt: Date
  updatedAt: Date
}
```

### Variation Schema

```javascript
{
  id: String (uuid, auto-generated if not provided)
  size: String
  color: String
  sku: String (lowercased, trimmed)
  unitPrice: Number (default: 0)
  quantity: Number (default: 0)
  barcode: String
  attributes: Map
  imageGroupId: String
  images: [String]
  isActive: Boolean (default: true)
  sortOrder: Number (default: 0)
}
```

### ImageGroup Schema

```javascript
{
  id: String (uuid, required)
  attribute: String (required)
  value: String (required)
  displayLabel: String
  colorHex: String
  images: [String] (default: [])
  variantIds: [String] (auto-synced)
  variantOverrides: [{
    variantId: String,
    images: [String]
  }]
  sortOrder: Number (default: 0)
}
```

---

## Auto-Sync Behavior

### Pre-Save Hooks

The Product model has several pre-save hooks that automatically maintain data consistency:

#### 1. Slug Generation
```javascript
if (this.isModified("name") && this.name) {
  const baseSlug = slugify(this.name, { lower: true, strict: true, trim: true });
  // Handle duplicates: slug-1, slug-2, etc.
}
```

#### 2. ProductCode Generation
```javascript
if (this.isModified("name") && this.name && !this.productCode) {
  this.productCode = this.name.toUpperCase().replace(/\s+/g, "_");
}
```

#### 3. Total Price Calculation
```javascript
if (this.isModified("quantity") || this.isModified("unitPrice")) {
  this.totalPrice = (this.quantity || 0) * (this.unitPrice || 0);
}
```

#### 4. Variation Sync
```javascript
if (this.isModified("variation")) {
  this.hasVariation = this.variation.length > 0;

  // Calculate total quantity from variations
  if (this.hasVariation && this.variation.length > 0) {
    this.quantity = this.variation.reduce((sum, v) => sum + (v.quantity || 0), 0);
    this.totalPrice = this.quantity * this.unitPrice;
  }

  // Ensure every variation has a UUID
  this.variation.forEach((v) => {
    if (!v.id) v.id = uuidv4();
  });
}
```

#### 5. ImageGroup Sync
```javascript
if (this.isModified("variation") || this.isModified("imageGroups")) {
  this.imageGroups.forEach((group) => {
    group.variantIds = this.variation
      .filter((v) => v.imageGroupId === group.id)
      .map((v) => v.id);
  });
}
```

#### 6. Quantity Validation
```javascript
if (this.hasVariation && this.variation && this.variation.length > 0) {
  const calculatedQuantity = this.variation.reduce((sum, v) => sum + (v.quantity || 0), 0);
  if (this.quantity !== calculatedQuantity) {
    this.quantity = calculatedQuantity;
    this.totalPrice = this.quantity * this.unitPrice;
  }
}
```

---

## Error Handling

### Common Error Codes

| Status | Description | Solution |
|--------|-------------|----------|
| 400 | Validation error | Check request body structure and field values |
| 400 | Invalid category IDs | Verify all category IDs exist in database |
| 403 | Thumbnail required | Include thumbnail file in Create API |
| 403 | Duplicate product | Use different name or SKU |
| 404 | Product not found | Verify product ID is correct |
| 504 | Update failed | Retry request or check server logs |
| 500 | Internal server error | Check server logs for details |

### Validation Error Details

Validation errors include detailed information:

```json
{
  "error": "Product data validation error",
  "details": [
    {
      "field": "name",
      "message": "\"name\" is required"
    },
    {
      "field": "sku",
      "message": "\"sku\" is required"
    }
  ]
}
```

---

## Security Considerations

### Authentication

**Current State**: Both Create and Edit APIs are **public** (no authentication required)

**Recommendation**: Implement authentication for production use:
- Add `verifyToken` middleware to route definitions
- Implement role-based access control (admin only)
- Add request rate limiting

### File Upload Security

- **File type validation**: Only images allowed (checked via multer fileFilter)
- **File size limits**: 10MB per file, 100 files max
- **Malformed data handling**: sanitizeImagesField() handles corrupted arrays

### Input Sanitization

- **XSS prevention**: All text fields are trimmed
- **SQL injection**: Mongoose prevents raw SQL queries
- **Regex injection**: escapeRegex() for search queries

---

## Performance Considerations

### Image Upload Optimization

- **Parallel uploads**: All images uploaded simultaneously
- **Compression**: Automatic WebP compression reduces bandwidth
- **Binary search**: Smart quality optimization with max 3 iterations
- **Timeout**: 30-second limit per compression operation

### Database Optimization

- **Indexes**: SKU, slug, categoryIds, deletionRequestId are indexed
- **Soft delete**: Prevents expensive cascade deletions
- **Sales stats caching**: Background job updates totals

### Cache Invalidation

Edit API automatically invalidates inventory report cache:
```javascript
await invalidateInventoryReportCache();
```

---

## Migration Checklist

### For Frontend Team

- [ ] Update API base URL in environment configuration
- [ ] Implement multipart/form-data request handling
- [ ] Add image upload component with compression preview
- [ ] Implement variation UI (size/color combinations)
- [ ] Implement ImageGroup management UI
- [ ] Add image mapping UI for variant images
- [ ] Add image removal functionality (for Edit API)
- [ ] Handle all error codes (400, 403, 404, 500)
- [ ] Add validation for categoryId/categoryIds consistency
- [ ] Add validation for commission rate based on commission type
- [ ] Test Create API with all features enabled
- [ ] Test Edit API with all CRUD operations
- [ ] Test image removal and re-upload scenarios
- [ ] Verify ImageGroup auto-sync behavior
- [ ] Test with large file uploads (near 10MB limit)
- [ ] Test with multiple files (near 100 file limit)
- [ ] Add loading states for file uploads
- [ ] Add progress indicators for image compression
- [ ] Handle network timeouts gracefully
- [ ] Add retry logic for failed uploads

---

## Support

For questions or issues with these APIs, please contact:
- Backend Team: [backend@example.com]
- API Documentation: [docs.example.com]
- Issue Tracker: [github.example.com/issues]

---

## Changelog

### Version 1.0.0 (Current)
- Initial Product API documentation
- Create and Edit endpoints fully documented
- ImageGroup system documented
- Frontend migration guide provided
- Complete examples and error handling

---

**Last Updated**: 2026-06-18
**API Version**: v1
**Documentation Version**: 1.0.0
