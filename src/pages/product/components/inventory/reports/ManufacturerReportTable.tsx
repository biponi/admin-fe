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
import { Factory, TrendingUp, Package, Award } from "lucide-react";
import {
  formatNumber,
  calculatePercentage,
} from "../../../../../utils/inventoryReportUtils";
import { ManufacturerReport } from "../../../../../api/inventoryReport";

interface ManufacturerReportTableProps {
  data: ManufacturerReport[];
}

/**
 * Manufacturer Report Table Component
 * Displays sales breakdown by manufacturer with performance ranking
 */
export const ManufacturerReportTable = ({
  data,
}: ManufacturerReportTableProps) => {
  if (!data || data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='p-4 rounded-full bg-gray-50 mb-4'>
          <Factory className='w-12 h-12 text-gray-400' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-1'>
          No Manufacturer Data
        </h3>
        <p className='text-sm text-gray-600'>
          Unable to generate manufacturer report
        </p>
      </div>
    );
  }

  // Calculate totals
  const totalProducts = data.reduce((sum, item) => sum + item.productCount, 0);
  const totalUnitsSold = data.reduce((sum, item) => sum + item.unitsSold, 0);

  // Get ranking badge based on position
  const getRankingBadge = (index: number) => {
    if (index === 0) {
      return (
        <div className='flex items-center gap-1.5'>
          <div className='flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold text-xs shadow-md'>
            1
          </div>
          <Award className='h-4 w-4 text-yellow-600' />
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

  // Get performance tier based on sales percentage
  const getPerformanceTier = (
    productCount: number,
    unitsSold: number,
  ): { label: string; color: string } => {
    if (productCount === 0) {
      return {
        label: "N/A",
        color: "bg-gray-100 text-gray-700 border-gray-200",
      };
    }

    const avgSalesPerProduct = unitsSold / productCount;

    if (avgSalesPerProduct >= 100) {
      return {
        label: "Excellent",
        color: "bg-green-50 text-green-700 border-green-200",
      };
    }
    if (avgSalesPerProduct >= 50) {
      return {
        label: "Good",
        color: "bg-blue-50 text-blue-700 border-blue-200",
      };
    }
    if (avgSalesPerProduct >= 20) {
      return {
        label: "Moderate",
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      };
    }
    return {
      label: "Low",
      color: "bg-orange-50 text-orange-700 border-orange-200",
    };
  };

  // Sort data by units sold (highest first)
  const sortedData = [...data].sort((a, b) => b.unitsSold - a.unitsSold);

  return (
    <div className='space-y-4'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='border border-gray-200'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2'>Total Manufacturers</p>
              <div className='flex items-center justify-center gap-2 mb-1'>
                <Factory className='h-8 w-8 text-indigo-600' />
                <p className='text-4xl font-bold text-gray-900'>
                  {formatNumber(data.length)}
                </p>
              </div>
              <p className='text-sm text-gray-500 mt-1'>active manufacturers</p>
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
              <p className='text-sm text-gray-500 mt-1'>across manufacturers</p>
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
      </div>

      {/* Table */}
      <div className='rounded-md border border-gray-200 max-h-[50vh] overflow-y-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-gray-50 hover:bg-gray-50'>
              <TableHead className='w-[10%] font-semibold text-gray-900 text-center'>
                Rank
              </TableHead>
              <TableHead className='w-[50%] font-semibold text-gray-900'>
                Manufacturer
              </TableHead>
              <TableHead className='w-[20%] font-semibold text-gray-900 text-right'>
                Products
              </TableHead>
              <TableHead className='w-[20%] font-semibold text-gray-900 text-right'>
                Units Sold
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((manufacturer, index) => {
              const productPercentage = calculatePercentage(
                manufacturer.productCount,
                totalProducts,
              );
              const soldPercentage = calculatePercentage(
                manufacturer.unitsSold,
                totalUnitsSold,
              );
              const performanceTier = getPerformanceTier(
                manufacturer.productCount,
                manufacturer.unitsSold,
              );

              return (
                <TableRow
                  key={index}
                  className={`hover:bg-gray-50 transition-colors ${
                    index < 3
                      ? "bg-gradient-to-r from-yellow-50/30 to-transparent"
                      : ""
                  }`}>
                  <TableCell className='text-center'>
                    {getRankingBadge(index)}
                  </TableCell>
                  <TableCell className='font-medium'>
                    <div className='flex items-center gap-3'>
                      <div>
                        <div className='text-gray-900 truncate max-w-[250px]'>
                          {manufacturer.manufacturer}
                        </div>
                        {index < 3 && (
                          <Badge
                            variant='outline'
                            className={`mt-1 ${performanceTier.color}`}>
                            {performanceTier.label}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='space-y-1'>
                      <div className='text-lg font-semibold text-gray-900'>
                        {formatNumber(manufacturer.productCount)}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {productPercentage.toFixed(1)}% of total
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='space-y-1'>
                      <div className='text-lg font-bold text-blue-700'>
                        {formatNumber(manufacturer.unitsSold)}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {soldPercentage.toFixed(1)}% of total sales
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Summary Footer */}
        <div className='bg-gradient-to-r from-yellow-50 to-amber-50 px-4 py-3 border-t border-yellow-200'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-yellow-700 font-medium'>
              <Award className='h-4 w-4 inline mr-1' />
              Top Manufacturer:{" "}
              <span className='font-bold text-yellow-900'>
                {sortedData[0]?.manufacturer || "N/A"}
              </span>
            </span>
            <span className='text-yellow-700'>
              Market Share:{" "}
              <span className='font-bold text-yellow-900'>
                {sortedData.length > 0
                  ? calculatePercentage(
                      sortedData[0].unitsSold,
                      totalUnitsSold,
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='border border-green-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0'>
              <div className='p-2 rounded-lg bg-green-100'>
                <Award className='h-5 w-5 text-green-600' />
              </div>
            </div>
            <div className='flex-1'>
              <h4 className='text-sm font-semibold text-green-900 mb-1'>
                Top Performer
              </h4>
              <p className='text-xs text-green-700'>
                {sortedData[0]?.manufacturer || "N/A"} leads with{" "}
                {sortedData.length > 0
                  ? formatNumber(sortedData[0].unitsSold)
                  : 0}{" "}
                units sold
              </p>
            </div>
          </div>
        </div>

        <div className='border border-blue-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0'>
              <div className='p-2 rounded-lg bg-blue-100'>
                <Package className='h-5 w-5 text-blue-600' />
              </div>
            </div>
            <div className='flex-1'>
              <h4 className='text-sm font-semibold text-blue-900 mb-1'>
                Avg Products/Manufacturer
              </h4>
              <p className='text-xs text-blue-700'>
                {totalProducts > 0 && data.length > 0
                  ? (totalProducts / data.length).toFixed(0)
                  : 0}{" "}
                products per manufacturer
              </p>
            </div>
          </div>
        </div>

        <div className='border border-purple-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0'>
              <div className='p-2 rounded-lg bg-purple-100'>
                <TrendingUp className='h-5 w-5 text-purple-600' />
              </div>
            </div>
            <div className='flex-1'>
              <h4 className='text-sm font-semibold text-purple-900 mb-1'>
                Total Sales Volume
              </h4>
              <p className='text-xs text-purple-700'>
                {formatNumber(totalUnitsSold)} units sold across all
                manufacturers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerReportTable;
