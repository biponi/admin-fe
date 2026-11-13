// Mobile meta-data search/filter sheet — mirrors MetaFilterPopover (desktop
// command bar) but in a bottom Drawer, wired to the same hook state so the
// product list refetches through POST /product/search with metaFilters.
import { useEffect, useState } from "react";
import { Table2, X, Search } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "../../../components/ui/drawer";
import { Button } from "../../../components/ui/button";
import {
  EMPTY_META_FILTER,
  type ProductMetaFilter,
} from "../hooks/useProductList";
import { cn } from "../../../lib/utils";

interface MobileMetaFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metaFilter: ProductMetaFilter;
  onMetaFilterChange: (filter: ProductMetaFilter) => void;
  metaSearch: string;
  onMetaSearchChange: (value: string) => void;
  isInactiveView?: boolean;
}

const fieldInput =
  "w-full px-3 py-2.5 text-[13px] rounded-md bg-white text-[#141413] placeholder-slate-400 border border-slate-200 focus:border-[#141413] outline-none transition-colors";

const hasDraft = (draft: ProductMetaFilter, search: string) =>
  !!(draft.key && draft.key.trim()) || !!search.trim();

export function MobileMetaFilterSheet({
  open,
  onOpenChange,
  metaFilter,
  onMetaFilterChange,
  metaSearch,
  onMetaSearchChange,
  isInactiveView = false,
}: MobileMetaFilterSheetProps) {
  // Draft state — applied on "Apply" so we don't refetch per keystroke
  const [draft, setDraft] = useState<ProductMetaFilter>(metaFilter);
  const [draftSearch, setDraftSearch] = useState(metaSearch);

  // Re-sync the draft each time the sheet opens
  useEffect(() => {
    if (open) {
      setDraft(metaFilter);
      setDraftSearch(metaSearch);
    }
    //eslint-disable-next-line
  }, [open]);

  const active = hasDraft(metaFilter, metaSearch);

  const handleApply = () => {
    onMetaFilterChange(draft);
    onMetaSearchChange(draftSearch);
    onOpenChange(false);
  };

  const handleClear = () => {
    setDraft(EMPTY_META_FILTER);
    setDraftSearch("");
    onMetaFilterChange(EMPTY_META_FILTER);
    onMetaSearchChange("");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="flex flex-row items-start justify-between border-b border-slate-200/80 pb-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Filter
            </span>
            <DrawerTitle className="text-base font-semibold text-[#141413]">
              Search by meta data
            </DrawerTitle>
            <DrawerDescription className="mt-0.5 text-xs text-slate-400">
              Find products by custom key/value data
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 shrink-0 rounded-md border border-slate-200 bg-white p-0 text-slate-400 hover:text-[#141413]"
            >
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div
          className="space-y-4 overflow-y-auto bg-white px-4 py-4"
          style={{ maxHeight: "56vh" }}
        >
          {/* Free-text across all meta keys/values */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Text search
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={draftSearch}
                onChange={(e) => setDraftSearch(e.target.value)}
                placeholder="e.g. cotton, 5-10y…"
                className={cn(fieldInput, "pl-8")}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Matches any meta key or value, product or variant level.
            </p>
          </div>

          {/* Key + value / range filter — matches ONE meta entry */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Key filter
            </span>
            <div className="rounded-lg border border-slate-200 bg-white p-2.5 space-y-2">
              <input
                type="text"
                value={draft.key}
                onChange={(e) => setDraft({ ...draft, key: e.target.value })}
                placeholder="Key (e.g. age)"
                className={fieldInput}
              />
              <input
                type="text"
                value={draft.value}
                onChange={(e) => setDraft({ ...draft, value: e.target.value })}
                placeholder="Value contains…"
                className={fieldInput}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  value={draft.min}
                  onChange={(e) => setDraft({ ...draft, min: e.target.value })}
                  placeholder="Min"
                  className={fieldInput}
                />
                <input
                  type="number"
                  inputMode="numeric"
                  value={draft.max}
                  onChange={(e) => setDraft({ ...draft, max: e.target.value })}
                  placeholder="Max"
                  className={fieldInput}
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              Min/Max need numeric meta values (e.g. age = 8). Filters combine
              with the text search above.
            </p>
          </div>

          {/* Active filter preview */}
          {hasDraft(draft, draftSearch) && (
            <div className="flex flex-wrap gap-1.5">
              {draftSearch.trim() && (
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[10px] font-medium text-[#141413]">
                  text: {draftSearch.trim()}
                </span>
              )}
              {draft.key.trim() && (
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[10px] font-medium text-[#141413]">
                  {draft.key.trim()}
                  {draft.value.trim() ? ` ~ ${draft.value.trim()}` : ""}
                  {draft.min.trim() ? ` ≥ ${draft.min.trim()}` : ""}
                  {draft.max.trim() ? ` ≤ ${draft.max.trim()}` : ""}
                </span>
              )}
            </div>
          )}
        </div>

        <DrawerFooter className="flex-row gap-2 border-t border-slate-200/80 bg-white pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {active && (
            <Button
              variant="outline"
              onClick={handleClear}
              className="h-11 flex-1 rounded-xl border-slate-300 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              Clear
            </Button>
          )}
          <Button
            onClick={handleApply}
            disabled={!hasDraft(draft, draftSearch)}
            className={cn(
              "h-11 flex-1 rounded-xl bg-[#141413] text-[13px] font-semibold text-white hover:bg-[#2a2a2a]",
              !active && "flex-[2]",
            )}
          >
            Apply
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
