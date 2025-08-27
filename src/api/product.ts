import axios from "./axios";
import config from "../utils/config";
import { handleApiError } from ".";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

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

// Function to search for products
export const getProducts = async (
  limit = 20,
  page = 1
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(config.product.getProductList(), {
      params: { limit, page },
    });
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to search products",
      };
    }
  } catch (error: any) {
    console.error("Error searching products:", error.message);
    return handleApiError(error);
  }
};

// Function to search for products
export const getProductsByCategory = async (
  categoryId: any,
  offset = 0,
  limit = 10
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(config.product.getProductList(), {
      params: { page:offset, limit, categoryId },
    });
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to search products",
      };
    }
  } catch (error: any) {
    console.error("Error searching products:", error.message);
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
  console.log("data", newCategoryData);
  try {
    // Create FormData for file upload
    const formData = new FormData();

    // Append text fields
    formData.append("name", newCategoryData.name || "");
    formData.append("description", newCategoryData.description || "");
    formData.append("discount", newCategoryData.discount?.toString() || "0");
    formData.append("active", newCategoryData.active?.toString() || "true");
    formData.append(
      "google_category_type",
      newCategoryData.google_category_type || ""
    );

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
    formData.append("discount", newCategoryData.discount?.toString() || "0");
    formData.append("active", newCategoryData.active?.toString() || "true");
    formData.append(
      "google_category_type",
      newCategoryData.google_category_type || ""
    );

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
