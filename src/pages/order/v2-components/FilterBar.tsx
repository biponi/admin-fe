import { useRef, useState, useEffect, useCallback, memo } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import CategoryFilterDropdown from "../../product/components/FilterByCategory";
import type { ICategory } from "../../product/interface";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  selectedBrand: string;
  onBrandChange: (brandId: string) => void;
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
      <div className='relative flex-1 group'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none'>
          <Search
            className={`h-4 w-4 transition-colors duration-150 ${
              value
                ? "text-blue-500"
                : "text-gray-400 group-focus-within:text-blue-500"
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
            w-full h-10 pl-10 pr-9 text-sm rounded-lg border outline-none
            bg-gray-50 border-gray-200 placeholder:text-gray-400
            transition-all duration-150
            focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15
          '
        />

        {value && (
          <button
            type='button'
            // onMouseDown preventDefault stops the input from losing focus
            // before onClick fires
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
            className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors'
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
    categories,
    isLoading = false,
  }: FilterBarProps) => {
    // Track locally whether search has content — for "Clear all" button —
    // without exposing this to SearchInput or causing it to re-render.
    const [hasLocalSearch, setHasLocalSearch] = useState(!!searchQuery);

    const hasActiveFilters =
      hasLocalSearch || !!(selectedCategory && selectedCategory !== "all");

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

    return (
      <div className='sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-1 py-3'>
        <div className='flex items-center gap-2.5'>
          {/* Fully isolated search input — survives any parent re-render */}
          <SearchInput
            initialValue={searchQuery}
            onSearchChange={handleSearchChange}
            onClear={handleClearSearch}
          />

          {/* Category dropdown */}
          <div className='shrink-0'>
            <CategoryFilterDropdown
              categories={categories}
              selectedCategory={selectedCategory || "all"}
              setSelectedCategory={onCategoryChange}
              filterLabel='Category'
              showSearch={true}
              showProductCounts={true}
            />
          </div>

          {/* Loading indicator — spinner near filter, far from input */}
          {isLoading && (
            <div className='shrink-0 flex items-center justify-center h-10 w-10'>
              <svg
                className='animate-spin h-4 w-4 text-blue-400'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'>
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 22 6.477 22 12h-4z'
                />
              </svg>
            </div>
          )}

          {/* Clear all filters */}
          {hasActiveFilters && !isLoading && (
            <button
              type='button'
              onClick={handleClearAll}
              className='
                shrink-0 flex items-center gap-1.5 px-3 h-10 text-xs font-medium rounded-lg
                text-red-500 bg-red-50 border border-red-100
                hover:bg-red-100 hover:border-red-200 transition-all duration-150
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
