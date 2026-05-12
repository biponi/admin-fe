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
    <div className='flex items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4'>
      <div>
        <p className='text-[10px] uppercase tracking-[0.1em] text-zinc-400 font-normal mb-1'>
          Select variation
        </p>
        <h2
          className='text-xl font-normal leading-snug text-zinc-900'
          style={{ fontFamily: "'Cormorant Garamond', 'Georgia', serif" }}>
          {productName}
        </h2>
      </div>
      <button
        onClick={onClose}
        className='flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-700'
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
      <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100'>
        <Package className='h-6 w-6 text-zinc-400' />
      </div>
      <p className='text-sm font-medium text-zinc-700'>
        No variations available
      </p>
      <p className='mt-1 text-xs text-zinc-400'>
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
    <div className='group overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-400'>
      {/* Image */}
      <div className='relative aspect-square w-full overflow-hidden bg-zinc-50'>
        <img
          src={getImageUrl(variation)}
          alt={`${product.name} — ${variation.color ?? ""} ${variation.size ?? ""}`}
          loading='lazy'
          className='h-full w-full object-cover transition-transform duration-400 group-hover:scale-105'
          onError={(e) => {
            (e.target as HTMLImageElement).src = PlaceHolderImage;
          }}
        />
        {variation.quantity > 0 && variation.quantity <= 5 && (
          <span className='absolute left-2 top-2 rounded-sm bg-zinc-800 px-2 py-0.5 text-[9px] uppercase tracking-wider text-zinc-300'>
            {variation.quantity} left
          </span>
        )}
      </div>

      {/* Info */}
      <div className='p-3'>
        <p
          className='text-sm font-normal leading-tight text-zinc-900 mb-2'
          style={{ fontFamily: "'Cormorant Garamond', 'Georgia', serif" }}>
          {variation.name ||
            variation.title ||
            [variation.color, variation.size].filter(Boolean).join(" · ")}
        </p>

        {/* Attribute chips */}
        <div className='flex flex-wrap gap-1.5 mb-2'>
          {variation.color && (
            <span className='rounded-sm bg-zinc-100 px-2 py-0.5 text-[10px] tracking-wide text-zinc-600'>
              {variation.color}
            </span>
          )}
          {variation.size && (
            <span className='rounded-sm bg-zinc-100 px-2 py-0.5 text-[10px] tracking-wide text-zinc-600'>
              Size {variation.size}
            </span>
          )}
        </div>

        <p className='mb-2.5 text-[10px] font-light tracking-wide text-zinc-400'>
          SKU: {variation.sku}
        </p>

        {/* Price + Add */}
        <div className='flex items-center justify-between border-t border-zinc-100 pt-2.5'>
          <span
            className='text-lg font-medium leading-none text-zinc-900'
            style={{ fontFamily: "'Cormorant Garamond', 'Georgia', serif" }}>
            ৳{price.toFixed(2)}
          </span>
          <button
            disabled={isLoading || variation.quantity === 0}
            onClick={() => onSelectVariation(product, variation)}
            className='flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-[10px] uppercase tracking-wider text-zinc-100 transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40'>
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
    if (variation?.images && variation.images.length > 0) {
      const image = variation.images[0];
      if (typeof image === "string") return image;
      if (image instanceof File) return URL.createObjectURL(image);
    }
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
            <div className='mx-auto mt-2.5 h-1 w-9 rounded-full bg-zinc-200' />

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
          <DialogContent className='max-w-3xl p-0 overflow-hidden rounded-2xl border border-zinc-200'>
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
