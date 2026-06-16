import React from "react";
import { Input } from "../ui/input";
import { Hash, Trash2, Package, Tag, Palette, Ruler, Box } from "lucide-react";
import { IVariation } from "../../pages/product/interface";
import { VariantImageUploader } from "./VariantImageUploader";
import { cn } from "@/lib/utils";

interface V1VariationManagerProps {
  variations: IVariation[];
  variantImages: Record<string, (File | string)[]>;
  readonly?: boolean;
  showPrice?: boolean;
  showVariantName?: boolean;
  isSameUnitPrice?: boolean;
  gridColumns?: { sm: string; lg: string };
  onUpdateVariation: (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onDeleteVariation: (index: number) => void;
  onVariantImagesChange: (variantId: string, images: (File | string)[]) => void;
}

/* ── tiny field primitive ─────────────────────────────────────── */
const Field = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) => (
  <div className='space-y-1'>
    <div className='flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
      {icon}
      {label}
    </div>
    {children}
  </div>
);

const fieldInput =
  "h-8 text-xs px-2.5 bg-background border-border/50 focus:border-border focus-visible:ring-0 focus-visible:ring-offset-0";

/* ── main component ───────────────────────────────────────────── */
const V1VariationManager: React.FC<V1VariationManagerProps> = ({
  variations,
  variantImages,
  readonly = false,
  showPrice = true,
  showVariantName = false,
  isSameUnitPrice = false,
  gridColumns = { sm: "2", lg: "3" },
  onUpdateVariation,
  onDeleteVariation,
  onVariantImagesChange,
}) => {
  if (!variations || variations.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 py-14 rounded-xl border border-dashed border-border/60 bg-muted/20'>
        <div className='w-10 h-10 rounded-xl bg-muted flex items-center justify-center'>
          <Box className='w-5 h-5 text-muted-foreground' />
        </div>
        <p className='text-sm font-medium text-foreground'>No variations yet</p>
        <p className='text-xs text-muted-foreground'>
          Click "Add New Variation" below to get started
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-3 grid-cols-1 sm:grid-cols-2",
        gridColumns.lg === "3" ? "lg:grid-cols-3" : "lg:grid-cols-2",
      )}>
      {variations.map((variation: IVariation, index: number) => (
        <div
          key={variation.id || index}
          className='group relative flex flex-col gap-3 p-3.5 rounded-xl border border-border/40 bg-background hover:border-border/80 transition-colors duration-150'>
          {/* Delete — appears on hover */}
          <button
            onClick={() => onDeleteVariation(index)}
            aria-label='Delete variation'
            className={cn(
              "absolute top-2.5 right-2.5 z-10 p-1.5 rounded-lg",
              "text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20",
              "opacity-0 group-hover:opacity-100 transition-all duration-150",
            )}>
            <Trash2 className='w-3.5 h-3.5' />
          </button>

          {/* SKU row */}
          <div className='flex items-center gap-2 pr-7'>
            <div className='w-6 h-6 rounded-md bg-muted flex items-center justify-center flex-shrink-0'>
              <Hash className='w-3 h-3 text-muted-foreground' />
            </div>
            <span className='font-mono text-[11px] font-medium text-muted-foreground truncate'>
              {variation.sku}
            </span>
          </div>

          {/* Divider */}
          <div className='h-px bg-border/40' />

          {/* Fields */}
          <div className='space-y-2.5'>
            {/* Optional: Variant name */}
            {showVariantName && (
              <Field icon={<Tag className='w-3 h-3' />} label='Variant name'>
                <Input
                  name='name'
                  type='text'
                  value={variation.name || ""}
                  onChange={(e) => onUpdateVariation(index, e)}
                  className={fieldInput}
                  placeholder='e.g. Red – Large'
                />
              </Field>
            )}

            {/* Stock */}
            <Field
              icon={<Package className='w-3 h-3' />}
              label={readonly ? "Stock (read-only)" : "Stock"}>
              {readonly ? (
                <div className='h-8 flex items-center px-2.5 rounded-lg text-xs font-semibold bg-muted/50 border border-border/40 text-muted-foreground'>
                  {variation.quantity} units
                </div>
              ) : (
                <Input
                  name='quantity'
                  type='number'
                  min='0'
                  value={variation.quantity}
                  onChange={(e) => onUpdateVariation(index, e)}
                  className={fieldInput}
                  placeholder='0'
                />
              )}
            </Field>

            {/* Optional: Price */}
            {showPrice && (
              <Field icon={<Tag className='w-3 h-3' />} label='Price'>
                <Input
                  name='unitPrice'
                  type='number'
                  min='0'
                  step='0.01'
                  value={variation.unitPrice}
                  onChange={(e) => onUpdateVariation(index, e)}
                  disabled={isSameUnitPrice}
                  className={cn(
                    fieldInput,
                    isSameUnitPrice &&
                      "opacity-50 cursor-not-allowed bg-muted/50",
                  )}
                  placeholder='0.00'
                />
              </Field>
            )}

            {/* Color + Size */}
            <div className='grid grid-cols-2 gap-2'>
              <Field icon={<Palette className='w-3 h-3' />} label='Color'>
                <Input
                  name='color'
                  type='text'
                  value={variation.color}
                  onChange={(e) => onUpdateVariation(index, e)}
                  className={fieldInput}
                  placeholder='Color'
                />
              </Field>
              <Field icon={<Ruler className='w-3 h-3' />} label='Size'>
                <Input
                  name='size'
                  type='text'
                  value={variation.size}
                  onChange={(e) => onUpdateVariation(index, e)}
                  className={fieldInput}
                  placeholder='Size'
                />
              </Field>
            </div>
          </div>

          {/* Variant image uploader */}
          <VariantImageUploader
            variantId={variation.id}
            variantName={
              `${variation.color || ""} ${variation.size || ""}`.trim() ||
              (showVariantName && variation.name) ||
              `Variant ${index + 1}`
            }
            images={variantImages[variation.id] || []}
            onImagesChange={onVariantImagesChange}
          />
        </div>
      ))}
    </div>
  );
};

export default V1VariationManager;
