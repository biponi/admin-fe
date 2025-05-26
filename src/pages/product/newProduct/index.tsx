import { useEffect, useState } from "react";
import { createProduct } from "../../../api";
import { useToast } from "../../../components/ui/use-toast";
import MainView from "../../../coreComponents/mainView";
import { IProductCreateData, IVariation } from "../interface";
import AddProduct from "./addProduct";
import DefaultLoading from "../../../coreComponents/defaultLoading";
import useCategory from "../hooks/useCategory";
import { buildFormDataFromObject } from "../../../utils/functions";

const CreateNewProduct = () => {
  const { toast } = useToast();
  const { categories, fetchCategories } = useCategory();
  const [loading, setLoading] = useState(false);
  const isValidVariation = (variation: IVariation): boolean => {
    // Ensure required fields of the variation are valid
    const { quantity, unitPrice } = variation;
    if (
      isNaN(Number(quantity)) ||
      quantity < 0 ||
      !unitPrice ||
      unitPrice === 0
    ) {
      return false; // Quantity and unitPrice must be non-zero and defined
    } else return true;
  };
  const validateProductData = (productData: IProductCreateData) => {
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
    } else if (!productData?.categoryId) {
      return {
        isValidate: false,
        message: "Select a valid category for the product",
      };
    } else if (
      productData?.variation.length < 0 &&
      (Number(productData?.quantity) < 0 || productData?.unitPrice)
    ) {
      return {
        isValidate: false,
        message: `Enter a valid ${
          Number(productData?.quantity) < 0 ? "quantity" : "unit price"
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

  useEffect(() => {
    fetchCategories();
    //eslint-disable-next-line
  }, []);

  const createNewProduct = async (productData: IProductCreateData) => {
    const validateResponse = validateProductData(productData);
    if (!validateResponse?.isValidate) {
      toast({
        title: "🚨 Product validation failed",
        description: validateResponse?.message,
        variant: "destructive",
      });
    } else {
      setLoading(true);
      const response = await createProduct(
        buildFormDataFromObject(productData)
      );
      setLoading(false);
      if (response?.success) {
        toast({
          title: "🎉🎉 Product created successfully",
          description: validateResponse?.message,
          variant: "default",
        });
        return true;
      } else {
        toast({
          title: "🆘 Oops!!, Product creation failed",
          description: response?.error,
          variant: "destructive",
        });
      }
    }

    return false;
  };
  const mainView = () => {
    if (loading) {
      return <DefaultLoading title='Creating new product' />;
    } else {
      return (
        <AddProduct categories={categories} createProduct={createNewProduct} />
      );
    }
  };
  return <MainView title='Add New Product'>{mainView()}</MainView>;
};

export default CreateNewProduct;
