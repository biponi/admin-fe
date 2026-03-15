import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import { Trophy, TrendingUp } from "lucide-react";
import { formatNumber } from "../../../../../utils/inventoryReportUtils";
import { TopSellingProduct } from "../../../../../api/inventoryReport";

interface TopSellingTableProps {
  data: TopSellingProduct[];
}

/**
 * Top Selling Products Table Component
 * Displays best-performing products with ranking badges
 */
export const TopSellingTable = ({ data }: TopSellingTableProps) => {
  if (!data || data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='p-4 rounded-full bg-gray-50 mb-4'>
          <TrendingUp className='w-12 h-12 text-gray-400' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-1'>
          No Sales Data
        </h3>
        <p className='text-sm text-gray-600'>No products have been sold yet</p>
      </div>
    );
  }

  // Get ranking badge based on position
  const getRankingBadge = (index: number) => {
    if (index === 0) {
      return (
        <div className='flex items-center gap-1.5'>
          <div className='flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold text-xs shadow-md'>
            1
          </div>
          <Trophy className='h-4 w-4 text-yellow-600' />
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className='flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-white font-bold text-xs shadow-md'>
          2
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className='flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white font-bold text-xs shadow-md'>
          3
        </div>
      );
    }
    return (
      <div className='flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-semibold text-xs'>
        {index + 1}
      </div>
    );
  };

  // Calculate total sales for percentage
  const totalSales = data.reduce((sum, product) => sum + product.totalSold, 0);

  return (
    <div className='space-y-4'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Top Product Sales</p>
            <p className='text-2xl font-bold text-green-700'>
              {formatNumber(data[0]?.totalSold || 0)} units
            </p>
          </div>
        </div>

        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Total Products Listed</p>
            <p className='text-2xl font-bold text-blue-700'>{data.length}</p>
          </div>
        </div>

        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Total Units Sold</p>
            <p className='text-2xl font-bold text-purple-700'>
              {formatNumber(totalSales)}
            </p>
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
              <TableHead className='w-[15%] font-semibold text-gray-900'>
                SKU
              </TableHead>
              <TableHead className='w-[15%] font-semibold text-gray-900 text-center'>
                Units Sold
              </TableHead>
              <TableHead className='w-[15%] font-semibold text-gray-900 text-center'>
                In Stock
              </TableHead>
              <TableHead className='w-[10%] font-semibold text-gray-900 text-center'>
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product, index) => {
              const percentage =
                totalSales > 0
                  ? ((product.totalSold / totalSales) * 100).toFixed(1)
                  : "0.0";

              return (
                <TableRow
                  key={index}
                  className={`hover:bg-gray-50 transition-colors ${
                    index < 3
                      ? "bg-gradient-to-r from-amber-50/30 to-transparent"
                      : ""
                  }`}>
                  <TableCell className='text-center'>
                    {getRankingBadge(index)}
                  </TableCell>
                  <TableCell className='font-medium text-gray-900'>
                    <span className='truncate max-w-[250px] block uppercase'>
                      {product.name}
                    </span>
                  </TableCell>
                  <TableCell className='text-sm text-gray-600 font-mono'>
                    {product.sku}
                  </TableCell>
                  <TableCell className='text-center'>
                    <div className='space-y-1'>
                      <div className='text-lg font-bold text-gray-900'>
                        {formatNumber(product.totalSold)}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {percentage}% of total
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    <Badge
                      variant='outline'
                      className={`text-sm py-1 px-2.5 ${
                        product.totalStock > 50
                          ? "bg-green-50 text-green-700 border-green-200"
                          : product.totalStock > 10
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-red-50 text-red-700 border-red-200"
                      }`}>
                      {formatNumber(product.totalStock)}
                    </Badge>
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
        <div className='bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-t border-green-200'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-green-700 font-medium'>
              <Trophy className='h-4 w-4 inline mr-1' />
              Top Seller:{" "}
              <span className='font-bold text-green-900'>{data[0]?.name}</span>
            </span>
            <span className='text-green-700'>
              Market Share:{" "}
              <span className='font-bold text-green-900'>
                {totalSales > 0
                  ? (((data[0]?.totalSold || 0) / totalSales) * 100).toFixed(1)
                  : "0.0"}
                %
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopSellingTable;
