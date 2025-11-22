# Order Management V2 - Implementation Guide

## 🚀 Quick Start

### Step 1: Import and Use

The easiest way to use Order Management V2 is to import it in your routing configuration:

```tsx
// In your routes file (e.g., src/main/routes/PrivateRoutes.tsx)
import OrderManagement from '../../pages/order-v2';

// Add to your routes
<Route path="/orders" element={<OrderManagement />} />
```

That's it! The component includes:
- ✅ V1/V2 toggle functionality
- ✅ User preference persistence
- ✅ Seamless switching between views

### Step 2: (Optional) Direct V2 Usage

If you want to use V2 directly without the toggle:

```tsx
import { OrderListV2 } from '../../pages/order-v2/OrderListV2';

<Route path="/orders-v2" element={<OrderListV2 />} />
```

## 📦 What's Included

### Core Components

#### 1. OrderListV2
Main order listing component with:
- Virtual scrolling
- Status tabs
- Search bar
- Bulk actions
- Pagination

```tsx
import { OrderListV2 } from './pages/order-v2/OrderListV2';

<OrderListV2 />
```

#### 2. OrderCard
Unified responsive order card:

```tsx
import { OrderCard } from './pages/order-v2/components/OrderCard';

<OrderCard
  order={order}
  isSelected={false}
  onSelect={(id) => console.log('Selected:', id)}
  onView={(order) => console.log('View:', order)}
  onEdit={(order) => console.log('Edit:', order)}
  onDelete={(order) => console.log('Delete:', order)}
  variant="default" // or "compact" or "detailed"
/>
```

#### 3. SearchBar
Advanced search with debouncing:

```tsx
import { SearchBar } from './pages/order-v2/components/SearchBar';

<SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Search orders..."
  recentSearches={['#000123', 'John Doe']}
/>
```

#### 4. BulkActionsBar
Floating bulk action bar:

```tsx
import { BulkActionsBar } from './pages/order-v2/components/BulkActionsBar';

<BulkActionsBar
  selectedCount={5}
  totalCount={100}
  onClearSelection={() => {}}
  onSelectAll={() => {}}
  onChangeStatus={(status) => {}}
  onDelete={() => {}}
  onGenerateInvoices={() => {}}
  onCreateCourierOrders={(provider) => {}}
/>
```

#### 5. StatusBadge
Animated status indicators:

```tsx
import { StatusBadge } from './pages/order-v2/components/StatusBadge';

<StatusBadge status="processing" size="md" animated={true} />
```

### Zustand Stores

#### 1. Order Store

```tsx
import { useOrderStore } from './pages/order-v2/store';

const MyComponent = () => {
  const {
    orders,
    isLoading,
    fetchOrders,
    setFilters,
    selectOrder,
  } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    // Your component
  );
};
```

**Available Actions:**
- `fetchOrders(reset?)` - Load orders
- `refreshOrders()` - Refresh data
- `setFilters(filters)` - Apply filters
- `clearFilters()` - Remove all filters
- `setSearchQuery(query)` - Set search
- `selectOrder(id)` - Select an order
- `selectAll()` - Select all orders
- `clearSelection()` - Clear selection
- `setPage(page)` - Change page

#### 2. UI Store

```tsx
import { useUIStore } from './pages/order-v2/store';

const MyComponent = () => {
  const {
    viewMode,
    density,
    showToast,
    openSheet,
    openModal,
  } = useUIStore();

  const handleAction = () => {
    showToast({
      type: 'success',
      title: 'Success!',
      description: 'Action completed',
    });
  };

  return (
    // Your component
  );
};
```

**Available Actions:**
- `showToast(toast)` - Display notification
- `openSheet(sheet)` - Open side panel
- `closeSheet()` - Close side panel
- `openModal(modal)` - Open modal
- `closeModal()` - Close modal
- `setViewMode(mode)` - Change view mode
- `setDensity(density)` - Change density

#### 3. Create Order Store

```tsx
import { useCreateOrderStore } from './pages/order-v2/store';

const CreateOrder = () => {
  const {
    products,
    customer,
    currentStep,
    addProduct,
    setCustomer,
    nextStep,
    prevStep,
    getOrderData,
  } = useCreateOrderStore();

  return (
    // Your wizard component
  );
};
```

## 🎨 Styling & Theming

### Using Design Tokens

All colors use Tailwind CSS classes:

```tsx
// Primary gradient
className="bg-gradient-to-r from-blue-600 to-purple-600"

// Status colors
className="bg-blue-100 text-blue-800" // Processing
className="bg-purple-100 text-purple-800" // Shipped
className="bg-green-100 text-green-800" // Completed
className="bg-red-100 text-red-800" // Cancelled
```

### Animation Variants

```tsx
import { fadeIn, slideInFromRight, cardHover } from './pages/order-v2/lib/animations';
import { motion } from 'framer-motion';

<motion.div
  variants={fadeIn}
  initial="hidden"
  animate="visible"
>
  Content
</motion.div>
```

## 🛠️ Utility Functions

### Formatting

```tsx
import {
  formatCurrency,
  formatDate,
  formatOrderNumber,
  formatPhoneNumber,
} from './pages/order-v2/lib/utils';

formatCurrency(1500); // "BDT 1,500"
formatDate(new Date(), 'relative'); // "2 hours ago"
formatOrderNumber(123); // "#000123"
formatPhoneNumber('01712345678'); // "01 712 345 678"
```

### Status Helpers

