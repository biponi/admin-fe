import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "../../../components/ui/badge";
import { IProductUpdateData } from "../interface";
import {
  Package,
  DollarSign,
  Tag,
  Box,
  Palette,
  Ruler,
  ChevronDownIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ProductInfoCardProps {
  product: IProductUpdateData;
}

const ProductInfoCard = ({ product }: ProductInfoCardProps) => {
  // Calculate total quantity from variations
  const totalQuantity =
    product?.variation?.reduce((sum, v) => sum + (v.quantity || 0), 0) ||
    product?.quantity ||
    0;

  // Get unique colors and sizes
  const uniqueColors = product?.variation
    ? Array.from(new Set(product.variation.map((v) => v.color).filter(Boolean)))
    : [];
  const uniqueSizes = product?.variation
    ? Array.from(new Set(product.variation.map((v) => v.size).filter(Boolean)))
    : [];

  return (
    <div className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden grid grid-cols-4'>
      <div className=' col-span-3 w-full h-full'>
        {/* Header */}
        <div className='p-6 border-b border-slate-100'>
          <div className='flex items-start justify-between gap-6'>
            <div className='flex-1 space-y-3'>
              <div className='flex items-center gap-3 flex-wrap'>
                <h3 className='text-2xl font-bold text-slate-900'>
                  {product.name}
                </h3>
                <Badge
                  variant={product.active ? "default" : "secondary"}
                  className={`px-3 py-1 font-semibold transition-all duration-300 ${
                    product.active
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}>
                  {product.active ? "● Active" : "○ Inactive"}
                </Badge>
              </div>
              <div className='flex items-center gap-2'>
                <p className='text-sm text-slate-500 font-mono'>
                  <span className='text-slate-400'>SKU:</span>{" "}
                  <span className='font-semibold text-slate-700'>
                    {product.sku}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='p-6 space-y-6'>
          {/* Stats Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {/* Unit Price */}
            <div className='bg-slate-50 rounded-lg p-4 border border-slate-100 hover:border-slate-200 transition-colors'>
              <div className='flex items-start justify-between'>
                <div className='space-y-1'>
                  <p className='text-xs text-slate-500 font-medium uppercase tracking-wide'>
                    Unit Price
                  </p>
                  <p className='text-2xl font-bold text-slate-900'>
                    ৳{product.unitPrice?.toLocaleString()}
                  </p>
                  <p className='text-xs text-slate-500'>per unit</p>
                </div>
                <div className='bg-emerald-100 p-2.5 rounded-lg'>
                  <DollarSign
                    className='h-5 w-5 text-emerald-600'
                    strokeWidth={2.5}
                  />
                </div>
              </div>
            </div>

            {/* Current Stock */}
            <div className='bg-slate-50 rounded-lg p-4 border border-slate-100 hover:border-slate-200 transition-colors'>
              <div className='flex items-start justify-between'>
                <div className='space-y-1'>
                  <p className='text-xs text-slate-500 font-medium uppercase tracking-wide'>
                    Total Stock
                  </p>
                  <p className='text-2xl font-bold text-slate-900'>
                    {totalQuantity.toLocaleString()}
                  </p>
                  <p className='text-xs text-slate-500'>units available</p>
                </div>
                <div className='bg-indigo-100 p-2.5 rounded-lg'>
                  <Package
                    className='h-5 w-5 text-indigo-600'
                    strokeWidth={2.5}
                  />
                </div>
              </div>
            </div>

            {/* Variations Count */}
            {product.variation && product.variation.length > 0 && (
              <div className='bg-slate-50 rounded-lg p-4 border border-slate-100 hover:border-slate-200 transition-colors'>
                <div className='flex items-start justify-between'>
                  <div className='space-y-1'>
                    <p className='text-xs text-slate-500 font-medium uppercase tracking-wide'>
                      Variations
                    </p>
                    <p className='text-2xl font-bold text-slate-900'>
                      {product.variation.length}
                    </p>
                    <p className='text-xs text-slate-500'>variants</p>
                  </div>
                  <div className='bg-purple-100 p-2.5 rounded-lg'>
                    <Tag
                      className='h-5 w-5 text-purple-600'
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Product ID */}
            <div className='bg-slate-50 rounded-lg p-4 border border-slate-100 hover:border-slate-200 transition-colors'>
              <div className='flex items-start justify-between'>
                <div className='space-y-1'>
                  <p className='text-xs text-slate-500 font-medium uppercase tracking-wide'>
                    Product ID
                  </p>
                  <p className='text-sm font-mono text-slate-700 font-semibold break-all'>
                    {product.id?.slice(0, 12)}...
                  </p>
                  <p className='text-xs text-slate-500'>identifier</p>
                </div>
                <div className='bg-amber-100 p-2.5 rounded-lg'>
                  <Box className='h-5 w-5 text-amber-600' strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {/* {product.description && (
          <div>
            <h3 className='text-sm font-semibold text-slate-900 mb-3'>
              Product Description
            </h3>
            <div className='bg-slate-50 rounded-lg p-4 border border-slate-100'>
              <p className='text-sm text-slate-700 leading-relaxed'>
                {product.description}
              </p>
            </div>
          </div>
        )} */}

          {/* Variations Display */}
          {product.variation && product.variation.length > 0 && (
            <Popover>
              <PopoverTrigger className='flex items-center justify-between mb-4'>
                <h3 className='text-sm font-semibold text-slate-900'>
                  Product Variations
                  <span className='ml-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded'>
                    {product.variation.length}
                  </span>
                </h3>
                <ChevronDownIcon className='ml-auto group-data-[state=open]:rotate-180' />
              </PopoverTrigger>
              <PopoverContent className='w-full max-w-2xl p-2 border-0 bg-gray-100'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4'>
                  {product.variation.map((variant, index) => (
                    <div
                      key={index}
                      className='bg-white rounded-lg border border-slate-100 hover:border-slate-200 transition-colors p-4'>
                      {/* Variant Header */}
                      <div className='flex items-center justify-between mb-3'>
                        <span className='text-xs font-medium text-slate-500 uppercase tracking-wide'>
                          Variant #{index + 1}
                        </span>
                        {variant.size && variant.color && (
                          <Badge
                            variant='outline'
                            className='text-xs font-medium bg-slate-50 text-slate-600 border-slate-200 px-2 py-0.5'>
                            {variant.color} • {variant.size}
                          </Badge>
                        )}
                      </div>

                      {/* Price & Stock Grid */}
                      <div className='grid grid-cols-2 gap-3'>
                        <div className='bg-slate-50 p-3 rounded-lg border border-slate-100'>
                          <p className='text-xs text-slate-500 font-medium mb-1'>
                            Price
                          </p>
                          <p className='text-base font-bold text-slate-900'>
                            ৳{variant.unitPrice?.toLocaleString()}
                          </p>
                        </div>
                        <div className='bg-slate-50 p-3 rounded-lg border border-slate-100'>
                          <p className='text-xs text-slate-500 font-medium mb-1'>
                            Stock
                          </p>
                          <p className='text-base font-bold text-slate-900'>
                            {variant.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Unique Colors and Sizes Summary */}
                {(uniqueColors.length > 0 || uniqueSizes.length > 0) && (
                  <div className='flex gap-3 flex-wrap p-4 bg-white rounded-lg border border-slate-100'>
                    {uniqueColors.length > 0 && (
                      <div className='flex items-center gap-2'>
                        <div className='bg-purple-100 p-1.5 rounded'>
                          <Palette
                            className='h-4 w-4 text-purple-600'
                            strokeWidth={2.5}
                          />
                        </div>
                        <span className='text-sm font-medium text-slate-700'>
                          Colors:{" "}
                          <span className='font-semibold text-slate-900'>
                            {uniqueColors.join(", ")}
                          </span>
                        </span>
                      </div>
                    )}
                    {uniqueSizes.length > 0 && (
                      <div className='flex items-center gap-2'>
                        <div className='bg-indigo-100 p-1.5 rounded'>
                          <Ruler
                            className='h-4 w-4 text-indigo-600'
                            strokeWidth={2.5}
                          />
                        </div>
                        <span className='text-sm font-medium text-slate-700'>
                          Sizes:{" "}
                          <span className='font-semibold text-slate-900'>
                            {uniqueSizes.join(", ")}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
      <div className='h-4 w-full bg-slate-200 rounded-full'>
        {product.thumbnail && typeof product.thumbnail === "string" && (
          <div className='flex-shrink-0'>
            <img
              src={product.thumbnail}
              alt={product.name}
              className='w-full h-full object-cover rounded-lg border-2 border-slate-200 shadow-sm'
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInfoCard;
