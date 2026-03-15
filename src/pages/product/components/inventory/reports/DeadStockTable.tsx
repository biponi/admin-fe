import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import { AlertCircle, Package } from "lucide-react";
import {
  formatNumber,
  getDeadStockColor,
} from "../../../../../utils/inventoryReportUtils";
import { DeadStockProduct } from "../../../../../api/inventoryReport";

interface DeadStockTableProps {
  data: DeadStockProduct[];
}

/**
 * Dead Stock Table Component
 * Displays products that haven't sold recently with severity indicators
 */
export const DeadStockTable = ({ data }: DeadStockTableProps) => {
  if (!data || data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='p-4 rounded-full bg-green-50 mb-4'>
          <Package className='w-12 h-12 text-green-600' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-1'>
          No Dead Stock
        </h3>
        <p className='text-sm text-gray-600'>
          All products have recent sales activity
        </p>
      </div>
    );
  }

  // Calculate statistics
  const totalDeadStock = data.reduce(
    (sum, product) => sum + product.totalStock,
    0,
  );
  const criticalCount = data.filter((p) => p.daysSinceLastSale > 180).length;
  const warningCount = data.filter(
    (p) => p.daysSinceLastSale > 120 && p.daysSinceLastSale <= 180,
  ).length;

  // Get severity badge
  const getSeverityBadge = (days: number) => {
    if (days <= 120) {
      return (
        <Badge
          variant='outline'
          className='bg-yellow-50 text-yellow-700 border-yellow-200 text-xs'>
          Warning
        </Badge>
      );
    }
    if (days <= 180) {
      return (
        <Badge
          variant='outline'
          className='bg-orange-50 text-orange-700 border-orange-200 text-xs'>
          Urgent
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
      {/* Alert Banner */}
      {criticalCount > 0 && (
        <div className='flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg'>
          <AlertCircle className='h-5 w-5 text-red-600 flex-shrink-0' />
          <div className='flex-1'>
            <p className='text-sm font-semibold text-red-900'>
              {criticalCount} product{criticalCount > 1 ? "s" : ""} with
              critical dead stock (6+ months)
            </p>
            <p className='text-xs text-red-700 mt-0.5'>
              Consider discounting or liquidating these items
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-red-50 to-rose-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Critical Items</p>
            <p className='text-2xl font-bold text-red-700'>{criticalCount}</p>
            <p className='text-xs text-gray-500 mt-1'>6+ months</p>
          </div>
        </div>

        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-amber-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Warning Items</p>
            <p className='text-2xl font-bold text-yellow-700'>{warningCount}</p>
            <p className='text-xs text-gray-500 mt-1'>4-6 months</p>
          </div>
        </div>

        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Total Dead Stock</p>
            <p className='text-2xl font-bold text-blue-700'>
              {formatNumber(totalDeadStock)}
            </p>
            <p className='text-xs text-gray-500 mt-1'>units</p>
          </div>
        </div>

        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Products Listed</p>
            <p className='text-2xl font-bold text-purple-700'>{data.length}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='rounded-md border border-gray-200 max-h-[40vh] overflow-y-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-gray-50 hover:bg-gray-50'>
              <TableHead className='w-[15%] font-semibold text-gray-900'>
                Product Name
              </TableHead>
              <TableHead className='w-[15%] font-semibold text-gray-900'>
                SKU
              </TableHead>
              <TableHead className='w-[15%] font-semibold text-gray-900 text-center'>
                Stock Level
              </TableHead>
              <TableHead className='w-[20%] font-semibold text-gray-900'>
                Last Sale
              </TableHead>
              <TableHead className='w-[15%] font-semibold text-gray-900 text-center'>
                Days Since
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product, index) => {
              const severityColor = getDeadStockColor(
                product.daysSinceLastSale,
              );
              const daysSinceLastSale = Math.floor(product.daysSinceLastSale);

              return (
                <TableRow
                  key={index}
                  className={`hover:bg-gray-50 transition-colors ${
                    daysSinceLastSale > 180
                      ? "bg-red-50/30"
                      : daysSinceLastSale > 120
                        ? "bg-yellow-50/30"
                        : ""
                  }`}>
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
                    <div className='inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200'>
                      <Package className='h-4 w-4 text-gray-600' />
                      <span className='font-semibold text-gray-900'>
                        {formatNumber(product.totalStock)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-sm text-gray-600'>
                      {new Date(product.lastPurchasedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    <div className='space-y-1'>
                      <div
                        className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-bold text-sm ${severityColor}`}>
                        {daysSinceLastSale} days
                      </div>
                      <div className='text-xs text-gray-500'>
                        {getSeverityBadge(daysSinceLastSale)}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Summary Footer */}
        <div className='bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3 border-t border-orange-200'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-orange-700 font-medium'>
              <AlertCircle className='h-4 w-4 inline mr-1' />
              Oldest Stock:{" "}
              <span className='font-bold text-orange-900'>
                {data[0]?.name || "N/A"}
              </span>
            </span>
            <span className='text-orange-700'>
              Potential Value Locked:{" "}
              <span className='font-bold text-orange-900'>
                {data.length > 0
                  ? formatNumber(
                      data.reduce((sum, p) => {
                        const avgPrice = 100; /* Placeholder - should come from API */
                        return sum + p.totalStock * avgPrice;
                      }, 0),
                    )
                  : "0"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeadStockTable;
