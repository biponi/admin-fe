// Bulk meta panel for the variation managers — write meta entries once for an
// attribute value (size / color / all variants) and fan them out to every
// matching variant in form state. One-shot: nothing lingers after apply, the
// per-variant meta stays the source of truth. Backend: keys are trimmed and
// lowercased on save (biponi-express routes/helper/productMeta.js).
import { useEffect, useState } from "react";
import { Wand2, Check, Layers } from "lucide-react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import MetaEntriesEditor from "./MetaEntriesEditor";
import type { IMetaEntry, IVariation } from "../../pages/product/interface";

export type BulkMetaAttribute = "size" | "color" | "all";
export type BulkMetaConflictMode = "merge" | "replace";

// Case-insensitive, trim-tolerant comparison for attribute values AND meta keys
const norm = (s?: string) => (s ?? "").trim().toLowerCase();

// Drop blank-key rows, dedupe by key (last wins), trim key/value
export function sanitizeMetaEntries(entries: IMetaEntry[]): IMetaEntry[] {
  const seen = new Map<string, IMetaEntry>();
  entries.forEach((entry) => {
    const key = (entry?.key ?? "").trim();
    if (!key) return;
    seen.set(norm(key), { key, value: (entry?.value ?? "").trim() });
  });
  return [...seen.values()];
}

// Variants matched by attribute value (or all). Empty values never match a
// picked value — only "All" reaches variants with blank size and color.
export function matchesVariants(
  variations: IVariation[],
  attribute: BulkMetaAttribute,
  value: string,
): IVariation[] {
  if (attribute === "all") return variations;
  if (!value.trim()) return [];
  return variations.filter((v) => norm(v[attribute]) === norm(value));
}

export function applyBulkMeta(
  variations: IVariation[],
  opts: {
    attribute: BulkMetaAttribute;
    value: string;
    entries: IMetaEntry[];
    mode: BulkMetaConflictMode;
  },
): IVariation[] {
  const entries = sanitizeMetaEntries(opts.entries);
  if (entries.length === 0) return variations;

  const matches = matchesVariants(variations, opts.attribute, opts.value);
  if (matches.length === 0) return variations;
  const matchSet = new Set(matches);

  return variations.map((v) => {
    if (!matchSet.has(v)) return v;

    let nextMeta: IMetaEntry[];
    if (opts.mode === "replace") {
      nextMeta = entries.map((e) => ({ ...e }));
    } else {
      // Merge: override same keys in place (position preserved), append new
      nextMeta = (v.meta ?? []).map((e) => ({ ...e }));
      entries.forEach((entry) => {
        const existing = nextMeta.find((e) => norm(e.key) === norm(entry.key));
        if (existing) existing.value = entry.value;
        else nextMeta.push({ ...entry });
      });
    }
    return { ...v, meta: nextMeta };
  });
}

/* ────────────────────────────────────────────────────────────────────────── */

interface BulkVariantMetaPanelProps {
  variations: IVariation[];
  onApply: (updated: IVariation[]) => void;
  disabled?: boolean;
}

const chip = (active: boolean) =>
  `px-3 h-8 rounded-lg text-xs font-medium border transition-all ${
    active
      ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300"
      : "bg-background border-border/50 text-muted-foreground hover:border-border"
  }`;

