import {
  BarChartHorizontalBig,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  Image,
  List,
  PlusCircle,
  Package,
  Search,
  MoreHorizontal,
  ShoppingBag,
  Archive,
  Activity,
  FilePieChart,
  X,
  RefreshCw,
  FolderTree,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useProductList } from "./hooks/useProductList";
import SingleItem from "./components/singleProductList";
import EmptyView from "../../coreComponents/emptyView";
import {
  CategoryStockSummary,
  IProduct,
  StockSummaryResponse,
} from "./interface";
import useCategory from "./hooks/useCategory";
import { useEffect, useState, useCallback, useRef } from "react";
import { Input } from "../../components/ui/input";
import useDebounce from "../../customHook/useDebounce";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import SingleProductCardItem from "./components/singleProductCard";
import { getProductSummary } from "../../api/product";
import { errorToast } from "../../utils/toast";
import { Progress } from "../../components/ui/progress";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../components/ui/drawer";
import {
  Sheet as SheetContainer,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import CategoryFilterDropdown from "./components/FilterByCategory";
import MobileProductCard from "./components/MobileProductCard";
import { MobileProductSortSheet } from "./components/MobileProductSortSheet";
import { MobileProductBottomNav } from "./components/MobileProductBottomNav";
import { MobileStatusDrawer } from "./components/MobileStatusDrawer";
import type { SortField, SortOrder } from "./hooks/useProductList";
import { MobileKeyboardSearch } from "../order/components/MobileKeyboardSearch";
import { cn } from "@/lib/utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatNumber = (num: number | undefined): string => {
  if (num === undefined || num === null) return "0";
  return Number(num) % 1 < 1
    ? Math.floor(num).toLocaleString()
    : num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};

// ─── Tab Config ───────────────────────────────────────────────────────────────

type TabKey = "all" | "active" | "inactive" | "instock" | "outofstock";

const TAB_CONFIG: {
  value: TabKey;
  label: string;
  emptyTitle: string;
  emptyDescription: string;
  badgeClass: string;
  filter: (p: IProduct) => boolean;
}[] = [
  {
    value: "all",
    label: "All",
    badgeClass: "bg-zinc-100 text-zinc-600",
    emptyTitle: "No products found",
    emptyDescription: "Add your first product to get started",
    filter: () => true,
  },
  {
    value: "active",
    label: "Active",
    badgeClass: "bg-emerald-100 text-emerald-700",
    emptyTitle: "No active products",
    emptyDescription: "All products are currently inactive",
    filter: (p) => p.active,
  },
  {
    value: "inactive",
    label: "Inactive",
    badgeClass: "bg-orange-100 text-orange-700",
    emptyTitle: "No inactive products",
    emptyDescription: "All products are active — great!",
    filter: (p) => !p.active,
  },
  {
    value: "instock",
    label: "In Stock",
    badgeClass: "bg-blue-100 text-blue-700",
    emptyTitle: "No products in stock",
    emptyDescription: "Time to restock your inventory",
    filter: (p) => p.quantity > 0,
  },
  {
    value: "outofstock",
    label: "Out of Stock",
    badgeClass: "bg-red-100 text-red-600",
    emptyTitle: "All products are stocked",
    emptyDescription: "Your inventory is in great shape",
    filter: (p) => p.quantity <= 0,
  },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
}> = ({ title, value, description, icon, accent }) => (
  <div
    className={`relative overflow-hidden rounded-xl border bg-white p-4 ${accent}`}>
    <div className='flex items-start justify-between gap-2'>
      <div className='min-w-0'>
        <p className='text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1'>
          {title}
        </p>
        <p className='text-2xl font-bold text-zinc-900 leading-tight'>
          {value}
        </p>
        <p className='text-[11px] text-zinc-400 mt-1 truncate'>{description}</p>
      </div>
      <div className='shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-50 border border-zinc-100'>
        {icon}
      </div>
    </div>
  </div>
);

// ─── Table skeleton overlay ───────────────────────────────────────────────────

const TableLoadingOverlay: React.FC = () => (
  <div className='absolute inset-0 bg-white/70 backdrop-blur-[1px] z-20 flex items-start pt-12 justify-center'>
    <div className='flex flex-col items-center gap-3'>
      <div className='w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin' />
      <span className='text-xs text-zinc-500 font-medium'>Loading…</span>
    </div>
  </div>
);

