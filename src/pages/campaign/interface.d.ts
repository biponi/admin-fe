export interface ICampaingProducts{
    id:string;
     name:string;
      description:string;
       thumbnail:string;
        quantity:number;
        active:boolean;
         unitPrice:number;
}
export interface ICampaign {
  id: string;
  title: string;
  description: string;
  image?: string; // Optional since the image is not required
  products: ICampaingProducts[]; // Assuming Product interface is defined
  discount: number;
  discountType?: string; // Optional with default '%'
  startDate: Date;
  endDate: Date;
  active?: boolean; // Optional with default true
}