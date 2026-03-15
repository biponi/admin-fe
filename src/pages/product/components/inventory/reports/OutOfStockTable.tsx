import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import { Button } from "../../../../../components/ui/button";
import { AlertTriangle, Package } from "lucide-react";
import { formatCurrency } from "../../../../../utils/inventoryReportUtils";
import { OutOfStockProduct } from "../../../../../api/inventoryReport";

interface OutOfStockTableProps {
  data: OutOfStockProduct[];
}

/**
 * Out of Stock Table Component
 * Displays products with zero inventory and urgency indicators
 */
export const OutOfStockTable = ({ data }: OutOfStockTableProps) => {
  if (!data || data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='p-4 rounded-full bg-green-50 mb-4'>
          <Package className='w-12 h-12 text-green-600' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-1'>
          No Out of Stock Products
        </h3>
        <p className='text-sm text-gray-600'>
          All products have available inventory
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Alert Banner */}
      <div className='flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg'>
        <div className='flex-shrink-0'>
          <AlertTriangle className='h-5 w-5 text-red-600' />
        </div>
        <div className='flex-1'>
          <p className='text-sm font-semibold text-red-900'>
            {data.length} product{data.length > 1 ? "s are" : " is"} currently
            out of stock
          </p>
          <p className='text-xs text-red-700 mt-0.5'>
            Immediate restocking recommended
          </p>
        </div>
      </div>

      {/* Table */}
      <div className='rounded-md border border-gray-200 max-h-[50vh] overflow-y-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-gray-50 hover:bg-gray-50'>
              <TableHead className='w-[35%] font-semibold text-gray-900'>
                Product Name
              </TableHead>
              <TableHead className='w-[15%] font-semibold text-gray-900'>
                SKU
              </TableHead>
              <TableHead className='w-[15%] font-semibold text-gray-900'>
                Category
              </TableHead>
              <TableHead className='w-[20%] font-semibold text-gray-900'>
                Status
              </TableHead>
              <TableHead className='w-[15%] font-semibold text-gray-900 text-right'>
                Unit Price
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product, index) => (
              <TableRow
                key={index}
                className='hover:bg-gray-50 transition-colors'>
                <TableCell className='font-medium text-gray-900'>
                  <div className='flex items-center gap-2'>
                    <span className='truncate max-w-[250px]'>
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
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant='outline'
                      className='bg-red-50 text-red-700 border-red-200 font-semibold text-xs py-1 px-2.5'>
                      <div className='flex items-center gap-1.5'>
                        <div className='h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse' />
                        Out of Stock
                      </div>
                    </Badge>
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
                  </div>
                </TableCell>
                <TableCell className='text-right text-sm text-gray-900 font-medium'>
                  {formatCurrency(product.unitPrice)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Summary Footer */}
        <div className='bg-red-50 px-4 py-3 border-t border-red-200'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-red-700 font-medium'>
              Critical:{" "}
              <span className='font-bold text-red-900'>
                {data.filter((p) => p.active).length} active
              </span>{" "}
              / {data.length} total products
            </span>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='h-8 text-xs border-red-200 text-red-700 hover:bg-red-100'>
                Export List
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='h-8 text-xs border-red-200 text-red-700 hover:bg-red-100'>
                Create Purchase Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutOfStockTable;
