import {
  Package,
  Tag,
  Palette,
  Ruler,
  Hash,
  Box,
  ShoppingBag,
  BarChart3,
  Upload,
  Save,
  X as XIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
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
import { useEffect, useState, useRef } from "react";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import PlaceHolderImage from "../../../assets/placeholder.svg";
import CustomAlertDialog from "../../../coreComponents/OptionModal";

import { ICategory, IProductUpdateData, IVariation } from "../interface";
import NestedCategorySelect from "../../../components/customComponent/NestedCategoryComponent";

interface Props {
  productData: IProductUpdateData;
  updateProduct: (productData: IProductUpdateData) => Promise<boolean>;
  categories: ICategory[];
}

const EditProduct: React.FC<Props> = ({
  productData,
  updateProduct,
  categories,
}) => {
  const [formData, updateFormData] = useState<IProductUpdateData>(productData);
  const fileRef = useRef(null);
  const fileRef2 = useRef(null);
  const dialogBtn = useRef(null);
  const updateDialogBtn = useRef(null);

  useEffect(() => {
    if (!!productData) {
      updateFormData(productData);
    }
  }, [productData]);

  // Calculate total quantity from all variations
  const totalQuantity =
    formData?.variation?.reduce((sum, variant) => sum + (variant.quantity || 0), 0) ||
    formData?.quantity ||
    0;

  // Get unique colors and sizes
  const uniqueColors = formData?.variation
    ? Array.from(new Set(formData.variation.map((v) => v.color).filter(Boolean)))
    : [];
  const uniqueSizes = formData?.variation
    ? Array.from(new Set(formData.variation.map((v) => v.size).filter(Boolean)))
    : [];

  // Handle form field changes
  //@ts-ignore
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate numeric input for unit price field
    if (name === "unitPrice" && !/^\d*\.?\d*$/.test(value)) {
      return; // Exit if input is not a valid number format
    }

    // Update form data with parsed numeric value if applicable
    updateFormData({
      ...formData,
      [name]: name === "unitPrice" ? parseFloat(value) : value,
    });
  };

  const discardDialog = () => {
    return (
      <CustomAlertDialog
        title='Are You Sure?'
        description='This will discard all the changes'
        onSubmit={() => {
          updateFormData(productData);
        }}>
        <Button className='hidden' ref={dialogBtn}>
          show dialog
        </Button>
      </CustomAlertDialog>
    );
  };

  const updateDiscardDialog = () => {
    return (
      <CustomAlertDialog
        title='Are You Sure?'
        description='You want to save the changes?'
        onSubmit={() => {
          updateProductAndExit();
        }}>
        <Button className='hidden' ref={updateDialogBtn}>
          show dialog
        </Button>
      </CustomAlertDialog>
    );
  };

  const updateProductAndExit = async () => {
    const response = await updateProduct({ ...formData });
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
                <div className='hidden sm:flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30'>
                  <ShoppingBag className='w-6 h-6 lg:w-7 lg:h-7 text-white' />
                </div>
                <div className='flex-1'>
                  <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent'>
                    Edit Product
                  </h1>
                  <p className='text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 sm:mt-2'>
                    Update product information and settings
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
                  <XIcon className='w-4 h-4 mr-2' />
                  Discard
                </Button>
                <Button
                  onClick={() => {
                    if (updateDialogBtn?.current) {
                      //@ts-ignore
                      updateDialogBtn.current.click();
                    }
                  }}
                  className='min-w-[140px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'>
                  <Save className='w-4 h-4 mr-2' />
                  Update Product
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8'>
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
              <p className='text-xs sm:text-sm font-medium opacity-90 mb-1'>Total Stock</p>
              <p className='text-2xl sm:text-3xl lg:text-4xl font-bold'>{totalQuantity}</p>
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
              <p className='text-xs sm:text-sm font-medium opacity-90 mb-1'>Total Variants</p>
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
              <p className='text-xs sm:text-sm font-medium opacity-90 mb-1'>Unique Colors</p>
              <p className='text-2xl sm:text-3xl lg:text-4xl font-bold'>{uniqueColors.length}</p>
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
              <p className='text-xs sm:text-sm font-medium opacity-90 mb-1'>Unique Sizes</p>
              <p className='text-2xl sm:text-3xl lg:text-4xl font-bold'>{uniqueSizes.length}</p>
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
                  Update the essential details about your product
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6 pt-6'>
                <div className='space-y-2'>
                  <Label htmlFor='name' className='text-sm font-semibold flex items-center gap-2'>
                    <Tag className='w-4 h-4 text-blue-500' />
                    Product Name *
                  </Label>
                  <Input
                    id='name'
                    name='name'
                    type='text'
                    value={formData?.name || ""}
                    onChange={handleChange}
                    placeholder='Enter product name'
                    className='h-11 border-2 focus:border-blue-500 transition-colors'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description' className='text-sm font-semibold'>
                    Description
                  </Label>
                  <Textarea
                    id='description'
                    name='description'
                    value={formData?.description || ""}
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
                  Update category, SKU, pricing, and inventory information
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
                        value={formData?.sku || ""}
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
                        type='text'
                        value={formData?.unitPrice || ""}
                        onChange={handleChange}
                        placeholder='0.00'
                        className='h-11 border-2 focus:border-green-500 transition-colors'
                        required
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='quantity' className='text-sm font-semibold flex items-center gap-2'>
                        <Package className='w-4 h-4 text-emerald-500' />
                        Total Quantity
                      </Label>
                      <Input
                        id='quantity'
                        name='quantity'
                        type='number'
                        value={formData?.quantity || 0}
                        onChange={handleChange}
                        placeholder='0'
                        className={`h-11 border-2 transition-colors ${
                          formData?.variation && formData.variation.length > 0
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed"
                            : "focus:border-emerald-500"
                        }`}
                        min='0'
                        disabled={formData?.variation && formData.variation.length > 0}
                      />
                      {formData?.variation && formData.variation.length > 0 && (
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
                    <Label htmlFor='discount-type' className='text-sm font-semibold'>
                      Discount Type
                    </Label>
                    <Select
                      value={formData?.discountType || ""}
                      onValueChange={(value) => {
                        updateFormData({
                          ...formData,
                          discountType: value,
                        });
                      }}>
                      <SelectTrigger id='discount-type' className='h-11 border-2'>
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
                      value={formData?.discount || 0}
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
          </div>

          {/* Right Column - Status & Images */}
          <div className='space-y-6'>
            {/* Product Status Card */}
            <Card className='border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
              <CardHeader className='border-b border-slate-200 dark:border-slate-700'>
                <CardTitle className='text-lg'>Product Status</CardTitle>
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
                    Change Thumbnail
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
                          ? typeof formData?.thumbnail === "string"
                            ? formData?.thumbnail
                            : URL.createObjectURL(formData?.thumbnail)
                          : PlaceHolderImage
                      }
                    />
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
                            src={
                              !!imgData
                                ? typeof imgData === "string"
                                  ? imgData
                                  : URL.createObjectURL(imgData)
                                : PlaceHolderImage
                            }
                          />

                          {/* Remove button - appears on hover */}
                          <button
                            onClick={() => {
                              const images = formData.images.filter((_, i) => i !== index);
                              if (typeof imgData === "string") {
                                updateFormData({
                                  ...formData,
                                  images: [...images],
                                  removeImageIndexes: [
                                    ...(formData?.removeImageIndexes ?? []),
                                    imgData,
                                  ],
                                });
                              } else {
                                updateFormData({
                                  ...formData,
                                  images: [...images],
                                });
                              }
                            }}
                            className='absolute top-1 right-1 sm:top-2 sm:right-2 p-1 sm:p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110 z-10'>
                            <XIcon className='w-3 h-3 sm:w-4 sm:h-4' />
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
                        multiple
                        onChange={(e) => {
                          //@ts-ignore
                          const files = Array.from(e.target.files);
                          if (!formData?.images) formData.images = [];

                          const remainingSlots = 6 - formData.images.length;
                          const filesToAdd = files.slice(0, remainingSlots);

                          updateFormData({
                            ...formData,
                            //@ts-ignore
                            images: [...formData.images, ...filesToAdd],
                          });

                          // Reset file input
                          e.target.value = '';
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

        {/* Variations Section - Read Only */}
        <div className='mt-6 sm:mt-8'>
          {formData?.variation && formData.variation.length > 0 ? (
            <Card className='border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
              <CardHeader className='border-b border-slate-200 dark:border-slate-700 pb-4 sm:pb-6'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 sm:p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg shadow-indigo-500/30'>
                      <Package className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
                    </div>
                    <div>
                      <CardTitle className='text-lg sm:text-xl lg:text-2xl'>
                        Product Variations
                      </CardTitle>
                      <CardDescription className='text-xs sm:text-sm mt-1'>
                        All available variants with stock information (Read Only)
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant='secondary'
                    className='w-fit px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 border-0'>
                    {formData.variation.length} Variant{formData.variation.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className='p-3 sm:p-6 lg:p-8'>
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6'>
                  {formData.variation.map((variation: IVariation, index: number) => {
                    const stockLevel =
                      variation.quantity === 0
                        ? "out"
                        : variation.quantity < 10
                        ? "low"
                        : "good";

                    const stockColors = {
                      out: "from-red-500 to-rose-600",
                      low: "from-amber-500 to-orange-600",
                      good: "from-emerald-500 to-teal-600",
                    };

                    const stockBgColors = {
                      out: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900",
                      low: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900",
                      good: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900",
                    };

                    return (
                      <Card
                        key={variation.id || index}
                        className={`group hover:shadow-2xl transition-all duration-300 border-2 ${stockBgColors[stockLevel]} overflow-hidden relative`}>
                        {/* Decorative gradient overlay */}
                        <div
                          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stockColors[stockLevel]}`}
                        />

                        <CardContent className='p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4'>
                          {/* Variant Header */}
                          <div className='flex items-start justify-between gap-2'>
                            <div className='flex-1 min-w-0'>
                              <h3 className='font-semibold text-base sm:text-lg text-slate-900 dark:text-white truncate'>
                                {variation.name ||
                                  `${variation.color || "N/A"} - ${variation.size || "N/A"}`}
                              </h3>
                              {variation.title && variation.title !== variation.name && (
                                <p className='text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 truncate'>
                                  {variation.title}
                                </p>
                              )}
                            </div>
                            <div
                              className={`p-2 sm:p-2.5 rounded-lg bg-gradient-to-br ${stockColors[stockLevel]} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                              <Box className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
                            </div>
                          </div>

                          {/* Variant Details Grid */}
                          <div className='grid grid-cols-2 gap-2 sm:gap-3'>
                            {/* Color */}
                            {variation.color && (
                              <div className='bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-slate-200 dark:border-slate-700'>
                                <div className='flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5'>
                                  <Palette className='w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-500' />
                                  <p className='text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide'>
                                    Color
                                  </p>
                                </div>
                                <Badge
                                  variant='secondary'
                                  className='w-full justify-center text-xs sm:text-sm font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 py-1'>
                                  {variation.color}
                                </Badge>
                              </div>
                            )}

                            {/* Size */}
                            {variation.size && (
                              <div className='bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-slate-200 dark:border-slate-700'>
                                <div className='flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5'>
                                  <Ruler className='w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500' />
                                  <p className='text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide'>
                                    Size
                                  </p>
                                </div>
                                <Badge
                                  variant='secondary'
                                  className='w-full justify-center text-xs sm:text-sm font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-0 py-1'>
                                  {variation.size}
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* SKU */}
                          {variation.sku && (
                            <div className='bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-slate-200 dark:border-slate-600'>
                              <div className='flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5'>
                                <Hash className='w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500' />
                                <p className='text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide'>
                                  SKU
                                </p>
                              </div>
                              <p className='font-mono text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 truncate'>
                                {variation.sku}
                              </p>
                            </div>
                          )}

                          {/* Stock Quantity - Prominent Display */}
                          <div
                            className={`bg-gradient-to-br ${stockColors[stockLevel]} rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg border-2 border-white dark:border-slate-800`}>
                            <div className='flex items-center justify-between'>
                              <div>
                                <div className='flex items-center gap-1.5 sm:gap-2 mb-1'>
                                  <Package className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-white' />
                                  <p className='text-[10px] sm:text-xs font-medium text-white/90 uppercase tracking-wide'>
                                    In Stock
                                  </p>
                                </div>
                                <p className='text-2xl sm:text-3xl lg:text-4xl font-bold text-white'>
                                  {variation.quantity}
                                </p>
                              </div>
                              <div className='text-right'>
                                <Badge
                                  variant='secondary'
                                  className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold ${
                                    stockLevel === "out"
                                      ? "bg-white/90 text-red-700"
                                      : stockLevel === "low"
                                      ? "bg-white/90 text-amber-700"
                                      : "bg-white/90 text-emerald-700"
                                  }`}>
                                  {stockLevel === "out"
                                    ? "Out of Stock"
                                    : stockLevel === "low"
                                    ? "Low Stock"
                                    : "In Stock"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className='border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
              <CardContent className='p-8 sm:p-12 lg:p-16 text-center'>
                <div className='flex flex-col items-center gap-4 sm:gap-6'>
                  <div className='p-4 sm:p-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl sm:rounded-3xl shadow-lg'>
                    <Package className='w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-slate-400 dark:text-slate-500' />
                  </div>
                  <div className='space-y-2'>
                    <h3 className='text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 dark:text-white'>
                      No Variations Found
                    </h3>
                    <p className='text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md'>
                      This product doesn't have any variations configured yet.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Mobile Action Buttons */}
        <div className='flex items-center justify-center gap-3 mt-6 sm:mt-8 lg:hidden'>
          <Button
            variant='outline'
            onClick={() => {
              if (dialogBtn?.current) {
                //@ts-ignore
                dialogBtn.current.click();
              }
            }}
            className='hover:bg-red-50 hover:text-red-600 hover:border-red-300'>
            <XIcon className='w-4 h-4 mr-2' />
            Discard
          </Button>
          <Button
            onClick={() => {
              if (updateDialogBtn?.current) {
                //@ts-ignore
                updateDialogBtn.current.click();
              }
            }}
            className='bg-gradient-to-r from-blue-600 to-indigo-600'>
            <Save className='w-4 h-4 mr-2' />
            Save Product
          </Button>
        </div>
      </div>
      {discardDialog()}
      {updateDiscardDialog()}
    </div>
  );
};

export default EditProduct;