```tsx
import {
  getOrderStatusColor,
  getPaymentStatus,
  getOrderAge,
} from './pages/order-v2/lib/utils';

getOrderStatusColor('processing'); // "bg-blue-100 text-blue-800..."
getPaymentStatus(order); // "paid" | "partial" | "unpaid"
getOrderAge(order.timestamps.createdAt); // 5 (days)
```

### Utilities

```tsx
import {
  debounce,
  cn,
  copyToClipboard,
  downloadJSON,
} from './pages/order-v2/lib/utils';

// Merge classes
const className = cn('px-4', 'py-2', condition && 'bg-blue-500');

// Debounce function
const debouncedSearch = debounce((query) => search(query), 300);

// Copy to clipboard
await copyToClipboard('Order #123 details');

// Download data
downloadJSON(orderData, 'order-123.json');
```

## 🔌 API Integration

The stores already integrate with your existing API:

```typescript
// In orderStore.ts
import { getOrders, getOrderStatusCount } from '../../../api/order';

// Fetching is handled automatically
fetchOrders(); // Calls API and updates store
```

To customize API calls:

```tsx
// Option 1: Extend the store
useOrderStore.setState({
  /* custom state */
});

// Option 2: Create custom hooks
const useCustomOrders = () => {
  const { orders, setOrders } = useOrderStore();

  const fetchCustom = async () => {
    const data = await myCustomAPI();
    // Process and set
  };

  return { orders, fetchCustom };
};
```

## 🎯 Common Use Cases

### 1. Display Order List

```tsx
import { OrderListV2 } from './pages/order-v2/OrderListV2';

function OrdersPage() {
  return <OrderListV2 />;
}
```

### 2. Filter Orders by Status

```tsx
import { useOrderStore } from './pages/order-v2/store';

function StatusFilter() {
  const { setFilters } = useOrderStore();

  return (
    <select onChange={(e) => setFilters({ status: e.target.value })}>
      <option value="">All</option>
      <option value="processing">Processing</option>
      <option value="shipped">Shipped</option>
      <option value="completed">Completed</option>
    </select>
  );
}
```

### 3. Bulk Update Orders

```tsx
import { useOrderStore } from './pages/order-v2/store';
import { updateOrderStatus } from './api/order';

function BulkUpdate() {
  const { selection, startBulkAction, updateBulkProgress, finishBulkAction } = useOrderStore();

  const handleBulkUpdate = async () => {
    const orderIds = Array.from(selection.selectedIds);
    startBulkAction(orderIds.length);

    for (let i = 0; i < orderIds.length; i++) {
      try {
        await updateOrderStatus(orderIds[i], 'shipped');
        updateBulkProgress(i + 1, 0);
      } catch (error) {
        updateBulkProgress(i, 1, [{ orderId: orderIds[i], error: error.message }]);
      }
    }

    finishBulkAction();
  };

  return <button onClick={handleBulkUpdate}>Update Selected</button>;
}
```

### 4. Show Toast Notifications

```tsx
import { useUIStore } from './pages/order-v2/store';

function MyComponent() {
  const { showToast } = useUIStore();

  const handleSuccess = () => {
    showToast({
      type: 'success',
      title: 'Order Created',
      description: 'Order #123 has been created successfully',
      duration: 5000,
    });
  };

  return <button onClick={handleSuccess}>Create Order</button>;
}
```

### 5. Open Order Details Sheet

```tsx
import { useUIStore } from './pages/order-v2/store';

function OrderActions({ order }) {
  const { openSheet } = useUIStore();

  const handleView = () => {
    openSheet({
      id: 'order-details',
      type: 'order-details',
      data: order,
    });
  };

  return <button onClick={handleView}>View Details</button>;
}
```

## 🧪 Testing (Coming Soon)

```tsx
// Example unit test
import { renderHook, act } from '@testing-library/react-hooks';
import { useOrderStore } from './pages/order-v2/store';

test('should select order', () => {
  const { result } = renderHook(() => useOrderStore());

  act(() => {
    result.current.selectOrder('order-123');
  });

  expect(result.current.selection.selectedIds.has('order-123')).toBe(true);
});
```

## 🚨 Troubleshooting

### Issue: Orders not loading

**Check:**
1. API endpoint is correct in `src/api/order.ts`
2. Network tab for API errors
3. Store state: `useOrderStore.getState()`

```tsx
// Debug store state
console.log('Store:', useOrderStore.getState());
```

### Issue: Animations not working

**Check:**
1. `preferences.animationsEnabled` is true
2. Framer Motion is installed
3. Parent has proper overflow settings

```tsx
const { preferences } = useUIStore();
console.log('Animations enabled:', preferences.animationsEnabled);
```

### Issue: Virtual scrolling jumpy

**Check:**
1. Parent container has fixed height
2. `estimateSize` matches actual item height
3. No margin on virtualized items (use padding instead)

## 📚 Additional Resources

- [Full README](./README.md)
- [Type Definitions](./types/index.ts)
- [Animation Library](./lib/animations.ts)
- [Utility Functions](./lib/utils.ts)

## 💡 Tips & Best Practices

1. **Always use Zustand stores** - Don't create local state for data that needs to be shared
2. **Use utility functions** - Don't recreate formatting logic
3. **Leverage animations** - Use existing variants for consistency
4. **Follow TypeScript** - Don't use `any` types
5. **Test responsive** - Check both mobile and desktop views
6. **Performance first** - Virtual scrolling is your friend

## 🎓 Next Steps

1. Explore the codebase
2. Try the V2 toggle
3. Customize components
4. Add new features
5. Contribute improvements!

---

**Questions?** Check the main README or reach out to the team!
