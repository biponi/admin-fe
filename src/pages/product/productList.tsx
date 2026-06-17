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
  SlidersHorizontal,
  RefreshCw,
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
    emptyIcon: <Package className='h-10 w-10 text-zinc-300' />,
    emptyTitle: "No products found",
    emptyDescription: "Get started by adding your first product",
    filter: () => true,
  },
  {
    value: "active",
    label: "Active",
    shortLabel: "Active",
    icon: <CheckCircle className='h-3.5 w-3.5' />,
    emptyIcon: <CheckCircle className='h-10 w-10 text-zinc-300' />,
    emptyTitle: "No active products",
    emptyDescription: "All your products are currently inactive",
    filter: (p) => p.active,
  },
  {
    value: "inactive",
    label: "Inactive",
    shortLabel: "Inactive",
    icon: <AlertCircle className='h-3.5 w-3.5' />,
    emptyIcon: <AlertCircle className='h-10 w-10 text-zinc-300' />,
    emptyTitle: "No inactive products",
    emptyDescription: "All your products are currently active",
    filter: (p) => !p.active,
  },
  {
    value: "instock",
    label: "In Stock",
    shortLabel: "In Stock",
    icon: <TrendingUp className='h-3.5 w-3.5' />,
    emptyIcon: <TrendingUp className='h-10 w-10 text-zinc-300' />,
    emptyTitle: "No products in stock",
    emptyDescription: "Time to restock your inventory",
    filter: (p) => p.quantity > 0,
  },
  {
    value: "outofstock",
    label: "Out of Stock",
    shortLabel: "Out",
    icon: <TrendingDown className='h-3.5 w-3.5' />,
    emptyIcon: <TrendingDown className='h-10 w-10 text-emerald-400' />,
    emptyTitle: "All products are stocked",
    emptyDescription: "Your inventory is in great shape",
    filter: (p) => p.quantity <= 0,
  },
];

