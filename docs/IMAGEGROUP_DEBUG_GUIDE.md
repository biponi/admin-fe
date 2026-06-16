# ImageGroup Frontend Debugging Guide

This guide helps you identify and fix the source of incomplete imageGroups being sent from the frontend during product edit operations.

## Issue Summary

When editing a product, you may see these logs:
```
Skipping incomplete imageGroup: missing attribute
Skipping incomplete imageGroup: missing attribute
Filtered out 2 incomplete imageGroups
```

This means the frontend is sending imageGroup objects that are missing required fields (`attribute` or `value`). The backend filters these out with warnings, but the product edit still succeeds.

---

## Quick Diagnostic Steps

### Step 1: Reproduce the Issue
1. Open your browser's Developer Tools (F12)
2. Go to the **Network** tab
3. Edit a product in your admin panel
4. Look for the `PUT /api/v1/product/edit` request
5. Click on it and examine the **Payload** or **Request** tab

### Step 2: Identify Which Parameter is Being Sent

In the request payload, check which parameter contains imageGroups:

| Parameter | Purpose | Validation |
|-----------|---------|------------|
| `imageGroups` | Full replacement of ALL imageGroups | **STRICT**: Must have `attribute` AND `value` |
| `addImageGroups` | Add NEW imageGroups to existing | **STRICT**: Must have `attribute` AND `value` |
| `updateImageGroups` | Update EXISTING imageGroups | **SMART**: Only validates if setting `attribute` or `value` |
| `removeImageGroupIds` | Remove imageGroups by ID | No validation (array of IDs) |

### Step 3: Examine the ImageGroup Objects

Look at the imageGroup objects in the payload. Each one should have:

**Required Fields:**
- `attribute` (string): e.g., "color", "material", "pattern", "size"
- `value` (string): e.g., "Red", "Cotton", "Striped", "Large"

**Optional Fields:**
- `id` (string): UUID for existing imageGroups
- `displayLabel` (string): Human-readable label
- `colorHex` (string): Hex color code (for color attributes only)
- `images` (array): Array of image URLs
- `variantOverrides` (array): Per-variant image overrides

### Step 4: Identify Incomplete Objects

Look for imageGroup objects that are missing:
- ❌ `attribute` field
- ❌ `value` field
- ❌ Both fields
- ❌ Empty strings for either field

---

## Common Frontend Issues to Check

### Issue 1: Missing Form Validation

**Problem**: The frontend form doesn't validate that both `attribute` and `value` are filled before allowing submission.

**What to Check**:
```javascript
// In your product edit form component:
const imageGroupForm = {
  attribute: '', // Should be required
  value: '',     // Should be required
  images: []
}

// Look for validation logic like:
if (!imageGroup.attribute || !imageGroup.value) {
  // Show error to user
  return;
}
```

**Solution**: Add required field validation:
```javascript
const validateImageGroup = (group) => {
  if (!group.attribute || group.attribute.trim() === '') {
    throw new Error('Attribute is required');
  }
  if (!group.value || group.value.trim() === '') {
    throw new Error('Value is required');
  }
  return true;
};

// Validate before adding to array
if (validateImageGroup(newImageGroup)) {
  imageGroups.push(newImageGroup);
}
```

---

### Issue 2: Using Wrong Parameter for Partial Updates

**Problem**: Trying to partially update imageGroups (e.g., only updating images) but using `imageGroups` or `addImageGroups` instead of `updateImageGroups`.

**What to Check**:
```javascript
// ❌ WRONG: Using imageGroups for partial update
const payload = {
  imageGroups: [
    {
      id: 'abc-123',
      images: ['new-image.jpg']  // Missing attribute and value!
    }
  ]
};

// ✅ CORRECT: Using updateImageGroups for partial update
const payload = {
  updateImageGroups: [
    {
      id: 'abc-123',
      images: ['new-image.jpg']  // Only update images
    }
  ]
};
```

**When to Use Each Parameter**:

| Scenario | Use This Parameter |
|----------|-------------------|
| Adding NEW imageGroups to a product | `addImageGroups` |
| Updating EXISTING imageGroups (partial or full) | `updateImageGroups` |
| Replacing ALL imageGroups | `imageGroups` |
| Deleting imageGroups | `removeImageGroupIds` |

