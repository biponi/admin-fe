import { useState } from "react";
import {
  deleteCategory,
  editCategory,
  addCategory,
  getAllCategory,
} from "../../../api/product";
import { useToast } from "../../../components/ui/use-toast";
import { ToastAction } from "../../../components/ui/toast";
import { ICategory, ICreateCategory } from "../interface";

const useCategory = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const fetchCategories = async () => {
    setLoading(true);
    const response = await getAllCategory();
    setLoading(false);
    if (response?.success) {
      setCategories([...response.data]);
    } else {
      toast({
        title: "Category fetching Error ",
        description: response?.error,
        action: (
          <ToastAction
            altText='Goto schedule to undo'
            onClick={() => fetchCategories()}>
            Try Again
          </ToastAction>
        ),
      });
    }
  };

  const createCategory = async (categoryData: ICreateCategory) => {
    if (!categoryData?.name) {
      toast({
        title: "Category Create Issue",
        description: "Please enter a valid name",
        variant: "destructive",
      });
    } else {
      setLoading(true);
      const response = await addCategory(categoryData);
      setLoading(false);
      if (response?.success) {
        toast({
          title: "Category Created Successfully",
          description: "You have added new category",
        });
        fetchCategories();
        return true;
      } else {
        toast({
          title: "Category Create Issue",
          description: response?.error,
          variant: "destructive",
        });
      }
    }
    return false;
  };

  const editExistingCategory = async (categoryData: ICategory) => {
    if (!categoryData?.name) {
      toast({
        title: "Category Update Issue",
        description: "Please enter a valid name",
        variant: "destructive",
      });
    } else {
      setLoading(true);
      const response = await editCategory(categoryData?.id, categoryData);
      setLoading(false);
      if (response?.success) {
        toast({
          title: "Category Updated Successfully",
          description: "You have updated  category",
        });
        fetchCategories();
        return true;
      } else {
        toast({
          title: "Category Update Issue",
          description: response?.error,
          variant: "destructive",
        });
      }
    }
    return false;
  };

  const deleteExistingCategory = async (id: string, force: boolean = false) => {
    setLoading(true);
    const response = await deleteCategory(id);
    setLoading(false);
    if (response?.success) {
      toast({
        title: "Category deleted Successfully",
        description: `You have deleted the category`,
      });
      fetchCategories();
      return true;
    } else {
      toast({
        title: "Category delete Issue",
        description: response?.error,
        variant: "destructive",
      });
    }

    return false;
  };

  return {
    loading,
    categories,
    createCategory,
    fetchCategories,
    editExistingCategory,
    deleteExistingCategory,
  };
};

export default useCategory;
