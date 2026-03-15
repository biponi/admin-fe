import { Progress } from "../../../../../components/ui/progress";
import { Badge } from "../../../../../components/ui/badge";
import { Card, CardContent } from "../../../../../components/ui/card";
import { formatNumber, calculatePercentage } from "../../../../../utils/inventoryReportUtils";
import { InventoryDistribution } from "../../../../../api/inventoryReport";

interface InventoryDistributionChartProps {
  data: InventoryDistribution[];
}

/**
 * Inventory Distribution Chart Component
 * Displays products grouped by stock ranges with visual bar indicators
 */
export const InventoryDistributionChart = ({ data }: InventoryDistributionChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='p-4 rounded-full bg-gray-50 mb-4'>
          <svg
            className='w-12 h-12 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
            />
          </svg>
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-1'>
          No Distribution Data
        </h3>
        <p className='text-sm text-gray-600'>
          Unable to generate inventory distribution
        </p>
      </div>
    );
  }

  // Calculate total for percentage calculations
  const totalProducts = data.reduce((sum, item) => sum + item.productCount, 0);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  // Define color gradients based on stock level
  const getRangeColor = (range: string | number): { bg: string; text: string; border: string } => {
    const rangeStr = String(range); // Convert to string to handle both string and number

    if (rangeStr.includes("0") || rangeStr.includes("Out")) {
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
      };
    }
    if (rangeStr.includes("1-10") || rangeStr.includes("Low")) {
      return {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
      };
    }
    if (rangeStr.includes("11-50")) {
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
      };
    }
    if (rangeStr.includes("51-100")) {
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
      };
    }
    return {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
    };
  };

  // Get progress bar color class
  const getProgressColor = (range: string | number): string => {
    const rangeStr = String(range); // Convert to string to handle both string and number
    if (rangeStr.includes("0") || rangeStr.includes("Out")) return "bg-red-500";
    if (rangeStr.includes("1-10") || rangeStr.includes("Low")) return "bg-orange-500";
    if (rangeStr.includes("11-50")) return "bg-yellow-500";
    if (rangeStr.includes("51-100")) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <div className='space-y-4'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='border border-gray-200'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-1'>Total Ranges</p>
              <p className='text-3xl font-bold text-gray-900'>{data.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className='border border-gray-200'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-1'>Total Products</p>
              <p className='text-3xl font-bold text-indigo-600'>
                {formatNumber(totalProducts)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='border border-gray-200'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-1'>Total Units</p>
              <p className='text-3xl font-bold text-green-600'>
                {formatNumber(totalCount)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Bars */}
      <Card className='border border-gray-200'>
        <CardContent className='pt-6'>
          <div className='space-y-5'>
            {data.map((item, index) => {
              const colors = getRangeColor(item.range);
              const percentage = calculatePercentage(item.count, totalCount);
              const productPercentage = calculatePercentage(item.productCount, totalProducts);

              return (
                <div key={index} className='space-y-2'>
                  {/* Header */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant='outline'
                        className={`${colors.bg} ${colors.text} ${colors.border} font-semibold text-xs py-1 px-2.5`}>
                        {item.range}
                      </Badge>
                      <span className='text-sm text-gray-600'>
                        {formatNumber(item.productCount)} products
                      </span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span className='text-sm font-semibold text-gray-900'>
                        {formatNumber(item.count)} units
                      </span>
                      <span className='text-xs text-gray-500 w-12 text-right'>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className='space-y-1'>
                    <Progress
                      value={percentage}
                      className='h-3'
                      // @ts-ignore - adding custom color class
                      barClassName={getProgressColor(item.range)}
                    />
                    <div className='flex items-center justify-between text-xs text-gray-500'>
                      <span>{productPercentage.toFixed(1)}% of products</span>
                      <span>Avg: {item.count > 0 && item.productCount > 0
                        ? formatNumber(item.count / item.productCount)
                        : "0"} units/product</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryDistributionChart;
