import React, { useEffect, useState } from "react";
import {
  searchProducts,
  createPurchaseOrder,
} from "./services/purchaseOrderApi";
import { ProductSearchResponse } from "./types";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription } from "../../components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { ScrollArea } from "../../components/ui/scroll-area";
import useDebounce from "../../customHook/useDebounce";
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
} from "lucide-react";
import { toast } from "react-hot-toast";
import MainView from "../../coreComponents/mainView";
import axios from "axios";

const CreatePurchaseOrder: React.FC = () => {
  const [products, setProducts] = useState<ProductSearchResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<
    ProductSearchResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

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
          console.error("API error:", error?.response?.data?.message);
          toast.error(error?.response?.data?.message);
        } else {
          toast.error("Something went wrong. Please try again later.");
        }
        setSearching(false);
      });
  };

  const debounce = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (searchQuery && searchQuery.trim() !== "") {
      handleSearch();
    } else {
      setProducts([]);
    }
    //eslint-disable-next-line
  }, [debounce]);

  const handleAddProduct = React.useCallback(
    (product: ProductSearchResponse) => {
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
        setSelectedProducts((prev) => [
          ...prev,
          { ...product, quantity: 1, unitPrice: 0 },
        ]);
      }
      toast.success(`Added ${product.name} to purchase order`);
    },
    [selectedProducts]
  );

  const handleCreateOrder = () => {
    if (selectedProducts.length === 0) {
      toast.error("Please add at least one product to create a purchase order");
      return;
    }

    const hasInvalidQuantities = selectedProducts.some(
      (p) => !p.quantity || p.quantity <= 0
    );
    if (hasInvalidQuantities) {
      toast.error("Please ensure all products have valid quantities");
      return;
    }

    setLoading(true);
    createPurchaseOrder(selectedProducts)
      .then(() => {
        setLoading(false);
        setSelectedProducts([]);
        toast.success("Purchase order created successfully!");
      })
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response) {
          console.error("API error:", error.response.data.message);
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong. Please try again later.");
        }
        setLoading(false);
      });
  };

  const handleQuantityChange = React.useCallback(
    (index: number, value: string) => {
      if (value === "" || /^\d+$/.test(value)) {
        setSelectedProducts((prev) =>
          prev.map((p, i) =>
            i === index
              ? { ...p, quantity: value === "" ? 0 : parseInt(value) }
              : p
          )
        );
      }
    },
    []
  );

  const handleUnitPriceChange = React.useCallback(
    (index: number, value: string) => {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setSelectedProducts((prev) =>
          prev.map((p, i) =>
            i === index
              ? { ...p, unitPrice: value === "" ? 0 : parseFloat(value) || 0 }
              : p
          )
        );
      }
    },
    []
  );

  const handleQuantityIncrement = React.useCallback((index: number) => {
    setSelectedProducts((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, quantity: (p.quantity || 0) + 1 } : p
      )
    );
  }, []);

  const handleQuantityDecrement = React.useCallback((index: number) => {
    setSelectedProducts((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, quantity: Math.max(0, (p.quantity || 0) - 1) } : p
      )
    );
  }, []);

  const removeProduct = React.useCallback(
    (index: number) => {
      const productName = selectedProducts[index].name;
      setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
      toast.success(`Removed ${productName} from purchase order`);
    },
    [selectedProducts]
  );

  const calculateTotal = React.useCallback(() => {
    return selectedProducts
      .reduce((total, product) => {
        const quantity =
          typeof product.quantity === "number"
            ? product.quantity
            : parseInt(String(product.quantity)) || 0;
        const unitPrice =
          typeof product.unitPrice === "number"
            ? product.unitPrice
            : parseFloat(String(product.unitPrice)) || 0;
        return total + quantity * unitPrice;
      }, 0)
      .toFixed(2);
  }, [selectedProducts]);

  const ProductSearchDialog = () => (
    <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
      <DialogContent className='max-w-2xl max-h-[80vh]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Search Products
          </DialogTitle>
          <DialogDescription>
            Search for products by name, SKU, or ID and add them to your
            purchase order.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4' onClick={(e) => e.stopPropagation()}>
          <div className='relative'>
            <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search products by name, SKU, or ID...'
              value={searchQuery}
              onChange={(e) => {
                e.preventDefault();
                setSearchQuery(e.target.value);
              }}
              className='pl-10'
            />
            {searchQuery && (
              <Button
                variant='ghost'
                size='sm'
                className='absolute right-2 top-2 h-6 w-6 p-0'
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                  setProducts([]);
                }}>
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>

          <ScrollArea className='h-[400px]'>
            {searching ? (
              <div className='flex items-center justify-center p-8'>
                <Loader2 className='h-6 w-6 animate-spin mr-2' />
                <span>Searching products...</span>
              </div>
            ) : products.length > 0 ? (
              <div className='space-y-2'>
                {products.map((product, index) => (
                  <Card
                    key={`${product.id}-${
                      product.variant?.id || "no-variant"
                    }-${index}`}
                    className='cursor-pointer hover:bg-accent transition-colors'>
                    <CardContent className='p-4'>
                      <div
                        className='flex items-center justify-between'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddProduct(product);
                        }}>
                        <div className='flex items-center gap-3'>
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className='w-10 h-10 rounded-md object-cover'
                            />
                          )}
                          <div>
                            <h4 className='font-semibold'>{product.name}</h4>
                            <p className='text-sm text-muted-foreground'>
                              SKU: {product.sku}
                            </p>
                          </div>
                        </div>
                        {product.variant && (
                          <Badge variant='secondary'>
                            {`${product.variant.color || ""}${
                              product.variant.color && product.variant.size
                                ? " - "
                                : ""
                            }${product.variant.size || ""}`}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : searchQuery ? (
              <div className='flex flex-col items-center justify-center p-8 text-muted-foreground'>
                <Package className='h-12 w-12 mb-4' />
                <p className='text-lg font-medium'>No products found</p>
                <p className='text-sm'>Try adjusting your search terms</p>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center p-8 text-muted-foreground'>
                <Search className='h-12 w-12 mb-4' />
                <p className='text-lg font-medium'>Start searching</p>
                <p className='text-sm'>
                  Enter a product name, SKU, or ID above
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <MainView title='Create Purchase Order'>
      <div className='container mx-auto p-6 space-y-6'>
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ShoppingCart className='h-5 w-5' />
              Create Purchase Order
            </CardTitle>
            <CardDescription>
              Search for products and create a new purchase order with
              quantities and unit prices.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Actions */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button className='gap-2' onClick={() => setSearchDialogOpen(true)}>
              <Plus className='h-4 w-4' />
              Add Products
            </Button>
            {selectedProducts.length > 0 && (
              <Badge variant='secondary' className='text-sm'>
                {selectedProducts.length}{" "}
                {selectedProducts.length === 1 ? "item" : "items"} selected
              </Badge>
            )}
          </div>

          <div className='flex items-center gap-4'>
            {selectedProducts.length > 0 && (
              <div className='text-right'>
                <p className='text-sm text-muted-foreground'>Total Amount</p>
                <p className='text-lg font-semibold'>${calculateTotal()}</p>
              </div>
            )}
            <Button
              onClick={handleCreateOrder}
              disabled={loading || selectedProducts.length === 0}
              className='gap-2'>
              {loading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <CheckCircle2 className='h-4 w-4' />
              )}
              {loading ? "Creating..." : "Create Purchase Order"}
            </Button>
          </div>
        </div>

        {/* Selected Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Selected Products</CardTitle>
            <CardDescription>
              Review and adjust quantities and unit prices for your purchase
              order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedProducts.length === 0 ? (
              <div className='flex flex-col items-center justify-center p-12 text-center'>
                <Package className='h-16 w-16 text-muted-foreground mb-4' />
                <h3 className='text-lg font-semibold mb-2'>
                  No products selected
                </h3>
                <p className='text-muted-foreground mb-4'>
                  Add products to your purchase order to get started.
                </p>
                <Button
                  className='gap-2'
                  onClick={() => setSearchDialogOpen(true)}>
                  <Plus className='h-4 w-4' />
                  Add Products
                </Button>
              </div>
            ) : (
              <div className='space-y-4'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead className='text-center'>Quantity</TableHead>
                      <TableHead className='text-center'>Unit Price</TableHead>
                      <TableHead className='text-right'>Total</TableHead>
                      <TableHead className='w-10'></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedProducts.map((product, index) => (
                      <TableRow key={product.variant?.id || product.id}>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className='w-8 h-8 rounded object-cover'
                              />
                            )}
                            <span className='font-medium'>{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className='font-mono text-sm'>
                          {product.sku}
                        </TableCell>
                        <TableCell>
                          {product.variant ? (
                            <Badge variant='outline'>
                              {`${product.variant.color || ""}${
                                product.variant.color && product.variant.size
                                  ? " - "
                                  : ""
                              }${product.variant.size || ""}`}
                            </Badge>
                          ) : (
                            <Badge variant='secondary'>N/A</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center justify-center gap-1'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleQuantityDecrement(index)}
                              disabled={
                                !product.quantity || product.quantity <= 0
                              }
                              className='h-8 w-8 p-0'>
                              <Minus className='h-3 w-3' />
                            </Button>
                            <Input
                              type='text'
                              value={product.quantity || ""}
                              onChange={(e) =>
                                handleQuantityChange(index, e.target.value)
                              }
                              className='w-16 text-center h-8'
                              placeholder='0'
                            />
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleQuantityIncrement(index)}
                              className='h-8 w-8 p-0'>
                              <Plus className='h-3 w-3' />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type='text'
                            value={product.unitPrice || ""}
                            onChange={(e) =>
                              handleUnitPriceChange(index, e.target.value)
                            }
                            className='w-20 text-center h-8'
                            placeholder='0.00'
                          />
                        </TableCell>
                        <TableCell className='text-right font-medium'>
                          $
                          {(() => {
                            const quantity =
                              typeof product.quantity === "number"
                                ? product.quantity
                                : parseInt(String(product.quantity)) || 0;
                            const unitPrice =
                              typeof product.unitPrice === "number"
                                ? product.unitPrice
                                : parseFloat(String(product.unitPrice)) || 0;
                            return (quantity * unitPrice).toFixed(2);
                          })()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => removeProduct(index)}
                            className='h-8 w-8 p-0 text-destructive hover:text-destructive'>
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Summary */}
                <div className='flex justify-end pt-4 border-t'>
                  <div className='text-right space-y-1'>
                    <div className='flex items-center gap-8'>
                      <span className='text-muted-foreground'>
                        Total Items:
                      </span>
                      <span className='font-medium'>
                        {selectedProducts.reduce(
                          (sum, p) => sum + (p.quantity || 0),
                          0
                        )}
                      </span>
                    </div>
                    <div className='flex items-center gap-8'>
                      <span className='text-muted-foreground'>
                        Total Amount:
                      </span>
                      <span className='text-xl font-bold'>
                        ${calculateTotal()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Validation Alerts */}
        {selectedProducts.length > 0 && (
          <div className='space-y-2'>
            {selectedProducts.some((p) => !p.quantity || p.quantity <= 0) && (
              <Alert>
                <AlertTriangle className='h-4 w-4' />
                <AlertDescription>
                  Some products have invalid quantities. Please ensure all
                  quantities are greater than 0.
                </AlertDescription>
              </Alert>
            )}
            {selectedProducts.some((p) => {
              const unitPrice =
                typeof p.unitPrice === "number"
                  ? p.unitPrice
                  : parseFloat(String(p.unitPrice)) || 0;
              return !p.unitPrice || unitPrice <= 0;
            }) && (
              <Alert>
                <AlertTriangle className='h-4 w-4' />
                <AlertDescription>
                  Some products are missing unit prices. Consider adding unit
                  prices for accurate totals.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        {ProductSearchDialog()}
      </div>
    </MainView>
  );
};

export default CreatePurchaseOrder;
