# Product Stock Adjustment - Complete Implementation Guide

## Overview
This guide shows how to implement the Product Stock Adjustment system using shadcn/ui components in your existing product management workflow.

---

## 🎯 What's New

We've created modern, shadcn/ui-based components for product stock adjustments:

1. **ProductAdjustmentDialog** - Beautiful dialog for stock adjustments
2. **ProductAdjustmentHistory** - Timeline view of all adjustments
3. **Integration with existing product list** - Already integrated!

---

## 📦 Components Created

### 1. ProductAdjustmentDialog
**Location:** `src/pages/product/components/ProductAdjustmentDialog.tsx`

Modern dialog component for adjusting product stock with:
- ✅ shadcn/ui Dialog/Sheet support (responsive)
- ✅ Form validation
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling
- ✅ Audit trail support

**Props:**
```typescript
interface ProductAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  productSku?: string;
  currentStock: number;
  onSuccess?: () => void;
  useSheet?: boolean; // For mobile responsive
}
```

### 2. ProductAdjustmentHistory
**Location:** `src/pages/product/components/ProductAdjustmentHistory.tsx`

Timeline component showing all stock adjustments with:
- ✅ Paginated history
- ✅ Desktop table view
- ✅ Mobile card view
- ✅ User information
- ✅ Reason tracking
- ✅ Reference numbers

**Props:**
```typescript
interface ProductAdjustmentHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  useSheet?: boolean; // For mobile responsive
}
```

---

## 🚀 Quick Start

### Already Integrated in Product List!

The product list (`singleProductList.tsx`) has been updated to include:
- **Adjust Stock** menu item
- **View History** menu item

Just refresh your product list and you'll see the new options in the dropdown menu!

### Usage in Product List

```typescript
// In src/pages/product/components/singleProductList.tsx

// Already added for you:
<DropdownMenuItem onClick={() => setAdjustDialogOpen(true)}>
  <PackageSearch className='h-4 w-4 mr-2' />
  Adjust Stock
</DropdownMenuItem>

<DropdownMenuItem onClick={() => setHistoryDialogOpen(true)}>
  <History className='h-4 w-4 mr-2' />
  View History
</DropdownMenuItem>

// Dialogs automatically render
<ProductAdjustmentDialog
  open={adjustDialogOpen}
  onOpenChange={setAdjustDialogOpen}
  productId={id}
  productName={title}
  productSku={sku}
  currentStock={quantity}
  onSuccess={() => {
    refreshProductList?.();
  }}
/>

<ProductAdjustmentHistory
  open={historyDialogOpen}
  onOpenChange={setHistoryDialogOpen}
  productId={id}
  productName={title}
/>
```

---

## 💡 How to Use

### For Users:

1. **Navigate to Product List**
   - Go to your product management page
   - Find the product you want to adjust

2. **Open Actions Menu**
   - Click the three dots (⋮) on any product row
   - You'll see new options:
     - **Adjust Stock** - Make stock adjustments
     - **View History** - See all past adjustments

3. **Adjust Stock**
   - Select adjustment type:
     - **Add Stock** - Increase inventory (e.g., new shipment)
     - **Remove Stock** - Decrease inventory (e.g., damage, theft)
     - **Set Exact Stock** - Set to specific number (e.g., physical count)
   - Enter quantity
   - Provide reason (minimum 5 characters) - **REQUIRED**
   - Optionally add notes and reference number (PO, Invoice)
   - Click "Adjust Stock"

4. **View History**
   - See all adjustments for the product
   - View who made changes
   - See reasons and timestamps
   - Navigate through pages if there are many adjustments

---

## 🔧 Integration in Other Pages

### Example 1: Product Detail Page