const BulkVariantMetaPanel: React.FC<BulkVariantMetaPanelProps> = ({
  variations,
  onApply,
  disabled = false,
}) => {
  const [attribute, setAttribute] = useState<BulkMetaAttribute>("size");
  const [value, setValue] = useState("");
  const [draft, setDraft] = useState<IMetaEntry[]>([]);
  const [conflictMode, setConflictMode] = useState<BulkMetaConflictMode>("merge");
  const [appliedHint, setAppliedHint] = useState<string | null>(null);

  // Unique raw spellings per normalized value, first seen wins
  const uniqueValues: string[] = [];
  if (attribute !== "all") {
    const seen = new Set<string>();
    variations.forEach((v) => {
      const raw = (v[attribute] ?? "").trim();
      const key = norm(raw);
      if (!key || seen.has(key)) return;
      seen.add(key);
      uniqueValues.push(raw);
    });
  }

  // Clear a stale selection when the picked value no longer exists
  useEffect(() => {
    if (value && uniqueValues.length > 0 && !uniqueValues.includes(value)) {
      setValue("");
    }
    //eslint-disable-next-line
  }, [attribute, variations]);

  // Transient success hint
  useEffect(() => {
    if (!appliedHint) return;
    const t = setTimeout(() => setAppliedHint(null), 2500);
    return () => clearTimeout(t);
  }, [appliedHint]);

  const matches = matchesVariants(variations, attribute, value);
  const validEntries = sanitizeMetaEntries(draft).length;
  const canApply = !disabled && matches.length > 0 && validEntries > 0;

  const handleApply = () => {
    if (!canApply) return;
    onApply(
      applyBulkMeta(variations, {
        attribute,
        value,
        entries: draft,
        mode: conflictMode,
      }),
    );
    setDraft([]);
    setAppliedHint(String(matches.length));
  };

  const variantLabel = (v: IVariation) =>
    [v.color, v.size].filter(Boolean).join(" - ") || v.sku || "Variant";

  return (
    <div className='rounded-xl border border-border/40 bg-background p-3.5 space-y-3'>
      {/* Header */}
      <div className='flex items-center gap-2'>
        <div className='w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 grid place-items-center'>
          <Wand2 className='w-4 h-4 text-indigo-500' />
        </div>
        <span className='text-sm font-medium'>Bulk meta</span>
        <span className='ml-auto text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground'>
          matches {matches.length} of {variations.length}
        </span>
      </div>

      {/* Target attribute */}
      <div className='flex items-center gap-2'>
        <button
          type='button'
          onClick={() => {
            setAttribute("size");
            setValue("");
          }}
          className={chip(attribute === "size")}>
          Size
        </button>
        <button
          type='button'
          onClick={() => {
            setAttribute("color");
            setValue("");
          }}
          className={chip(attribute === "color")}>
          Color
        </button>
        <button
          type='button'
          onClick={() => setAttribute("all")}
          className={chip(attribute === "all")}>
          All
        </button>
        <Layers className='w-3.5 h-3.5 text-muted-foreground/50 ml-auto' />
      </div>

      {/* Value picker / all hint */}
      {attribute !== "all" ? (
        <Select
          value={value || undefined}
          onValueChange={(v) => setValue(v)}
          disabled={uniqueValues.length === 0}>
          <SelectTrigger className='h-9 text-xs'>
            <SelectValue
              placeholder={
                uniqueValues.length === 0
                  ? `No ${attribute} values on variants`
                  : `Select ${attribute}…`
              }
            />
          </SelectTrigger>
          <SelectContent>
            {uniqueValues.map((v) => (
              <SelectItem key={v} value={v} className='text-xs'>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <p className='text-[11px] text-muted-foreground'>
          Will apply to every variant ({variations.length}).
        </p>
      )}

      {/* Match preview */}
      {matches.length > 0 ? (
        <p className='text-[11px] text-muted-foreground truncate'>
          {matches
            .slice(0, 5)
            .map(variantLabel)
            .join(", ")}
          {matches.length > 5 ? ` +${matches.length - 5} more` : ""}
        </p>
      ) : (
        <p className='text-[11px] text-amber-500'>
          {attribute === "all"
            ? "No variants to apply to."
            : "No variants match this selection."}
        </p>
      )}

      {/* Draft entries */}
      <MetaEntriesEditor
        value={draft}
        onChange={setDraft}
        compact
        addLabel='Add meta'
      />

      {/* Conflict mode + apply */}
      <div className='flex items-center justify-between gap-3 flex-wrap'>
        <div className='flex items-center gap-1.5'>
          <button
            type='button'
            onClick={() => setConflictMode("merge")}
            className={chip(conflictMode === "merge")}>
            Merge
          </button>
          <button
            type='button'
            onClick={() => setConflictMode("replace")}
            className={chip(conflictMode === "replace")}>
            Replace
          </button>
          <span className='text-[10px] text-muted-foreground'>
            {conflictMode === "merge"
              ? "keeps other existing keys"
              : "overwrites all meta"}
          </span>
        </div>
        <Button
          type='button'
          size='sm'
          onClick={handleApply}
          disabled={!canApply}
          className='bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5'>
          <Wand2 className='h-3.5 w-3.5' />
          Apply to {matches.length}
        </Button>
      </div>

      {appliedHint && (
        <p className='text-[11px] font-medium text-emerald-600 flex items-center gap-1'>
          <Check className='h-3 w-3' /> Applied to {appliedHint}{" "}
          {appliedHint === "1" ? "variant" : "variants"}.
        </p>
      )}
    </div>
  );
};

export default BulkVariantMetaPanel;
