import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useToast } from "../../../components/ui/use-toast";
import {
  getOrders,
  getOrderAnalysis,
  searchOrders,
  deleteOrder,
  orderBulkAction,
  getReturnOrders,
  searchReturnOrders,
  getReturnOrderStats,
} from "../../../api/order";
import useLoginAuth from "../../auth/hooks/useLoginAuth";
import {
  IOrder,
  IOrderStatusCount,
  IReturnOrder,
  IReturnOrderStats,
} from "../interface";

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
  const [orderStatusCount, setOrderStatusCount] =
    useState<IOrderStatusCount | null>(null);

  // Return orders state
  const [returnOrders, setReturnOrders] = useState<IReturnOrder[]>([]);
  const [returnOrderStats, setReturnOrderStats] =
    useState<IReturnOrderStats | null>(null);
  const [returnOrderFetching, setReturnOrderFetching] = useState(false);
  const [totalReturnOrders, setTotalReturnOrders] = useState(0);
  const [returnTotalPages, setReturnTotalPages] = useState(0);
  const [returnCurrentPage, setReturnCurrentPage] = useState(1);
  const [returnSearchQuery, setReturnSearchQuery] = useState("");
  const [returnSelectedStatus, setReturnSelectedStatus] = useState<string>("");
  const [selectedReturnOrder, setSelectedReturnOrder] =
    useState<IReturnOrder | null>(null);

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

  // Return orders effects
  useEffect(() => {
    if (returnCurrentPage === 1) return;
    else getReturnOrderList();
    //eslint-disable-next-line
  }, [returnCurrentPage]);

  useEffect(() => {
    if (returnSearchQuery === "") setReturnCurrentPage(1);
    else searchReturnOrderByQuery();
    //eslint-disable-next-line
  }, [returnSearchQuery, returnSelectedStatus]);

  const refresh = async () => {
    const response = await getOrders(limit, currentPageNum, selectedStatus);
    if (response?.success && !!response?.data) {
      const {
        totalOrders,
        totalPages,
        currentPage,
        orders,
        statusCounts,
        returnOrderCount,
      } = response?.data;
      setOrderStatusCount({ ...statusCounts, returnOrderCount });
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
      const { statusCounts, returnOrderCount } = response?.data;
      setOrderStatusCount({ ...statusCounts, returnOrderCount });
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

  // Return orders functions
  const getReturnOrderList = async () => {
    setReturnOrderFetching(true);
    try {
      const response = await getReturnOrders(
        limit,
        returnCurrentPage,
        returnSelectedStatus
      );
      if (response?.success && response?.data) {
        const {
          returnOrders: orders,
          totalReturnOrders: total,
          totalPages: pages,
          currentPage,
          returnOrderStats: stats,
        } = response.data;
        setReturnOrders(orders || []);
        setTotalReturnOrders(total || 0);
        setReturnTotalPages(pages || 0);
        if (currentPage !== returnCurrentPage)
          setReturnCurrentPage(Number(currentPage));
        setReturnOrderStats(stats || null);
      } else {
        toast({
          variant: "destructive",
          title: "Return Orders Error",
          description: response?.error,
        });
      }
    } catch (error) {
      console.error("Error fetching return orders:", error);
    } finally {
      setReturnOrderFetching(false);
    }
  };

  const searchReturnOrderByQuery = async () => {
    try {
      const response = await searchReturnOrders(
        returnSearchQuery,
        returnSelectedStatus,
        limit,
        returnCurrentPage
      );
      if (response?.success && response?.data) {
        const {
          returnOrders: orders,
          totalReturnOrders: total,
          totalPages: pages,
          currentPage,
          returnOrderStats: stats,
        } = response.data;
        setReturnOrders(orders || []);
        setTotalReturnOrders(total || 0);
        setReturnTotalPages(pages || 0);
        if (currentPage !== returnCurrentPage)
          setReturnCurrentPage(Number(currentPage));
        setReturnOrderStats(stats || null);
      }
    } catch (error) {
      console.error("Error searching return orders:", error);
    }
  };

  const fetchReturnOrderStats = async () => {
    try {
      const response = await getReturnOrderStats();
      if (response?.success && response?.data) {
        setReturnOrderStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching return order stats:", error);
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
      Swal.fire({
        html: `
    <div 
      style="
        background: #fef3c7;
        padding: 18px;
        border-radius: 12px;
        border: 1px solid #fcd34d;
        display: flex;
        gap: 12px;
        align-items: flex-start;
        font-size: 16px;
        line-height: 1.6;
        color: #854d0e;
      "
    >
      <div>
        <strong style="font-size: 17px;">Warning</strong><br/>
        <span>${response?.error}</span>
      </div>
    </div>
  `,
        icon: "warning",
        confirmButtonText: "Okay",
        confirmButtonColor: "#6366f1",
        width: 600,
        padding: "1.5rem 1.2rem",
        backdrop: `
    rgba(0,0,0,0.4)
    left top
    no-repeat
  `,
      });
    }
  };

  const updateCurrentPage = (increaseBy: number) => {
    setCurrentPage(currentPageNum + increaseBy);
  };

  const performOrderBulkUpdate = async (
    actionType: string,
    courierProvider?: string
  ) => {
    if (!bulkOrders || bulkOrders?.length < 1) {
      toast({
        variant: "destructive",
        title: "No Order Selected",
      });
      return;
    }
    const response = await orderBulkAction(
      [...bulkOrders],
      actionType,
      courierProvider
    );
    if (response?.success) {
      // Handle warning and courier failures
      let description = response?.data?.message || response?.data;

      if (
        response.courierOrdersQueued !== undefined &&
        response.courierOrdersTotal !== undefined
      ) {
        description = `${description}\n\nCourier Orders: ${response.courierOrdersQueued}/${response.courierOrdersTotal} created`;
      }

      if (response.warning) {
        description = `${description}\n\n⚠️ ${response.warning}`;
      }

      if (response.courierFailures && response.courierFailures.length > 0) {
        const failuresList = response.courierFailures
          .map((f) => `• Order #${f.orderNumber}: ${f.error}`)
          .join("\n");
        description = `${description}\n\nFailed Orders:\n${failuresList}`;
      }

      toast({
        variant: response.warning ? "default" : "default",
        title: response.warning
          ? "Bulk Action Completed with Warnings"
          : "Bulk Action Success",
        description: description,
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
    orderStatusCount,
    setSelectedStatus,
    updateCurrentPage,
    performOrderBulkUpdate,

    // Return orders
    returnOrders,
    returnOrderStats,
    returnOrderFetching,
    totalReturnOrders,
    returnTotalPages,
    returnCurrentPage,
    returnSearchQuery,
    returnSelectedStatus,
    selectedReturnOrder,
    setReturnCurrentPage,
    setReturnSearchQuery,
    setReturnSelectedStatus,
    setSelectedReturnOrder,
    getReturnOrderList,
    fetchReturnOrderStats,
  };
};
