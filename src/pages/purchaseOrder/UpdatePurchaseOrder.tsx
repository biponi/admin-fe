import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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
import { Label } from "../../components/ui/label";
import { Skeleton } from "../../components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import {
  Plus,
  Minus,
  Trash2,
  Package,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Save,
  ArrowLeft,
  Edit,
  DollarSign,
  Hash,
  Calendar,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import MainView from "../../coreComponents/mainView";
// Import API functions
import {
  fetchPurchaseOrderById,
  updatePurchaseOrder as updatePurchaseOrderAPI,
} from "./services/purchaseOrderApi";

// Types
interface ProductVariant {
  id: string;
  color?: string;
  size?: string;
}

interface PurchaseOrderProduct {
  id: string;
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  image?: string;
  variant?: ProductVariant;
  variantId?: string;
  originalQuantity?: number; // For tracking inventory changes
  availableStock?: number; // For inventory warnings
}

interface PurchaseOrder {
  id: string;
  purchaseNumber: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  products: PurchaseOrderProduct[];
  vendorId?: string;
  vendorName?: string;
  notes?: string;
}

interface ValidationError {
  field: string;
  message: string;
  productIndex?: number;
}

// Loading Skeleton Component
const UpdatePurchaseOrderSkeleton: React.FC = () => (
  <div className='space-y-6'>
    <Card>
      <CardHeader>
        <div className='flex justify-between items-start'>
          <div className='space-y-2'>
            <Skeleton className='h-6 w-48' />
            <Skeleton className='h-4 w-64' />
          </div>
          <Skeleton className='h-10 w-32' />
        </div>
      </CardHeader>
    </Card>

    {/* Stats Cards Skeleton */}
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
      {[...Array(4)].map((_, index) => (
        <Card key={index}>
          <CardHeader className='pb-2'>
            <div className='flex justify-between items-center'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className='h-8 w-16' />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Table Skeleton */}
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-32' />
        <Skeleton className='h-4 w-48' />
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className='flex justify-between items-center p-4 border rounded'>
              <div className='flex items-center gap-4'>
                <Skeleton className='h-12 w-12' />
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-3 w-24' />
                </div>
              </div>
              <div className='flex items-center gap-4'>
                <Skeleton className='h-8 w-20' />
                <Skeleton className='h-8 w-20' />
                <Skeleton className='h-8 w-8' />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const UpdatePurchaseOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(
    null
  );
  const [products, setProducts] = useState<PurchaseOrderProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [inventoryWarnings, setInventoryWarnings] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  // Fetch purchase order data
  const fetchData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const { purchaseOrder = {} } = await fetchPurchaseOrderById(id);
      setPurchaseOrder(purchaseOrder);
      setProducts(
        purchaseOrder?.products.map((p: any) => ({
          ...p,
          originalQuantity: p.quantity,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch purchase order:", error);
      toast.error("Failed to load purchase order");
      navigate("/purchase-order/list");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time total calculation
  const calculateTotal = useCallback(() => {
    return products.reduce((total, product) => {
      const quantity =
        typeof product.quantity === "number"
          ? product.quantity
          : parseInt(String(product.quantity)) || 0;
      const unitPrice =
        typeof product.unitPrice === "number"
          ? product.unitPrice
          : parseFloat(String(product.unitPrice)) || 0;
      return total + quantity * unitPrice;
    }, 0);
  }, [products]);

  // Calculate statistics
  const getStats = useCallback(() => {
    const totalItems = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const totalProducts = products.length;
    const changedProducts = products.filter(
      (p) => p.quantity !== p.originalQuantity
    ).length;
    const totalAmount = calculateTotal();

    return { totalItems, totalProducts, changedProducts, totalAmount };
  }, [products, calculateTotal]);

  // Form validation
  const validateForm = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    products.forEach((product, index) => {
      // Quantity validation
      if (!product.quantity || product.quantity <= 0) {
        errors.push({
          field: "quantity",
          message: "Quantity must be greater than 0",
          productIndex: index,
        });
      }

      if (!Number.isInteger(product.quantity)) {
        errors.push({
          field: "quantity",
          message: "Quantity must be a whole number",
          productIndex: index,
        });
      }

      // Unit price validation
      if (!product.unitPrice || product.unitPrice <= 0) {
        errors.push({
          field: "unitPrice",
          message: "Unit price must be greater than 0",
          productIndex: index,
        });
      }

      // SKU validation
      if (!product.sku || product.sku.trim() === "") {
        errors.push({
          field: "sku",
          message: "SKU is required",
          productIndex: index,
        });
      }
    });

    if (products.length === 0) {
      errors.push({
        field: "products",
        message: "Purchase order must contain at least one product",
      });
    }

    return errors;
  };

  // Check for inventory warnings
  const checkInventoryWarnings = useCallback(() => {
    const warnings: string[] = [];

    products.forEach((product) => {
      const quantityChange = product.quantity - (product.originalQuantity || 0);

      if (quantityChange > 0) {
        warnings.push(`Increasing ${product.name} by ${quantityChange} units`);
      } else if (quantityChange < 0) {
        warnings.push(
          `Decreasing ${product.name} by ${Math.abs(quantityChange)} units`
        );
      }

      // Check stock availability if available
      if (
        product.availableStock !== undefined &&
        product.quantity > product.availableStock
      ) {
        warnings.push(
          `${product.name}: Requested quantity (${product.quantity}) exceeds available stock (${product.availableStock})`
        );
      }
    });

    setInventoryWarnings(warnings);
  }, [products]);

  // Handle quantity change
  const handleQuantityChange = (index: number, value: string) => {
    if (value === "" || /^\d+$/.test(value)) {
      const newProducts = [...products];
      newProducts[index] = {
        ...newProducts[index],
        quantity: value === "" ? 0 : parseInt(value),
      };
      setProducts(newProducts);
      setHasChanges(true);
    }
  };

  // Handle unit price change
  const handleUnitPriceChange = (index: number, value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const newProducts = [...products];
      newProducts[index] = {
        ...newProducts[index],
        unitPrice: value === "" ? 0 : parseFloat(value) || 0,
      };
      setProducts(newProducts);
      setHasChanges(true);
    }
  };

  // Handle quantity increment
  const handleQuantityIncrement = (index: number) => {
    const newProducts = [...products];
    newProducts[index] = {
      ...newProducts[index],
      quantity: (newProducts[index].quantity || 0) + 1,
    };
    setProducts(newProducts);
    setHasChanges(true);
  };

  // Handle quantity decrement
  const handleQuantityDecrement = (index: number) => {
    const newProducts = [...products];
    newProducts[index] = {
      ...newProducts[index],
      quantity: Math.max(0, (newProducts[index].quantity || 0) - 1),
    };
    setProducts(newProducts);
    setHasChanges(true);
  };

  // Remove product
  const removeProduct = (index: number) => {
    const productName = products[index].name;
    setProducts((prev) => prev.filter((_, i) => i !== index));
    setHasChanges(true);
    toast.success(`Removed ${productName} from purchase order`);
  };

  // Handle form submission
  const handleUpdate = async () => {
    if (!purchaseOrder) return;

    // Validate form
    const errors = validateForm();
    setValidationErrors(errors);

    if (errors.length > 0) {
      toast.error("Please fix validation errors before updating");
      return;
    }

    setUpdating(true);
    try {
      // Prepare API payload
      const payload = {
        products: products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity,
          unitPrice: product.unitPrice,
          variantId: product.variantId,
          sku: product.sku,
        })),
      };

      const updatedOrder = await updatePurchaseOrderAPI(
        purchaseOrder.id,
        payload
      );

      // Update local state with response
      setPurchaseOrder(updatedOrder.purchaseOrder || updatedOrder);
      setProducts(
        updatedOrder.purchaseOrder?.products || updatedOrder.products || []
      );
      setHasChanges(false);
      setShowConfirmDialog(false);

      toast.success("Purchase order updated successfully!");
    } catch (error: any) {
      console.error("Failed to update purchase order:", error);

      // Handle specific error types
      if (error.response?.status === 400) {
        // Validation errors from backend
        const backendErrors = error.response.data.errors || [];
        setValidationErrors(backendErrors);
        toast.error("Validation failed. Please check the form.");
      } else if (error.response?.status === 404) {
        toast.error("Purchase order or product not found");
      } else {
        toast.error("Failed to update purchase order. Please try again.");
      }
    } finally {
      setUpdating(false);
    }
  };

  // Check for warnings when products change
  useEffect(() => {
    checkInventoryWarnings();
  }, [checkInventoryWarnings]);

  if (loading) {
    return (
      <MainView title='Update Purchase Order'>
        <div className='container mx-auto p-6'>
          <UpdatePurchaseOrderSkeleton />
        </div>
      </MainView>
    );
  }

  if (!purchaseOrder) {
    return (
      <MainView title='Update Purchase Order'>
        <div className='container mx-auto p-6'>
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-16'>
              <AlertTriangle className='w-12 h-12 text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold mb-2'>
                Purchase Order Not Found
              </h3>
              <p className='text-muted-foreground text-center mb-6 max-w-md'>
                The purchase order you're looking for doesn't exist or has been
                deleted.
              </p>
              <Button onClick={() => navigate("/purchase-order/list")}>
                <ArrowLeft className='w-4 h-4 mr-2' />
                Back to Purchase Orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainView>
    );
  }

  const stats = getStats();
  const hasValidationErrors = validationErrors.length > 0;

  return (
    <MainView title='Update Purchase Order'>
      <div className='container mx-auto p-6 space-y-6'>
        {/* Header */}
        <Card>
          <CardHeader>
            <div className='flex justify-between items-start'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <Edit className='h-5 w-5' />
                  Update Purchase Order #{purchaseOrder.purchaseNumber}
                </CardTitle>
                <CardDescription className='mt-2'>
                  Modify product quantities and pricing for this purchase order
                </CardDescription>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  onClick={() => navigate("/purchase-order/list")}
                  disabled={updating}>
                  <ArrowLeft className='w-4 h-4 mr-2' />
                  Back
                </Button>
                <Button
                  onClick={fetchData}
                  variant='outline'
                  disabled={loading || updating}>
                  <RefreshCw className='w-4 h-4 mr-2' />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Products
              </CardTitle>
              <Package className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Items</CardTitle>
              <Hash className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.totalItems}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Changed Products
              </CardTitle>
              <Edit className='h-4 w-4 text-amber-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-amber-600'>
                {stats.changedProducts}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Amount
              </CardTitle>
              <DollarSign className='h-4 w-4 text-green-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                ৳{stats.totalAmount.toLocaleString()}
              </div>
              {purchaseOrder.totalAmount !== stats.totalAmount && (
                <p className='text-xs text-muted-foreground'>
                  Original: ৳{purchaseOrder.totalAmount.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Validation Errors */}
        {hasValidationErrors && (
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              <div className='font-medium mb-2'>
                Please fix the following errors:
              </div>
              <ul className='list-disc list-inside space-y-1'>
                {validationErrors.map((error, index) => (
                  <li key={index} className='text-sm'>
                    {error.productIndex !== undefined
                      ? `Product ${error.productIndex + 1}: ${error.message}`
                      : error.message}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Inventory Warnings */}
        {inventoryWarnings.length > 0 && (
          <Alert>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              <div className='font-medium mb-2'>Inventory Changes:</div>
              <ul className='list-disc list-inside space-y-1'>
                {inventoryWarnings.map((warning, index) => (
                  <li key={index} className='text-sm'>
                    {warning}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Modify quantities and unit prices for each product
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className='flex flex-col items-center justify-center p-12 text-center'>
                <Package className='h-16 w-16 text-muted-foreground mb-4' />
                <h3 className='text-lg font-semibold mb-2'>No Products</h3>
                <p className='text-muted-foreground'>
                  This purchase order has no products.
                </p>
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
                      <TableHead className='text-center'>
                        Unit Price (৳)
                      </TableHead>
                      <TableHead className='text-right'>Total (৳)</TableHead>
                      <TableHead className='w-10'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product, index) => {
                      const hasQuantityError = validationErrors.some(
                        (e) =>
                          e.productIndex === index && e.field === "quantity"
                      );
                      const hasPriceError = validationErrors.some(
                        (e) =>
                          e.productIndex === index && e.field === "unitPrice"
                      );
                      const hasChanged =
                        product.quantity !== product.originalQuantity;

                      return (
                        <TableRow
                          key={product.id}
                          className={hasChanged ? "bg-amber-50" : ""}>
                          <TableCell>
                            <div className='flex items-center gap-3'>
                              {product.image && (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className='w-8 h-8 rounded object-cover'
                                />
                              )}
                              <div>
                                <span className='font-medium'>
                                  {product.name}
                                </span>
                                {hasChanged && (
                                  <div className='text-xs text-amber-600 flex items-center gap-1'>
                                    <Edit className='h-3 w-3' />
                                    Modified
                                  </div>
                                )}
                              </div>
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
                                  updating ||
                                  !product.quantity ||
                                  product.quantity <= 0
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
                                className={`w-16 text-center h-8 ${
                                  hasQuantityError ? "border-red-500" : ""
                                }`}
                                placeholder='0'
                                disabled={updating}
                              />
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => handleQuantityIncrement(index)}
                                disabled={updating}
                                className='h-8 w-8 p-0'>
                                <Plus className='h-3 w-3' />
                              </Button>
                            </div>
                            {hasQuantityError && (
                              <div className='text-xs text-red-500 mt-1 text-center'>
                                {
                                  validationErrors.find(
                                    (e) =>
                                      e.productIndex === index &&
                                      e.field === "quantity"
                                  )?.message
                                }
                              </div>
                            )}
                          </TableCell>

                          <TableCell>
                            <Input
                              type='text'
                              value={product.unitPrice || ""}
                              onChange={(e) =>
                                handleUnitPriceChange(index, e.target.value)
                              }
                              className={`w-20 text-center h-8 ${
                                hasPriceError ? "border-red-500" : ""
                              }`}
                              placeholder='0.00'
                              disabled={updating}
                            />
                            {hasPriceError && (
                              <div className='text-xs text-red-500 mt-1 text-center'>
                                {
                                  validationErrors.find(
                                    (e) =>
                                      e.productIndex === index &&
                                      e.field === "unitPrice"
                                  )?.message
                                }
                              </div>
                            )}
                          </TableCell>

                          <TableCell className='text-right font-medium'>
                            ৳
                            {(
                              (product.quantity || 0) * (product.unitPrice || 0)
                            ).toFixed(2)}
                          </TableCell>

                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  disabled={updating}
                                  className='h-8 w-8 p-0 text-destructive hover:text-destructive'>
                                  <Trash2 className='h-4 w-4' />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Remove Product
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove "
                                    {product.name}" from this purchase order?
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => removeProduct(index)}
                                    className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Summary */}
                <div className='flex justify-end pt-4 border-t'>
                  <div className='text-right space-y-2'>
                    <div className='flex items-center gap-8'>
                      <span className='text-muted-foreground'>
                        Total Items:
                      </span>
                      <span className='font-medium'>{stats.totalItems}</span>
                    </div>
                    <div className='flex items-center gap-8'>
                      <span className='text-muted-foreground'>
                        Total Amount:
                      </span>
                      <span className='text-xl font-bold text-primary'>
                        ৳{stats.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    {purchaseOrder.totalAmount !== stats.totalAmount && (
                      <div className='flex items-center gap-8 text-sm'>
                        <span className='text-muted-foreground'>Change:</span>
                        <span
                          className={`font-medium ${
                            stats.totalAmount > purchaseOrder.totalAmount
                              ? "text-red-600 flex items-center gap-1"
                              : "text-green-600 flex items-center gap-1"
                          }`}>
                          {stats.totalAmount > purchaseOrder.totalAmount ? (
                            <TrendingUp className='h-3 w-3' />
                          ) : (
                            <TrendingDown className='h-3 w-3' />
                          )}
                          ৳
                          {Math.abs(
                            stats.totalAmount - purchaseOrder.totalAmount
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className='flex justify-end gap-4'>
          <AlertDialog
            open={showDiscardDialog}
            onOpenChange={setShowDiscardDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant='outline'
                onClick={() => {
                  if (hasChanges) {
                    setShowDiscardDialog(true);
                  } else {
                    navigate("/purchase-order/list");
                  }
                }}
                disabled={updating}>
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
                <AlertDialogDescription>
                  You have unsaved changes. Are you sure you want to discard
                  them and return to the purchase orders list?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={updating}>
                  Keep Editing
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setShowDiscardDialog(false);
                    navigate("/purchase-order/list");
                  }}
                  disabled={updating}
                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                  Discard Changes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}>
            <AlertDialogTrigger asChild>
              <Button
                disabled={updating || !hasChanges || hasValidationErrors}
                className='gap-2'>
                {updating ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Save className='h-4 w-4' />
                )}
                {updating ? "Updating..." : "Update Purchase Order"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Confirm Purchase Order Update
                </AlertDialogTitle>
                <AlertDialogDescription className='space-y-2'>
                  <p>
                    You are about to update this purchase order with the
                    following changes:
                  </p>
                  <ul className='list-disc list-inside text-sm space-y-1 mt-4'>
                    <li>{stats.changedProducts} products modified</li>
                    <li>Total amount: ৳{stats.totalAmount.toLocaleString()}</li>
                    {inventoryWarnings.length > 0 && (
                      <li className='text-amber-600'>
                        {inventoryWarnings.length} inventory adjustments
                      </li>
                    )}
                  </ul>
                  <p className='mt-4 text-sm font-medium'>
                    This action will update inventory levels and cannot be
                    easily undone.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={updating}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleUpdate} disabled={updating}>
                  {updating ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin mr-2' />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className='h-4 w-4 mr-2' />
                      Confirm Update
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label className='text-sm text-muted-foreground'>
                  Purchase Number
                </Label>
                <div className='font-mono'>{purchaseOrder.purchaseNumber}</div>
              </div>

              <div className='space-y-2'>
                <Label className='text-sm text-muted-foreground'>
                  Original Total
                </Label>
                <div>৳{purchaseOrder.totalAmount.toLocaleString()}</div>
              </div>

              <div className='space-y-2'>
                <Label className='text-sm text-muted-foreground'>
                  Created At
                </Label>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  {new Date(purchaseOrder.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </div>
              </div>

              <div className='space-y-2'>
                <Label className='text-sm text-muted-foreground'>
                  Last Updated
                </Label>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  {new Date(purchaseOrder.updatedAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainView>
  );
};

export default UpdatePurchaseOrder;
