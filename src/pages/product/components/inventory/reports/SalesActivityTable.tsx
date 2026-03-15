import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import { Clock, ShoppingCart } from "lucide-react";
import {
  formatNumber,
  formatRelativeTime,
} from "../../../../../utils/inventoryReportUtils";
import { SalesActivityProduct } from "../../../../../api/inventoryReport";

interface SalesActivityTableProps {
  data: SalesActivityProduct[];
}

/**
 * Sales Activity Table Component
 * Displays recently sold products with time-based indicators
 */
export const SalesActivityTable = ({ data }: SalesActivityTableProps) => {
  if (!data || data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='p-4 rounded-full bg-gray-50 mb-4'>
          <ShoppingCart className='w-12 h-12 text-gray-400' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-1'>
          No Recent Sales
        </h3>
        <p className='text-sm text-gray-600'>No sales activity recorded yet</p>
      </div>
    );
  }

  // Get time-based color indicator
  const getTimeColor = (
    lastPurchasedAt: string,
  ): { bg: string; text: string; border: string } => {
    const now = new Date();
    const lastPurchase = new Date(lastPurchasedAt);
    const diffHours =
      Math.abs(now.getTime() - lastPurchase.getTime()) / (1000 * 60 * 60);

    if (diffHours <= 24) {
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
      };
    }
    if (diffHours <= 72) {
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
      };
    }
    if (diffHours <= 168) {
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
      };
    }
    return {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
    };
  };

  // Calculate totals
  const totalSales = data.reduce((sum, product) => sum + product.totalSold, 0);
  const activeProducts = data.filter((p) => p.active).length;

  return (
    <div className='space-y-4'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-indigo-50 to-blue-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Products Sold</p>
            <p className='text-2xl font-bold text-indigo-700'>{data.length}</p>
          </div>
        </div>

        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Total Units Sold</p>
            <p className='text-2xl font-bold text-green-700'>
              {formatNumber(totalSales)}
            </p>
          </div>
        </div>

        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Active Products</p>
            <p className='text-2xl font-bold text-purple-700'>
              {activeProducts}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='rounded-md border border-gray-200 max-h-[50vh] overflow-y-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-gray-50 hover:bg-gray-50'>
              <TableHead className='w-[15%] font-semibold text-gray-900'>
                Product Name
              </TableHead>
              <TableHead className='w-[15%] font-semibold text-gray-900'>
                SKU
              </TableHead>
              <TableHead className='w-[20%] font-semibold text-gray-900 text-center'>
                Total Sold
              </TableHead>
              <TableHead className='w-[30%] font-semibold text-gray-900'>
                Last Purchase
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product, index) => {
              const timeColor = getTimeColor(product.lastPurchasedAt);
              const relativeTime = formatRelativeTime(product.lastPurchasedAt);

              return (
                <TableRow
                  key={index}
                  className='hover:bg-gray-50 transition-colors'>
                  <TableCell className='font-medium text-gray-900'>
                    <div className='flex items-center gap-2'>
                      <span className='truncate max-w-[250px] uppercase'>
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
                  <TableCell className='text-center'>
                    <div className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200'>
                      <ShoppingCart className='h-4 w-4 text-indigo-600' />
                      <span className='font-semibold text-indigo-900'>
                        {formatNumber(product.totalSold)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='space-y-1'>
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${timeColor.bg} ${timeColor.text} ${timeColor.border} border`}>
                        <Clock className='h-3 w-3' />
                        {relativeTime}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {new Date(product.lastPurchasedAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Summary Footer */}
        <div className='bg-indigo-50 px-4 py-3 border-t border-indigo-200'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-indigo-700 font-medium'>
              <ShoppingCart className='h-4 w-4 inline mr-1' />
              Most Recent:{" "}
              <span className='font-bold text-indigo-900'>
                {data[0]?.name || "N/A"}
              </span>
            </span>
            <span className='text-indigo-700'>
              Avg. Sales per Product:{" "}
              <span className='font-bold text-indigo-900'>
                {data.length > 0 ? formatNumber(totalSales / data.length) : "0"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesActivityTable;
