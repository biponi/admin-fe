import { Route } from "react-router-dom";
import ProductPage from "../../pages/product";
import Category from "../../pages/product/category";
import CreateNewProduct from "../../pages/product/newProduct";
import UpdateProduct from "../../pages/product/newProduct/editProductIndex";
import CreateOrder from "../../pages/order/CreateOrder";
import OrderManagement from "../../pages/order-v2"; // V2 with toggle support
import ModifyOrder from "../../pages/order/modifyOrderProduct";
import ModificationHistory from "../../pages/order/ModificationHistory";
import CreateCampaignForm from "../../pages/campaign/components/createCampaign";
import CampaignList from "../../pages/campaign/campaignList";
import UpdateCampaignForm from "../../pages/campaign/components/updateCampaign";
import AccessDeniedPage from "../../Unauthorize";

export const publicRoutes = (
  <>
    <Route path='/unauthorize' element={<AccessDeniedPage />} />
    <Route path='/products' element={<ProductPage />} />
    <Route path='/products/update/:id' element={<UpdateProduct />} />
    <Route path='/products/create' element={<CreateNewProduct />} />
    <Route path='/category' element={<Category />} />
    <Route path='/order' element={<OrderManagement />} />
    <Route path='/order/modify/:orderId' element={<ModifyOrder />} />
    <Route path='/order/:orderId/history' element={<ModificationHistory />} />
    <Route path='/campaign/create' element={<CreateCampaignForm />} />
    <Route path='/campaign/update/:id' element={<UpdateCampaignForm />} />
    <Route path='/campaign' element={<CampaignList />} />
  </>
);
