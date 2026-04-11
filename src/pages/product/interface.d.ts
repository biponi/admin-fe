export interface IProduct {
  id: string;
  sku: string;
  slug: string;
  name: string;
  active: boolean;
  quantity: number;
  unitPrice: number;
  manufactureId: string;
  discount: number;
  updatedPrice: number;
  discountType: string;
  hasDiscount: boolean;
  description: string;
  thumbnail: string;
  productCode: string;
  totalPrice: number;
  categoryName?: string; // @deprecated - Use categoryNames for multi-category support
  categoryNames?: string[]; // Multiple category names
  categoryId?: string; // Primary category ID
  categoryIds?: string[]; // All category IDs including primary
  hasVariation?: boolean;
  variation: IVariation[];
  variantList?: string[];
  totalSold?: number;
  totalReturned?: number;
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
  images?: (File | string)[]; // Variant images (File for new uploads, string for existing URLs)
}

// Variant image mapping for upload
export interface IVariantImageMapping {
  variantId: string;
  imageIndexes: number[]; // Indices pointing to the variantImages array
}

// Variant image removal mapping for edit
export interface IRemoveVariantImageMapping {
  variantId: string;
  imageIndexes: number[]; // Indices to remove from variant.images array
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
  categoryId: string; // Primary category ID (must match categoryIds[0])
  categoryIds?: string[]; // All category IDs including primary (optional for single category)
  images: File[] | [];
  variantImages?: File[]; // New variant image files to upload
  variantImageMappings?: IVariantImageMapping[]; // Maps variantIds to image indices
  commissionType?: "percentage" | "fixed" | "none";
  commissionRate?: number;
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
  categoryId: string; // Primary category ID (must match categoryIds[0] if provided)
  categoryIds?: string[]; // All category IDs including primary (optional for single category)
  images: File[] | [];

  removeImageIndexes?: string[];
  removeAbleVarations?: string[];
  variantImages?: File[]; // New variant image files to upload
  variantImageMappings?: IVariantImageMapping[]; // Maps variantIds to image indices
  removeVariantImageIndexes?: IRemoveVariantImageMapping[]; // Variant images to remove
  commissionType?: "percentage" | "fixed" | "none";
  commissionRate?: number;
}
// Updated interfaces for hierarchical categories

export interface ICategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  discount: number;
  discountType?: string;
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
  discountType?: string;
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

// Multi-category support types
export interface CategorySelection {
  categoryId: string;
  isPrimary: boolean;
}

export interface ICategoryOperationResponse {
  success: boolean;
  message: string;
  categoryIds?: string[];
}

export interface IAddCategoryRequest {
  productId: string;
  categoryId: string;
}

export interface IRemoveCategoryRequest {
  productId: string;
  categoryId: string;
}
