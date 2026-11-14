import {
  EditIcon,
  BarChart2,
  ChevronRight,
  SlidersHorizontal,
  History,
  Trash2,
  Package,
  PackageX,
} from "lucide-react";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import { TableCell, TableRow } from "../../../components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { useRef, useState, memo } from "react";
import useRoleCheck from "../../auth/hooks/useRoleCheck";
import { ProductAdjustmentDialog } from "./ProductAdjustmentDialog";
import { ProductAdjustmentHistory } from "./ProductAdjustmentHistory";
import DeleteRequestDialog from "./DeleteRequestDialog";
import type { IMetaEntry, IVariation } from "../interface";
import { ProductMetaDetail, hasAnyMeta } from "./ProductMetaDetail";
import { cn } from "../../../lib/utils";
import PlaceHolderImage from "../../../assets/placeholder.svg";
import {
  getVariationImageUrl,
  getAllProductImages,
} from "../../../utils/functions";
import { ImageLightbox } from "../../../components/ImageLightbox";

dayjs.extend(advancedFormat);

// ─── Variation chip ───────────────────────────────────────────────────────────

function VariationChip({
  variation,
  imageGroups,
}: {
  variation: IVariation;
  imageGroups?: any[];
}) {
  const src = getVariationImageUrl(variation, imageGroups);

  const label =
    variation.name ||
    variation.title ||
    [variation.color, variation.size].filter(Boolean).join(" · ");

  const qty = variation.quantity ?? 0;
  const qtyColor =
    qty <= 0 ? "text-red-600" : qty <= 5 ? "text-amber-700" : "text-zinc-500";
  const qtyLabel =
    qty <= 0 ? "out of stock" : qty <= 5 ? `${qty} left` : `${qty} in stock`;

  return (
    <div className='flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2 py-1 transition-colors hover:border-zinc-400'>
      {src ? (
        <img
          src={src}
          alt={label}
          className='h-8 w-8 flex-shrink-0 rounded-md object-cover border border-zinc-100'
          onError={(e) => {
            (e.target as HTMLImageElement).src = PlaceHolderImage;
          }}
        />
      ) : (
        <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-zinc-100 bg-zinc-50 text-[11px] font-semibold text-zinc-600'>
          {variation.size || variation.color?.slice(0, 1) || "?"}
        </div>
      )}
      <div className='flex flex-col'>
        <span className='text-[12px] font-semibold leading-tight text-zinc-900 whitespace-nowrap'>
          {label}
        </span>
        <span
          className={`text-[11px] font-medium leading-tight whitespace-nowrap ${qtyColor}`}>
          {qtyLabel}
        </span>
      </div>
    </div>
  );
}

// ─── Variation list display — shows max 3, popover for rest ──────────────────────

function VariationDisplayList({
  variationList,
  onExpand,
  imageGroups,
}: {
  variationList?: IVariation[];
  onExpand: () => void;
  imageGroups?: any[];
}) {
  if (!variationList || variationList.length === 0) {
    return (
      <span className='text-[12px] font-medium italic text-zinc-400'>
        No variations
      </span>
    );
  }

  const visible = variationList.slice(0, 3);
  const remaining = Math.max(0, variationList.length - 3);

  return (
    <div className='flex items-center gap-1.5 flex-wrap'>
      {visible.map((v) => (
        <VariationChip key={v.id} variation={v} imageGroups={imageGroups} />
      ))}
      {remaining > 0 && (
        <button
          onClick={onExpand}
          className='text-xs font-semibold text-zinc-600 hover:text-zinc-900 underline px-1 py-0.5 rounded transition-colors hover:bg-zinc-100'>
          +{remaining} more
        </button>
      )}
    </div>
  );
}

// ─── Variation popover content — shows all in 2-per-row grid ─────────────────────

