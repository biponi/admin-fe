import { getProductsById, searchProducts } from "../../../api";
import { updateOrder, updateOrderStatusData } from "../../../api/order";
import { toast } from "../../../components/ui/use-toast";
import { IProduct } from "../../product/interface";
import { IOrder } from "../interface";

const useOrder = () => {
  const getProductByQuery = async (query: string) => {
    const response = await searchProducts(query);
    if (response?.success) {
      return response?.data;
    } else return [];
  };

  const getProductsByIdList = async (order: IOrder): Promise<IProduct[]> => {
    const response = await getProductsById(
      order?.products?.map((p) => `${p?.id ?? ""}`)
    );
    if (response?.success) {
      return response?.data;
    } else return [];
  };

  const editOrderData = async (orderData: IOrder, callback: any = null) => {
    try {
      const response = await updateOrder(orderData);
      if (response?.success) {
        if (callback !== null) {
          toast({
            title: "Order updated successfully",
            variant: "default",
          });
          callback(true);
        }
      } else {
        toast({
          title: "Order update Failed",
          description: response?.error,
          variant: "destructive",
        });
      }
    } catch (Error) {
      console.error(Error);
    }
  };

  const updateOrderStatus = async (
    id: string,
    status: string,
    callback: any = null
  ) => {
    try {
      const response = await updateOrderStatusData(id, status);
      if (response?.success) {
        if (callback !== null) {
          toast({
            title: "Order updated successfully",
            variant: "default",
          });
          callback(true);
        }
      } else {
        toast({
          title: "Order update Failed",
          description: response?.error,
          variant: "destructive",
        });
      }
    } catch (Error) {
      console.error(Error);
    }
  };

  return {
    editOrderData,
    updateOrderStatus,
    getProductByQuery,
    getProductsByIdList,
  };
};

export default useOrder;
