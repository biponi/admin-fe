# Sell Panel - Product-First View Layout Documentation

This document provides comprehensive layout specifications for the admin panel's sell/sales panel with the product-first view. Use this as a reference to implement the same UI/UX in your new project.

## Table of Contents

1. [Main Layout Structure](#1-main-layout-structure)
2. [Product Section Layout](#2-product-section-layout)
3. [Variation Modal Layout](#3-variation-modal-layout)
4. [Cart Section Layout](#4-cart-section-layout)
5. [Mobile Responsive Behavior](#5-mobile-responsive-behavior)
6. [Spacing & Dimension Reference](#6-spacing--dimension-reference)
7. [Responsive Layout Code Examples](#7-responsive-layout-code-examples)

---

## 1. Main Layout Structure

### Overall Container

```
┌─────────────────────────────────────────────────────────────┐
│  [Header/Navbar - Not part of sell panel]                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │                                                         ││
│  │  MAIN SELL PANEL CONTAINER                              ││
│  │  ┌──────────────────────┬─────────────────────────┐    ││
│  │  │                      │                         │    ││
│  │  │  Product Section     │    Cart Section         │    ││
│  │  │  (3/5 width)         │    (2/5 width)          │    ││
│  │  │                      │                         │    ││
│  │  │  • Filters           │    • Customer Select    │    ││
│  │  │  • Search            │    • Cart Items         │    ││
│  │  │  • Product Grid      │    • Totals             │    ││
│  │  │  • Pagination        │    • Submit Form        │    ││
│  │  │                      │                         │    ││
│  │  └──────────────────────┴─────────────────────────┘    ││
│  │                                                         ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Grid Structure

```html
<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-5">
  <!-- Product Section -->
  <div class="xl:col-span-3">
    <!-- Filters + Product Grid -->
  </div>

  <!-- Cart Section -->
  <div class="xl:col-span-2">
    <!-- Cart Panel -->
  </div>
</div>
```

### Breakpoint Behavior

| Screen Size             | Breakpoint | Layout                                          |
| ----------------------- | ---------- | ----------------------------------------------- |
| Mobile (< 1024px)       | lg:        | Single column (product full width, cart hidden) |
| Large (1024px - 1279px) | lg:        | 2 columns (50% / 50%)                           |
| XL (≥ 1280px)           | xl:        | 5 columns (60% / 40% split)                     |

---

## 2. Product Section Layout

### Filter Bar

```html
<div class="flex max-sm:flex-col gap-3 sm:gap-5">
  <!-- Search Input -->
  <div class="w-full">
    <input class="w-full h-10 px-[22px]" />
  </div>

  <!-- Brand + Category Filters -->
  <div class="flex gap-5">
    <div class="grow">
      <select class="w-full h-10" />
    </div>
    <div class="grow">
      <select class="w-full h-10" />
    </div>
  </div>

  <!-- Flow Toggle Button -->
  <div class="flex justify-center">
    <button class="h-8 md:h-10 px-3 md:px-6">Switch View</button>
  </div>
</div>
```

**Layout Details:**

- Container: Flexbox with gap spacing
- Mobile: Stacks vertically (`max-sm:flex-col`)
- Search: Full width on mobile, shares space on desktop
- Filters: Side-by-side on desktop, stacked on mobile
- Button: Centered in its flex container

**Spacing:**

- Gap between elements: 12px (mobile), 20px (desktop)
- Filter inputs: Equal width (`grow` class)

---

### Product Grid

```html
<div
  class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-3.5 mt-6"
>
  <!-- Product Cards -->
</div>
```

### Column Breakdown

| Screen Size      | Breakpoint      | Columns | Column Width | Gap  |
| ---------------- | --------------- | ------- | ------------ | ---- |
| Mobile (default) | < 640px         | 2       | ~50%         | 14px |
| Small            | 640px - 1023px  | 3       | ~33%         | 14px |
| Large            | 1024px - 1279px | 2       | ~50%         | 14px |
| XL               | 1280px - 1535px | 3       | ~33%         | 14px |
| 2XL              | 1536px - 1849px | 4       | ~25%         | 14px |
| 3XL              | ≥ 1850px        | 5       | ~20%         | 14px |

**Key Spacing:**

- Grid gap: 14px (`gap-3.5`)
- Top margin: 24px (`mt-6`)

---

### Product Card Layout

```
┌──────────────────────────────────┐
│  [IMAGE - Square Aspect Ratio]   │
│                                  │
│  ┌────┐                    ┌───┐ │
│  │Badge│                    │Var│ │
│  └────┘                    └───┘ │
│  [Stock]          [Variations]   │
│                                  │
├──────────────────────────────────┤
│  Product Name                    │
│  (max 2 lines, min 40px height)  │
│                                  │
│  ID: 123      Jan 15, 2025       │
│                                  │
│  ┌────────────────────────────┐  │
│  │     Select / Out of Stock  │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

### Complete Product Card HTML

```html
<div
  class="
  cursor-pointer
  group
  border border-border rounded-md overflow-hidden
  hover:border-theme-secondary hover:shadow-md
  transition-all duration-200
"
>
  <!-- IMAGE CONTAINER -->
  <div class="relative">
    <!-- Image -->
    <img class="aspect-square w-full object-cover" />

    <!-- Stock Badge -->
    <div class="absolute top-2 right-2">
      <span class="px-2 py-1 text-xs font-semibold rounded-full shadow-sm">
        Stock Status
      </span>
    </div>

    <!-- Variations Badge -->
    <div class="absolute bottom-2 left-2">
      <span class="px-2 py-1 text-xs font-semibold rounded-full shadow-sm">
        Has Variations
      </span>
    </div>

    <!-- Hover Overlay -->
    <div
      class="absolute inset-0 bg-theme-primary/0 group-hover:bg-theme-primary/10 transition-all duration-200 rounded-md"
    />
  </div>

  <!-- CONTENT CONTAINER -->
  <div class="p-3 sm:p-4">
    <!-- Title -->
    <h3
      class="
      font-medium
      text-sm
      line-clamp-2
      min-h-[40px]
      group-hover:text-theme-primary
      transition-colors
    "
    >
      Product Name
    </h3>

    <!-- Metadata -->
    <div class="mt-2 flex items-center justify-between text-xs text-muted">
      <span>ID: 123</span>
      <span>Jan 15, 2025</span>
    </div>

    <!-- Action Button -->
    <button
      class="
      w-full
      mt-3
      py-2 px-3
      rounded-lg
      text-sm font-medium
      transition-colors
    "
    >
      Select
    </button>
  </div>
</div>
```

### Product Card Spacing Breakdown

| Element             | Property    | Mobile     | Small+     |
| ------------------- | ----------- | ---------- | ---------- |
| Content padding     | `p-*`       | 12px       | 16px       |
| Button padding      | `py-* px-*` | 8px × 12px | 8px × 12px |
| Badge padding       | `px-* py-*` | 8px × 4px  | 8px × 4px  |
| Title min height    | `min-h-*`   | 40px       | 40px       |
| Button margin top   | `mt-*`      | 12px       | 12px       |
| Metadata margin top | `mt-*`      | 8px        | 8px        |

### Image & Badge Specifications

- **Image aspect ratio**: 1:1 (`aspect-square`)
- **Image object fit**: `object-cover` (fills container, crops excess)
- **Stock badge position**: `top-2 right-2` (8px from edges)
- **Variations badge position**: `bottom-2 left-2` (8px from edges)
- **Badge positioning**: `absolute`

### Border & Radius

- Card border: `rounded-md` (4px)
- Button border: `rounded-lg` (8px)
- Badge radius: `rounded-full` (50%)

---

### Pagination

```html
<div
  class="flex max-md:flex-col items-center justify-end gap-y-2 sm:gap-10 border-t border-border mt-12 pt-4 md:pt-8"
>
  <!-- Info Text -->
  <p class="text-muted">Showing <span>20</span> of <span>150</span> products</p>

  <!-- Page Buttons -->
  <div class="flex justify-end gap-2">
    <button class="h-7 sm:h-[38px] aspect-square rounded">←</button>
    <button class="h-7 sm:h-[38px] aspect-square rounded">1</button>
    <button class="h-7 sm:h-[38px] aspect-square rounded">2</button>
    <button class="h-7 sm:h-[38px] aspect-square rounded">3</button>
    <button class="h-7 sm:h-[38px] aspect-square rounded">→</button>
  </div>
</div>
```

**Layout Details:**

- Container: Flexbox, justified to end
- Mobile: Stacks vertically (`max-md:flex-col`)
- Gap: 8px between buttons
- Top margin: 48px
- Top padding: 16px (mobile) / 32px (desktop)
- Border top: 1px

**Button Sizing:**

- Mobile: 28×28px
- Desktop: 38×38px

---

## 3. Variation Modal Layout

```
┌──────────────────────────────────────────────────────┐
│  Select Variation              [Product Name]    [×] │
│  (Title)                        (Subtitle)      (Close)
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │             │  │             │  │             │ │
│  │ Variation 1 │  │ Variation 2 │  │ Variation 3 │ │
│  │             │  │             │  │             │ │
│  │ [Image]     │  │ [Image]     │  │ [Image]     │ │
│  │ Details     │  │ Details     │  │ Details     │ │
│  │ [Add Button]│  │ [Add Button]│  │ [Add Button]│ │
│  │             │  │             │  │             │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ Variation 4 │  │ Variation 5 │  │ Variation 6 │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│                   (Scrollable if needed)             │
└──────────────────────────────────────────────────────┘
```

### Modal Container

```html
<div
  class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
>
  <div
    class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
  >
    <!-- Modal Content -->
  </div>
</div>
```

**Dimensions:**

- Overlay: Fixed, full viewport (`fixed inset-0`)
- Modal: `max-w-4xl` (896px max width), `w-full` (responsive below)
- Height: `max-h-[80vh]` (80% of viewport height)
- Padding: 16px around modal

### Modal Header

```html
<div class="p-6 border-b flex justify-between items-center">
  <div>
    <h2 class="text-xl font-bold">Select Variation</h2>
    <p class="text-sm text-muted mt-1">Product Name</p>
  </div>
  <button class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
</div>
```

- Padding: 24px
- Border bottom: 1px
- Layout: Flexbox, space between
- Title size: 20px, bold
- Subtitle size: 14px, muted color

### Modal Body (Scrollable)

```html
<div class="p-6 overflow-y-auto max-h-[60vh]">
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- Variation Cards -->
  </div>
</div>
```

- Padding: 24px
- Overflow: Vertical scroll
- Max height: 60% of viewport

### Variation Grid

| Screen Size            | Columns |
| ---------------------- | ------- |
| Mobile (< 640px)       | 1       |
| Small (640px - 1023px) | 2       |
| Large (≥ 1024px)       | 3       |
| Gap                    | 16px    |

---

### Variation Card Layout

```
┌─────────────────────────────────┐
│  [Img]  Name                    │
│  (80×80)  SKU: 12345            │
│           Code: ABC123          │
│                                  │
│           $99.99                 │
│           $129.99 (strikethrough)│
│                                  │
│           [Stock: 5]             │
│                                  │
│  ──────────────────────────────  │
│                                  │
│  [Red] [Large] [Cotton]         │
│                                  │
│  ┌─────────────────────────────┐ │
│  │        Add to Cart          │ │
│  └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Complete Variation Card HTML

```html
<div
  class="border rounded-lg p-4 cursor-pointer transition-all hover:border-theme-primary hover:shadow-md"
>
  <!-- Top Section: Image + Info -->
  <div class="flex items-start gap-3">
    <!-- Image -->
    <img class="w-20 h-20 object-cover rounded" />

    <!-- Details -->
    <div class="flex-1">
      <h3 class="font-medium text-sm mb-2">Variation Name</h3>

      <div class="space-y-1 text-xs">
        <p>SKU: 12345</p>
        <p>Code: ABC123</p>
      </div>

      <div class="mt-2">
        <p class="font-bold">$99.99</p>
        <p class="text-xs line-through">$129.99</p>
      </div>

      <span class="mt-2 px-2 py-1 text-xs font-semibold rounded-full">
        Stock: 5
      </span>
    </div>
  </div>

  <!-- Divider -->
  <div class="mt-3 pt-3 border-t">
    <!-- Combinations -->
    <div class="flex flex-wrap gap-2">
      <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
        Red
      </span>
      <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
        Large
      </span>
    </div>
  </div>

  <!-- Add Button -->
  <button class="w-full mt-3 py-2 px-3 rounded-lg text-sm font-medium">
    Add to Cart
  </button>
</div>
```

### Variation Card Spacing

| Element            | Property    | Value              |
| ------------------ | ----------- | ------------------ |
| Card padding       | `p-4`       | 16px               |
| Image size         | `w-20 h-20` | 80×80px            |
| Gap (image ↔ info) | `gap-3`     | 12px               |
| Gap (combinations) | `gap-2`     | 8px                |
| Divider margin     | `mt-3 pt-3` | 12px top + padding |
| Button margin top  | `mt-3`      | 12px               |
| Button padding     | `py-2 px-3` | 8px × 12px         |

---

## 4. Cart Section Layout

### Desktop Cart Panel (Fixed)

```html
<div class="xl:col-span-2 hidden xl:block">
  <div class="card">
    <div class="card__content">
      <!-- Customer Selection -->
      <!-- Cart Table -->
      <!-- Totals -->
      <!-- Submit Form -->
    </div>
  </div>
</div>
```

- Visibility: `hidden xl:block` (hidden on mobile, visible on XL+)
- Grid span: `xl:col-span-2` (2/5 of total width)
- Card wrapper with standard padding

---

### Mobile Cart Drawer

```
Closed State:
┌──────┐
│      │
│  ⋮   │  ← 30px handle visible
│      │
└──────┘

Open State:
┌──────────────┬─────────────────────────────────────┐
│              │                                      │
│  ⋮           │  [Cart Content - 350px wide]         │
│              │                                      │
│  (Handle)    │  • Customer Selection                │
│              │  • Cart Items                        │
│              │  • Totals                            │
│              │  • Submit Form                       │
│              │                                      │
└──────────────┴─────────────────────────────────────┘
    ↑                    ↑
  30px               350px
```

### Drawer Component

```html
<DrawerWithHandle
  isOpen="{cartDrawerOpen}"
  setIsOpen="{setCartDrawerOpen}"
  drawerWidth="{350}"
  handleWidth="{30}"
>
  {/* Cart Content */}
</DrawerWithHandle>
```

**Layout Specifications:**

- Drawer width: 350px
- Handle width: 30px (visible when closed)
- Position: Fixed, right side
- Animation: Slide in/out from right
- Transition: 300ms
- Overlay: 40% opacity black when open

### Mobile Cart Button (Trigger)

```html
<button
  class="fixed bottom-[70px] right-4 z-40 bg-theme-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
>
  <span
    class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
  >
    3
  </span>
  <i class="fa-solid fa-cart-shopping"></i>
</button>
```

- Position: Fixed, bottom-right
- Size: 56×56px
- Shape: Circle (rounded-full)
- Badge: Absolute, top-right offset
- Bottom offset: 70px (above mobile nav)

---

### Cart Table Layout

```html
<table class="w-full">
  <thead>
    <tr>
      <th class="py-4 md:py-[22px] px-2 text-left">Product</th>
      <th class="py-4 md:py-[22px] px-2 text-center">Price</th>
      <th class="py-4 md:py-[22px] px-2 text-center">Qty</th>
      <th class="py-4 md:py-[22px] px-2 text-right">Total</th>
      <th class="py-4 md:py-[22px] px-2 text-center">Action</th>
    </tr>
  </thead>

  <tbody>
    <tr class="border-t border-border">
      <td class="py-3 sm:py-5 px-2">
        <div class="flex items-center gap-3">
          <img class="w-12 h-12 rounded object-cover" />
          <div class="text-sm">
            <p class="font-medium">Product Name</p>
            <p class="text-xs text-muted">Variation</p>
          </div>
        </div>
      </td>
      <td class="py-3 sm:py-5 px-2 text-center">$99.99</td>
      <td class="py-3 sm:py-5 px-2 text-center">
        <div class="flex items-center justify-center gap-2">
          <button>-</button>
          <input class="w-12 text-center" value="1" />
          <button>+</button>
        </div>
      </td>
      <td class="py-3 sm:py-5 px-2 text-right">$99.99</td>
      <td class="py-3 sm:py-5 px-2 text-center">
        <button class="text-red-500 hover:text-red-700">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>
  </tbody>
</table>
```

**Table Sizing:**

- Width: 100%
- Cell padding (vertical): 12px (mobile) / 20px (desktop)
- Cell padding (horizontal): 8px
- Header padding: 16px (mobile) / 22px (desktop)
- Border between rows: 1px

### Quantity Counter

```html
<div class="flex items-center justify-center gap-2">
  <button class="w-5 sm:w-[32px] aspect-square rounded border">-</button>
  <input class="w-12 text-center text-sm" value="1" />
  <button class="w-5 sm:w-[32px] aspect-square rounded border">+</button>
</div>
```

- Button size: 20×20px (mobile) / 32×32px (desktop)
- Input width: 48px
- Gap: 8px

---

### Order Submit Form Layout

```html
<div class="space-y-4">
  <!-- Subtotal -->
  <div class="flex justify-between items-center text-sm">
    <span>Subtotal</span>
    <span>$299.97</span>
  </div>

  <!-- Discount -->
  <div class="flex justify-between items-center text-sm">
    <span>Discount</span>
    <span class="text-red-500">-$30.00</span>
  </div>

  <!-- Tax -->
  <div class="flex justify-between items-center text-sm">
    <span>Tax (10%)</span>
    <span>$27.00</span>
  </div>

  <!-- Total -->
  <div
    class="flex justify-between items-center text-lg font-bold border-t pt-4"
  >
    <span>Total</span>
    <span>$296.97</span>
  </div>

  <!-- Submit Button -->
  <button
    class="w-full h-12 bg-theme-primary text-white rounded-lg font-medium"
  >
    Place Order
  </button>
</div>
```

**Layout Details:**

- Container: Flexbox column, 16px gap
- Row layout: Space between, items centered
- Total divider: Border top + 16px padding
- Button: Full width, height 48px

---

## 5. Mobile Responsive Behavior

### Breakpoint Summary

```javascript
screens: {
  xxs: '400px',
  xs: '490px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1850px',
}
```

---

### Layout Changes by Screen Size

#### Mobile (< 1024px / lg)

```
┌─────────────────────────────┐
│  Filters (stacked)          │
├─────────────────────────────┤
│  ┌─────┐ ┌─────┐           │
│  │ P1  │ │ P2  │           │
│  └─────┘ └─────┘           │
│  ┌─────┐ ┌─────┐           │
│  │ P3  │ │ P4  │           │
│  └─────┘ └─────┘           │
│  (2 columns)               │
├─────────────────────────────┤
│  Pagination                │
└─────────────────────────────┘

Cart: Hidden (access via drawer button)
```

- Main grid: Single column
- Product grid: 2 columns
- Cart: Hidden (in drawer)
- Filters: Stack vertically
- Navigation: Hamburger menu

#### Tablet (1024px - 1279px / lg)

```
┌───────────────────┬─────────┐
│  Filters          │         │
├───────────────────┤         │
│  ┌─────┐ ┌─────┐ │         │
│  │ P1  │ │ P2  │ │ Cart    │
│  └─────┘ └─────┘ │ Panel   │
│  ┌─────┐ ┌─────┐ │ (50%)   │
│  │ P3  │ │ P4  │ │         │
│  └─────┘ └─────┘ │         │
│  (2 columns)     │         │
├───────────────────┤         │
│  Pagination       │         │
└───────────────────┴─────────┘
```

- Main grid: 2 columns (50%/50%)
- Product grid: 2 columns
- Cart: Visible in right panel

#### Desktop (≥ 1280px / xl)

```
┌─────────────────────────────┬───────────────┐
│  Filters (horizontal)       │               │
├─────────────────────────────┤               │
│  ┌────┐ ┌────┐ ┌────┐      │ Cart Panel   │
│  │ P1 │ │ P2 │ │ P3 │      │ (40%)        │
│  └────┘ └────┘ └────┘      │               │
│  ┌────┐ ┌────┐ ┌────┐      │               │
│  │ P4 │ │ P5 │ │ P6 │      │               │
│  └────┘ └────┘ └────┘      │               │
│  (3 columns)               │               │
├─────────────────────────────┤               │
│  Pagination                 │               │
└─────────────────────────────┴───────────────┘
```

- Main grid: 5 columns (60%/40% split)
- Product grid: 3 columns
- Cart: Visible in right panel

---

### Touch-Friendly Sizing

| Element               | Size                   | Touch Target |
| --------------------- | ---------------------- | ------------ |
| Product card button   | 40px                   | ✓            |
| Quantity buttons      | 20px mobile / 32px sm+ | ✓ (sm+)      |
| Cart trigger button   | 56×56px                | ✓            |
| Filter inputs         | 40px                   | ✓            |
| Modal close button    | ~40px                  | ✓            |
| Variation card button | 40px                   | ✓            |

**Minimum touch target**: 44×44px (WCAG standard)

- Most elements meet this on small+ screens
- Small buttons on mobile (< 640px) may be below standard

---

### Mobile Cart Drawer Animation

```css
/* Closed */
.drawer {
  transform: translateX(100%);
  transition: transform 300ms ease-in-out;
}

/* Open */
.drawer.open {
  transform: translateX(0);
}

/* Handle (always visible when closed) */
.handle {
  width: 30px;
  transform: translateX(-100%);
}

/* Overlay */
.overlay {
  opacity: 0;
  visibility: hidden;
  transition: opacity 300ms;
}

.overlay.open {
  opacity: 1;
  visibility: visible;
}
```

---

## 6. Spacing & Dimension Reference

### Common Spacing Values (Tailwind Scale)

| Class     | Value | Usage                       |
| --------- | ----- | --------------------------- |
| `gap-2`   | 8px   | Small gaps between elements |
| `gap-3`   | 12px  | Medium gaps                 |
| `gap-3.5` | 14px  | Product grid gap            |
| `gap-4`   | 16px  | Section spacing             |
| `gap-5`   | 20px  | Large gaps                  |
| `gap-10`  | 40px  | Extra large gaps            |

### Padding Values

| Class | Value | Usage                 |
| ----- | ----- | --------------------- |
| `p-2` | 8px   | Tight padding         |
| `p-3` | 12px  | Card content (mobile) |
| `p-4` | 16px  | Standard padding      |
| `p-5` | 20px  | Card content (md+)    |
| `p-6` | 24px  | Modal header/body     |

### Margin Values

| Class   | Value | Usage                  |
| ------- | ----- | ---------------------- |
| `mt-2`  | 8px   | Small margin top       |
| `mt-3`  | 12px  | Medium margin top      |
| `mt-4`  | 16px  | Standard margin top    |
| `mt-6`  | 24px  | Section margin top     |
| `mt-8`  | 32px  | Large margin top       |
| `mt-12` | 48px  | Extra large margin top |

---

### Border Radius Values

| Class          | Radius | Usage           |
| -------------- | ------ | --------------- |
| `rounded-sm`   | 2px    | Subtle rounding |
| `rounded-md`   | 4px    | Product cards   |
| `rounded-lg`   | 8px    | Buttons         |
| `rounded-xl`   | 12px   | Large cards     |
| `rounded-full` | 50%    | Badges, circles |

---

### Fixed Dimensions

| Element            | Width             | Height           |
| ------------------ | ----------------- | ---------------- |
| Product image      | 100% (w-full)     | 1:1 aspect ratio |
| Variation image    | 80px (w-20)       | 80px (h-20)      |
| Cart thumbnail     | 48px (w-12)       | 48px (h-12)      |
| Cart drawer        | 350px (fixed)     | viewport         |
| Mobile cart button | 56px (w-14)       | 56px (h-14)      |
| Handle             | 30px              | viewport         |
| Modal              | max-w-4xl (896px) | max-h-[80vh]     |

---

### Input Heights

| Element         | Height                     |
| --------------- | -------------------------- |
| Standard input  | 40px (h-10)                |
| Search input    | 40px (h-10)                |
| Select dropdown | 40px (h-10)                |
| Button (sm)     | 32px (h-8)                 |
| Button (md)     | 32px / 40px (h-8 md:h-10)  |
| Button (lg)     | 40px / 48px (h-10 md:h-12) |

---

## 7. Responsive Layout Code Examples

### Filter Bar - Responsive

```html
<!-- Mobile: Stacked, Desktop: Horizontal -->
<div class="flex max-sm:flex-col gap-3 sm:gap-5">
  <div class="w-full">
    <input class="w-full h-10" />
  </div>
  <div class="flex gap-5">
    <div class="grow">
      <select class="w-full h-10" />
    </div>
    <div class="grow">
      <select class="w-full h-10" />
    </div>
  </div>
  <div class="flex justify-center">
    <button class="h-8 md:h-10">Switch View</button>
  </div>
</div>
```

---

### Product Grid - Responsive

```html
<!-- 2 → 3 → 2 → 3 → 4 → 5 columns -->
<div
  class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-3.5 mt-6"
>
  <!-- Products -->
</div>
```

---

### Main Layout - Responsive

```html
<!-- 1 column → 2 columns → 5 columns (3:2 split) -->
<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-5">
  <div class="xl:col-span-3">
    <!-- Products -->
  </div>
  <div class="xl:col-span-2 hidden xl:block">
    <!-- Cart (desktop) -->
  </div>
</div>
```

---

### Product Card - Responsive Padding

```html
<div class="p-3 sm:p-4">
  <!-- Content -->
  <h3 class="text-sm">Title</h3>
  <button class="w-full mt-3 py-2 px-3">Select</button>
</div>
```

---

### Cart Button - Mobile Only

```html
<!-- Visible on mobile/tablet, hidden on desktop -->
<button
  class="xl:hidden fixed bottom-[70px] right-4 z-40 w-14 h-14 rounded-full"
>
  <!-- Icon + Badge -->
</button>
```

---

### Variation Modal Grid - Responsive

```html
<!-- 1 → 2 → 3 columns -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Variation cards -->
</div>
```

---

### Responsive Typography

```html
<!-- Text sizes -->
<h1 class="text-xl font-bold">
  <!-- 20px -->
  <p class="text-sm sm:text-base">
    <!-- 14px mobile, 16px small+ -->
    <span class="text-xs"> <!-- 12px --></span>
  </p>
</h1>
```

---

### Responsive Tables

```html
<table class="w-full">
  <thead>
    <tr>
      <th class="py-4 md:py-[22px]">Header</th>
    </tr>
  </thead>
  <tbody>
    <tr class="border-t">
      <td class="py-3 sm:py-5">Cell</td>
    </tr>
  </tbody>
</table>
```

---

## Summary

The sell panel product-first view uses a **responsive grid-based layout** with:

- **Main grid**: Adapts from 1 column (mobile) to 5 columns (desktop)
- **Product grid**: Responsive columns (2 → 3 → 2 → 3 → 4 → 5)
- **Cart**: Fixed panel on desktop, slide-out drawer on mobile
- **Variations**: Modal with responsive card grid (1 → 2 → 3 columns)
- **Filters**: Stack vertically on mobile, horizontal on desktop
- **Touch targets**: Minimum 40px height on most interactive elements
- **Spacing**: Consistent gaps (8px, 12px, 16px, 20px) and margins
- **Aspect ratios**: Square product images (1:1)
- **Animations**: 300ms transitions for modals and drawers

This layout prioritizes **product visibility** first, then **variation selection** through a modal, keeping the main interface clean while allowing detailed selection when needed.

---

## Implementation Checklist

When implementing this layout in your new project:

- [ ] Set up Tailwind CSS with custom breakpoints (xxs, xs, sm, md, lg, xl, 2xl, 3xl)
- [ ] Create main grid container with responsive columns
- [ ] Implement filter bar with mobile stacking
- [ ] Build product grid with responsive columns (2→3→2→3→4→5)
- [ ] Create product card component with square images
- [ ] Add stock and variation badges with absolute positioning
- [ ] Implement pagination with responsive sizing
- [ ] Create variation modal with scrollable body
- [ ] Build variation card grid (1→2→3 columns)
- [ ] Implement cart panel (desktop) and drawer (mobile)
- [ ] Add mobile cart trigger button (fixed position)
- [ ] Create cart table with responsive padding
- [ ] Implement quantity counter with responsive button sizes
- [ ] Add order submit form with totals
- [ ] Test touch targets on mobile (minimum 44px recommended)
- [ ] Ensure all animations use 300ms transitions
- [ ] Verify responsive behavior at all breakpoints

---

**Document Version**: 1.0
**Last Updated**: 2025-01-09
**Based On**: Luxury Admin Panel - POS/Sell System
