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
  imageGroups?: IImageGroup[]; // NEW: Image groups for color/attribute-based image organization

  // ── Content & SEO (returned by GET /product/single/:id — full doc)
  shortDescription?: string;
  focusKeyphrase?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  brand?: string;
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
  imageGroupId?: string; // NEW: Reference to image group this variant belongs to
}

// Variant image mapping for upload
export interface IVariantImageMapping {
  variantId: string;
  imageIndex: number; // Index pointing to a specific image in the variantImages array
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

  // ── Content & SEO (AI suggestions apply into these fields)
  slug?: string; // auto-derived from name; admin-editable
  shortDescription?: string;
  focusKeyphrase?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  brand?: string;
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
  commissionType?: "percentage" | "fixed" | "none";
  commissionRate?: number;

  // ── Content & SEO (AI suggestions apply into these fields)
  slug?: string; // auto-derived from name; admin-editable
  shortDescription?: string;
  focusKeyphrase?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  brand?: string;
}
// Updated interfaces for hierarchical categories

export interface ICategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  discount: number;
  discountType?: "%" | "fixed" | "flat";
  active: boolean;
  google_category_type?: string;
  img?: string;
  focusKeyphrase?: string;
  seoTitle?: string;
  metaDescription?: string;
  tags?: string[];

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
  shortDescription?: string;
  discount?: number;
  discountType?: "%" | "fixed" | "flat";
  active?: boolean;
  google_category_type?: string;
  img?: File | string;
  parentId?: string | null;
  focusKeyphrase?: string;
  seoTitle?: string;
  metaDescription?: string;
  tags?: string[];
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
  totalDiscountedPrice: number;
  totalDiscountAmount: number;
  discountSources?: Record<string, number>;
}

export interface AppliedCampaign {
  id: string;
  title: string;
  discount: number;
  discountType: string;
}

export interface StockSummaryTotals {
  totalInventoryValue: number;
  totalDiscountedInventoryValue: number;
  totalDiscountAmount: number;
  totalStock: number;
  totalProducts: number;
  totalVariants: number;
}

export interface StockSummaryResponse {
  categories: CategoryStockSummary[];
  totalActiveProductPrice: number;
  totalActiveProducts: number;
  totalActiveProductVariations: number;
  totalActiveProductType: number;
  totalActiveProductDiscountedPrice: number;
  totalActiveProductDiscountAmount: number;
  totals?: StockSummaryTotals;
  appliedCampaign?: AppliedCampaign | null;
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

// ========================================================================
// Image Group Interfaces for Color/Attribute-Based Image Organization
// ========================================================================

export interface IImageGroup {
  id: string;
  attribute: 'color' | 'material' | 'pattern' | 'fit' | 'size' | string; // Which variant attribute drives this group
  value: string; // The attribute value (e.g., "Red", "Cotton", "Striped")
  displayLabel: string; // Human-readable label for UI display
  colorHex?: string; // Optional hex color code (only meaningful when attribute === "color")
  images: (File | string)[]; // Images for this group (File for new uploads, string for existing URLs)
  variantIds: string[]; // IDs of variants that belong to this group (auto-synced from variations)
  variantOverrides?: IVariantImageOverride[]; // Per-variant image overrides within this group
  sortOrder: number; // Display order in UI
}

export interface IVariantImageOverride {
  variantId: string; // Variant ID to override
  images: (File | string)[]; // Override images for this specific variant
}

export interface IImageGroupImageMapping {
  groupId: string; // Image group ID
  imageIndex: number; // Index pointing to a specific image in the imageGroupImages array
}

// Update product create/update interfaces to include image groups
export interface IProductCreateDataWithImageGroups extends IProductCreateData {
  imageGroups?: IImageGroup[]; // Image groups for color/attribute-based organization
  imageGroupImages?: File[]; // New image group image files to upload
  imageGroupImageMappings?: IImageGroupImageMapping[]; // Maps groupIds to image indices
}

export interface IProductUpdateDataWithImageGroups extends IProductUpdateData {
  imageGroups?: IImageGroup[]; // Full replacement of image groups
  addImageGroups?: IImageGroup[]; // Add new image groups
  updateImageGroups?: IImageGroup[]; // Update existing image groups
  removeImageGroupIds?: string[]; // Remove image groups by ID
  imageGroupImages?: File[]; // New image group image files to upload
  imageGroupImageMappings?: IImageGroupImageMapping[]; // Maps groupIds to image indices
}
