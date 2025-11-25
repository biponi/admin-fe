//import { useNavigate } from "react-router-dom";
import MainView from "../../coreComponents/mainView";
import OrderList from "./orderList";

const OrderPage = () => {
  //   const navigate = useNavigate();
  //   const handleEditProduct = (id: string) => {
  //     navigate(`/products/update/${id}`);
  //   };
  const renderOrderListView = () => {
    return <OrderList />;
  };

  return <MainView title='Order'>{renderOrderListView()}</MainView>;
};

export default OrderPage;
