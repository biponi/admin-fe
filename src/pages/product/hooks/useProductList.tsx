import { useEffect, useRef, useState } from "react";
import { getProducts } from "../../../api/product";
import { useToast } from "../../../components/ui/use-toast";
import { deleteProduct, searchProducts } from "../../../api";

export type SortField = "priority" | "name" | "price" | "quantity" | "createdAt" | "updatedAt";
export type SortOrder = "asc" | "desc";

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
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<SortField>("priority");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const refreshList = () => {
    if (!selectedCategory || selectedCategory === "all") getProductList();
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
  }, [selectedCategory, limit, sortBy, sortOrder]);

  useEffect(() => {
    searchProductByQuery();
    //eslint-disable-next-line
  }, [searchQuery]);

  const getProductList = async () => {
    setProductFetching(true);
    const response = await getProducts(limit, currentPageNum, undefined, sortBy, sortOrder);
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
    const response = await getProducts(limit, currentPageNum, selectedCategory, sortBy, sortOrder);
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
    const response = await searchProducts(searchQuery, categoryId, sortBy, sortOrder);
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
  };
};
