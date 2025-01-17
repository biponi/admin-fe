// src/pages/CreatePurchaseOrder.tsx
import React, { useEffect, useState } from "react";
import {
  searchProducts,
  createPurchaseOrder,
} from "./services/purchaseOrderApi";
import { ProductSearchResponse } from "./types";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Table } from "../../components/ui/table";
import useDebounce from "../../customHook/useDebounce";

import { Badge } from "../../components/ui/badge";
import { Bird, CircleX, Disc3, Trash } from "lucide-react";
import { toast } from "react-hot-toast";
import { SkeletonCard } from "../../coreComponents/sekeleton";
import MainView from "../../coreComponents/mainView";
import axios from "axios";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import { Separator } from "../../components/ui/separator";

const CreatePurchaseOrder: React.FC = () => {
  const [products, setProducts] = useState<ProductSearchResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<
    ProductSearchResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);
  const [searching, setSearching] = useState(false);

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
        if (axios.isAxiosError(error) && error.response) {
          console.error("API error:", error?.response?.data?.message); // Logs "Product with ID 123 not found."
          toast.error(error?.response?.data?.message);
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

  const handleAddProduct = (product: ProductSearchResponse) => {
    const existingProduct = selectedProducts.find((p) =>
      product.variant?.id
        ? p.id === product.id && p.variant?.id === product.variant.id
        : p.id === product.id
    );

    if (existingProduct) {
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
      setSelectedProducts((prev) => [...prev, { ...product, quantity: 1 }]);
    }
  };

  const handleCreateOrder = () => {
    setLoading(true);
    createPurchaseOrder(selectedProducts)
      .then(() => {
        setLoading(false);
        setSelectedProducts([]);
        toast.success("Purchase order created successfully!");
      })
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response) {
          console.error("API error:", error.response.data.message); // Logs "Product with ID 123 not found."
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong. Please try again later.");
        }
        setLoading(false);
      });
  };

  const handleInputChange = (value: any, index: number) => {
    const indexProduct = selectedProducts[index];
    // Allow empty string or positive integers only
    if (value === "" || /^\d+$/.test(value)) {
      setSelectedProducts((prev) =>
        prev.map((p, i) =>
          i === index ? { ...indexProduct, quantity: value } : p
        )
      );
    }
  };

  const handleIncrease = (index: number) => {
    const indexProduct = selectedProducts[index];
    const newQuantity = (indexProduct?.quantity || 0) + 1;
    setSelectedProducts((prev) =>
      prev.map((p, i) =>
        i === index ? { ...indexProduct, quantity: newQuantity } : p
      )
    );
  };

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

  const renderProductSheet = () => {
    return (
      <Sheet open={openSheet} onOpenChange={(sta) => setOpenSheet(sta)}>
        <SheetContent className="w-[40vw]">
          <SheetHeader>
            <SheetTitle>Products</SheetTitle>
            <Separator />
            <SheetDescription>
              <p> Search products and add them to the purchase order.</p>
              <br />
              <div className="p-2 rounded w-full flex items-center">
                <Input
                  placeholder="Search products by name, SKU, or ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={` hover:ring-0 focus:ring-0 transition-all flex-1`}
                />
                {!!searchQuery && (
                  <Button
                    variant={"destructive"}
                    size={"sm"}
                    onClick={() => {
                      setSearchQuery("");
                      setProducts([]);
                    }}
                    className="flex-shrink-0 ml-2"
                  >
                    <CircleX className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </SheetDescription>
          </SheetHeader>
          {searching && (
            <div className="flex justify-center items-center p-10">
              <div className="flex items-center">
                Searching Please Wait...{" "}
                <Disc3 className="w-5 h-5 ml-2 animate-spin" />
              </div>
            </div>
          )}
          {!searching && (
            <div className="max-h-[70vh] overflow-y-auto">
              {!!products && products.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 p-2">
                  {products.map((result, index) => (
                    <div
                      key={index}
                      className="cursor-pointer p-4 rounded border border-gray-50 hover:bg-gray-100 shadow "
                      onClick={() => {
                        handleAddProduct(result);
                      }}
                    >
                      <div className="flex justify-between items-center w-full">
                        <div className="flex justify-start items-center gap-2">
                          {!!result.image && (
                            <img
                              alt="Product"
                              src={result?.image}
                              className=" w-8 h-8 rounded mr-2"
                            />
                          )}
                          <span className="text-base font-bold text-gray-950">
                            {result.name}
                          </span>
                        </div>
                        {!!result.variant && (
                          <Badge variant={"outline"} className="ml-auto">
                            {`${result?.variant.color}${
                              !!result?.variant?.color &&
                              !!result?.variant?.size
                                ? " - "
                                : ""
                            }${result?.variant?.size}`}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full p-10 flex justify-center items-center">
                  <Bird className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-lg">No Product Found</p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    );
  };

  const renderMainCreateView = () => {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Create Purchase Order</h1>

        {/* Search Products */}
        {renderProductSheet()}

        {/* Selected Products */}
        <div className="w-full flex justify-between items-center">
          <h2 className="text-xl font-semibold">Selected Products</h2>
          <div className="flex justify-between items-center">
            <Button
              variant={"outline"}
              onClick={() => setOpenSheet(true)}
              className="mr-2"
            >
              Add Product
            </Button>
            <Button
              disabled={!searchProducts || selectedProducts.length < 1}
              onClick={handleCreateOrder}
            >
              Create Purchase Order
            </Button>
          </div>
        </div>
        <br />
        <Table>
          <thead className="bg-gray-100 p-4">
            <tr className="divide-x divide-gray-200 text-gray-950">
              <th>SKU</th>
              <th className="p-4">Name</th>
              <th>Variant</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 border border-gray-200">
            {!!selectedProducts && selectedProducts?.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="w-full p-16 flex justify-center items-center bg-gray-100">
                    <div className="text-center">
                      <Bird className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-lg">No Product Added</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
            {!!selectedProducts &&
              selectedProducts?.length > 0 &&
              selectedProducts.map((product, index) => (
                <tr
                  className=" divide-x divide-gray-200 "
                  key={product.variant?.id || product.id}
                >
                  <td className="text-center">{product.sku}</td>
                  <td className="text-center">{product.name}</td>
                  <td className="text-center">
                    {!!product.variant ? (
                      <Badge variant={"outline"} className="ml-2">
                        {`${product?.variant.color}${
                          !!product?.variant?.color && !!product?.variant?.size
                            ? " - "
                            : ""
                        }${product?.variant?.size}`}
                      </Badge>
                    ) : (
                      <Badge variant={"default"}>N/A</Badge>
                    )}
                  </td>
                  <td className="flex items-center justify-center">
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        onClick={() => handleDecrease(index)}
                        aria-label="Decrease quantity"
                        disabled={product?.quantity < 1}
                        className="rounded-r-none disabled:opacity-50 border-0"
                      >
                        -
                      </Button>
                      <Input
                        type="text"
                        value={product?.quantity}
                        onChange={(e) =>
                          handleInputChange(e?.target?.value, index)
                        }
                        aria-label={`Quantity of ${product.name}`}
                        className="text-center w-16 border-0"
                      />
                      <Button
                        variant="outline"
                        onClick={() => handleIncrease(index)}
                        aria-label="Increase quantity"
                        className=" border-0"
                      >
                        +
                      </Button>
                    </div>
                  </td>
                  <td>
                    <Input
                      id="stock-3"
                      name="quantity"
                      onChange={(e) => {
                        const value = e.target.value;
                        selectedProducts[index].unitPrice = value;
                        setSelectedProducts([...selectedProducts]);
                      }}
                      type="number"
                      value={product?.unitPrice}
                      defaultValue={product?.unitPrice}
                    />
                  </td>
                  <td className="text-center">
                    <Trash
                      className=" size-5 text-red-500 cursor-pointer mx-auto "
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
      </div>
    );
  };

  const renderMainView = () => {
    if (loading)
      return (
        <SkeletonCard
          title="Creating Purchase Order"
          description="Please wait while we create the purchase order."
        />
      );
    return renderMainCreateView();
  };

  return (
    <MainView title="Create Purchase Order">
      <div className="w-[90vw]">{renderMainView()}</div>
    </MainView>
  );
};

export default CreatePurchaseOrder;
