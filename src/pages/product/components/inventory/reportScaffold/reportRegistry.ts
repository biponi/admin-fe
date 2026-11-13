/**
 * Single source of metadata for the 17 inventory report types.
 *
 * Supersedes the emoji REPORT_TYPES/REPORT_CATEGORIES config and the
 * UNPAGINATED_REPORTS / DATE_RANGE_REPORTS sets that used to live in
 * InventoryReportsSection.
 */
import {
  Activity,
  TrendingUp,
  Star,
  Tag,
  Target,
  Package,
  Search,
  LayoutList,
  PackageX,
  BarChartHorizontalBig,
  Flame,
  History,
  RotateCcw,
  PackageOpen,
  Percent,
  Tags,
  BarChart3,
  Layers,
  Factory,
  PackagePlus,
  FileEdit,
  type LucideIcon,
} from "lucide-react";
import type { ReportType } from "../../../../../api/inventoryReport";

export interface ReportMeta {
  label: string;
  description: string;
  icon: LucideIcon;
  category: string;
  /** false → report renders a full dataset, no pagination footer */
  paginated: boolean;
  /** accepts server-side startDate/endDate filters */
  dateRange?: boolean;
}

export const reportRegistry: Record<ReportType, ReportMeta> = {
  "inventory-summary": {
    label: "Inventory Summary",
    description: "High-level inventory statistics",
    icon: LayoutList,
    category: "INVENTORY_HEALTH",
    paginated: false,
  },
  "low-stock": {
    label: "Low Stock",
    description: "Products below stock threshold",
    icon: PackageOpen,
    category: "INVENTORY_HEALTH",
    paginated: true,
  },
  "out-of-stock": {
    label: "Out of Stock",
    description: "Products with zero inventory",
    icon: PackageX,
    category: "INVENTORY_HEALTH",
    paginated: true,
  },
  "inventory-distribution": {
    label: "Inventory Distribution",
    description: "Products grouped by stock ranges",
    icon: BarChartHorizontalBig,
    category: "INVENTORY_HEALTH",
    paginated: false,
  },
  "top-selling": {
    label: "Top Selling",
    description: "Best-performing products by sales",
    icon: Flame,
    category: "SALES_ANALYTICS",
    paginated: true,
    dateRange: true,
  },
  "sales-activity": {
    label: "Sales Activity",
    description: "Recently sold products",
    icon: History,
    category: "SALES_ANALYTICS",
    paginated: true,
  },
  "return-rate": {
    label: "Return Rate",
    description: "Products with highest return rates",
    icon: RotateCcw,
    category: "SALES_ANALYTICS",
    paginated: true,
  },
  "dead-stock": {
    label: "Dead Stock",
    description: "Products not sold recently",
    icon: Package,
    category: "STOCK_ANALYSIS",
    paginated: true,
  },
  "top-rated": {
    label: "Top Rated",
    description: "Highest customer-rated products",
    icon: Star,
    category: "PRODUCT_QUALITY",
    paginated: true,
  },
  "rating-distribution": {
    label: "Rating Distribution",
    description: "Customer ratings breakdown",
    icon: BarChart3,
    category: "PRODUCT_QUALITY",
    paginated: false,
  },
  "discounted-products": {
    label: "Discounted Products",
    description: "Products currently on discount",
    icon: Tags,
    category: "PRICING",
    paginated: true,
  },
  "highest-discount": {
    label: "Highest Discount",
    description: "Products with biggest discounts",
    icon: Percent,
    category: "PRICING",
    paginated: true,
  },
  "price-distribution": {
    label: "Price Distribution",
    description: "Products grouped by price ranges",
    icon: Tag,
    category: "PRICING",
    paginated: false,
  },
  "category-performance": {
    label: "Category Performance",
    description: "Sales by category",
    icon: Layers,
    category: "PERFORMANCE",
    paginated: false,
    dateRange: true,
  },
  "manufacturer-report": {
    label: "Manufacturer Report",
    description: "Sales by manufacturer",
    icon: Factory,
    category: "PERFORMANCE",
    paginated: false,
  },
  "recently-added": {
    label: "Recently Added",
    description: "Newest products in catalog",
    icon: PackagePlus,
    category: "CATALOG",
    paginated: true,
  },
  "recently-updated": {
    label: "Recently Updated",
    description: "Recently modified products",
    icon: FileEdit,
    category: "CATALOG",
    paginated: true,
  },
};

export const reportCategories = {
  INVENTORY_HEALTH: {
    label: "Inventory Health",
    description: "Overview of your inventory status",
    icon: Activity,
  },
  SALES_ANALYTICS: {
    label: "Sales Analytics",
    description: "Sales performance metrics",
    icon: TrendingUp,
  },
  PRODUCT_QUALITY: {
    label: "Product Quality",
    description: "Customer ratings and reviews",
    icon: Star,
  },
  PRICING: {
    label: "Pricing",
    description: "Price and discount analysis",
    icon: Tag,
  },
  PERFORMANCE: {
    label: "Performance",
    description: "Category and manufacturer metrics",
    icon: Target,
  },
  CATALOG: {
    label: "Catalog",
    description: "Product catalog changes",
    icon: Package,
  },
  STOCK_ANALYSIS: {
    label: "Stock Analysis",
    description: "Slow-moving inventory",
    icon: Search,
  },
} as const;

export type ReportCategoryKey = keyof typeof reportCategories;
