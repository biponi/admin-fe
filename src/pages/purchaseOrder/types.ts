export interface Product {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  variant?: {
    id: string;
    size: string;
    color: string;
  };
}

export interface PurchaseOrder {
  id: string;
  products: Array<{title:string; productId: string; quantity: number; variantId?: string }>;
  totalAmount: number;
  createdAt: string;
}


export type ProductListResponse = {
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  purchaseOrders: PurchaseOrder[];
};

export type ProductSearchResponse = {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  image?: string;
  variant: {
    id: string;
    size: string;
    color: string;
  } | null;
};