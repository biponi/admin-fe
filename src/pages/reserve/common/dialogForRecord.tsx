import { useEffect, useState } from "react";
import useDebounce from "../../../customHook/useDebounce";
import { searchProducts } from "../../order/services/orderApi";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { ProductSearchResponse } from "../../order/interface";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  Bird,
  CircleX,
  Trash,
  Loader2,
  Search,
  Package,
  Plus,
  Minus,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Table } from "../../../components/ui/table";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { Card } from "../../../components/ui/card";

const DialogForRecord = ({
  openDialog,
  handleSubmit,
  setOpenDialog,
  selectedProducts,
  setSelectedProducts,
  isSubmitting = false,
}: any) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Add a product to the order
  const handleAddProduct = (product: ProductSearchResponse) => {
    if (product?.quantity <= 0) return toast.error("Product out of stock");
    const existingProduct = selectedProducts.find((p: any) =>
      product.variant?.id
        ? p.id === product.id && p.variant?.id === product.variant.id
        : p.id === product.id
    );

    if (existingProduct) {
      if (
        existingProduct.maxQuantity &&
        existingProduct.quantity >= existingProduct.maxQuantity
      )
        return toast.error("Product out of stock");
      setSelectedProducts(
        selectedProducts.map((p: any) =>
          p.id === product.id && p.variant?.id === product.variant?.id
            ? { ...p, quantity: p.quantity + 1 }
            : !p.variant && p.id === product.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      );
    } else {
      setSelectedProducts([
        ...selectedProducts,
        { ...product, quantity: 1, maxQuantity: product?.quantity },
      ]);
    }
  };

  // Search for products
  const handleSearch = () => {
    if (!searchQuery || searchQuery === "") {
      setProducts([]);
      return;
    }

    setLoading(true);
    searchProducts(searchQuery)
      .then((res) => {
        setProducts([...res]);
        setLoading(false);
      })
      .catch((error) => {
        if (isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong. Please try again later.");
        }
        setLoading(false);
      });
  };

  const debounce = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (!!searchQuery) handleSearch();
    else setProducts([]);
    //eslint-disable-next-line
  }, [debounce]);

  // Handle quantity input change
  const handleInputChange = (value: any, index: number) => {
    const indexProduct = selectedProducts[index];

    if (value === "" || /^\d+$/.test(value)) {
      const pp = value === "" ? 0 : parseInt(value);
      if (pp > indexProduct?.maxQuantity)
        return toast.error("Enter valid quantity");
      setSelectedProducts(
        selectedProducts.map((p: any, i: number) =>
          i === index ? { ...indexProduct, quantity: value } : p
        )
      );
    }
  };

  // Increase quantity
  const handleIncrease = (index: number) => {
    const indexProduct = selectedProducts[index];
    if (indexProduct?.quantity >= indexProduct?.maxQuantity)
      return toast.error("Maximum quantity added");
    const newQuantity = (indexProduct?.quantity || 0) + 1;
    setSelectedProducts(
      selectedProducts.map((p: any, i: number) =>
        i === index ? { ...indexProduct, quantity: newQuantity } : p
      )
    );
  };

  // Decrease quantity
  const handleDecrease = (index: number) => {
    const indexProduct = selectedProducts[index];
    const quantity = indexProduct?.quantity || 0;

    if (quantity > 0) {
      const newQuantity = quantity - 1;
      setSelectedProducts(
        selectedProducts.map((p: any, i: number) =>
          i === index ? { ...indexProduct, quantity: newQuantity } : p
        )
      );
    }
  };

  const renderProductSearch = () => {
    return (
      <div className='p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl'>
        <div className='relative'>
          <div className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
            <Search className='w-4 h-4' />
          </div>
          <Input
            placeholder='Search products by name, SKU, or ID'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10 pr-10 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all bg-white dark:bg-card'
          />
          {!!searchQuery && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setSearchQuery("");
                setProducts([]);
              }}
              className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-rose-100 hover:text-rose-600'>
              <CircleX className='w-4 h-4' />
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderProductButton = (
    product: ProductSearchResponse,
    index: number
  ) => {
    if (!selectedProducts || !Array.isArray(selectedProducts)) return;

    const existingProduct = selectedProducts.find((p) =>
      product.variant?.id
        ? p.id === product.id && p.variant?.id === product.variant.id
        : p.id === product.id
    );

    const isOutOfStock =
      !!existingProduct?.quantity &&
      existingProduct?.quantity >= product?.quantity;
    const stockLevel = product?.quantity;
    const stockColor =
      stockLevel === 0 ? "rose" : stockLevel < 10 ? "amber" : "emerald";

    return (
      <Card
        key={index}
        className={`group cursor-pointer p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-0 ${
          isOutOfStock
            ? "bg-gray-100 opacity-60 cursor-not-allowed"
            : "bg-gradient-to-br from-card to-card/95 hover:from-purple-50/50 hover:to-indigo-50/50"
        }`}
        onClick={() => {
          isOutOfStock
            ? toast.error("Product out of stock")
            : handleAddProduct(product);
        }}>
        <div className='flex items-center gap-3 w-full'>
          <div className='flex items-center gap-3 flex-1 min-w-0'>
            {!!product.image && (
              <div className='flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 border-purple-100 shadow-sm'>
                <img
                  alt={product?.name}
                  src={product?.image}
                  className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                />
              </div>
            )}
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-1'>
                <span
                  className='text-sm font-semibold text-foreground truncate'
                  title={product?.name}>
                  {product?.name}
                </span>
              </div>
              <Badge
                className={`text-xs font-semibold bg-${stockColor}-100 text-${stockColor}-700 border-${stockColor}-200`}>
                <Package className='w-3 h-3 mr-1' />
                Stock: {product?.quantity}
              </Badge>
            </div>
          </div>
          {!!product.variant && (
            <Badge
              variant='outline'
              className='flex-shrink-0 text-xs border-purple-200'>
              {`${product?.variant.color}${
                !!product?.variant?.color && !!product?.variant?.size
                  ? " - "
                  : ""
              }${product?.variant?.size}`}
            </Badge>
          )}
        </div>
      </Card>
    );
  };

  const renderTableView = () => {
    return (
      <div className='rounded-xl border border-border/50 overflow-hidden shadow-sm bg-card'>
        <Table>
          <thead className='bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-purple-950/20'>
            <tr>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-purple-900 dark:text-purple-100'>
                Name
              </th>
              <th className='px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-purple-900 dark:text-purple-100'>
                Variant
              </th>
              <th className='px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-purple-900 dark:text-purple-100'>
                Quantity
              </th>
              <th className='px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-purple-900 dark:text-purple-100'>
                Price
              </th>
              <th className='px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-purple-900 dark:text-purple-100'>
                Action
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border/30'>
            {!!selectedProducts && selectedProducts?.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className='w-full py-16 flex flex-col justify-center items-center'>
                    <div className='relative mb-4'>
                      <div className='absolute inset-0 bg-purple-500/20 rounded-full blur-xl'></div>
                      <div className='relative p-4 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-2xl'>
                        <Package
                          className='w-12 h-12 text-purple-600'
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>
                    <p className='text-base font-semibold text-foreground'>
                      No Products Added
                    </p>
                    <p className='text-sm text-muted-foreground mt-1'>
                      Search and add products to create a record
                    </p>
                  </div>
                </td>
              </tr>
            )}
            {!!selectedProducts &&
              selectedProducts?.length > 0 &&
              selectedProducts.map((product: any, index: number) => (
                <tr
                  className='hover:bg-purple-50/50 dark:hover:bg-purple-950/10 transition-colors duration-150'
                  key={product.variant?.id || product.id}>
                  <td className='px-4 py-3 text-sm font-medium'>
                    {product.name}
                  </td>
                  <td className='px-4 py-3 text-center'>
                    {!!product.variant ? (
                      <Badge
                        variant='outline'
                        className='text-xs border-purple-200'>
                        {`${product?.variant.color}${
                          !!product?.variant?.color && !!product?.variant?.size
                            ? " - "
                            : ""
                        }${product?.variant?.size}`}
                      </Badge>
                    ) : (
                      <Badge variant='secondary' className='text-xs'>
                        N/A
                      </Badge>
                    )}
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex items-center justify-center gap-1'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDecrease(index)}
                        disabled={product?.quantity < 1}
                        className='h-8 w-8 p-0 rounded-lg border-purple-200 hover:bg-purple-600 hover:text-white hover:border-purple-600 disabled:opacity-50'>
                        <Minus className='h-3 w-3' />
                      </Button>
                      <Input
                        type='text'
                        value={product?.quantity}
                        onChange={(e) =>
                          handleInputChange(e?.target?.value, index)
                        }
                        className='text-center w-16 h-8 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-semibold'
                      />
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleIncrease(index)}
                        className='h-8 w-8 p-0 rounded-lg border-purple-200 hover:bg-purple-600 hover:text-white hover:border-purple-600'>
                        <Plus className='h-3 w-3' />
                      </Button>
                    </div>
                  </td>
                  <td className='px-4 py-3 text-center text-sm font-semibold text-purple-600'>
                    ৳{product?.unitPrice}
                  </td>
                  <td className='px-4 py-3 text-center'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        setSelectedProducts(
                          selectedProducts.filter(
                            (_: any, i: number) => i !== index
                          )
                        )
                      }
                      className='h-8 w-8 p-0 border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-300'>
                      <Trash className='h-4 w-4' />
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </div>
    );
  };

  return (
    <AlertDialog
      open={openDialog}
      onOpenChange={() => {
        setSelectedProducts([]);
        setOpenDialog(false);
      }}>
      <AlertDialogContent className='w-[95vw] max-w-[95vw] max-h-[90vh] overflow-hidden bg-gradient-to-br from-card via-card/98 to-card/95'>
        <AlertDialogHeader className='border-b border-border/50 pb-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg'>
              <Package className='h-5 w-5 text-white' strokeWidth={2.5} />
            </div>
            <div>
              <AlertDialogTitle className='text-xl font-bold'>
                Manage Products
              </AlertDialogTitle>
              <AlertDialogDescription className='text-sm mt-1'>
                Search and add products to create or update a record
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 py-4'>
          {/* Selected Products Table */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <h3 className='text-sm font-semibold text-foreground'>
                Selected Products
              </h3>
              <Badge variant='secondary' className='text-xs'>
                {selectedProducts?.length || 0} items
              </Badge>
            </div>
            <div className='max-h-[45vh] overflow-y-auto pr-2'>
              {renderTableView()}
            </div>
          </div>

          {/* Product Search */}
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold text-foreground'>
              Search Products
            </h3>
            {renderProductSearch()}

            {loading && (
              <div className='flex flex-col justify-center items-center py-16'>
                <Loader2 className='w-10 h-10 text-purple-600 animate-spin mb-3' />
                <p className='text-sm font-medium text-foreground'>
                  Searching products...
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  Please wait a moment
                </p>
              </div>
            )}

            {!loading && (
              <div className='max-h-[45vh] overflow-y-auto pr-2'>
                {!!products && products.length > 0 ? (
                  <div className='grid grid-cols-1 gap-3 p-2'>
                    {products.map((result, index) =>
                      renderProductButton(result, index)
                    )}
                  </div>
                ) : searchQuery ? (
                  <div className='flex flex-col justify-center items-center py-16 text-center'>
                    <div className='relative mb-4'>
                      <div className='absolute inset-0 bg-purple-500/20 rounded-full blur-xl'></div>
                      <div className='relative p-4 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-2xl'>
                        <Bird
                          className='w-12 h-12 text-purple-600'
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>
                    <p className='text-base font-semibold text-foreground'>
                      No Products Found
                    </p>
                    <p className='text-sm text-muted-foreground mt-1'>
                      Try searching with different keywords
                    </p>
                  </div>
                ) : (
                  <div className='flex flex-col justify-center items-center py-16 text-center'>
                    <div className='relative mb-4'>
                      <div className='absolute inset-0 bg-purple-500/20 rounded-full blur-xl'></div>
                      <div className='relative p-4 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-2xl'>
                        <Search
                          className='w-12 h-12 text-purple-600'
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>
                    <p className='text-base font-semibold text-foreground'>
                      Start Searching
                    </p>
                    <p className='text-sm text-muted-foreground mt-1'>
                      Enter product name, SKU, or ID above
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <AlertDialogFooter className='border-t border-border/50 pt-4 gap-2'>
          <AlertDialogCancel asChild>
            <Button
              type='button'
              variant='outline'
              disabled={isSubmitting}
              className='border-border/50'>
              Cancel
            </Button>
          </AlertDialogCancel>
          <Button
            onClick={() => handleSubmit()}
            disabled={isSubmitting || selectedProducts?.length === 0}
            className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg'>
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Submitting...
              </>
            ) : (
              <>
                <Package className='mr-2 h-4 w-4' />
                Submit Record
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DialogForRecord;
