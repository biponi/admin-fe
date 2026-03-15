import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import {
  formatCurrency,
  formatNumber,
  getStockLevelColor,
} from "../../../../../utils/inventoryReportUtils";
import { LowStockProduct } from "../../../../../api/inventoryReport";

interface LowStockTableProps {
  data: LowStockProduct[];
}

/**
 * Low Stock Table Component
 * Displays products with low stock levels and color-coded urgency indicators
 */
export const LowStockTable = ({ data }: LowStockTableProps) => {
  if (!data || data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='p-4 rounded-full bg-green-50 mb-4'>
          <svg
            className='w-12 h-12 text-green-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 13l4 4L19 7'
            />
          </svg>
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-1'>
          No Low Stock Products
        </h3>
        <p className='text-sm text-gray-600'>
          All products are adequately stocked
        </p>
      </div>
    );
  }

  return (
    <div className='rounded-md border border-gray-200 max-h-[60vh] overflow-y-auto'>
      <Table>
        <TableHeader>
          <TableRow className='bg-gray-50 hover:bg-gray-50'>
            <TableHead className='w-[30%] font-semibold text-gray-900'>
              Product Name
            </TableHead>
            <TableHead className='w-[15%] font-semibold text-gray-900'>
              SKU
            </TableHead>
            <TableHead className='w-[15%] font-semibold text-gray-900'>
              Category
            </TableHead>
            <TableHead className='w-[15%] font-semibold text-gray-900 text-center'>
              Stock Level
            </TableHead>
            <TableHead className='w-[15%] font-semibold text-gray-900 text-right'>
              Unit Price
            </TableHead>
            <TableHead className='w-[10%] font-semibold text-gray-900 text-right'>
              Inventory Value
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='max-h-[40vh] overflow-y-auto'>
          {data.map((product, index) => {
            const stockColorClass = getStockLevelColor(product.totalStock);

            return (
              <TableRow
                key={index}
                className='hover:bg-gray-50 transition-colors'>
                <TableCell className='font-medium text-gray-900'>
                  <div className='flex items-center gap-2'>
                    <span className='truncate max-w-[200px]'>
                      {product.name}
                    </span>
                    {product.hasVariation && (
                      <Badge
                        variant='outline'
                        className='text-xs bg-purple-50 text-purple-700 border-purple-200'>
                        Variants
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className='text-sm text-gray-600 font-mono'>
                  {product.sku}
                </TableCell>
                <TableCell className='text-sm text-gray-600'>
                  {product.categoryId}
                </TableCell>
                <TableCell className='text-center'>
                  <Badge
                    variant='outline'
                    className={`font-semibold ${stockColorClass} text-sm py-1 px-3`}>
                    {formatNumber(product.totalStock)} units
                  </Badge>
                </TableCell>
                <TableCell className='text-right text-sm text-gray-900 font-medium'>
                  {formatCurrency(product.unitPrice)}
                </TableCell>
                <TableCell className='text-right text-sm text-gray-900 font-semibold'>
                  {formatCurrency(product.inventoryValue)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Summary Footer */}
      <div className='bg-gray-50 px-4 py-3 border-t border-gray-200'>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-gray-600 font-medium'>
            Total Products:{" "}
            <span className='font-bold text-gray-900'>{data.length}</span>
          </span>
          <span className='text-gray-600'>
            Total Value:{" "}
            <span className='font-bold text-gray-900'>
              {formatCurrency(
                data.reduce((sum, p) => sum + p.inventoryValue, 0),
              )}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LowStockTable;
