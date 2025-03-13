import { useEffect, useState } from "react";
import useDebounce from "../../../customHook/useDebounce";
import { searchProducts } from "../../order/services/orderApi";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { ProductSearchResponse } from "../../order/interface";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Bird, CircleX, Disc3, Trash } from "lucide-react";
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

const DialogForRecord = ({
  openDialog,
  handleSubmit,
  setOpenDialog,
  selectedProducts,
  setSelectedProducts,
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
      <div className='p-2 rounded w-full flex items-center'>
        <Input
          placeholder='Search products by name, SKU, or ID'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='hover:ring-0 focus:ring-0 transition-all flex-1'
        />
        {!!searchQuery && (
          <Button
            variant='destructive'
            size='sm'
            onClick={() => {
              setSearchQuery("");
              setProducts([]);
            }}
            className='flex-shrink-0 ml-2'>
            <CircleX className='w-4 h-4' />
          </Button>
        )}
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

    return (
      <div
        key={index}
        className={`cursor-pointer p-4 rounded border border-gray-50 hover:bg-gray-100 shadow ${
          !!existingProduct?.quantity &&
          existingProduct?.quantity >= product?.quantity
            ? "bg-gray-100"
            : ""
        }`}
        onClick={() => {
          !!existingProduct?.quantity &&
          existingProduct?.quantity >= product?.quantity
            ? toast.error("Product out of stock")
            : handleAddProduct(product);
        }}>
        <div className='flex justify-between items-center w-full'>
          <div className='flex justify-start items-center gap-2'>
            {!!product.image && (
              <img
                alt='Product'
                src={product?.image}
                className='w-8 h-8 rounded mr-2'
              />
            )}
            <span className='text-base font-bold text-gray-950'>
              {product?.name}{" "}
              <Badge className='ml-4'>x {product?.quantity}</Badge>
            </span>
          </div>
          {!!product.variant && (
            <Badge variant='outline' className='ml-auto'>
              {`${product?.variant.color}${
                !!product?.variant?.color && !!product?.variant?.size
                  ? " - "
                  : ""
              }${product?.variant?.size}`}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  const renderTableView = () => {
    return (
      <Table>
        <thead className='bg-gray-100 p-4'>
          <tr className='divide-x divide-gray-200 text-gray-950'>
            <th className='p-4'>Name</th>
            <th>Variant</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200 border border-gray-200'>
          {!!selectedProducts && selectedProducts?.length === 0 && (
            <tr>
              <td colSpan={6}>
                <div className='w-full p-16 flex justify-center items-center bg-gray-100'>
                  <div className='text-center'>
                    <Bird className='w-12 h-12 mx-auto mb-4' />
                    <p className='text-lg'>No Product Added</p>
                  </div>
                </div>
              </td>
            </tr>
          )}
          {!!selectedProducts &&
            selectedProducts?.length > 0 &&
            selectedProducts.map((product: any, index: number) => (
              <tr
                className='divide-x divide-gray-200'
                key={product.variant?.id || product.id}>
                <td className='text-center'>{product.name}</td>
                <td className='text-center'>
                  {!!product.variant ? (
                    <Badge variant='outline' className='ml-2'>
                      {`${product?.variant.color}${
                        !!product?.variant?.color && !!product?.variant?.size
                          ? " - "
                          : ""
                      }${product?.variant?.size}`}
                    </Badge>
                  ) : (
                    <Badge variant='default'>N/A</Badge>
                  )}
                </td>
                <td className='flex items-center justify-center'>
                  <div className='flex items-center'>
                    <Button
                      variant='outline'
                      onClick={() => handleDecrease(index)}
                      aria-label='Decrease quantity'
                      disabled={product?.quantity < 1}
                      className='rounded-r-none disabled:opacity-50 border-0'>
                      -
                    </Button>
                    <Input
                      type='text'
                      value={product?.quantity}
                      onChange={(e) =>
                        handleInputChange(e?.target?.value, index)
                      }
                      aria-label={`Quantity of ${product.name}`}
                      className='text-center w-16 border-0'
                    />
                    <Button
                      variant='outline'
                      onClick={() => handleIncrease(index)}
                      aria-label='Increase quantity'
                      className='border-0'>
                      +
                    </Button>
                  </div>
                </td>
                <td className='text-center'>{product?.unitPrice}</td>
                <td className='text-center'>
                  <Trash
                    className='size-5 text-red-500 cursor-pointer mx-auto'
                    onClick={() =>
                      setSelectedProducts(
                        selectedProducts.filter(
                          (_: any, i: number) => i !== index
                        )
                      )
                    }
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
    );
  };

  return (
    <AlertDialog
      open={openDialog}
      onOpenChange={() => {
        setSelectedProducts([]);
        setOpenDialog(false);
      }}>
      <AlertDialogContent className='w-[95vw] max-w-[95vw]'>
        <AlertDialogHeader>
          <AlertDialogTitle>Products</AlertDialogTitle>
          <AlertDialogDescription>
            Here is all the search products.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='grid grid-cols-2 gap-1'>
          <div className='rounded-md  max-h-[50vh] overflow-y-auto'>
            {renderTableView()}
          </div>
          <div className='rounded-md '>
            <div className='w-full px-2'>{renderProductSearch()}</div>
            {loading && (
              <div className='flex justify-center items-center p-10'>
                <div className='flex items-center'>
                  Searching Please Wait...{" "}
                  <Disc3 className='w-5 h-5 ml-2 animate-spin' />
                </div>
              </div>
            )}
            {!loading && (
              <div className='max-h-[50vh] overflow-y-auto'>
                {!!products && products.length > 0 ? (
                  <div className='grid grid-cols-1 gap-2 p-2'>
                    {products.map((result, index) =>
                      renderProductButton(result, index)
                    )}
                  </div>
                ) : (
                  <div className='w-full p-10 flex flex-col justify-center items-center'>
                    <Bird className='w-12 h-12 mx-auto mb-4' />
                    <p className='text-lg'>No Product Found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <AlertDialogFooter className='sm:justify-start'>
          <AlertDialogCancel asChild>
            <Button type='button' variant='secondary'>
              Close
            </Button>
          </AlertDialogCancel>
          <Button onClick={() => handleSubmit()}>Submit</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DialogForRecord;
