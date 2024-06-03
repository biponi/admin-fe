import { useEffect, useState } from "react";
import { useToast } from "../../../components/ui/use-toast";
import {
  getOrders,
  getOrderAnalysis,
  searchOrders,
  deleteOrder,
} from "../../../api/order";
import useLoginAuth from "../../auth/hooks/useLoginAuth";

export const useOrderList = () => {
  const { toast } = useToast();
  const { user } = useLoginAuth();
  const [orderFetching, setOrderFetching] = useState(false);
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPageNum, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [analytics, setAnalytics] = useState({
    totalCompletedOrders: 0,
    totalPrice: 0,
    totalPaid: 0,
  });
  const limit = 50;

  useEffect(() => {
    if (currentPageNum === 1) return;
    else getOrderList();
    //eslint-disable-next-line
  }, [currentPageNum]);

  useEffect(() => {
    if (searchQuery === "") setCurrentPage(0);
    else searchOrderByQuery();
    //eslint-disable-next-line
  }, [searchQuery]);

  const refresh = async () => {
    const response = await getOrders(limit, currentPageNum);
    if (response?.success && !!response?.data) {
      const { totalOrders, totalPages, currentPage, orders } = response?.data;
      setTotalPages(totalPages);
      if (currentPageNum !== currentPage) setCurrentPage(Number(currentPage));
      setTotalOrders(totalOrders);
      //@ts-ignore
      setOrders([...orders]);
    } else {
      toast({
        variant: "destructive",
        title: "Order Error",
        description: response?.error,
      });
    }
    user?.role === "admin" && getAnalytics();
  };

  const getOrderList = async () => {
    setOrderFetching(true);
    refresh();
    setOrderFetching(false);
  };

  const searchOrderByQuery = async () => {
    const response = await searchOrders(searchQuery);
    if (response?.success) {
      //@ts-ignore
      setOrders(response.data.products);
      //@ts-ignore
      setTotalPages(response.data.totalOrders);
      //@ts-ignore
      setTotalPages(response.data.totalPages);
      //@ts-ignore
      setCurrentPage(response.data.currentPage);
    }
  };

  const getAnalytics = async () => {
    const response = await getOrderAnalysis();
    if (response.success) {
      setAnalytics({ ...response.data });
    }
  };

  const deleteOrderData = async (id: string) => {
    const response = await deleteOrder(id);
    if (response?.success) {
      toast({
        title: "Order Deleted",
        description: response?.data,
      });
      //@ts-ignore
      setOrders(orders.filter((order) => order?.id !== id));
      getOrderList();
      getAnalytics();
    } else {
      toast({
        variant: "destructive",
        title: "Order Error",
        description: response?.error,
      });
    }
  };

  const updateCurrentPage = (increaseBy: number) => {
    setCurrentPage(currentPageNum + increaseBy);
  };

  return {
    limit,
    orders,
    refresh,
    analytics,
    totalPages,
    totalOrders,
    getOrderList,
    getAnalytics,
    currentPageNum,
    setSearchQuery,
    orderFetching,
    deleteOrderData,
    updateCurrentPage,
  };
};
