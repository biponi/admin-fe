// Reusable editor for admin-defined product meta data — key/value rows used
// for admin-panel product search (see biponi-express routes/helper/productMeta.js).
// Presentational only: the parent owns state via `value` + `onChange`.
// Keys are trimmed/lowercased and deduped by the backend on save; numeric
// values ("8", "5.5") additionally become range-searchable on the backend.
import { Plus, X } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import type { IMetaEntry } from "../../pages/product/interface";

interface MetaEntriesEditorProps {
  value: IMetaEntry[];
  onChange: (meta: IMetaEntry[]) => void;
  /** Compact styling for embedding in per-variant cards */
  compact?: boolean;
  disabled?: boolean;
  maxEntries?: number;
  addLabel?: string;
}

const rowInput = (compact?: boolean) =>
  compact
    ? "h-8 text-xs bg-background border-border/50 focus-visible:ring-0"
    : "h-10 text-sm border-2 focus:border-indigo-500 transition-colors";

export default function MetaEntriesEditor({
  value,
  onChange,
  compact = false,
  disabled = false,
  maxEntries = 50,
  addLabel = "Add field",
}: MetaEntriesEditorProps) {
  const entries = value || [];

  const updateEntry = (index: number, patch: Partial<IMetaEntry>) => {
    onChange(entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  };

  const removeEntry = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  const addEntry = () => {
    if (entries.length >= maxEntries) return;
    onChange([...entries, { key: "", value: "" }]);
  };

  return (
    <div className='space-y-2'>
      {entries.length > 0 && (
        <div className='space-y-2'>
          {entries.map((entry, index) => (
            <div key={index} className='flex items-center gap-2'>
              <div className='flex-1 space-y-0.5'>
                <Input
                  type='text'
                  value={entry.key || ""}
                  onChange={(e) => updateEntry(index, { key: e.target.value })}
                  disabled={disabled}
                  placeholder='Key (e.g. age, material)'
                  className={rowInput(compact)}
                  maxLength={50}
                />
                {(entry.key || "").length > 40 && (
                  <span className='text-[10px] text-amber-500 font-mono'>
                    {(entry.key || "").length}/50
                  </span>
                )}
              </div>
              <div className='flex-[1.5] space-y-0.5'>
                <Input
                  type='text'
                  value={entry.value || ""}
                  onChange={(e) => updateEntry(index, { value: e.target.value })}
                  disabled={disabled}
                  placeholder='Value (e.g. 5-10y, cotton)'
                  className={rowInput(compact)}
                  maxLength={200}
                />
                {(entry.value || "").length > 160 && (
                  <span className='text-[10px] text-amber-500 font-mono'>
                    {(entry.value || "").length}/200
                  </span>
                )}
              </div>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => removeEntry(index)}
                disabled={disabled}
                className={
                  compact
                    ? "h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                    : "h-10 w-10 p-0 text-slate-400 hover:text-rose-500"
                }
                title='Remove'>
                <X className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={addEntry}
        disabled={disabled || entries.length >= maxEntries}
        className={
          compact
            ? "h-8 text-xs gap-1.5 w-full border-dashed"
            : "h-10 text-sm gap-2 border-dashed"
        }>
        <Plus className='h-3.5 w-3.5' />
        {addLabel}
      </Button>

      {!compact && (
        <p className='text-xs text-slate-400'>
          Custom key-value data for admin search only — not shown on the
          storefront. Numeric values (e.g. "8") can also be filtered by range.
        </p>
      )}
    </div>
  );
}

// Convenience wrapper with a labelled section — used on the product forms' meta tab
export function MetaSection({
  title,
  description,
  value,
  onChange,
  disabled,
}: {
  title: string;
  description?: string;
  value: IMetaEntry[];
  onChange: (meta: IMetaEntry[]) => void;
  disabled?: boolean;
}) {
  return (
    <div className='space-y-2'>
      <div className='space-y-1'>
        <Label className='text-sm font-semibold'>{title}</Label>
        {description && <p className='text-xs text-slate-400'>{description}</p>}
      </div>
      <MetaEntriesEditor value={value} onChange={onChange} disabled={disabled} />
    </div>
  );
}
