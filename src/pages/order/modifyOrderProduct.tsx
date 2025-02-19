import React, { useEffect, useState } from "react";
import { searchProducts, modifyOrderProducts } from "./services/orderApi";
import { ProductSearchResponse } from "./interface";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Table } from "../../components/ui/table";
import useDebounce from "../../customHook/useDebounce";
import { Badge } from "../../components/ui/badge";
import { Bird, CircleX, Disc3, Image, Trash } from "lucide-react";
import { toast } from "react-hot-toast";
import MainView from "../../coreComponents/mainView";
import axios from "../../api/axios";
import { isAxiosError } from "axios";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import { Separator } from "../../components/ui/separator";
import config from "../../utils/config";
import { useNavigate, useParams } from "react-router-dom";
import { SkeletonCard } from "../../coreComponents/sekeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../../components/ui/drawer";

const ModifyOrder = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [products, setProducts] = useState<ProductSearchResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<
    ProductSearchResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [searching, setSearching] = useState(false);
  const [orderData, setorderData] = useState({
    deliveryCarge: 0,
    paid: 0,
  });

  // Fetch the existing order's products
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const { data } = await axios.get(
          config.order.getOrderProducts(orderId)
        );
        setSelectedProducts(data?.data?.products);
        setorderData({
          deliveryCarge: data?.data?.deliveryCharge,
          paid: data?.data?.paid,
        });
      } catch (error) {
        if (isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong. Please try again later.");
        }
      }
    };
    if (!!orderId) fetchOrder();
  }, [orderId]);

  // Search for products
  const handleSearch = () => {
    if (!searchQuery || searchQuery === "") {
      setProducts([]);
      return;
    }
    setSearching(true);
    searchProducts(searchQuery)
      .then((res) => {
        setProducts([...res]);
        setSearching(false);
      })
      .catch((error) => {
        if (isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong. Please try again later.");
        }
        setSearching(false);
      });
  };

  const debounce = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (!!searchQuery) handleSearch();
    else setProducts([]);
    //eslint-disable-next-line
  }, [debounce]);

  // Add a product to the order
  const handleAddProduct = (product: ProductSearchResponse) => {
    if (product?.quantity <= 0) return toast.error("Product out of stock");
    const existingProduct = selectedProducts.find((p) =>
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
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p.id === product.id && p.variant?.id === product.variant?.id
            ? { ...p, quantity: p.quantity + 1 }
            : !p.variant && p.id === product.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      );
    } else {
      setSelectedProducts((prev) => [
        ...prev,
        { ...product, quantity: 1, maxQuantity: product?.quantity },
      ]);
    }
  };

  // Update the order
  const handleUpdateOrder = () => {
    setLoading(true);
    if (!orderId) return;
    modifyOrderProducts(orderId, selectedProducts)
      .then(() => {
        setLoading(false);
        setSelectedProducts([]);
        toast.success("Order Modified successfully!");
        navigate("/order");
      })
      .catch((error) => {
        if (isAxiosError(error) && error.response) {
          console.error("API error:", error.response.data.message); // Logs "Product with ID 123 not found."
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong. Please try again later.");
        }
        setLoading(false);
      });
  };

  // Handle quantity input change
  const handleInputChange = (value: any, index: number) => {
    const indexProduct = selectedProducts[index];

    if (value === "" || /^\d+$/.test(value)) {
      const pp = value === "" ? 0 : parseInt(value);
      if (pp > indexProduct?.maxQuantity)
        return toast.error("Enter valid quantity");
      setSelectedProducts((prev) =>
        prev.map((p, i) =>
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
    setSelectedProducts((prev) =>
      prev.map((p, i) =>
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
      setSelectedProducts((prev) =>
        prev.map((p, i) =>
          i === index ? { ...indexProduct, quantity: newQuantity } : p
        )
      );
    }
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

  const renderProductSearch = () => {
    return (
      <>
        <p>Search products and add them to the order.</p>
        <br />
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
      </>
    );
  };

  // Render the product search sheet
  const renderProductSheet = () => {
    return (
      <Sheet open={openSheet} onOpenChange={(sta) => setOpenSheet(sta)}>
        <SheetContent className='w-[40vw]'>
          <SheetHeader>
            <SheetTitle>Products</SheetTitle>
            <Separator />
            <SheetDescription>{renderProductSearch()}</SheetDescription>
          </SheetHeader>
          {searching && (
            <div className='flex justify-center items-center p-10'>
              <div className='flex items-center'>
                Searching Please Wait...{" "}
                <Disc3 className='w-5 h-5 ml-2 animate-spin' />
              </div>
            </div>
          )}
          {!searching && (
            <div className='max-h-[70vh] overflow-y-auto'>
              {!!products && products.length > 0 ? (
                <div className='grid grid-cols-1 gap-2 p-2'>
                  {products.map((result, index) =>
                    renderProductButton(result, index)
                  )}
                </div>
              ) : (
                <div className='w-full p-10 flex justify-center items-center'>
                  <Bird className='w-12 h-12 mx-auto mb-4' />
                  <p className='text-lg'>No Product Found</p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    );
  };

  const renderProductDrawer = () => {
    return (
      <Drawer open={openDrawer} onOpenChange={(sta) => setOpenDrawer(sta)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Products</DrawerTitle>
            <DrawerDescription>{renderProductSearch()}</DrawerDescription>
          </DrawerHeader>
          {searching && (
            <div className='flex justify-center items-center p-10'>
              <div className='flex items-center'>
                Searching Please Wait...{" "}
                <Disc3 className='w-5 h-5 ml-2 animate-spin' />
              </div>
            </div>
          )}
          {!searching && (
            <div className='max-h-[70vh] overflow-y-auto'>
              {!!products && products.length > 0 ? (
                <div className='grid grid-cols-1 gap-2 p-2'>
                  {products.map((result, index) =>
                    renderProductButton(result, index)
                  )}
                </div>
              ) : (
                <div className='w-full p-10 flex justify-center items-center'>
                  <Bird className='w-12 h-12 mx-auto mb-4' />
                  <p className='text-lg'>No Product Found</p>
                </div>
              )}
            </div>
          )}
        </DrawerContent>
      </Drawer>
    );
  };

  const renderMobileProductView = () => {
    return (
      <>
        {!!selectedProducts &&
          selectedProducts?.length > 0 &&
          selectedProducts.map((product, index) => (
            <Card key={product.variant?.id || product.id} className='mb-4 p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <img
                    src={product?.image}
                    className='size-12 rounded-md'
                    alt='product'
                  />
                  <div>
                    <p className='font-medium'>{product.name}</p>
                    {!!product.variant ? (
                      <Badge variant='outline' className='mt-1'>
                        {`${product?.variant.color}${
                          !!product?.variant?.color && !!product?.variant?.size
                            ? " - "
                            : ""
                        }${product?.variant?.size}`}
                      </Badge>
                    ) : (
                      <Badge variant='default' className='mt-1'>
                        N/A
                      </Badge>
                    )}
                  </div>
                </div>
                <Trash
                  className='size-5 text-red-500 cursor-pointer'
                  onClick={() =>
                    setSelectedProducts(
                      selectedProducts.filter((_, i) => i !== index)
                    )
                  }
                />
              </div>
              <div className='mt-4 flex items-center justify-between'>
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
                    onChange={(e) => handleInputChange(e?.target?.value, index)}
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
                <p className='font-medium'>{product?.unitPrice}</p>
              </div>
            </Card>
          ))}
      </>
    );
  };

  const renderTableView = () => {
    return (
      <Table>
        <thead className='bg-gray-100 p-4'>
          <tr className='divide-x divide-gray-200 text-gray-950'>
            <th className='mx-auto'>
              <Image className='size-5' />
            </th>
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
            selectedProducts.map((product, index) => (
              <tr
                className='divide-x divide-gray-200'
                key={product.variant?.id || product.id}>
                <td className='text-center mx-auto'>
                  <img
                    src={product?.image}
                    className=' size-8 '
                    alt='product'
                  />
                </td>
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
                        selectedProducts.filter((_, i) => i !== index)
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
  // Render the main view
  const renderMainView = () => {
    return (
      <div className='p-6'>
        <h1 className='text-2xl font-bold mb-4'>Modify Order</h1>

        {/* Search Products */}
        <div className='hidden md:block'> {renderProductSheet()}</div>
        <div className='md:hidden'>{renderProductDrawer()}</div>

        {/* Selected Products */}
        <div className='w-full flex justify-between items-center'>
          <h2 className='text-xl font-semibold hidden md:inline-block'>
            Selected Products
          </h2>
          <div className='flex justify-between items-center'>
            <Button
              variant='outline'
              onClick={() => setOpenSheet(true)}
              className='mr-2 hidden md:block'>
              Add Product
            </Button>
            <Button
              variant='outline'
              onClick={() => setOpenDrawer(true)}
              className='mr-2 md:hidden'>
              Add Product
            </Button>
            <Button
              disabled={selectedProducts.length < 1}
              onClick={handleUpdateOrder}>
              Update Order
            </Button>
          </div>
        </div>
        <br />
        <div className='hidden md:block'>{renderTableView()}</div>
        <div className='md:hidden'>{renderMobileProductView()}</div>

        <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className=''></div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex justify-between items-center'>
                  <span>Total Price</span>
                  <span>
                    {selectedProducts.reduce(
                      (sum, item) =>
                        (sum =
                          Number(sum) +
                          Number(item?.quantity * Number(item?.unitPrice))),
                      0
                    )}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span>Delivery Charge</span>
                  <span>{orderData.deliveryCarge}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span>Paid Amount</span>
                  <span>{orderData.paid}</span>
                </div>
                <div className='flex justify-between items-center text-red-700'>
                  <span>
                    Please note: The final price will be calculated after the
                    order is modified.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderLoading = () => {
    return (
      <SkeletonCard
        title='Modifying Order'
        description='Please wait while we processing.'
      />
    );
  };

  return (
    <MainView title='Modify Order'>
      <div className='w-[90vw]'>
        {loading ? renderLoading() : renderMainView()}
      </div>
    </MainView>
  );
};

export default ModifyOrder;
