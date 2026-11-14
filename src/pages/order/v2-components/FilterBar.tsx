import { useRef, useState, useEffect, useCallback, memo, useMemo } from "react";
import { Search, X, SlidersHorizontal, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import CategoryFilterDropdown from "../../product/components/FilterByCategory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ORDER_SORT_FIELDS,
  getSortFieldLabel,
} from "../createOrderLayoutStore";
import type { OrderSortField, OrderSortOrder } from "../createOrderLayoutStore";
import type { ICategory } from "../../product/interface";
import { Dots } from "@/components/loading-ui/dots";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  selectedBrand: string;
  onBrandChange: (brandId: string) => void;
  sortBy: OrderSortField;
  onSortChange: (field: OrderSortField) => void;
  sortOrder: OrderSortOrder;
  onSortOrderChange: (order: OrderSortOrder) => void;
  categories: ICategory[];
  brands: Array<{ id: string; name: string }>;
  isLoading?: boolean;
}

// ─── SearchInput: completely isolated from parent re-renders ─────────────────
//
// Design principle:
//   The input owns its own value in local state.
//   The parent's `searchQuery` prop is only used as the initial value,
//   and as a reset signal (when it becomes "").
//   `isLoading` is deliberately NOT passed here — disabling the input during
//   loading causes the browser to drop focus, which is the flicker bug.
//
const SearchInput = memo(
  ({
    initialValue,
    onSearchChange,
    onClear,
  }: {
    initialValue: string;
    onSearchChange: (v: string) => void;
    onClear: () => void;
  }) => {
    const [value, setValue] = useState(initialValue);

    // Store callback in ref — updating a ref never triggers a re-render,
    // so even if the parent passes a new function reference, SearchInput
    // does not re-render.
    const callbackRef = useRef(onSearchChange);
    const onClearRef = useRef(onClear);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      callbackRef.current = onSearchChange;
    });
    useEffect(() => {
      onClearRef.current = onClear;
    });

    // Reset signal from parent (e.g. "Clear all" button sets searchQuery → "")
    useEffect(() => {
      if (initialValue === "" && value !== "") {
        setValue("");
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValue]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value;
        setValue(next);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          callbackRef.current(next);
        }, 450);
      },
      [],
    ); // zero deps = completely stable, never causes re-render

    const handleClear = useCallback(() => {
      setValue("");
      if (timerRef.current) clearTimeout(timerRef.current);
      callbackRef.current("");
      onClearRef.current();
      // Restore focus explicitly after clearing
      requestAnimationFrame(() => inputRef.current?.focus());
    }, []);

    return (
      <div className='relative flex-1 min-w-[12rem] group'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none'>
          <Search
            className={`h-4 w-4 transition-colors duration-150 ${
              value
                ? "text-primary"
                : "text-muted-foreground/70 group-focus-within:text-primary"
            }`}
          />
        </div>

        <input
          ref={inputRef}
          type='text'
          value={value}
          onChange={handleChange}
          placeholder='Search by name or SKU...'
          // NO disabled prop — disabling causes browser focus drop
          className='
            w-full h-9 pl-10 pr-9 text-sm rounded-md border outline-none
            bg-background border-border placeholder:text-muted-foreground/70 text-foreground
            transition-all duration-150
            focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20
          '
        />

        {value && (
          <button
            type='button'
            // onMouseDown preventDefault stops the input from losing focus
            // before onClick fires
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
            className='absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground/70 hover:text-muted-foreground transition-colors'
            tabIndex={-1}>
            <X className='h-3.5 w-3.5' />
          </button>
        )}
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";

// ─── FilterBar ────────────────────────────────────────────────────────────────
// memo() ensures FilterBar itself only re-renders when its props shallowly change.
// Since SearchInput is a separate memo'd component, even if FilterBar re-renders
// (e.g. selectedCategory changed), SearchInput will NOT re-render and keeps focus.
export const FilterBar = memo(
  ({
    searchQuery,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    selectedBrand,
    onBrandChange,
    sortBy,
    onSortChange,
    sortOrder,
    onSortOrderChange,
    categories,
    isLoading = false,
  }: FilterBarProps) => {
    // Track locally whether search has content — for "Clear all" button —
    // without exposing this to SearchInput or causing it to re-render.
    const [hasLocalSearch, setHasLocalSearch] = useState(!!searchQuery);

    const hasActiveFilters =
      hasLocalSearch || !!(selectedCategory && selectedCategory !== "all");

    // Known sort fields + the env default (if it's a custom value) so the
    // selected option always has a matching entry in the dropdown.
    const sortOptions = useMemo(() => {
      const fields = [...ORDER_SORT_FIELDS];
      if (sortBy && !fields.includes(sortBy)) fields.push(sortBy);
      return fields;
    }, [sortBy]);

    // Wrap onSearchChange to also track local search presence
    const handleSearchChange = useCallback(
      (v: string) => {
        setHasLocalSearch(v.length > 0);
        onSearchChange(v);
      },
      [onSearchChange],
    );

    const handleClearSearch = useCallback(() => {
      setHasLocalSearch(false);
      onSearchChange("");
    }, [onSearchChange]);

    const handleClearAll = useCallback(() => {
      onCategoryChange("all");
      onBrandChange("all");
      onSearchChange(""); // triggers SearchInput reset via initialValue=""
      setHasLocalSearch(false);
    }, [onCategoryChange, onBrandChange, onSearchChange]);

    const toggleSortOrder = useCallback(() => {
      onSortOrderChange(sortOrder === "asc" ? "desc" : "asc");
    }, [onSortOrderChange, sortOrder]);

    return (
      <div className='sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-0 md:px-1 py-2 md:py-3'>
        <div className='flex flex-wrap items-center gap-2 md:gap-2.5'>
          {/* Fully isolated search input — survives any parent re-render */}
          <SearchInput
            initialValue={searchQuery}
            onSearchChange={handleSearchChange}
            onClear={handleClearSearch}
          />

          {/* Category dropdown — shows selected category on trigger */}
          <div className='shrink-0 w-full sm:w-auto'>
            <CategoryFilterDropdown
              categories={categories}
              selectedCategory={selectedCategory || "all"}
              setSelectedCategory={onCategoryChange}
              filterLabel='Filter by Category'
              showSearch={true}
              showProductCounts={true}
              showSelectionOnTrigger={true}
            />
          </div>

          {/* Sort field select */}
          <div className='shrink-0 w-[calc(50%-0.3125rem)] sm:w-auto'>
            <Select
              value={sortBy}
              onValueChange={(val) => onSortChange(val as OrderSortField)}>
              <SelectTrigger
                className='h-9 rounded-md border-border bg-background text-sm font-medium text-foreground focus-visible:ring-ring sm:w-[11.5rem]'
                title='Sort products by'>
                <ArrowUpDown className='h-4 w-4 shrink-0 text-muted-foreground/70' />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((value) => (
                  <SelectItem key={value} value={value} className='text-sm'>
                    {getSortFieldLabel(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort order toggle */}
          <button
            type='button'
            onClick={toggleSortOrder}
            title={
              sortOrder === "asc"
                ? "Ascending — click for descending"
                : "Descending — click for ascending"
            }
            className='
              shrink-0 flex items-center justify-center h-9 w-9 rounded-md
              border border-border bg-background text-muted-foreground
              hover:bg-muted/50 hover:border-border hover:text-foreground
              transition-all duration-150
            '>
            {sortOrder === "asc" ? (
              <ArrowUp className='h-4 w-4' />
            ) : (
              <ArrowDown className='h-4 w-4' />
            )}
          </button>

          {/* Loading indicator — spinner near filter, far from input */}
          {isLoading && (
            <div className='shrink-0 flex items-center justify-center h-10 w-10'>
              <Dots className='h-4 w-6 text-primary' />
            </div>
          )}

          {/* Clear all filters */}
          {hasActiveFilters && !isLoading && (
            <button
              type='button'
              onClick={handleClearAll}
              className='
                shrink-0 flex items-center gap-1.5 px-3 h-9 text-xs font-medium rounded-md
                text-muted-foreground bg-background border border-border
                hover:bg-muted/50 hover:border-border hover:text-rose-500 transition-all duration-150
              '>
              <SlidersHorizontal className='h-3.5 w-3.5' />
              Clear
            </button>
          )}
        </div>
      </div>
    );
  },
);
FilterBar.displayName = "FilterBar";
