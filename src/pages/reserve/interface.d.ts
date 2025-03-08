import { Document } from "mongoose";

export interface IRecordProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  variantId: string;
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
