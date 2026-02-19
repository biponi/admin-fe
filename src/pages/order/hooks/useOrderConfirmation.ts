import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useToast } from "../../../components/ui/use-toast";
import {
  getProcessingOrders,
  confirmOrder,
  cancelOrderFromConfirmation,
  getProcessingOrderCount,
} from "../../../api/order";
import { IOrder } from "../interface";

export interface CancellationReason {
  value: string;
  label: string;
}

export const cancellationReasons: CancellationReason[] = [
  { value: "customer_not_reachable", label: "Customer not reachable" },
  {
    value: "customer_requested_cancellation",
    label: "Customer requested cancellation",
  },
  { value: "product_out_of_stock", label: "Product out of stock" },
  { value: "invalid_order_details", label: "Invalid order details" },
  { value: "suspicious_activity", label: "Suspicious activity" },
  { value: "other", label: "Other" },
];

export const useOrderConfirmation = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [processingCount, setProcessingCount] = useState<number>(0);

  // Fetch processing orders on page change
  useEffect(() => {
    fetchProcessingOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit]);

  // Fetch processing order count
  useEffect(() => {
    fetchProcessingCount();
  }, []);

  const fetchProcessingOrders = async () => {
    setLoading(true);
    try {
      const response = await getProcessingOrders(
        limit,
        currentPage,
        "orderNumber",
        "asc",
      );

      if (response?.success && response?.data) {
        const {
          orders,
          totalCount,
          totalPages,
          currentPage: newPage,
        } = response.data;
        setOrders(orders);
        setTotalCount(totalCount);
        setTotalPages(totalPages);
        if (currentPage !== newPage) {
          setCurrentPage(newPage);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Failed to fetch orders",
          description: response?.error || "Unable to load processing orders",
        });
      }
    } catch (error: any) {
      console.error("Error fetching processing orders:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch processing orders",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProcessingCount = async () => {
    try {
      const response = await getProcessingOrderCount();
      if (response?.success && response?.data) {
        setProcessingCount(response.data.processingCount);
      }
    } catch (error: any) {
      console.error("Error fetching processing count:", error);
    }
  };

  const handleConfirmOrder = async (orderNumber: string) => {
    if (!selectedOrder) {
      toast({
        variant: "destructive",
        title: "No order selected",
        description: "Please select an order to confirm",
      });
      return;
    }

    // Show loading
    setLoading(true);

    try {
      const response = await confirmOrder(
        String(selectedOrder.id),
        orderNumber,
      );

      if (response?.success && response?.data) {
        toast({
          title: "Order confirmed",
          description: `Order ${orderNumber} has been confirmed successfully`,
        });

        // Close dialog and refresh
        setVerificationDialogOpen(false);
        setSelectedOrder(null);
        await fetchProcessingOrders();
        await fetchProcessingCount();

        // Show success alert
        Swal.fire({
          icon: "success",
          title: "Confirmed",
          text: `Order ${orderNumber} is now ready for packaging`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Confirmation failed",
          description: response?.error || "Failed to confirm order",
        });
      }
    } catch (error: any) {
      console.error("Error confirming order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to confirm order",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (reason: string) => {
    if (!selectedOrder) {
      toast({
        variant: "destructive",
        title: "No order selected",
        description: "Please select an order to cancel",
      });
      return;
    }

    // Show loading
    setLoading(true);

    try {
      const response = await cancelOrderFromConfirmation(
        String(selectedOrder.id),
        reason,
      );

      if (response?.success && response?.data) {
        toast({
          title: "Order cancelled",
          description: `Order ${selectedOrder.orderNumber} has been cancelled`,
        });

        // Close dialog and refresh
        setCancelDialogOpen(false);
        setSelectedOrder(null);
        await fetchProcessingOrders();
        await fetchProcessingCount();

        // Show success alert with inventory restoration info
        let message = `Order ${selectedOrder.orderNumber} has been cancelled`;
        if (response.data.inventoryRestored) {
          const restoredItems = response.data.inventoryRestored.items;
          message += `\n\n${restoredItems.length} item(s) restored to inventory`;
        }

        Swal.fire({
          icon: "success",
          title: "Cancelled",
          text: message,
          timer: 3000,
          showConfirmButton: true,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Cancellation failed",
          description: response?.error || "Failed to cancel order",
        });
      }
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to cancel order",
      });
    } finally {
      setLoading(false);
    }
  };

  const openVerificationDialog = (order: IOrder) => {
    setSelectedOrder(order);
    setVerificationDialogOpen(true);
  };

  const openCancelDialog = (order: IOrder) => {
    setSelectedOrder(order);
    setCancelDialogOpen(true);
  };

  const closeDialogs = () => {
    setVerificationDialogOpen(false);
    setCancelDialogOpen(false);
    setSelectedOrder(null);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(0);
  };

  const refresh = async () => {
    await fetchProcessingOrders();
    await fetchProcessingCount();
  };

  return {
    // State
    orders,
    loading,
    totalCount,
    totalPages,
    currentPage,
    limit,
    selectedOrder,
    verificationDialogOpen,
    cancelDialogOpen,
    processingCount,

    // Actions
    fetchProcessingOrders,
    fetchProcessingCount,
    handleConfirmOrder,
    handleCancelOrder,
    openVerificationDialog,
    openCancelDialog,
    closeDialogs,
    handlePageChange,
    handleLimitChange,
    refresh,
    setSelectedOrder,
    setVerificationDialogOpen,
    setCancelDialogOpen,
  };
};
