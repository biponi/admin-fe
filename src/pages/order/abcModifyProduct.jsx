import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import { useToast } from "../../components/ui/use-toast";
import axiosInstance from "../../api/axios";

const UpdateOrderProducts = ({ orderId, initialProducts, allProducts }) => {
  const [orderProducts, setOrderProducts] = useState(initialProducts);
  const { toast } = useToast();

  const handleAddProduct = () => {
    setOrderProducts([
      ...orderProducts,
      {
        id: "",
        productId: "",
        name: "",
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        variation: { id: "", size: "", color: "" },
        hasVariation: false,
      },
    ]);
  };

  const handleRemoveProduct = (index) => {
    setOrderProducts(orderProducts.filter((_, i) => i !== index));
  };

  const handleUpdateProduct = (index, field, value) => {
    const updatedProducts = [...orderProducts];
    updatedProducts[index][field] = value;

    if (field === "quantity" || field === "unitPrice") {
      updatedProducts[index].totalPrice =
        updatedProducts[index].quantity * updatedProducts[index].unitPrice;
    }

    setOrderProducts(updatedProducts);
  };

  const handleSaveChanges = async () => {
    try {
    await axiosInstance.post(
        `/api/orders/${orderId}/update-products`,
        {
          products: orderProducts,
        }
      );
      toast({ title: "Order updated successfully", status: "success" });
    } catch (error) {
      toast({
        title: "Failed to update order",
        description: error.message,
        status: "error",
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-md shadow">
      <h2 className="text-xl font-bold mb-4">Update Order Products</h2>
      {orderProducts.map((product, index) => (
        <div key={index} className="mb-4 border-b pb-4">
          <div className="flex gap-4 items-center">
            {/* Product Select */}
            <Select
              value={product.productId}
              onValueChange={(value) =>
                handleUpdateProduct(index, "productId", value)
              }
            >
              <SelectTrigger className="w-1/3">
                <SelectValue placeholder="Select Product" />
              </SelectTrigger>
              <SelectContent>
                {allProducts.map((prod) => (
                  <SelectItem key={prod.id} value={prod.id}>
                    {prod.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Quantity */}
            <Input
              type="number"
              className="w-1/4"
              value={product.quantity}
              onChange={(e) =>
                handleUpdateProduct(index, "quantity", +e.target.value)
              }
              placeholder="Quantity"
            />

            {/* Unit Price */}
            <Input
              type="number"
              className="w-1/4"
              value={product.unitPrice}
              onChange={(e) =>
                handleUpdateProduct(index, "unitPrice", +e.target.value)
              }
              placeholder="Unit Price"
            />

            {/* Total Price */}
            <Input
              type="number"
              className="w-1/4"
              value={product.totalPrice}
              readOnly
              placeholder="Total Price"
            />

            {/* Remove Product */}
            <Button
              variant="destructive"
              onClick={() => handleRemoveProduct(index)}
            >
              Remove
            </Button>
          </div>

          {/* Variation Options */}
          {product.hasVariation && (
            <div className="mt-4 flex gap-4">
              <Input
                type="text"
                className="w-1/3"
                value={product.variation.size}
                onChange={(e) =>
                  handleUpdateProduct(index, "variation", {
                    ...product.variation,
                    size: e.target.value,
                  })
                }
                placeholder="Size"
              />
              <Input
                type="text"
                className="w-1/3"
                value={product.variation.color}
                onChange={(e) =>
                  handleUpdateProduct(index, "variation", {
                    ...product.variation,
                    color: e.target.value,
                  })
                }
                placeholder="Color"
              />
            </div>
          )}
        </div>
      ))}

      {/* Add Product Button */}
      <Button variant="secondary" onClick={handleAddProduct}>
        Add Product
      </Button>

      {/* Save Changes */}
      <Button className="mt-4" onClick={handleSaveChanges}>
        Save Changes
      </Button>
    </div>
  );
};

export default UpdateOrderProducts;
