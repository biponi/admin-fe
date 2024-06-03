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
      params: { offset, limit, categoryId },
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

// Function to get all categories
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

// Function to add category
export const addCategory = async (
  newCategoryData: any
): Promise<ApiResponse<any>> => {
  console.log("data", newCategoryData);
  try {
    const response = await axios.post<any>(
      config.category.addCategory(),
      newCategoryData
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

// Function to add category
export const editCategory = async (
  id: string,
  newCategoryData: any
): Promise<ApiResponse<any>> => {
  console.log("data", newCategoryData);
  try {
    const response = await axios.put<any>(
      config.category.editCategory(id),
      newCategoryData
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: response.data.message || "Failed to create category",
      };
    }
  } catch (error: any) {
    console.error("Error creating category:", error.message);
    return handleApiError(error);
  }
};

// Function to add category
export const deleteCategory = async (id: string): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.delete<any>(
      config.category.deleteCategory(id)
    );
    if (response.status === 200) {
      return { success: true };
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
