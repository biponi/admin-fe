import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import { TrendingDown, Award } from "lucide-react";
import { formatCurrency } from "../../../../../utils/inventoryReportUtils";
import { HighestDiscountProduct } from "../../../../../api/inventoryReport";

interface HighestDiscountTableProps {
  data: HighestDiscountProduct[];
}

/**
 * Highest Discount Table Component
 * Displays products with the biggest discounts with ranking
 */
export const HighestDiscountTable = ({ data }: HighestDiscountTableProps) => {
  if (!data || data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='p-4 rounded-full bg-gray-50 mb-4'>
          <Award className='w-12 h-12 text-gray-400' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-1'>
          No Discount Data
        </h3>
        <p className='text-sm text-gray-600'>
          No products with discount information available
        </p>
      </div>
    );
  }

  // Calculate statistics
  const avgDiscount =
    data.reduce((sum, p) => sum + p.discount, 0) / data.length;
  const maxDiscount = Math.max(...data.map((p) => p.discount));
  const activeProducts = data.filter((p) => p.active).length;

  // Get ranking badge based on position
  const getRankingBadge = (index: number, discount: number) => {
    if (index === 0) {
      return (
        <div className='flex items-center gap-1.5'>
          <div className='flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-pink-600 text-white font-bold text-xs shadow-md'>
            1
          </div>
          <TrendingDown className='h-4 w-4 text-red-600' />
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className='flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-sm shadow-md'>
          2
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className='flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 text-white font-bold text-sm shadow-md'>
          3
        </div>
      );
    }
    return (
      <div className='flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-semibold text-xs'>
        {index + 1}
      </div>
    );
  };

  // Get discount level color
  const getDiscountColor = (discount: number): string => {
    if (discount >= 50) return "bg-red-50 text-red-700 border-red-200";
    if (discount >= 30) return "bg-orange-50 text-orange-700 border-orange-200";
    if (discount >= 20) return "bg-yellow-50 text-yellow-700 border-yellow-200";
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  // Get discount level label
  const getDiscountLabel = (discount: number): string => {
    if (discount >= 50) return "Massive";
    if (discount >= 30) return "Huge";
    if (discount >= 20) return "Great";
    if (discount >= 10) return "Good";
    return "Moderate";
  };

  return (
    <div className='space-y-4'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-red-50 to-pink-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Highest Discount</p>
            <div className='flex items-center justify-center gap-1'>
              <TrendingDown className='h-6 w-6 text-red-600' />
              <p className='text-2xl font-bold text-red-700'>
                {data[0]?.discount || 0}%
              </p>
            </div>
          </div>
        </div>

        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Average Discount</p>
            <p className='text-2xl font-bold text-blue-700'>
              {avgDiscount.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Active Products</p>
            <p className='text-2xl font-bold text-green-700'>
              {activeProducts}
            </p>
          </div>
        </div>

        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Total Listed</p>
            <p className='text-2xl font-bold text-purple-700'>{data.length}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='rounded-md border border-gray-200 max-h-[50vh] overflow-y-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-gray-50 hover:bg-gray-50'>
              <TableHead className='w-[10%] font-semibold text-gray-900 text-center'>
                Rank
              </TableHead>
              <TableHead className='w-[15%] font-semibold text-gray-900'>
                Product Name
              </TableHead>
              <TableHead className='w-[20%] font-semibold text-gray-900 text-right'>
                Unit Price
              </TableHead>
              <TableHead className='w-[20%] font-semibold text-gray-900 text-center'>
                Discount
              </TableHead>
              <TableHead className='w-[10%] font-semibold text-gray-900 text-center'>
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product, index) => {
              const discountColor = getDiscountColor(product.discount);
              const discountLabel = getDiscountLabel(product.discount);

              return (
                <TableRow
                  key={index}
                  className={`hover:bg-gray-50 transition-colors ${
                    index < 3
                      ? "bg-gradient-to-r from-red-50/30 to-transparent"
                      : ""
                  }`}>
                  <TableCell className='text-center'>
                    {getRankingBadge(index, product.discount)}
                  </TableCell>
                  <TableCell className='font-medium text-gray-900'>
                    <span className='truncate max-w-[300px] block uppercase'>
                      {product.name}
                    </span>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='text-lg font-semibold text-gray-900'>
                      {formatCurrency(product.unitPrice)}
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    <div className='space-y-1'>
                      <div
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg font-bold text-sm ${discountColor}`}>
                        {product.discountType.toLowerCase() === "percentage"
                          ? `${product.discount}%`
                          : formatCurrency(product.discount)}
                      </div>
                      <div
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          product.discount >= 50
                            ? "bg-red-100 text-red-700"
                            : product.discount >= 30
                              ? "bg-orange-100 text-orange-700"
                              : product.discount >= 20
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-700"
                        }`}>
                        {discountLabel}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    {product.active ? (
                      <Badge
                        variant='outline'
                        className='bg-green-50 text-green-700 border-green-200 text-xs'>
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant='outline'
                        className='bg-gray-50 text-gray-700 border-gray-200 text-xs'>
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Summary Footer */}
        <div className='bg-gradient-to-r from-red-50 to-orange-50 px-4 py-3 border-t border-red-200'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-red-700 font-medium'>
              <Award className='h-4 w-4 inline mr-1' />
              Best Deal:{" "}
              <span className='font-bold text-red-900'>
                {data[0]?.name || "N/A"}
              </span>
            </span>
            <span className='text-red-700'>
              Max Discount:{" "}
              <span className='font-bold text-red-900'>{maxDiscount}%</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighestDiscountTable;
