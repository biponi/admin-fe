import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCategoryByIdOrSlug } from "../../../api/product";
import useCategory from "../hooks/useCategory";
import { ICategory } from "../interface";
import CategoryForm from "./components/CategoryForm";
import MainView from "../../../coreComponents/mainView";
import DefaultLoading from "../../../coreComponents/defaultLoading";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { ArrowLeft, FolderX } from "lucide-react";

const EditCategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    loading: categoryLoading,
    categories,
    fetchCategories,
    editExistingCategory,
  } = useCategory();

  const [existingCategory, setExistingCategory] = useState<ICategory | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      const response = await getCategoryByIdOrSlug(id);
      setLoading(false);
      if (response?.success && response.data) {
        setExistingCategory(response.data);
      } else {
        setError(response?.error || "Category not found");
      }
    };
    if (id) fetchCategory();
  }, [id]);

  if (loading) {
    return (
      <MainView title="Edit Category">
        <DefaultLoading title="Loading category..." />
      </MainView>
    );
  }

  if (error || !existingCategory) {
    return (
      <MainView title="Edit Category">
        <div className="min-h-screen bg-slate-50/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/category")}
                className="border-slate-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            <Alert variant="destructive" className="border-rose-200 bg-rose-50">
              <FolderX className="h-4 w-4" />
              <AlertDescription className="text-rose-600">
                {error || "Category not found"}
              </AlertDescription>
            </Alert>
            <Button
              variant="outline"
              onClick={() => navigate("/category")}
              className="border-slate-200">
              Back to Categories
            </Button>
          </div>
        </div>
      </MainView>
    );
  }

  return (
    <MainView title={`Edit - ${existingCategory.name}`}>
      <CategoryForm
        mode="edit"
        categories={categories}
        existingCategory={existingCategory}
        loading={categoryLoading}
        onSubmit={editExistingCategory}
      />
    </MainView>
  );
};

export default EditCategoryPage;
