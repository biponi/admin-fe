import React, { Fragment, useEffect, useState } from "react";
import {
  searchProducts,
  createPurchaseOrder,
} from "./services/purchaseOrderApi";
import { ProductSearchResponse } from "./types";
import { getAllCategory } from "../../api/product";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription } from "../../components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Dialog, DialogContent, DialogTitle } from "../../components/ui/dialog";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import useDebounce from "../../customHook/useDebounce";
import { useIsMobile } from "../../hooks/use-mobile";
import { cn } from "../../utils/functions";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Package,
  ShoppingCart,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";
import MainView from "../../coreComponents/mainView";
import axios from "axios";

/* ─── helpers ─── */
const toQty = (v: any) =>
  typeof v === "number" ? v : parseInt(String(v)) || 0;
const toPrice = (v: any) =>
  typeof v === "number" ? v : parseFloat(String(v)) || 0;
const fmtPrice = (v: number) =>
  v.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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

/* ─── Mobile Product Card (App-style) ─── */
interface ProductRowProps {
  product: ProductSearchResponse;
  index: number;
  onQtyChange: (i: number, v: string) => void;
  onQtyInc: (i: number) => void;
  onQtyDec: (i: number) => void;
  onPriceChange: (i: number, v: string) => void;
  onRemove: (i: number) => void;
}

const MobileProductCard: React.FC<ProductRowProps> = ({
  product,
  index,
  onQtyChange,
  onQtyInc,
  onQtyDec,
  onPriceChange,
  onRemove,
}) => {
  const qty = toQty(product.quantity);
  const price = toPrice(product.unitPrice);
  const lineTotal = qty * price;

  return (
    <div className='bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800'>
      {/* Product info row */}
      <div className='flex items-center gap-3 px-4 pt-4 pb-3'>
        <div className='h-14 w-14 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 shrink-0 flex items-center justify-center'>
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className='w-full h-full object-cover'
            />
          ) : (
            <Package className='h-6 w-6 text-slate-400' />
          )}
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2'>
            {product.name}
          </p>
          <div className='flex items-center gap-2 mt-1'>
            <span className='text-[11px] font-mono text-slate-400'>
              {product.sku}
            </span>
            <VariantLabel product={product} />
          </div>
        </div>
        <Button
          variant='destructive'
          size='icon'
          onClick={() => onRemove(index)}
          className=''>
          <Trash2 className='h-5 w-5 ' />
        </Button>
      </div>

      {/* Divider */}
      <div className='mx-4 h-px bg-slate-100 dark:bg-slate-800' />

      {/* Controls row */}
      <div className='flex items-center gap-3 px-4 py-3'>
        {/* Qty stepper */}
        <div className='flex items-center gap-0 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800'>
          <button
            disabled={qty <= 0}
            onClick={() => onQtyDec(index)}
            className='h-10 w-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 active:scale-90 transition-all'>
            <Minus className='h-3.5 w-3.5' />
          </button>
          <input
            type='text'
            value={product.quantity || ""}
            onChange={(e) => onQtyChange(index, e.target.value)}
            className='w-12 h-10 text-center text-sm font-bold bg-transparent text-slate-900 dark:text-white outline-none'
            placeholder='0'
          />
          <button
            onClick={() => onQtyInc(index)}
            className='h-10 w-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-90 transition-all'>
            <Plus className='h-3.5 w-3.5' />
          </button>
        </div>

        {/* Price input */}
        <div className='flex-1 relative'>
          <span className='absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400'>
            ৳
          </span>
          <input
            type='text'
            value={product.unitPrice || ""}
            onChange={(e) => onPriceChange(index, e.target.value)}
            className='w-full h-10 pl-7 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all'
            placeholder='0.00'
          />
        </div>
      </div>

      <div className='gap-2 px-4 pb-4 pt-1.5 bg-slate-50 dark:bg-slate-800'>
        {/* Line total */}
        {lineTotal > 0 && (
          <div className='text-right shrink-0 flex items-center justify-between '>
            <p className='text-xs font-medium text-slate-400 mb-0.5'>Total</p>
            <p className='text-sm font-bold text-slate-900 dark:text-white tabular-nums'>
              ৳{fmtPrice(lineTotal)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Desktop Product Row (unchanged structure, refined style) ─── */
const ProductRow: React.FC<ProductRowProps> = ({
  product,
  index,
  onQtyChange,
  onQtyInc,
  onQtyDec,
  onPriceChange,
  onRemove,
}) => {
  const qty = toQty(product.quantity);
  const price = toPrice(product.unitPrice);
  const lineTotal = qty * price;

  return (
    <TableRow className='group hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors'>
      <TableCell>
        <div className='flex items-center gap-3'>
          <div className='h-9 w-9 rounded-lg overflow-hidden border bg-slate-50 shrink-0 flex items-center justify-center'>
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className='w-full h-full object-cover'
              />
            ) : (
              <Package className='h-4 w-4 text-slate-400' />
            )}
          </div>
          <div className='min-w-0'>
            <p className='text-sm font-medium leading-tight truncate max-w-[180px]'>
              {product.name}
            </p>
            <p className='text-xs text-slate-400 font-mono mt-0.5'>
              {product.sku}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <VariantLabel product={product} />
      </TableCell>
      <TableCell>
        <div className='flex items-center gap-1'>
          <Button
            variant='outline'
            size='icon'
            className='h-7 w-7'
            disabled={qty <= 0}
            onClick={() => onQtyDec(index)}>
            <Minus className='h-3 w-3' />
          </Button>
          <Input
            type='text'
            value={product.quantity || ""}
            onChange={(e) => onQtyChange(index, e.target.value)}
            className='w-14 h-7 text-center text-sm font-medium px-1'
            placeholder='0'
          />
          <Button
            variant='outline'
            size='icon'
            className='h-7 w-7'
            onClick={() => onQtyInc(index)}>
            <Plus className='h-3 w-3' />
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className='relative'>
          <span className='absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400'>
            ৳
          </span>
          <Input
            type='text'
            value={product.unitPrice || ""}
            onChange={(e) => onPriceChange(index, e.target.value)}
            className='pl-6 h-7 w-28 text-sm font-medium'
            placeholder='0.00'
          />
        </div>
      </TableCell>
      <TableCell className='text-right'>
        <span
          className={cn(
            "text-sm font-medium tabular-nums",
            lineTotal > 0 ? "text-slate-900 dark:text-white" : "text-slate-400",
          )}>
          ৳{fmtPrice(lineTotal)}
        </span>
      </TableCell>
      <TableCell>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => onRemove(index)}
          className='h-7 w-7 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all'>
          <Trash2 className='h-3.5 w-3.5' />
        </Button>
      </TableCell>
    </TableRow>
  );
};

