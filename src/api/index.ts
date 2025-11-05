import { AxiosError } from "axios";
import axios from "./axios";
import config from "../utils/config";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

//Function refresh token
export const refreshApiToken = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post<any>(config.refreshToken(), {
      refreshToken: localStorage.getItem("refreshToken") || "",
    });
    if (response?.status === 200) {
      const newToken = response.data.accessToken;
      const newRefreshToken = response.data.refreshToken;

      localStorage.setItem("token", newToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      return {
        success: true,
        data: {
          accessToken: newToken,
          refreshToken: newRefreshToken,
        },
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to refresh token",
      };
    }
  } catch (error: any) {
    console.error("Error on refresh token:", error.message);
    return handleApiError(error);
  }
};

// Function to create a new user
export const createUser = async (userData: any): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post<any>(config.user.signup(), userData);
    if (response.status === 201) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to create user",
      };
    }
  } catch (error: any) {
    console.error("Error creating user:", error.message);
    return handleApiError(error);
  }
};

// Function to login
export const loginUser = async (
  credentials: any
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post<any>(config.user.login(), credentials);
    if (response.status === 200) {
      return { success: true, data: { ...response.data?.dataSource } };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to login",
      };
    }
  } catch (error: any) {
    console.error("Error logging in:", error.message);
    return handleApiError(error);
  }
};

// Function to get user by ID
export const getUserById = async (
  userId: number
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(config.user.getUserById(userId));
    if (response.status === 200) {
      return { success: true, data: response.data?.dataSource };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to get user",
      };
    }
  } catch (error: any) {
    console.error("Error getting user:", error.message);
    return handleApiError(error);
  }
};

// Function to create a new product
export const createProduct = async (
  productData: any
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post<any>(
      config.product.createProduct(),
      productData,
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
        error: response.data.error || "Failed to create product",
      };
    }
  } catch (error: any) {
    console.error("Error creating product:", error.message);
    return handleApiError(error);
  }
};

// Function to update product quantity
export const updateProductQuantity = async (
  productData: any
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put<any>(
      config.product.updateProduct(),
      productData
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to update product quantity",
      };
    }
  } catch (error: any) {
    console.error("Error updating product quantity:", error.message);
    return handleApiError(error);
  }
};

// Function to edit product details
export const editProduct = async (
  productData: any
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put<any>(
      config.product.editProduct(),
      productData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (response.status === 200) {
      return { success: true, data: response.data.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to edit product",
      };
    }
  } catch (error: any) {
    console.error("Error editing product:", error.message);
    return handleApiError(error);
  }
};

// Function to search for products
export const searchProducts = async (
  searchQuery: any
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post<any>(config.product.searchProduct(), {
      query: searchQuery,
    });
    if (response.status === 200) {
      return { success: true, data: response.data.data };
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

// Function to get product by list of ids
export const getProductsById = async (
  idList: string[]
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(config.product.multiProducts(), {
      params: {
        ids: idList.join(","),
      },
    });
    if (response.status === 200) {
      return { success: true, data: response.data.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch products",
      };
    }
  } catch (error: any) {
    console.error("Error searching products:", error.message);
    return handleApiError(error);
  }
};

// Function to delete a product
export const deleteProduct = async (
  productId: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.delete<any>(
      config.product.deleteProduct(productId)
    );
    if (response.status === 200) {
      return { success: true, data: response.data.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to delete product",
      };
    }
  } catch (error: any) {
    console.error("Error deleting product:", error.message);
    return handleApiError(error);
  }
};

//manufacturer
//Function add new manufacturer
export const addManufacturer = async (
  manufacturerData: any
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post<any>(
      config.manufecturer.manufecturerAdd(),
      {
        ...manufacturerData,
      }
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to create manufacturer",
      };
    }
  } catch (error: any) {
    console.error("Error creating manufacturer:", error.message);
    return handleApiError(error);
  }
};
//Function fetch manufacturer
export const fetchManufacturers = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(
      config.manufecturer.manufecturerList()
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch manufacturers",
      };
    }
  } catch (error: any) {
    console.error("Error fetching manufacturers:", error.message);
    return handleApiError(error);
  }
};

//Function fetch manufacturer by id
export const fetchManufacturerById = async (
  manufacturerId: number
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(
      config.manufecturer.getManufecturerById(manufacturerId)
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch manufacturer",
      };
    }
  } catch (error: any) {
    console.error("Error fetching manufacturer:", error.message);
    return handleApiError(error);
  }
};

// Function to handle API errors
export const handleApiError = (
  error: AxiosError<any, any>
): ApiResponse<any> => {
  if (!!error && error?.response) {
    return {
      success: false,
      error:
        error?.response?.data.error ||
        error?.response?.data.message ||
        "Failed to process request",
    };
  } else if (error?.request) {
    return { success: false, error: "No response received from server" };
  } else {
    return { success: false, error: "Request failed" };
  }
};