---

### Issue 3: State Management Issues

**Problem**: The component state initializes imageGroups with incomplete objects, or doesn't properly clean up when users cancel/delete.

**What to Check**:
```javascript
// ❌ WRONG: Initializing with empty objects
const [imageGroups, setImageGroups] = useState([
  { attribute: '', value: '', images: [] }  // Incomplete!
]);

// ✅ CORRECT: Initialize with empty array or complete objects
const [imageGroups, setImageGroups] = useState([]);
// OR
const [imageGroups, setImageGroups] = useState([
  { attribute: 'color', value: 'Red', images: [] }  // Complete
]);

// When user clicks "Add ImageGroup":
const handleAddImageGroup = () => {
  // ❌ WRONG: Adding empty object
  setImageGroups([...imageGroups, {}]);

  // ✅ CORRECT: Show form first, validate, then add
  setShowImageGroupForm(true);
};

// When user saves the form:
const handleSaveImageGroup = (formData) => {
  if (!formData.attribute || !formData.value) {
    alert('Please fill in all required fields');
    return;
  }
  setImageGroups([...imageGroups, formData]);
  setShowImageGroupForm(false);
};
```

---

### Issue 4: Data Transformation Issues

**Problem**: The frontend transforms data from one format to another and loses fields in the process.

**What to Check**:
```javascript
// ❌ WRONG: Mapping loses fields
const imageGroups = variants.map(variant => ({
  id: variant.imageGroupId,  // Missing attribute and value!
  images: variant.images
}));

// ✅ CORRECT: Preserve all fields
const imageGroups = variants.map(variant => ({
  id: variant.imageGroupId,
  attribute: variant.attribute,
  value: variant.value,
  images: variant.images
}));

// OR: Look up the complete imageGroup data
const imageGroups = variants
  .map(variant => {
    const group = allImageGroups.find(g => g.id === variant.imageGroupId);
    return group ? { ...group } : null;
  })
  .filter(Boolean);
```

---

### Issue 5: File Upload Handling

**Problem**: When users upload images for imageGroups, the frontend creates a new imageGroup object but doesn't copy over the attribute/value fields.

**What to Check**:
```javascript
// When uploading imageGroupImages:
const handleImageGroupImageUpload = async (files, imageGroupId) => {
  const uploadedUrls = await uploadFiles(files);

  // ❌ WRONG: Creating new object without existing fields
  const updatedGroup = {
    id: imageGroupId,
    images: uploadedUrls  // Missing attribute and value!
  };

  // ✅ CORRECT: Update existing group
  const updatedGroup = imageGroups.find(g => g.id === imageGroupId);
  if (updatedGroup) {
    updatedGroup.images = uploadedUrls;
  }

  // ✅ CORRECT: Or use updateImageGroups parameter
  const payload = {
    updateImageGroups: [{
      id: imageGroupId,
      images: uploadedUrls
    }]
  };
};
```

---

## Request Payload Examples

### Example 1: Correct Complete ImageGroups

**Scenario**: Adding new imageGroups with all required fields

```json
{
  "addImageGroups": [
    {
      "attribute": "color",
      "value": "Red",
      "displayLabel": "Red Color",
      "colorHex": "#FF0000",
      "images": ["red-shirt-1.jpg", "red-shirt-2.jpg"]
    },
    {
      "attribute": "size",
      "value": "Large",
      "displayLabel": "Large Size",
      "images": ["large-shirt-1.jpg"]
    }
  ]
}
```

✅ **This will work** - All objects have both `attribute` and `value`

---

### Example 2: Incorrect - Missing Attribute

**Scenario**: This triggers the warning "Skipping incomplete imageGroup: missing attribute"

```json
{
  "addImageGroups": [
    {
      "value": "Red",
      "images": ["red-shirt-1.jpg"]
    }
  ]
}
```

❌ **This will be filtered out** - Missing `attribute` field

---

### Example 3: Incorrect - Missing Value

**Scenario**: This triggers the warning "Skipping incomplete imageGroup: missing value"

```json
{
  "addImageGroups": [
    {
      "attribute": "color",
      "images": ["red-shirt-1.jpg"]
    }
  ]
}
```

