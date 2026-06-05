# Multi-Category Products - Quick Reference Guide

## For Developers

### Using the MultiCategorySelect Component

```tsx
import MultiCategorySelect from "@/components/customComponent/MultiCategorySelect";

function MyComponent() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  return (
    <MultiCategorySelect
      categories={categoriesList}
      selectedCategoryIds={selectedCategories}
      setSelectedCategoryIds={setSelectedCategories}
      maxCategories={5} // Optional, default is 5
      disabled={false} // Optional
    />
  );
}
```

### Creating a Product with Multiple Categories

```typescript
const productData: IProductCreateData = {
  name: "Product Name",
  quantity: 100,
  unitPrice: 2999,
  categoryId: selectedCategories[0], // First = primary
  categoryIds: selectedCategories,   // All categories
  sku: "SKU-123",
  thumbnail: file,
  images: [file1, file2],
  // ... other fields
};

await createProduct(productData);
```

### Updating Product Categories

```typescript
const updateData: IProductUpdateData = {
  id: "product-id",
  name: "Updated Name",
  categoryId: newCategories[0], // First = primary
  categoryIds: newCategories,   // Updated list
  // ... other fields
};

await editProduct(updateData);
```

### Adding/Removing Categories (Helper Functions)

```typescript
import { addCategoryToProduct, removeCategoryFromProduct } from "@/api/product";

// Add category
const result = await addCategoryToProduct("product-id", "category-id");
if (result.success) {
  console.log("Updated categories:", result.data.categoryIds);
}

// Remove category
const result = await removeCategoryFromProduct("product-id", "category-id");
if (result.success) {
  console.log("Updated categories:", result.data.categoryIds);
}
```

### Displaying Categories in Components

```tsx
interface Props {
  categoryName?: string;      // Deprecated, for backward compat
  categoryNames?: string[];   // New, preferred field
}

function ProductCard({ categoryName, categoryNames }: Props) {
  return (
    <div>
      {categoryNames && categoryNames.length > 0 ? (
        <div className="flex gap-2">
          {categoryNames.map((cat, idx) => (
            <Badge key={idx} variant={idx === 0 ? "default" : "secondary"}>
              {cat}
            </Badge>
          ))}
        </div>
      ) : (
        <Badge>{categoryName || "Uncategorized"}</Badge>
      )}
    </div>
  );
}
```

## For Backend Developers

### Request Format

**Create Product with Multiple Categories:**
```http
POST /api/v1/product
Content-Type: multipart/form-data

categoryId: electronics
categoryIds: ["electronics", "audio", "bluetooth-devices"]
name: Wireless Headphones
quantity: 100
unitPrice: 2999
thumbnail: [file]
images: [file1, file2]
```

**Update Product Categories:**
```http
PUT /api/v1/product/modify
Content-Type: multipart/form-data

id: product-id
categoryId: electronics
categoryIds: ["electronics", "sale-items"]
name: Updated Name
```

**Add Category to Product:**
```http
POST /api/v1/product/add-category
Content-Type: application/json

{
  "productId": "product-id",
  "categoryId": "category-id"
}
```

**Remove Category from Product:**
```http
POST /api/v1/product/remove-category
Content-Type: application/json

{
  "productId": "product-id",
  "categoryId": "category-id"
}
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "12345",
    "name": "Wireless Headphones",
    "categoryId": "electronics",
    "categoryIds": ["electronics", "audio", "bluetooth-devices"],
    "quantity": 100,
    "unitPrice": 2999
  }
}
```

**Error Response - Invalid Category:**
```json
{
  "success": false,
  "message": "Invalid category IDs: cat999, cat888"
}
```

**Error Response - Category Mismatch:**
```json
{
  "success": false,
  "message": "categoryId must match categoryIds[0] for consistency"
}
```

**Error Response - Cannot Remove Last Category:**
```json
{
  "success": false,
  "message": "Cannot remove the last category. Product must belong to at least one category."
}
```

