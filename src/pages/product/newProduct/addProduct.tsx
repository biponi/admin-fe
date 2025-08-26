import { PlusCircle, Trash, Upload, X, Plus } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
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
        <div className='rounded-lg border'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted/50'>
                <TableHead className='font-semibold'>SKU</TableHead>
                <TableHead className='font-semibold'>Stock</TableHead>
                <TableHead className='font-semibold'>Price</TableHead>
                <TableHead className='font-semibold'>Color</TableHead>
                <TableHead className='font-semibold'>Size</TableHead>
                <TableHead className='font-semibold w-[100px]'>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!!formData.variation &&
                formData.variation.map(
                  (variation: IVariation, index: number) => (
                    <TableRow key={variation.id} className='hover:bg-muted/30'>
                      <TableCell className='font-mono text-sm'>
                        {variation?.sku}
                      </TableCell>
                      <TableCell>
                        <Input
                          name='quantity'
                          onChange={(e) => updateVariationData(index, e)}
                          type='number'
                          value={variation.quantity}
                          min='0'
                          className='w-20'
                          placeholder='0'
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          disabled={isSameUnitPrice}
                          className={`w-24 ${
                            isSameUnitPrice ? "bg-muted" : "bg-background"
                          }`}
                          name='unitPrice'
                          onChange={(e) => updateVariationData(index, e)}
                          type='number'
                          value={variation.unitPrice}
                          min='0'
                          step='0.01'
                          placeholder='0.00'
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          name='color'
                          onChange={(e) => updateVariationData(index, e)}
                          type='text'
                          value={variation.color}
                          className='w-24'
                          placeholder='Color'
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          name='size'
                          onChange={(e) => updateVariationData(index, e)}
                          type='text'
                          value={variation.size}
                          className='w-24'
                          placeholder='Size'
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() => {
                            updateFormData((prev) => {
                              return {
                                ...prev,
                                variation: prev?.variation.filter(
                                  (__, i) => i !== index
                                ),
                                quantity: prev?.quantity - variation?.quantity,
                              };
                            });
                          }}>
                          <Trash className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )}
              {(!formData.variation || formData.variation.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className='text-center text-muted-foreground py-8'>
                    No variations added yet. Click "Add Variant" to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const renderV2VariationView = () => {
    return (
      <div className='space-y-6'>
        <div className='grid gap-6 sm:grid-cols-2'>
          {/* Colors Section */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label className='text-base font-semibold'>Colors</Label>
              <span className='text-sm text-muted-foreground'>
                {v2Colors.length} color{v2Colors.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className='flex gap-2'>
              <Input
                placeholder='Add color (e.g., Red, Blue)'
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addColor();
                  }
                }}
                className='flex-1'
              />
              <Button
                onClick={addColor}
                size='sm'
                disabled={
                  !newColor.trim() || v2Colors.includes(newColor.trim())
                }>
                <Plus className='h-4 w-4' />
              </Button>
            </div>

            <div className='flex flex-wrap gap-2 min-h-[80px] p-3 border rounded-lg bg-muted/30'>
              {v2Colors.length > 0 ? (
                v2Colors.map((color) => (
                  <Badge
                    key={color}
                    variant='secondary'
                    className='flex items-center gap-1 px-3 py-1'>
                    {color}
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => removeColor(color)}
                      className='h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground'>
                      <X className='h-3 w-3' />
                    </Button>
                  </Badge>
                ))
              ) : (
                <p className='text-sm text-muted-foreground flex items-center justify-center w-full h-12'>
                  No colors added yet
                </p>
              )}
            </div>
          </div>

          {/* Sizes Section */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label className='text-base font-semibold'>Sizes</Label>
              <span className='text-sm text-muted-foreground'>
                {v2Sizes.length} size{v2Sizes.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className='flex gap-2'>
              <Input
                placeholder='Add size (e.g., S, M, L)'
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSize();
                  }
                }}
                className='flex-1'
              />
              <Button
                onClick={addSize}
                size='sm'
                disabled={!newSize.trim() || v2Sizes.includes(newSize.trim())}>
                <Plus className='h-4 w-4' />
              </Button>
            </div>

            <div className='flex flex-wrap gap-2 min-h-[80px] p-3 border rounded-lg bg-muted/30'>
              {v2Sizes.length > 0 ? (
                v2Sizes.map((size) => (
                  <Badge
                    key={size}
                    variant='secondary'
                    className='flex items-center gap-1 px-3 py-1'>
                    {size}
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => removeSize(size)}
                      className='h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground'>
                      <X className='h-3 w-3' />
                    </Button>
                  </Badge>
                ))
              ) : (
                <p className='text-sm text-muted-foreground flex items-center justify-center w-full h-12'>
                  No sizes added yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Generated Variations Preview */}
        {formData.variation.length > 0 && (
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label className='text-base font-semibold'>
                Generated Variations
              </Label>
              <span className='text-sm text-muted-foreground'>
                {formData.variation.length} variation
                {formData.variation.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {formData.variation.map(
                (variation: IVariation, index: number) => (
                  <Card key={variation.id} className='p-4'>
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h4 className='font-medium'>{variation.name}</h4>
                        <Badge variant='outline' className='text-xs'>
                          {variation.sku}
                        </Badge>
                      </div>

                      <div className='grid grid-cols-2 gap-2'>
                        <div>
                          <Label
                            htmlFor={`qty-${variation.id}`}
                            className='text-xs'>
                            Stock
                          </Label>
                          <Input
                            id={`qty-${variation.id}`}
                            name='quantity'
                            onChange={(e) => updateVariationData(index, e)}
                            type='number'
                            value={variation.quantity}
                            min='0'
                            className='h-8'
                            placeholder='0'
                          />
                        </div>

                        {!isSameUnitPrice && (
                          <div>
                            <Label
                              htmlFor={`price-${variation.id}`}
                              className='text-xs'>
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
                              className='h-8'
                              placeholder='0.00'
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
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
    <div className='w-full min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header Section */}
        <div className='mb-8'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight text-foreground'>
                Add New Product
              </h1>
              <p className='text-muted-foreground mt-2'>
                Create a new product with detailed information and variations
              </p>
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
                className='min-w-[100px]'>
                Discard
              </Button>
              <Button
                onClick={() => createProductAndExit()}
                className='min-w-[120px]'>
                Save Product
              </Button>
              <Button
                onClick={() => createProductAndContinue()}
                variant='secondary'
                className='min-w-[160px] hidden sm:inline-flex'>
                Save & Continue
              </Button>
            </div>
          </div>
        </div>

        <div className='grid gap-8 lg:grid-cols-[2fr_1fr]'>
          <div className='space-y-8'>
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Basic Information</CardTitle>
                <CardDescription>
                  Provide the essential details about your product
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-2'>
                  <Label htmlFor='name' className='text-sm font-medium'>
                    Product Name *
                  </Label>
                  <Input
                    id='name'
                    name='name'
                    type='text'
                    value={formData?.name}
                    onChange={handleChange}
                    placeholder='Enter product name'
                    className='h-11'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description' className='text-sm font-medium'>
                    Description
                  </Label>
                  <Textarea
                    id='description'
                    name='description'
                    value={formData?.description}
                    onChange={handleChange}
                    placeholder='Describe your product features, benefits, and specifications'
                    className='min-h-[120px] resize-none'
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Product Details</CardTitle>
                <CardDescription>
                  Set category, SKU, pricing, and inventory information
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
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
                        className='text-sm font-medium'>
                        Product SKU *
                      </Label>
                      <Input
                        id='product-sku'
                        name='sku'
                        type='text'
                        value={formData?.sku}
                        onChange={handleChange}
                        placeholder='Enter unique SKU'
                        className='h-11 font-mono'
                        required
                      />
                      <p className='text-xs text-muted-foreground'>
                        Stock Keeping Unit - unique identifier
                      </p>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='product-unit-price'
                        className='text-sm font-medium'>
                        Unit Price *
                      </Label>
                      <Input
                        id='product-unit-price'
                        name='unitPrice'
                        type='number'
                        value={formData?.unitPrice}
                        onChange={handleChange}
                        placeholder='0.00'
                        className='h-11'
                        min='0'
                        step='0.01'
                        required
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='quantity' className='text-sm font-medium'>
                        Total Quantity
                      </Label>
                      <Input
                        id='quantity'
                        name='quantity'
                        type='number'
                        value={formData?.quantity}
                        onChange={handleChange}
                        placeholder='0'
                        className={`h-11 ${
                          hasVariation
                            ? "bg-muted text-muted-foreground"
                            : "bg-background"
                        }`}
                        min='0'
                        disabled={hasVariation}
                      />
                      {hasVariation && (
                        <p className='text-xs text-muted-foreground'>
                          Auto-calculated from variations
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Pricing & Discounts</CardTitle>
                <CardDescription>
                  Configure discount options and promotional pricing
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid gap-6 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='discount-type'
                      className='text-sm font-medium'>
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
                      <SelectTrigger id='discount-type' className='h-11'>
                        <SelectValue placeholder='Select discount type' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='%'>
                          <div className='flex items-center gap-2'>
                            <span>Percentage (%)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value='-'>
                          <div className='flex items-center gap-2'>
                            <span>Fixed Amount</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='discount' className='text-sm font-medium'>
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
                      className='h-11'
                      min='0'
                      step={formData?.discountType === "%" ? "1" : "0.01"}
                    />
                    {formData?.discountType && (
                      <p className='text-xs text-muted-foreground'>
                        {formData?.discountType === "%"
                          ? "Enter percentage (0-100)"
                          : "Enter fixed amount to deduct"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                  <span>Product Variations</span>
                  {hasVariation && (
                    <Badge variant='secondary' className='w-fit'>
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

              <CardContent className='space-y-6'>
                {/* Variation Toggle */}
                <div className='space-y-4 p-4 bg-muted/30 rounded-lg'>
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

                  <div className='space-y-1 text-xs text-muted-foreground'>
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
                        <div className='text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border'>
                          <strong>Advanced Mode:</strong> Manually configure
                          each variation with full control over all properties.
                        </div>
                        {renderV1VariationView()}
                      </div>
                    </TabsContent>

                    <TabsContent value='v2' className='mt-6'>
                      <div className='space-y-4'>
                        <div className='text-sm text-muted-foreground bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border'>
                          <strong>Simple Mode:</strong> Quick setup for size and
                          color combinations. Variations are auto-generated.
                        </div>
                        {renderV2VariationView()}
                      </div>
                    </TabsContent>
                  </Tabs>
                )}

                {!hasVariation && (
                  <div className='text-center py-8 text-muted-foreground'>
                    <p className='mb-2'>No variations configured</p>
                    <p className='text-sm'>
                      Enable variations above to add different sizes, colors, or
                      other variants.
                    </p>
                  </div>
                )}
              </CardContent>

              {hasVariation && variationTab === "v1" && (
                <CardFooter className='border-t bg-muted/20'>
                  <Button
                    onClick={addNewVariation}
                    variant='outline'
                    className='w-full'>
                    <PlusCircle className='h-4 w-4 mr-2' />
                    Add New Variation
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
          <div className='space-y-8'>
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Product Status</CardTitle>
                <CardDescription>
                  Set the product visibility and availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <Label htmlFor='status' className='text-sm font-medium'>
                    Publication Status
                  </Label>
                  <Select
                    value={formData?.active ? "active" : "inactive"}
                    onValueChange={(value) => {
                      updateFormData({
                        ...formData,
                        active: value === "active",
                      });
                    }}>
                    <SelectTrigger id='status' className='h-11'>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='active'>
                        <div className='flex items-center gap-2'>
                          <div className='h-2 w-2 rounded-full bg-green-500'></div>
                          <span>Active</span>
                        </div>
                      </SelectItem>
                      <SelectItem value='inactive'>
                        <div className='flex items-center gap-2'>
                          <div className='h-2 w-2 rounded-full bg-red-500'></div>
                          <span>Inactive</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className='text-xs text-muted-foreground'>
                    {formData?.active
                      ? "Product will be visible to customers"
                      : "Product will be hidden from customers"}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className='overflow-hidden'>
              <CardHeader>
                <CardTitle className='text-xl flex items-center justify-between'>
                  <span>Product Images</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          if (fileRef?.current) {
                            //@ts-ignore
                            fileRef.current.click();
                          }
                        }}>
                        <Upload className='h-4 w-4 mr-2' />
                        Upload
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side='bottom'>
                      Upload main product image
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <CardDescription>
                  Upload high-quality images that showcase your product
                </CardDescription>
              </CardHeader>

              <CardContent className='space-y-6'>
                {/* Hidden file inputs */}
                <Input
                  id='main-picture'
                  type='file'
                  className='hidden'
                  ref={fileRef}
                  name='thumbnail'
                  accept='.png,.jpg,.jpeg,.webp'
                  onChange={(e) => {
                    //@ts-ignore
                    const file = e.target.files?.[0];
                    if (file) {
                      updateFormData({
                        ...formData,
                        thumbnail: file,
                      });
                    }
                  }}
                />

                <Input
                  id='gallery-picture'
                  type='file'
                  className='hidden'
                  ref={fileRef2}
                  name='gallery'
                  accept='.png,.jpg,.jpeg,.webp'
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

                {/* Main Product Image */}
                <div className='space-y-2'>
                  <Label className='text-sm font-medium'>Main Image</Label>
                  <div className='relative group'>
                    <img
                      alt='Main product'
                      className='aspect-square w-full rounded-lg object-cover border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors'
                      src={
                        formData?.thumbnail
                          ? URL.createObjectURL(formData.thumbnail)
                          : PlaceHolderImage
                      }
                    />
                    {!formData?.thumbnail && (
                      <div className='absolute inset-0 flex flex-col items-center justify-center text-muted-foreground'>
                        <Upload className='h-8 w-8 mb-2' />
                        <p className='text-sm text-center px-2'>
                          Click "Upload" to add main image
                        </p>
                      </div>
                    )}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Recommended: 800x800px, under 2MB
                  </p>
                </div>

                {/* Gallery Images */}
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <Label className='text-sm font-medium'>
                      Gallery Images
                    </Label>
                    <span className='text-xs text-muted-foreground'>
                      {formData?.images.length}/7 images
                    </span>
                  </div>

                  <div className='grid grid-cols-3 gap-3'>
                    {formData?.images.map((imgData, index) => (
                      <div key={index} className='relative group'>
                        <img
                          alt={`Gallery ${index + 1}`}
                          className='aspect-square w-full rounded-lg object-cover border hover:opacity-75 transition-opacity'
                          src={URL.createObjectURL(imgData)}
                        />
                        <Button
                          variant='destructive'
                          size='sm'
                          className='absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
                          onClick={() => {
                            const newImages = formData.images.filter(
                              (_, i) => i !== index
                            );
                            updateFormData({
                              ...formData,
                              images: newImages,
                            });
                          }}>
                          <X className='h-3 w-3' />
                        </Button>
                      </div>
                    ))}

                    {formData?.images.length < 7 && (
                      <button
                        className='aspect-square w-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50 transition-colors text-muted-foreground'
                        onClick={() => {
                          if (fileRef2?.current) {
                            //@ts-ignore
                            fileRef2.current.click();
                          }
                        }}>
                        <Plus className='h-5 w-5 mb-1' />
                        <span className='text-xs text-center'>Add Image</span>
                      </button>
                    )}
                  </div>

                  {formData?.images.length < 7 && (
                    <p className='text-xs text-muted-foreground'>
                      Add up to 7 additional product images
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Mobile Actions */}
        <div className='flex flex-col gap-3 sm:hidden mt-8 p-4 bg-muted/30 rounded-lg'>
          <Button
            variant='outline'
            onClick={() => {
              if (dialogBtn?.current) {
                //@ts-ignore
                dialogBtn.current.click();
              }
            }}
            className='w-full'>
            Discard Changes
          </Button>
          <div className='grid grid-cols-2 gap-3'>
            <Button onClick={() => createProductAndExit()} className='w-full'>
              Save Product
            </Button>
            <Button
              onClick={() => createProductAndContinue()}
              variant='secondary'
              className='w-full'>
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
