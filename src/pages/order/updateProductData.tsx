import { updateOrderProductData } from "../../api/order";
import { useToast } from "../../components/ui/use-toast";
import { IOrderProduct } from "../product/interface";
import { IOrder, ITransection } from "./interface";
import UpdateOrderProductList from "./UpdateOrder";

interface IProps {
  order: IOrder;
  handleBack: () => void;
}
const UpdateProductData: React.FC<IProps> = ({ order, handleBack }) => {
  const { toast } = useToast();

  const handleSubmitCreateOrder = async (
    orderProducts: IOrderProduct[],
    transectionData: ITransection
  ) => {
    const products = orderProducts.map((op: IOrderProduct) => {
      let { variation, ...newOp } = op;
      if (!!op.selectedVariant) {
        //@ts-ignore
        newOp = { ...newOp, variation: op.selectedVariant };
      }
      newOp = { ...newOp, quantity: op.selectedQuantity };
      return newOp;
    });
    const orderData = {
      orderId: order?.id,
      transectionData,
      products,
    };
    const response = await updateOrderProductData(orderData);
    if (response.success) {
      toast({
        title: "Order Updated..",
        description: "Please check all order details",
      });
      handleBack();
    } else {
      toast({
        title: "Order Update Failed",
        description: response?.error,
        variant: "destructive",
      });
    }
  };

  return (
    <UpdateOrderProductList
      order={order}
      handleBack={() => handleBack()}
      handleProductDataSubmit={handleSubmitCreateOrder}
    />
  );
};

export default UpdateProductData;
