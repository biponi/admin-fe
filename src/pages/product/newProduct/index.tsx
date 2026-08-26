import { useEffect, useState } from "react";
import { createProduct } from "../../../api";
import { useToast } from "../../../components/ui/use-toast";
import MainView from "../../../coreComponents/mainView";
import { IProductCreateData, IVariation } from "../interface";
import AddProduct from "./addProduct";
import DefaultLoading from "../../../coreComponents/defaultLoading";
import useCategory from "../hooks/useCategory";
import { buildFormDataFromObject } from "../../../utils/functions";
import { errorToast } from "../../../utils/toast";

const CreateNewProduct = () => {
  const { toast } = useToast();
  const { categories, fetchCategories } = useCategory();
  const [loading, setLoading] = useState(false);
  const isValidVariation = (variation: IVariation): boolean => {
    // Ensure required fields of the variation are valid
    const { quantity, unitPrice, size, color } = variation;
    if (
      isNaN(Number(quantity)) ||
      quantity < 0 ||
      !unitPrice ||
      unitPrice === 0
    ) {
      return false; // Quantity and unitPrice must be non-zero and defined
    }

    // Either size or color must be present (API requirement)
    const hasSize = size && size.trim() !== '';
    const hasColor = color && color.trim() !== '';
    if (!hasSize && !hasColor) {
      return false; // At least one of size or color is required
    }

    return true;
  };
  const validateProductData = (productData: IProductCreateData) => {
    if (!productData?.name) {
      return {
        isValidate: false,
        message: "Enter a valid name for the product",
      };
    } else if (!productData?.sku) {
      return {
        isValidate: false,
        message: "Enter a valid sku for the product",
      };
    } else if (!productData?.categoryIds || productData?.categoryIds.length === 0) {
      return {
        isValidate: false,
        message: "Select at least one category for the product",
      };
    } else if (!productData?.thumbnail || !(productData.thumbnail instanceof File)) {
      return {
        isValidate: false,
        message: "Thumbnail image is required",
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
            message: "not all variation has proper quantity, unit price, or size/color attributes",
          };
        }
      }
    } else if (productData?.commissionType === 'percentage' && productData?.commissionRate > 100) {
      return {
        isValidate: false,
        message: "Commission rate cannot exceed 100% for percentage type",
      };
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
      errorToast(
        validateResponse?.message || "Product validation failed",
        "top-center"
      );
    } else {
      setLoading(true);
      // Tags go as one JSON string — buildFormDataFromObject would emit
      // tags[0], tags[1], ... keys which the backend can't reassemble.
      const { tags, ...rest } = productData as any;
      const formData = buildFormDataFromObject(rest);
      if (tags && tags.length > 0) formData.append("tags", JSON.stringify(tags));
      const response = await createProduct(formData);
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
        errorToast(
          response?.error || "🆘 Oops!!, Product creation failed",
          "top-center"
        );
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
