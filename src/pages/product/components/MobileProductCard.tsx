import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Package,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  Table2,
  Tag,
  Search,
  ImageOff,
  X,
  Layers,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  cn,
  getVariationImageUrl,
  getAllProductImages,
} from "../../../utils/functions";
import { ImageLightbox } from "../../../components/ImageLightbox";
import useRoleCheck from "../../auth/hooks/useRoleCheck";
import dayjs from "dayjs";
import ShareButton from "../../../common/ShareButton";
import { BRAND_CONFIG } from "../../../config/brand";
import DeleteRequestDialog from "./DeleteRequestDialog";
import type { IMetaEntry, IVariation, IImageGroup } from "../interface";
import {
  ProductMetaDetail,
  hasAnyMeta,
  countMetaEntries,
} from "./ProductMetaDetail";

/* ─── Types ─────────────────────────────────────────────── */

interface Variation {
  name: string;
  image?: string;
  sku?: string;
  stock?: number;
  price?: number;
}

interface MobileProductCardProps {
  id: string;
  sku: string;
  slug: string;
  image?: string;
  title: string;
  categoryName?: string; // @deprecated - Use categoryNames
  categoryNames?: string[];
  active: boolean;
  quantity: number;
  unitPrice: number;
  totalSold: number;
  totalReturned: number;
  variations: string[] | Variation[];
  variationList?: IVariation[];
  meta?: IMetaEntry[];
  imageGroups?: IImageGroup[];
  updatedAt: string;
  onEdit: (id: string) => void;
  onViewVariations?: () => void;
}

