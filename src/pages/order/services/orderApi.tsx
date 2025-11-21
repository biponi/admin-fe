// src/services/purchaseOrderApi.ts
import axios from "../../../api/axios";
import { ProductListResponse, ProductSearchResponse } from "../interface";
import config from "../../../utils/config";
import { modifyOrder, ModifyOrderPayload } from "../../../api/order";

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

/**
 * Modify order products using the new production-ready API
 * Migrated from old endpoint to use new /api/v1/order/modify/:orderId
 */
export const modifyOrderProducts = async (
  orderId: string,
  products: ProductSearchResponse[]
): Promise<any> => {
  // Transform products to new API format
  // Old format: { sku, productId, selectedQuantity, unitPrice, variantId }
  // New format: { productId, quantity, variationId? }
  const transformedProducts = products.map((p) => ({
    productId: p.id,
    quantity: parseInt(`${p.quantity}`),
    ...(p.variant?.id && { variationId: p.variant.id }),
  }));

  // Build payload for new API
  const payload: ModifyOrderPayload = {
    products: transformedProducts,
  };

  // Call new API endpoint
  const response = await modifyOrder(orderId, payload);

  if (!response.success) {
    throw new Error(response.error || "Failed to modify order");
  }

  return response.data;
};

export const deletePurchaseOrder = async (id: string): Promise<void> => {
  await axios.delete(`${config.purchaseOrder.deletePurchaseOrder(id)}`);
};

export const restorePurchaseOrder = async (id: string): Promise<void> => {
  await axios.delete(`${config.purchaseOrder.restorePurchaseOrder(id)}`);
};
