import { Progress } from "../../../../../components/ui/progress";
import { Badge } from "../../../../../components/ui/badge";
import { Card, CardContent } from "../../../../../components/ui/card";
import { Star, BarChart3 } from "lucide-react";
import {
  formatNumber,
  calculatePercentage,
  calculateAverageRating,
} from "../../../../../utils/inventoryReportUtils";
import { RatingDistribution } from "../../../../../api/inventoryReport";

interface RatingDistributionChartProps {
  data: RatingDistribution[];
}

/**
 * Rating Distribution Chart Component
 * Displays customer ratings breakdown with visual bar indicators
 */
export const RatingDistributionChart = ({
  data,
}: RatingDistributionChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='p-4 rounded-full bg-gray-50 mb-4'>
          <BarChart3 className='w-12 h-12 text-gray-400' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-1'>
          No Rating Data
        </h3>
        <p className='text-sm text-gray-600'>
          Unable to generate rating distribution
        </p>
      </div>
    );
  }

  // Calculate totals
  const totalVotes = data.reduce((sum, item) => sum + item.totalVotes, 0);
  const avgRating = calculateAverageRating(data);

  // Sort data by rating (highest first)
  const sortedData = [...data].sort((a, b) => {
    const ratingA = parseInt(a.rating);
    const ratingB = parseInt(b.rating);
    return ratingB - ratingA;
  });

  // Get color based on rating
  const getRatingColor = (
    ratingStr: string,
  ): { bg: string; text: string; bar: string } => {
    const rating = parseInt(ratingStr);
    if (rating === 5) {
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        bar: "bg-green-500",
      };
    }
    if (rating === 4) {
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        bar: "bg-blue-500",
      };
    }
    if (rating === 3) {
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        bar: "bg-yellow-500",
      };
    }
    if (rating === 2) {
      return {
        bg: "bg-orange-50",
        text: "text-orange-700",
        bar: "bg-orange-500",
      };
    }
    return {
      bg: "bg-red-50",
      text: "text-red-700",
      bar: "bg-red-500",
    };
  };

  // Generate star display
  const generateStars = (rating: string): string => {
    const num = parseInt(rating);
    return "★".repeat(num) + "☆".repeat(5 - num);
  };

  return (
    <div className='space-y-4'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='border border-gray-200'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2'>Average Rating</p>
              <div className='flex items-center justify-center gap-2 mb-1'>
                <Star className='h-8 w-8 text-yellow-500 fill-yellow-500' />
                <p className='text-4xl font-bold text-gray-900'>
                  {avgRating.toFixed(1)}
                </p>
              </div>
              <p className='text-sm text-gray-500 mt-1'>out of 5.0</p>
            </div>
          </CardContent>
        </Card>

        <Card className='border border-gray-200'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2'>Total Reviews</p>
              <p className='text-4xl font-bold text-indigo-600'>
                {formatNumber(totalVotes)}
              </p>
              <p className='text-sm text-gray-500 mt-1'>customer ratings</p>
            </div>
          </CardContent>
        </Card>

        <Card className='border border-gray-200'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2'>Rating Levels</p>
              <p className='text-4xl font-bold text-green-600'>{data.length}</p>
              <p className='text-sm text-gray-500 mt-1'>different ratings</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Chart */}
      <Card className='border border-gray-200'>
        <CardContent className='pt-6'>
          <div className='space-y-4'>
            {sortedData.map((item, index) => {
              const colors = getRatingColor(item.rating);
              const percentage = calculatePercentage(
                item.totalVotes,
                totalVotes,
              );
              const stars = generateStars(item.rating);

              return (
                <div key={index} className='space-y-2'>
                  {/* Header */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <Badge
                        variant='outline'
                        className={`${colors.bg} ${colors.text} border-2 font-semibold text-sm py-1.5 px-3 min-w-[80px]`}>
                        <span className='text-yellow-600 mr-1.5 tracking-widest'>
                          {stars}
                        </span>
                        <span className='font-bold'>{item.rating}</span>
                      </Badge>
                      <span className='text-sm text-gray-600'>
                        {formatNumber(item.totalVotes)} reviews
                      </span>
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
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='border border-green-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0'>
              <div className='p-2 rounded-lg bg-green-100'>
                <Star className='h-5 w-5 text-green-600 fill-green-600' />
              </div>
            </div>
            <div className='flex-1'>
              <h4 className='text-sm font-semibold text-green-900 mb-1'>
                Positive Ratings
              </h4>
              <p className='text-xs text-green-700'>
                {data
                  .filter((d) => parseInt(d.rating) >= 4)
                  .reduce((sum, d) => sum + d.totalVotes, 0)
                  .toLocaleString()}{" "}
                reviews (
                {(
                  (data
                    .filter((d) => parseInt(d.rating) >= 4)
                    .reduce((sum, d) => sum + d.totalVotes, 0) /
                    totalVotes) *
                  100
                ).toFixed(1)}
                %)
              </p>
            </div>
          </div>
        </div>

        <div className='border border-red-200 rounded-lg p-4 bg-gradient-to-br from-red-50 to-rose-50'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0'>
              <div className='p-2 rounded-lg bg-red-100'>
                <Star className='h-5 w-5 text-red-600 fill-red-600' />
              </div>
            </div>
            <div className='flex-1'>
              <h4 className='text-sm font-semibold text-red-900 mb-1'>
                Critical Ratings
              </h4>
              <p className='text-xs text-red-700'>
                {data
                  .filter((d) => parseInt(d.rating) <= 2)
                  .reduce((sum, d) => sum + d.totalVotes, 0)
                  .toLocaleString()}{" "}
                reviews (
                {(
                  (data
                    .filter((d) => parseInt(d.rating) <= 2)
                    .reduce((sum, d) => sum + d.totalVotes, 0) /
                    totalVotes) *
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

export default RatingDistributionChart;
