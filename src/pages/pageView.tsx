import { Outlet, Route, Routes } from "react-router-dom";
import Navbar from "../coreComponents/navbar";
import ProductPage from "./product";
import Category from "./product/category";
import CreateNewProduct from "./product/newProduct";
import UpdateProduct from "./product/newProduct/editProductIndex";
import CreateOrder from "./order/CreateOrder";
import OrderPage from "./order";
// import ProtectedRoute from "../ProtectedRoute";
import AccessDeniedPage from "../Unauthorize";
import DashboardPage from "./dashboard";
import CreateCampaignForm from "./campaign/components/createCampaign";
import CampaignList from "./campaign/campaignList";
import UpdateCampaignForm from "./campaign/components/updateCampaign";
import ListPurchaseOrders from "./purchaseOrder/ListPurchaseOrderList";
import CreatePurchaseOrder from "./purchaseOrder/CreatePurchaseOrder";
import PurchaseOrders from "./purchaseOrder/purchaseOrders";

const PageView = () => {
  return (
    <div className="grid min-h-[70vh] w-full pl-0 sm:pl-[53px] sm:h-screen">
      <Navbar />

      <Routes>
        <Route path="/products" element={<ProductPage />} />
        <Route path="/product/update/:id" element={<UpdateProduct />} />
        <Route path="/product/create" element={<CreateNewProduct />} />
        <Route path="/category" element={<Category />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/order/create" element={<CreateOrder />} />
        <Route path="/campaign/create" element={<CreateCampaignForm />} />
        <Route path="/campaign/update/:id" element={<UpdateCampaignForm />} />
        <Route path="/campaign" element={<CampaignList />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/unauthorize" element={<AccessDeniedPage />} />
        <Route path="/purchase-order/list" element={<PurchaseOrders />} />
        <Route
          path="/purchase-order/create"
          element={<CreatePurchaseOrder />}
        />
      </Routes>
      {/* <ProtectedRoute roles={["admin", "manager"]}></ProtectedRoute> */}
      {/* <ProtectedRoute roles={["admin", "manager", "moderator"]}>
        <Routes></Routes>
      </ProtectedRoute>
      <Routes></Routes> */}
      {/* <ProtectedRoute roles={["admin"]}></ProtectedRoute> */}
      <Outlet />
    </div>
  );
};

export default PageView;