/* ─── Mobile Search Bottom Sheet ─── */
interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  categories: Array<{ id: string; name: string }>;
  products: ProductSearchResponse[];
  selectedProducts: ProductSearchResponse[];
  searching: boolean;
  onAdd: (p: ProductSearchResponse) => void;
  isMobile: boolean;
}

const ProductSearchDialog: React.FC<SearchDialogProps> = ({
  open,
  onClose,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  products,
  selectedProducts,
  searching,
  onAdd,
  isMobile,
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent
      className={cn(
        "gap-0 p-0 overflow-hidden flex flex-col",
        isMobile
          ? "max-w-full w-full h-[92vh] m-0 rounded-t-3xl rounded-b-none fixed bottom-0 top-auto translate-y-0 translate-x-0 left-0 right-0"
          : "max-w-2xl max-h-[80vh]",
      )}>
      {/* Mobile drag handle */}
      {isMobile && (
        <div className='flex justify-center pt-3 pb-1'>
          <div className='w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700' />
        </div>
      )}

      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between border-b",
          isMobile ? "px-5 py-4" : "px-5 py-4",
        )}>
        <div>
          <DialogTitle
            className={cn(
              "font-semibold text-slate-900 dark:text-white",
              isMobile ? "text-lg" : "text-base",
            )}>
            Add Products
          </DialogTitle>
          <p className='text-xs text-slate-400 mt-0.5'>
            Search by name, SKU, or ID
          </p>
        </div>
        <button
          onClick={onClose}
          className='h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors'>
          <X className='h-4 w-4' />
        </button>
      </div>

      {/* Search input */}
      <div className='px-5 py-3 border-b'>
        <div className='relative'>
          <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
          <input
            placeholder='Search products…'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-10 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all",
              isMobile ? "h-12 text-base" : "h-9 text-sm",
            )}
            autoFocus
          />
          {searchQuery && (
            <button
              className='absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700'
              onClick={() => setSearchQuery("")}>
              <X className='h-4 w-4' />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className='px-5 py-2 border-b bg-slate-50/50 dark:bg-slate-900/50'>
          <div className='flex items-center gap-2'>
            <label className='text-xs text-slate-500 font-medium'>
              Category:
            </label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}>
              <SelectTrigger className='h-8 text-xs w-48 rounded-lg border-slate-200 dark:border-slate-700'>
                <SelectValue placeholder='All Categories' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCategory !== "all" && (
              <button
                className='text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                onClick={() => setSelectedCategory("all")}>
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      <ScrollArea className='flex-1'>
        <div className={cn("space-y-2", isMobile ? "p-4" : "p-4")}>
          {searching ? (
            <div className='flex flex-col items-center justify-center py-20 gap-3'>
              <div className='h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center'>
                <Loader2 className='h-6 w-6 animate-spin text-indigo-500' />
              </div>
              <p className='text-sm text-slate-500'>Searching products…</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className='flex items-center justify-between pb-2'>
                <p className='text-xs text-slate-400 font-medium'>
                  {products.length} result{products.length !== 1 ? "s" : ""}
                </p>
                {selectedProducts.length > 0 && (
                  <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'>
                    <CheckCircle2 className='h-3 w-3' />
                    {selectedProducts.length} selected
                  </span>
                )}
              </div>
              {products.map((product, index) => {
                const isSelected = selectedProducts.some((p) =>
                  product.variant?.id
                    ? p.id === product.id &&
                      p.variant?.id === product.variant.id
                    : p.id === product.id,
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
                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700",
                    )}>
                    <div
                      className={cn(
                        "rounded-xl overflow-hidden border bg-slate-50 dark:bg-slate-800 shrink-0 flex items-center justify-center",
                        isMobile ? "h-14 w-14" : "h-11 w-11",
                      )}>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <Package className='h-5 w-5 text-slate-400' />
                      )}
                    </div>

                    <div className='flex-1 min-w-0'>
                      <p
                        className={cn(
                          "font-semibold text-slate-900 dark:text-white leading-snug truncate",
                          isMobile ? "text-sm" : "text-sm",
                        )}>
                        {product.name}
                      </p>
                      <div className='flex items-center gap-2 mt-1 flex-wrap'>
                        <span className='text-[11px] text-slate-400 font-mono'>
                          {product.sku}
                        </span>
                        {product.variant && <VariantLabel product={product} />}
                      </div>
                      {product.unitPrice && (
                        <p className='text-sm font-bold text-slate-900 dark:text-white mt-1'>
                          ৳{fmtPrice(toPrice(product.unitPrice))}
                        </p>
                      )}
                    </div>

                    <div className='shrink-0'>
                      {isSelected ? (
                        <div className='h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center'>
                          <CheckCircle2 className='h-4 w-4 text-white' />
                        </div>
                      ) : (
                        <div className='h-9 w-9 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center'>
                          <Plus className='h-4 w-4 text-slate-400' />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          ) : searchQuery ? (
            <div className='flex flex-col items-center justify-center py-20 gap-4 text-center'>
              <div className='h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center'>
                <Package className='h-8 w-8 text-slate-400' />
              </div>
              <div>
                <p className='text-base font-semibold text-slate-900 dark:text-white'>
                  No results found
                </p>
                <p className='text-sm text-slate-400 mt-1'>
                  Nothing matched "{searchQuery}"
                </p>
              </div>
              <button
                className='px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'
                onClick={() => setSearchQuery("")}>
                Clear search
              </button>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-20 gap-4 text-center'>
              <div className='h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center'>
                <Search className='h-8 w-8 text-slate-400' />
              </div>
              <div>
                <p className='text-base font-semibold text-slate-900 dark:text-white'>
                  Search products
                </p>
                <p className='text-sm text-slate-400 mt-1 max-w-xs'>
                  Type a product name, SKU, or ID to find items
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
);

/* ─── Main component ─── */
const CreatePurchaseOrder: React.FC = () => {
  const isMobile = useIsMobile();
  const [products, setProducts] = useState<ProductSearchResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [selectedProducts, setSelectedProducts] = useState<
    ProductSearchResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  const debounce = useDebounce(searchQuery, 500);

  // Fetch categories on mount
  useEffect(() => {
    getAllCategory()
      .then((res) => {
        if (res.success && res.data) {
          const cats = res.data.map((cat: any) => ({
            id: cat.id || cat._id,
            name: cat.name,
          }));
          setCategories(cats);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch categories:", error);
      });
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setSearching(true);
      searchProducts(searchQuery, selectedCategory === "all" ? undefined : selectedCategory)
        .then((res) => {
          setProducts([...res]);
          setSearching(false);
        })
        .catch((error) => {
          if (axios.isAxiosError(error))
            toast.error(error.response?.data?.message ?? "Search failed");
          else toast.error("Something went wrong.");
          setSearching(false);
        });
    } else {
      setProducts([]);
    }
    // eslint-disable-next-line
  }, [debounce, selectedCategory]);

  const handleAddProduct = React.useCallback(
    (product: ProductSearchResponse) => {
      setSelectedProducts((prev) => {
        const existing = prev.find((p) =>
          product.variant?.id
            ? p.id === product.id && p.variant?.id === product.variant.id
            : p.id === product.id,
        );
        if (existing) {
          toast.success(`Quantity updated for ${product.name}`);
          return prev.map((p) =>
            (p.id === product.id && p.variant?.id === product.variant?.id) ||
            (!p.variant && !product.variant && p.id === product.id)
              ? { ...p, quantity: p.quantity + 1 }
              : p,
          );
        }
        toast.success(`${product.name} added`);
        return [
          ...prev,
          { ...product, quantity: 1, unitPrice: product.unitPrice },
        ];
      });
    },
    [],
  );

  const handleQtyChange = React.useCallback((i: number, v: string) => {
    if (v === "" || /^\d+$/.test(v))
      setSelectedProducts((prev) =>
        prev.map((p, idx) =>
          idx === i ? { ...p, quantity: v === "" ? 0 : parseInt(v) } : p,
        ),
      );
  }, []);

  const handlePriceChange = React.useCallback((i: number, v: string) => {
    if (v === "" || /^\d*\.?\d*$/.test(v))
      setSelectedProducts((prev) =>
        prev.map((p, idx) =>
          idx === i
            ? { ...p, unitPrice: v === "" ? 0 : parseFloat(v) || 0 }
            : p,
        ),
      );
  }, []);

  const handleQtyInc = React.useCallback(
    (i: number) =>
      setSelectedProducts((prev) =>
        prev.map((p, idx) =>
          idx === i ? { ...p, quantity: (p.quantity || 0) + 1 } : p,
        ),
      ),
    [],
  );

  const handleQtyDec = React.useCallback(
    (i: number) =>
      setSelectedProducts((prev) =>
        prev.map((p, idx) =>
          idx === i
            ? { ...p, quantity: Math.max(0, (p.quantity || 0) - 1) }
            : p,
        ),
      ),
    [],
  );

  const removeProduct = React.useCallback(
    (i: number) => {
      const name = selectedProducts[i].name;
      setSelectedProducts((prev) => prev.filter((_, idx) => idx !== i));
      toast.success(`Removed ${name}`);
    },
    [selectedProducts],
  );

  const handleCreateOrder = () => {
    if (!selectedProducts.length) {
      toast.error("Add at least one product to continue");
      return;
    }
    if (selectedProducts.some((p) => !p.quantity || p.quantity <= 0)) {
      toast.error("All products must have a quantity greater than 0");
      return;
    }
    setLoading(true);
    createPurchaseOrder(selectedProducts)
      .then(() => {
        setLoading(false);
        setSelectedProducts([]);
        toast.success("Purchase order created successfully");
      })
      .catch((error) => {
        if (axios.isAxiosError(error))
          toast.error(
            error.response?.data?.message ?? "Failed to create order",
          );
        else toast.error("Something went wrong.");
        setLoading(false);
      });
  };

  const grandTotal = React.useMemo(
    () =>
      selectedProducts.reduce(
        (sum, p) => sum + toQty(p.quantity) * toPrice(p.unitPrice),
        0,
      ),
    [selectedProducts],
  );

  const totalItems = React.useMemo(
    () => selectedProducts.reduce((sum, p) => sum + (p.quantity || 0), 0),
    [selectedProducts],
  );

  const hasInvalidQty = selectedProducts.some(
    (p) => !p.quantity || p.quantity <= 0,
  );
  const hasMissingPrice = selectedProducts.some((p) => !toPrice(p.unitPrice));

  const sharedRowProps = {
    onQtyChange: handleQtyChange,
    onQtyInc: handleQtyInc,
    onQtyDec: handleQtyDec,
    onPriceChange: handlePriceChange,
    onRemove: removeProduct,
  };

  /* ─── MOBILE LAYOUT ─── */
  if (isMobile) {
    return (
      <MainView title='Create Purchase Order'>
        <Fragment>
          <div className='min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col'>
            {/* App-style top bar */}
            <div className='sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800'>
              <div className='flex items-center gap-3 px-4 py-3'>
                <button className='h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300'>
                  <ArrowLeft className='h-4 w-4' />
                </button>
                <div className='flex-1'>
                  <h1 className='text-base font-bold text-slate-900 dark:text-white leading-tight'>
                    New Purchase Order
                  </h1>
                  <p className='text-xs text-slate-400'>
                    Inventory · Purchase Orders
                  </p>
                </div>
                <button
                  onClick={() => setSearchDialogOpen(true)}
                  className='h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900 active:scale-95 transition-transform'>
                  <Plus className='h-5 w-5' />
                </button>
              </div>
            </div>

            {/* Stats strip */}
            {selectedProducts.length > 0 && (
              <div className='grid grid-cols-3 gap-2 px-4 pt-4'>
                <div className='bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 text-center'>
                  <p className='text-xl font-bold text-slate-900 dark:text-white'>
                    {selectedProducts.length}
                  </p>
                  <p className='text-[10px] text-slate-400 font-medium mt-0.5'>
                    Products
                  </p>
                </div>
                <div className='bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 text-center'>
                  <p className='text-xl font-bold text-slate-900 dark:text-white'>
                    {totalItems}
                  </p>
                  <p className='text-[10px] text-slate-400 font-medium mt-0.5'>
                    Items
                  </p>
                </div>
                <div className='bg-indigo-600 rounded-2xl p-3 text-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900'>
                  <p className='text-sm font-bold text-white leading-tight tabular-nums'>
                    ৳{fmtPrice(grandTotal)}
                  </p>
                  <p className='text-[10px] text-indigo-200 font-medium mt-0.5'>
                    Total
                  </p>
                </div>
              </div>
            )}

            {/* Products list */}
            <div className='flex-1 px-4 pt-4 pb-32 space-y-3'>
              {selectedProducts.length === 0 ? (
                /* Empty state */
                <div className='flex flex-col items-center justify-center py-20 gap-5 text-center'>
                  <div className='relative'>
                    <div className='h-20 w-20 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-sm'>
                      <ShoppingCart className='h-9 w-9 text-slate-300 dark:text-slate-600' />
                    </div>
                    <div className='absolute -top-1 -right-1 h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center'>
                      <Sparkles className='h-3 w-3 text-white' />
                    </div>
                  </div>
                  <div>
                    <p className='text-lg font-bold text-slate-900 dark:text-white'>
                      Start your order
                    </p>
                    <p className='text-sm text-slate-400 mt-1 max-w-[220px]'>
                      Tap the + button to search and add products
                    </p>
                  </div>
                  <button
                    onClick={() => setSearchDialogOpen(true)}
                    className='flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-200 dark:shadow-indigo-900 active:scale-95 transition-transform'>
                    <Plus className='h-4 w-4' />
                    Add Products
                  </button>
                </div>
              ) : (
                <>
                  <div className='flex items-center justify-between pb-1'>
                    <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide'>
                      Order Items
                    </p>
                    <button
                      onClick={() => setSearchDialogOpen(true)}
                      className='text-xs font-semibold text-indigo-600 dark:text-indigo-400'>
                      + Add more
                    </button>
                  </div>
                  {selectedProducts.map((product, index) => (
                    <MobileProductCard
                      key={product.variant?.id || product.id}
                      product={product}
                      index={index}
                      {...sharedRowProps}
                    />
                  ))}
                </>
              )}

              {/* Validation alerts */}
              {selectedProducts.length > 0 &&
                (hasInvalidQty || hasMissingPrice) && (
                  <div className='space-y-2 pt-1'>
                    {hasInvalidQty && (
                      <div className='flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-2xl px-4 py-3'>
                        <AlertTriangle className='h-4 w-4 text-red-500 shrink-0 mt-0.5' />
                        <p className='text-sm text-red-700 dark:text-red-400'>
                          Some products have a quantity of 0. Update before
                          creating.
                        </p>
                      </div>
                    )}
                    {hasMissingPrice && (
                      <div className='flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-2xl px-4 py-3'>
                        <AlertTriangle className='h-4 w-4 text-amber-500 shrink-0 mt-0.5' />
                        <p className='text-sm text-amber-700 dark:text-amber-400'>
                          Some products are missing prices. Totals may be
                          inaccurate.
                        </p>
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* Sticky bottom bar */}
            {selectedProducts.length > 0 && (
              <div className='fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-4 pb-safe'>
                {/* Order summary */}
                <div className='flex items-center justify-between mb-3 px-1'>
                  <div>
                    <p className='text-xs text-slate-400'>
                      {totalItems} item{totalItems !== 1 ? "s" : ""} ·{" "}
                      {selectedProducts.length} product
                      {selectedProducts.length !== 1 ? "s" : ""}
                    </p>
                    <p className='text-xl font-bold text-slate-900 dark:text-white tabular-nums'>
                      ৳{fmtPrice(grandTotal)}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-[10px] text-slate-400 uppercase tracking-wide font-medium'>
                      Grand Total
                    </p>
                    <p className='text-xs text-green-600 dark:text-green-400 font-medium mt-0.5'>
                      Ready to submit
                    </p>
                  </div>
                </div>
                {/* CTA Button */}
                <button
                  onClick={handleCreateOrder}
                  disabled={loading || hasInvalidQty}
                  className={cn(
                    "w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]",
                    loading || hasInvalidQty
                      ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-indigo-900 hover:bg-indigo-700",
                  )}>
                  {loading ? (
                    <>
                      <Loader2 className='h-5 w-5 animate-spin' />
                      Creating order…
                    </>
                  ) : (
                    <>
                      <FileText className='h-5 w-5' />
                      Create Purchase Order
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <ProductSearchDialog
            open={searchDialogOpen}
            onClose={() => setSearchDialogOpen(false)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            products={products}
            selectedProducts={selectedProducts}
            searching={searching}
            onAdd={handleAddProduct}
            isMobile={isMobile}
          />
        </Fragment>
      </MainView>
    );
  }

  /* ─── DESKTOP LAYOUT (refined) ─── */
  return (
    <MainView title='Create Purchase Order'>
      <Fragment>
        <div className='container mx-auto px-6 py-6 max-w-6xl space-y-5'>
          {/* Page header */}
          <div className='flex items-start justify-between gap-4'>
            <div>
              <div className='flex items-center gap-1.5 text-slate-400 text-xs mb-1.5'>
                <span>Inventory</span>
                <ChevronRight className='h-3 w-3' />
                <span className='text-slate-700 dark:text-slate-300 font-medium'>
                  Purchase Orders
                </span>
              </div>
              <h1 className='text-xl font-bold text-slate-900 dark:text-white'>
                New Purchase Order
              </h1>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='gap-1.5'
                onClick={() => setSearchDialogOpen(true)}>
                <Plus className='h-3.5 w-3.5' /> Add products
              </Button>
              <Button
                size='sm'
                onClick={handleCreateOrder}
                disabled={loading || !selectedProducts.length}
                className='gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white'>
                {loading ? (
                  <>
                    <Loader2 className='h-3.5 w-3.5 animate-spin' /> Creating…
                  </>
                ) : (
                  <>
                    <FileText className='h-3.5 w-3.5' /> Create order
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Stats */}
          {selectedProducts.length > 0 && (
            <div className='grid grid-cols-3 gap-3'>
              {[
                { label: "Products", value: selectedProducts.length },
                { label: "Total items", value: totalItems },
                {
                  label: "Order value",
                  value: `৳${fmtPrice(grandTotal)}`,
                  highlight: true,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={cn(
                    "rounded-xl border px-4 py-3",
                    s.highlight
                      ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800"
                      : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800",
                  )}>
                  <p className='text-xs text-slate-400 mb-0.5'>{s.label}</p>
                  <p
                    className={cn(
                      "text-lg font-bold tabular-nums",
                      s.highlight
                        ? "text-indigo-700 dark:text-indigo-400"
                        : "text-slate-900 dark:text-white",
                    )}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Table card */}
          <div className='rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden'>
            <div className='flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20'>
              <div className='flex items-center gap-2'>
                <ShoppingCart className='h-4 w-4 text-slate-400' />
                <span className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
                  Order Items
                </span>
                {selectedProducts.length > 0 && (
                  <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'>
                    {selectedProducts.length}
                  </span>
                )}
              </div>
              {selectedProducts.length > 0 && (
                <button
                  className='text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1'
                  onClick={() => setSearchDialogOpen(true)}>
                  <Plus className='h-3 w-3' /> Add more
                </button>
              )}
            </div>

            {selectedProducts.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-16 gap-4 text-center px-4'>
                <div className='h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center'>
                  <Package className='h-7 w-7 text-slate-300 dark:text-slate-600' />
                </div>
                <div>
                  <p className='text-sm font-semibold text-slate-900 dark:text-white'>
                    No products added yet
                  </p>
                  <p className='text-xs text-slate-400 mt-1 max-w-xs'>
                    Search for products to add them to your purchase order
                  </p>
                </div>
                <Button
                  size='sm'
                  variant='outline'
                  className='gap-1.5 mt-1'
                  onClick={() => setSearchDialogOpen(true)}>
                  <Plus className='h-3.5 w-3.5' /> Add products
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className='bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50/50 dark:hover:bg-slate-800/20'>
                    <TableHead className='text-xs font-semibold text-slate-500 w-[280px]'>
                      Product
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-slate-500'>
                      Variant
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-slate-500'>
                      Quantity
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-slate-500'>
                      Unit price
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-slate-500 text-right'>
                      Total
                    </TableHead>
                    <TableHead className='w-10' />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedProducts.map((product, index) => (
                    <ProductRow
                      key={product.variant?.id || product.id}
                      product={product}
                      index={index}
                      {...sharedRowProps}
                    />
                  ))}
                </TableBody>
              </Table>
            )}

            {selectedProducts.length > 0 && (
              <>
                <Separator />
                <div className='px-5 py-4 flex justify-end'>
                  <div className='space-y-2 min-w-[240px]'>
                    <div className='flex justify-between text-xs text-slate-400'>
                      <span>Subtotal ({totalItems} items)</span>
                      <span className='tabular-nums'>
                        ৳{fmtPrice(grandTotal)}
                      </span>
                    </div>
                    <Separator />
                    <div className='flex justify-between font-bold'>
                      <span className='text-sm text-slate-900 dark:text-white'>
                        Grand total
                      </span>
                      <span className='text-base tabular-nums text-slate-900 dark:text-white'>
                        ৳{fmtPrice(grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Validation alerts */}
          {selectedProducts.length > 0 &&
            (hasInvalidQty || hasMissingPrice) && (
              <div className='space-y-2'>
                {hasInvalidQty && (
                  <Alert variant='destructive' className='py-2.5 rounded-xl'>
                    <AlertTriangle className='h-4 w-4' />
                    <AlertDescription className='text-sm'>
                      Some products have a quantity of 0. Update them before
                      creating the order.
                    </AlertDescription>
                  </Alert>
                )}
                {hasMissingPrice && (
                  <Alert className='py-2.5 border-amber-200 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 rounded-xl'>
                    <AlertTriangle className='h-4 w-4 text-amber-600' />
                    <AlertDescription className='text-sm'>
                      Some products are missing unit prices. Totals may be
                      inaccurate.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
        </div>

        <ProductSearchDialog
          open={searchDialogOpen}
          onClose={() => setSearchDialogOpen(false)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          products={products}
          selectedProducts={selectedProducts}
          searching={searching}
          onAdd={handleAddProduct}
          isMobile={isMobile}
        />
      </Fragment>
    </MainView>
  );
};

export default CreatePurchaseOrder;
