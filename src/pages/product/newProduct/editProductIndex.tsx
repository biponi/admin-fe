import { useEffect, useState } from "react";
import { editProduct } from "../../../api";
import { useToast } from "../../../components/ui/use-toast";
import MainView from "../../../coreComponents/mainView";
import { IProductUpdateData, IVariation } from "../interface";
import DefaultLoading from "../../../coreComponents/defaultLoading";
import useCategory from "../hooks/useCategory";
import { buildFormDataFromObject } from "../../../utils/functions";
import { useNavigate, useParams } from "react-router-dom";
import EditProduct from "./editProduct";
import { getProductById } from "../../../api/product";
import { Button } from "../../../components/ui/button";
import { ArrowLeft } from "lucide-react";

const UpdateProduct = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { categories, fetchCategories } = useCategory();
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState<IProductUpdateData | null>(
    null
  );

  const { id } = useParams();
  const isValidVariation = (variation: IVariation): boolean => {
    // Ensure required fields of the variation are valid
    const { quantity, unitPrice } = variation;
    if (!quantity || quantity === 0 || !unitPrice || unitPrice === 0) {
      return false; // Quantity and unitPrice must be non-zero and defined
    } else return true;
  };
  const validateProductData = (productData: IProductUpdateData) => {
    if (!productData?.name) {
      return {
        isValidate: false,
        message: "Enter a valid name for the product",
      };
    } else if (!productData?.description) {
      return {
        isValidate: false,
        message: "Enter a valid description for the product",
      };
    } else if (!productData?.sku) {
      return {
        isValidate: false,
        message: "Enter a valid sku for the product",
      };
    } else if (
      productData?.variation.length < 0 &&
      (!productData?.quantity || productData?.unitPrice)
    ) {
      return {
        isValidate: false,
        message: `Enter a valid ${
          !productData?.quantity ? "quantity" : "unit price"
        } for the product`,
      };
    } else if (productData?.variation.length > 0) {
      for (const v of productData?.variation) {
        if (!isValidVariation(v)) {
          return {
            isValidate: false,
            message: "not all variation has proper quantity or unit price",
          };
        }
      }
    }
    return { isValidate: true, message: "All Data Are Validate" };
  };

  const getProductData = async (id: string) => {
    const response = await getProductById(id);
    if (response?.success) {
      setProductData(response?.data);
    }
  };

  useEffect(() => {
    if (!!id) {
      fetchCategories();
      getProductData(id);
    }
    //eslint-disable-next-line
  }, [id]);

  const updateProduct = async (productData: IProductUpdateData) => {
    const validateResponse = validateProductData(productData);
    console.log("validate: ", validateResponse);
    if (!validateResponse?.isValidate) {
      toast({
        title: "🚨 Product validation failed",
        description: validateResponse?.message,
        variant: "destructive",
      });
    } else {
      setLoading(true);
      const response = await editProduct(buildFormDataFromObject(productData));
      setLoading(false);
      if (response?.success) {
        toast({
          title: "🎉🎉 Product updated successfully",
          description: validateResponse?.message,
          variant: "default",
        });
        setProductData(response?.data);
        return true;
      } else {
        toast({
          title: "🆘 Oops!!, Product update failed",
          description: response?.error,
          variant: "destructive",
        });
      }
    }

    return false;
  };
  const mainView = () => {
    if (loading) {
      return <DefaultLoading title='Updating product' />;
    } else if (productData !== null) {
      return (
        <>
          <Button
            className='block sm:hidden sm:mr-auto '
            size={"icon"}
            variant={"ghost"}
            onClick={() => navigate("/products")}>
            <ArrowLeft className=' size-5 ' />
          </Button>
          <EditProduct
            productData={productData}
            categories={categories}
            updateProduct={updateProduct}
          />
        </>
      );
    } else return <></>;
  };
  return (
    <MainView title='Add New Product'>
      <>{mainView()}</>
    </MainView>
  );
};

export default UpdateProduct;