```typescript
import { useState } from 'react';
import { ProductAdjustmentDialog } from '@/pages/product/components/ProductAdjustmentDialog';
import { ProductAdjustmentHistory } from '@/pages/product/components/ProductAdjustmentHistory';
import { Button } from '@/components/ui/button';

const ProductDetailPage = ({ product }) => {
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const refreshProduct = () => {
    // Refetch product data
  };

  return (
    <div>
      <h1>{product.name}</h1>
      <p>Current Stock: {product.quantity}</p>

      <div className="flex gap-2">
        <Button onClick={() => setAdjustOpen(true)}>
          Adjust Stock
        </Button>
        <Button variant="outline" onClick={() => setHistoryOpen(true)}>
          View History
        </Button>
      </div>

      <ProductAdjustmentDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        productId={product.id}
        productName={product.name}
        productSku={product.sku}
        currentStock={product.quantity}
        onSuccess={refreshProduct}
      />

      <ProductAdjustmentHistory
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        productId={product.id}
        productName={product.name}
      />
    </div>
  );
};
```

### Example 2: Mobile View with Sheet

```typescript
import { ProductAdjustmentDialog } from '@/pages/product/components/ProductAdjustmentDialog';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const MobileProductCard = ({ product }) => {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <>
      <Button onClick={() => setOpen(true)}>Adjust</Button>

      <ProductAdjustmentDialog
        open={open}
        onOpenChange={setOpen}
        productId={product.id}
        productName={product.name}
        currentStock={product.quantity}
        useSheet={isMobile} // Use Sheet on mobile, Dialog on desktop
        onSuccess={() => refetchProduct()}
      />
    </>
  );
};
```

### Example 3: Programmatic Adjustment

```typescript
import { useProductAdjustment } from '@/hooks/useProductAdjustment';
import { useToast } from '@/components/ui/use-toast';

const InventoryManager = () => {
  const { adjustStock, isLoading } = useProductAdjustment();
  const { toast } = useToast();

  const handleBulkReceive = async (products) => {
    for (const product of products) {
      const result = await adjustStock({
        productId: product.id,
        adjustmentType: 'add',
        quantity: product.receivedQuantity,
        reason: 'Bulk shipment received from supplier',
        referenceNumber: 'PO-2024-1234',
      });

      if (result) {
        toast({
          title: 'Stock Updated',
          description: `${product.name}: ${result.product.oldQuantity} → ${result.product.newQuantity}`,
        });
      }
    }
  };

  return (
    <Button onClick={handleBulkReceive} disabled={isLoading}>
      Process Shipment
    </Button>
  );
};
```

---

## 🎨 Features

### Adjustment Dialog Features:
- ✅ Product information display with current stock
- ✅ Three adjustment types (Add/Remove/Set)
- ✅ Visual indicators with icons
- ✅ Inline help text
- ✅ Form validation
- ✅ Required reason field (audit compliance)
- ✅ Optional notes and reference numbers
- ✅ Toast notifications on success/error
- ✅ Auto-refresh product list on success

### History Features:
- ✅ Chronological timeline of all adjustments
- ✅ Pagination (20 records per page)
- ✅ Desktop table view with full details
- ✅ Mobile-friendly card view
- ✅ Color-coded adjustment types
- ✅ User information (who made the change)
- ✅ Timestamp with relative time
- ✅ Reason and notes display
- ✅ Reference number badges

---

## 📋 Best Practices

### When to Use Each Adjustment Type:

1. **Add Stock** ➕
   - Receiving new shipments
   - Restocking from warehouse
   - Returns from customers
   - Example reasons:
     - "Received 50 units from Supplier ABC (Invoice #12345)"
     - "Restocked from warehouse B"
     - "Customer return processed (RMA #789)"

2. **Remove Stock** ➖
   - Damaged goods
   - Theft or loss
   - Samples given away
   - Internal use
   - Example reasons:
     - "10 units damaged during shipping"
     - "Inventory shrinkage discovered during audit"
     - "Sample units provided to marketing team"

3. **Set Exact Stock** 🔢
   - Physical inventory counts
   - Reconciliation after audit
   - Correcting system errors
   - Example reasons:
     - "Physical count shows 150 units (Annual inventory)"
     - "System correction after audit discrepancy"
     - "Reconciliation with warehouse management system"

