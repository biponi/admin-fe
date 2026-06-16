import { useState, useCallback } from "react";
import { getProductById } from "@/api/product";

export interface ProductVariation {
  id: string;
  name: string;
  color?: string;
  size?: string;
  price?: number;
  quantity?: number;
  sku?: string;
  images?: string[];
  imageGroupId?: string;
}

export interface ProductData {
  _id: string;
  id: string;
  title: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  quantity: number;
  thumbnail?: string;
  images?: string[];
  variations?: ProductVariation[];
  category?: string;
  categoryName?: string;
  manufacturer?: string;
  manufacturerName?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

interface UseProductDataReturn {
  products: Map<string, ProductData>;
  loading: Set<string>;
  error: Map<string, string>;
  fetchProduct: (productId: string) => Promise<ProductData | null>;
  fetchProducts: (productIds: string[]) => Promise<void>;
  getProduct: (productId: string) => ProductData | undefined;
  isLoading: (productId: string) => boolean;
}

export const useProductData = (): UseProductDataReturn => {
  const [products, setProducts] = useState<Map<string, ProductData>>(new Map());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [error, setErrors] = useState<Map<string, string>>(new Map());

  const fetchProduct = useCallback(async (productId: string): Promise<ProductData | null> => {
    // Return cached product if already loaded
    if (products.has(productId)) {
      return products.get(productId)!;
    }

    // Set loading state
    setLoading((prev) => new Set(prev).add(productId));
    setErrors((prev) => {
      const next = new Map(prev);
      next.delete(productId);
      return next;
    });

    try {
      const result = await getProductById(productId);

      if (result.success && result.data) {
        const productData: ProductData = result.data;
        setProducts((prev) => new Map(prev).set(productId, productData));
        return productData;
      } else {
        const errorMsg = result.error || "Failed to fetch product";
        setErrors((prev) => new Map(prev).set(productId, errorMsg));
        return null;
      }
    } catch (err: any) {
      const errorMsg = err.message || "An error occurred";
      setErrors((prev) => new Map(prev).set(productId, errorMsg));
      return null;
    } finally {
      setLoading((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }, [products]);

  const fetchProducts = useCallback(async (productIds: string[]) => {
    // Filter out already loaded products
    const idsToFetch = productIds.filter((id) => !products.has(id));

    if (idsToFetch.length === 0) {
      return;
    }

    // Fetch all products in parallel
    await Promise.all(idsToFetch.map((id) => fetchProduct(id)));
  }, [products, fetchProduct]);

  const getProduct = useCallback(
    (productId: string): ProductData | undefined => {
      return products.get(productId);
    },
    [products]
  );

  const isLoading = useCallback(
    (productId: string): boolean => {
      return loading.has(productId);
    },
    [loading]
  );

  return {
    products,
    loading,
    error,
    fetchProduct,
    fetchProducts,
    getProduct,
    isLoading,
  };
};