❌ **This will be filtered out** - Missing `value` field

---

### Example 4: Incorrect - Empty Strings

**Scenario**: Empty strings are treated as missing

```json
{
  "addImageGroups": [
    {
      "attribute": "",
      "value": "Red",
      "images": ["red-shirt-1.jpg"]
    }
  ]
}
```

❌ **This will be filtered out** - Empty `attribute` string

---

### Example 5: Correct - Using updateImageGroups for Partial Update

**Scenario**: Only updating images, not changing attribute/value

```json
{
  "updateImageGroups": [
    {
      "id": "abc-123-def-456",
      "images": ["new-image-1.jpg", "new-image-2.jpg"]
    }
  ]
}
```

✅ **This will work** - Using `updateImageGroups` allows partial updates without `attribute`/`value`

---

### Example 6: Incorrect - Partial Update with Wrong Parameter

**Scenario**: Trying to do partial update but using `imageGroups` parameter

```json
{
  "imageGroups": [
    {
      "id": "abc-123-def-456",
      "images": ["new-image-1.jpg"]
    }
  ]
}
```

❌ **This will be filtered out** - Using `imageGroups` requires ALL fields including `attribute` and `value`

---

## Browser Console Debugging

### Technique 1: Log Data Before Sending

Add this code in your product edit submit handler:

```javascript
const handleProductEdit = async (formData) => {
  // Add this logging
  console.log('=== Product Edit Payload ===');
  console.log('addImageGroups:', formData.addImageGroups);
  console.log('updateImageGroups:', formData.updateImageGroups);
  console.log('imageGroups:', formData.imageGroups);

  // Validate imageGroups
  const validateAndLog = (groups, paramName) => {
    if (!groups) return;
    groups.forEach((group, index) => {
      console.log(`${paramName}[${index}]:`, group);
      if (!group.attribute) {
        console.error(`  ❌ Missing 'attribute' field`);
      }
      if (!group.value) {
        console.error(`  ❌ Missing 'value' field`);
      }
    });
  };

  validateAndLog(formData.addImageGroups, 'addImageGroups');
  validateAndLog(formData.updateImageGroups, 'updateImageGroups');
  validateAndLog(formData.imageGroups, 'imageGroups');

  // Then send the request
  const response = await fetch('/api/v1/product/edit', {
    method: 'PUT',
    body: formData
  });
};
```

### Technique 2: Add Breakpoints

1. Open your product edit component file
2. Find the function that submits the form
3. Add a breakpoint on the line that creates the payload
4. When the breakpoint hits, examine the variables in the console:

```javascript
// In the console when paused at breakpoint:
// Check all imageGroup arrays
imageGroups.forEach((group, i) => {
  console.log(`Group ${i}:`, group);
  console.log(`  Has attribute:`, !!group.attribute);
  console.log(`  Has value:`, !!group.value);
});
```

### Technique 3: Network Tab Inspection

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Edit a product
4. Find the `/api/v1/product/edit` request
5. Click on it
6. Go to "Payload" or "Request" tab
7. Look for these parameters:
   - `addImageGroups`
   - `updateImageGroups`
   - `imageGroups`
8. Expand each array and check if objects have `attribute` and `value`

### Technique 4: Monitor Network in Real-Time

Add this to your browser console before editing a product:

```javascript
// Monitor all fetch requests
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const [url, options] = args;
  if (url.includes('/api/v1/product/edit')) {
    console.log('=== Product Edit Request ===');
    console.log('URL:', url);

    // If FormData
    if (options.body instanceof FormData) {
      const addImageGroups = options.body.get('addImageGroups');
      const updateImageGroups = options.body.get('updateImageGroups');
      const imageGroups = options.body.get('imageGroups');

      if (addImageGroups) {
        try {
          console.log('addImageGroups:', JSON.parse(addImageGroups));
        } catch (e) {
          console.log('addImageGroups (raw):', addImageGroups);
        }
      }

      if (updateImageGroups) {
        try {
          console.log('updateImageGroups:', JSON.parse(updateImageGroups));
        } catch (e) {
          console.log('updateImageGroups (raw):', updateImageGroups);
        }
      }

      if (imageGroups) {
        try {
          console.log('imageGroups:', JSON.parse(imageGroups));
        } catch (e) {
          console.log('imageGroups (raw):', imageGroups);
        }
      }
    }
  }
  return originalFetch.apply(this, args);
};
```

