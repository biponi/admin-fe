import React, { useState } from "react";
import config from "../../utils/config";
import { IOrder } from "./interface";
import axiosInstance from "../../api/axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import {
  RotateCcw,
  Package,
  AlertTriangle,
  CheckCircle2,
  X,
  Minus,
  Plus,
  Calculator
} from "lucide-react";
import { toast } from "react-hot-toast";

// Define types
interface Variation {
  id: string;
  color?: string;
  size?: string;
}

interface SelectedProduct {
  productId: string;
  hasVariation: boolean;
  variation?: Variation | null;
  quantity: number;
}

interface AdjustReturnProductProps {
  order: IOrder;
  handleClose: () => void;
}

const AdjustReturnProduct: React.FC<AdjustReturnProductProps> = ({
  order,
  handleClose,
}) => {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );

  const handleProductSelection = (
    productId: string,
    variationId: string | null,
    quantity: number
  ) => {
    setSelectedProducts((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === productId &&
          (!item.variation || item.variation.id === variationId)
      );

      if (existingIndex !== -1) {
        // Update quantity for existing product/variation
        const updated = [...prev];
        updated[existingIndex].quantity = quantity;
        return updated;
      }

      // Add new product/variation
      return [
        ...prev,
        {
          productId,
          hasVariation: !!variationId,
          variation: variationId ? { id: variationId } : null,
          quantity,
        },
      ];
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const getTotalRefundAmount = () => {
    return selectedProducts.reduce((total, selectedProduct) => {
      const product = order.products.find(p => 
        p.productId === selectedProduct.productId && 
        (!selectedProduct.variation || p.variation?.id === selectedProduct.variation?.id)
      );
      if (product) {
        const unitPrice = product.totalPrice / product.quantity;
        return total + (unitPrice * selectedProduct.quantity);
      }
      return total;
    }, 0);
  };
  
  const handleQuantityChange = (productId: string, variationId: string | null, newQuantity: number) => {
    const product = order.products.find(p => 
      p.productId === productId && 
      (!variationId || p.variation?.id === variationId)
    );
    
    if (!product) return;
    
    if (newQuantity < 0) {
      toast.error('Quantity cannot be negative');
      return;
    }
    
    if (newQuantity > product.quantity) {
      toast.error(`Maximum quantity available is ${product.quantity}`);
      return;
    }
    
    if (newQuantity === 0) {
      setSelectedProducts(prev => 
        prev.filter(item => 
          !(item.productId === productId && 
            (!item.variation || item.variation.id === variationId))
        )
      );
    } else {
      handleProductSelection(productId, variationId, newQuantity);
    }
  };

  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product to return');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(config.order.returnProducts(), {
        orderId: order.id,
        products: selectedProducts,
      });

      toast.success(`Return processed successfully! Refund: ৳${response.data.refundAmount}`);
      handleClose();
    } catch (error) {
      console.error("Error adjusting return:", error);
      toast.error("Failed to process return. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Return Products</h2>
              <p className="text-orange-100 mt-1">Order #{order.orderNumber}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {order?.products?.length < 1 ? (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              No products found in this order to return.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Instructions */}
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <Package className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Select the products and quantities you want to return. The refund amount will be calculated automatically.
              </AlertDescription>
            </Alert>

            {/* Products List */}
            <ScrollArea className="max-h-[50vh] pr-4">
              <div className="space-y-4">
                {order.products.map((product, index) => {
                  const selectedProduct = selectedProducts.find(sp => 
                    sp.productId === product.productId && 
                    (!sp.variation || sp.variation.id === product.variation?.id)
                  );
                  const returnQuantity = selectedProduct?.quantity || 0;
                  const unitPrice = product.totalPrice / product.quantity;
                  const refundAmount = unitPrice * returnQuantity;

                  return (
                    <Card key={`${product.productId}-${product.variation?.id || 'no-variant'}`} className="border-2 hover:border-orange-200 transition-all duration-200">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg font-semibold text-gray-900">
                                {product.name}
                              </CardTitle>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  Ordered: {product.quantity}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Price: ৳{product.totalPrice}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Unit: ৳{unitPrice.toFixed(2)}
                                </Badge>
                                {product.hasVariation && product.variation && (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    {product.variation.color} {product.variation.color && product.variation.size && '•'} {product.variation.size}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {returnQuantity > 0 && (
                            <div className="text-right">
                              <div className="text-sm text-green-600 font-medium">
                                Refund: ৳{refundAmount.toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Return Quantity</Label>
                            <div className="flex items-center gap-3 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(
                                  product.productId,
                                  product.hasVariation ? product.variation?.id || null : null,
                                  Math.max(0, returnQuantity - 1)
                                )}
                                disabled={returnQuantity <= 0}
                                className="h-10 w-10 p-0"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              
                              <Input
                                type="number"
                                value={returnQuantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  handleQuantityChange(
                                    product.productId,
                                    product.hasVariation ? product.variation?.id || null : null,
                                    val
                                  );
                                }}
                                min="0"
                                max={product.quantity}
                                className="text-center h-10 w-20 font-medium"
                              />
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(
                                  product.productId,
                                  product.hasVariation ? product.variation?.id || null : null,
                                  Math.min(product.quantity, returnQuantity + 1)
                                )}
                                disabled={returnQuantity >= product.quantity}
                                className="h-10 w-10 p-0"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuantityChange(
                                  product.productId,
                                  product.hasVariation ? product.variation?.id || null : null,
                                  product.quantity
                                )}
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 ml-2"
                              >
                                Return All
                              </Button>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Maximum: {product.quantity} items
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Summary */}
            {selectedProducts.length > 0 && (
              <>
                <Separator className="my-6" />
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <Calculator className="w-5 h-5" />
                      Return Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedProducts.map(selectedProduct => {
                        const product = order.products.find(p => 
                          p.productId === selectedProduct.productId && 
                          (!selectedProduct.variation || p.variation?.id === selectedProduct.variation.id)
                        );
                        if (!product) return null;
                        
                        const unitPrice = product.totalPrice / product.quantity;
                        const refundAmount = unitPrice * selectedProduct.quantity;
                        
                        return (
                          <div key={`${selectedProduct.productId}-${selectedProduct.variation?.id || 'summary'}`} className="flex justify-between items-center py-2 border-b border-green-100 last:border-b-0">
                            <div>
                              <span className="font-medium text-gray-900">{product.name}</span>
                              {product.hasVariation && product.variation && (
                                <span className="text-sm text-gray-600 ml-2">
                                  ({product.variation.color} {product.variation.size})
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900">
                                {selectedProduct.quantity} × ৳{unitPrice.toFixed(2)} = ৳{refundAmount.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="flex justify-between items-center pt-3 border-t-2 border-green-200">
                        <span className="text-lg font-bold text-green-800">Total Refund</span>
                        <span className="text-xl font-bold text-green-800">৳{getTotalRefundAmount().toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={selectedProducts.length === 0 || isSubmitting}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Process Return
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdjustReturnProduct;
