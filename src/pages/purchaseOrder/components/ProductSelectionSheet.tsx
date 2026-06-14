import { Search, X, Package, Loader2, Plus, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "../../../components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { ProductSearchResponse } from "../types";
import { useIsMobile } from "../../../hooks/use-mobile";
import { cn } from "../../../utils/functions";

const VariantLabel = ({ product }: { product: ProductSearchResponse }) => {
  if (!product.variant) return null;
  const label = [product.variant.color, product.variant.size]
    .filter(Boolean)
    .join(" · ");
  return (
    <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'>
      {label}
    </span>
  );
};

const toQty = (v: any) =>
  typeof v === "number" ? v : parseInt(String(v)) || 0;
const toPrice = (v: any) =>
  typeof v === "number" ? v : parseFloat(String(v)) || 0;
const fmtPrice = (v: number) =>
  v.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

interface ProductSelectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: Array<{ id: string; name: string }>;
  products: ProductSearchResponse[];
  selectedProducts: ProductSearchResponse[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  searching: boolean;
  onAdd: (product: ProductSearchResponse) => void;
}

export function ProductSelectionSheet({
  open,
  onOpenChange,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  products,
  selectedProducts,
  currentPage,
  totalPages,
  totalProducts,
  pageSize,
  onPageChange,
  onPageSizeChange,
  searching,
  onAdd,
}: ProductSelectionSheetProps) {
  const isMobile = useIsMobile();

  // Generate page numbers with ellipsis for large page counts
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pages;
  };

  // Calculate current range
  const startItem = totalProducts > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalProducts);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "flex flex-col p-0 gap-0",
          isMobile
            ? "h-[92vh] w-full max-w-none rounded-t-3xl rounded-b-none"
            : "w-full sm:max-w-2xl overflow-y-auto"
        )}
      >
        {/* Mobile drag handle */}
        {isMobile && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        )}

        {/* Header */}
        <SheetHeader className={cn("px-5 py-4 border-b", isMobile ? "pt-2" : "")}>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className={cn("font-semibold text-slate-900 dark:text-white", isMobile ? "text-lg" : "text-xl")}>
                Add Products
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-400 mt-0.5">
                Search by name, SKU, or ID
              </SheetDescription>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </SheetHeader>

        {/* Search input */}
        <div className="px-5 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-10 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all",
                isMobile ? "h-12 text-base" : "h-9 text-sm"
              )}
              autoFocus
            />
            {searchQuery && (
              <button
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="px-5 py-2 border-b bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-medium">Category:</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-8 text-xs w-48 rounded-lg border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCategory !== "all" && (
                <button
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  onClick={() => setSelectedCategory("all")}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Product List */}
        <ScrollArea className="flex-1">
          <div className={cn("space-y-2", isMobile ? "p-4" : "p-4")}>
            {searching ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                </div>
                <p className="text-sm text-slate-500">Searching products…</p>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="flex items-center justify-between pb-2">
                  <p className="text-xs text-slate-400 font-medium">
                    {totalProducts > 0
                      ? isMobile
                        ? `Page ${currentPage} of ${totalPages}`
                        : `Showing ${startItem} to ${endItem} of ${totalProducts} products`
                      : `${products.length} result${products.length !== 1 ? "s" : ""}`
                    }
                  </p>
                  {selectedProducts.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      <CheckCircle2 className="h-3 w-3" />
                      {selectedProducts.length} selected
                    </span>
                  )}
                </div>

                {products.map((product, index) => {
                  const isSelected = selectedProducts.some((p) =>
                    product.variant?.id
                      ? p.id === product.id && p.variant?.id === product.variant.id
                      : p.id === product.id
                  );

                  return (
                    <div
                      key={`${product.id}-${product.variant?.id || "base"}-${index}`}
                      onClick={() => onAdd(product)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border cursor-pointer transition-all active:scale-[0.98]",
                        isMobile ? "p-3.5" : "p-3",
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800"
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-xl overflow-hidden border bg-slate-50 dark:bg-slate-800 shrink-0 flex items-center justify-center",
                          isMobile ? "h-14 w-14" : "h-11 w-11"
                        )}
                      >
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-5 w-5 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={cn("font-semibold text-slate-900 dark:text-white leading-snug truncate", isMobile ? "text-sm" : "text-sm")}>
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[11px] text-slate-400 font-mono">{product.sku}</span>
                          {product.variant && <VariantLabel product={product} />}
                        </div>
                        {product.unitPrice && (
                          <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                            ৳{fmtPrice(toPrice(product.unitPrice))}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                        ) : (
                          <div className="h-9 w-9 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
                            <Plus className="h-4 w-4 text-slate-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : searchQuery ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Package className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">No results found</p>
                  <p className="text-sm text-slate-400 mt-1">Nothing matched "{searchQuery}"</p>
                </div>
                <button
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">Search products</p>
                  <p className="text-sm text-slate-400 mt-1 max-w-xs">
                    Type a product name, SKU, or ID to find items
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Page info */}
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600 hidden sm:inline">
                  Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                </p>
              </div>

              {/* Pagination controls */}
              <div className="flex items-center justify-center gap-2">
                {/* Page size selector - desktop only */}
                <div className="flex items-center gap-2 hidden md:flex">
                  <span className="text-xs text-slate-600">Per page:</span>
                  <select
                    value={pageSize.toString()}
                    onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
                    className="h-8 w-[70px] rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={searching}
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || searching}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {getPageNumbers().map((page, index) =>
                    page === "..." ? (
                      <span key={`ellipsis-${index}`} className="px-1 text-sm text-slate-500">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(page as number)}
                        disabled={searching}
                        className={cn(
                          "h-8 w-8 p-0",
                          currentPage === page ? "bg-indigo-600 hover:bg-indigo-700" : ""
                        )}
                      >
                        {page}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || searching}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <SheetFooter className="gap-2 px-5 py-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            disabled={selectedProducts.length === 0}
          >
            Add Selected ({selectedProducts.length})
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