const TableRowSkeleton: React.FC = () => (
  <tr className='border-b border-zinc-100 animate-pulse'>
    <td className='py-3 px-4 w-12'>
      <div className='w-9 h-9 rounded-lg bg-zinc-100' />
    </td>
    <td className='py-3 px-4'>
      <div className='space-y-1.5'>
        <div className='h-3.5 w-36 bg-zinc-200 rounded' />
        <div className='h-2.5 w-20 bg-zinc-100 rounded' />
      </div>
    </td>
    <td className='py-3 px-4'>
      <div className='h-3 w-20 bg-zinc-100 rounded' />
    </td>
    <td className='py-3 px-4'>
      <div className='h-3 w-16 bg-zinc-100 rounded' />
    </td>
    <td className='py-3 px-4'>
      <div className='h-3 w-12 bg-zinc-100 rounded' />
    </td>
    <td className='py-3 px-4'>
      <div className='h-3 w-10 bg-zinc-100 rounded' />
    </td>
    <td className='py-3 px-4'>
      <div className='h-3 w-14 bg-zinc-100 rounded' />
    </td>
    <td className='py-3 px-4'>
      <div className='h-3 w-20 bg-zinc-100 rounded' />
    </td>
    <td className='py-3 px-4 w-10'>
      <div className='w-5 h-5 rounded bg-zinc-100' />
    </td>
  </tr>
);

// ─── Mobile Stat Strip ────────────────────────────────────────────────────────