### Reason Guidelines:
- ✅ **Good reasons:**
  - "Received 100 units from Supplier XYZ (PO-2024-001)"
  - "15 units damaged during warehouse move"
  - "Physical inventory count: 250 units confirmed"

- ❌ **Bad reasons:**
  - "update" (too vague)
  - "fix" (not descriptive)
  - "123" (meaningless)

### Reference Numbers:
Always include reference numbers when available:
- Purchase Orders (PO-2024-001)
- Invoice Numbers (INV-12345)
- RMA Numbers (RMA-789)
- Shipment Tracking (TRACK-ABC123)

---

## 🔐 Security & Compliance

### Automatic Audit Trail:
Every stock adjustment automatically creates an audit record with:
- ✅ User who made the change
- ✅ User email and type
- ✅ Timestamp
- ✅ Old quantity
- ✅ New quantity
- ✅ Change amount
- ✅ Adjustment type
- ✅ Reason
- ✅ Notes (if provided)
- ✅ Reference number (if provided)
- ✅ IP address (backend)

### Cannot Be Deleted:
- Audit records are permanent
- Provides complete history for compliance
- Helps detect fraud or errors

---

## 🔍 Troubleshooting

### Dialog Not Opening?
Check console for errors. Ensure:
- ✅ Product ID is valid
- ✅ Component is properly imported
- ✅ State is managed correctly

### Adjustment Not Saving?
Common issues:
- ❌ Reason too short (min 5 characters)
- ❌ Quantity is 0 or negative
- ❌ Backend API not configured
- ❌ Authentication token missing

### History Not Loading?
Verify:
- ✅ Product ID exists
- ✅ Backend API endpoint is configured
- ✅ Network connection is working

---

## 🎯 Next Steps

### Optional Enhancements:

1. **Add Stats Card to Product Detail**
   ```typescript
   import { useProductAdjustment } from '@/hooks/useProductAdjustment';

   const { fetchAdjustmentStats } = useProductAdjustment();

   const stats = await fetchAdjustmentStats({
     startDate: '2025-01-01',
     endDate: '2025-12-31'
   });
   ```

2. **Add Adjustment Notifications**
   - Use the toast system (already implemented)
   - Or integrate with your notification system

3. **Export Adjustment History**
   - Add export button to history dialog
   - Download as CSV/Excel

4. **Add Filters to History**
   - Filter by date range
   - Filter by adjustment type
   - Filter by user

---

## 📚 Related Files

### Components:
- [ProductAdjustmentDialog.tsx](src/pages/product/components/ProductAdjustmentDialog.tsx)
- [ProductAdjustmentHistory.tsx](src/pages/product/components/ProductAdjustmentHistory.tsx)
- [singleProductList.tsx](src/pages/product/components/singleProductList.tsx) (Updated)

### Hooks:
- [useProductAdjustment.ts](src/hooks/useProductAdjustment.ts)

### API:
- [productAdjustment.ts](src/api/productAdjustment.ts)

### Types:
- [audit.types.ts](src/types/audit.types.ts)

### Config:
- [config.ts](src/utils/config.ts) (Updated with endpoints)

---

## ✅ Testing Checklist

Before deploying to production:

- [ ] Test Add Stock adjustment
- [ ] Test Remove Stock adjustment
- [ ] Test Set Exact Stock adjustment
- [ ] Verify reason validation (min 5 chars)
- [ ] Verify quantity validation (> 0)
- [ ] Test with reference numbers
- [ ] Test with notes
- [ ] Check history pagination
- [ ] Test on mobile devices
- [ ] Verify toast notifications
- [ ] Check product list refresh after adjustment
- [ ] Test permission-based access
- [ ] Verify audit trail creation

---

## 🎉 Summary

You now have a complete, production-ready stock adjustment system with:
- ✅ Modern shadcn/ui components
- ✅ Full audit trail
- ✅ Mobile responsive
- ✅ Already integrated in product list
- ✅ Complete history tracking
- ✅ Toast notifications
- ✅ Form validation
- ✅ Best practices built-in

Just refresh your product page and start using it! 🚀

---

**Last Updated:** November 6, 2025
**Version:** 2.0.0
