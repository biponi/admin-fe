import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  ShoppingCart,
  Tag,
  Calendar,
  Search,
  ImageOff,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  X,
  BoxIcon,
  RotateCcw,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { cn } from "../../../utils/functions";
import useRoleCheck from "../../auth/hooks/useRoleCheck";
import dayjs from "dayjs";
import ShareButton from "../../../common/ShareButton";
import { BRAND_CONFIG } from "../../../config/brand";

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
  categoryNames?: string[]; // Multiple category names
  active: boolean;
  quantity: number;
  unitPrice: number;
  totalSold: number;
  totalReturned: number;
  variations: string[] | Variation[];
  updatedAt: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewVariations?: () => void;
}

/* ─── Helpers ────────────────────────────────────────────── */

const normalizeVariations = (v: string[] | Variation[]): Variation[] => {
  if (!v || v.length === 0) return [];
  return v.map((x) => (typeof x === "string" ? { name: x } : x));
};

const isNoVariant = (v: Variation[]) =>
  v.length === 1 && v[0].name === "No Variant";

/* ─── Variant Image Lightbox ─────────────────────────────── */

interface LightboxProps {
  variants: Variation[];
  startIndex: number;
  onClose: () => void;
}

const VariantLightbox: React.FC<LightboxProps> = ({
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

/* ─── Variant Drawer ─────────────────────────────────────── */

interface VariantDrawerProps {
  open: boolean;
  onClose: () => void;
  variants: string[] | Variation[];
  productTitle: string;
  productImage?: string;
}

const VariantDrawer: React.FC<VariantDrawerProps> = ({
  open,
  onClose,
  variants,
  productTitle,
  productImage,
}) => {
  const [query, setQuery] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const normalized = normalizeVariations(variants);
  const hasVars = !isNoVariant(normalized);
  const withImages = normalized.filter((v) => v.image);

  const filtered = hasVars
    ? normalized.filter((v) =>
        v.name.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) =>
      e.key === "Escape" && !lightboxIndex && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose, lightboxIndex]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

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
                {productImage ? (
                  <img
                    src={productImage}
                    alt={productTitle}
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
                  {productTitle}
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
                              ৳{variant.price.toLocaleString()}
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

const MobileProductCard: React.FC<MobileProductCardProps> = ({
  id,
  sku,
  slug,
  image,
  title,
  categoryName,
  categoryNames,
  active,
  quantity,
  unitPrice,
  totalSold,
  totalReturned,
  variations,
  updatedAt,
  onEdit,
  onDelete,
  onViewVariations,
}) => {
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleVariantClick = () => {
    if (onViewVariations) onViewVariations();
    else setDrawerOpen(true);
  };

  const formatNumber = (num: number): string => {
    return Number(num) % 1 < 1
      ? Math.floor(num).toLocaleString()
      : num.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  };

  const normalized = normalizeVariations(variations);
  const hasVars = !isNoVariant(normalized);
  const variantCount = hasVars ? normalized.length : 0;

  return (
    <>
      <div className='group relative rounded-md bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden'>
        {/* Header with Image */}
        <div className='relative'>
          <div className='relative w-full aspect-[4/3] bg-gray-100 overflow-hidden'>
            {image ? (
              <img
                src={image}
                alt={title}
                className='w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500'
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : null}
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent",
                image ? "hidden" : "flex",
              )}>
              <Package className='h-12 w-12 text-gray-400' />
            </div>

            {/* SKU Badge - Top Left */}
            <div className='absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/30 text-white text-[10px] font-mono tracking-wider'>
              {sku}
            </div>

            {/* Stock Status Badge - Top Right */}
            <div
              className={`absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                quantity > 0
                  ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-100"
                  : "bg-red-500/20 border-red-400/40 text-red-100"
              }`}>
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  quantity > 0 ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                }`}
              />
              {quantity > 0 ? "In Stock" : "Out of Stock"}
            </div>

            {/* Price Badge - Bottom Left */}
            <div className='absolute bottom-2.5 left-2.5 px-3 py-1 rounded-full bg-white/90 text-gray-900 text-sm font-bold shadow-sm'>
              ৳{formatNumber(unitPrice)}
            </div>

            {/* Actions Dropdown - Top Right */}
            {hasSomePermissionsForPage("product", ["edit", "delete"]) && (
              <div className='absolute top-1.5 right-1.5'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full backdrop-blur-sm shadow-sm'>
                      <MoreVertical className='h-3.5 w-3.5' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-40'>
                    <DropdownMenuItem onClick={handleVariantClick}>
                      <Eye className='h-4 w-4 mr-2' />
                      View Details
                    </DropdownMenuItem>

                    {hasRequiredPermission("product", "edit") && (
                      <DropdownMenuItem onClick={() => onEdit(id)}>
                        <Edit className='h-4 w-4 mr-2' />
                        Edit Product
                      </DropdownMenuItem>
                    )}

                    {hasRequiredPermission("product", "delete") && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(id)}
                          className='text-red-600 focus:text-red-600'>
                          <Trash2 className='h-4 w-4 mr-2' />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className='p-2'>
          {/* Product Title */}
          <h3 className='text-sm font-semibold text-gray-900 leading-snug line-clamp-1 mb-1'>
            {title}
          </h3>

          {/* Categories */}
          <div className='mb-2'>
            {/* Display categories - support both single and multiple */}
            {categoryNames && categoryNames.length > 0 ? (
              <div className='flex flex-wrap gap-1'>
                {categoryNames.slice(0, 3).map((cat, i) => (
                  <span
                    key={i}
                    className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-600 border border-indigo-100'>
                    <Tag className='w-2.5 h-2.5' />
                    {cat}
                  </span>
                ))}
                {categoryNames.length > 3 && (
                  <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500'>
                    +{categoryNames.length - 3}
                  </span>
                )}
              </div>
            ) : (
              <div className='flex items-center gap-1'>
                <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-600 border border-indigo-100'>
                  <Tag className='w-2.5 h-2.5' />
                  {categoryName || "Uncategorized"}
                </span>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className='grid grid-cols-4 gap-1.5 mt-0.5'>
            {[
              {
                icon: <BoxIcon className='w-3.5 h-3.5' />,
                value: quantity,
                label: "Stock",
                color: "text-sky-600 dark:text-sky-400",
                bg: "bg-sky-50 dark:bg-sky-900/20",
              },
              {
                icon: <ShoppingCart className='w-3.5 h-3.5' />,
                value: totalSold,
                label: "Sold",
                color: "text-emerald-600 dark:text-emerald-400",
                bg: "bg-emerald-50 dark:bg-emerald-900/20",
              },
              {
                icon: <RotateCcw className='w-3.5 h-3.5' />,
                value: totalReturned,
                label: "Return",
                color: "text-rose-600 dark:text-rose-400",
                bg: "bg-rose-50 dark:bg-rose-900/20",
              },
              {
                icon: <Package className='w-3.5 h-3.5' />,
                value: variantCount,
                label: "Vars",
                color: "text-violet-600 dark:text-violet-400",
                bg: "bg-violet-50 dark:bg-violet-900/20",
                clickable: true,
              },
            ].map(({ icon, value, label, color, bg, clickable }, i) => (
              <button
                key={i}
                disabled={!clickable}
                onClick={clickable ? handleVariantClick : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 px-1 border border-transparent ${bg} ${
                  clickable
                    ? "cursor-pointer hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-sm active:scale-95 transition-all"
                    : "cursor-default"
                }`}>
                <span className={color}>{icon}</span>
                <span className={`text-sm font-bold leading-none ${color}`}>
                  {value}
                </span>
                <span className='text-[9px] text-zinc-400 font-medium leading-none'>
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className='flex items-center justify-between pt-1 border-t border-gray-100'>
            <div className='flex items-center gap-0.5 text-[10px] text-gray-500'>
              <Calendar className='h-2.5 w-2.5' />
              <span>{dayjs(updatedAt).format("MMM D")}</span>
            </div>
            <ShareButton
              sm={true}
              linkToShare={`${BRAND_CONFIG.website}/collections/${slug}`}
              title={`Check out this awesome product: ${title}`}
              text={`This ${categoryNames?.[0] || categoryName || "product"} has only ${quantity} item left. Don't miss out!`}
            />
          </div>
        </div>
      </div>

      <VariantDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        variants={variations}
        productTitle={title}
        productImage={image}
      />
    </>
  );
};

export default MobileProductCard;
