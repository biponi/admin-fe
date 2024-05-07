import { Outlet, Route, Routes } from "react-router-dom";
import Navbar from "../coreComponents/navbar";
import ProductPage from "./product";
import Category from "./product/category";
import CreateNewProduct from "./product/newProduct";
import UpdateProduct from "./product/newProduct/editProductIndex";
import CreateOrder from "./order/CreateOrder";
import OrderPage from "./order";

const PageView = () => {
  return (
    <div className='grid min-h-[70vh] w-full pl-0 sm:pl-[53px] sm:h-screen'>
      <Navbar />
      <Routes>
        {/* <Route path='/' element={<Dashboard />} /> */}
        <Route path='/products' element={<ProductPage />} />
        <Route path='/product/update/:id' element={<UpdateProduct />} />
        <Route path='/product/create' element={<CreateNewProduct />} />
        <Route path='/category' element={<Category />} />
        <Route path='/order' element={<OrderPage />} />
        <Route path='/order/create' element={<CreateOrder />} />
      </Routes>
      <Outlet />
      {/* <CreateNewProduct /> */}
      {/* <Category /> */}
    </div>
  );
};

export default PageView;
