// Updated UpdateCategory Component
import { ReactElement, useEffect, useState } from "react";
import { ICategory, IChangeEvent, ICreateCategory } from "../interface";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../../../components/ui/sheet";
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
import PlaceHolderImage from "../../../assets/placeholder.svg";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
} from "../../../components/ui/drawer";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { useIsMobile } from "../../../hooks/use-mobile";
import {
  FolderPlus,
  FolderEdit,
  Save,
  X,
  Tag,
  Percent,
  Settings2,
  ImageIcon,
  ChevronRight,
  Layers,
} from "lucide-react";

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
  discountType: "percentage",
  active: true,
  parentId: null,
  google_category_type: "",
};

const SectionHeading: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}> = ({ icon, title, subtitle }) => (
  <div className='flex items-center gap-2 mb-4'>
    <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600'>
      {icon}
    </div>
    <div>
      <h3 className='text-sm font-semibold text-slate-800 leading-none'>
        {title}
      </h3>
      {subtitle && (
        <p className='text-[11px] text-slate-400 mt-1'>{subtitle}</p>
      )}
    </div>
  </div>
);

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
  const isMobile = useIsMobile();
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
            : existingCategory,
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
    const updatedCategory = {
      ...existingCategory,
      parentId: parentId === "root" ? null : parentId,
    };
    //@ts-ignore
    setExistingCategory(updatedCategory);
  };

  const previewImageSrc =
    !!existingCategory &&
    !!existingCategory?.img &&
    typeof existingCategory?.img === "string"
      ? existingCategory.img
      : !!image
        ? URL.createObjectURL(image)
        : PlaceHolderImage;

  const isFixedDiscount = existingCategory?.discountType === "fixed";

  const renderPreviewStrip = () => (
    <div className='flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3'>
      <img
        alt='Category preview'
        src={previewImageSrc}
        className='h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-white shadow-sm'
      />
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-1.5'>
          <span className='truncate text-sm font-semibold text-slate-800'>
            {existingCategory?.name || "New category"}
          </span>
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
              existingCategory?.active
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-200 text-slate-500"
            }`}>
            {existingCategory?.active ? "Active" : "Inactive"}
          </span>
        </div>
        <div className='truncate text-[11px] text-slate-500 mt-0.5'>
          {existingCategory?.parentId ? (
            getCategoryBreadcrumb(existingCategory.parentId)
          ) : (
            <span className='inline-flex items-center gap-1'>
              <Layers className='h-3 w-3' />
              Root category
            </span>
          )}
        </div>
      </div>
      {!!existingCategory?.discount &&
        Number(existingCategory.discount) > 0 && (
          <span className='shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700'>
            {isFixedDiscount
              ? `৳${existingCategory.discount}`
              : `${existingCategory.discount}%`}{" "}
            off
          </span>
        )}
    </div>
  );

  const renderFormView = () => {
    return (
      <div className='space-y-4'>
        {renderPreviewStrip()}

        {/* Section 1: Basic Information */}
        <div className='rounded-xl border border-slate-100 bg-white p-4 sm:p-5'>
          <SectionHeading
            icon={<Tag className='h-3.5 w-3.5' />}
            title='Basic information'
          />
          <div className='space-y-4'>
            <div className='grid w-full gap-1.5'>
              <Label htmlFor='name'>Category name *</Label>
              <Input
                type='text'
                name='name'
                onChange={handleChange}
                placeholder='e.g. Electronics'
                value={existingCategory?.name ?? ""}
                className='h-10 border-slate-200 focus-visible:ring-blue-500'
              />
            </div>

            <div className='grid w-full gap-1.5'>
              <Label htmlFor='parentId'>Parent category</Label>
              <Select
                value={existingCategory?.parentId || "root"}
                onValueChange={handleParentChange}>
                <SelectTrigger className='h-10 border-slate-200 focus:ring-blue-500'>
                  <SelectValue placeholder='Select parent category' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='root'>
                    Root category (no parent)
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
                <div className='flex items-center gap-1 text-[11px] text-slate-400 mt-1'>
                  <ChevronRight className='h-3 w-3 shrink-0' />
                  <span className='truncate'>
                    {getCategoryBreadcrumb(existingCategory.parentId)}
                  </span>
                </div>
              )}
            </div>

            <div className='grid w-full gap-1.5'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                name='description'
                placeholder='What belongs in this category?'
                onChange={handleChange}
                value={existingCategory?.description ?? ""}
                rows={3}
                className='border-slate-200 focus-visible:ring-blue-500 resize-none'
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Discounts */}
        <div className='rounded-xl border border-slate-100 bg-white p-4 sm:p-5'>
          <SectionHeading
            icon={<Percent className='h-3.5 w-3.5' />}
            title='Pricing & discounts'
          />
          <div className='grid grid-cols-2 gap-3'>
            <div className='grid w-full gap-1.5'>
              <Label htmlFor='discountType'>Discount type</Label>
              <Select
                value={existingCategory?.discountType || "percentage"}
                onValueChange={(value) => {
                  if (!!existingCategory) {
                    setExistingCategory({
                      ...existingCategory,
                      discountType: value,
                    });
                  }
                }}>
                <SelectTrigger className='h-10 border-slate-200 focus:ring-blue-500'>
                  <SelectValue placeholder='Select discount type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='percentage'>Percentage</SelectItem>
                  <SelectItem value='fixed'>Fixed amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='grid w-full gap-1.5'>
              <Label htmlFor='discount'>
                Discount {isFixedDiscount ? "(৳)" : "(%)"}
              </Label>
              <div className='relative'>
                {isFixedDiscount && (
                  <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400'>
                    ৳
                  </span>
                )}
                <Input
                  type='number'
                  name='discount'
                  placeholder='0.00'
                  min='0'
                  max={isFixedDiscount ? undefined : "100"}
                  step='0.01'
                  onChange={handleChange}
                  value={existingCategory?.discount ?? ""}
                  className={`h-10 border-slate-200 focus-visible:ring-blue-500 ${
                    isFixedDiscount ? "pl-7" : ""
                  } ${!isFixedDiscount ? "pr-7" : ""}`}
                />
                {!isFixedDiscount && (
                  <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400'>
                    %
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Settings & Media */}
        <div className='rounded-xl border border-slate-100 bg-white p-4 sm:p-5'>
          <SectionHeading
            icon={<Settings2 className='h-3.5 w-3.5' />}
            title='Settings & media'
          />
          <div className='space-y-4'>
            <div className='grid w-full gap-1.5'>
              <Label htmlFor='google_category_type'>Google category type</Label>
              <Input
                type='text'
                name='google_category_type'
                placeholder='e.g. Electronics > Computers > Laptops'
                onChange={handleChange}
                value={existingCategory?.google_category_type ?? ""}
                className='h-10 border-slate-200 focus-visible:ring-blue-500'
              />
              <p className='text-[11px] text-slate-400'>
                Optional — used for Google Shopping integration
              </p>
            </div>

            <div className='flex items-center justify-between gap-3 rounded-lg bg-slate-50 border border-slate-100 p-3'>
              <div>
                <Label htmlFor='active-status' className='cursor-pointer'>
                  Active status
                </Label>
                <p className='text-[11px] text-slate-500 mt-0.5'>
                  {existingCategory?.active
                    ? "Visible to customers"
                    : "Hidden from customers"}
                </p>
              </div>
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
            </div>

            <div className='grid w-full gap-1.5'>
              <Label htmlFor='picture' className='flex items-center gap-2'>
                <ImageIcon className='h-3.5 w-3.5' />
                Category image
              </Label>
              <div className='flex items-center gap-3'>
                <img
                  alt='Selected'
                  src={previewImageSrc}
                  className='h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-slate-200'
                />
                <Input
                  id='picture'
                  type='file'
                  accept='image/*'
                  onChange={(e) => {
                    //@ts-ignore
                    const file = e.target.files[0];
                    if (!!existingCategory && !!file) setImage(file);
                  }}
                  className='h-10 border-slate-200 text-sm file:mr-3 file:h-full file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:text-xs file:font-medium file:text-blue-700 hover:file:bg-blue-100'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHeader = () => (
    <div className='flex items-center gap-3 mb-6'>
      <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 shadow-sm shadow-blue-200'>
        {isNewCategory ? (
          <FolderPlus className='h-5 w-5 text-white' />
        ) : (
          <FolderEdit className='h-5 w-5 text-white' />
        )}
      </div>
      <div>
        <h2 className='text-xl font-semibold text-slate-900 leading-tight'>
          {isNewCategory ? "Create category" : "Update category"}
        </h2>
        <p className='text-sm text-slate-500 mt-0.5'>
          Configure category settings and hierarchy
        </p>
      </div>
    </div>
  );

  if (isMobile)
    return (
      <Drawer open={open} onOpenChange={(open) => handleOpenChange(open)}>
        <DrawerContent>
          <ScrollArea className='h-[calc(100vh-200px)] px-4 pt-4'>
            {renderHeader()}
            {renderFormView()}
          </ScrollArea>

          <div className='flex flex-col gap-2 p-4 bg-white border-t border-slate-100'>
            <Button
              disabled={!!!existingCategory?.name || loading}
              onClick={() => handleSubmit()}
              className='h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg shadow-sm shadow-blue-200 transition-all duration-150'>
              <Save className='h-4 w-4' />
              {loading
                ? "Processing..."
                : isNewCategory
                  ? "Create category"
                  : "Save changes"}
            </Button>
            <DrawerClose className='w-full'>
              <Button className='w-full h-11 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-lg shadow-sm transition-all duration-150'>
                <X className='h-4 w-4' />
                Cancel
              </Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    );

  return (
    <Sheet open={open} onOpenChange={(open) => handleOpenChange(open)}>
      {!!children && <SheetTrigger asChild>{children}</SheetTrigger>}
      <SheetContent className='flex flex-col w-full sm:max-w-lg p-0'>
        <ScrollArea className='flex-1 px-6 pt-6'>
          {renderHeader()}
          {renderFormView()}
          <div className='h-4' />
        </ScrollArea>

        {/* Sticky footer */}
        <div className='flex items-center gap-2 px-6 py-4 border-t border-slate-100 bg-white'>
          <Button
            onClick={() => handleOpenChange(false)}
            className='h-10 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-lg shadow-sm transition-all duration-150'>
            <X className='h-4 w-4' />
            Cancel
          </Button>
          <Button
            disabled={!!!existingCategory?.name || loading}
            onClick={() => handleSubmit()}
            className='h-10 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg shadow-sm shadow-blue-200 transition-all duration-150 ml-auto'>
            <Save className='h-4 w-4' />
            {loading
              ? "Processing..."
              : isNewCategory
                ? "Create category"
                : "Save changes"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UpdateCategory;
