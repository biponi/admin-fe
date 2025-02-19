interface IDistrict {
  id: string;
  division_id: string;
  name: string;
  bn_name: string;
  lat: string;
  long: string;
}

interface IDivision {
  id: string;
  name: string;
  bn_name: string;
  lat: string;
  long: string;
}

export interface ITransection {
  totalPrice: number;
  paid: number;
  remaining: number;
  discount: number;
  deliveryCharge: number;
}

export interface IOrder {
  id: number;
  orderNumber: number;
  customer: {
    name: string;
    email?: string; // Optional email field
    phoneNumber: string;
  };
  notes?: string;
  status: string;
  deliveryCharge: number;
  totalPrice: number;
  paid: number;
  discount: number;
  remaining: number;
  timestamps: {
    createdAt: string;
    updatedAt: string;
  };
  payment?: {
    paymentType: string;
    paymentBy: string;
    amount: number;
    date: Date;
    transectionId?: string; // Optional transaction ID field
  }[];
  shipping: {
    division: string;
    district: string;
    address: string;
  };
  products: {
    id?: string;
    productId: string;
    name: string;
    thumbnail: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discount: number;
    hasVariation: boolean;
    variation: {
      id: string;
      size: string;
      color: string;
    };
  }[];
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
  unitPrice: number | string;
  updatePrice: number | string;
  discount: number | string;
  quantity: number;
  maxQuantity: number;
  image?: string;
  variant: {
    id: string;
    size: string;
    color: string;
  } | null;
};
