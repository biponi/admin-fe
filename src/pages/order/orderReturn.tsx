import React, { useState } from "react";
import config from "../../utils/config";
import { IOrder } from "./interface";
import axiosInstance from "../../api/axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "../../components/ui/card"; // Assuming Shadcn UI Card is available
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

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

  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.post(config.order.returnProducts(), {
        orderId: order.id,
        products: selectedProducts,
      });

      alert(`Return adjusted. Refund: ${response.data.refundAmount}`);
      handleClose();
    } catch (error) {
      console.error("Error adjusting return:", error);
      alert("Failed to adjust return.");
    }
  };

  return (
    <div className="bg-white rounded-lg  max-w-2xl mx-auto">
      <div className="grid grid-cols-1 gap-2 max-h-[80vh] overflow-y-auto ">
        {order?.products?.length < 1 && (
          <div className="w-full flex justify-center items-center p-6">
            <Badge variant={"destructive"}>No product Found</Badge>
          </div>
        )}
        {order.products.map((product) => (
          <Card key={product.productId} className="p-4 shadow-lg rounded-lg">
            <CardHeader>
              <h3 className="text-xl font-semibold text-gray-950">
                {product.name}
              </h3>
              <p className="text-sm text-gray-800">
                Price: {product.totalPrice}
              </p>
              <p className="text-sm text-gray-800">
                Quantity: {product.quantity}
              </p>
              {product.hasVariation && product.variation && (
                <p className="text-sm text-gray-800">
                  Variation: {product.variation.color}, {product.variation.size}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <input
                type="number"
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                placeholder="Return Quantity"
                min="1"
                max={product.quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (val <= product?.quantity) {
                    handleProductSelection(
                      product.productId,
                      product.hasVariation ? product.variation.id : null,
                      parseInt(e.target.value, 10)
                    );
                  }
                }}
              />
            </CardContent>
            <CardFooter>
              <p className="text-xs text-red-400">
                Max quantity: {product.quantity}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>

      {order?.products?.length > 0 && (
        <div className="mt-6 flex justify-end items-center gap-2">
          <Button onClick={handleSubmit}>Submit Return</Button>
          <Button onClick={() => handleClose()} variant={"destructive"}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdjustReturnProduct;