---

## Frontend Code Locations to Check

Based on your project structure, check these locations:

### 1. Product Edit Component/Page

**Look for files like**:
- `src/components/ProductEdit.js`
- `src/pages/ProductEdit.jsx`
- `src/components/admin/ProductEditForm.js`
- `src/views/Product/Edit.vue`

**What to check**:
- Form state initialization
- ImageGroup form component
- Submit handler
- API call construction

### 2. ImageGroup Component

**Look for files like**:
- `src/components/ImageGroupForm.js`
- `src/components/product/ImageGroupSelector.jsx`
- `src/components/admin/AttributeImageGroup.vue`

**What to check**:
- Attribute dropdown/input
- Value input
- Form validation
- Add/Edit handlers

### 3. API Service Layer

**Look for files like**:
- `src/services/productService.js`
- `src/api/products.js`
- `src/utils/api.js`

**What to check**:
- `updateProduct()` or `editProduct()` function
- How it constructs the payload
- Which parameters it uses

### 4. State Management

**Look for files like**:
- `src/store/productSlice.js` (Redux)
- `src/context/ProductContext.jsx` (Context)
- `src/stores/productStore.js` (Pinia/Zustand)

**What to check**:
- ImageGroup state initialization
- Update actions
- Selectors

### 5. File Upload Handler

**Look for files like**:
- `src/utils/fileUpload.js`
- `src/services/uploadService.js`
- `src/components/FileUpload.jsx`

**What to check**:
- How it handles imageGroupImages
- Whether it creates new objects or updates existing ones

---

## Testing Scenarios

### Test Case 1: Add New ImageGroup

**Steps**:
1. Open product edit page
2. Click "Add ImageGroup"
3. Fill in attribute and value
4. Upload images
5. Save product

**Expected**: ✅ No warnings in logs
**Bug**: ❌ Warnings about missing fields

**Check in Network tab**:
```json
{
  "addImageGroups": [
    {
      "attribute": "color",
      "value": "Red",
      "images": ["..."]
    }
  ]
}
```

---

### Test Case 2: Update Existing ImageGroup Images Only

**Steps**:
1. Open product edit page
2. Find existing imageGroup (e.g., Color: Red)
3. Upload new images for it
4. Save product

**Expected**: ✅ No warnings in logs
**Bug**: ❌ Warnings about missing fields

**Check in Network tab**:
```json
{
  "updateImageGroups": [
    {
      "id": "existing-uuid",
      "images": ["new-image.jpg"]
    }
  ]
}
```

---

### Test Case 3: Update ImageGroup Attribute and Value

**Steps**:
1. Open product edit page
2. Find existing imageGroup
3. Change attribute from "color" to "size"
4. Change value from "Red" to "Large"
5. Save product

**Expected**: ✅ No warnings in logs
**Bug**: ❌ Warnings about missing fields

**Check in Network tab**:
```json
{
  "updateImageGroups": [
    {
      "id": "existing-uuid",
      "attribute": "size",
      "value": "Large"
    }
  ]
}
```

---

### Test Case 4: Delete ImageGroup

**Steps**:
1. Open product edit page
2. Find existing imageGroup
3. Click delete/remove
4. Save product

**Expected**: ✅ No warnings in logs
**Bug**: ❌ Warnings about missing fields

**Check in Network tab**:
```json
{
  "removeImageGroupIds": ["uuid-to-delete"]
}
```

---

### Test Case 5: Add Incomplete ImageGroup (Should Fail on Frontend)

**Steps**:
1. Open product edit page
2. Click "Add ImageGroup"
3. Fill in only attribute (leave value empty)
4. Try to save