function VariationPopoverContent({
  variationList,
  imageGroups,
}: {
  variationList?: IVariation[];
  imageGroups?: any[];
}) {
  if (!variationList || variationList.length === 0) {
    return (
      <div className='text-sm text-zinc-500 py-2'>No variations available</div>
    );
  }

  // Chunk into rows of 2
  const rows: IVariation[][] = [];
  for (let i = 0; i < variationList.length; i += 2) {
    rows.push(variationList.slice(i, i + 2));
  }

  return (
    <div className='space-y-2 max-h-[300px] overflow-y-auto'>
      {rows.map((row, idx) => (
        <div key={idx} className='flex gap-2'>
          {row.map((v) => (
            <VariationChip key={v.id} variation={v} imageGroups={imageGroups} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Variation grid display — shows ALL, wraps every 3 ─────────────────────────

function VariationDisplayGrid({
  variationList,
  imageGroups,
}: {
  variationList?: IVariation[];
  imageGroups?: any[];
}) {
  if (!variationList || variationList.length === 0) {
    return (
      <span className='text-[12px] font-medium italic text-zinc-400'>
        No variations
      </span>
    );
  }

  // Chunk into rows of 3
  const rows: IVariation[][] = [];
  for (let i = 0; i < variationList.length; i += 3) {
    rows.push(variationList.slice(i, i + 3));
  }

  return (
    <div className='flex flex-col gap-1.5'>
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className='flex gap-1.5'>
          {row.map((v, i) => (
            <VariationChip
              key={v.id || `${rowIdx}-${i}`}
              variation={v}
              imageGroups={imageGroups}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Stock badge ──────────────────────────────────────────────────────────────

function StockBadge({ quantity }: { quantity: number }) {
  if (quantity <= 0)
    return (
      <span className='inline-flex items-center gap-1.5 rounded px-2 py-1 text-[12px] font-semibold bg-red-50 text-red-700'>
        <PackageX className='h-3.5 w-3.5' /> Out of stock
      </span>
    );
  if (quantity <= 10)
    return (
      <span className='inline-flex items-center gap-1.5 rounded px-2 py-1 text-[12px] font-semibold bg-amber-50 text-amber-800'>
        <Package className='h-3.5 w-3.5' /> {quantity}
      </span>
    );
  return (
    <span className='inline-flex items-center gap-1.5 rounded px-2 py-1 text-[12px] font-semibold bg-emerald-50 text-emerald-800'>
      <Package className='h-3.5 w-3.5' /> {quantity}
    </span>
  );
}

// ─── Sold / Returned ──────────────────────────────────────────────────────────

function SoldReturnedStat({
  totalSold,
  totalReturned,
}: {
  totalSold: number;
  totalReturned: number;
}) {
  return (
    <div className='flex items-center gap-2.5'>
      <div className='text-center'>
        <p className='text-[14px] font-bold leading-tight text-zinc-900'>
          {totalSold}
        </p>
        <p className='text-[11px] font-medium text-zinc-500'>sold</p>
      </div>
      <div className='h-4 w-px bg-zinc-200' />
      <div className='text-center'>
        <p
          className={`text-[14px] font-bold leading-tight ${
            totalReturned > 0 ? "text-red-600" : "text-zinc-400"
          }`}>
          {totalReturned}
        </p>
        <p className='text-[11px] font-medium text-zinc-500'>returned</p>
      </div>
    </div>
  );
}

// ─── Action button ────────────────────────────────────────────────────────────

function ActionButton({
  label,
  icon: Icon,
  onClick,
  danger = false,
}: {
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          aria-label={label}
          className={`flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-transparent transition-colors
            ${
              danger
                ? "text-zinc-400 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                : "text-zinc-400 hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-800"
            }`}>
          <Icon className='h-3.5 w-3.5' />
        </button>
      </TooltipTrigger>
      <TooltipContent side='top' className='text-xs'>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  id: string;
  sku: string;
  slug: string;
  image: string;
  title: string;
  active: boolean;
  quantity: number;
  unitPrice: number;
  updatedAt: string;
  categoryName: string;
  variations: string[];
  variationList?: IVariation[];
  meta?: IMetaEntry[];
  hasVariation?: boolean;
  imageGroups?: any[];
  totalReturned: number;
  totalSold: number;
  handleUpdateProduct: (id: string) => void;
  deleteExistingProduct: (id: string) => void;
  refreshProductList?: () => void;
  handleViewProductDetails: (id: string) => void;
  variationDisplayMode?: string;
}

// ─── Main component ───────────────────────────────────────────────────────────

const SingleItem: React.FC<Props> = ({
  id,
  sku,
  image,
  title,
  active,
  quantity,
  unitPrice,
  updatedAt,
  totalSold,
  variationList,
  meta,
  hasVariation,
  imageGroups,
  categoryName,
  totalReturned,
  refreshProductList,
  handleUpdateProduct,
  deleteExistingProduct,
  handleViewProductDetails,
  variationDisplayMode = "list",
}) => {
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();
  const showSold = hasRequiredPermission("product", "summary");
  const dialogBtn = useRef<HTMLButtonElement>(null);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [isVariationPopoverOpen, setIsVariationPopoverOpen] = useState(false);
  const [metaExpanded, setMetaExpanded] = useState(false);
  const hasMeta = hasAnyMeta({ meta, variation: variationList });
  const [thumbLightboxImages, setThumbLightboxImages] = useState<string[]>([]);
  const [thumbLightboxIndex, setThumbLightboxIndex] = useState(0);

  const handleThumbnailClick = () => {
    const images = getAllProductImages({
      thumbnail: image,
      variation: variationList,
      imageGroups,
    });
    if (images.length > 0) {
      setThumbLightboxImages(images);
      setThumbLightboxIndex(0);
    }
  };

  return (
    <>
      <TableRow className='group border-b border-zinc-100 transition-colors hover:bg-zinc-50/60 align-top rounded-md'>
        {/* Meta expander — only rows that actually have meta get the affordance */}
        <TableCell className='pt-3 pl-3 pr-0 w-8 align-middle'>
          {hasMeta && (
            <button
              onClick={() => setMetaExpanded((v) => !v)}
              aria-expanded={metaExpanded}
              aria-label={metaExpanded ? "Hide meta data" : "Show meta data"}
              className='flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700'>
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  metaExpanded && "rotate-90",
                )}
              />
            </button>
          )}
        </TableCell>

        {/* Image + active dot */}
        <TableCell className='pt-3 pl-3 pr-2 w-20'>
          <div className='relative inline-block'>
            <img
              src={image || PlaceHolderImage}
              alt={title}
              className={`h-16 w-20 rounded-lg object-cover border border-zinc-200 cursor-pointer ${
                !active ? "opacity-50" : ""
              }`}
              onClick={handleThumbnailClick}
              onError={(e) => {
                (e.target as HTMLImageElement).src = PlaceHolderImage;
              }}
            />
            <span
              className={`absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full ring-2 ring-white ${
                active ? "bg-emerald-500" : "bg-zinc-300"
              }`}
            />
          </div>
        </TableCell>

        {/* Name + SKU */}
        <TableCell className='pt-3 min-w-[140px] max-w-[180px]'>
          <p className='truncate text-[13px] font-bold text-zinc-900 leading-tight'>
            {title}
          </p>
          <p className='mt-0.5 font-mono text-[11px] font-semibold text-zinc-500'>
            {sku}
          </p>
        </TableCell>

        {/* Category */}
        <TableCell className='pt-3 whitespace-nowrap text-[12px] font-semibold text-zinc-600'>
          {categoryName}
        </TableCell>

        {/* Price */}
        <TableCell className='pt-3'>
          <span
            className='text-[15px] font-bold text-zinc-900 leading-none'
            style={{ fontFamily: "'Cormorant Garamond', 'Georgia', serif" }}>
            ৳{unitPrice.toLocaleString()}
          </span>
        </TableCell>

        {/* Variations — different displays based on mode */}
        <TableCell className='pt-3 pb-3'>
          {variationDisplayMode === "list" ? (
            <Popover
              open={isVariationPopoverOpen}
              onOpenChange={setIsVariationPopoverOpen}>
              <PopoverTrigger asChild>
                <div className='cursor-pointer'>
                  <VariationDisplayList
                    variationList={variationList}
                    onExpand={() => setIsVariationPopoverOpen(true)}
                    imageGroups={imageGroups}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className='w-96' side='bottom' align='start'>
                <VariationPopoverContent
                  variationList={variationList}
                  imageGroups={imageGroups}
                />
              </PopoverContent>
            </Popover>
          ) : (
            <VariationDisplayGrid
              variationList={variationList}
              imageGroups={imageGroups}
            />
          )}
        </TableCell>

        {/* Total stock */}
        <TableCell className='pt-3'>
          <StockBadge quantity={quantity} />
        </TableCell>

        {/* Sold / Returned */}
        {!showSold ? (
          <TableCell className='pt-3'>
            <span className='text-[12px] font-medium text-zinc-400'>--</span>
          </TableCell>
        ) : hasRequiredPermission("product", "analytics") ? (
          <TableCell className='pt-3'>
            <SoldReturnedStat
              totalSold={totalSold}
              totalReturned={totalReturned}
            />
          </TableCell>
        ) : (
          <TableCell className='pt-3'>
            <span className='text-[12px] font-medium text-zinc-400'>N/A</span>
          </TableCell>
        )}

        {/* Updated at */}
        <TableCell className='pt-3 hidden md:table-cell'>
          <p className='text-[12px] font-semibold text-zinc-600 whitespace-nowrap leading-relaxed'>
            {dayjs(updatedAt).format("DD MMM YYYY")}
            <br />
            <span className='text-[11px] font-medium text-zinc-400'>
              {dayjs(updatedAt).format("hh:mm A")}
            </span>
          </p>
        </TableCell>

        {/* Actions */}
        {hasSomePermissionsForPage("product", ["edit", "delete"]) && (
          <TableCell className='pt-3 pr-3'>
            <div className='flex items-center justify-end gap-1'>
              {hasRequiredPermission("product", "edit") && (
                <ActionButton
                  label='Edit'
                  icon={EditIcon}
                  onClick={() => handleUpdateProduct(id)}
                />
              )}
              {hasRequiredPermission("product", "analytics") && (
                <ActionButton
                  label='View details'
                  icon={BarChart2}
                  onClick={() => handleViewProductDetails(id)}
                />
              )}
              {hasSomePermissionsForPage("product", [
                "stock_increase",
                "stock_decrease",
              ]) && (
                <ActionButton
                  label='Adjust stock'
                  icon={SlidersHorizontal}
                  onClick={() => setAdjustDialogOpen(true)}
                />
              )}
              {hasRequiredPermission("product", "analytics") && (
                <ActionButton
                  label='View history'
                  icon={History}
                  onClick={() => setHistoryDialogOpen(true)}
                />
              )}
              <div className='mx-0.5 h-4 w-px bg-zinc-200' />
              {hasRequiredPermission("product", "delete") && (
                <ActionButton
                  label='Delete'
                  icon={Trash2}
                  danger
                  onClick={() => dialogBtn.current?.click()}
                />
              )}
            </div>
          </TableCell>
        )}

        {/* Hidden delete request trigger */}
        <DeleteRequestDialog
          productId={id}
          productName={title}
          onSuccess={refreshProductList}>
          <button className='hidden' ref={dialogBtn} />
        </DeleteRequestDialog>

        {adjustDialogOpen && (
          <ProductAdjustmentDialog
            open={adjustDialogOpen}
            onOpenChange={setAdjustDialogOpen}
            productId={id}
            productName={title}
            productSku={sku}
            productThumbnail={image}
            currentStock={quantity}
            hasVariation={hasVariation}
            variations={variationList}
            onSuccess={() => refreshProductList?.()}
          />
        )}

        {historyDialogOpen && (
          <ProductAdjustmentHistory
            open={historyDialogOpen}
            onOpenChange={setHistoryDialogOpen}
            productId={id}
            productName={title}
          />
        )}
      </TableRow>

      {/* Expanded meta detail row (product-level + per-variant entries) */}
      {metaExpanded && hasMeta && (
        <TableRow className='border-b border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50/50'>
          <TableCell colSpan={10} className='px-0 py-0'>
            <div className='animate-in fade-in slide-in-from-top-1 duration-200 border-l-2 border-indigo-200'>
              <ProductMetaDetail meta={meta} variationList={variationList} />
            </div>
          </TableCell>
        </TableRow>
      )}

      {/* Thumbnail image lightbox */}
      {thumbLightboxImages.length > 0 && (
        <ImageLightbox
          images={thumbLightboxImages}
          initialIndex={thumbLightboxIndex}
          open={thumbLightboxImages.length > 0}
          onClose={() => setThumbLightboxImages([])}
          alt={title}
        />
      )}
    </>
  );
};

export default memo(SingleItem);
