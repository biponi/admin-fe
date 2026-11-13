import { X, Package, ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "../../../components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
} from "../../../components/ui/drawer";
import PlaceHolderImage from "../../../assets/placeholder.svg";
import type { IProduct, IVariation } from "../../product/interface";
import { useIsMobile } from "../../../hooks/use-mobile";
import { getVariationImageUrl } from "../../../utils/functions";

interface VariationModalProps {
  product: IProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectVariation: (product: IProduct, variation: IVariation) => void;
  isLoading?: boolean;
}

// Shared header for both dialog and drawer
function ModalHeader({
  productName,
  onClose,
}: {
  productName: string;
  onClose: () => void;
}) {
  return (
    <div className='flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4'>
      <div>
        <p className='mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70'>
          Select variation
        </p>
        <h2 className='text-base font-semibold leading-snug text-foreground'>
          {productName}
        </h2>
      </div>
      <button
        onClick={onClose}
        className='flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground/70 transition-colors hover:bg-muted/50 hover:text-foreground'
        aria-label='Close'>
        <X className='h-4 w-4' />
      </button>
    </div>
  );
}

// Shared empty state
function EmptyState() {
  return (
    <div className='flex flex-col items-center justify-center py-14 text-center'>
      <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted/50'>
        <Package className='h-5 w-5 text-muted-foreground/70' />
      </div>
      <p className='text-sm font-medium text-foreground'>
        No variations available
      </p>
      <p className='mt-1 text-xs text-muted-foreground/70'>
        All variations are currently out of stock.
      </p>
    </div>
  );
}

// Individual variation card
function VariationCard({
  variation,
  product,
  onSelectVariation,
  isLoading,
  getImageUrl,
}: {
  variation: IVariation;
  product: IProduct;
  onSelectVariation: (product: IProduct, variation: IVariation) => void;
  isLoading: boolean;
  getImageUrl: (v: IVariation) => string;
}) {
  const price =
    variation.unitPrice && Number(variation.unitPrice) > 0
      ? variation.unitPrice
      : product.unitPrice;

  return (
    <div className='overflow-hidden rounded-xl border border-border bg-background transition-colors duration-200 hover:border-border'>
      {/* Image */}
      <div className='relative aspect-square w-full overflow-hidden bg-muted/50'>
        <img
          src={getImageUrl(variation)}
          alt={`${product.name} — ${variation.color ?? ""} ${variation.size ?? ""}`}
          loading='lazy'
          className='h-full w-full object-cover'
          onError={(e) => {
            (e.target as HTMLImageElement).src = PlaceHolderImage;
          }}
        />
        {variation.quantity !== undefined && (
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${
              variation.quantity >= 1
                ? "bg-background/90 text-foreground backdrop-blur-sm"
                : "bg-rose-100 text-rose-700"
            }`}>
            {variation.quantity}{" "}
            {variation.quantity >= 1 ? "left" : "out of stock"}
          </span>
        )}
      </div>

      {/* Info */}
      <div className='p-3'>
        <p className='mb-2 text-[13px] font-medium leading-tight text-foreground'>
          {variation.name ||
            variation.title ||
            [variation.color, variation.size].filter(Boolean).join(" · ")}
        </p>

        {/* Attribute chips */}
        <div className='flex flex-wrap gap-1.5 mb-2'>
          {variation.color && (
            <span className='rounded-full bg-muted px-2 py-0.5 text-[10px] tracking-wide text-muted-foreground'>
              {variation.color}
            </span>
          )}
          {variation.size && (
            <span className='rounded-full bg-muted px-2 py-0.5 text-[10px] tracking-wide text-muted-foreground'>
              Size {variation.size}
            </span>
          )}
        </div>

        <p className='mb-2.5 text-[10px] tracking-wide text-muted-foreground/70'>
          SKU: {variation.sku}
        </p>

        {/* Price + Add */}
        <div className='flex items-center justify-between border-t border-border/60 pt-2.5'>
          <span className='text-sm font-semibold leading-none text-foreground tabular-nums'>
            ৳{price.toFixed(2)}
          </span>
          <button
            disabled={isLoading || variation.quantity === 0}
            onClick={() => onSelectVariation(product, variation)}
            className='flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40'>
            <ShoppingCart className='h-3 w-3' />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export function VariationModal({
  product,
  open,
  onOpenChange,
  onSelectVariation,
  isLoading = false,
}: VariationModalProps) {
  const isMobile = useIsMobile();
  if (!product) return null;

  const availableVariations =
    product.variation?.filter((v) => v.quantity > 0) || [];

  const getImageUrl = (variation?: IVariation): string => {
    // Try the helper function first (checks variation.images → imageGroups)
    const url = getVariationImageUrl(variation, product.imageGroups);
    if (url) return url;

    // Final fallback to product thumbnail
    return product.thumbnail || PlaceHolderImage;
  };

  const cardProps = { product, onSelectVariation, isLoading, getImageUrl };

  return (
    <>
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className='h-[88vh] max-h-[88vh] rounded-t-2xl p-0'>
            {/* Drag handle */}
            <div className='mx-auto mt-2.5 h-1 w-9 rounded-full bg-muted' />

            <DrawerHeader className='p-0'>
              <ModalHeader
                productName={product.name}
                onClose={() => onOpenChange(false)}
              />
            </DrawerHeader>

            <div className='overflow-y-auto px-4 pb-6 pt-4'>
              {availableVariations.length === 0 ? (
                <EmptyState />
              ) : (
                <div className='grid grid-cols-2 gap-3'>
                  {availableVariations.map((variation) => (
                    <VariationCard
                      key={variation.id}
                      variation={variation}
                      {...cardProps}
                    />
                  ))}
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Desktop Dialog */}
      {!isMobile && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className='max-w-3xl p-0 overflow-hidden rounded-2xl border border-border bg-background'>
            <DialogHeader className='p-0'>
              <ModalHeader
                productName={product.name}
                onClose={() => onOpenChange(false)}
              />
            </DialogHeader>

            <div className='max-h-[calc(80vh-80px)] overflow-y-auto px-5 pb-6 pt-4'>
              {availableVariations.length === 0 ? (
                <EmptyState />
              ) : (
                <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
                  {availableVariations.map((variation) => (
                    <VariationCard
                      key={variation.id}
                      variation={variation}
                      {...cardProps}
                    />
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
