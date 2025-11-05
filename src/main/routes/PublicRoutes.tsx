import { Route } from "react-router-dom";
import ProductPage from "../../pages/product";
import Category from "../../pages/product/category";
import CreateNewProduct from "../../pages/product/newProduct";
import UpdateProduct from "../../pages/product/newProduct/editProductIndex";
import CreateOrder from "../../pages/order/CreateOrder";
import OrderPage from "../../pages/order";
import ModifyOrder from "../../pages/order/modifyOrderProduct";
import CreateCampaignForm from "../../pages/campaign/components/createCampaign";
import CampaignList from "../../pages/campaign/campaignList";
import UpdateCampaignForm from "../../pages/campaign/components/updateCampaign";
import AccessDeniedPage from "../../Unauthorize";

export const publicRoutes = (
  <>
    <Route path='/unauthorize' element={<AccessDeniedPage />} />
    <Route path='/products' element={<ProductPage />} />
    <Route path='/product/update/:id' element={<UpdateProduct />} />
    <Route path='/product/create' element={<CreateNewProduct />} />
    <Route path='/category' element={<Category />} />
    <Route path='/order' element={<OrderPage />} />
    <Route path='/order/create' element={<CreateOrder />} />
    <Route path='/order/modify/:orderId' element={<ModifyOrder />} />
    <Route path='/campaign/create' element={<CreateCampaignForm />} />
    <Route path='/campaign/update/:id' element={<UpdateCampaignForm />} />
    <Route path='/campaign' element={<CampaignList />} />
  </>
);
