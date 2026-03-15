import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import { Card, CardContent } from "../../../../../components/ui/card";
import { TrendingUp, Package, BarChart3, Layers } from "lucide-react";
import {
  formatNumber,
  calculatePercentage,
} from "../../../../../utils/inventoryReportUtils";
import { CategoryPerformance } from "../../../../../api/inventoryReport";

interface CategoryPerformanceTableProps {
  data: CategoryPerformance[];
}

/**
 * Category Performance Table Component
 * Displays sales metrics grouped by category with performance indicators
 */
export const CategoryPerformanceTable = ({
  data,
}: CategoryPerformanceTableProps) => {
  if (!data || data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='p-4 rounded-full bg-gray-50 mb-4'>
          <Layers className='w-12 h-12 text-gray-400' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-1'>
          No Category Data
        </h3>
        <p className='text-sm text-gray-600'>
          Unable to generate category performance report
        </p>
      </div>
    );
  }

  // Calculate totals
  const totalProducts = data.reduce((sum, item) => sum + item.productCount, 0);
  const totalUnitsSold = data.reduce((sum, item) => sum + item.unitsSold, 0);
  const totalStockUnits = data.reduce((sum, item) => sum + item.stockUnits, 0);

  // Get performance badge based on sales percentage
  const getPerformanceBadge = (unitsSold: number, stockUnits: number) => {
    if (stockUnits === 0) {
      return (
        <Badge
          variant='outline'
          className='bg-gray-50 text-gray-700 border-gray-200'>
          N/A
        </Badge>
      );
    }

    const sellThroughRate = (unitsSold / stockUnits) * 100;

    if (sellThroughRate >= 70) {
      return (
        <Badge
          variant='outline'
          className='bg-green-50 text-green-700 border-green-200'>
          Excellent
        </Badge>
      );
    }
    if (sellThroughRate >= 50) {
      return (
        <Badge
          variant='outline'
          className='bg-blue-50 text-blue-700 border-blue-200'>
          Good
        </Badge>
      );
    }
    if (sellThroughRate >= 30) {
      return (
        <Badge
          variant='outline'
          className='bg-yellow-50 text-yellow-700 border-yellow-200'>
          Moderate
        </Badge>
      );
    }
    return (
      <Badge
        variant='outline'
        className='bg-orange-50 text-orange-700 border-orange-200'>
        Slow
      </Badge>
    );
  };

  // Sort data by units sold (highest first)
  const sortedData = [...data].sort((a, b) => b.unitsSold - a.unitsSold);

  return (
    <div className='space-y-4'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card className='border border-gray-200'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2'>Total Categories</p>
              <div className='flex items-center justify-center gap-2 mb-1'>
                <Layers className='h-8 w-8 text-indigo-600' />
                <p className='text-4xl font-bold text-gray-900'>
                  {formatNumber(data.length)}
                </p>
              </div>
              <p className='text-sm text-gray-500 mt-1'>active categories</p>
            </div>
          </CardContent>
        </Card>

        <Card className='border border-gray-200'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2'>Total Products</p>
              <p className='text-4xl font-bold text-green-600'>
                {formatNumber(totalProducts)}
              </p>
              <p className='text-sm text-gray-500 mt-1'>across categories</p>
            </div>
          </CardContent>
        </Card>

        <Card className='border border-gray-200'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2'>Total Units Sold</p>
              <div className='flex items-center justify-center gap-2 mb-1'>
                <TrendingUp className='h-8 w-8 text-blue-600' />
                <p className='text-4xl font-bold text-gray-900'>
                  {formatNumber(totalUnitsSold)}
                </p>
              </div>
              <p className='text-sm text-gray-500 mt-1'>total sales volume</p>
            </div>
          </CardContent>
        </Card>

        <Card className='border border-gray-200'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2'>Total Stock Units</p>
              <div className='flex items-center justify-center gap-2 mb-1'>
                <Package className='h-8 w-8 text-purple-600' />
                <p className='text-4xl font-bold text-gray-900'>
                  {formatNumber(totalStockUnits)}
                </p>
              </div>
              <p className='text-sm text-gray-500 mt-1'>current inventory</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className='rounded-md border border-gray-200 max-h-[40vh] overflow-y-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-gray-50 hover:bg-gray-50'>
              <TableHead className='w-[25%] font-semibold text-gray-900'>
                Category Name
              </TableHead>
              <TableHead className='w-[20%] font-semibold text-gray-900 text-right'>
                Products
              </TableHead>
              <TableHead className='w-[20%] font-semibold text-gray-900 text-right'>
                Stock Units
              </TableHead>
              <TableHead className='w-[20%] font-semibold text-gray-900 text-right'>
                Units Sold
              </TableHead>
              <TableHead className='w-[10%] font-semibold text-gray-900 text-center'>
                Performance
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((category, index) => {
              const sellThroughRate =
                category.stockUnits > 0
                  ? (category.unitsSold / category.stockUnits) * 100
                  : 0;
              const productPercentage = calculatePercentage(
                category.productCount,
                totalProducts,
              );
              const soldPercentage = calculatePercentage(
                category.unitsSold,
                totalUnitsSold,
              );

              return (
                <TableRow
                  key={index}
                  className={`hover:bg-gray-50 transition-colors ${
                    index === 0
                      ? "bg-gradient-to-r from-green-50/30 to-transparent"
                      : ""
                  }`}>
                  <TableCell className='font-medium'>
                    <div className='flex items-center gap-2'>
                      {index === 0 && (
                        <div className='flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold text-xs'>
                          1
                        </div>
                      )}
                      <div>
                        <div className='text-gray-900 truncate max-w-[200px]'>
                          {category.categoryName}
                        </div>
                        <div className='text-xs text-gray-500'>
                          ID: {category.categoryId}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='space-y-1'>
                      <div className='text-lg font-semibold text-gray-900'>
                        {formatNumber(category.productCount)}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {productPercentage.toFixed(1)}% of total
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='space-y-1'>
                      <div className='text-lg font-semibold text-gray-900'>
                        {formatNumber(category.stockUnits)}
                      </div>
                      <div className='text-xs text-gray-500'>in stock</div>
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='space-y-1'>
                      <div className='text-lg font-bold text-blue-700'>
                        {formatNumber(category.unitsSold)}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {soldPercentage.toFixed(1)}% of total sales
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    <div className='space-y-1'>
                      {getPerformanceBadge(
                        category.unitsSold,
                        category.stockUnits,
                      )}
                      <div className='text-xs text-gray-600'>
                        {sellThroughRate.toFixed(0)}% sell-through
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Summary Footer */}
        <div className='bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-3 border-t border-indigo-200'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-indigo-700 font-medium'>
              <BarChart3 className='h-4 w-4 inline mr-1' />
              Top Category:{" "}
              <span className='font-bold text-indigo-900'>
                {sortedData[0]?.categoryName || "N/A"}
              </span>
            </span>
            <span className='text-indigo-700'>
              Avg Sell-Through Rate:{" "}
              <span className='font-bold text-indigo-900'>
                {totalStockUnits > 0
                  ? ((totalUnitsSold / totalStockUnits) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPerformanceTable;
