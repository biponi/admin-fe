import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import { DollarSign, Tag } from "lucide-react";
import {
  formatCurrency,
  getDiscountColor,
} from "../../../../../utils/inventoryReportUtils";
import { DiscountedProduct } from "../../../../../api/inventoryReport";

interface DiscountedProductsTableProps {
  data: DiscountedProduct[];
}

/**
 * Discounted Products Table Component
 * Displays products currently on discount with savings calculations
 */
export const DiscountedProductsTable = ({
  data,
}: DiscountedProductsTableProps) => {
  if (!data || data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='p-4 rounded-full bg-gray-50 mb-4'>
          <Tag className='w-12 h-12 text-gray-400' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-1'>
          No Discounts Available
        </h3>
        <p className='text-sm text-gray-600'>
          No products currently have active discounts
        </p>
      </div>
    );
  }

  // Calculate statistics
  const totalProducts = data.length;
  const avgDiscount =
    data.reduce((sum, p) => sum + p.discount, 0) / totalProducts;
  const totalOriginalValue = data.reduce((sum, p) => sum + p.originalPrice, 0);
  const totalFinalValue = data.reduce((sum, p) => sum + p.finalPrice, 0);
  const totalSavings = totalOriginalValue - totalFinalValue;

  // Get discount type badge
  const getDiscountTypeBadge = (type: string) => {
    if (type.toLowerCase() === "percentage") {
      return (
        <Badge
          variant='outline'
          className='bg-blue-50 text-blue-700 border-blue-200 text-xs'>
          % Off
        </Badge>
      );
    }
    return (
      <Badge
        variant='outline'
        className='bg-purple-50 text-purple-700 border-purple-200 text-xs'>
        Flat
      </Badge>
    );
  };

  return (
    <div className='space-y-4'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Total Savings</p>
            <p className='text-2xl font-bold text-green-700'>
              {formatCurrency(totalSavings)}
            </p>
          </div>
        </div>

        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Avg Discount</p>
            <p className='text-2xl font-bold text-blue-700'>
              {avgDiscount.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Products on Sale</p>
            <p className='text-2xl font-bold text-purple-700'>
              {totalProducts}
            </p>
          </div>
        </div>

        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-orange-50 to-amber-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Total Discounted Value</p>
            <p className='text-2xl font-bold text-orange-700'>
              {formatCurrency(totalFinalValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='rounded-md border border-gray-200 max-h-[50vh] overflow-y-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-gray-50 hover:bg-gray-50'>
              <TableHead className='w-[40%] font-semibold text-gray-900'>
                Product Name
              </TableHead>
              <TableHead className='w-[20%] font-semibold text-gray-900 text-right'>
                Original Price
              </TableHead>
              <TableHead className='w-[15%] font-semibold text-gray-900 text-center'>
                Discount
              </TableHead>
              <TableHead className='w-[20%] font-semibold text-gray-900 text-right'>
                Final Price
              </TableHead>
              <TableHead className='w-[5%] font-semibold text-gray-900 text-center'>
                Type
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product, index) => {
              const discountColor = getDiscountColor(product.discount);
              const savings = product.originalPrice - product.finalPrice;
              const savingsPercent = (
                (savings / product.originalPrice) *
                100
              ).toFixed(0);

              return (
                <TableRow
                  key={index}
                  className='hover:bg-gray-50 transition-colors'>
                  <TableCell className='font-medium text-gray-900'>
                    <div className='flex items-center gap-2'>
                      <Tag className='h-4 w-4 text-green-600' />
                      <span className='truncate max-w-[280px]'>
                        {product.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='text-sm text-gray-500 line-through'>
                      {formatCurrency(product.originalPrice)}
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    <div className='space-y-1'>
                      <div
                        className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-bold text-sm ${discountColor}`}>
                        {product.discountType.toLowerCase() === "percentage"
                          ? `${product.discount}%`
                          : formatCurrency(product.discount)}
                      </div>
                      <div className='text-xs text-green-600 font-medium'>
                        Save {savingsPercent}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='space-y-1'>
                      <div className='text-lg font-bold text-green-700'>
                        {formatCurrency(product.finalPrice)}
                      </div>
                      <div className='text-xs text-gray-500'>
                        You save {formatCurrency(savings)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    {getDiscountTypeBadge(product.discountType)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Summary Footer */}
        <div className='bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-t border-green-200'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-green-700 font-medium'>
              <DollarSign className='h-4 w-4 inline mr-1' />
              Customer Savings:{" "}
              <span className='font-bold text-green-900'>
                {formatCurrency(totalSavings)}
              </span>
            </span>
            <span className='text-green-700'>
              Avg Savings per Product:{" "}
              <span className='font-bold text-green-900'>
                {formatCurrency(totalSavings / totalProducts)}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountedProductsTable;
