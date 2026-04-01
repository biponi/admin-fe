import { Document } from "mongoose";

export interface VariantDetails {
  size?: string;
  color?: string;
  image?: string;
}

export interface IRecordProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  variantId: string;
  image?: string;
  variantDetails?: VariantDetails;
}

export interface IRecord {
  id: string;
  created_at: Date;
  created_by: string;
  products: IRecordProduct[];
  _id: string;
}

export interface IStoreReserve extends Document {
  name: string;
  location: string;
  timestamp: Date;
  slug: string;
  records: IRecord[];
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IStoreReservePaginated {
  id: string;
  name: string;
  location: string;
  timestamp: Date;
  slug: string;
  records: IRecord[];
  pagination: PaginationInfo;
}
