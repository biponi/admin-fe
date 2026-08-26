import { useEffect } from "react";
import useCategory from "../hooks/useCategory";
import CategoryForm from "./components/CategoryForm";
import MainView from "../../../coreComponents/mainView";
import DefaultLoading from "../../../coreComponents/defaultLoading";

const CreateCategoryPage = () => {
  const {
    loading,
    categories,
    fetchCategories,
    createCategory,
  } = useCategory();

  useEffect(() => {
    fetchCategories();
    //eslint-disable-next-line
  }, []);

  if (loading && categories.length === 0) {
    return (
      <MainView title="Create Category">
        <DefaultLoading title="Loading categories..." />
      </MainView>
    );
  }

  return (
    <MainView title="Create Category">
      <CategoryForm
        mode="create"
        categories={categories}
        loading={loading}
        onSubmit={createCategory}
      />
    </MainView>
  );
};

export default CreateCategoryPage;
