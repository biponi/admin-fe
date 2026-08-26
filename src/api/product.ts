import axios from "./axios";
import config from "../utils/config";
import { handleApiError } from ".";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * IMPORTANT: Direct product quantity updates are deprecated
 * Use adjustProductStock() from './productAdjustment' instead
 *
 * This ensures proper audit trail and accountability for all stock changes
 */

// Function to fetch for product
export const getProductById = async (id: string): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(config.product.getProductData(id));
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch product",
      };
    }
  } catch (error: any) {
    console.error("Error fetching product:", error.message);
    return handleApiError(error);
  }
};

// Function to fetch products (with optional category filter and sorting)
export const getProducts = async (
  limit = 20,
  page = 1,
  categoryId?: string,
  sortBy?: string,
  sortOrder?: string,
  activeOnly?: boolean,
): Promise<ApiResponse<any>> => {
  try {
    const params: any = { limit, page };

    // Only add categoryId if it's provided and not "all"
    if (categoryId && categoryId !== "all") {
      params.categoryId = categoryId;
    }

    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    if (activeOnly === false) params.activeOnly = false;

    const response = await axios.get<any>(config.product.getProductList(), {
      params,
    });
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch products",
      };
    }
  } catch (error: any) {
    console.error("Error fetching products:", error.message);
    return handleApiError(error);
  }
};

// Function to search active products
export const searchActiveProducts = async (
  query: string,
  categoryId?: string,
  includeSubcategories?: boolean,
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<any>> => {
  try {
    const params: any = { query, page, limit };

    if (categoryId && categoryId !== "all") {
      params.categoryId = categoryId;
    }

    if (includeSubcategories !== undefined) {
      params.includeSubcategories = includeSubcategories;
    }

    const response = await axios.get<any>(
      config.product.searchActiveProduct(),
      { params }
    );

    if (response.status === 200) {
      return {
        success: true,
        data: {
          products: response.data?.data?.products ?? response.data?.data,
          totalPages: response.data?.data?.totalPages ?? 1,
          totalProducts: response.data?.data?.totalProducts ?? 0,
          currentPage: response.data?.data?.currentPage ?? page
        }
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to search active products",
      };
    }
  } catch (error: any) {
    console.error("Error searching active products:", error.message);
    return handleApiError(error);
  }
};

// Function to get product data summary
export const getProductSummary = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(config.product.getProductSummary());
    if (response.status === 200) {
      return { success: true, data: response?.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to get categories",
      };
    }
  } catch (error: any) {
    console.error("Error getting category:", error.message);
    return handleApiError(error);
  }
};

// Updated API calls for hierarchical categories

// Function to get all categories (flat list with hierarchy info)
export const getAllCategory = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(config.category.getAllCategory());
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to get categories",
      };
    }
  } catch (error: any) {
    console.error("Error getting category:", error.message);
    return handleApiError(error);
  }
};

// Function to get categories in tree structure
export const getCategoryTree = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(config.category.getCategoryTree());
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to get category tree",
      };
    }
  } catch (error: any) {
    console.error("Error getting category tree:", error.message);
    return handleApiError(error);
  }
};

// Function to get a single category by ID or slug
export const getCategoryByIdOrSlug = async (
  identifier: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(
      config.category.getCategoryByIdOrSlug(identifier)
    );
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to get category",
      };
    }
  } catch (error: any) {
    console.error("Error getting category:", error.message);
    return handleApiError(error);
  }
};

