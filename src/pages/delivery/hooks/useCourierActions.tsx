import { useState, useCallback } from "react";
import {
  courierAPI,
  CreateCourierOrderRequest,
} from "../../../services/courierApi";
import { toast } from "react-hot-toast";

export const useCourierActions = () => {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isBulkCreating, setIsBulkCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a single courier order
   * Note: Use orderNumber (not MongoDB _id) as orderId
   */
  const createCourierOrder = useCallback(
    async (
      orderNumber: number,
      data?: Partial<CreateCourierOrderRequest>,
      onSuccess?: () => void
    ) => {
      setIsCreating(true);
      setError(null);
      try {
        const requestData: CreateCourierOrderRequest = {
          orderId: orderNumber.toString(), // Use orderNumber as orderId
          ...data,
        };

        const response = await courierAPI.createOrder(requestData);

        if (response.success) {
          toast.success(
            `Courier order created! Tracking: ${response.data.trackingCode}`
          );
          if (onSuccess) onSuccess();
          return response.data;
        } else {
          throw new Error("Failed to create courier order");
        }
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.error ||
          err.message ||
          "Failed to create courier order";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  /**
   * Create bulk courier orders
   * Note: Pass orderNumbers (not MongoDB _ids) in the array
   */
  const bulkCreateCourierOrders = useCallback(
    async (orderNumbers: number[], onSuccess?: () => void) => {
      setIsBulkCreating(true);
      setError(null);
      try {
        const response = await courierAPI.bulkCreateOrders({
          orderIds: orderNumbers.map((num) => num.toString()), // Convert orderNumbers to strings
        });

        if (response.success) {
          const { successful, failed, total } = response.data;

          // Show success toast with summary
          toast.success(
            `Bulk courier creation completed!\nSuccessful: ${successful}/${total}\nFailed: ${failed}/${total}`,
            { duration: 5000 }
          );

          // Show detailed failure messages if any
          if (failed > 0 && response.data.results.failed.length > 0) {
            response.data.results.failed.forEach((failure) => {
              toast.error(`Order #${failure.orderNumber}: ${failure.error}`, {
                duration: 4000,
              });
            });
          }

          if (onSuccess) onSuccess();
          return response.data;
        } else {
          throw new Error("Failed to create bulk courier orders");
        }
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.error ||
          err.message ||
          "Failed to create bulk courier orders";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsBulkCreating(false);
      }
    },
    []
  );

  /**
   * Check delivery status
   */
  const checkDeliveryStatus = useCallback(
    async (
      identifier: string,
      provider: "pathao" | "steadfast",
      type: "consignment" | "invoice" | "tracking" = "consignment"
    ) => {
      try {
        const response = await courierAPI.checkStatus(
          identifier,
          provider,
          type
        );
        if (response.success) {
          return response.data;
        } else {
          throw new Error("Failed to check delivery status");
        }
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.error ||
          err.message ||
          "Failed to check delivery status";
        toast.error(errorMessage);
        return null;
      }
    },
    []
  );

  /**
   * Get invoice details
   */
  const getInvoiceDetails = useCallback(async (consignmentId: string) => {
    try {
      const response = await courierAPI.getInvoice(consignmentId);
      if (response.success) {
        return response.data;
      } else {
        throw new Error("Failed to get invoice details");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err.message ||
        "Failed to get invoice details";
      toast.error(errorMessage);
      return null;
    }
  }, []);

  return {
    // State
    isCreating,
    isBulkCreating,
    error,

    // Actions
    createCourierOrder,
    bulkCreateCourierOrders,
    checkDeliveryStatus,
    getInvoiceDetails,
  };
};

export default useCourierActions;
