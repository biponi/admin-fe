import { useEffect, useRef, useState } from "react";
import { getProducts } from "../../../api/product";
import { useToast } from "../../../components/ui/use-toast";
import { deleteProduct, searchProducts } from "../../../api";

export type SortField = "priority" | "name" | "price" | "quantity" | "outofstock" | "createdAt" | "updatedAt";
export type SortOrder = "asc" | "desc";

// Admin meta filter — key/value/range against product or variant meta entries
export interface ProductMetaFilter {
  key: string;
  value: string;
  min: string;
  max: string;
}

export const EMPTY_META_FILTER: ProductMetaFilter = { key: "", value: "", min: "", max: "" };

export const useProductList = () => {
  const { toast } = useToast();
  const [productFetching, setProductFetching] = useState(false);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const totalPagesRef = useRef(0);
  const [currentPageNum, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [metaFilter, setMetaFilter] = useState<ProductMetaFilter>(EMPTY_META_FILTER);
  const [metaSearch, setMetaSearch] = useState("");
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<SortField>("priority");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [activeOnly, setActiveOnly] = useState<boolean>(true);

  const hasMetaFilter =
    !!(metaFilter.key && metaFilter.key.trim()) || !!metaSearch.trim();

  const refreshList = () => {
    // Meta-filtered results only come from the search endpoint
    if (hasMetaFilter) searchProductByQuery();
    else if (!selectedCategory || selectedCategory === "all") getProductList();
    else getProductListByCategoryId();
  };

  useEffect(() => {
    refreshList();
    //eslint-disable-next-line
  }, [currentPageNum]);

  useEffect(() => {
    if (currentPageNum !== 1) setCurrentPage(1);
    else refreshList();
    //eslint-disable-next-line
  }, [selectedCategory, limit, sortBy, sortOrder, activeOnly, metaFilter.key, metaFilter.value, metaFilter.min, metaFilter.max, metaSearch]);

  useEffect(() => {
    searchProductByQuery();
    //eslint-disable-next-line
  }, [searchQuery]);

  const getProductList = async () => {
    setProductFetching(true);
    const response = await getProducts(limit, currentPageNum, undefined, sortBy, sortOrder, activeOnly);
    if (response?.success && !!response?.data) {
      const {
        totalProducts,
        totalPages: tp,
        currentPage,
        products,
      } = response?.data;
      setTotalPages(tp);
      totalPagesRef.current = tp;
      if (currentPageNum !== currentPage) setCurrentPage(Number(currentPage));
      setTotalProducts(totalProducts);
      //@ts-ignore
      setProducts([...products]);
    } else {
      toast({
        variant: "destructive",
        title: "Product Error",
        description: response?.error,
      });
    }
    setProductFetching(false);
  };

  const getProductListByCategoryId = async () => {
    setProductFetching(true);
    const response = await getProducts(limit, currentPageNum, selectedCategory, sortBy, sortOrder, activeOnly);
    if (response?.success && !!response?.data) {
      const {
        totalProducts,
        totalPages: tp,
        currentPage,
        products,
      } = response?.data;
      setTotalPages(tp);
      totalPagesRef.current = tp;
      if (currentPageNum !== currentPage) setCurrentPage(Number(currentPage));
      setTotalProducts(totalProducts);
      //@ts-ignore
      setProducts([...products]);
    } else {
      toast({
        variant: "destructive",
        title: "Product Error",
        description: response?.error,
      });
    }
    setProductFetching(false);
  };

  const searchProductByQuery = async () => {
    const categoryId =
      selectedCategory !== "all" ? selectedCategory : undefined;
    const trimmedQuery = searchQuery.trim();

    // Nothing to search — fall back to the plain paginated list (the search
    // endpoint 400s without query/metaFilters/metaSearch)
    if (!trimmedQuery && !hasMetaFilter) {
      if (!selectedCategory || selectedCategory === "all") getProductList();
      else getProductListByCategoryId();
      return;
    }

    const metaFilterPayload =
      metaFilter.key && metaFilter.key.trim()
        ? {
            key: metaFilter.key.trim(),
            value: metaFilter.value.trim() || undefined,
            min: metaFilter.min.trim() || undefined,
            max: metaFilter.max.trim() || undefined,
          }
        : undefined;

    const response = await searchProducts(
      trimmedQuery,
      categoryId,
      sortBy,
      sortOrder,
      metaFilterPayload,
      metaSearch.trim() || undefined,
    );
    if (response?.success) {
      //@ts-ignore
      setProducts(response.data);
    }
  };

  const deleteProductData = async (id: string) => {
    const response = await deleteProduct(id);
    if (response?.success) {
      toast({
        title: "Product Deleted",
        description: response?.data,
      });
      //@ts-ignore
      setProducts(products.filter((product) => product?.id !== id));
    } else {
      toast({
        variant: "destructive",
        title: "Product Error",
        description: response?.error,
      });
    }
  };

  const updateCurrentPage = (increaseBy: number) => {
    setCurrentPage((prevPage) => {
      const newPage = prevPage + increaseBy;
      const maxPages = totalPagesRef.current;
      if (newPage < 1) return 1;
      if (newPage > maxPages) return maxPages;
      return newPage;
    });
  };

  return {
    limit,
    setLimit,
    products,
    totalPages,
    refreshList,
    totalProducts,
    getProductList,
    currentPageNum,
    setSearchQuery,
    productFetching,
    selectedCategory,
    deleteProductData,
    updateCurrentPage,
    setSelectedCategory,
    getProductListByCategoryId,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    activeOnly,
    setActiveOnly,
    metaFilter,
    setMetaFilter,
    metaSearch,
    setMetaSearch,
    hasMetaFilter,
  };
};