// Function to add category with FormData for file upload
export const addCategory = async (
  newCategoryData: any
): Promise<ApiResponse<any>> => {
  try {
    // Create FormData for file upload
    const formData = new FormData();

    // Append text fields
    formData.append("name", newCategoryData.name || "");
    formData.append("description", newCategoryData.description || "");
    formData.append("shortDescription", newCategoryData.shortDescription || "");
    formData.append("discount", newCategoryData.discount?.toString() || "0");
    formData.append("discountType", newCategoryData.discountType || "%");
    formData.append("active", newCategoryData.active?.toString() || "true");
    formData.append(
      "google_category_type",
      newCategoryData.google_category_type || ""
    );

    // Append SEO fields
    formData.append("focusKeyphrase", newCategoryData.focusKeyphrase || "");
    formData.append("seoTitle", newCategoryData.seoTitle || "");
    formData.append("metaDescription", newCategoryData.metaDescription || "");

    // Append tags as JSON
    if (newCategoryData.tags && Array.isArray(newCategoryData.tags)) {
      formData.append("tags", JSON.stringify(newCategoryData.tags));
    }

    // Append parentId if exists
    if (newCategoryData.parentId) {
      formData.append("parentId", newCategoryData.parentId);
    }

    // Append image file if exists
    if (newCategoryData.img && newCategoryData.img instanceof File) {
      formData.append("img", newCategoryData.img);
    }

    const response = await axios.post<any>(
      config.category.addCategory(),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to create category",
      };
    }
  } catch (error: any) {
    console.error("Error creating category:", error.message);
    return handleApiError(error);
  }
};

// Function to edit category
export const editCategory = async (
  id: string,
  newCategoryData: any
): Promise<ApiResponse<any>> => {
  try {
    // Create FormData for file upload
    const formData = new FormData();

    // Append text fields
    formData.append("name", newCategoryData.name || "");
    formData.append("description", newCategoryData.description || "");
    formData.append("shortDescription", newCategoryData.shortDescription || "");
    formData.append("discount", newCategoryData.discount?.toString() || "0");
    formData.append("discountType", newCategoryData.discountType || "%");
    formData.append("active", newCategoryData.active?.toString() || "true");
    formData.append(
      "google_category_type",
      newCategoryData.google_category_type || ""
    );

    // Append SEO fields
    formData.append("focusKeyphrase", newCategoryData.focusKeyphrase || "");
    formData.append("seoTitle", newCategoryData.seoTitle || "");
    formData.append("metaDescription", newCategoryData.metaDescription || "");

    // Append tags as JSON
    if (newCategoryData.tags && Array.isArray(newCategoryData.tags)) {
      formData.append("tags", JSON.stringify(newCategoryData.tags));
    }

    // Append parentId (can be null for root categories)
    if (newCategoryData.parentId) {
      formData.append("parentId", newCategoryData.parentId);
    } else {
      formData.append("parentId", ""); // Send empty string for root categories
    }

    // Append image file if exists
    if (newCategoryData.img && newCategoryData.img instanceof File) {
      formData.append("img", newCategoryData.img);
    }

    const response = await axios.put<any>(
      config.category.editCategory(id),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: response.data.message || "Failed to update category",
      };
    }
  } catch (error: any) {
    console.error("Error updating category:", error.message);
    return handleApiError(error);
  }
};

// Function to move category to a new parent
export const moveCategory = async (
  id: string,
  newParentId: string | null
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.patch<any>(config.category.moveCategory(id), {
      newParentId,
    });

    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to move category",
      };
    }
  } catch (error: any) {
    console.error("Error moving category:", error.message);
    return handleApiError(error);
  }
};

// Function to delete category with optional force delete
export const deleteCategory = async (
  id: string,
  force: boolean = false
): Promise<ApiResponse<any>> => {
  try {
    const url = force
      ? `${config.category.deleteCategory(id)}?force=true`
      : config.category.deleteCategory(id);

    const response = await axios.delete<any>(url);

    if (response.status === 200) {
      return { success: true };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to delete category",
      };
    }
  } catch (error: any) {
    console.error("Error deleting category:", error.message);
    return handleApiError(error);
  }
};

// Multi-category helper functions

// Function to add category to product
export const addCategoryToProduct = async (
  productId: string,
  categoryId: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post<any>(
      config.product.addCategory(),
      { productId, categoryId }
    );

    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: response.data.message || "Failed to add category to product",
      };
    }
  } catch (error: any) {
    console.error("Error adding category to product:", error.message);
    return handleApiError(error);
  }
};

// Function to remove category from product
export const removeCategoryFromProduct = async (
  productId: string,
  categoryId: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post<any>(
      config.product.removeCategory(),
      { productId, categoryId }
    );

    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: response.data.message || "Failed to remove category from product",
      };
    }
  } catch (error: any) {
    console.error("Error removing category from product:", error.message);
    return handleApiError(error);
  }
};