/* -------------------------------------------------------------------------- */
/*  BottomSheet                                                               */
/* -------------------------------------------------------------------------- */

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  subtitle?: React.ReactNode;
  leading?: React.ReactNode;
  headerExtra?: React.ReactNode;
  bodyClassName?: string;
  escapeDisabled?: boolean;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  eyebrow,
  title,
  subtitle,
  leading,
  headerExtra,
  bodyClassName,
  escapeDisabled,
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !escapeDisabled) onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose, escapeDisabled]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 z-[100] bg-slate-900/45 backdrop-blur-sm animate-in fade-in duration-200'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Sheet */}
      <div
        role='dialog'
        aria-modal='true'
        aria-label={`${eyebrow}: ${title}`}
        className='fixed inset-x-0 bottom-0 z-[110] flex max-h-[90dvh] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-12px_40px_-8px_rgba(15,23,42,0.25)] animate-in slide-in-from-bottom duration-300 ease-out'>
        {/* Grab handle */}
        <div className='flex shrink-0 justify-center pb-1 pt-3'>
          <div className='h-1.5 w-11 rounded-full bg-slate-200' />
        </div>

        {/* Header */}
        <div className='shrink-0 px-5 pb-4 pt-2'>
          <div className='flex items-start gap-3'>
            {leading}

            <div className='min-w-0 flex-1 pt-0.5'>
              <span className='inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-700 ring-1 ring-inset ring-amber-200/70'>
                {eyebrow}
              </span>

              <h3 className='mt-1.5 line-clamp-2 text-[18px] font-semibold leading-snug tracking-tight text-[#141413]'>
                {title}
              </h3>

              {subtitle && (
                <p className='mt-1 text-[12.5px] font-medium text-slate-500'>
                  {subtitle}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              aria-label='Close'
              className='-mr-1 -mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition active:scale-90 active:bg-slate-200'>
              <X className='h-[18px] w-[18px]' strokeWidth={2.25} />
            </button>
          </div>

          {headerExtra && <div className='mt-3'>{headerExtra}</div>}
        </div>

        {/* Body — warm tint so white cards pop */}
        <div
          className={cn(
            "flex-1 overflow-y-auto overscroll-contain border-t border-slate-200/70 bg-white",
            bodyClassName,
          )}>
          {children}
        </div>

        {/* Footer — respects iOS home indicator */}
        <div className='relative shrink-0 border-t border-slate-200/70 bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3'>
          <button
            onClick={onClose}
            className='h-12 w-full rounded-2xl bg-[#141413] text-[15px] font-semibold text-white shadow-lg shadow-slate-900/15 transition active:scale-[0.98] active:bg-black'>
            Done
          </button>
        </div>
      </div>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*  MetaSheet                                                                 */
/* -------------------------------------------------------------------------- */

export interface MetaSheetProps {
  open: boolean;
  onClose: () => void;
  meta?: IMetaEntry[];
  variationList?: IVariation[];
  productTitle: string;
}

export const MetaSheet: React.FC<MetaSheetProps> = ({
  open,
  onClose,
  meta,
  variationList,
  productTitle,
}) => {
  const metaCount = countMetaEntries({ meta, variation: variationList });

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      eyebrow='Meta data'
      title={productTitle}
      subtitle={`${metaCount} meta ${metaCount === 1 ? "entry" : "entries"}`}
      bodyClassName='px-4 py-4'>
      <ProductMetaDetail
        meta={meta}
        variationList={variationList}
        className='p-0'
      />
    </BottomSheet>
  );
};

const LOW_STOCK_THRESHOLD = 5;

type StockState = "in" | "low" | "out";

const getStockState = (q: number): StockState =>
  q <= 0 ? "out" : q <= LOW_STOCK_THRESHOLD ? "low" : "in";

const STOCK_UI: Record<
  StockState,
  { label: string; pill: string; dot: string; text: string }
> = {
  in: {
    label: "In stock",
    pill: "text-green-200",
    dot: "bg-emerald-500",
    text: "text-emerald-600",
  },
  low: {
    label: "Low stock",
    pill: "text-amber-700",
    dot: "bg-amber-500",
    text: "text-amber-600",
  },
  out: {
    label: "Sold out",
    pill: "text-rose-700",
    dot: "bg-rose-500",
    text: "text-rose-600",
  },
};

const normalizeVariations = (v: string[] | Variation[]): Variation[] => {
  if (!v || v.length === 0) return [];
  return v.map((x) => (typeof x === "string" ? { name: x } : x));
};

const isNoVariant = (v: Variation[]) =>
  v.length === 0 || (v.length === 1 && v[0].name === "No Variant");

const formatNumber = (num: number): string =>
  Number.isInteger(num)
    ? num.toLocaleString()
    : num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

/* ─── Variant Drawer ─────────────────────────────────────── */

type VariantFilter = "all" | "in" | "out";

interface VariantDrawerProps {
  open: boolean;
  onClose: () => void;
  variants: string[] | Variation[];
  productTitle: string;
  productImage?: string;
  imageGroups?: IImageGroup[];
  fullVariations?: IVariation[];
}

const VariantDrawer: React.FC<VariantDrawerProps> = ({
  open,
  onClose,
  variants,
  productTitle,
  productImage,
  imageGroups,
  fullVariations,
}) => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<VariantFilter>("all");
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Reset transient UI each time the drawer closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setFilter("all");
    }
  }, [open]);

  const enriched: Variation[] = useMemo(
    () =>
      fullVariations && fullVariations.length > 0
        ? fullVariations.map((fv) => ({
            name:
              fv.name ||
              fv.title ||
              [fv.color, fv.size].filter(Boolean).join(" · ") ||
              fv.sku,
            image: getVariationImageUrl(fv, imageGroups) || undefined,
            sku: fv.sku,
            stock: fv.quantity,
            price: fv.unitPrice,
          }))
        : normalizeVariations(variants),
    [fullVariations, variants, imageGroups],
  );

  const hasVars = !isNoVariant(enriched);
  const withImages = enriched.filter((v) => v.image);
  const inStockCount = enriched.filter((v) => (v.stock ?? 0) > 0).length;
  const showControls = hasVars && enriched.length > 4;
  const canFilterStock = enriched.some((v) => v.stock !== undefined);

  const filtered = useMemo(() => {
    if (!hasVars) return [];
    const q = query.trim().toLowerCase();
    return enriched.filter((v) => {
      if (q && !`${v.name} ${v.sku ?? ""}`.toLowerCase().includes(q))
        return false;
      if (filter === "in") return (v.stock ?? 0) > 0;
      if (filter === "out") return (v.stock ?? 0) <= 0;
      return true;
    });
  }, [enriched, hasVars, query, filter]);

  const openLightbox = (variant: Variation) => {
    const imgs = withImages.map((v) => v.image!);
    const idx = imgs.indexOf(variant.image!);
    setLightboxImages(imgs);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };

  const filters: { key: VariantFilter; label: string }[] = [
    { key: "all", label: `All ${enriched.length}` },
    { key: "in", label: `In stock ${inStockCount}` },
    { key: "out", label: `Out ${enriched.length - inStockCount}` },
  ];

  return (
    <>
      <BottomSheet
        open={open}
        onClose={onClose}
        eyebrow='Variants'
        title={productTitle}
        escapeDisabled={lightboxImages.length > 0}
        subtitle={
          hasVars ? (
            <>
              {enriched.length} variant{enriched.length !== 1 && "s"}
              {withImages.length > 0 && (
                <span className='ml-1.5 text-emerald-600'>
                  · {withImages.length} with photos
                </span>
              )}
            </>
          ) : (
            "No variants"
          )
        }
        leading={
          <div className='h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50'>
            {productImage ? (
              <img
                src={productImage}
                alt=''
                className='h-full w-full object-cover'
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center'>
                <Package className='h-4 w-4 text-slate-400' />
              </div>
            )}
          </div>
        }
        headerExtra={
          showControls && (
            <div className='mt-3 space-y-2'>
              <div className='relative'>
                <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                <input
                  type='search'
                  inputMode='search'
                  placeholder='Search name or SKU'
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  // 16px font prevents iOS zoom-on-focus
                  className='h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-base text-[#141413] outline-none transition-colors placeholder:text-slate-400 focus:border-[#141413]'
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    aria-label='Clear search'
                    className='absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-slate-400'>
                    <X className='h-4 w-4' />
                  </button>
                )}
              </div>

              {canFilterStock && (
                <div className='-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                  {filters.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      aria-pressed={filter === f.key}
                      className={cn(
                        "h-8 shrink-0 rounded-full border px-3 text-[12px] font-medium transition-colors",
                        filter === f.key
                          ? "border-[#141413] bg-[#141413] text-white"
                          : "border-slate-200 bg-white text-slate-600",
                      )}>
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        }
        bodyClassName='p-3'>
        {!hasVars ? (
          <div className='flex flex-col items-center justify-center gap-3 py-14'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100'>
              <Layers className='h-5 w-5 text-slate-400' />
            </div>
            <div className='text-center'>
              <p className='text-[14px] font-medium text-[#141413]'>
                No variants for this product
              </p>
              <p className='mt-0.5 text-[12px] text-slate-400'>
                Add variants to offer different options
              </p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-2 py-12'>
            <Search className='h-5 w-5 text-slate-300' />
            <p className='text-[13px] text-slate-500'>No variants found</p>
            {(query || filter !== "all") && (
              <button
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
                className='mt-1 h-9 rounded-full border border-slate-200 px-4 text-[12px] font-medium text-[#141413]'>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-2.5'>
            {filtered.map((variant, index) => {
              const state =
                variant.stock !== undefined
                  ? getStockState(variant.stock)
                  : undefined;
              return (
                <div
                  key={`${variant.sku ?? variant.name}-${index}`}
                  className='flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white'>
                  {variant.image ? (
                    // Tap target works on touch (no hover dependency)
                    <button
                      onClick={() => openLightbox(variant)}
                      aria-label={`View ${variant.name} photo`}
                      className='relative aspect-square w-full overflow-hidden bg-slate-50'>
                      <img
                        src={variant.image}
                        alt={variant.name}
                        loading='lazy'
                        className={cn(
                          "h-full w-full object-cover",
                          state === "out" && "opacity-60 grayscale",
                        )}
                      />
                      <span className='absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm'>
                        <Maximize2 className='h-3 w-3' />
                      </span>
                    </button>
                  ) : (
                    <div className='flex aspect-square flex-col items-center justify-center gap-1 bg-slate-50'>
                      <ImageOff className='h-5 w-5 text-slate-300' />
                      <span className='text-[9px] font-semibold uppercase tracking-wider text-slate-400'>
                        No image
                      </span>
                    </div>
                  )}

                  <div className='flex flex-1 flex-col gap-1 border-t border-slate-100 p-2.5'>
                    <p className='line-clamp-2 text-[12px] font-semibold leading-tight text-[#141413]'>
                      {variant.name}
                    </p>
                    {variant.sku && (
                      <span className='truncate font-mono text-[10px] text-slate-400'>
                        {variant.sku}
                      </span>
                    )}
                    {(state || variant.price !== undefined) && (
                      <div className='mt-auto flex items-center justify-between gap-1 pt-1'>
                        {variant.price !== undefined ? (
                          <span className='text-[13px] font-semibold text-[#141413]'>
                            ৳{formatNumber(variant.price)}
                          </span>
                        ) : (
                          <span />
                        )}
                        {state && (
                          <span
                            className={cn(
                              "flex items-center gap-1 text-[10px] font-semibold",
                              STOCK_UI[state].text,
                            )}>
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                STOCK_UI[state].dot,
                              )}
                            />
                            {state === "out" ? "Out" : variant.stock}
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
      </BottomSheet>

      {lightboxImages.length > 0 && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          open={lightboxImages.length > 0}
          onClose={() => setLightboxImages([])}
          alt='Variation image'
        />
      )}
    </>
  );
};

/* ─── Card ───────────────────────────────────────────────── */

const MobileProductCard: React.FC<MobileProductCardProps> = ({
  id,
  sku,
  slug,
  image,
  title,
  categoryName,
  categoryNames,
  quantity,
  unitPrice,
  totalSold,
  totalReturned,
  variations,
  variationList,
  meta,
  imageGroups,
  updatedAt,
  onEdit,
  onViewVariations,
}) => {
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [metaSheetOpen, setMetaSheetOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [thumbLightboxImages, setThumbLightboxImages] = useState<string[]>([]);
  const dialogBtn = useRef<HTMLButtonElement>(null);

  const handleVariantClick = () => {
    if (onViewVariations) onViewVariations();
    else setDrawerOpen(true);
  };

  const handleThumbnailClick = () => {
    const images = getAllProductImages({
      thumbnail: image,
      variation: variationList,
      imageGroups,
    });
    if (images.length > 0) setThumbLightboxImages(images);
  };

  const normalized = normalizeVariations(variations);
  const hasVars = !isNoVariant(normalized);
  const variantCount = hasVars ? normalized.length : 0;

  const hasMeta = hasAnyMeta({ meta, variation: variationList });
  const metaCount = hasMeta
    ? countMetaEntries({ meta, variation: variationList })
    : 0;

  const stockState = getStockState(quantity);
  const stockUi = STOCK_UI[stockState];
  const isOut = stockState === "out";

  const cats =
    categoryNames && categoryNames.length > 0
      ? categoryNames
      : [categoryName || "Uncategorized"];
  const extraCats = cats.length - 1;

  const canManage = hasSomePermissionsForPage("product", ["edit", "delete"]);
  const showImage = !!image && !imgFailed;

  return (
    <>
      <article className='flex flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_1px_2px_rgba(20,20,19,0.04)]'>
        {/* ── Media ── */}
        <div className='relative aspect-square w-full overflow-hidden bg-slate-100 '>
          {showImage ? (
            <button
              type='button'
              onClick={handleThumbnailClick}
              aria-label={`View photos of ${title}`}
              className='block h-full w-full'>
              <img
                src={image}
                alt={title}
                loading='lazy'
                onError={() => setImgFailed(true)}
                className={cn(
                  "h-full w-full object-cover transition ",
                  isOut && "opacity-70 grayscale",
                )}
              />
            </button>
          ) : (
            <div className='flex h-full w-full flex-col items-center justify-center gap-1.5 text-slate-300'>
              <ImageOff className='h-8 w-8' />
              <span className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
                No image
              </span>
            </div>
          )}

          {/* Soft top gradient so badges stay legible on any photo */}
          <div className='pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/25 to-transparent' />

          {/* Meta chip — bottom left */}
          {hasMeta && (
            <button
              type='button'
              onClick={() => setMetaSheetOpen(true)}
              aria-label={`View ${metaCount} meta entries`}
              className='absolute left-2 top-2 inline-flex px-3 bg-black/50 h-8 items-center gap-1 rounded-full z-20 backdrop-blur-sm  text-[12px] font-semibold text-white  transition active:scale-95'>
              <Table2 className='h-4 w-4' />
              {metaCount}
            </button>
          )}

          {/* Actions — top right, 36px touch target */}
          {canManage && (
            <div className='absolute right-1.5 top-1.5'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    aria-label='Product actions'
                    className='h-9 w-5 rounded-sm bg-transparent border border-white p-0 text-white shadow-sm backdrop-blur-sm hover:bg-white'>
                    <MoreVertical className='h-5 w-4 text-lg ' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-44'>
                  <DropdownMenuItem
                    onClick={handleVariantClick}
                    className='h-10'>
                    <Eye className='mr-2 h-4 w-4' />
                    View variants
                  </DropdownMenuItem>

                  {hasMeta && (
                    <DropdownMenuItem
                      onClick={() => setMetaSheetOpen(true)}
                      className='h-10'>
                      <Table2 className='mr-2 h-4 w-4' />
                      View meta data
                    </DropdownMenuItem>
                  )}

                  {hasRequiredPermission("product", "edit") && (
                    <DropdownMenuItem
                      onClick={() => onEdit(id)}
                      className='h-10'>
                      <Edit className='mr-2 h-4 w-4' />
                      Edit product
                    </DropdownMenuItem>
                  )}

                  {hasRequiredPermission("product", "delete") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => dialogBtn.current?.click()}
                        className='h-10 text-red-600 focus:text-red-600'>
                        <Trash2 className='mr-2 h-4 w-4' />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Stock status — top left */}
          <span
            className={cn(
              "absolute left-2 bottom-2 inline-flex h-6 items-center gap-1.5 rounded-full bg-transparent px-2 text-[10px]  font-semibold shadow-sm z-20",
              stockUi.pill,
            )}>
            <div className='p-1 bg-white rounded-full items-start justify-center flex'>
              <span
                className={cn("h-1.5 w-1.5 rounded-full z-20", stockUi.dot)}
              />
            </div>
            {stockUi.label}
          </span>

          {/* Price */}
          <p className='absolute bottom-3 right-2 inline-flex text-[18px] font-bold leading-none tracking-tight text-white z-20'>
            <span className='mr-0.5 text-[13px] font-semibold text-orange-500'>
              ৳
            </span>
            {formatNumber(unitPrice)}
          </p>
          <div className='absolute bottom-0 h-16 w-full bg-gradient-to-t from-black/80 to-transparent' />
        </div>

        {/* ── Content ── */}
        <div className='flex flex-1 flex-col gap-2 p-2.5'>
          {/* Title + SKU */}
          <div className='min-h-auto'>
            <h3 className='uppercase line-clamp-2 text-[13px] font-mono font-semibold leading-snug text-[#141413]'>
              {title}
            </h3>
          </div>

          {/* Stats — one quiet strip instead of four cramped tiles */}
          <dl className='grid grid-cols-3 divide-x divide-slate-200 rounded-lg bg-white py-1.5 ring-1 ring-slate-100'>
            <div className='flex flex-col items-center gap-0.5'>
              <dd
                className={cn(
                  "text-[13px] font-semibold leading-none",
                  stockState === "in" ? "text-[#141413]" : stockUi.text,
                )}>
                {quantity}
              </dd>
              <dt className='text-[9px] font-semibold uppercase tracking-wider text-slate-400'>
                Stock
              </dt>
            </div>
            <div className='flex flex-col items-center gap-0.5'>
              <dd className='text-[13px] font-semibold leading-none text-[#141413]'>
                {totalSold}
              </dd>
              <dt className='text-[9px] font-semibold uppercase tracking-wider text-slate-400'>
                Sold
              </dt>
            </div>
            <div className='flex flex-col items-center gap-0.5'>
              <dd
                className={cn(
                  "text-[13px] font-semibold leading-none",
                  totalReturned > 0 ? "text-rose-600" : "text-[#141413]",
                )}>
                {totalReturned}
              </dd>
              <dt className='text-[9px] font-semibold uppercase tracking-wider text-slate-400'>
                Return
              </dt>
            </div>
          </dl>

          {/* Variants — full-width, obvious tap target (44px) */}
          {hasVars ? (
            <button
              type='button'
              onClick={handleVariantClick}
              className='mt-auto flex h-7 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-2.5 text-[#141413] transition active:scale-[0.98] active:bg-slate-50'>
              <span className='flex items-center gap-1.5 text-[12px] font-semibold'>
                <Layers className='h-3.5 w-3.5 text-violet-600' />
                {variantCount} variant{variantCount !== 1 && "s"}
              </span>
              <ChevronRight className='h-4 w-4 text-slate-400' />
            </button>
          ) : (
            <div className='mt-auto flex h-11 w-full items-center rounded-lg border border-dashed border-slate-200 px-2.5 text-[11px] text-slate-400'>
              <Package className='mr-1.5 h-3.5 w-3.5' />
              Single option
            </div>
          )}

          {/* Footer */}
          <div className='flex items-center justify-between border-t border-slate-100 pt-1.5'>
            {/* Category (single line, +N overflow) */}
            <div className='flex items-center gap-1 text-slate-500'>
              <Tag className='h-3 w-3 shrink-0 text-slate-400' />
              <span className='truncate text-[10px] font-medium uppercase tracking-wide'>
                {cats[0]}
              </span>
              {extraCats > 0 && (
                <span className='shrink-0 rounded bg-slate-100 px-1 text-[10px] font-semibold text-slate-500'>
                  +{extraCats}
                </span>
              )}
            </div>
            <ShareButton
              sm={true}
              linkToShare={`${BRAND_CONFIG.website}/collections/${slug}`}
              title={`Check out this awesome product: ${title}`}
              text={`This ${categoryNames?.[0] || categoryName || "product"} has only ${quantity} item left. Don't miss out!`}
            />
          </div>
        </div>
      </article>

      <VariantDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        variants={variations}
        productTitle={title}
        productImage={image}
        imageGroups={imageGroups}
        fullVariations={variationList}
      />

      <MetaSheet
        open={metaSheetOpen}
        onClose={() => setMetaSheetOpen(false)}
        meta={meta}
        variationList={variationList}
        productTitle={title}
      />

      <DeleteRequestDialog productId={id} productName={title}>
        <button ref={dialogBtn} className='hidden' aria-hidden='true'>
          Trigger Delete Dialog
        </button>
      </DeleteRequestDialog>

      {thumbLightboxImages.length > 0 && (
        <ImageLightbox
          images={thumbLightboxImages}
          initialIndex={0}
          open={thumbLightboxImages.length > 0}
          onClose={() => setThumbLightboxImages([])}
          alt={title}
        />
      )}
    </>
  );
};

export default MobileProductCard;
