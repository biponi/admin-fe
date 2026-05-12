import {
  BarChartHorizontalBig,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  Image,
  List,
  PlusCircle,
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Search,
  MoreHorizontal,
  ShoppingBag,
  Archive,
  Activity,
  FilePieChart,
  X,
  ZoomIn,
  BoxIcon,
  ImageOff,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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
import { useEffect, useState, useCallback } from "react";
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
import { SkeletonCard } from "../../coreComponents/sekeleton";
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
  Collapsible,
  CollapsibleContent,
} from "../../components/ui/collapsible";
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
import MobileProductHeader from "./components/MobileProductHeader";
import MobileProductCard from "./components/MobileProductCard";
import MobileProductFilters from "./components/MobileProductFilters";
import MobileProductEmpty from "./components/MobileProductEmpty";
import MobileProductSummary from "./components/MobileProductSummary";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatNumber = (num: number | undefined): string => {
  if (num === undefined || num === null) return "0";
  return Number(num) % 1 < 1
    ? Math.floor(num).toLocaleString()
    : num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};

// const getStockStatusColor = (quantity: number) => {
//   if (quantity <= 0) return "bg-red-100 text-red-700 border-red-200";
//   if (quantity <= 10) return "bg-orange-100 text-orange-700 border-orange-200";
//   return "bg-green-100 text-green-700 border-green-200";
// };

// const getStockStatusText = (quantity: number) => {
//   if (quantity <= 0) return "Out of Stock";
//   if (quantity <= 10) return "Low Stock";
//   return "In Stock";
// };

// ─── Tab Config ─────────────────────────────────────────────────────────────

type TabKey = "all" | "active" | "inactive" | "instock" | "outofstock";

const TAB_CONFIG: {
  value: TabKey;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  filter: (p: IProduct) => boolean;
}[] = [
  {
    value: "all",
    label: "All",
    shortLabel: "All",
    icon: null,
    emptyIcon: <Package className='h-16 w-16 text-gray-300' />,
    emptyTitle: "No products found",
    emptyDescription: "Get started by adding your first product",
    filter: () => true,
  },
  {
    value: "active",
    label: "Active",
    shortLabel: "✓",
    icon: <CheckCircle className='h-3 w-3' />,
    emptyIcon: <CheckCircle className='h-16 w-16 text-gray-300' />,
    emptyTitle: "No active products",
    emptyDescription: "All your products are currently inactive",
    filter: (p) => p.active,
  },
  {
    value: "inactive",
    label: "Inactive",
    shortLabel: "!",
    icon: <AlertCircle className='h-3 w-3' />,
    emptyIcon: <AlertCircle className='h-16 w-16 text-gray-300' />,
    emptyTitle: "No inactive products",
    emptyDescription: "All your products are currently active",
    filter: (p) => !p.active,
  },
  {
    value: "instock",
    label: "In Stock",
    shortLabel: "↑",
    icon: <TrendingUp className='h-3 w-3' />,
    emptyIcon: <TrendingUp className='h-16 w-16 text-gray-300' />,
    emptyTitle: "No products in stock",
    emptyDescription: "Time to restock your inventory",
    filter: (p) => p.quantity > 0,
  },
  {
    value: "outofstock",
    label: "Out of Stock",
    shortLabel: "↓",
    icon: <TrendingDown className='h-3 w-3' />,
    emptyIcon: <TrendingDown className='h-16 w-16 text-green-400' />,
    emptyTitle: "Great! No products out of stock",
    emptyDescription: "Your inventory is well stocked",
    filter: (p) => p.quantity <= 0,
  },
];

// ─── Variant Display Types & Helpers ───────────────────────────────────────────

interface VariantDisplay {
  name: string;
  image?: string;
  sku?: string;
  stock?: number;
  price?: number;
}

const normalizeVariations = (product: IProduct | null): VariantDisplay[] => {
  if (!product?.variation || product.variation.length === 0) return [];

  return product.variation.map((v) => {
    // Get first image if available
    let imageUrl: string | undefined;
    if (v.images && v.images.length > 0) {
      const img = v.images[0];
      if (typeof img === "string") {
        imageUrl = img;
      } else if (img instanceof File) {
        imageUrl = URL.createObjectURL(img);
      }
    }

    return {
      name:
        v.name ||
        v.title ||
        `${v.color || ""} ${v.size || ""}`.trim() ||
        "Variant",
      image: imageUrl,
      sku: v.sku,
      stock: v.quantity,
      price: v.unitPrice,
    };
  });
};

// ─── Variant Lightbox ───────────────────────────────────────────────────────────

interface VariantLightboxProps {
  variants: VariantDisplay[];
  startIndex: number;
  onClose: () => void;
}

