import React from "react";
import MainView from "../../coreComponents/mainView";
import ReserveStoresList from "./listOfReserveStore";

const ReserveStore: React.FC = () => {
  return (
    <MainView title='Stores'>
      <ReserveStoresList />
    </MainView>
  );
};

export default ReserveStore;
