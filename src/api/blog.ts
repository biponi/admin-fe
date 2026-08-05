import axios from "./axios";
import config from "../utils/config";
import { handleApiError } from ".";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ── Blog Posts ─────────────────────────────────────────────────────────

export const getBlogPosts = async (
  limit = 20,
  page = 1,
  status?: string,
  categoryId?: string,
  search?: string
): Promise<ApiResponse<any>> => {
  try {
    const params: any = { limit, page };
    if (status && status !== "all") params.status = status;
    if (categoryId && categoryId !== "all") params.categoryId = categoryId;
    if (search) params.search = search;

    const response = await axios.get<any>(config.blog.getAllPosts(), { params });
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return { success: false, error: response.data.error || "Failed to fetch posts" };
    }
  } catch (error: any) {
    console.error("Error fetching blog posts:", error.message);
    return handleApiError(error);
  }
};

export const getBlogPostById = async (id: string): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(config.blog.getPostById(id));
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return { success: false, error: response.data.error || "Failed to fetch post" };
    }
  } catch (error: any) {
    console.error("Error fetching blog post:", error.message);
    return handleApiError(error);
  }
};

export const createBlogPost = async (postData: FormData): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post<any>(config.blog.createPost(), postData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.status === 201) {
      return { success: true, data: response.data?.data };
    } else {
      return { success: false, error: response.data.error || "Failed to create post" };
    }
  } catch (error: any) {
    console.error("Error creating blog post:", error.message);
    return handleApiError(error);
  }
};

export const updateBlogPost = async (
  id: string,
  postData: FormData
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put<any>(config.blog.updatePost(id), postData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return { success: false, error: response.data.error || "Failed to update post" };
    }
  } catch (error: any) {
    console.error("Error updating blog post:", error.message);
    return handleApiError(error);
  }
};

export const deleteBlogPost = async (id: string): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.delete<any>(config.blog.deletePost(id));
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return { success: false, error: response.data.error || "Failed to delete post" };
    }
  } catch (error: any) {
    console.error("Error deleting blog post:", error.message);
    return handleApiError(error);
  }
};

export const publishBlogPost = async (id: string): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.patch<any>(config.blog.publishPost(id));
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return { success: false, error: response.data.error || "Failed to publish post" };
    }
  } catch (error: any) {
    console.error("Error publishing blog post:", error.message);
    return handleApiError(error);
  }
};

export const archiveBlogPost = async (id: string): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.patch<any>(config.blog.archivePost(id));
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return { success: false, error: response.data.error || "Failed to archive post" };
    }
  } catch (error: any) {
    console.error("Error archiving blog post:", error.message);
    return handleApiError(error);
  }
};

export const getBlogSeoData = async (slug: string): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(config.blog.getSeoData(slug));
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return { success: false, error: response.data.error || "Failed to fetch SEO data" };
    }
  } catch (error: any) {
    console.error("Error fetching SEO data:", error.message);
    return handleApiError(error);
  }
};

export const suggestBlogKeywords = async (data: {
  title: string;
  content: string;
  excerpt?: string;
}): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post<any>(config.blog.keywordSuggest(), data);
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return { success: false, error: response.data.error || "Failed to suggest keywords" };
    }
  } catch (error: any) {
    console.error("Error suggesting keywords:", error.message);
    return handleApiError(error);
  }
};

// ── Blog Categories ────────────────────────────────────────────────────

export const getBlogCategories = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(config.blog.getAllCategories());
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return { success: false, error: response.data.error || "Failed to fetch categories" };
    }
  } catch (error: any) {
    console.error("Error fetching blog categories:", error.message);
    return handleApiError(error);
  }
};

export const createBlogCategory = async (
  categoryData: FormData
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post<any>(config.blog.createCategory(), categoryData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.status === 201) {
      return { success: true, data: response.data?.data };
    } else {
      return { success: false, error: response.data.error || "Failed to create category" };
    }
  } catch (error: any) {
    console.error("Error creating blog category:", error.message);
    return handleApiError(error);
  }
};

export const updateBlogCategory = async (
  id: string,
  categoryData: FormData
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put<any>(config.blog.updateCategory(id), categoryData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return { success: false, error: response.data.error || "Failed to update category" };
    }
  } catch (error: any) {
    console.error("Error updating blog category:", error.message);
    return handleApiError(error);
  }
};

export const deleteBlogCategory = async (id: string): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.delete<any>(config.blog.deleteCategory(id));
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return { success: false, error: response.data.error || "Failed to delete category" };
    }
  } catch (error: any) {
    console.error("Error deleting blog category:", error.message);
    return handleApiError(error);
  }
};
