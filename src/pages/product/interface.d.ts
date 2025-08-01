export interface IProduct {
  id: string;
  sku: string;
  name: string;
  active: boolean;
  quantity: number;
  unitPrice: number;
  manufactureId: string;
  discount: number;
  updatedPrice: number;
  dicountType: string;
  hasDiscount: boolean;
  description: string;
  thumbnail: string;
  productCode: string;
  totalPrice: number;
  categoryName?: string;
  hasVariation?: boolean;
  variation: IVariation[];
  variantList?: string[];
  sold?: { status: string; sold: number }[];
  returned?: number;
  created_at: string; // Assuming the date/time string format
  timestamps: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface IOrderProduct extends IProduct {
  selectedQuantity: number;
  selectedVariant?: IVariation;
}

export interface IVariation {
  id: string;
  size: string;
  color: string;
  name: string;
  title: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface IProductCreateData {
  name: string;
  active: boolean;
  quantity: number;
  unitPrice: number;
  manufactureId: string;
  discount: number;
  discountType: string;
  description: string;
  thumbnail: File | null;
  variation: IVariation[]; // Assuming variation can be an array of any type
  sku: string;
  categoryId: string;
  images: File[] | [];
}

export interface IProductUpdateData {
  id: string;
  name: string;
  active: boolean;
  quantity: number;
  unitPrice: number;
  manufactureId: string;
  discount: number;
  discountType: string;
  description: string;
  thumbnail: string | File | null;
  variation: IVariation[]; // Assuming variation can be an array of any type
  sku: string;
  categoryId: string;
  images: File[] | [];

  removeImageIndexes?: string[];
  removeAbleVarations?: string[];
}
// Updated interfaces for hierarchical categories

export interface ICategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  discount: number;
  active: boolean;
  google_category_type?: string;
  img?: string;

  // Hierarchy fields
  parentId?: string | null;
  level?: number;
  ancestors?: string[];

  // API response fields
  totalProducts?: number;
  totalChildren?: number;
  parent?: string; // Parent name from API
  parentCategoryName?: string;
  categoryHierarchy?: Array<{
    id: string;
    name: string;
    slug: string;
    level: number;
  }>;

  // For tree view
  children?: ICategory[];
}

export interface ICreateCategory {
  name: string;
  description?: string;
  discount?: number;
  active?: boolean;
  google_category_type?: string;
  img?: File | string;
  parentId?: string | null;
}

export interface ICategoryTree extends ICategory {
  children: ICategoryTree[];
}

// Form interfaces
export interface IChangeEvent {
  target: {
    name: string;
    value: string | number | boolean;
  };
}

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ICategoryListResponse {
  categories: ICategory[];
  totalCount?: number;
}

export interface ICategoryTreeResponse {
  tree: ICategoryTree[];
}

// Filter and search interfaces
export interface ICategoryFilters {
  level?: number;
  parentId?: string;
  active?: boolean;
  search?: string;
}

export interface ICategoryMoveRequest {
  newParentId: string | null;
}

// Component prop interfaces
export interface ISingleCategoryProps {
  id: string;
  image?: string;
  name: string;
  active: boolean;
  discount: number;
  totalProduct?: number;
  level?: number;
  parentName?: string;
  breadcrumb?: string;
  isChild?: boolean;
  handleEditBtnClick: () => void;
  deleteExistingCategory: (id: string, force?: boolean) => Promise<boolean>;
}

export interface CategoryStockSummary {
  categoryId: string;
  categoryName: string;
  totalStock: number;
  totalActiveProducts: number;
  totalVariants: number;
  totalPrice: number;
}

export interface StockSummaryResponse {
  categories: CategoryStockSummary[];
  totalActiveProductPrice: number;
  totalActiveProducts: number;
  totalActiveProductVariations: number;
  totalActiveProductType: number;
}
