// Mobile product search overlay — floats above the bottom nav and rides the
// keyboard via visualViewport. Themed to the product-list design language and
// adds two things the generic keyboard search lacked: live result count while
// typing and persisted recent searches (tap a chip to re-run it).
import { useEffect, useRef, useState } from "react";
import { Check, History, Search, X, XCircle } from "lucide-react";
import { Dots } from "@/components/loading-ui/dots";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const RECENTS_KEY = "productSearchRecents";
const MAX_RECENTS = 5;

const loadRecents = (): string[] => {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
};

interface MobileProductSearchProps {
  open: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClose: () => void;
  /** Number of products currently matching (the visible grid count). */
  resultCount?: number;
  /** True while the debounced query hasn't landed yet. */
  isSearching?: boolean;
}

export function MobileProductSearch({
  open,
  searchValue,
  onSearchChange,
  onClose,
  resultCount,
  isSearching = false,
}: MobileProductSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [recents, setRecents] = useState<string[]>(loadRecents);

  useEffect(() => {
    if (!open) return;

    const updateKeyboardOffset = () => {
      const viewport = window.visualViewport;

      if (!viewport) {
        setKeyboardOffset(0);
        return;
      }

      const offset = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );

      setKeyboardOffset(offset);
    };

    updateKeyboardOffset();
    window.visualViewport?.addEventListener("resize", updateKeyboardOffset);
    window.visualViewport?.addEventListener("scroll", updateKeyboardOffset);
    window.addEventListener("resize", updateKeyboardOffset);

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 80);

    return () => {
      window.clearTimeout(focusTimer);
      window.visualViewport?.removeEventListener("resize", updateKeyboardOffset);
      window.visualViewport?.removeEventListener("scroll", updateKeyboardOffset);
      window.removeEventListener("resize", updateKeyboardOffset);
    };
  }, [open]);

  const saveRecent = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const next = [trimmed, ...recents.filter((r) => r !== trimmed)].slice(
      0,
      MAX_RECENTS,
    );
    setRecents(next);
    try {
      localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable — recents just won't persist
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed left-0 right-0 z-[60] px-3 transition-[bottom] duration-200 sm:hidden"
      style={{
        bottom: keyboardOffset > 0 ? keyboardOffset + 8 : 88,
      }}
    >
      <div className="mx-auto max-w-md">
        <form
          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_16px_40px_rgba(20,20,19,0.2)]"
          onSubmit={(event) => {
            event.preventDefault();
            saveRecent(searchValue);
            inputRef.current?.blur();
          }}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl text-slate-400 hover:text-[#141413]"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              ref={inputRef}
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search name, SKU, category…"
              inputMode="search"
              enterKeyHint="search"
              className="h-11 rounded-xl border-slate-200 pl-9 pr-9 text-base focus:border-[#141413]"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <XCircle className="h-4 w-4 text-slate-400" />
              </button>
            )}
          </div>

          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl bg-[#141413] text-white hover:bg-[#2a2a2a]"
          >
            <Check className="h-5 w-5" strokeWidth={2.5} />
          </Button>
        </form>

        {/* Status strip — live result count while typing */}
        {searchValue && (
          <div className="mt-2 flex items-center justify-center gap-1.5">
            {isSearching ? (
              <>
                <Dots className='h-4 w-6 text-slate-400' />
                <span className="text-[11px] font-medium text-slate-400">
                  Searching…
                </span>
              </>
            ) : (
              <span className="rounded-full border border-slate-200 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#141413] shadow-sm backdrop-blur">
                {resultCount ?? 0} result{(resultCount ?? 0) === 1 ? "" : "s"}
              </span>
            )}
          </div>
        )}

        {/* Recent searches — shown while the query is empty */}
        {!searchValue && recents.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 pr-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <History className="h-3 w-3" />
              Recent
            </span>
            {recents.map((term) => (
              <button
                key={term}
                onClick={() => onSearchChange(term)}
                className="max-w-[160px] truncate rounded-full border border-slate-200 bg-white/95 px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-sm backdrop-blur transition active:scale-95"
              >
                {term}
              </button>
            ))}
            <button
              onClick={() => {
                setRecents([]);
                try {
                  localStorage.removeItem(RECENTS_KEY);
                } catch {
                  // ignore
                }
              }}
              className={cn(
                "rounded-full px-2 py-1 text-[11px] font-medium text-slate-400",
                "hover:text-rose-500",
              )}
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