// ─── Variant Display Types & Helpers ─────────────────────────────────────────

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
    let imageUrl: string | undefined;
    if (v.images && v.images.length > 0) {
      const img = v.images[0];
      if (typeof img === "string") imageUrl = img;
      else if (img instanceof File) imageUrl = URL.createObjectURL(img);
    }
    if (!imageUrl && v.imageGroupId && product.imageGroups) {
      const imageGroup = product.imageGroups.find(
        (g) => g.id === v.imageGroupId,
      );
      if (imageGroup?.images?.length > 0) {
        const gi = imageGroup.images[0];
        if (typeof gi === "string") imageUrl = gi;
        else if (gi instanceof File) imageUrl = URL.createObjectURL(gi);
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

// ─── Variant Lightbox ────────────────────────────────────────────────────────

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
      className='fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm'
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
              className='absolute left-3 top-[45%] -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors'>
              <ChevronLeft className='w-5 h-5' />
            </button>
            <button
              onClick={next}
              className='absolute right-3 top-[45%] -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors'>
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
                className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === idx ? "border-indigo-400 scale-105" : "border-transparent opacity-50 hover:opacity-100"}`}>
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

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!product || !isOpen) return null;

  return (
    <>
      <div
        className='fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]'
        onClick={onClose}
      />
      <div className='fixed bottom-0 left-0 right-0 z-[110] max-h-[90dvh] flex flex-col rounded-t-3xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300'>
        <div className='flex justify-center pt-3 pb-1 shrink-0'>
          <div className='w-10 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700' />
        </div>
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
              className='w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shrink-0'>
              <X className='w-4 h-4' />
            </button>
          </div>
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
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600'>
                  <X className='w-3.5 h-3.5' />
                </button>
              )}
            </div>
          )}
        </div>
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
                          className='absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-colors'>
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
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${variant.stock > 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
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
        <div className='px-5 py-4 border-t border-zinc-100 dark:border-zinc-800 shrink-0'>
          <button
            onClick={onClose}
            className='w-full py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-[0.98] transition-all'>
            Done
          </button>
        </div>
      </div>
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

// ─── Table headers ───────────────────────────────────────────────────────────

const STYLED_TABLE_HEADERS = [
  "Product",
  "Category",
  "Price",
  "Variant",
  "Stock",
  "Sold | Returned",
  "Last Updated",
] as const;

// ─── DesktopProductTable ──────────────────────────────────────────────────────

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
    imageGroups: product?.imageGroups,
    handleUpdateProduct: onEdit,
    deleteExistingProduct: onDelete,
    updatedAt: product?.timestamps?.updatedAt,
    refreshProductList: onRefresh,
    handleViewProductDetails: onViewDetails,
    variationDisplayMode: viewType === "grid" ? "grid" : "list",
  });

  return (
    <Table divClass='relative' className=''>
      <TableHeader className='sticky top-0 z-10'>
        <TableRow className='bg-zinc-50 border-b border-zinc-200 hover:bg-zinc-50'>
          <TableHead className='w-12 bg-zinc-50 text-zinc-400 py-2.5'>
            <Image className='h-3.5 w-3.5' />
          </TableHead>
          {STYLED_TABLE_HEADERS.map((h) => (
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
        {products.map((product) => (
          <SingleItem {...sharedItemProps(product)} />
        ))}
      </TableBody>
    </Table>
  );
};

// ─── TabProductContent ────────────────────────────────────────────────────────

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
    <TabsContent
      value={tabConfig.value}
      className='m-0 focus-visible:outline-none'>
      {filtered.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-16 text-center px-4'>
          <div className='w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4'>
            {tabConfig.emptyIcon}
          </div>
          <h3 className='text-base font-semibold text-zinc-800 mb-1'>
            {tabConfig.emptyTitle}
          </h3>
          <p className='text-sm text-zinc-500 mb-5 max-w-xs'>
            {tabConfig.value === "all" && inputValue
              ? `No products match "${inputValue}"`
              : tabConfig.emptyDescription}
          </p>
          {tabConfig.value === "all" && hasCreatePermission && !inputValue && (
            <Button
              onClick={onCreateProduct}
              size='sm'
              className='bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-9 px-4 text-sm'>
              <PlusCircle className='h-4 w-4 mr-1.5' /> Add Product
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile */}
          <div className='md:hidden p-3'>
            <div className='grid grid-cols-2 gap-2.5 sm:grid-cols-3'>
              {filtered.map(renderMobileCard)}
            </div>
          </div>
          {/* Desktop */}
          <div className='hidden md:block'>
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
        </>
      )}
    </TabsContent>
  );
};

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  accent,
}) => (
  <div
    className={`relative overflow-hidden rounded-xl border bg-white p-4 ${accent}`}>
    <div className='flex items-start justify-between gap-2'>
      <div className='min-w-0'>
        <p className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1'>
          {title}
        </p>
        <p className='text-2xl font-bold text-zinc-900 leading-tight'>
          {value}
        </p>
        <p className='text-xs text-zinc-400 mt-1 truncate'>{description}</p>
      </div>
      <div className='shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-100'>
        {icon}
      </div>
    </div>
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

  // ── Summary stats ──────────────────────────────────────────────────────────

  const statCards = [
    {
      title: "Active Products",
      value: summary ? formatNumber(summary.totalActiveProductType) : "—",
      description: "Available for sale",
      icon: <Package className='h-4.5 w-4.5 text-blue-500' />,
      accent: "border-blue-100",
      key: "totalActiveProducts",
      total: summary?.totalActiveProductType,
    },
    {
      title: "Total Stock",
      value: summary ? formatNumber(summary.totalActiveProducts) : "—",
      description: "Units across all products",
      icon: <Archive className='h-4.5 w-4.5 text-emerald-500' />,
      accent: "border-emerald-100",
      key: "totalStock",
      total: summary?.totalActiveProducts,
    },
    {
      title: "Variations",
      value: summary ? formatNumber(summary.totalActiveProductVariations) : "—",
      description: "Distinct variants available",
      icon: <Activity className='h-4.5 w-4.5 text-violet-500' />,
      accent: "border-violet-100",
      key: "totalVariants",
      total: summary?.totalActiveProductVariations,
    },
    {
      title: "Inventory Value",
      value: summary
        ? `৳${formatNumber(summary.totalActiveProductPrice)}`
        : "—",
      description: "Total stock valuation",
      icon: <TrendingUp className='h-4.5 w-4.5 text-amber-500' />,
      accent: "border-amber-100",
      key: "totalPrice",
      total: summary?.totalActiveProductPrice,
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
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4'>
      {products.map(renderMobileProductCard)}
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
            <BarChartHorizontalBig className='h-3.5 w-3.5' />
            By Category
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
                    onViewVariations={() => handleOpenVariationDrawer(product)}
                  />
                ))}
              </div>
              {inputValue === "" && (
                <div className='bg-white rounded-xl border border-gray-200 p-4 mt-4 mb-20 shadow-sm'>
                  <div className='text-center text-sm text-gray-600 mb-4'>
                    Showing{" "}
                    <span className='font-semibold text-gray-900'>
                      {Math.max(1, (currentPageNum - 1) * limit + 1)}–
                      {Math.min(currentPageNum * limit, totalProducts)}
                    </span>{" "}
                    of{" "}
                    <span className='font-semibold text-gray-900'>
                      {totalProducts}
                    </span>
                  </div>
                  <div className='flex items-center justify-between gap-4'>
                    <Button
                      disabled={currentPageNum < 2}
                      variant='outline'
                      size='sm'
                      onClick={() => updateCurrentPage(-1)}
                      className='flex items-center gap-2 touch-manipulation'>
                      <ChevronLeft className='h-4 w-4' /> Prev
                    </Button>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium text-gray-700'>
                        {currentPageNum} / {totalPages}
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
    <div className='space-y-3'>
      {/* ── Page Header ── */}
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
          {/* Summary drawer trigger */}
          {hasRequiredPermission("product", "summary") &&
            renderCategoryBreakdown()}

          {hasRequiredPermission("product", "create") && (
            <Button
              size='sm'
              onClick={() => navigate("/products/create")}
              className='h-8 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3'>
              <PlusCircle className='h-3.5 w-3.5' />
              New Product
            </Button>
          )}
        </div>
      </div>

      {/* ── Stats row (inline, compact) ── */}
      {hasRequiredPermission("product", "summary") && (
        <div className='grid grid-cols-4 gap-3'>
          {statCards.map((card, i) => (
            <StatCard {...card} />
          ))}
        </div>
      )}

      {/* ── Main content panel ── */}
      <div className='rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm'>
        {/* Command bar: search + filters + tabs */}
        <div className='border-b border-zinc-100 bg-zinc-50/50'>
          {/* Top row: search + actions */}
          <div className='flex items-center gap-2 px-4 py-2.5'>
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
                {(["list", "grid"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setViewType(type)}
                    className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${viewType === type ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-600"}`}>
                    {type === "list" ? (
                      <List className='h-3.5 w-3.5' />
                    ) : (
                      <Grid2X2 className='h-3.5 w-3.5' />
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

          {/* Tabs row */}
          <Tabs defaultValue='all' className='w-full'>
            <div className='px-4 border-t border-zinc-100'>
              <TabsList className='h-auto bg-transparent p-0 gap-0 rounded-none'>
                {TAB_CONFIG.map(({ value, label, icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className='relative h-9 px-3 rounded-none bg-transparent text-zinc-500 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors gap-1.5'>
                    {icon}
                    <span>{label}</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${value === "all" ? "bg-zinc-200 text-zinc-600" : value === "active" ? "bg-emerald-100 text-emerald-700" : value === "inactive" ? "bg-zinc-200 text-zinc-600" : value === "instock" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-600"}`}>
                      {tabCounts[value]}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab contents */}
            <div className='max-h-[560px] overflow-y-auto'>
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
                  hasCreatePermission={hasRequiredPermission(
                    "product",
                    "create",
                  )}
                  onCreateProduct={() => navigate("/products/create")}
                />
              ))}
            </div>

            {/* Pagination */}
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
                      disabled={currentPageNum < 2}
                      variant='outline'
                      size='sm'
                      onClick={() => updateCurrentPage(-1)}
                      className='h-7 w-7 p-0 rounded-md'>
                      <ChevronLeft className='h-3.5 w-3.5' />
                    </Button>
                    <span className='text-xs text-zinc-600 font-medium px-2 min-w-[60px] text-center'>
                      {currentPageNum} / {totalPages}
                    </span>
                    <Button
                      disabled={currentPageNum >= totalPages}
                      variant='outline'
                      size='sm'
                      onClick={() => updateCurrentPage(1)}
                      className='h-7 w-7 p-0 rounded-md'>
                      <ChevronRight className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );

  // ── Loading state ──────────────────────────────────────────────────────────

  if (productFetching) {
    return (
      <>
        <div className='sm:hidden'>
          <MobileProductEmpty type='loading' />
        </div>
        <div className='hidden sm:block space-y-3'>
          {/* Header skeleton */}
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
          {/* Stats skeleton */}
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
          {/* Table skeleton */}
          <div className='rounded-xl border border-zinc-200 bg-white overflow-hidden'>
            <div className='p-3 border-b border-zinc-100 bg-zinc-50/50'>
              <div className='h-8 w-64 bg-zinc-200 rounded-lg animate-pulse' />
            </div>
            <div className='divide-y divide-zinc-100'>
              {[...Array(6)].map((_, i) => (
                <div key={i} className='flex items-center gap-4 px-4 py-3'>
                  <div className='w-10 h-10 rounded-lg bg-zinc-100 animate-pulse shrink-0' />
                  <div className='flex-1 space-y-1.5'>
                    <div className='h-3.5 w-40 bg-zinc-200 rounded animate-pulse' />
                    <div className='h-3 w-24 bg-zinc-100 rounded animate-pulse' />
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

  // ── Empty state (no products at all) ──────────────────────────────────────

  if (inputValue === "" && products?.length === 0) {
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

  // ── Main render ────────────────────────────────────────────────────────────

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
};

export default ProductList;
