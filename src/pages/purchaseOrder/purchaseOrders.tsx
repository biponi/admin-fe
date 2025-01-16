import React from "react";
import MainView from "../../coreComponents/mainView";
import ListPurchaseOrders from "./ListPurchaseOrderList";

const PurchaseOrders: React.FC = () => {
  return (
    <MainView title="Purchase Orders">
      <ListPurchaseOrders />
    </MainView>
  );
};

export default PurchaseOrders;