const MobileStatStrip: React.FC<{ summary: StockSummaryResponse | null }> = ({
  summary,
}) => {
  const items = [
    {
      label: "Active",
      value: formatNumber(summary?.totalActiveProductType),
      color: "text-emerald-600",
    },
    {
      label: "Stock",
      value: formatNumber(summary?.totalActiveProducts),
      color: "text-blue-600",
    },
    {
      label: "Variants",
      value: formatNumber(summary?.totalActiveProductVariations),
      color: "text-violet-600",
    },
    {
      label: "Value",
      value: summary
        ? `৳${formatNumber(summary.totalActiveProductPrice)}`
        : "—",
      color: "text-amber-600",
    },
  ];
  return (
    <div className='grid grid-cols-4 gap-px bg-zinc-200 rounded-xl overflow-hidden border border-zinc-200'>
      {items.map((item, i) => (
        <div key={i} className='bg-white px-2 py-2.5 text-center'>
          <p className={`text-sm font-bold ${item.color} leading-tight`}>
            {item.value}
          </p>
          <p className='text-[9px] text-zinc-400 font-medium mt-0.5 uppercase tracking-wide'>
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
};

// ─── Mobile Tab Pill ──────────────────────────────────────────────────────────

const MobileTabPills: React.FC<{
  selectedTab: string;
  onTabChange: (tab: string) => void;
  counts: Record<string, number>;
}> = ({ selectedTab, onTabChange, counts }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={scrollRef}
      className='flex gap-2 overflow-x-auto scrollbar-hide pb-0.5 px-4'>
      {TAB_CONFIG.map(({ value, label, badgeClass }) => {
        const active = selectedTab === value;
        return (
          <button
            key={value}
            onClick={() => onTabChange(value)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              active
                ? "bg-zinc-900 text-white shadow-sm"
                : "bg-white text-zinc-500 border border-zinc-200"
            }`}>
            {label}
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${active ? "bg-white/20 text-white" : badgeClass}`}>
              {counts[value]}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ─── Mobile Empty ─────────────────────────────────────────────────────────────

const MobileEmptyState: React.FC<{
  type: "no-products" | "no-results";
  searchQuery?: string;
  hasCreatePermission?: boolean;
  onCreateProduct?: () => void;
  onClearFilters?: () => void;
}> = ({
  type,
  searchQuery,
  hasCreatePermission,
  onCreateProduct,
  onClearFilters,
}) => (
  <div className='flex flex-col items-center justify-center py-16 px-6 text-center'>
    <div className='w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4'>
      {type === "no-products" ? (
        <Package className='w-7 h-7 text-zinc-300' />
      ) : (
        <Search className='w-7 h-7 text-zinc-300' />
      )}
    </div>
    <h3 className='text-base font-semibold text-zinc-800 mb-1'>
      {type === "no-products" ? "No products yet" : "No results found"}
    </h3>
    <p className='text-sm text-zinc-500 mb-5'>
      {type === "no-products"
        ? "Add your first product to start managing inventory."
        : searchQuery
          ? `No products match "${searchQuery}"`
          : "Try adjusting your filters."}
    </p>
    {type === "no-products" && hasCreatePermission && onCreateProduct && (
      <button
        onClick={onCreateProduct}
        className='inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl'>
        <PlusCircle className='w-4 h-4' /> Add Product
      </button>
    )}
    {type === "no-results" && onClearFilters && (
      <button
        onClick={onClearFilters}
        className='inline-flex items-center gap-2 bg-zinc-100 text-zinc-700 text-sm font-semibold px-4 py-2.5 rounded-xl'>
        Clear filters
      </button>
    )}
  </div>
);

// ─── Mobile Pagination ────────────────────────────────────────────────────────

const MobilePagination: React.FC<{
  currentPageNum: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
  onPrev: () => void;
  onNext: () => void;
  onLimitChange: (limit: number) => void;
}> = ({ currentPageNum, totalPages, totalProducts, limit, onPrev, onNext, onLimitChange }) => (
  <div className='bg-white border-t border-zinc-100 px-4 py-3'>
    <div className='flex items-center justify-between'>
      <button
        disabled={currentPageNum < 2}
        onClick={onPrev}
        className='flex items-center gap-1.5 text-sm font-medium text-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform'>
        <ChevronLeft className='h-4 w-4' /> Prev
      </button>
      <div className='text-center'>
        <p className='text-xs font-semibold text-zinc-800'>
          {currentPageNum} / {totalPages}
        </p>
        <p className='text-[10px] text-zinc-400'>
          {Math.max(1, (currentPageNum - 1) * limit + 1)}–
          {Math.min(currentPageNum * limit, totalProducts)} of {totalProducts}
        </p>
      </div>
      <button
        disabled={currentPageNum >= totalPages}
        onClick={onNext}
        className='flex items-center gap-1.5 text-sm font-medium text-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform'>
        Next <ChevronRight className='h-4 w-4' />
      </button>
    </div>
    <div className='flex items-center justify-center mt-2 pt-2 border-t border-zinc-100'>
      <span className='text-[10px] text-zinc-400 mr-1.5'>Per page</span>
      <Select value={`${limit}`} onValueChange={(v) => onLimitChange(parseInt(v, 10))}>
        <SelectTrigger className='h-6 w-[60px] text-[10px] rounded-md border-zinc-200'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {["20", "50", "70", "100"].map((v) => (
            <SelectItem key={v} value={v} className='text-[10px]'>
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);

// ─── Mobile Loading Skeleton ──────────────────────────────────────────────────

const MobileLoadingSkeleton: React.FC = () => (
  <div className='px-4 grid grid-cols-2 gap-2.5'>
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className='bg-white rounded-xl border border-zinc-100 overflow-hidden animate-pulse'>
        <div className='aspect-[4/3] bg-zinc-100' />
        <div className='p-2.5 space-y-2'>
          <div className='h-3.5 bg-zinc-200 rounded w-4/5' />
          <div className='h-3 bg-zinc-100 rounded w-3/5' />
          <div className='flex gap-1.5'>
            <div className='flex-1 h-6 bg-zinc-100 rounded-lg' />
            <div className='flex-1 h-6 bg-zinc-100 rounded-lg' />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ─── ProductList ──────────────────────────────────────────────────────────────

interface Props {
  handleEditProduct: (id: string) => void;
}

const ProductList: React.FC<Props> = ({ handleEditProduct }) => {
  const {
    limit,
    setLimit,
    productFetching,
    products,
    currentPageNum,
    totalPages,
    refreshList,
    totalProducts,
    setSearchQuery,
    updateCurrentPage,
    selectedCategory,
    deleteProductData,
    setSelectedCategory,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  } = useProductList();

  const navigate = useNavigate();
  const { hasRequiredPermission } = useRoleCheck();
  const [inputValue, setInputValue] = useState<string>("");
  const { categories, fetchCategories } = useCategory();
  const debounceHandler = useDebounce(inputValue, 500);

  const [viewType, setViewType] = useState<"list" | "grid" | "tree">("list");
  const [summary, setSummary] = useState<StockSummaryResponse | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabKey>("all");
  const [mobileSelectedTab, setMobileSelectedTab] = useState<TabKey>("all");
  const [showKeyboardSearch, setShowKeyboardSearch] = useState(false);
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [showStatusDrawer, setShowStatusDrawer] = useState(false);
  // ← KEY: separate "table only" loading state so page chrome never re-mounts
  const [isTableLoading, setIsTableLoading] = useState(false);

  // Sort field labels for desktop dropdown
  const SORT_FIELD_LABELS: Record<SortField, string> = {
    priority: "Priority",
    createdAt: "Created",
    updatedAt: "Updated",
    name: "Name",
    price: "Price",
    quantity: "Stock",
    outofstock: "Out of Stock",
  };

  const handleMobileSort = (field: SortField, order: SortOrder) => {
    setSortBy(field);
    setSortOrder(order);
  };

  const handleViewProductDetails = (id: string) => navigate(`/products/${id}`);

  const getProductSummaryDetails = async () => {
    const response = await getProductSummary();
    if (response?.success) setSummary(response?.data);
    else {
      errorToast(
        response?.error ?? "Something went wrong. Please try again",
        "top-center",
      );
      setSummary(null);
    }
  };

  useEffect(() => {
    fetchCategories();
    getProductSummaryDetails();
  }, []);
  useEffect(() => {
    setSearchQuery(inputValue);
  }, [debounceHandler]);

  // Wrap page-change to use table-only loading state
  const handlePageChange = useCallback(
    async (delta: number) => {
      setIsTableLoading(true);
      try {
        await updateCurrentPage(Number(delta));
      } finally {
        // give the products state time to settle
        setTimeout(() => setIsTableLoading(false), 400);
      }
    },
    [updateCurrentPage],
  );

  // Also track when productFetching transitions (for search/filter changes — those are fine to show overlay too)
  const prevFetching = useRef(productFetching);
  useEffect(() => {
    if (prevFetching.current && !productFetching) setIsTableLoading(false);
    prevFetching.current = productFetching;
  }, [productFetching]);

  // ── Summary stat data ──────────────────────────────────────────────────────

  const statCards = [
    {
      title: "Active Products",
      value: summary ? formatNumber(summary.totalActiveProductType) : "—",
      description: "Available for sale",
      icon: <Package className='h-4 w-4 text-blue-500' />,
      accent: "border-blue-100",
      key: "totalActiveProducts",
      total: summary?.totalActiveProductType,
    },
    {
      title: "Total Stock",
      value: summary ? formatNumber(summary.totalActiveProducts) : "—",
      description: "Units in inventory",
      icon: <Archive className='h-4 w-4 text-emerald-500' />,
      accent: "border-emerald-100",
      key: "totalStock",
      total: summary?.totalActiveProducts,
    },
    {
      title: "Variations",
      value: summary ? formatNumber(summary.totalActiveProductVariations) : "—",
      description: "Distinct variants",
      icon: <Activity className='h-4 w-4 text-violet-500' />,
      accent: "border-violet-100",
      key: "totalVariants",
      total: summary?.totalActiveProductVariations,
    },
    {
      title: "Inventory Value",
      value: summary
        ? `৳${formatNumber(summary.totalActiveProductPrice)}`
        : "—",
      description: "Total valuation",
      icon: <FilePieChart className='h-4 w-4 text-amber-500' />,
      accent: "border-amber-100",
      key: "totalPrice",
      total: summary?.totalActiveProductPrice,
    },
  ];

  // ── Tab counts ─────────────────────────────────────────────────────────────

  const tabCounts: Record<TabKey, number> = {
    all: products.length,
    active: products.filter((p: IProduct) => p.active).length,
    inactive: products.filter((p: IProduct) => !p.active).length,
    instock: products.filter((p: IProduct) => p.quantity > 0).length,
    outofstock: products.filter((p: IProduct) => p.quantity <= 0).length,
  };

  // ── Pagination select ──────────────────────────────────────────────────────

  const PaginationSelect = ({ className }: { className?: string }) => (
    <Select value={`${limit}`} onValueChange={(v) => setLimit(parseInt(v, 10))}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Per page</SelectLabel>
          {["10", "20", "50", "100", "150", "200"].map((v) => (
            <SelectItem key={v} value={v}>
              {v}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );

  // ── Category breakdown sheet ───────────────────────────────────────────────

  const renderCategoryBreakdown = () =>
    summary?.categories?.length ? (
      <SheetContainer>
        <SheetTrigger asChild>
          <Button variant='outline' size='sm' className='h-8 text-xs gap-1.5'>
            <BarChartHorizontalBig className='h-3.5 w-3.5' /> By Category
          </Button>
        </SheetTrigger>
        <SheetContent className='w-full sm:max-w-2xl overflow-y-auto'>
          <SheetHeader className='mb-5'>
            <SheetTitle className='flex items-center gap-2 text-base'>
              <BarChartHorizontalBig className='h-4 w-4 text-zinc-500' />
              Category Breakdown
            </SheetTitle>
            <SheetDescription className='text-sm'>
              Inventory distribution across product categories
            </SheetDescription>
          </SheetHeader>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {statCards.map(({ title, total, key }, i) => (
              <div key={i}>
                <h4 className='text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 pb-2 border-b'>
                  {title}
                </h4>
                <div className='space-y-3'>
                  {summary.categories.map(
                    (res: CategoryStockSummary, j: number) => {
                      const val = res[
                        key as keyof CategoryStockSummary
                      ] as number;
                      const pct = ((val / (total ?? 1)) * 100).toFixed(1);
                      return (
                        <div key={j} className='space-y-1.5'>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-zinc-700 font-medium truncate'>
                              {res.categoryName}
                            </span>
                            <span className='text-sm font-semibold text-zinc-900 ml-2 shrink-0'>
                              {formatNumber(val)}
                            </span>
                          </div>
                          <Progress value={+pct} className='h-1.5' />
                          <div className='text-[10px] text-zinc-400'>
                            {pct}% of total
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </SheetContainer>
    ) : null;

  // ── Table headers ──────────────────────────────────────────────────────────

  const TABLE_HEADERS = [
    "Product",
    "Category",
    "Price",
    "Variant",
    "Stock",
    "Sold | Returned",
    "Last Updated",
  ] as const;

  // ── Filtered products for current tab ─────────────────────────────────────

  const tabFilter =
    TAB_CONFIG.find((t) => t.value === selectedTab)?.filter ?? (() => true);
  const filteredProducts = products.filter(tabFilter);
  const mobileTabFilter =
    TAB_CONFIG.find((t) => t.value === mobileSelectedTab)?.filter ??
    (() => true);
  const mobileFilteredProducts = products.filter(mobileTabFilter);

  // ─── INITIAL full-page loading ─────────────────────────────────────────────

  if (productFetching && products.length === 0) {
    return (
      <>
        {/* Mobile loading */}
        <div className='sm:hidden bg-gray-50 min-h-screen'>
          <div className='bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between'>
            <div className='space-y-1'>
              <div className='h-5 w-24 bg-zinc-200 rounded animate-pulse' />
              <div className='h-3 w-16 bg-zinc-100 rounded animate-pulse' />
            </div>
            <div className='h-8 w-28 bg-zinc-200 rounded-xl animate-pulse' />
          </div>
          <div className='px-4 py-3'>
            <div className='h-10 bg-zinc-200 rounded-xl animate-pulse mb-3' />
            <div className='grid grid-cols-4 gap-px bg-zinc-200 rounded-xl overflow-hidden border border-zinc-200 mb-3'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='bg-white px-2 py-2.5 text-center'>
                  <div className='h-5 bg-zinc-200 rounded mb-1 animate-pulse' />
                  <div className='h-2 bg-zinc-100 rounded animate-pulse' />
                </div>
              ))}
            </div>
          </div>
          <MobileLoadingSkeleton />
        </div>
        {/* Desktop loading */}
        <div className='hidden sm:block space-y-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2.5'>
              <div className='w-8 h-8 rounded-lg bg-zinc-200 animate-pulse' />
              <div className='space-y-1'>
                <div className='h-4 w-24 bg-zinc-200 rounded animate-pulse' />
                <div className='h-3 w-16 bg-zinc-100 rounded animate-pulse' />
              </div>
            </div>
            <div className='h-8 w-28 bg-zinc-200 rounded-lg animate-pulse' />
          </div>
          <div className='grid grid-cols-4 gap-3'>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className='rounded-xl border border-zinc-100 bg-white p-4 animate-pulse'>
                <div className='h-3 w-20 bg-zinc-100 rounded mb-2' />
                <div className='h-7 w-16 bg-zinc-200 rounded mb-1' />
                <div className='h-2.5 w-24 bg-zinc-100 rounded' />
              </div>
            ))}
          </div>
          <div className='rounded-xl border border-zinc-200 bg-white overflow-hidden'>
            <div className='p-3 border-b border-zinc-100 bg-zinc-50/50'>
              <div className='h-8 w-64 bg-zinc-200 rounded-lg animate-pulse' />
            </div>
            <div className='divide-y divide-zinc-100'>
              {[...Array(8)].map((_, i) => (
                <div key={i} className='flex items-center gap-4 px-4 py-3'>
                  <div className='w-9 h-9 rounded-lg bg-zinc-100 animate-pulse shrink-0' />
                  <div className='flex-1 space-y-1.5'>
                    <div className='h-3.5 w-40 bg-zinc-200 rounded animate-pulse' />
                    <div className='h-2.5 w-24 bg-zinc-100 rounded animate-pulse' />
                  </div>
                  <div className='h-3 w-16 bg-zinc-100 rounded animate-pulse' />
                  <div className='h-3 w-12 bg-zinc-100 rounded animate-pulse' />
                  <div className='h-3 w-10 bg-zinc-100 rounded animate-pulse' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── Empty state ───────────────────────────────────────────────────────────

  if (
    !productFetching &&
    products.length === 0 &&
    !inputValue &&
    !selectedCategory
  ) {
    return (
      <>
        <div className='sm:hidden'>
          <MobileEmptyState
            type='no-products'
            hasCreatePermission={hasRequiredPermission("product", "create")}
            onCreateProduct={() => navigate("/products/create")}
          />
        </div>
        <div className='hidden sm:block'>
          {hasRequiredPermission("product", "create") ? (
            <EmptyView
              title='No products yet'
              description='Add your first product to start managing inventory.'
              buttonText='Add Product'
              handleButtonClick={() => navigate("/products/create")}
            />
          ) : (
            <EmptyView
              title='No products yet'
              description='Add your first product to start managing inventory.'
            />
          )}
        </div>
      </>
    );
  }

  // ─── Main render ───────────────────────────────────────────────────────────

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE VIEW (< sm)
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className='sm:hidden bg-zinc-50 min-h-screen flex flex-col'>
        {/* Sticky top bar */}
        <div className='sticky top-0 z-30 bg-white border-b border-zinc-200 shadow-sm'>
          {/* Header row */}
          <div className='flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500'>
            <div>
              <h1 className='text-lg font-bold text-white leading-tight'>
                Products
              </h1>
              <p className='text-[11px] text-white'>
                {totalProducts.toLocaleString()} total
              </p>
            </div>
            <div className='flex items-center gap-2'>
              {hasRequiredPermission("product", "create") && (
                <Button
                  onClick={() => navigate("/products/create")}
                  className='flex items-center gap-1.5 bg-white text-zinc-900 text-xs font-semibold px-3 py-2 rounded-md'>
                  <PlusCircle className='w-3.5 h-3.5' /> New
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        {/* <div className='px-4 pt-3 pb-2'>
          <MobileStatStrip summary={summary} />
        </div> */}

        {/* Product grid */}
        <div className='flex-1 px-4 pb-4'>
          {isTableLoading && products.length > 0 ? (
            <MobileLoadingSkeleton />
          ) : mobileFilteredProducts.length === 0 ? (
            inputValue || selectedCategory ? (
              <MobileEmptyState
                type='no-results'
                searchQuery={inputValue}
                onClearFilters={() => {
                  setInputValue("");
                  setSelectedCategory("");
                }}
              />
            ) : (
              <MobileEmptyState
                type='no-products'
                hasCreatePermission={hasRequiredPermission("product", "create")}
                onCreateProduct={() => navigate("/products/create")}
              />
            )
          ) : (
            <div className='grid grid-cols-2 gap-2.5'>
              {mobileFilteredProducts.map((product: IProduct) => (
                <MobileProductCard
                  key={product.id}
                  id={product.id}
                  sku={product.sku}
                  slug={product.slug}
                  image={product.thumbnail}
                  title={product.name}
                  categoryName={product.categoryName ?? "Not Added"}
                  categoryNames={product.categoryNames}
                  active={product.active}
                  quantity={product.quantity}
                  unitPrice={product.unitPrice}
                  totalSold={product.totalSold ?? 0}
                  totalReturned={product.totalReturned ?? 0}
                  variations={
                    product.variantList?.length
                      ? product.variantList
                      : ["No Variant"]
                  }
                  updatedAt={
                    product.timestamps?.updatedAt || new Date().toISOString()
                  }
                  onEdit={handleEditProduct}
                  onDelete={deleteProductData}
                  onViewDetails={handleViewProductDetails}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sticky bottom pagination */}
        {inputValue === "" && totalPages > 1 && (
          <div className='sticky bottom-0 z-20 border-t mb-20 border-zinc-200 bg-white/95 backdrop-blur-sm safe-area-bottom'>
            <MobilePagination
              currentPageNum={currentPageNum}
              totalPages={totalPages}
              totalProducts={totalProducts}
              limit={limit}
              onPrev={() => handlePageChange(-1)}
              onNext={() => handlePageChange(1)}
              onLimitChange={setLimit}
            />
          </div>
        )}

        {/* Mobile bottom navigation */}
        <MobileProductBottomNav
          onSearchClick={() => setShowKeyboardSearch(true)}
          onStatusClick={() => setShowStatusDrawer(true)}
          onCategoryClick={() => setShowCategoryDrawer(true)}
          onSortClick={() => setShowSortSheet(true)}
          hasActiveStatus={mobileSelectedTab !== "all"}
          hasActiveCategory={!!selectedCategory}
          hasActiveSort={sortBy !== "priority"}
        />
      </div>

      {/* Mobile keyboard search */}
      <MobileKeyboardSearch
        open={showKeyboardSearch}
        searchValue={inputValue}
        onSearchChange={setInputValue}
        onClose={() => setShowKeyboardSearch(false)}
      />

      {/* Mobile sort sheet */}
      <MobileProductSortSheet
        open={showSortSheet}
        onOpenChange={setShowSortSheet}
        onSort={handleMobileSort}
        initialField={sortBy}
        initialOrder={sortOrder}
      />

      {/* Mobile status drawer */}
      <MobileStatusDrawer
        open={showStatusDrawer}
        onOpenChange={setShowStatusDrawer}
        onSelect={(t) => setMobileSelectedTab(t as TabKey)}
        options={TAB_CONFIG.map(({ value, label, badgeClass }) => ({
          value,
          label,
          badgeClass,
        }))}
        counts={tabCounts}
        selectedTab={mobileSelectedTab}
      />

      {/* Mobile category drawer */}
      <Drawer open={showCategoryDrawer} onOpenChange={setShowCategoryDrawer}>
        <DrawerContent className='rounded-t-2xl max-h-[70vh]'>
          <DrawerHeader className='pb-2'>
            <DrawerTitle className='text-base font-semibold'>
              Filter by Category
            </DrawerTitle>
            <DrawerDescription className='text-xs'>
              Select a category to filter products
            </DrawerDescription>
          </DrawerHeader>
          <div className='px-4 pb-4 overflow-y-auto max-h-[55vh]'>
            <div className='space-y-1'>
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setShowCategoryDrawer(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${!selectedCategory ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-zinc-600 hover:bg-zinc-50"}`}>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!selectedCategory ? "border-indigo-500 bg-indigo-500" : "border-zinc-300"}`}>
                  {!selectedCategory && (
                    <div className='w-2 h-2 rounded-full bg-white' />
                  )}
                </div>
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setShowCategoryDrawer(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${selectedCategory === cat.id ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-zinc-600 hover:bg-zinc-50"}`}>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedCategory === cat.id ? "border-indigo-500 bg-indigo-500" : "border-zinc-300"}`}>
                    {selectedCategory === cat.id && (
                      <div className='w-2 h-2 rounded-full bg-white' />
                    )}
                  </div>
                  <span className='truncate'>{cat.name}</span>
                  {cat.totalProducts > 0 && (
                    <span className='ml-auto text-xs text-zinc-400 shrink-0'>
                      {cat.totalProducts}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <DrawerFooter className='pt-0 pb-6'>
            <DrawerClose asChild>
              <Button variant='outline' className='w-full'>
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* ══════════════════════════════════════════════════════════════════════
          DESKTOP VIEW (≥ sm)
      ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className={cn(
          "hidden sm:block space-y-3",
          viewType === "tree" ? "mx-6" : "container",
        )}>
        {/* Page header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center'>
              <ShoppingBag className='h-4 w-4 text-white' />
            </div>
            <div>
              <h1 className='text-lg font-semibold text-zinc-900 leading-tight'>
                Products
              </h1>
              <p className='text-xs text-zinc-500'>
                {totalProducts > 0
                  ? `${totalProducts.toLocaleString()} total`
                  : "No products yet"}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {renderCategoryBreakdown()}
            {hasRequiredPermission("product", "create") && (
              <Button
                size='sm'
                onClick={() => navigate("/products/create")}
                className='h-8 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3'>
                <PlusCircle className='h-3.5 w-3.5' /> New Product
              </Button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className='grid grid-cols-4 gap-3'>
          {statCards.map((card, i) => (
            <StatCard key={i} {...card} />
          ))}
        </div>

        {/* Main panel */}
        <div className='rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm'>
          {/* Command bar */}
          <div className='flex items-center gap-2 px-4 py-2.5 border-b border-zinc-100 bg-zinc-50/50'>
            <div className='relative flex-1 max-w-sm'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none' />
              <Input
                type='text'
                placeholder='Search by name, SKU, category…'
                className='pl-9 h-8 text-sm bg-white border-zinc-200 rounded-lg placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-indigo-500'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              {inputValue && (
                <button
                  onClick={() => setInputValue("")}
                  className='absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600'>
                  <X className='h-3.5 w-3.5' />
                </button>
              )}
            </div>
            <CategoryFilterDropdown
              categories={categories}
              setSelectedCategory={setSelectedCategory}
              selectedCategory={selectedCategory}
            />
            {/* Sort controls */}
            <Select
              value={sortBy}
              onValueChange={(val) => setSortBy(val as SortField)}>
              <SelectTrigger className='h-8 w-36 text-xs'>
                <ArrowUpDown className='h-3 w-3 mr-1.5' />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SORT_FIELD_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value} className='text-xs'>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className='h-8 w-8 px-0'
              title={
                sortOrder === "asc"
                  ? "Ascending — click for descending"
                  : "Descending — click for ascending"
              }>
              {sortOrder === "asc" ? (
                <ArrowUp className='h-3.5 w-3.5' />
              ) : (
                <ArrowDown className='h-3.5 w-3.5' />
              )}
            </Button>
            {(inputValue || selectedCategory) && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setInputValue("");
                  setSelectedCategory("");
                }}
                className='h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 px-2.5'>
                Clear
              </Button>
            )}
            <div className='ml-auto flex items-center gap-1.5'>
              <div className='flex items-center rounded-lg border border-zinc-200 bg-white p-0.5'>
                {(["list", "tree", "grid"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setViewType(type)}
                    className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${viewType === type ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-600"}`}>
                    {type === "list" ? (
                      <List className='h-3.5 w-3.5' />
                    ) : type === "grid" ? (
                      <Grid2X2 className='h-3.5 w-3.5' />
                    ) : (
                      <FolderTree className='h-3.5 w-3.5' />
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={getProductSummaryDetails}
                className='w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors'
                title='Refresh'>
                <RefreshCw className='h-3.5 w-3.5' />
              </button>
            </div>
          </div>

          {/* Tab strip */}
          <div className='flex items-center gap-0 px-4 border-b border-zinc-100 overflow-x-auto scrollbar-hide'>
            {TAB_CONFIG.map(({ value, label, badgeClass }) => (
              <button
                key={value}
                onClick={() => setSelectedTab(value)}
                className={`relative flex items-center gap-2 h-10 px-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  selectedTab === value
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}>
                {label}
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${badgeClass}`}>
                  {tabCounts[value]}
                </span>
              </button>
            ))}
          </div>

          {/* Table area — relative so the overlay can position against it */}
          <div className='relative'>
            {/* Overlay for table-only loading (pagination / filter) */}
            {isTableLoading && <TableLoadingOverlay />}

            {["list", "tree"].includes(viewType) ? (
              filteredProducts.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-16 text-center px-4'>
                  <div className='w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4'>
                    <Package className='h-7 w-7 text-zinc-300' />
                  </div>
                  <h3 className='text-base font-semibold text-zinc-800 mb-1'>
                    {TAB_CONFIG.find((t) => t.value === selectedTab)
                      ?.emptyTitle ?? "No products"}
                  </h3>
                  <p className='text-sm text-zinc-500 mb-5 max-w-xs'>
                    {inputValue
                      ? `No products match "${inputValue}"`
                      : TAB_CONFIG.find((t) => t.value === selectedTab)
                          ?.emptyDescription}
                  </p>
                  {selectedTab === "all" &&
                    hasRequiredPermission("product", "create") &&
                    !inputValue && (
                      <Button
                        onClick={() => navigate("/products/create")}
                        size='sm'
                        className='bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-9 px-4 text-sm'>
                        <PlusCircle className='h-4 w-4 mr-1.5' /> Add Product
                      </Button>
                    )}
                </div>
              ) : (
                <div className='max-h-[560px] overflow-y-auto'>
                  <Table divClass='relative'>
                    <TableHeader className='sticky top-0 z-10'>
                      <TableRow className='bg-zinc-50 border-b border-zinc-200 hover:bg-zinc-50'>
                        <TableHead className='w-12 bg-zinc-50 text-zinc-400 py-2.5'>
                          <Image className='h-3.5 w-3.5' />
                        </TableHead>
                        {TABLE_HEADERS.map((h) => (
                          <TableHead
                            key={h}
                            className='bg-zinc-50 text-zinc-500 text-xs font-semibold uppercase tracking-wide py-2.5'>
                            {h}
                          </TableHead>
                        ))}
                        <TableHead className='w-10 bg-zinc-50 text-zinc-400 py-2.5'>
                          <MoreHorizontal className='h-3.5 w-3.5' />
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product: IProduct) => (
                        <SingleItem
                          key={product?.id}
                          id={product?.id}
                          sku={product?.sku}
                          slug={product?.slug}
                          image={product?.thumbnail}
                          title={product?.name}
                          categoryName={product?.categoryName ?? "Not Added"}
                          active={product?.active}
                          quantity={product?.quantity}
                          unitPrice={product?.unitPrice}
                          totalSold={product?.totalSold ?? 0}
                          totalReturned={product?.totalReturned ?? 0}
                          variations={
                            (product?.variantList?.length
                              ? product.variantList
                              : ["No Variant"]) as string[]
                          }
                          variationList={product?.variation}
                          hasVariation={product?.hasVariation}
                          imageGroups={product?.imageGroups}
                          handleUpdateProduct={handleEditProduct}
                          deleteExistingProduct={deleteProductData}
                          updatedAt={product?.timestamps?.updatedAt}
                          refreshProductList={refreshList}
                          handleViewProductDetails={handleViewProductDetails}
                          variationDisplayMode={viewType}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )
            ) : (
              <div className='max-h-[560px] overflow-y-auto p-4'>
                {filteredProducts.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-12 text-center'>
                    <Package className='h-10 w-10 text-zinc-300 mb-3' />
                    <p className='text-sm font-medium text-zinc-500'>
                      No products in this view
                    </p>
                  </div>
                ) : (
                  <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                    {filteredProducts.map((product: IProduct) => (
                      <SingleProductCardItem
                        key={product?.id}
                        id={product?.id}
                        sku={product?.sku}
                        image={product?.thumbnail}
                        title={product?.name}
                        categoryName={product?.categoryName ?? "Not Added"}
                        active={product?.active}
                        quantity={product?.quantity}
                        unitPrice={product?.unitPrice}
                        totalSold={product?.totalSold ?? 0}
                        totalReturned={product?.totalReturned ?? 0}
                        variations={
                          product?.variantList?.length
                            ? product.variantList
                            : ["No Variant"]
                        }
                        handleUpdateProduct={handleEditProduct}
                        deleteExistingProduct={deleteProductData}
                        updatedAt={product?.timestamps?.updatedAt}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination footer */}
          {inputValue === "" && (
            <div className='border-t border-zinc-100 px-4 py-2.5 flex items-center justify-between bg-zinc-50/50'>
              <p className='text-xs text-zinc-500'>
                Showing{" "}
                <span className='font-semibold text-zinc-700'>
                  {Math.max(1, (currentPageNum - 1) * limit + 1)}–
                  {Math.min(currentPageNum * limit, totalProducts)}
                </span>{" "}
                of{" "}
                <span className='font-semibold text-zinc-700'>
                  {totalProducts}
                </span>{" "}
                products
              </p>
              <div className='flex items-center gap-1.5'>
                <PaginationSelect className='h-7 w-[70px] text-xs border-zinc-200' />
                <div className='flex items-center gap-1'>
                  <Button
                    disabled={currentPageNum < 2 || isTableLoading}
                    variant='outline'
                    size='sm'
                    onClick={() => handlePageChange(-1)}
                    className='h-7 w-7 p-0 rounded-md'>
                    <ChevronLeft className='h-3.5 w-3.5' />
                  </Button>
                  <span className='text-xs text-zinc-600 font-medium px-2 min-w-[60px] text-center'>
                    {currentPageNum} / {totalPages}
                  </span>
                  <Button
                    disabled={currentPageNum >= totalPages || isTableLoading}
                    variant='outline'
                    size='sm'
                    onClick={() => handlePageChange(1)}
                    className='h-7 w-7 p-0 rounded-md'>
                    <ChevronRight className='h-3.5 w-3.5' />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductList;
