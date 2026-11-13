// Shared display for admin-defined product meta data (key/value entries) on
// the product list — used by the desktop expandable row and the mobile card
// sheet. Entries live at product level (`meta`) and per-variant
// (`variation[i].meta`); keys are lowercased/deduped server-side
// (backend: biponi-express routes/helper/productMeta.js).
import { Layers, PackageOpen, Tag } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import type { IMetaEntry, IVariation } from "../interface";
import { cn } from "@/pages/order-v2/lib/utils";

// Best-effort human label for a variant (matches the variation chip labels)
export const variationLabel = (v: IVariation): string =>
  v.name ||
  v.title ||
  [v.color, v.size].filter(Boolean).join(" · ") ||
  v.sku ||
  "Variant";

export const hasAnyMeta = (p: {
  meta?: IMetaEntry[];
  variation?: IVariation[];
}): boolean => !!p.meta?.length || !!p.variation?.some((v) => v.meta?.length);

export const countMetaEntries = (p: {
  meta?: IMetaEntry[];
  variation?: IVariation[];
}): number =>
  (p.meta?.length ?? 0) +
  (p.variation?.reduce((n, v) => n + (v.meta?.length ?? 0), 0) ?? 0);

// Single key=value chip — same vocabulary as MetaFilterPopover's badges
export const MetaEntryBadge = ({ entry }: { entry: IMetaEntry }) => (
  <Badge
    variant='secondary'
    className='text-[10px] font-mono gap-1 max-w-[220px]'>
    <span className='font-semibold text-zinc-700'>{entry.key}</span>
    {entry.value && (
      <span className='truncate font-normal text-zinc-500'>{entry.value}</span>
    )}
  </Badge>
);

// Stock tone for a variant — same thresholds as VariationChip in the list
const qtyTone = (qty: number) => {
  if (qty <= 0)
    return {
      text: "Out of stock",
      cls: "bg-red-50 text-red-600",
      dot: "bg-red-500",
    };
  if (qty <= 5)
    return {
      text: `${qty} left`,
      cls: "bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
    };
  return {
    text: `${qty} in stock`,
    cls: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  };
};

// Section heading style
const labelCls =
  "text-[10px] font-semibold uppercase tracking-wide text-zinc-400";

// White card container so sections read clearly on the zinc-50 sub-row / sheet
const sectionCard =
  "rounded-sm border border-zinc-200/70 bg-white px-3.5 py-2 shadow-sm";

// Section header for one variant: label + SKU + stock pill + entry count
const VariantHeader = ({ variant }: { variant: IVariation }) => {
  const tone = qtyTone(variant.quantity ?? 0);
  return (
    <div className='flex items-center gap-2 flex-wrap '>
      <span className='text-[12px] font-bold text-zinc-900 leading-none'>
        {variationLabel(variant)}
      </span>

      <span
        className={`inline-flex ml-auto items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none ${tone.cls}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
        {tone.text}
      </span>
    </div>
  );
};

interface ProductMetaDetailProps {
  meta?: IMetaEntry[];
  variationList?: IVariation[];
}

/* -------------------------------------------------------------------------- */
/*  Shared styles                                                             */
/* -------------------------------------------------------------------------- */

// // White card on the warm sheet body
// const sectionCard =
//   "rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-slate-200/80";

// const labelCls =
//   "text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500";

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                     */
/* -------------------------------------------------------------------------- */

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  label: string;
  count?: number;
}> = ({ icon, label, count }) => (
  <div className='mb-3 flex items-center gap-2'>
    <span className='flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600'>
      {icon}
    </span>
    <p className={labelCls}>{label}</p>
    {typeof count === "number" && (
      <span className='ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600'>
        {count} {count === 1 ? "entry" : "entries"}
      </span>
    )}
  </div>
);

// Expanded panel: product-level entries + one card per variant that has meta
// (chips wrap; two-up variant grid on wide screens).
/* -------------------------------------------------------------------------- */
/*  ProductMetaDetail                                                         */
/* -------------------------------------------------------------------------- */

export const ProductMetaDetail = ({
  meta,
  variationList,
  className,
}: ProductMetaDetailProps & { className?: string }) => {
  const variantsWithMeta = (variationList ?? []).filter((v) => v.meta?.length);

  if (!meta?.length && variantsWithMeta.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 px-6 py-14 text-center'>
        <span className='flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400'>
          <PackageOpen className='h-7 w-7' strokeWidth={1.75} />
        </span>
        <div>
          <p className='text-[14px] font-semibold text-slate-700'>
            No meta data
          </p>
          <p className='mt-0.5 text-[12.5px] text-slate-400'>
            This product has no meta entries yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    // Pass className='p-0' when the parent already provides padding (e.g. inside the sheet)
    <div className={cn("space-y-5", className ?? "py-3.5 pl-10 pr-4")}>
      {/* Product-level meta */}
      {meta?.length ? (
        <section className={sectionCard}>
          <div className='flex flex-wrap gap-2'>
            {meta.map((entry, i) => (
              <MetaEntryBadge key={`${entry.key}-${i}`} entry={entry} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Variant-level meta */}
      {variantsWithMeta.length > 0 && (
        <section>
          <div className='mb-3 flex items-center gap-2 px-0.5'>
            <span className='flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600'>
              <Layers className='h-3.5 w-3.5' strokeWidth={2.25} />
            </span>
            <p className={labelCls}>Variant Meta</p>
            <span className='ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600'>
              {variantsWithMeta.length}{" "}
              {variantsWithMeta.length === 1 ? "variant" : "variants"}
            </span>
          </div>

          <div className=' grid grid-cols-2 gap-2 sm:grid-cols-4'>
            {variantsWithMeta.map((v, vi) => (
              <div
                key={v.id ?? `variant-${vi}`}
                className={cn(sectionCard, "relative overflow-hidden")}>
                {/* accent rail */}
                <span
                  aria-hidden='true'
                  className='absolute inset-y-0 left-0 w-1 bg-amber-400/80'
                />
                <div className='mb-1 border-b border-dashed border-slate-200 pb-1'>
                  <VariantHeader variant={v} />
                </div>
                <div className='flex flex-wrap gap-2'>
                  {v.meta!.map((entry, i) => (
                    <MetaEntryBadge key={`${entry.key}-${i}`} entry={entry} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
