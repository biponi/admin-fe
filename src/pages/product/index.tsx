import { useNavigate } from "react-router-dom";
import MainView from "../../coreComponents/mainView";
import ProductList from "./productList";

const ProductPage = () => {
  const navigate = useNavigate();
  const handleEditProduct = (id: string) => {
    navigate(`/products/update/${id}`);
  };
  const renderProductListView = () => {
    return <ProductList handleEditProduct={handleEditProduct} />;
  };

  return <MainView title='Product'>{renderProductListView()}</MainView>;
};

export default ProductPage;
