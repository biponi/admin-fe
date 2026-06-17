import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Palette,
  Ruler,
  Box,
  BarChart3,
  Tag,
  Package,
  Plus,
  X,
} from "lucide-react";
import { IVariation } from "../../pages/product/interface";
import { cn } from "@/lib/utils";

interface V2SimpleVariationManagerProps {
  formData: any;
  updateFormData: (data: any) => void;
  isSameUnitPrice: boolean;
  mode: "create" | "edit";
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
  "h-8 flex items-center px-2.5 rounded-lg text-xs font-semibold bg-muted/50 border border-border/40 text-black cursor-not-allowed";

/* ─── tiny primitives ───────────────────────────────────────────── */

const SectionCard = ({ children }: { children: React.ReactNode }) => (
  <div className='rounded-xl border border-border/40 bg-background overflow-hidden'>
    {children}
  </div>
);

const SectionHeader = ({
  icon,
  iconClass,
  title,
  count,
  badgeClass,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  count: number;
  badgeClass: string;
}) => (
  <div className='flex items-center gap-2.5 px-4 py-3 border-b border-border/40'>
    <div
      className={cn(
        "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
        iconClass,
      )}>
      {icon}
    </div>
    <span className='text-sm font-medium flex-1'>{title}</span>
    <span
      className={cn(
        "text-[11px] font-medium px-2.5 py-0.5 rounded-full",
        badgeClass,
      )}>
      {count}
    </span>
  </div>
);

const FieldLabel = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className='flex items-center gap-1 mb-1'>
    <span className='text-muted-foreground'>{icon}</span>
    <span className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
      {children}
    </span>
  </div>
);

/* ─── main component ─────────────────────────────────────────────── */

