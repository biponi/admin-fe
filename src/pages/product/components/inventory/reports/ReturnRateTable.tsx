import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { formatNumber, formatPercentage, getReturnRateColor } from "../../../../../utils/inventoryReportUtils";
import { ReturnRateProduct } from "../../../../../api/inventoryReport";

interface ReturnRateTableProps {
  data: ReturnRateProduct[];
}

/**
 * Return Rate Table Component
 * Displays products with highest return rates and color-coded severity
 */
export const ReturnRateTable = ({ data }: ReturnRateTableProps) => {
  if (!data || data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='p-4 rounded-full bg-green-50 mb-4'>
          <RotateCcw className='w-12 h-12 text-green-600' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-1'>
          No Returns
        </h3>
        <p className='text-sm text-gray-600'>
          No product returns recorded
        </p>
      </div>
    );
  }

  // Calculate statistics
  const totalReturns = data.reduce((sum, product) => sum + product.totalReturned, 0);
  const totalSales = data.reduce((sum, product) => sum + product.totalSold, 0);
  const avgReturnRate = data.reduce((sum, product) => sum + product.returnRate, 0) / data.length;
  const highReturnCount = data.filter((p) => p.returnRate > 15).length;

  // Get severity indicator
  const getSeverityBadge = (rate: number) => {
    if (rate <= 5) {
      return (
        <Badge
          variant='outline'
          className='bg-green-50 text-green-700 border-green-200 text-xs'>
          Good
        </Badge>
      );
    }
    if (rate <= 10) {
      return (
        <Badge
          variant='outline'
          className='bg-yellow-50 text-yellow-700 border-yellow-200 text-xs'>
          Moderate
        </Badge>
      );
    }
    if (rate <= 15) {
      return (
        <Badge
          variant='outline'
          className='bg-orange-50 text-orange-700 border-orange-200 text-xs'>
          High
        </Badge>
      );
    }
    return (
      <Badge
        variant='outline'
        className='bg-red-50 text-red-700 border-red-200 text-xs'>
        Critical
      </Badge>
    );
  };

  return (
    <div className='space-y-4'>
      {/* Alert Banner for High Returns */}
      {highReturnCount > 0 && (
        <div className='flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg'>
          <AlertTriangle className='h-5 w-5 text-red-600 flex-shrink-0' />
          <div className='flex-1'>
            <p className='text-sm font-semibold text-red-900'>
              {highReturnCount} product{highReturnCount > 1 ? "s have" : " has"}{" "}
              critically high return rates
            </p>
            <p className='text-xs text-red-700 mt-0.5'>
              Products with return rates above 15% require immediate attention
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-red-50 to-orange-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Highest Return Rate</p>
            <p className='text-2xl font-bold text-red-700'>
              {formatPercentage(data[0]?.returnRate || 0)}
            </p>
          </div>
        </div>

        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Total Returns</p>
            <p className='text-2xl font-bold text-blue-700'>
              {formatNumber(totalReturns)}
            </p>
          </div>
        </div>

        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Avg Return Rate</p>
            <p className='text-2xl font-bold text-purple-700'>
              {formatPercentage(avgReturnRate)}
            </p>
          </div>
        </div>

        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Products Listed</p>
            <p className='text-2xl font-bold text-green-700'>{data.length}</p>
          </div>
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
              <TableHead className='w-[15%] font-semibold text-gray-900 text-center'>
                Total Sold
              </TableHead>
              <TableHead className='w-[15%] font-semibold text-gray-900 text-center'>
                Returns
              </TableHead>
              <TableHead className='w-[20%] font-semibold text-gray-900 text-center'>
                Return Rate
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product, index) => {
              const colorClass = getReturnRateColor(product.returnRate);

              return (
                <TableRow
                  key={index}
                  className={`hover:bg-gray-50 transition-colors ${
                    product.returnRate > 15 ? "bg-red-50/30" : ""
                  }`}>
                  <TableCell className='font-medium text-gray-900'>
                    <div className='flex items-center gap-2'>
                      <span className='truncate max-w-[250px]'>
                        {product.name}
                      </span>
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
                  <TableCell className='text-sm text-gray-600 font-mono'>
                    {product.sku}
                  </TableCell>
                  <TableCell className='text-center text-sm text-gray-900'>
                    {formatNumber(product.totalSold)}
                  </TableCell>
                  <TableCell className='text-center'>
                    <div className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200'>
                      <RotateCcw className='h-3.5 w-3.5 text-red-600' />
                      <span className='font-semibold text-red-900'>
                        {formatNumber(product.totalReturned)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    <div className='space-y-1'>
                      <div
                        className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-bold text-sm ${colorClass}`}>
                        {formatPercentage(product.returnRate)}
                      </div>
                      <div className='text-xs'>
                        {getSeverityBadge(product.returnRate)}
                      </div>
                    </div>
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
              <AlertTriangle className='h-4 w-4 inline mr-1' />
              Highest Return Rate:{" "}
              <span className='font-bold text-red-900'>
                {data[0]?.name || "N/A"}
              </span>
            </span>
            <span className='text-red-700'>
              Overall Return Rate:{" "}
              <span className='font-bold text-red-900'>
                {totalSales > 0
                  ? formatPercentage((totalReturns / totalSales) * 100)
                  : "0%"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnRateTable;
