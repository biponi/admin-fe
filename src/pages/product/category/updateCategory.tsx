// Updated UpdateCategory Component
import { ReactElement, useEffect, useState } from "react";
import { ICategory, IChangeEvent, ICreateCategory } from "../interface";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Switch } from "../../../components/ui/switch";
import { Badge } from "../../../components/ui/badge";
import { ChevronRight } from "lucide-react";
import PlaceHolderImage from "../../../assets/placeholder.svg";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";

interface Props {
  open?: boolean;
  isNewCategory: boolean;
  children?: ReactElement;
  handleOpenChange: (open: boolean) => void;
  category?: ICategory | ICreateCategory | null;
  categories: ICategory[]; // All categories for parent selection
  loading: boolean;
  createCategory: (data: ICreateCategory) => Promise<boolean>;
  editExistingCategory: (data: ICategory) => Promise<boolean>;
}

const defaultCategory = {
  name: "",
  img: "",
  description: "",
  discount: 0.0,
  active: true,
  parentId: null,
  google_category_type: "",
};

const UpdateCategory: React.FC<Props> = ({
  open = false,
  isNewCategory,
  category = null,
  categories = [],
  children = null,
  handleOpenChange,
  loading,
  createCategory,
  editExistingCategory,
}) => {
  const [image, setImage] = useState<File | null>(null);
  const [existingCategory, setExistingCategory] = useState<
    ICategory | ICreateCategory | null
  >(null);

  useEffect(() => {
    return setImage(null);
  }, []);

  useEffect(() => {
    if (!!category) {
      setExistingCategory(category);
    } else {
      setExistingCategory(defaultCategory);
    }
  }, [category]);

  // Get available parent categories (exclude current category and its descendants)
  const getAvailableParentCategories = () => {
    if (isNewCategory) return categories;
    //@ts-ignore
    if (!existingCategory?.id) return categories;

    return categories.filter((cat) => {
      // Exclude self
      //@ts-ignore
      if (cat.id === existingCategory.id) return false;
      // Exclude descendants (categories that have current category in ancestors)
      //@ts-ignore
      if (cat.ancestors && cat.ancestors.includes(existingCategory.id))
        return false;
      return true;
    });
  };

  // Build category display name with hierarchy
  const buildCategoryDisplayName = (cat: ICategory): string => {
    const levelIndicator = "  ".repeat(cat.level || 0);
    return `${levelIndicator}${cat.name} (Level ${cat.level || 0})`;
  };

  // Get category breadcrumb for preview
  const getCategoryBreadcrumb = (parentId: string | null): string => {
    if (!parentId) return "Root Category";

    const parent = categories.find((cat) => cat.id === parentId);
    if (!parent) return "Root Category";

    const breadcrumb = parent.categoryHierarchy
      ? parent.categoryHierarchy.map((cat: any) => cat.name).join(" > ") +
        " > " +
        parent.name
      : parent.name;

    return breadcrumb + " > " + (existingCategory?.name || "New Category");
  };

  const handleSubmit = async () => {
    if (isNewCategory) {
      if (!!existingCategory) {
        const res = await createCategory(
          !!image && image !== null
            ? { ...existingCategory, img: image }
            : existingCategory
        );
        if (!!res) {
          handleOpenChange(false);
          setExistingCategory(defaultCategory);
          setImage(null);
        }
      }
    } else {
      //@ts-ignore
      if (!!existingCategory?.id) {
        //@ts-ignore
        const res = await editExistingCategory({
          //@ts-ignore
          ...(!!image && image !== null
            ? { ...existingCategory, img: image }
            : existingCategory),
        });
        if (!!res) {
          handleOpenChange(false);
          setImage(null);
        }
      }
    }
  };

  const handleChange = (e: IChangeEvent) => {
    const { name, value } = e.target;
    if (isNewCategory) {
      const updatedCategoryData = !!existingCategory
        ? { ...existingCategory, [name]: value }
        : { ...defaultCategory, [name]: value };
      setExistingCategory(updatedCategoryData);
    } else if (!!existingCategory) {
      setExistingCategory({ ...existingCategory, [name]: value });
    }
  };

  const handleParentChange = (parentId: string) => {
    console.log("Selected Parent ID:", parentId);
    const updatedCategory = {
      ...existingCategory,
      parentId: parentId === "root" ? null : parentId,
    };
    //@ts-ignore
    setExistingCategory(updatedCategory);
  };

  const renderFormView = () => {
    return (
      <Card>
        <CardContent>
          <div className='grid gap-4 grid-cols-1 lg:grid-cols-3'>
            <div className='col-span-1 lg:col-span-2'>
              {/* Category Name */}
              <div className='grid w-full items-center gap-1.5 my-5'>
                <Label htmlFor='name'>Category Name *</Label>
                <Input
                  type='text'
                  name='name'
                  onChange={handleChange}
                  placeholder='Enter category name'
                  value={existingCategory?.name ?? ""}
                />
              </div>

              {/* Parent Category Selection */}
              <div className='grid w-full items-center gap-1.5 my-5'>
                <Label htmlFor='parentId'>Parent Category</Label>
                <Select
                  value={existingCategory?.parentId || "root"}
                  onValueChange={handleParentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select parent category' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='root'>
                      Root Category (No Parent)
                    </SelectItem>
                    {getAvailableParentCategories()
                      .sort((a, b) => (a.level || 0) - (b.level || 0))
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {buildCategoryDisplayName(cat)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {existingCategory?.parentId && (
                  <div className='text-sm text-muted-foreground mt-1'>
                    <strong>Category Path:</strong>{" "}
                    {getCategoryBreadcrumb(existingCategory.parentId)}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className='grid w-full items-center gap-1.5 my-5'>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  name='description'
                  placeholder='Enter category description'
                  onChange={handleChange}
                  value={existingCategory?.description ?? ""}
                  rows={3}
                />
              </div>

              {/* Google Category Type */}
              <div className='grid w-full items-center gap-1.5 my-5'>
                <Label htmlFor='google_category_type'>
                  Google Category Type
                </Label>
                <Input
                  type='text'
                  name='google_category_type'
                  placeholder='e.g., Electronics > Computers > Laptops'
                  onChange={handleChange}
                  value={existingCategory?.google_category_type ?? ""}
                />
                <div className='text-xs text-muted-foreground'>
                  Optional: Used for Google Shopping integration
                </div>
              </div>

              {/* Discount */}
              <div className='grid w-full items-center gap-1.5 my-5'>
                <Label htmlFor='discount'>Discount (%)</Label>
                <Input
                  type='number'
                  name='discount'
                  placeholder='0.00'
                  min='0'
                  max='100'
                  step='0.01'
                  onChange={handleChange}
                  value={existingCategory?.discount ?? ""}
                />
              </div>

              {/* Active Status */}
              <div className='flex items-center space-x-2 my-5'>
                <Switch
                  id='active-status'
                  checked={existingCategory?.active ?? true}
                  onCheckedChange={(value) => {
                    if (!!existingCategory) {
                      setExistingCategory({
                        ...existingCategory,
                        active: value,
                      });
                    }
                  }}
                />
                <Label htmlFor='active-status'>Active</Label>
                <div className='text-sm text-muted-foreground ml-2'>
                  {existingCategory?.active
                    ? "Category is visible"
                    : "Category is hidden"}
                </div>
              </div>

              {/* Image Upload */}
              <div className='grid w-full items-center gap-1.5 my-5'>
                <Label htmlFor='picture'>Category Image</Label>
                <Input
                  id='picture'
                  type='file'
                  accept='image/*'
                  onChange={(e) => {
                    //@ts-ignore
                    const file = e.target.files[0];
                    if (!!existingCategory && !!file) setImage(file);
                  }}
                />
              </div>
            </div>

            {/* Image Preview */}
            <div className='w-full mt-5'>
              <Card>
                <CardHeader>
                  <CardTitle>Category Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid gap-2'>
                    <img
                      alt='Category_image'
                      className='aspect-square w-full rounded-md object-cover'
                      height='200'
                      src={
                        !!existingCategory &&
                        !!existingCategory?.img &&
                        typeof existingCategory?.img === "string"
                          ? existingCategory?.img
                          : !!image
                          ? URL.createObjectURL(image)
                          : PlaceHolderImage
                      }
                      width='200'
                    />
                    <div className='text-sm text-center'>
                      <div className='font-medium'>
                        {existingCategory?.name || "Category Name"}
                      </div>
                      {existingCategory?.parentId && (
                        <div className='text-muted-foreground text-xs mt-1'>
                          {getCategoryBreadcrumb(existingCategory.parentId)}
                        </div>
                      )}
                      {!existingCategory?.parentId && (
                        <Badge variant='outline' className='mt-1'>
                          Root Category
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(open) => handleOpenChange(open)}>
      {!!children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className='w-[90vw] max-w-[95vw] sm:w-[80vw] sm:max-w-[90vw] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {isNewCategory ? "Create Category" : "Update Category"}
          </DialogTitle>
          <DialogDescription>
            {`Configure your category settings. Categories can be nested to create hierarchical organization. Click ${
              isNewCategory ? "create" : "update"
            } when you're done.`}
          </DialogDescription>
        </DialogHeader>
        {renderFormView()}
        <DialogFooter>
          <Button variant='outline' onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!!!existingCategory?.name || loading}
            onClick={() => handleSubmit()}>
            {loading
              ? "Processing..."
              : isNewCategory
              ? "Create Category"
              : "Update Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateCategory;