**Error Response - Cannot Remove Primary Category:**
```json
{
  "success": false,
  "message": "Cannot remove primary category. Update categoryId first if you want to remove this category."
}
```

## Data Structure

### Product Schema
```typescript
{
  id: string;
  name: string;
  categoryId: string;              // Primary category (first in array)
  categoryIds: string[];           // All category IDs
  categoryName?: string;           // @deprecated - Use categoryNames
  categoryNames?: string[];        // All category names (from backend)
  quantity: number;
  unitPrice: number;
  // ... other fields
}
```

### Category Selection
```typescript
{
  categoryId: string;      // Must equal categoryIds[0]
  categoryIds: string[];   // Array of category IDs
}
```

## Validation Rules

1. **Minimum Categories**: 1 (required)
2. **Maximum Categories**: 5 (configurable)
3. **Primary Category**: Must be first in `categoryIds` array
4. **Field Consistency**: `categoryId` must equal `categoryIds[0]`
5. **Remove Protection**:
   - Cannot remove the only category
   - Cannot remove primary category (must update `categoryId` first)

## Common Scenarios

### Scenario 1: Create Product with Single Category
```typescript
const data = {
  categoryId: "electronics",
  categoryIds: ["electronics"],
  // ... other fields
};
```

### Scenario 2: Create Product with Multiple Categories
```typescript
const data = {
  categoryId: "electronics",              // Primary
  categoryIds: ["electronics", "audio", "sale-items"],
  // ... other fields
};
```

### Scenario 3: Add Category to Existing Product
```typescript
await addCategoryToProduct("prod-123", "bestsellers");
// Result: categoryIds becomes ["electronics", "audio", "bestsellers"]
```

### Scenario 4: Remove Category (Not Primary)
```typescript
await removeCategoryFromProduct("prod-123", "sale-items");
// Result: categoryIds becomes ["electronics", "audio"]
```

### Scenario 5: Change Primary Category
```typescript
// To change primary, reorder the array
const data = {
  categoryId: "audio",              // New primary
  categoryIds: ["audio", "electronics", "sale-items"], // Audio first
  // ... other fields
};
```

## Troubleshooting

### Issue: "categoryId must match categoryIds[0]"
**Solution**: Ensure `categoryId` is set to the first item in `categoryIds` array
```typescript
categoryIds: ["cat1", "cat2", "cat3"]
categoryId: "cat1"  // Must match categoryIds[0]
```

### Issue: Cannot remove last category
**Solution**: Products must have at least 1 category. Add a new category before removing the last one.

### Issue: Categories not displaying
**Solution**: Check if backend returns `categoryNames` array. Falls back to `categoryName` string.

### Issue: Multi-select shows wrong categories
**Solution**: Ensure `selectedCategoryIds` prop is an array of strings, not objects.

## Testing Checklist

- [ ] Single category product creation
- [ ] Multi-category product creation (2, 3, 4, 5)
- [ ] Attempt creation with 0 categories (should fail)
- [ ] Attempt creation with 6+ categories (should limit)
- [ ] Edit single-category → multi-category
- [ ] Edit multi-category → single category
- [ ] Remove non-primary category
- [ ] Attempt to remove last category (should fail)
- [ ] Attempt to remove primary category (should fail)
- [ ] Add category via helper endpoint
- [ ] Remove category via helper endpoint
- [ ] Display on desktop view
- [ ] Display on mobile view
- [ ] Search functionality in multi-select
- [ ] Nested category selection
- [ ] Backward compatibility with old products

## Performance Considerations

1. **Category Loading**: Categories are loaded once and cached
2. **Hierarchy Building**: Uses `useMemo` for optimization
3. **Search**: Client-side filtering for instant results
4. **Badge Display**: Limits to 2 visible badges to prevent overflow

## Accessibility

- ✅ Keyboard navigation support
- ✅ ARIA labels on dropdown
- ✅ Screen reader friendly
- ✅ High contrast badge variants
- ✅ Clear focus indicators

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
