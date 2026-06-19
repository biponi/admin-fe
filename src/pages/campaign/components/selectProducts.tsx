import { useEffect, useState } from "react";
import useOrder from "../../order/hooks/useOrder";
import { IProduct } from "../../product/interface";
import useDebounce from "../../../customHook/useDebounce";
import EmptyProductCard from "../../../common/EmptyProductCard";
import PlaceHolderImage from "../../../assets/placeholder.svg";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { ICampaingProducts } from "../interface";
import {
  Search,
  Plus,
  Trash2,
  ShoppingBag,
  PackageX,
  CheckCircle2,
} from "lucide-react";
import { cn } from "../../../lib/utils";

interface Props {
  productList: ICampaingProducts[];
  updateProductList: (products: string[]) => void;
}

const SelectProductForCampaign: React.FC<Props> = ({
  productList,
  updateProductList,
}) => {
  const { getProductByQuery } = useOrder();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ICampaingProducts[]>(
    [],
  );

  useEffect(() => {
    if (productList?.length > 0) setSelectedProducts(productList);
  }, [productList]);

  useEffect(() => {
    const listOfProductId = selectedProducts.map((p) => p.id);
    updateProductList(listOfProductId);
    // eslint-disable-next-line
  }, [selectedProducts]);

  const debounce = useDebounce(query, 500);

  const fetchProduct = async () => {
    const result = await getProductByQuery(query);
    setProducts(result);
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line
  }, [debounce]);

  const handleSelect = (product: IProduct) => {
    const prod: ICampaingProducts = {
      id: product.id,
      name: product.name,
      description: product.description,
      thumbnail: product.thumbnail,
      quantity: product.quantity,
      active: product.active,
      unitPrice: product.unitPrice,
    };
    setSelectedProducts((prev) => [...prev, prod]);
  };

  const handleRemove = (id: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const availableProducts = products.filter(
    (p) => !selectedProducts.some((s) => s.id === p.id),
  );

  const formatPrice = (price: number | string) =>
    `৳${Number(price).toLocaleString("en-BD")}`;

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 w-full'>
      {/* ─── LEFT PANEL: Product Search ─── */}
      <div className='flex flex-col rounded-none border border-gray-100 bg-gray-50/50 overflow-hidden'>
        {/* Panel header */}
        <div className='px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between gap-3'>
          <div className='flex items-center gap-2'>
            <div className='w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center'>
              <ShoppingBag className='w-3.5 h-3.5 text-indigo-600' />
            </div>
            <div>
              <p className='text-sm font-semibold text-gray-900 leading-none'>
                Product catalogue
              </p>
              <p className='text-[11px] text-gray-400 mt-0.5'>
                {availableProducts.length} available
              </p>
            </div>
          </div>
        </div>

        {/* Search input */}
        <div className='px-4 py-3 bg-white border-b border-gray-100'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400' />
            <Input
              type='text'
              placeholder='Search by name, SKU…'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className='pl-9 h-9 text-sm bg-gray-50 border-gray-200 rounded-lg
                         focus:bg-white focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100
                         placeholder:text-gray-400 transition-all'
            />
          </div>
        </div>

        {/* Product list */}
        <div className='flex-1 overflow-y-auto max-h-[420px] divide-y divide-gray-100'>
          {availableProducts.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-48 gap-2 text-gray-400'>
              <PackageX className='w-8 h-8 opacity-40' />
              <p className='text-sm font-medium'>No products found</p>
              <p className='text-xs opacity-70'>Try a different search term</p>
            </div>
          ) : (
            availableProducts.map((product) => {
              const isUnavailable = !product.active || product.quantity === 0;
              return (
                <div
                  key={product.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50/80 transition-colors group",
                    isUnavailable && "opacity-60",
                  )}>
                  {/* Thumbnail */}
                  <div className='w-11 h-11 rounded-lg overflow-hidden border border-gray-100 shrink-0 bg-gray-50'>
                    <img
                      src={product.thumbnail || PlaceHolderImage}
                      alt={product.name}
                      className='w-full h-full object-cover'
                    />
                  </div>

                  {/* Info */}
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900 truncate leading-snug'>
                      {product.name}
                    </p>
                    <div className='flex items-center gap-2 mt-0.5'>
                      {product.sku && (
                        <span className='text-[11px] text-gray-400 font-mono'>
                          {product.sku}
                        </span>
                      )}
                      {product.quantity <= 5 && product.quantity > 0 && (
                        <span className='text-[11px] text-amber-600 font-medium'>
                          · {product.quantity} left
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price + action */}
                  <div className='flex flex-col items-end gap-1.5 shrink-0'>
                    <span className='text-sm font-semibold text-gray-800 tabular-nums'>
                      {formatPrice(product.unitPrice)}
                    </span>
                    {isUnavailable ? (
                      <Badge
                        variant='outline'
                        className='text-[10px] px-1.5 py-0 border-red-200 text-red-500 bg-red-50'>
                        {!product.active ? "Inactive" : "Out of stock"}
                      </Badge>
                    ) : (
                      <button
                        onClick={() => handleSelect(product)}
                        className='flex items-center gap-1 text-[11px] font-semibold text-indigo-600
                                   hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100
                                   px-2.5 py-1 rounded-md transition-colors'>
                        <Plus className='w-3 h-3' />
                        Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── RIGHT PANEL: Selected Products ─── */}
      <div className='flex flex-col rounded-none border border-gray-100 overflow-hidden'>
        {/* Panel header */}
        <div className='px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between gap-3'>
          <div className='flex items-center gap-2'>
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                selectedProducts.length >= 3 ? "bg-emerald-50" : "bg-gray-100",
              )}>
              <CheckCircle2
                className={cn(
                  "w-3.5 h-3.5 transition-colors",
                  selectedProducts.length >= 3
                    ? "text-emerald-600"
                    : "text-gray-400",
                )}
              />
            </div>
            <div>
              <p className='text-sm font-semibold text-gray-900 leading-none'>
                Selected
              </p>
              <p
                className={cn(
                  "text-[11px] mt-0.5 font-medium transition-colors",
                  selectedProducts.length >= 3
                    ? "text-emerald-600"
                    : "text-gray-400",
                )}>
                {selectedProducts.length} / 3 minimum
              </p>
            </div>
          </div>

          {selectedProducts.length > 0 && (
            <button
              onClick={() => setSelectedProducts([])}
              className='text-[11px] text-gray-400 hover:text-red-500 transition-colors font-medium'>
              Clear all
            </button>
          )}
        </div>

        {/* Selected list */}
        <div className='flex-1 overflow-y-auto max-h-[420px] divide-y divide-gray-100 bg-white'>
          {selectedProducts.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-48 gap-2'>
              <div className='w-12 h-12 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center'>
                <Plus className='w-5 h-5 text-gray-300' />
              </div>
              <p className='text-sm font-medium text-gray-400'>
                No products selected
              </p>
              <p className='text-xs text-gray-300'>
                Add from the catalogue on the left
              </p>
            </div>
          ) : (
            selectedProducts.map((product: any, index: number) => (
              <div
                key={`${product.id}-${index}`}
                className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 transition-colors group'>
                {/* Thumbnail */}
                <div className='w-11 h-11 rounded-lg overflow-hidden border border-gray-100 shrink-0 bg-gray-50'>
                  <img
                    src={product.thumbnail || PlaceHolderImage}
                    alt={product.name}
                    className='w-full h-full object-cover'
                  />
                </div>

                {/* Info */}
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900 truncate leading-snug'>
                    {product.name}
                  </p>
                  <p className='text-[11px] text-gray-400 mt-0.5'>
                    Qty: {product.quantity}
                  </p>
                </div>

                {/* Price + remove */}
                <div className='flex flex-col items-end gap-1.5 shrink-0'>
                  <span className='text-sm font-semibold text-gray-800 tabular-nums'>
                    {formatPrice(product.unitPrice)}
                  </span>
                  <button
                    onClick={() => handleRemove(product.id)}
                    className='opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px]
                               font-medium text-red-400 hover:text-red-600 transition-all'>
                    <Trash2 className='w-3 h-3' />
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer summary */}
        {selectedProducts.length > 0 && (
          <div className='px-4 py-3 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between'>
            <p className='text-xs text-gray-500'>
              {selectedProducts.length} product
              {selectedProducts.length !== 1 ? "s" : ""} · Total
            </p>
            <p className='text-sm font-bold text-gray-900 tabular-nums'>
              {formatPrice(
                selectedProducts.reduce(
                  (sum, p) => sum + Number(p.unitPrice),
                  0,
                ),
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectProductForCampaign;
