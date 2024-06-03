import { Outlet, Route, Routes } from "react-router-dom";
import Navbar from "../coreComponents/navbar";
import ProductPage from "./product";
import Category from "./product/category";
import CreateNewProduct from "./product/newProduct";
import UpdateProduct from "./product/newProduct/editProductIndex";
import CreateOrder from "./order/CreateOrder";
import OrderPage from "./order";
import ProtectedRoute from "../ProtectedRoute";
import AccessDeniedPage from "../Unauthorize";

const PageView = () => {
  return (
    <div className='grid min-h-[70vh] w-full pl-0 sm:pl-[53px] sm:h-screen'>
      <Navbar />
      {/* <Route path='/' element={<Dashboard />} /> */}
      <Routes>
        <Route path='/unauthorize' element={<AccessDeniedPage />} />
      </Routes>
      <ProtectedRoute roles={["admin", "manager", "moderator"]}>
        <Routes>
          <Route path='/order' element={<OrderPage />} />
          <Route path='/order/create' element={<CreateOrder />} />
        </Routes>
      </ProtectedRoute>
      <ProtectedRoute roles={["admin", "manager"]}>
        <Routes>
          <Route path='/products' element={<ProductPage />} />
          <Route path='/product/update/:id' element={<UpdateProduct />} />
          <Route path='/product/create' element={<CreateNewProduct />} />
          <Route path='/category' element={<Category />} />
        </Routes>
      </ProtectedRoute>
      {/* <ProtectedRoute roles={["admin"]}></ProtectedRoute> */}
      <Outlet />
    </div>
  );
};

export default PageView;
