import {
  PlusCircle,
  Trash,
  Upload,
  X,
  Plus,
  Save,
  ShoppingBag,
  Package,
  Tag,
  Palette,
  Ruler,
  Hash,
  Box,
  BarChart3,
  XIcon as XCircle,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { Textarea } from "../../../components/ui/textarea";
import { useRef, useState } from "react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import PlaceHolderImage from "../../../assets/placeholder.svg";
import CustomAlertDialog from "../../../coreComponents/OptionModal";
import { Badge } from "../../../components/ui/badge";

import { ICategory, IProductCreateData, IVariation } from "../interface";
import { useNavigate } from "react-router-dom";
import NestedCategorySelect from "../../../components/customComponent/NestedCategoryComponent";

const defaultValue = {
  name: "",
  active: true,
  quantity: 0,
  unitPrice: 0,
  manufactureId: "",
  discount: 0,
  discountType: "%",
  description: "",
  thumbnail: null,
  variation: [],
  sku: "",
  categoryId: "",
  images: [],
};

const defaultVariation = {
  id: 0,
  size: "",
  color: "",
  name: "",
  title: "",
  sku: "",
  quantity: 0,
  unitPrice: 0,
};

interface Props {
  createProduct: (productData: IProductCreateData) => Promise<boolean>;
  categories: ICategory[];
}

const AddProduct: React.FC<Props> = ({ createProduct, categories }) => {
  const [formData, updateFormData] = useState<IProductCreateData>(defaultValue);
  const [hasVariation, setHasVariation] = useState(false);
  const [isSameUnitPrice, setSameunitPrice] = useState(true);
  const [variationTab, setVariationTab] = useState("v1");
  const [v2Colors, setV2Colors] = useState<string[]>([]);
  const [v2Sizes, setV2Sizes] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("");

  const navigate = useNavigate();

  const fileRef = useRef(null);
  const fileRef2 = useRef(null);
  const dialogBtn = useRef(null);

  // Calculate total quantity from all variations
  const totalQuantity =
    formData?.variation?.reduce(
      (sum, variant) => sum + (variant.quantity || 0),
      0
    ) ||
    formData?.quantity ||
    0;

  // Get unique colors and sizes
  const uniqueColors = formData?.variation
    ? Array.from(
        new Set(formData.variation.map((v) => v.color).filter(Boolean))
      )
    : [];
  const uniqueSizes = formData?.variation
    ? Array.from(new Set(formData.variation.map((v) => v.size).filter(Boolean)))
    : [];

  // Handle form field changes
  //@ts-ignore
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "unitPrice" && isSameUnitPrice) {
      onUnitPriceChange(value);
    } else {
      updateFormData({
        ...formData,
        [name]: value,
      });
      if (name === "sku") {
        onSkuChange(value);
      }
    }
  };

  const onSkuChange = (value: string) => {
    if (!!formData.variation && formData.variation.length > 0) {
      updateFormData({
        ...formData,
        sku: value,
        variation: formData.variation.map((variation: IVariation) => {
          return { ...variation, sku: `${value}-${variation.id}` };
        }),
      });
    }
  };

  const onUnitPriceChange = (value: number) => {
    if (!!formData.variation && formData.variation.length > 0) {
      updateFormData({
        ...formData,
        unitPrice: value,
        variation: formData.variation.map((variation: IVariation) => {
          return { ...variation, unitPrice: value };
        }),
      });
    } else {
      updateFormData({
        ...formData,
        unitPrice: value,
      });
    }
  };

  const addNewVariation = () => {
    let arr = [];
    if (formData.variation.length > 0) {
      arr = [...formData.variation];
      //@ts-ignore
      let id = formData.variation[formData.variation.length - 1].id + 1;
      arr.push({
        ...defaultVariation,
        id,
        sku: `${formData.sku}-${id}`,
        unitPrice: isSameUnitPrice ? formData?.unitPrice : 0,
      });
    } else {
      arr.push({
        ...defaultVariation,
        sku: `${formData.sku}-${0}`,
        unitPrice: isSameUnitPrice ? formData?.unitPrice : 0,
      });
    }

    updateFormData({
      ...formData,
      //@ts-ignore
      variation: arr,
    });
  };

  const updateVariationData = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!!formData && index < formData?.variation.length) {
      const { name, value } = e.target;
      formData.variation[index] = {
        ...formData?.variation[index],
        [name]: value,
      };
      updateFormData({ ...formData });
    }

    if (formData.variation && formData?.variation.length > 0) {
      const totalQuantity = formData?.variation.reduce(
        (sum, variant) =>
          Number(sum) +
          (isNaN(Number(variant?.quantity)) ? 0 : Number(variant?.quantity)),
        0
      );
      updateFormData({
        ...formData,
        //@ts-ignore
        quantity: totalQuantity,
      });
    }
  };

  const handleSameUnitPrice = (value: boolean) => {
    setSameunitPrice(value);

    onUnitPriceChange(value ? formData.unitPrice : 0.0);
  };

  // V2 Variation Functions
  const addColor = () => {
    if (newColor.trim() && !v2Colors.includes(newColor.trim())) {
      setV2Colors([...v2Colors, newColor.trim()]);
      setNewColor("");
      generateV2Variations([...v2Colors, newColor.trim()], v2Sizes);
    }
  };

  const addSize = () => {
    if (newSize.trim() && !v2Sizes.includes(newSize.trim())) {
      setV2Sizes([...v2Sizes, newSize.trim()]);
      setNewSize("");
      generateV2Variations(v2Colors, [...v2Sizes, newSize.trim()]);
    }
  };

  const removeColor = (colorToRemove: string) => {
    const newColors = v2Colors.filter((color) => color !== colorToRemove);
    setV2Colors(newColors);
    generateV2Variations(newColors, v2Sizes);
  };

  const removeSize = (sizeToRemove: string) => {
    const newSizes = v2Sizes.filter((size) => size !== sizeToRemove);
    setV2Sizes(newSizes);
    generateV2Variations(v2Colors, newSizes);
  };

  const generateV2Variations = (colors: string[], sizes: string[]) => {
    const variations: IVariation[] = [];
    let id = 0;

    for (const color of colors) {
      for (const size of sizes) {
        variations.push({
          id: id.toString(),
          size,
          color,
          name: `${color} - ${size}`,
          title: `${color} ${size}`,
          sku: `${formData.sku}-${id}`,
          quantity: 0,
          unitPrice: isSameUnitPrice ? formData.unitPrice : 0,
        });
        id++;
      }
    }

    updateFormData({
      ...formData,
      variation: variations,
      quantity: variations.reduce((sum, variant) => sum + variant.quantity, 0),
    });
  };

  const renderV1VariationView = () => {
    return (
      <div className='space-y-4'>
        {/* Variation Cards Grid */}
        {!!formData.variation && formData.variation.length > 0 ? (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {formData.variation.map((variation: IVariation, index: number) => (
              <div
                key={variation.id}
                className='group relative bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-800/50 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-sm hover:shadow-lg transition-all duration-300'>
                {/* Delete Button */}
                <button
                  onClick={() => {
                    updateFormData((prev) => {
                      return {
                        ...prev,
                        variation: prev?.variation.filter((__, i) => i !== index),
                        quantity: prev?.quantity - variation?.quantity,
                      };
                    });
                  }}
                  className='absolute top-2 right-2 p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200 z-10'>
                  <Trash className='h-3.5 w-3.5' />
                </button>

                <div className='p-4 space-y-3'>
                  {/* SKU Header */}
                  <div className='flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700'>
                    <div className='p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg'>
                      <Hash className='h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400' />
                    </div>
                    <span className='font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 truncate'>
                      {variation?.sku}
                    </span>
                  </div>

                  {/* Inputs Grid */}
                  <div className='space-y-3'>
                    {/* Stock & Price */}
                    <div className='grid grid-cols-2 gap-2'>
                      <div className='space-y-1.5'>
                        <Label className='text-[10px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1'>
                          <Package className='h-3 w-3 text-emerald-500' />
                          Stock
                        </Label>
                        <Input
                          name='quantity'
                          onChange={(e) => updateVariationData(index, e)}
                          type='number'
                          value={variation.quantity}
                          min='0'
                          className='h-8 text-xs border-slate-300 dark:border-slate-600 focus:border-emerald-400 dark:focus:border-emerald-500'
                          placeholder='0'
                        />
                      </div>

                      <div className='space-y-1.5'>
                        <Label className='text-[10px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1'>
                          <Tag className='h-3 w-3 text-green-500' />
                          Price
                        </Label>
                        <Input
                          disabled={isSameUnitPrice}
                          className={`h-8 text-xs border-slate-300 dark:border-slate-600 ${
                            isSameUnitPrice
                              ? 'bg-slate-100 dark:bg-slate-900 text-slate-500 cursor-not-allowed'
                              : 'focus:border-green-400 dark:focus:border-green-500'
                          }`}
                          name='unitPrice'
                          onChange={(e) => updateVariationData(index, e)}
                          type='number'
                          value={variation.unitPrice}
                          min='0'
                          step='0.01'
                          placeholder='0.00'
                        />
                      </div>
                    </div>

                    {/* Color & Size */}
                    <div className='grid grid-cols-2 gap-2'>
                      <div className='space-y-1.5'>
                        <Label className='text-[10px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1'>
                          <Palette className='h-3 w-3 text-purple-500' />
                          Color
                        </Label>
                        <Input
                          name='color'
                          onChange={(e) => updateVariationData(index, e)}
                          type='text'
                          value={variation.color}
                          className='h-8 text-xs border-slate-300 dark:border-slate-600 focus:border-purple-400 dark:focus:border-purple-500'
                          placeholder='Enter color'
                        />
                      </div>

                      <div className='space-y-1.5'>
                        <Label className='text-[10px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1'>
                          <Ruler className='h-3 w-3 text-blue-500' />
                          Size
                        </Label>
                        <Input
                          name='size'
                          onChange={(e) => updateVariationData(index, e)}
                          type='text'
                          value={variation.size}
                          className='h-8 text-xs border-slate-300 dark:border-slate-600 focus:border-blue-400 dark:focus:border-blue-500'
                          placeholder='Enter size'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-12 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-slate-800/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600'>
            <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 mb-4'>
              <Box className='w-8 h-8 text-slate-400 dark:text-slate-500' />
            </div>
            <p className='text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'>
              No variations added yet
            </p>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Click "Add New Variation" below to get started
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderV2VariationView = () => {
    return (
      <div className='space-y-6'>
        <div className='grid gap-4 sm:grid-cols-2'>
          {/* Colors Section */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Palette className='w-4 h-4 text-purple-500' />
                <Label className='text-base font-semibold'>Colors</Label>
              </div>
              <Badge
                variant='secondary'
                className='bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0'>
                {v2Colors.length}
              </Badge>
            </div>

            <div className='flex gap-2'>
              <Input
                placeholder='e.g., Red, Blue, Green'
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addColor();
                  }
                }}
                className='flex-1 h-9 border-purple-200 focus:border-purple-400'
              />
              <Button
                onClick={addColor}
                size='sm'
                className='h-9 bg-purple-500 hover:bg-purple-600'
                disabled={
                  !newColor.trim() || v2Colors.includes(newColor.trim())
                }>
                <Plus className='h-4 w-4' />
              </Button>
            </div>

            <div className='flex flex-wrap gap-2 min-h-[70px] p-2.5 rounded-lg bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-100 dark:border-purple-900/30'>
              {v2Colors.length > 0 ? (
                v2Colors.map((color) => (
                  <Badge
                    key={color}
                    className='flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors'>
                    <Palette className='w-3 h-3' />
                    {color}
                    <button
                      onClick={() => removeColor(color)}
                      className='ml-0.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full p-0.5 transition-colors'>
                      <X className='h-3 w-3 text-red-500' />
                    </button>
                  </Badge>
                ))
              ) : (
                <p className='text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center w-full h-12'>
                  No colors added yet
                </p>
              )}
            </div>
          </div>

          {/* Sizes Section */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Ruler className='w-4 h-4 text-blue-500' />
                <Label className='text-base font-semibold'>Sizes</Label>
              </div>
              <Badge
                variant='secondary'
                className='bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0'>
                {v2Sizes.length}
              </Badge>
            </div>

            <div className='flex gap-2'>
              <Input
                placeholder='e.g., S, M, L, XL'
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSize();
                  }
                }}
                className='flex-1 h-9 border-blue-200 focus:border-blue-400'
              />
              <Button
                onClick={addSize}
                size='sm'
                className='h-9 bg-blue-500 hover:bg-blue-600'
                disabled={!newSize.trim() || v2Sizes.includes(newSize.trim())}>
                <Plus className='h-4 w-4' />
              </Button>
            </div>

            <div className='flex flex-wrap gap-2 min-h-[70px] p-2.5 rounded-lg bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-900/10 dark:to-cyan-900/10 border border-blue-100 dark:border-blue-900/30'>
              {v2Sizes.length > 0 ? (
                v2Sizes.map((size) => (
                  <Badge
                    key={size}
                    className='flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors'>
                    <Ruler className='w-3 h-3' />
                    {size}
                    <button
                      onClick={() => removeSize(size)}
                      className='ml-0.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full p-0.5 transition-colors'>
                      <X className='h-3 w-3 text-red-500' />
                    </button>
                  </Badge>
                ))
              ) : (
                <p className='text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center w-full h-12'>
                  No sizes added yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Generated Variations Preview */}
        {formData.variation.length > 0 && (
          <div className='space-y-3'>
            <div className='flex items-center justify-between p-2.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg border border-green-200 dark:border-green-900/30'>
              <div className='flex items-center gap-2'>
                <Box className='w-4 h-4 text-green-600' />
                <Label className='text-sm font-semibold text-green-700 dark:text-green-300'>
                  Generated Variations
                </Label>
              </div>
              <Badge className='bg-green-600 text-white border-0 shadow-sm'>
                {formData.variation.length}
              </Badge>
            </div>

            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {formData.variation.map(
                (variation: IVariation, index: number) => (
                  <div
                    key={variation.id}
                    className='group p-3 rounded-lg bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200'>
                    <div className='space-y-2.5'>
                      {/* Header */}
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1 min-w-0'>
                          <h4 className='font-semibold text-sm text-slate-800 dark:text-slate-200 truncate'>
                            {variation.name}
                          </h4>
                          <p className='text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5'>
                            {variation.sku}
                          </p>
                        </div>
                        <div className='flex-shrink-0'>
                          <div className='p-1 bg-white dark:bg-slate-700 rounded-md shadow-sm'>
                            <Package className='w-3.5 h-3.5 text-blue-500' />
                          </div>
                        </div>
                      </div>

                      {/* Inputs */}
                      <div
                        className={`grid gap-2 ${
                          !isSameUnitPrice ? "grid-cols-2" : "grid-cols-1"
                        }`}>
                        <div>
                          <Label
                            htmlFor={`qty-${variation.id}`}
                            className='text-[10px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-1'>
                            <BarChart3 className='w-3 h-3' />
                            Stock
                          </Label>
                          <Input
                            id={`qty-${variation.id}`}
                            name='quantity'
                            onChange={(e) => updateVariationData(index, e)}
                            type='number'
                            value={variation.quantity}
                            min='0'
                            className='h-8 text-sm border-slate-200 dark:border-slate-600 focus:border-green-400 bg-white dark:bg-slate-900'
                            placeholder='0'
                          />
                        </div>

                        {!isSameUnitPrice && (
                          <div>
                            <Label
                              htmlFor={`price-${variation.id}`}
                              className='text-[10px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-1'>
                              <Tag className='w-3 h-3' />
                              Price
                            </Label>
                            <Input
                              id={`price-${variation.id}`}
                              name='unitPrice'
                              onChange={(e) => updateVariationData(index, e)}
                              type='number'
                              value={variation.unitPrice}
                              min='0'
                              step='0.01'
                              className='h-8 text-sm border-slate-200 dark:border-slate-600 focus:border-green-400 bg-white dark:bg-slate-900'
                              placeholder='0.00'
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const discardDialog = () => {
    return (
      <CustomAlertDialog
        title='Are You Sure?'
        description='This will discard all the changes'
        onSubmit={() => {
          updateFormData(defaultValue);
        }}>
        <Button className='hidden' ref={dialogBtn}>
          show dialog
        </Button>
      </CustomAlertDialog>
    );
  };

  const createProductAndExit = async () => {
    const response = await createProduct({ ...formData });
    if (!!response) {
      navigate("/products");
    }
  };

  const createProductAndContinue = async () => {
    const response = await createProduct({ ...formData });
    if (!!response) {
      // updateFormData({ ...defaultValue });
    }
  };

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12'>
        {/* Header Section */}
        <div className='mb-6 sm:mb-8'>
          <div className='flex flex-col gap-3 sm:gap-4'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <div className='flex items-start gap-3 sm:gap-4'>
                <div className='hidden sm:flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30'>
                  <PlusCircle className='w-6 h-6 lg:w-7 lg:h-7 text-white' />
                </div>
                <div className='flex-1'>
                  <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent'>
                    Add New Product
                  </h1>
                  <p className='text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 sm:mt-2'>
                    Create a new product with detailed information and
                    variations
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <Button
                  variant='outline'
                  onClick={() => {
                    if (dialogBtn?.current) {
                      //@ts-ignore
                      dialogBtn.current.click();
                    }
                  }}
                  className='min-w-[100px] hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950'>
                  <XCircle className='w-4 h-4 mr-2' />
                  Discard
                </Button>
                <Button
                  onClick={() => createProductAndExit()}
                  className='min-w-[120px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'>
                  <Save className='w-4 h-4 mr-2' />
                  Save Product
                </Button>
                <Button
                  onClick={() => createProductAndContinue()}
                  variant='secondary'
                  className='min-w-[160px] hidden sm:inline-flex bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 hover:from-blue-200 hover:to-indigo-200'>
                  <Save className='w-4 h-4 mr-2' />
                  Save & Continue
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className='hidden grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8'>
          {/* Total Stock Card */}
          <Card className='border-none shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden relative'>
            <div className='absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-8 -mt-8 sm:-mr-12 sm:-mt-12' />
            <CardContent className='p-4 sm:p-6 relative z-10'>
              <div className='flex items-center justify-between mb-2 sm:mb-3'>
                <div className='p-2 sm:p-2.5 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm'>
                  <Package className='w-5 h-5 sm:w-6 sm:h-6' />
                </div>
                <BarChart3 className='w-5 h-5 sm:w-6 sm:h-6 opacity-50' />
              </div>
              <p className='text-xs sm:text-sm font-medium opacity-90 mb-1'>
                Total Stock
              </p>
              <p className='text-2xl sm:text-3xl lg:text-4xl font-bold'>
                {totalQuantity}
              </p>
            </CardContent>
          </Card>

          {/* Total Variations Card */}
          <Card className='border-none shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white overflow-hidden relative'>
            <div className='absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-8 -mt-8 sm:-mr-12 sm:-mt-12' />
            <CardContent className='p-4 sm:p-6 relative z-10'>
              <div className='flex items-center justify-between mb-2 sm:mb-3'>
                <div className='p-2 sm:p-2.5 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm'>
                  <Box className='w-5 h-5 sm:w-6 sm:h-6' />
                </div>
                <Tag className='w-5 h-5 sm:w-6 sm:h-6 opacity-50' />
              </div>
              <p className='text-xs sm:text-sm font-medium opacity-90 mb-1'>
                Total Variants
              </p>
              <p className='text-2xl sm:text-3xl lg:text-4xl font-bold'>
                {formData?.variation?.length || 0}
              </p>
            </CardContent>
          </Card>

          {/* Colors Card */}
          <Card className='border-none shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white overflow-hidden relative'>
            <div className='absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-8 -mt-8 sm:-mr-12 sm:-mt-12' />
            <CardContent className='p-4 sm:p-6 relative z-10'>
              <div className='flex items-center justify-between mb-2 sm:mb-3'>
                <div className='p-2 sm:p-2.5 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm'>
                  <Palette className='w-5 h-5 sm:w-6 sm:h-6' />
                </div>
                <Palette className='w-5 h-5 sm:w-6 sm:h-6 opacity-50' />
              </div>
              <p className='text-xs sm:text-sm font-medium opacity-90 mb-1'>
                Unique Colors
              </p>
              <p className='text-2xl sm:text-3xl lg:text-4xl font-bold'>
                {uniqueColors.length}
              </p>
            </CardContent>
          </Card>

          {/* Sizes Card */}
          <Card className='border-none shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white overflow-hidden relative'>
            <div className='absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-8 -mt-8 sm:-mr-12 sm:-mt-12' />
            <CardContent className='p-4 sm:p-6 relative z-10'>
              <div className='flex items-center justify-between mb-2 sm:mb-3'>
                <div className='p-2 sm:p-2.5 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm'>
                  <Ruler className='w-5 h-5 sm:w-6 sm:h-6' />
                </div>
                <Ruler className='w-5 h-5 sm:w-6 sm:h-6 opacity-50' />
              </div>
              <p className='text-xs sm:text-sm font-medium opacity-90 mb-1'>
                Unique Sizes
              </p>
              <p className='text-2xl sm:text-3xl lg:text-4xl font-bold'>
                {uniqueSizes.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className='grid gap-6 lg:gap-8 lg:grid-cols-[2fr_1fr]'>
          {/* Left Column - Editable Fields */}
          <div className='space-y-6'>
            {/* Basic Information Card */}
            <Card className='border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
              <CardHeader className='border-b border-slate-200 dark:border-slate-700'>
                <CardTitle className='text-xl flex items-center gap-2'>
                  <div className='p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg'>
                    <ShoppingBag className='w-5 h-5 text-white' />
                  </div>
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Provide the essential details about your product
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6 pt-6'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='name'
                    className='text-sm font-semibold flex items-center gap-2'>
                    <Tag className='w-4 h-4 text-blue-500' />
                    Product Name *
                  </Label>
                  <Input
                    id='name'
                    name='name'
                    type='text'
                    value={formData?.name}
                    onChange={handleChange}
                    placeholder='Enter product name'
                    className='h-11 border-2 focus:border-blue-500 transition-colors'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='description'
                    className='text-sm font-semibold'>
                    Description
                  </Label>
                  <Textarea
                    id='description'
                    name='description'
                    value={formData?.description}
                    onChange={handleChange}
                    placeholder='Describe your product features, benefits, and specifications'
                    className='min-h-[120px] resize-none border-2 focus:border-blue-500 transition-colors'
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Details Card */}
            <Card className='border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
              <CardHeader className='border-b border-slate-200 dark:border-slate-700'>
                <CardTitle className='text-xl flex items-center gap-2'>
                  <div className='p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg'>
                    <Package className='w-5 h-5 text-white' />
                  </div>
                  Product Details
                </CardTitle>
                <CardDescription>
                  Set category, SKU, pricing, and inventory information
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6 pt-6'>
                <div className='grid gap-6 sm:grid-cols-2'>
                  <div className='space-y-4'>
                    <NestedCategorySelect
                      categories={categories}
                      selectedCategoryId={formData?.categoryId}
                      setSelectedCategoryId={(id: string) => {
                        updateFormData({
                          ...formData,
                          categoryId: id,
                        });
                      }}
                    />

                    <div className='space-y-2'>
                      <Label
                        htmlFor='product-sku'
                        className='text-sm font-semibold flex items-center gap-2'>
                        <Hash className='w-4 h-4 text-slate-500' />
                        Product SKU *
                      </Label>
                      <Input
                        id='product-sku'
                        name='sku'
                        type='text'
                        value={formData?.sku}
                        onChange={handleChange}
                        placeholder='Enter unique SKU'
                        className='h-11 font-mono border-2 focus:border-indigo-500 transition-colors'
                        required
                      />
                      <p className='text-xs text-slate-600 dark:text-slate-400'>
                        Stock Keeping Unit - unique identifier
                      </p>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='product-unit-price'
                        className='text-sm font-semibold flex items-center gap-2'>
                        <Tag className='w-4 h-4 text-green-500' />
                        Unit Price *
                      </Label>
                      <Input
                        id='product-unit-price'
                        name='unitPrice'
                        type='number'
                        value={formData?.unitPrice}
                        onChange={handleChange}
                        placeholder='0.00'
                        className='h-11 border-2 focus:border-green-500 transition-colors'
                        min='0'
                        step='0.01'
                        required
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label
                        htmlFor='quantity'
                        className='text-sm font-semibold flex items-center gap-2'>
                        <Package className='w-4 h-4 text-emerald-500' />
                        Total Quantity
                      </Label>
                      <Input
                        id='quantity'
                        name='quantity'
                        type='number'
                        value={formData?.quantity}
                        onChange={handleChange}
                        placeholder='0'
                        className={`h-11 border-2 transition-colors ${
                          hasVariation
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed"
                            : "focus:border-emerald-500"
                        }`}
                        min='0'
                        disabled={hasVariation}
                      />
                      {hasVariation && (
                        <p className='text-xs text-amber-600 dark:text-amber-400 font-medium'>
                          ⚠️ Auto-calculated from variations
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Discounts Card */}
            <Card className='border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
              <CardHeader className='border-b border-slate-200 dark:border-slate-700'>
                <CardTitle className='text-xl flex items-center gap-2'>
                  <div className='p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg'>
                    <Tag className='w-5 h-5 text-white' />
                  </div>
                  Pricing & Discounts
                </CardTitle>
                <CardDescription>
                  Configure discount options and promotional pricing
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6 pt-6'>
                <div className='grid gap-6 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='discount-type'
                      className='text-sm font-semibold'>
                      Discount Type
                    </Label>
                    <Select
                      value={formData?.discountType}
                      onValueChange={(value) => {
                        updateFormData({
                          ...formData,
                          discountType: value,
                        });
                      }}>
                      <SelectTrigger
                        id='discount-type'
                        className='h-11 border-2'>
                        <SelectValue placeholder='Select discount type' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='%'>Percentage (%)</SelectItem>
                        <SelectItem value='-'>Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='discount' className='text-sm font-semibold'>
                      Discount Value
                    </Label>
                    <Input
                      id='discount'
                      name='discount'
                      type='number'
                      value={formData?.discount}
                      onChange={(e) =>
                        updateFormData({
                          ...formData,
                          discount: Number(e.target?.value),
                        })
                      }
                      placeholder='0'
                      className='h-11 border-2 focus:border-green-500 transition-colors'
                      min='0'
                      step={formData?.discountType === "%" ? "1" : "0.01"}
                    />
                    {formData?.discountType && (
                      <p className='text-xs text-slate-600 dark:text-slate-400'>
                        {formData?.discountType === "%"
                          ? "Enter percentage (0-100)"
                          : "Enter fixed amount to deduct"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variations Card */}
            <Card className='border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
              <CardHeader className='border-b border-slate-200 dark:border-slate-700'>
                <CardTitle className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                  <div className='flex items-center gap-2'>
                    <div className='p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg'>
                      <Box className='w-5 h-5 text-white' />
                    </div>
                    <span>Product Variations</span>
                  </div>
                  {hasVariation && (
                    <Badge
                      variant='secondary'
                      className='w-fit bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 border-0'>
                      {formData.variation.length} variation
                      {formData.variation.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Configure product variations with different sizes, colors, and
                  pricing options.
                </CardDescription>
              </CardHeader>

              <CardContent className='space-y-6 pt-6'>
                {/* Variation Toggle */}
                <div className='space-y-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border-2 border-slate-200 dark:border-slate-600'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                    <div className='flex items-center gap-4'>
                      <Label
                        htmlFor='variation-toggle'
                        className='text-base font-medium'>
                        Enable Variations
                      </Label>
                      <div className='flex items-center gap-2'>
                        <span
                          className={`text-sm ${
                            !hasVariation
                              ? "font-semibold text-foreground"
                              : "text-muted-foreground"
                          }`}
                          aria-hidden='true'>
                          No
                        </span>
                        <Switch
                          id='variation-toggle'
                          checked={hasVariation}
                          onCheckedChange={(value) => {
                            setHasVariation(value);
                            if (!value) {
                              updateFormData({ ...formData, variation: [] });
                              setV2Colors([]);
                              setV2Sizes([]);
                            }
                          }}
                          aria-describedby='variation-help'
                        />
                        <span
                          className={`text-sm ${
                            hasVariation
                              ? "font-semibold text-foreground"
                              : "text-muted-foreground"
                          }`}
                          aria-hidden='true'>
                          Yes
                        </span>
                      </div>
                    </div>

                    {hasVariation && (
                      <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                        <Label
                          htmlFor='same-price-toggle'
                          className='text-sm font-medium'>
                          Same Unit Price for All
                        </Label>
                        <div className='flex items-center gap-2'>
                          <span
                            className={`text-sm ${
                              !isSameUnitPrice
                                ? "font-semibold text-foreground"
                                : "text-muted-foreground"
                            }`}
                            aria-hidden='true'>
                            No
                          </span>
                          <Switch
                            id='same-price-toggle'
                            checked={isSameUnitPrice}
                            onCheckedChange={handleSameUnitPrice}
                            aria-describedby='same-price-help'
                          />
                          <span
                            className={`text-sm ${
                              isSameUnitPrice
                                ? "font-semibold text-foreground"
                                : "text-muted-foreground"
                            }`}
                            aria-hidden='true'>
                            Yes
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className='space-y-1 text-xs text-slate-700 dark:text-slate-300'>
                    <p id='variation-help'>
                      Enable variations to create different versions of your
                      product with unique combinations of attributes.
                    </p>
                    {hasVariation && (
                      <p id='same-price-help'>
                        When enabled, all variations will inherit the main
                        product's unit price.
                      </p>
                    )}
                  </div>
                </div>

                {hasVariation && (
                  <Tabs
                    value={variationTab}
                    onValueChange={setVariationTab}
                    className='w-full'>
                    <TabsList className='grid w-full grid-cols-2'>
                      <TabsTrigger
                        value='v1'
                        className='flex items-center gap-2'>
                        <span>Advanced</span>
                        <Badge variant='outline' className='text-xs'>
                          V1
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger
                        value='v2'
                        className='flex items-center gap-2'>
                        <span>Simple</span>
                        <Badge variant='outline' className='text-xs'>
                          V2
                        </Badge>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value='v1' className='mt-6'>
                      <div className='space-y-4'>
                        <div className='text-sm text-slate-700 dark:text-slate-300 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border'>
                          <strong>Advanced Mode:</strong> Manually configure
                          each variation with full control over all properties.
                        </div>
                        {renderV1VariationView()}
                      </div>
                    </TabsContent>

                    <TabsContent value='v2' className='mt-6'>
                      <div className='space-y-4'>
                        <div className='text-sm text-slate-700 dark:text-slate-300 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border'>
                          <strong>Simple Mode:</strong> Quick setup for size and
                          color combinations. Variations are auto-generated.
                        </div>
                        {renderV2VariationView()}
                      </div>
                    </TabsContent>
                  </Tabs>
                )}

                {!hasVariation && (
                  <div className='text-center py-12 text-slate-600 dark:text-slate-400'>
                    <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 mb-4'>
                      <Box className='w-8 h-8 text-slate-400' />
                    </div>
                    <p className='mb-2 font-medium'>No variations configured</p>
                    <p className='text-sm'>
                      Enable variations above to add different sizes, colors, or
                      other variants.
                    </p>
                  </div>
                )}
              </CardContent>

              {hasVariation && variationTab === "v1" && (
                <CardFooter className='border-t bg-slate-50 dark:bg-slate-800/50'>
                  <Button
                    onClick={addNewVariation}
                    variant='outline'
                    className='w-full hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950'>
                    <PlusCircle className='h-4 w-4 mr-2' />
                    Add New Variation
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>

          {/* Right Column - Status & Images */}
          <div className='space-y-6'>
            {/* Product Status Card */}
            <Card className='border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
              <CardHeader className='border-b border-slate-200 dark:border-slate-700'>
                <CardTitle className='text-lg'>Product Status</CardTitle>
                <CardDescription>
                  Set the product visibility and availability
                </CardDescription>
              </CardHeader>
              <CardContent className='pt-6'>
                <div className='space-y-3'>
                  <Label className='text-sm font-semibold'>Status</Label>
                  <Select
                    value={formData?.active ? "active" : "inactive"}
                    onValueChange={(value) => {
                      updateFormData({
                        ...formData,
                        active: value === "active",
                      });
                    }}>
                    <SelectTrigger id='status' className='h-11 border-2'>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='active'>
                        <div className='flex items-center gap-2'>
                          <div className='w-2 h-2 rounded-full bg-green-500'></div>
                          <span className='font-medium'>Active</span>
                        </div>
                      </SelectItem>
                      <SelectItem value='inactive'>
                        <div className='flex items-center gap-2'>
                          <div className='w-2 h-2 rounded-full bg-red-500'></div>
                          <span className='font-medium'>Inactive</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className='text-xs text-slate-600 dark:text-slate-400'>
                    {formData?.active
                      ? "✓ Product will be visible to customers"
                      : "✗ Product will be hidden from customers"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Product Images Card */}
            <Card className='border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden'>
              <CardHeader className='border-b border-slate-200 dark:border-slate-700'>
                <div className='flex justify-between items-center'>
                  <div>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <Upload className='w-5 h-5 text-blue-500' />
                      Product Images
                    </CardTitle>
                    <CardDescription className='mt-1'>
                      Main thumbnail and up to 6 additional images
                    </CardDescription>
                  </div>
                  <Input
                    id='picture-thumbnail'
                    type='file'
                    className='hidden'
                    ref={fileRef}
                    name='thumbnail'
                    accept='.png, .jpg, .jpeg'
                    onChange={(e) => {
                      //@ts-ignore
                      const file = e.target.files[0];
                      updateFormData({
                        ...formData,
                        thumbnail: file,
                      });
                    }}
                  />
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      if (!!fileRef) {
                        //@ts-ignore
                        fileRef.current.click();
                      }
                    }}
                    className='hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950'>
                    <Upload className='h-4 w-4 mr-2' />
                    Upload
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='pt-6'>
                <div className='space-y-4'>
                  {/* Main Thumbnail */}
                  <div className='relative group'>
                    <div className='absolute -top-2 -left-2 z-10 px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold rounded-md shadow-lg'>
                      Main Thumbnail
                    </div>
                    <img
                      alt='Product_thumbnail'
                      className='aspect-square w-full rounded-xl object-cover shadow-lg border-2 border-blue-200 dark:border-blue-800'
                      src={
                        !!formData?.thumbnail
                          ? URL.createObjectURL(formData.thumbnail)
                          : PlaceHolderImage
                      }
                    />
                    {!formData?.thumbnail && (
                      <div className='absolute inset-0 flex flex-col items-center justify-center text-slate-400'>
                        <Upload className='h-8 w-8 mb-2' />
                        <p className='text-sm text-center px-2'>
                          Click "Upload" to add thumbnail
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Additional Images */}
                  <div className='space-y-2'>
                    <Label className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
                      Additional Images ({formData?.images?.length || 0}/6)
                    </Label>
                    <div className='grid grid-cols-3 gap-2 sm:gap-3'>
                      {formData?.images?.map((imgData, index) => (
                        <div
                          key={index}
                          className='group relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all'>
                          <img
                            alt={`Product_image_${index + 1}`}
                            className='w-full h-full object-cover'
                            src={URL.createObjectURL(imgData)}
                          />

                          {/* Remove button - appears on hover */}
                          <button
                            onClick={() => {
                              const newImages = formData.images.filter(
                                (_, i) => i !== index
                              );
                              updateFormData({
                                ...formData,
                                images: newImages,
                              });
                            }}
                            className='absolute top-1 right-1 sm:top-2 sm:right-2 p-1 sm:p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110 z-10'>
                            <X className='w-3 h-3 sm:w-4 sm:h-4' />
                          </button>

                          {/* Image number badge */}
                          <div className='absolute bottom-1 left-1 sm:bottom-2 sm:left-2 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-black/60 text-white text-[10px] sm:text-xs font-medium rounded backdrop-blur-sm'>
                            {index + 1}
                          </div>
                        </div>
                      ))}

                      <Input
                        id='picture-additional'
                        type='file'
                        className='hidden'
                        ref={fileRef2}
                        name='images'
                        accept='.png, .jpg, .jpeg'
                        onChange={(e) => {
                          //@ts-ignore
                          const file = e.target.files?.[0];
                          if (file) {
                            updateFormData({
                              ...formData,
                              images: [...formData?.images, file],
                            });
                          }
                        }}
                      />

                      {/* Upload button - show if less than 6 images */}
                      {(!formData?.images || formData?.images?.length < 6) && (
                        <button
                          className='flex aspect-square w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all group'
                          onClick={() => {
                            if (!!fileRef2) {
                              //@ts-ignore
                              fileRef2.current.click();
                            }
                          }}>
                          <div className='flex flex-col items-center gap-1 sm:gap-2'>
                            <Upload className='h-5 w-5 sm:h-6 sm:w-6 text-slate-400 group-hover:text-blue-500 transition-colors' />
                            <span className='text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium'>
                              Add
                            </span>
                          </div>
                        </button>
                      )}
                    </div>

                    {formData?.images && formData.images.length >= 6 && (
                      <p className='text-xs text-amber-600 dark:text-amber-400 font-medium'>
                        ⚠️ Maximum 6 additional images reached
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className='flex flex-col gap-3 mt-6 sm:mt-8 lg:hidden'>
          <Button
            variant='outline'
            onClick={() => {
              if (dialogBtn?.current) {
                //@ts-ignore
                dialogBtn.current.click();
              }
            }}
            className='w-full hover:bg-red-50 hover:text-red-600 hover:border-red-300'>
            <XCircle className='w-4 h-4 mr-2' />
            Discard Changes
          </Button>
          <div className='grid grid-cols-2 gap-3'>
            <Button
              onClick={() => createProductAndExit()}
              className='w-full bg-gradient-to-r from-green-600 to-emerald-600'>
              <Save className='w-4 h-4 mr-2' />
              Save
            </Button>
            <Button
              onClick={() => createProductAndContinue()}
              variant='secondary'
              className='w-full'>
              <Save className='w-4 h-4 mr-2' />
              Save & Continue
            </Button>
          </div>
        </div>
      </div>
      {discardDialog()}
    </div>
  );
};

export default AddProduct;
