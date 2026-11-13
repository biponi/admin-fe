import { Route } from "react-router-dom";
import ProductPage from "../../pages/product";
import Category from "../../pages/product/category";
import CreateCategoryPage from "../../pages/product/category/createCategory";
import EditCategoryPage from "../../pages/product/category/editCategory";
import CreateNewProduct from "../../pages/product/newProduct";
import UpdateProduct from "../../pages/product/newProduct/editProductIndex";
import OrderManagement from "../../pages/order-v2"; // V2 with toggle support
import ModifyOrder from "../../pages/order/modifyOrderProduct";
import ModificationHistory from "../../pages/order/ModificationHistory";
import CreateCampaignForm from "../../pages/campaign/components/createCampaign";
import CampaignList from "../../pages/campaign/campaignList";
import UpdateCampaignForm from "../../pages/campaign/components/updateCampaign";
import AccessDeniedPage from "../../Unauthorize";
import ProtectedRoute from "../../ProtectedRoute";

export const publicRoutes = (
  <>
    <Route path='/unauthorize' element={<AccessDeniedPage />} />
    <Route
      path='/products'
      element={
        <ProtectedRoute page='product' requiredAction='view'>
          <ProductPage />
        </ProtectedRoute>
      }
    />
    <Route
      path='/products/update/:id'
      element={
        <ProtectedRoute page='product' requiredAction='edit'>
          <UpdateProduct />
        </ProtectedRoute>
      }
    />
    <Route
      path='/products/create'
      element={
        <ProtectedRoute page='product' requiredAction='create'>
          <CreateNewProduct />
        </ProtectedRoute>
      }
    />
    <Route
      path='/category'
      element={
        <ProtectedRoute page='category' requiredAction='view'>
          <Category />
        </ProtectedRoute>
      }
    />
    <Route
      path='/category/create'
      element={
        <ProtectedRoute page='category' requiredAction='create'>
          <CreateCategoryPage />
        </ProtectedRoute>
      }
    />
    <Route
      path='/category/edit/:id'
      element={
        <ProtectedRoute page='category' requiredAction='edit'>
          <EditCategoryPage />
        </ProtectedRoute>
      }
    />
    <Route
      path='/order'
      element={
        <ProtectedRoute page='order' requiredAction='view'>
          <OrderManagement />
        </ProtectedRoute>
      }
    />
    <Route
      path='/order/modify/:orderId'
      element={
        <ProtectedRoute page='order' requiredAction='modify'>
          <ModifyOrder />
        </ProtectedRoute>
      }
    />
    <Route
      path='/order/:orderId/history'
      element={
        <ProtectedRoute page='order' requiredAction='view'>
          <ModificationHistory />
        </ProtectedRoute>
      }
    />
    <Route
      path='/campaign/create'
      element={
        <ProtectedRoute page='campaign' requiredAction='create'>
          <CreateCampaignForm />
        </ProtectedRoute>
      }
    />
    <Route
      path='/campaign/update/:id'
      element={
        <ProtectedRoute page='campaign' requiredAction='edit'>
          <UpdateCampaignForm />
        </ProtectedRoute>
      }
    />
    <Route
      path='/campaign'
      element={
        <ProtectedRoute page='campaign' requiredAction='view'>
          <CampaignList />
        </ProtectedRoute>
      }
    />
  </>
);
