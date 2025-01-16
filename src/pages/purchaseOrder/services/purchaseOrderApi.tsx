// src/services/purchaseOrderApi.ts
import axios from "../../../api/axios";
import { ProductListResponse, ProductSearchResponse } from "../types";
import config from "../../../utils/config";

export const fetchPurchaseOrders = async (): Promise<ProductListResponse> => {
  const response = await axios.get(config.purchaseOrder.purchaseList());
  return response.data;
};

export const searchProducts = async (
  query: string
): Promise<ProductSearchResponse[]> => {
  const response = await axios.get(
    `${config.purchaseOrder.purchaseSearch()}?query=${query}`
  );
  return response.data;
};

export const createPurchaseOrder = async (
  products: ProductSearchResponse[]
): Promise<void> => {
  const orderProducts = products.map((p) => ({
    productId: p.id,
    quantity: p.quantity,
    variantId: p.variant?.id,
  }));

  await axios.post(config.purchaseOrder.createPurchaseOrder(), {
    products: orderProducts,
  });
};

export const deletePurchaseOrder = async (id: string): Promise<void> => {
  await axios.delete(`${config.purchaseOrder.deletePurchaseOrder(id)}`);
};

export const restorePurchaseOrder = async (id: string): Promise<void> => {
  await axios.delete(`${config.purchaseOrder.restorePurchaseOrder(id)}`);
};
