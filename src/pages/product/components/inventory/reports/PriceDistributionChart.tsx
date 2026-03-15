import { Progress } from "../../../../../components/ui/progress";
import { Card, CardContent } from "../../../../../components/ui/card";
import { DollarSign, BarChart3 } from "lucide-react";
import {
  formatNumber,
  calculatePercentage,
} from "../../../../../utils/inventoryReportUtils";
import { PriceDistribution } from "../../../../../api/inventoryReport";

interface PriceDistributionChartProps {
  data: PriceDistribution[];
}

/**
 * Price Distribution Chart Component
 * Displays products grouped by price ranges with visual bar indicators
 */
export const PriceDistributionChart = ({
  data,
}: PriceDistributionChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='p-4 rounded-full bg-gray-50 mb-4'>
          <BarChart3 className='w-12 h-12 text-gray-400' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-1'>
          No Price Data
        </h3>
        <p className='text-sm text-gray-600'>
          Unable to generate price distribution
        </p>
      </div>
    );
  }

  // Calculate totals
  const totalProducts = data.reduce(
    (sum, item) => sum + item.numberOfProducts,
    0,
  );

  // Get color based on price range
  const getPriceColor = (
    range: string | number | any,
  ): { bg: string; text: string; bar: string; icon: string } => {
    // Convert to string to safely use .includes()
    const rangeStr = String(range || "");

    if (rangeStr.includes("0-") || rangeStr.includes("<")) {
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        bar: "bg-green-500",
        icon: "💰",
      };
    }
    if (rangeStr.includes("100-") || rangeStr.includes("50-")) {
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        bar: "bg-blue-500",
        icon: "💵",
      };
    }
    if (rangeStr.includes("500-") || rangeStr.includes("1000")) {
      return {
        bg: "bg-purple-50",
        text: "text-purple-700",
        bar: "bg-purple-500",
        icon: "💎",
      };
    }
    return {
      bg: "bg-amber-50",
      text: "text-amber-700",
      bar: "bg-amber-500",
      icon: "👑",
    };
  };

  // Extract price range for display
  const getPriceRangeDisplay = (range: string | number | any): string => {
    // Convert to string to safely use .includes()
    const rangeStr = String(range || "N/A");

    if (rangeStr.includes("Under")) return rangeStr;
    if (rangeStr.includes("to") || rangeStr.includes("-")) return rangeStr;
    return rangeStr;
  };

  return (
    <div className='space-y-4'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='border border-gray-200'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2'>Total Products</p>
              <div className='flex items-center justify-center gap-2 mb-1'>
                <DollarSign className='h-8 w-8 text-green-600' />
                <p className='text-4xl font-bold text-gray-900'>
                  {formatNumber(totalProducts)}
                </p>
              </div>
              <p className='text-sm text-gray-500 mt-1'>
                across all price ranges
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='border border-gray-200'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2'>Price Ranges</p>
              <p className='text-4xl font-bold text-indigo-600'>
                {data.length}
              </p>
              <p className='text-sm text-gray-500 mt-1'>different categories</p>
            </div>
          </CardContent>
        </Card>

        <Card className='border border-gray-200'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2'>Most Popular Range</p>
              <p className='text-2xl font-bold text-purple-700'>
                {data.length > 0
                  ? getPriceRangeDisplay(
                      data.reduce((max, item) =>
                        item.numberOfProducts > max.numberOfProducts
                          ? item
                          : max,
                      ).priceRange,
                    )
                  : "N/A"}
              </p>
              <p className='text-sm text-gray-500 mt-1'>
                {data.length > 0
                  ? `${formatNumber(
                      data.reduce((max, item) =>
                        item.numberOfProducts > max.numberOfProducts
                          ? item
                          : max,
                      ).numberOfProducts,
                    )} products`
                  : ""}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Chart */}
      <Card className='border border-gray-200'>
        <CardContent className='pt-6'>
          <div className='space-y-4'>
            {data.map((item, index) => {
              const colors = getPriceColor(item.priceRange);
              const percentage = calculatePercentage(
                item.numberOfProducts,
                totalProducts,
              );
              const displayRange = getPriceRangeDisplay(item.priceRange);

              return (
                <div key={index} className='space-y-2'>
                  {/* Header */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={`p-2 rounded-lg ${colors.bg} ${colors.text} border-2`}>
                        <span className='text-xl'>{colors.icon}</span>
                      </div>
                      <div>
                        <div className='text-base font-semibold text-gray-900'>
                          {displayRange}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {formatNumber(item.numberOfProducts)} products
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span className='text-lg font-bold text-gray-900'>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className='space-y-1'>
                    <Progress
                      value={percentage}
                      className='h-4'
                      // @ts-ignore - adding custom color class
                      barClassName={colors.bar}
                    />
                    <div className='flex items-center justify-between text-xs text-gray-500'>
                      <span>Market share</span>
                      <span>{percentage.toFixed(2)}% of total inventory</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Price Tiers */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='border border-green-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0'>
              <div className='p-2 rounded-lg bg-green-100'>
                <span className='text-2xl'>💰</span>
              </div>
            </div>
            <div className='flex-1'>
              <h4 className='text-sm font-semibold text-green-900 mb-1'>
                Budget Products
              </h4>
              <p className='text-xs text-green-700'>
                {data
                  .filter((d) => {
                    const range = String(d.priceRange || "");
                    return (
                      range.includes("0-") ||
                      range.includes("100-") ||
                      range.includes("Under")
                    );
                  })
                  .reduce((sum, d) => sum + d.numberOfProducts, 0)
                  .toLocaleString()}{" "}
                products (
                {(
                  (data
                    .filter((d) => {
                      const range = String(d.priceRange || "");
                      return (
                        range.includes("0-") ||
                        range.includes("100-") ||
                        range.includes("Under")
                      );
                    })
                    .reduce((sum, d) => sum + d.numberOfProducts, 0) /
                    totalProducts) *
                  100
                ).toFixed(1)}
                %)
              </p>
            </div>
          </div>
        </div>

        <div className='border border-blue-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0'>
              <div className='p-2 rounded-lg bg-blue-100'>
                <span className='text-2xl'>💵</span>
              </div>
            </div>
            <div className='flex-1'>
              <h4 className='text-sm font-semibold text-blue-900 mb-1'>
                Mid-Range Products
              </h4>
              <p className='text-xs text-blue-700'>
                {data
                  .filter((d) => {
                    const range = String(d.priceRange || "");
                    return (
                      range.includes("500-") ||
                      range.includes("100-") ||
                      range.includes("200")
                    );
                  })
                  .reduce((sum, d) => sum + d.numberOfProducts, 0)
                  .toLocaleString()}{" "}
                products (
                {(
                  (data
                    .filter((d) => {
                      const range = String(d.priceRange || "");
                      return (
                        range.includes("500-") ||
                        range.includes("100-") ||
                        range.includes("200")
                      );
                    })
                    .reduce((sum, d) => sum + d.numberOfProducts, 0) /
                    totalProducts) *
                  100
                ).toFixed(1)}
                %)
              </p>
            </div>
          </div>
        </div>

        <div className='border border-purple-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0'>
              <div className='p-2 rounded-lg bg-purple-100'>
                <span className='text-2xl'>💎</span>
              </div>
            </div>
            <div className='flex-1'>
              <h4 className='text-sm font-semibold text-purple-900 mb-1'>
                Premium Products
              </h4>
              <p className='text-xs text-purple-700'>
                {data
                  .filter((d) => {
                    const range = String(d.priceRange || "");
                    return range.includes("1000") || range.includes("500+");
                  })
                  .reduce((sum, d) => sum + d.numberOfProducts, 0)
                  .toLocaleString()}{" "}
                products (
                {(
                  (data
                    .filter((d) => {
                      const range = String(d.priceRange || "");
                      return range.includes("1000") || range.includes("500+");
                    })
                    .reduce((sum, d) => sum + d.numberOfProducts, 0) /
                    totalProducts) *
                  100
                ).toFixed(1)}
                %)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceDistributionChart;