const V2SimpleVariationManager: React.FC<V2SimpleVariationManagerProps> = ({
  formData,
  updateFormData,
  isSameUnitPrice,
  mode,
}) => {
  const [v2Colors, setV2Colors] = useState<string[]>([]);
  const [v2Sizes, setV2Sizes] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("");

  // Initialize colors and sizes from existing variations (for edit mode)
  useEffect(() => {
    if (
      mode === "edit" &&
      formData.variation &&
      formData.variation.length > 0
    ) {
      // Extract unique colors
      const colorsSet = new Set<string>();
      const sizesSet = new Set<string>();

      formData.variation.forEach((v: IVariation) => {
        if (v.color) colorsSet.add(v.color);
        if (v.size) sizesSet.add(v.size);
      });

      setV2Colors(Array.from(colorsSet));
      setV2Sizes(Array.from(sizesSet));
    }
  }, [mode, formData.variation]);

  /* ── unchanged logic ── */

  const addColor = () => {
    if (newColor.trim() && !v2Colors.includes(newColor.trim())) {
      const newColors = [...v2Colors, newColor.trim()];
      setV2Colors(newColors);
      setNewColor("");
      generateV2Variations(newColors, v2Sizes);
    }
  };

  const addSize = () => {
    if (newSize.trim() && !v2Sizes.includes(newSize.trim())) {
      const newSizes = [...v2Sizes, newSize.trim()];
      setV2Sizes(newSizes);
      setNewSize("");
      generateV2Variations(v2Colors, newSizes);
    }
  };

  const removeColor = (colorToRemove: string) => {
    const newColors = v2Colors.filter((color) => color !== colorToRemove);
    setV2Colors(newColors);
    generateV2Variations(newColors, v2Sizes);
  };

  const removeSize = (sizeToRemove: string) => {
    const newSizes = v2Sizes.filter((size) => size !== sizeToRemove);
    setV2Sizes(newSizes);
    generateV2Variations(v2Colors, newSizes);
  };

  const generateV2Variations = (colors: string[], sizes: string[]) => {
    // Create a map of existing variations for quick lookup
    const existingVariationsMap = new Map<string, IVariation>();
    formData.variation?.forEach((v: IVariation) => {
      const key = `${v.color}-${v.size}`;
      existingVariationsMap.set(key, v);
    });

    // Find the maximum existing ID to avoid conflicts
    let maxId = -1;
    formData.variation?.forEach((v: IVariation) => {
      const variationId = parseInt(v.id);
      if (!isNaN(variationId) && variationId > maxId) {
        maxId = variationId;
      }
    });

    const newVariations: IVariation[] = [];
    let id = maxId + 1; // Start from maxId + 1 to ensure unique IDs

    for (const color of colors) {
      for (const size of sizes) {
        const key = `${color}-${size}`;
        const existing = existingVariationsMap.get(key);

        if (existing) {
          // Preserve existing variation data
          newVariations.push({
            ...existing,
            id: existing.id,
            color,
            size,
            name: existing.name || `${color} - ${size}`,
            title: existing.title || `${color} ${size}`,
          });
        } else {
          // Create new variation with defaults
          newVariations.push({
            id: id.toString(),
            size,
            color,
            name: `${color} - ${size}`,
            title: `${color} ${size}`,
            sku: `${formData.sku}-${id}`,
            quantity: 0,
            unitPrice: isSameUnitPrice ? formData.unitPrice : 0,
          });
          id++;
        }
      }
    }

    updateFormData({
      ...formData,
      variation: newVariations,
      quantity: newVariations.reduce(
        (sum, variant) => sum + (variant.quantity || 0),
        0,
      ),
    });
  };

  const updateVariationData = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    const updatedVariations = [...formData.variation];
    updatedVariations[index] = {
      ...updatedVariations[index],
      [name]:
        name === "quantity" || name === "unitPrice"
          ? parseFloat(value) || 0
          : value,
    };

    updateFormData({
      ...formData,
      variation: updatedVariations,
      quantity: updatedVariations.reduce(
        (sum, variant) => sum + (variant.quantity || 0),
        0,
      ),
    });
  };

  /* ── render ── */

  return (
    <div className='space-y-4'>
      {/* Colors + Sizes */}
      <div className='grid gap-3 sm:grid-cols-2'>
        {/* Colors */}
        <SectionCard>
          <SectionHeader
            icon={<Palette className='w-3.5 h-3.5' />}
            iconClass='bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300'
            title='Colors'
            count={v2Colors.length}
            badgeClass='bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
          />
          <div className='p-3.5 space-y-3'>
            {/* Input row */}
            <div className='flex gap-2'>
              <Input
                placeholder='e.g. Red, Blue, Navy…'
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addColor();
                  }
                }}
                className='flex-1 h-9 text-sm'
              />
              <button
                onClick={addColor}
                disabled={
                  !newColor.trim() || v2Colors.includes(newColor.trim())
                }
                className={cn(
                  "h-9 px-3.5 rounded-lg flex items-center gap-1.5 text-sm font-medium",
                  "bg-violet-600 text-white hover:bg-violet-700 active:scale-95 transition-all",
                  "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
                )}>
                <Plus className='w-3.5 h-3.5' />
                Add
              </button>
            </div>

            {/* Tags */}
            <div className='flex flex-wrap gap-1.5 min-h-[52px] p-2.5 rounded-lg bg-muted/40 border border-border/40'>
              {v2Colors.length > 0 ? (
                v2Colors.map((color) => (
                  <span
                    key={color}
                    className='inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-[12px] font-medium bg-violet-100 text-violet-800 border border-violet-200 dark:bg-violet-900/40 dark:text-violet-200 dark:border-violet-800'>
                    <Palette className='w-3 h-3 opacity-70' />
                    {color}
                    <button
                      onClick={() => removeColor(color)}
                      aria-label={`Remove ${color}`}
                      className='ml-0.5 p-0.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-current opacity-50 hover:opacity-100 hover:text-red-600 transition-all'>
                      <X className='w-3 h-3' />
                    </button>
                  </span>
                ))
              ) : (
                <p className='text-[12px] text-muted-foreground w-full text-center self-center'>
                  No colors added yet
                </p>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Sizes */}
        <SectionCard>
          <SectionHeader
            icon={<Ruler className='w-3.5 h-3.5' />}
            iconClass='bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
            title='Sizes'
            count={v2Sizes.length}
            badgeClass='bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
          />
          <div className='p-3.5 space-y-3'>
            {/* Input row */}
            <div className='flex gap-2'>
              <Input
                placeholder='e.g. S, M, L, XL…'
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSize();
                  }
                }}
                className='flex-1 h-9 text-sm'
              />
              <button
                onClick={addSize}
                disabled={!newSize.trim() || v2Sizes.includes(newSize.trim())}
                className={cn(
                  "h-9 px-3.5 rounded-lg flex items-center gap-1.5 text-sm font-medium",
                  "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all",
                  "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
                )}>
                <Plus className='w-3.5 h-3.5' />
                Add
              </button>
            </div>

            {/* Tags */}
            <div className='flex flex-wrap gap-1.5 min-h-[52px] p-2.5 rounded-lg bg-muted/40 border border-border/40'>
              {v2Sizes.length > 0 ? (
                v2Sizes.map((size) => (
                  <span
                    key={size}
                    className='inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-[12px] font-medium bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-800'>
                    <Ruler className='w-3 h-3 opacity-70' />
                    {size}
                    <button
                      onClick={() => removeSize(size)}
                      aria-label={`Remove ${size}`}
                      className='ml-0.5 p-0.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-current opacity-50 hover:opacity-100 hover:text-red-600 transition-all'>
                      <X className='w-3 h-3' />
                    </button>
                  </span>
                ))
              ) : (
                <p className='text-[12px] text-muted-foreground w-full text-center self-center'>
                  No sizes added yet
                </p>
              )}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Generated Variations */}
      {formData.variation && formData.variation.length > 0 && (
        <div className='space-y-3'>
          {/* Section header row */}
          <div className='flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/40'>
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center'>
                <Box className='w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300' />
              </div>
              <span className='text-sm font-medium'>Generated variations</span>
            </div>
            <span className='text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'>
              {formData.variation.length}{" "}
              {formData.variation.length === 1 ? "variant" : "variants"}
            </span>
          </div>

          {/* Variation cards grid */}
          <div className='grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
            {formData.variation.map((variation: IVariation, index: number) => (
              <div
                key={variation.id || index}
                className={cn(
                  "group p-3 rounded-xl border border-border/40 bg-background",
                  "hover:border-border/80 hover:shadow-sm transition-all duration-150",
                  "flex flex-col gap-2.5",
                )}>
                {/* Card header */}
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex-1 min-w-0'>
                    <p className='text-[13px] font-medium truncate leading-tight'>
                      {variation.name}
                    </p>
                    <p className='text-[10px] font-mono text-muted-foreground truncate mt-0.5'>
                      {variation.sku}
                    </p>
                  </div>
                  <div className='flex-shrink-0 w-6 h-6 rounded-md bg-muted/60 flex items-center justify-center'>
                    <Package className='w-3.5 h-3.5 text-muted-foreground' />
                  </div>
                </div>

                {/* Fields */}
                {mode === "create" ? (
                  <div
                    className={cn(
                      "grid gap-2",
                      !isSameUnitPrice ? "grid-cols-2" : "grid-cols-1",
                    )}>
                    <div>
                      <FieldLabel icon={<BarChart3 className='w-3 h-3' />}>
                        Stock
                      </FieldLabel>
                      <Input
                        name='quantity'
                        type='number'
                        min='0'
                        value={variation.quantity}
                        onChange={(e) => updateVariationData(index, e)}
                        className='h-8 text-xs px-2.5'
                        placeholder='0'
                      />
                    </div>

                    {!isSameUnitPrice && (
                      <div>
                        <FieldLabel icon={<Tag className='w-3 h-3' />}>
                          Price
                        </FieldLabel>
                        <Input
                          name='unitPrice'
                          type='number'
                          min='0'
                          step='0.01'
                          value={variation.unitPrice}
                          onChange={(e) => updateVariationData(index, e)}
                          className='h-8 text-xs px-2.5'
                          placeholder='0.00'
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {/* Color + Size */}
                    <div className='grid grid-cols-2 gap-2'>
                      <Field
                        icon={<Palette className='w-3 h-3' />}
                        label='Color'>
                        <Input
                          name='color'
                          type='text'
                          disabled
                          value={variation.color}
                          className={fieldInput}
                          placeholder='Color'
                        />
                      </Field>
                      <Field icon={<Ruler className='w-3 h-3' />} label='Size'>
                        <Input
                          name='size'
                          type='text'
                          disabled
                          value={variation.size}
                          className={fieldInput}
                          placeholder='Size'
                        />
                      </Field>
                    </div>

                    <div>
                      <FieldLabel icon={<BarChart3 className='w-3 h-3' />}>
                        Stock (read-only)
                      </FieldLabel>
                      <div className='h-8 flex items-center px-2.5 rounded-lg text-xs font-semibold bg-muted/50 border border-border/40 text-muted-foreground'>
                        {variation.quantity} units
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default V2SimpleVariationManager;
