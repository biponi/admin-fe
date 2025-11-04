import { useEffect, useState } from "react";
import { useToast } from "../../../components/ui/use-toast";
import {
  getOrders,
  getOrderAnalysis,
  searchOrders,
  deleteOrder,
  orderBulkAction,
} from "../../../api/order";
import useLoginAuth from "../../auth/hooks/useLoginAuth";
import { IOrder } from "../interface";

export const useOrderList = () => {
  const { toast } = useToast();
  const { user } = useLoginAuth();
  const [orderFetching, setOrderFetching] = useState(false);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPageNum, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [analytics, setAnalytics] = useState({
    totalCompletedOrders: 0,
    totalPrice: 0,
    totalPaid: 0,
  });
  const [bulkOrders, setBulkOrders] = useState<number[]>([]);
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    if (currentPageNum === 1) return;
    else getOrderList();
    //eslint-disable-next-line
  }, [currentPageNum]);

  useEffect(() => {
    setCurrentPage(0);
  }, [limit]);

  useEffect(() => {
    if (searchQuery === "") setCurrentPage(0);
    else searchOrderByQuery();
    //eslint-disable-next-line
  }, [searchQuery, selectedStatus]);

  const refresh = async () => {
    const response = await getOrders(limit, currentPageNum, selectedStatus);
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
    await refresh();
    setOrderFetching(false);
  };

  const searchOrderByQuery = async () => {
    const response = await searchOrders(searchQuery, selectedStatus);
    if (response?.success) {
      //@ts-ignore
      setOrders(response.data.orders);
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

  const performOrderBulkUpdate = async (actionType: string) => {
    if (!bulkOrders || bulkOrders?.length < 1) {
      toast({
        variant: "destructive",
        title: "No Order Selected",
      });
      return;
    }
    const response = await orderBulkAction([...bulkOrders], actionType);
    if (response?.success) {
      toast({
        variant: "default",
        title: "Bulk Action Success",
        description: response?.data,
      });
      setCurrentPage(0);
      setBulkOrders([]);
    } else {
      toast({
        variant: "destructive",
        title: "Bulk Action Failed",
        description: response?.error,
      });
    }
  };

  return {
    limit,
    orders,
    refresh,
    setLimit,
    analytics,
    bulkOrders,
    totalPages,
    totalOrders,
    getOrderList,
    getAnalytics,
    setBulkOrders,
    currentPageNum,
    setSearchQuery,
    orderFetching,
    selectedStatus,
    deleteOrderData,
    setSelectedStatus,
    updateCurrentPage,
    performOrderBulkUpdate,
  };
};
