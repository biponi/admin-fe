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
}

export interface IOrder {
  id: number;
  orderNumber: number;
  customer: {
    name: string;
    email?: string; // Optional email field
    phoneNumber: string;
  };
  status: string;
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
