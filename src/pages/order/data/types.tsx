export type ProductType = {
  id: string;
  name: string;
  manu_id: string;
  justIn?: boolean;
  rating?: number;
  hasDiscount?: boolean;
  updatedPrice?: number;
  description: string;
  discount: number;
  discountType?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  active: boolean;
  thumbnail: string;
  images: string[];
  categoryId: string;
  productCode?: string; // Optional property (can be undefined)
  hasVariation: boolean;
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
  };
  variation: Variation[]; // Array of variations
};

export type Variation = {
  id: string;
  size: string;
  color: string;
  name: string;
  title: string;
  sku: string;
  quantity: number;
  unitPrice: number;
};

export type Category = {
  id: string;
  name: string;
  discount: number;
  active: boolean;
  img: string;
};

export type RatingDetailsType = {
  index: number;
  value: number;
};

export type SingleProductType = {
  id: string;
  name: string;
  description: string;
  discountType: string;
  discount: number;
  quantity: number;
  unitPrice: number;
  thumbnail: string;
  images: string[];
  categoryId: string;
  productCode: string;
  hasDiscount?: boolean;
  updatedPrice?: number;
  hasVariation: boolean;
  categoryName: string;
  categoryImg: string;
  rating: number;
  ratingDetails: RatingDetailsType[];
  sku: string; // Index SKU field
  variation: Variation[]; // Adjust the type of `variation` based on its structure
};

export type BlogData = {
  sectionOne: {
    title: string;
    paragraph1: string;
    points: string[];
    paragraph2: string;
  };
  sectionTwo: {
    title: string;
    description: string;
    midImage: string;
  };
  sectionThree: {
    title: string;
    description: string;
  };
  sectionFour: {
    title: string;
    description: string;
    points: string[];
  };
  quote: string;
  sectionFive: {
    title: string;
    description: string;
  }[];
};

export type BlogType = {
  title: string;
  brief: string;
  date: string;
  coverImage: string;
  blogData: BlogData;
  tag: "Style" | "Fitting" | "General";
  slug: string;
};
