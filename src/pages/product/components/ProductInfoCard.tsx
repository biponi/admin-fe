import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { IProductUpdateData } from "../interface";
import {
  Package,
  DollarSign,
  Tag,
  Box,
  TrendingUp,
  Palette,
  Ruler,
} from "lucide-react";

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
    <div className='relative'>
      {/* Decorative background blur elements */}
      <div className='absolute -top-24 -right-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob'></div>
      <div className='absolute -bottom-24 -left-24 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000'></div>

      <Card className='relative overflow-hidden border-0 transition-all duration-500 bg-white/80 backdrop-blur-sm'>
        {/* Gradient accent line */}
        <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'></div>

        <CardHeader className='relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 pb-6'>
          <div className='flex items-start justify-between gap-6'>
            <div className='flex-1 space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center gap-3 flex-wrap'>
                  <CardTitle className='text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent'>
                    {product.name}
                  </CardTitle>
                  <Badge
                    variant={product.active ? "default" : "secondary"}
                    className={`px-3 py-1 font-semibold transition-all duration-300 ${
                      product.active
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-200"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}>
                    {product.active ? "● Active" : "○ Inactive"}
                  </Badge>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='h-px w-12 bg-gradient-to-r from-blue-500 to-transparent'></div>
                  <p className='text-sm text-gray-600 font-mono bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm'>
                    <span className='text-gray-400'>SKU:</span>{" "}
                    <span className='font-semibold text-gray-700'>
                      {product.sku}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {product.thumbnail && typeof product.thumbnail === "string" && (
              <div className='flex-shrink-0 group'>
                <div className='relative'>
                  <div className='absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300'></div>
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className='relative w-32 h-32 object-cover rounded-2xl border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300'
                  />
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className='p-8'>
          {/* Stats Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {/* Unit Price */}
            <div className='group relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6 rounded-2xl border border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100 hover:-translate-y-1'>
              <div className='absolute top-0 right-0 w-32 h-32 bg-emerald-200 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity'></div>
              <div className='relative flex items-start justify-between'>
                <div className='space-y-2'>
                  <p className='text-xs text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-2'>
                    <span className='w-8 h-0.5 bg-emerald-400'></span>
                    Unit Price
                  </p>
                  <p className='text-3xl font-black text-emerald-700'>
                    ৳{product.unitPrice?.toLocaleString()}
                  </p>
                  <p className='text-xs text-emerald-600/70 font-medium'>
                    per unit
                  </p>
                </div>
                <div className='bg-gradient-to-br from-emerald-400 to-green-500 p-3.5 rounded-xl shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform duration-300'>
                  <DollarSign
                    className='h-6 w-6 text-white'
                    strokeWidth={2.5}
                  />
                </div>
              </div>
            </div>

            {/* Current Stock */}
            <div className='group relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 p-6 rounded-2xl border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100 hover:-translate-y-1'>
              <div className='absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity'></div>
              <div className='relative flex items-start justify-between'>
                <div className='space-y-2'>
                  <p className='text-xs text-blue-600 font-bold uppercase tracking-wider flex items-center gap-2'>
                    <span className='w-8 h-0.5 bg-blue-400'></span>
                    Total Stock
                  </p>
                  <p className='text-3xl font-black text-blue-700'>
                    {totalQuantity.toLocaleString()}
                  </p>
                  <p className='text-xs text-blue-600/70 font-medium'>
                    units available
                  </p>
                </div>
                <div className='bg-gradient-to-br from-blue-400 to-indigo-500 p-3.5 rounded-xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300'>
                  <Package className='h-6 w-6 text-white' strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* Variations Count */}
            {product.variation && product.variation.length > 0 && (
              <div className='group relative overflow-hidden bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 p-6 rounded-2xl border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-lg hover:shadow-purple-100 hover:-translate-y-1'>
                <div className='absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity'></div>
                <div className='relative flex items-start justify-between'>
                  <div className='space-y-2'>
                    <p className='text-xs text-purple-600 font-bold uppercase tracking-wider flex items-center gap-2'>
                      <span className='w-8 h-0.5 bg-purple-400'></span>
                      Variations
                    </p>
                    <p className='text-3xl font-black text-purple-700'>
                      {product.variation.length}
                    </p>
                    <p className='text-xs text-purple-600/70 font-medium'>
                      variants
                    </p>
                  </div>
                  <div className='bg-gradient-to-br from-purple-400 to-fuchsia-500 p-3.5 rounded-xl shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform duration-300'>
                    <Tag className='h-6 w-6 text-white' strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            )}

            {/* Product ID */}
            <div className='group relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6 rounded-2xl border border-amber-100 hover:border-amber-300 transition-all duration-300 hover:shadow-lg hover:shadow-amber-100 hover:-translate-y-1'>
              <div className='absolute top-0 right-0 w-32 h-32 bg-amber-200 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity'></div>
              <div className='relative flex items-start justify-between'>
                <div className='space-y-2'>
                  <p className='text-xs text-amber-600 font-bold uppercase tracking-wider flex items-center gap-2'>
                    <span className='w-8 h-0.5 bg-amber-400'></span>
                    Product ID
                  </p>
                  <p className='text-sm font-mono text-amber-700 font-semibold break-all'>
                    {product.id?.slice(0, 12)}...
                  </p>
                  <p className='text-xs text-amber-600/70 font-medium'>
                    identifier
                  </p>
                </div>
                <div className='bg-gradient-to-br from-amber-400 to-orange-500 p-3.5 rounded-xl shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform duration-300'>
                  <Box className='h-6 w-6 text-white' strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className='mb-8 group'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='bg-gradient-to-r from-slate-500 to-slate-600 p-2 rounded-lg shadow-md'>
                  <TrendingUp
                    className='h-5 w-5 text-white'
                    strokeWidth={2.5}
                  />
                </div>
                <h3 className='text-lg font-bold text-gray-800'>
                  Product Description
                </h3>
                <div className='flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent'></div>
              </div>
              <div className='relative overflow-hidden bg-gradient-to-br from-slate-50 to-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-md'>
                <div className='absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400'></div>
                <p className='text-sm text-gray-700 leading-relaxed pl-4'>
                  {product.description}
                </p>
              </div>
            </div>
          )}

          {/* Variations Display */}
          {product.variation && product.variation.length > 0 && (
            <div>
              <div className='flex items-center gap-3 mb-6'>
                <div className='bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md'>
                  <Package className='h-5 w-5 text-white' strokeWidth={2.5} />
                </div>
                <h3 className='text-lg font-bold text-gray-800'>
                  Product Variations
                  <span className='ml-2 text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full'>
                    {product.variation.length}
                  </span>
                </h3>
                <div className='flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent'></div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-6'>
                {product.variation.map((variant, index) => (
                  <Card
                    key={index}
                    className='group relative overflow-hidden border-2 border-gray-100 hover:border-indigo-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white'>
                    {/* Gradient accent */}
                    <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

                    <div className='p-4 space-y-3'>
                      {/* Variant Header */}
                      <div className='flex items-center justify-between'>
                        <span className='text-xs font-bold text-gray-500 uppercase tracking-wider'>
                          Variant #{index + 1}
                        </span>
                        {variant.size && variant.color && (
                          <Badge
                            variant='outline'
                            className='text-xs font-semibold bg-gradient-to-r from-purple-50 to-cyan-50 text-purple-600 border-purple-200 px-2.5 py-0.5'>
                            {variant.color} • {variant.size}
                          </Badge>
                        )}
                      </div>

                      {/* Price & Stock Grid */}
                      <div className='grid grid-cols-2 gap-3'>
                        <div className='bg-gradient-to-br from-emerald-50 to-green-50 p-3 rounded-xl border border-emerald-100'>
                          <p className='text-xs text-emerald-600 font-semibold mb-1'>
                            Price
                          </p>
                          <p className='text-lg font-black text-emerald-700'>
                            ৳{variant.unitPrice?.toLocaleString()}
                          </p>
                        </div>
                        <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100'>
                          <p className='text-xs text-blue-600 font-semibold mb-1'>
                            Stock
                          </p>
                          <p className='text-lg font-black text-blue-700'>
                            {variant.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Unique Colors and Sizes Summary */}
              {(uniqueColors.length > 0 || uniqueSizes.length > 0) && (
                <div className='flex gap-3 flex-wrap p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl border border-gray-200'>
                  {uniqueColors.length > 0 && (
                    <div className='flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-purple-100 shadow-sm hover:shadow-md transition-shadow duration-300'>
                      <div className='bg-gradient-to-r from-purple-400 to-fuchsia-500 p-1.5 rounded-full'>
                        <Palette
                          className='h-4 w-4 text-white'
                          strokeWidth={2.5}
                        />
                      </div>
                      <span className='font-bold text-purple-700 text-sm'>
                        Colors:
                      </span>
                      <span className='text-purple-600 text-sm font-medium'>
                        {uniqueColors.join(", ")}
                      </span>
                    </div>
                  )}
                  {uniqueSizes.length > 0 && (
                    <div className='flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-indigo-100 shadow-sm hover:shadow-md transition-shadow duration-300'>
                      <div className='bg-gradient-to-r from-indigo-400 to-blue-500 p-1.5 rounded-full'>
                        <Ruler
                          className='h-4 w-4 text-white'
                          strokeWidth={2.5}
                        />
                      </div>
                      <span className='font-bold text-indigo-700 text-sm'>
                        Sizes:
                      </span>
                      <span className='text-indigo-600 text-sm font-medium'>
                        {uniqueSizes.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductInfoCard;
