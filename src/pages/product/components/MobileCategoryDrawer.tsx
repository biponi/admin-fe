// Mobile category filter drawer — extracted from productList.tsx so it shares
// the same themed shell as the status/sort/meta sheets.
import { Search, Check, X, FolderTree } from "lucide-react";
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
import { useState } from "react";

interface CategoryOption {
  id: string;
  name: string;
  totalProducts?: number;
}

interface MobileCategoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryOption[];
  selectedCategory: string;
  onSelect: (categoryId: string) => void;
}

export function MobileCategoryDrawer({
  open,
  onOpenChange,
  categories,
  selectedCategory,
  onSelect,
}: MobileCategoryDrawerProps) {
  const [query, setQuery] = useState("");

  const handleSelect = (id: string) => {
    onSelect(id);
    onOpenChange(false);
  };

  const filtered = query.trim()
    ? categories.filter((cat) =>
        cat.name.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : categories;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="flex flex-row items-start justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Filter
            </span>
            <DrawerTitle className="text-base font-semibold text-[#141413]">
              Category
            </DrawerTitle>
            <DrawerDescription className="mt-0.5 text-xs text-slate-400">
              {categories.length} categories
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

        {/* Search within categories */}
        {categories.length > 6 && (
          <div className="border-b border-slate-200/80 bg-white px-4 py-2.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search categories…"
                className="h-10 w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 text-[13px] text-[#141413] outline-none transition-colors placeholder:text-slate-400 focus:border-[#141413]"
              />
            </div>
          </div>
        )}

        <div
          className="overflow-y-auto bg-white px-3 py-3"
          style={{ maxHeight: "48vh" }}
        >
          <div className="space-y-1.5">
            {/* All categories */}
            <button
              onClick={() => handleSelect("")}
              className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-3 text-[13px] font-medium transition-colors ${
                !selectedCategory
                  ? "border-[#141413] bg-white text-[#141413]"
                  : "border-slate-200 bg-white text-slate-600 active:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    !selectedCategory
                      ? "border-[#141413] bg-[#141413] text-white"
                      : "border-slate-300"
                  }`}
                >
                  {!selectedCategory && (
                    <Check className="h-3 w-3" strokeWidth={3} />
                  )}
                </span>
                All categories
              </span>
            </button>

            {filtered.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelect(cat.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3.5 py-3 text-[13px] font-medium transition-colors ${
                    isSelected
                      ? "border-[#141413] bg-white text-[#141413]"
                      : "border-slate-200 bg-white text-slate-600 active:bg-slate-50"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        isSelected
                          ? "border-[#141413] bg-[#141413] text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {isSelected && (
                        <Check className="h-3 w-3" strokeWidth={3} />
                      )}
                    </span>
                    <span className="truncate">{cat.name}</span>
                  </span>
                  {!!cat.totalProducts && cat.totalProducts > 0 && (
                    <span className="shrink-0 rounded-md border border-slate-200 bg-white px-1.5 py-px text-[11px] font-semibold text-slate-500">
                      {cat.totalProducts}
                    </span>
                  )}
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <FolderTree className="h-4 w-4 text-slate-400" />
                </div>
                <p className="text-[13px] text-slate-500">
                  No categories match "{query}"
                </p>
              </div>
            )}
          </div>
        </div>

        <DrawerFooter className="border-t border-slate-200/80 bg-white pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <DrawerClose asChild>
            <Button className="h-11 w-full rounded-xl bg-[#141413] text-[13px] font-semibold text-white hover:bg-[#2a2a2a]">
              Done
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