**Expected**: ✅ Frontend validation error (don't send to backend)
**Bug**: ❌ Form submits and backend warns about missing fields

**Check Console**: Should see validation error before request is sent

---

## Verification Steps

### After Fixing Frontend

1. **Clear browser cache** and reload
2. **Open browser DevTools** (Console and Network tabs)
3. **Edit a product** and modify imageGroups
4. **Check Console**:
   - Should NOT see validation warnings
   - Should see your debug logs (if you added them)
5. **Check Network tab**:
   - Verify the parameter being used matches your intent
   - Verify all imageGroup objects have `attribute` and `value` (unless using `updateImageGroups` for partial updates)
6. **Check server logs**:
   - Should NOT see "Skipping incomplete imageGroup" warnings
   - Should see normal processing logs

### Expected Success Message in Server Logs

```bash
# Instead of warnings, you should see:
Processing addImageGroups: 2 groups
Adding 2 valid imageGroups to product
ImageGroups sync complete
Product saved successfully
```

---

## Backend Validation Reference

For reference, here's what the backend validates:

**File**: [routes/v1/Product/controllers.js](routes/v1/Product/controllers.js)

**Lines 798-806** (addImageGroups):
```javascript
const validGroups = newGroups.filter((group) => {
  if (!group.attribute || !group.value) {
    console.warn(`Skipping incomplete imageGroup in addImageGroups: missing ${!group.attribute ? 'attribute' : 'value'}`);
    return false;
  }
  return true;
});
```

**Lines 837-848** (updateImageGroups):
```javascript
const validGroups = groupsToUpdate.filter((group) => {
  // Only validates if you're setting one of the fields
  if (group.attribute !== undefined && group.value === undefined) {
    console.warn(`Skipping incomplete imageGroup in updateImageGroups: has attribute but missing value`);
    return false;
  }
  if (group.attribute === undefined && group.value !== undefined) {
    console.warn(`Skipping incomplete imageGroup in updateImageGroups: has value but missing attribute`);
    return false;
  }
  return true;
});
```

**Lines 886-892** (imageGroups - full replacement):
```javascript
const validGroups = groupsToReplace.filter((group) => {
  if (!group.attribute || !group.value) {
    console.warn(`Skipping incomplete imageGroup: missing ${!group.attribute ? 'attribute' : 'value'}`);
    return false;
  }
  return true;
});
```

---

## Quick Checklist

Use this checklist to debug your frontend:

- [ ] Open DevTools Network tab before editing product
- [ ] Identify which parameter is being sent (`addImageGroups`, `updateImageGroups`, or `imageGroups`)
- [ ] Check if the parameter matches your intent (add vs update vs replace)
- [ ] Examine each imageGroup object in the payload
- [ ] Verify all new/complete groups have both `attribute` and `value`
- [ ] Check for empty strings (`""`) in these fields
- [ ] Look for null or undefined values
- [ ] Add console.log debugging in form submit handler
- [ ] Check form validation logic
- [ ] Verify state initialization doesn't create incomplete objects
- [ ] Check file upload handler doesn't lose fields
- [ ] Test with the scenarios above
- [ ] Verify server logs show no warnings after fix

---

## Next Steps After Frontend Fix

Once you've fixed the frontend:

1. **Deploy frontend fix**
2. **Monitor server logs** for 24-48 hours
3. **Verify no more "Skipping incomplete imageGroup" warnings**
4. **Check database** for any products with incomplete imageGroups that were created before the fix:
   ```javascript
   // Run in MongoDB shell:
   db.products.find({
     $or: [
       { "imageGroups.attribute": { $exists: false } },
       { "imageGroups.value": { $exists: false } },
       { "imageGroups.attribute": "" },
       { "imageGroups.value": "" }
     ]
   })
   ```
5. **Clean up existing incomplete data** if found (using a migration script or manual edit)

---

## Need Help?

If you're still stuck after following this guide:

1. **Collect this information**:
   - Network request payload (screenshot or copy)
   - Browser console logs
   - Server logs for the request
   - Frontend component code handling imageGroups

2. **Check the backend API documentation** (if available) for expected request format

3. **Contact backend team** with the collected information

---

**Document Version**: 1.0
**Last Updated**: 2026-06-16
**Related Backend Files**:
- [routes/v1/Product/controllers.js](routes/v1/Product/controllers.js) (lines 798-905)
- [routes/v1/Product/routes.js](routes/v1/Product/routes.js) (line 46-54)
- [model/product.js](model/product.js) (lines 28-82)