const VariantLightbox: React.FC<VariantLightboxProps> = ({
  variants,
  startIndex,
  onClose,
}) => {
  const [idx, setIdx] = useState(startIndex);
  const withImages = variants.filter((v) => v.image);
  const current = withImages[idx];

  const prev = useCallback(
    () => setIdx((i) => (i - 1 + withImages.length) % withImages.length),
    [withImages.length],
  );
  const next = useCallback(
    () => setIdx((i) => (i + 1) % withImages.length),
    [withImages.length],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  if (!current) return null;

  return (
    <div
      className='fixed inset-0 z-[200] flex items-center justify-center bg-black/80'
      onClick={onClose}>
      <div
        className='relative max-w-lg w-full mx-4 rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl'
        onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className='absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors'
          aria-label='Close lightbox'>
          <X className='w-4 h-4' />
        </button>

        <div className='aspect-square w-full bg-zinc-800'>
          <img
            src={current.image}
            alt={current.name}
            className='w-full h-full object-contain'
          />
        </div>

        <div className='px-5 py-4 flex items-center justify-between'>
          <div>
            <p className='text-white font-semibold text-sm'>{current.name}</p>
            {current.sku && (
              <p className='text-zinc-400 text-xs font-mono mt-0.5'>
                {current.sku}
              </p>
            )}
          </div>
          <span className='text-zinc-500 text-xs'>
            {idx + 1} / {withImages.length}
          </span>
        </div>

        {withImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className='absolute left-3 top-[45%] -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors'
              aria-label='Previous image'>
              <ChevronLeft className='w-5 h-5' />
            </button>
            <button
              onClick={next}
              className='absolute right-3 top-[45%] -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors'
              aria-label='Next image'>
              <ChevronRight className='w-5 h-5' />
            </button>
          </>
        )}

        {withImages.length > 1 && (
          <div className='flex gap-2 px-5 pb-4 overflow-x-auto'>
            {withImages.map((v, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  i === idx
                    ? "border-indigo-400 scale-105"
                    : "border-transparent opacity-50 hover:opacity-100"
                }`}>
                <img
                  src={v.image}
                  alt={v.name}
                  className='w-full h-full object-cover'
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── ProductVariationDrawer ──────────────────────────────────────────────────

const ProductVariationDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  product: IProduct | null;
}> = ({ isOpen, onClose, product }) => {
  const [query, setQuery] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const normalized = normalizeVariations(product);
  const hasVars = normalized.length > 0;
  const withImages = normalized.filter((v) => v.image);

  const filtered = hasVars
    ? normalized.filter((v) =>
        v.name.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) =>
      e.key === "Escape" && !lightboxIndex && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose, lightboxIndex]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!product || !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className='fixed inset-0 z-[100] bg-black/40' onClick={onClose} />

      {/* Sheet */}
      <div
        className='fixed bottom-0 left-0 right-0 z-[110] max-h-[90dvh] flex flex-col rounded-t-3xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300'
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Drag handle */}
        <div className='flex justify-center pt-3 pb-1 shrink-0'>
          <div className='w-10 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700' />
        </div>

        {/* Header */}
        <div className='px-5 pt-2 pb-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0'>
          <div className='flex items-start justify-between gap-3 mb-3'>
            <div className='flex items-center gap-3 min-w-0'>
              <div className='w-11 h-11 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 ring-1 ring-zinc-200 dark:ring-zinc-700'>
                {product.thumbnail ? (
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className='w-full h-full object-cover'
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <Package className='h-5 w-5 text-gray-400' />
                  </div>
                )}
              </div>
              <div className='min-w-0'>
                <h3 className='text-[15px] font-semibold text-zinc-900 dark:text-white leading-tight truncate'>
                  {product.name}
                </h3>
                <p className='text-xs text-zinc-500 dark:text-zinc-400 mt-0.5'>
                  {hasVars ? normalized.length : 0} variant
                  {normalized.length !== 1 ? "s" : ""}
                  {withImages.length > 0 && (
                    <span className='ml-1.5 text-indigo-500 dark:text-indigo-400'>
                      · {withImages.length} with photos
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shrink-0'
              aria-label='Close'>
              <X className='w-4 h-4' />
            </button>
          </div>

          {/* Search bar */}
          {hasVars && normalized.length > 3 && (
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none' />
              <input
                type='text'
                placeholder='Search variants…'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className='w-full pl-8 pr-8 py-2.5 text-sm rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 border border-transparent focus:border-indigo-300 dark:focus:border-indigo-700 outline-none transition-all'
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                  aria-label='Clear search'>
                  <X className='w-3.5 h-3.5' />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <div className='flex-1 overflow-y-auto overscroll-contain px-4 py-4'>
          {!hasVars ? (
            <div className='flex flex-col items-center justify-center py-14 text-zinc-400 dark:text-zinc-600'>
              <div className='w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4'>
                <Package className='w-7 h-7 opacity-40' />
              </div>
              <p className='text-sm font-medium text-zinc-500 dark:text-zinc-400'>
                No variants for this product
              </p>
              <p className='text-xs text-zinc-400 dark:text-zinc-600 mt-1'>
                Add variants to offer different options
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-10 text-zinc-400'>
              <Search className='w-6 h-6 mb-2 opacity-40' />
              <p className='text-sm'>No variants match "{query}"</p>
            </div>
          ) : (
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
              {filtered.map((variant, index) => {
                const imgIndex = withImages.findIndex(
                  (v) => v.name === variant.name,
                );
                return (
                  <div
                    key={index}
                    className='group relative flex flex-col rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 overflow-hidden hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200'>
                    {variant.image ? (
                      <div className='relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800'>
                        <img
                          src={variant.image}
                          alt={variant.name}
                          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                        />
                        <button
                          onClick={() =>
                            imgIndex >= 0 && setLightboxIndex(imgIndex)
                          }
                          className='absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-colors'
                          aria-label={`Zoom ${variant.name}`}>
                          <ZoomIn className='w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow' />
                        </button>
                      </div>
                    ) : (
                      <div className='aspect-square flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 gap-1.5'>
                        <ImageOff className='w-6 h-6 text-zinc-300 dark:text-zinc-600' />
                        <span className='text-[9px] text-zinc-400 dark:text-zinc-500 font-medium'>
                          No image
                        </span>
                      </div>
                    )}

                    <div className='p-2.5 flex flex-col gap-1'>
                      <p className='text-[12px] font-semibold text-zinc-800 dark:text-zinc-200 leading-tight line-clamp-2'>
                        {variant.name}
                      </p>
                      {variant.sku && (
                        <span className='text-[10px] font-mono text-zinc-400 dark:text-zinc-500 truncate'>
                          {variant.sku}
                        </span>
                      )}
                      {(variant.stock !== undefined ||
                        variant.price !== undefined) && (
                        <div className='flex items-center gap-1.5 flex-wrap mt-0.5'>
                          {variant.stock !== undefined && (
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
                                variant.stock > 0
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                              }`}>
                              <BoxIcon className='w-2.5 h-2.5' />
                              {variant.stock}
                            </span>
                          )}
                          {variant.price !== undefined && (
                            <span className='inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'>
                              ৳{formatNumber(variant.price)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='px-5 py-4 border-t border-zinc-100 dark:border-zinc-800 shrink-0'>
          <button
            onClick={onClose}
            className='w-full py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-[0.98] transition-all'>
            Done
          </button>
        </div>
      </div>

      {/* Lightbox — z above drawer */}
      {lightboxIndex !== null && (
        <VariantLightbox
          variants={normalized}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
};

// ─── Shared desktop table headers ───────────────────────────────────────────

const STYLED_TABLE_HEADERS = [
  "Product",
  "Category",
  "Price",
  "Variant",
  "Stock",
  "Sold | Returned",
  "Last Updated At",
] as const;

// ─── DesktopProductTable ─────────────────────────────────────────────────────

interface DesktopProductTableProps {
  products: IProduct[];
  viewType: "list" | "grid";
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  onViewDetails: (id: string) => void;
  renderGridView: () => React.ReactNode;
}

const DesktopProductTable: React.FC<DesktopProductTableProps> = ({
  products,
  viewType,
  onEdit,
  onDelete,
  onRefresh,
  onViewDetails,
  renderGridView,
}) => {
  const sharedItemProps = (product: IProduct) => ({
    key: product?.id,
    id: product?.id,
    sku: product?.sku,
    slug: product?.slug,
    image: product?.thumbnail,
    title: product?.name,
    categoryName: product?.categoryName ?? "Not Added",
    active: product?.active,
    quantity: product?.quantity,
    unitPrice: product?.unitPrice,
    totalSold: product?.totalSold ?? 0,
    totalReturned: product?.totalReturned ?? 0,
    variations: (product?.variantList?.length
      ? product.variantList
      : ["No Variant"]) as string[],
    variationList: product?.variation,
    hasVariation: product?.hasVariation,
    handleUpdateProduct: onEdit,
    deleteExistingProduct: onDelete,
    updatedAt: product?.timestamps?.updatedAt,
    refreshProductList: onRefresh,
    handleViewProductDetails: onViewDetails,
    variationDisplayMode: viewType === "grid" ? "grid" : "list",
  });

  return (
    <Table
      divClass='relative max-h-[499px] overflow-y-auto '
      className='border-sidebar'>
      <TableHeader className='sticky top-0 bg-white  z-10'>
        <TableRow className='bg-sidebar text-sidebar-foreground'>
          <TableHead className='w-12 bg-sidebar text-sidebar-foreground'>
            <Image className='h-4 w-4' />
          </TableHead>
          {STYLED_TABLE_HEADERS.map((h) => (
            <TableHead
              key={h}
              className='font-semibold bg-sidebar text-sidebar-foreground'>
              {h}
            </TableHead>
          ))}
          <TableHead className='w-16 bg-sidebar text-sidebar-foreground'>
            <MoreHorizontal className='h-4 w-4' />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <SingleItem {...sharedItemProps(product)} />
        ))}
      </TableBody>
    </Table>
  );
};

// ─── TabProductContent ───────────────────────────────────────────────────────

interface TabProductContentProps {
  tabConfig: (typeof TAB_CONFIG)[number];
  allProducts: IProduct[];
  viewType: "list" | "grid";
  inputValue: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  onViewDetails: (id: string) => void;
  renderGridView: () => React.ReactNode;
  renderMobileCard: (product: IProduct, index: number) => React.ReactNode;
  hasCreatePermission: boolean;
  onCreateProduct: () => void;
}

const TabProductContent: React.FC<TabProductContentProps> = ({
  tabConfig,
  allProducts,
  viewType,
  inputValue,
  onEdit,
  onDelete,
  onRefresh,
  onViewDetails,
  renderGridView,
  renderMobileCard,
  hasCreatePermission,
  onCreateProduct,
}) => {
  const filtered = allProducts.filter(tabConfig.filter);

  return (
    <TabsContent value={tabConfig.value} className='m-0'>
      <div className='max-h-[600px] overflow-y-auto'>
        {filtered.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            {tabConfig.emptyIcon}
            <h3 className='text-lg font-semibold text-gray-900 mb-2 mt-4'>
              {tabConfig.emptyTitle}
            </h3>
            <p className='text-gray-600 mb-6 max-w-sm'>
              {tabConfig.value === "all" && inputValue
                ? `No products match "${inputValue}"`
                : tabConfig.emptyDescription}
            </p>
            {tabConfig.value === "all" &&
              hasCreatePermission &&
              !inputValue && (
                <Button
                  onClick={onCreateProduct}
                  className='bg-indigo-600 hover:bg-indigo-700'>
                  <PlusCircle className='h-4 w-4 mr-2' />
                  Add Your First Product
                </Button>
              )}
          </div>
        ) : (
          <div className='py-4 px-2'>
            {/* Mobile */}
            <div className='md:hidden'>
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 max-h-[500px] overflow-y-auto'>
                {filtered.map(renderMobileCard)}
              </div>
            </div>
            {/* Desktop */}
            <div className='hidden md:block'>
              <div className='border rounded-lg overflow-hidden'>
                <div className='max-h-[500px] overflow-y-auto'>
                  <DesktopProductTable
                    products={filtered}
                    viewType={viewType}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onRefresh={onRefresh}
                    onViewDetails={onViewDetails}
                    renderGridView={renderGridView}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TabsContent>
  );
};

// ─── ProductList ─────────────────────────────────────────────────────────────

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
  } = useProductList();

  const navigate = useNavigate();
  const { hasRequiredPermission } = useRoleCheck();
  const [inputValue, setInputValue] = useState<string>("");
  const { categories, fetchCategories } = useCategory();
  const debounceHandler = useDebounce(inputValue, 500);

  const [viewType, setViewType] = useState<"list" | "grid">("list");
  const [summary, setSummary] = useState<StockSummaryResponse | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);
  const [isVariationDrawerOpen, setIsVariationDrawerOpen] = useState(false);
  const [selectedProductForVariations, setSelectedProductForVariations] =
    useState<IProduct | null>(null);

  const handleViewProductDetails = (id: string) => navigate(`/products/${id}`);

  const getProductSummaryDetails = async () => {
    const response = await getProductSummary();
    if (response?.success) {
      setSummary(response?.data);
    } else {
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
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    setSearchQuery(inputValue);
    //eslint-disable-next-line
  }, [debounceHandler]);

  const handleOpenVariationDrawer = (product: IProduct) => {
    setSelectedProductForVariations(product);
    setIsVariationDrawerOpen(true);
  };

  const handleCloseVariationDrawer = () => {
    setIsVariationDrawerOpen(false);
    setSelectedProductForVariations(null);
  };

  // ── Card summary data ──────────────────────────────────────────────────────

  const cardData = [
    {
      title: "Active Products",
      total: summary?.totalActiveProductType,
      key: "totalActiveProducts",
      description: "Products currently available for sale",
      icon: <Package className='h-6 w-6' />,
      gradient: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      iconColor: "text-blue-600",
      textColor: "text-blue-700",
    },
    {
      title: "Total Stock",
      total: summary?.totalActiveProducts,
      key: "totalStock",
      description: "Total quantity across all products",
      icon: <Archive className='h-6 w-6' />,
      gradient: "from-green-50 to-green-100",
      borderColor: "border-green-200",
      iconColor: "text-green-600",
      textColor: "text-green-700",
    },
    {
      title: "Product Variations",
      total: summary?.totalActiveProductVariations,
      key: "totalVariants",
      description: "Different variants available",
      icon: <Activity className='h-6 w-6' />,
      gradient: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      iconColor: "text-purple-600",
      textColor: "text-purple-700",
    },
    {
      title: "Total Value",
      total: summary?.totalActiveProductPrice,
      key: "totalPrice",
      description: "Combined inventory valuation",
      icon: <TrendingUp className='h-6 w-6' />,
      gradient: "from-amber-50 to-amber-100",
      borderColor: "border-amber-200",
      iconColor: "text-amber-600",
      textColor: "text-amber-700",
    },
  ];

  // ── Renderers ──────────────────────────────────────────────────────────────

  const renderMobileProductCard = (product: IProduct, _index: number) => (
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
        product?.variantList?.length ? product.variantList : ["No Variant"]
      }
      handleUpdateProduct={handleEditProduct}
      deleteExistingProduct={deleteProductData}
      updatedAt={product?.timestamps?.updatedAt}
      onViewVariations={() => handleOpenVariationDrawer(product)}
    />
  );

  const renderGridView = () => (
    <div className='grid grid-cols-8 gap-8 w-full'>
      {products.map(renderMobileProductCard)}
    </div>
  );

  const renderCategoryBreakdown = () =>
    summary?.categories?.length ? (
      <div className='flex justify-center lg:justify-start'>
        <SheetContainer>
          <SheetTrigger asChild>
            <Button
              variant='outline'
              className='w-full lg:w-auto md:bg-sidebar-foreground md:text-sidebar'>
              <BarChartHorizontalBig className='h-4 w-4 mr-2 md:text-sidebar' />
              View Category Breakdown
              <ChevronRight className='h-4 w-4 ml-2 md:text-sidebar' />
            </Button>
          </SheetTrigger>
          <SheetContent className='w-full sm:max-w-2xl'>
            <SheetHeader>
              <SheetTitle className='flex items-center space-x-2'>
                <BarChartHorizontalBig className='h-5 w-5 text-gray-600' />
                <span>Category Breakdown</span>
              </SheetTitle>
              <SheetDescription>
                Distribution of products across different categories
              </SheetDescription>
            </SheetHeader>
            <div className='mt-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto'>
              <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                {cardData.map(({ title, total, key }, cardIndex) => (
                  <div key={cardIndex} className='space-y-4'>
                    <h4 className='text-lg font-semibold text-gray-700 border-b pb-2 uppercase'>
                      {title}
                    </h4>
                    <div className='space-y-3'>
                      {summary.categories.map(
                        (res: CategoryStockSummary, index: number) => {
                          const val = res[
                            key as keyof CategoryStockSummary
                          ] as number;
                          const pct = ((val / (total ?? 1)) * 100).toFixed(1);
                          return (
                            <div
                              key={index}
                              className='space-y-2 p-3 bg-gray-200 rounded-lg'>
                              <div className='flex items-center justify-between'>
                                <span className='text-sm font-medium text-gray-700 truncate uppercase'>
                                  {res.categoryName}
                                </span>
                                <span className='text-sm font-bold text-gray-900'>
                                  {formatNumber(val)}
                                </span>
                              </div>
                              <Progress value={+pct} className='h-2' />
                              <div className='text-xs text-gray-500'>
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
            </div>
          </SheetContent>
        </SheetContainer>
      </div>
    ) : null;

  const renderSummaryCard = (isMobile: boolean) =>
    cardData.map(
      (
        {
          title,
          total,
          key,
          description,
          icon,
          gradient,
          borderColor,
          iconColor,
          textColor,
        },
        cardIndex,
      ) => (
        <Card
          key={cardIndex}
          className={
            isMobile
              ? `bg-gradient-to-br ${gradient} ${borderColor} border shadow-sm hover:shadow-md transition-shadow duration-200`
              : "bg-white md:bg-white border-2 border-dashed border-zinc-500 shadow-sm hover:shadow-md transition-shadow duration-200"
          }>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <p
                  className={
                    isMobile
                      ? "text-sm font-medium text-gray-600"
                      : "text-base text-gray-600 uppercase font-semibold"
                  }>
                  {title}
                </p>
                <p className={`text-2xl font-bold ${textColor}`}>
                  {!!summary && total !== undefined
                    ? key === "totalPrice"
                      ? `৳${formatNumber(total)}`
                      : formatNumber(total)
                    : "N/A"}
                </p>
                <p className='text-xs text-gray-500'>{description}</p>
              </div>
              <div className={iconColor}>{icon}</div>
            </div>
          </CardContent>
        </Card>
      ),
    );

  const renderCardSummaryView = () => (
    <div className='space-y-6 md:space-y-2'>
      <div className='grid md:hidden grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {renderSummaryCard(true)}
      </div>
      <div className='hidden md:grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {renderSummaryCard(false)}
      </div>
      <div className='md:hidden'>{renderCategoryBreakdown()}</div>
    </div>
  );

  // ── Tab counts ─────────────────────────────────────────────────────────────

  const tabCounts = {
    all: products.length,
    active: products.filter((p: IProduct) => p.active).length,
    inactive: products.filter((p: IProduct) => !p.active).length,
    instock: products.filter((p: IProduct) => p.quantity > 0).length,
    outofstock: products.filter((p: IProduct) => p.quantity <= 0).length,
  };

  // ── Pagination ─────────────────────────────────────────────────────────────

  const PaginationSelect = ({ className }: { className?: string }) => (
    <Select value={`${limit}`} onValueChange={(v) => setLimit(parseInt(v, 10))}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Items per page</SelectLabel>
          {["10", "20", "50", "100", "150", "200"].map((v) => (
            <SelectItem key={v} value={v}>
              {v}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );

  // ── Mobile view ────────────────────────────────────────────────────────────

  const renderMobileView = () => {
    const tabFiltered =
      TAB_CONFIG.find((t) => t.value === selectedTab)?.filter ?? (() => true);
    const displayProducts = products.filter(tabFiltered);

    return (
      <div className='min-h-screen bg-gray-50 sm:hidden'>
        <MobileProductHeader
          totalProducts={totalProducts}
          hasCreatePermission={hasRequiredPermission("product", "create")}
          onCreateProduct={() => navigate("/products/create")}
          selectedTab={selectedTab}
          summary={summary}
          onOpenSummary={
            hasRequiredPermission("product", "summary")
              ? () => setIsMobileSummaryOpen(true)
              : undefined
          }
        />
        <MobileProductSummary
          isOpen={isMobileSummaryOpen}
          onClose={() => setIsMobileSummaryOpen(false)}
          summary={summary}
        />
        <MobileProductFilters
          searchValue={inputValue}
          onSearchChange={setInputValue}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          totalProducts={tabCounts.all}
          activeCount={tabCounts.active}
          inactiveCount={tabCounts.inactive}
          inStockCount={tabCounts.instock}
          outOfStockCount={tabCounts.outofstock}
          onRefresh={getProductSummaryDetails}
        />

        <div className='px-4 py-2'>
          {displayProducts.length === 0 ? (
            inputValue || selectedCategory ? (
              <MobileProductEmpty
                type='no-search-results'
                searchQuery={inputValue}
                onClearFilters={() => {
                  setInputValue("");
                  setSelectedCategory("");
                }}
                onRetry={getProductSummaryDetails}
              />
            ) : (
              <MobileProductEmpty
                type='no-products'
                hasCreatePermission={hasRequiredPermission("product", "create")}
                onCreateProduct={() => navigate("/products/create")}
                onRetry={getProductSummaryDetails}
              />
            )
          ) : (
            <>
              <div className='grid grid-cols-2 gap-2 pb-4'>
                {displayProducts.map((product: IProduct) => (
                  <MobileProductCard
                    key={product.id}
                    id={product.id}
                    sku={product.sku}
                    slug={product.slug}
                    image={product.thumbnail}
                    title={product.name}
                    categoryName={product.categoryName ?? "Not Added"}
                    active={product.active}
                    quantity={product.quantity}
                    unitPrice={product.unitPrice}
                    totalSold={product.totalSold ?? 0}
                    totalReturned={product.totalReturned ?? 0}
                    variations={
                      product?.variantList?.length
                        ? product.variantList
                        : ["No Variant"]
                    }
                    updatedAt={
                      product.timestamps?.updatedAt || new Date().toISOString()
                    }
                    onEdit={handleEditProduct}
                    onDelete={deleteProductData}
                    onViewVariations={() => handleOpenVariationDrawer(product)}
                  />
                ))}
              </div>
              {inputValue === "" && (
                <div className='bg-white rounded-xl border border-gray-200 p-4 mt-4 mb-20 shadow-sm'>
                  <div className='text-center text-sm text-gray-600 mb-4'>
                    Showing{" "}
                    <span className='font-semibold text-gray-900'>
                      {Math.max(1, (currentPageNum - 1) * limit + 1)}-
                      {Math.min(currentPageNum * limit, totalProducts)}
                    </span>{" "}
                    of{" "}
                    <span className='font-semibold text-gray-900'>
                      {totalProducts}
                    </span>{" "}
                    products
                  </div>
                  <div className='flex items-center justify-between gap-4'>
                    <Button
                      disabled={currentPageNum < 2}
                      variant='outline'
                      size='sm'
                      onClick={() => updateCurrentPage(-1)}
                      className='flex items-center gap-2 touch-manipulation'>
                      <ChevronLeft className='h-4 w-4' /> Previous
                    </Button>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium text-gray-700'>
                        Page {currentPageNum} of {totalPages}
                      </span>
                      <PaginationSelect className='w-16 h-8' />
                    </div>
                    <Button
                      disabled={currentPageNum >= totalPages}
                      variant='outline'
                      size='sm'
                      onClick={() => updateCurrentPage(1)}
                      className='flex items-center gap-2 touch-manipulation'>
                      Next <ChevronRight className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // ── Desktop view ───────────────────────────────────────────────────────────

  const renderDesktopView = () => (
    <div className='space-y-4'>
      {/* Header */}
      <Card className='border-0 shadow-lg bg-sidebar p-0'>
        <CardHeader className='p-2 md:p-6'>
          <div className='flex flex-row items-center justify-between'>
            <div>
              <CardTitle className='flex items-center space-x-2 text-lg md:text-2xl text-gray-800'>
                <ShoppingBag className='h-6 w-6 text-sidebar-foreground' />
                <span className='text-sidebar-foreground'>
                  Product Management
                </span>
              </CardTitle>
              <CardDescription className='text-sidebar-foreground mt-1 hidden md:block'>
                Manage your inventory, track performance, and organize your
                products
              </CardDescription>
            </div>

            {hasRequiredPermission("product", "summary") && (
              <Drawer>
                <DrawerTrigger asChild>
                  <Button
                    variant='outline'
                    className='flex items-center justify-center bg-sidebar-foreground space-x-2 text-sidebar w-32'>
                    <FilePieChart className='h-5 w-5 text-sidebar' />
                    <span className='font-medium text-sidebar'>Summary</span>
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className='mx-auto w-full max-w-sm md:max-w-full'>
                    <DrawerHeader>
                      <DrawerTitle className='flex items-center space-x-2'>
                        <Package className='h-5 w-5' />
                        <span>Inventory Summary</span>
                      </DrawerTitle>
                      <DrawerDescription>
                        Overview of your product inventory and performance
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className='px-4 pb-0 max-h-[70vh] overflow-y-auto'>
                      {renderCardSummaryView()}
                    </div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant='outline'>Close</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </div>
                </DrawerContent>
              </Drawer>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue='all' className='space-y-4'>
        <div className='hidden md:flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
          <TabsList className='grid grid-cols-5 w-full lg:w-auto'>
            {TAB_CONFIG.map(({ value, label, shortLabel, icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className='flex items-center space-x-1'>
                {icon}
                <span className='hidden sm:inline-block'>{label}</span>
                <span className='sm:hidden'>{shortLabel}</span>
                <span className='hidden sm:inline-block'>
                  ({tabCounts[value]})
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className='flex items-center space-x-2'>
            <div className='flex items-center space-x-1 border rounded-md p-1'>
              {(["list", "grid"] as const).map((type) => (
                <Button
                  key={type}
                  size='sm'
                  variant={viewType === type ? "default" : "ghost"}
                  onClick={() => setViewType(type)}
                  className='h-7 w-7 p-0'>
                  {type === "list" ? (
                    <List className='h-4 w-4' />
                  ) : (
                    <Grid2X2 className='h-4 w-4' />
                  )}
                </Button>
              ))}
            </div>
            {hasRequiredPermission("product", "create") && (
              <Button
                className='flex items-center space-x-2'
                onClick={() => navigate("/products/create")}>
                <PlusCircle className='h-4 w-4' />
                <span>Create</span>
              </Button>
            )}
          </div>
        </div>

        <Card className='border-0 shadow-none'>
          <CardHeader className='border-0 bg-gray-50/50 space-y-4 p-0'>
            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleContent className='space-y-4'>
                <div className='flex flex-row gap-3 p-2 md:p-2 bg-white'>
                  <div className='flex-1'>
                    <div className='relative'>
                      <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                      <Input
                        type='text'
                        placeholder='Search products by name, SKU, or category...'
                        className='pl-10 h-9'
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className='flex flex-row gap-2'>
                    <CategoryFilterDropdown
                      categories={categories}
                      setSelectedCategory={setSelectedCategory}
                      selectedCategory={selectedCategory}
                    />
                    {(inputValue || selectedCategory) && (
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => {
                          setInputValue("");
                          setSelectedCategory("");
                        }}
                        className='text-red-500 hover:text-gray-700 h-9'>
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardHeader>

          <CardContent className='p-0 md:shadow-none'>
            {/* Mobile tab strip (sm only) */}
            <div className='lg:hidden p-4 border-b'>
              <TabsList className='grid grid-cols-5 w-full'>
                {TAB_CONFIG.map(({ value, shortLabel }) => (
                  <TabsTrigger key={value} value={value} className='text-xs'>
                    {shortLabel}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* All tab contents */}
            {TAB_CONFIG.map((tabConfig) => (
              <TabProductContent
                key={tabConfig.value}
                tabConfig={tabConfig}
                allProducts={products}
                viewType={viewType}
                inputValue={inputValue}
                onEdit={handleEditProduct}
                onDelete={deleteProductData}
                onRefresh={refreshList}
                onViewDetails={handleViewProductDetails}
                renderGridView={renderGridView}
                renderMobileCard={renderMobileProductCard}
                hasCreatePermission={hasRequiredPermission("product", "create")}
                onCreateProduct={() => navigate("/products/create")}
              />
            ))}
          </CardContent>

          {inputValue === "" && (
            <CardFooter className='border-0 pt-0'>
              <div className='flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 w-full'>
                <div className='flex justify-between items-center w-full'>
                  <div className='text-sm text-gray-600'>
                    Showing{" "}
                    <span className='font-semibold text-gray-900'>
                      {Math.max(1, (currentPageNum - 1) * limit + 1)}-
                      {Math.min(currentPageNum * limit, totalProducts)}
                    </span>{" "}
                    of{" "}
                    <span className='font-semibold text-gray-900'>
                      {totalProducts}
                    </span>{" "}
                    products
                  </div>
                  <PaginationSelect className='w-auto md:hidden h-8' />
                </div>
                <div className='flex justify-between items-center space-x-2'>
                  <Button
                    disabled={currentPageNum < 2}
                    variant='outline'
                    size='sm'
                    onClick={() => updateCurrentPage(-1)}>
                    <ChevronLeft className='h-4 w-4' /> Previous
                  </Button>
                  <PaginationSelect className='w-[70px] hidden md:flex h-8 justify-between items-center' />
                  <Button
                    disabled={currentPageNum >= totalPages}
                    variant='outline'
                    size='sm'
                    onClick={() => updateCurrentPage(1)}>
                    Next <ChevronRight className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </CardFooter>
          )}
        </Card>
      </Tabs>
    </div>
  );

  // ── Main render ────────────────────────────────────────────────────────────

  if (productFetching) {
    return (
      <>
        <div className='sm:hidden'>
          <MobileProductEmpty type='loading' />
        </div>
        <div className='hidden sm:block space-y-4'>
          <SkeletonCard title='Loading Product Data...' />
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {[...Array(8)].map((_, i) => (
              <Card key={i} className='animate-pulse'>
                <CardContent className='p-4'>
                  <div className='h-4 bg-gray-200 rounded w-3/4 mb-2' />
                  <div className='h-8 bg-gray-200 rounded w-1/2 mb-2' />
                  <div className='h-3 bg-gray-200 rounded w-full' />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (inputValue !== "" || products?.length > 0) {
    return (
      <>
        {renderMobileView()}
        <div className='hidden sm:block'>{renderDesktopView()}</div>
        <ProductVariationDrawer
          isOpen={isVariationDrawerOpen}
          onClose={handleCloseVariationDrawer}
          product={selectedProductForVariations}
        />
      </>
    );
  }

  return (
    <>
      <div className='sm:hidden'>
        {inputValue || selectedCategory ? (
          <MobileProductEmpty
            type='no-search-results'
            searchQuery={inputValue}
            onClearFilters={() => {
              setInputValue("");
              setSelectedCategory("");
            }}
            onRetry={getProductSummaryDetails}
          />
        ) : (
          <MobileProductEmpty
            type='no-products'
            hasCreatePermission={hasRequiredPermission("product", "create")}
            onCreateProduct={() => navigate("/products/create")}
            onRetry={getProductSummaryDetails}
          />
        )}
      </div>
      <div className='hidden sm:block'>
        {hasRequiredPermission("product", "create") ? (
          <EmptyView
            title='You have no products'
            description='You can start selling as soon as you add a product.'
            buttonText='Add Product'
            handleButtonClick={() => navigate("/products/create")}
          />
        ) : (
          <EmptyView
            title='You have no products'
            description='You can start selling as soon as you add a product.'
          />
        )}
      </div>
    </>
  );
};

export default ProductList;
