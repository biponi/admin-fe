// src/services/purchaseOrderApi.ts
import axios from "../../../api/axios";
import { ProductListResponse, ProductSearchResponse } from "../interface";
import config from "../../../utils/config";

export const fetchPurchaseOrders = async (): Promise<ProductListResponse> => {
  const response = await axios.get(config.purchaseOrder.purchaseList());
  return response.data;
};

export const searchProducts = async (
  query: string
): Promise<ProductSearchResponse[]> => {
  const response = await axios.get(
    `${config.product.searchProductV2()}?query=${query}`
  );
  return response.data;
};

export const modifyOrderProducts = async (
  orderId: string,
  products: ProductSearchResponse[]
): Promise<void> => {
  const orderProducts = products.map((p) => ({
    sku: p.sku,
    productId: p.id,
    selectedQuantity: parseInt(`${p.quantity}`),
    unitPrice: p.unitPrice,
    variantId: p.variant?.id,
  }));

  await axios.put(config.order.modifyOrderProducts(orderId), {
    products: orderProducts,
  });
};

export const deletePurchaseOrder = async (id: string): Promise<void> => {
  await axios.delete(`${config.purchaseOrder.deletePurchaseOrder(id)}`);
};

export const restorePurchaseOrder = async (id: string): Promise<void> => {
  await axios.delete(`${config.purchaseOrder.restorePurchaseOrder(id)}`);
};
