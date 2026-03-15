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
import { Clock, Sparkles, Calendar, TrendingUp } from "lucide-react";
import { RecentlyAddedProduct } from "../../../../../api/inventoryReport";

interface RecentlyAddedTableProps {
  data: RecentlyAddedProduct[];
}

/**
 * Recently Added Table Component
 * Displays newest products added to the catalog with creation dates
 */
export const RecentlyAddedTable = ({ data }: RecentlyAddedTableProps) => {
  if (!data || data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='p-4 rounded-full bg-gray-50 mb-4'>
          <Sparkles className='w-12 h-12 text-gray-400' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-1'>
          No Recent Additions
        </h3>
        <p className='text-sm text-gray-600'>
          No products have been added recently
        </p>
      </div>
    );
  }

  // Calculate time-based statistics
  const now = new Date();
  const last24Hours = data.filter((item) => {
    const diffHours =
      Math.abs(now.getTime() - new Date(item.createdDate).getTime()) /
      (1000 * 60 * 60);
    return diffHours <= 24;
  }).length;

  const last7Days = data.filter((item) => {
    const diffDays =
      Math.abs(now.getTime() - new Date(item.createdDate).getTime()) /
      (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }).length;

  const last30Days = data.filter((item) => {
    const diffDays =
      Math.abs(now.getTime() - new Date(item.createdDate).getTime()) /
      (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  }).length;

  // Get relative time string
  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffSeconds < 60) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return `${diffMonths}mo ago`;
  };

  // Get time-based color
  const getTimeColor = (
    dateString: string,
  ): { bg: string; text: string; border: string } => {
    const diffHours =
      Math.abs(now.getTime() - new Date(dateString).getTime()) /
      (1000 * 60 * 60);

    if (diffHours <= 24) {
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
      };
    }
    if (diffHours <= 168) {
      // 7 days
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
      };
    }
    if (diffHours <= 720) {
      // 30 days
      return {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
      };
    }
    return {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
    };
  };

  // Get recency badge
  const getRecencyBadge = (dateString: string) => {
    const diffHours =
      Math.abs(now.getTime() - new Date(dateString).getTime()) /
      (1000 * 60 * 60);

    if (diffHours <= 24) {
      return (
        <Badge
          variant='outline'
          className='bg-green-50 text-green-700 border-green-200 text-xs'>
          New
        </Badge>
      );
    }
    if (diffHours <= 168) {
      return (
        <Badge
          variant='outline'
          className='bg-blue-50 text-blue-700 border-blue-200 text-xs'>
          Recent
        </Badge>
      );
    }
    if (diffHours <= 720) {
      return (
        <Badge
          variant='outline'
          className='bg-purple-50 text-purple-700 border-purple-200 text-xs'>
          This Month
        </Badge>
      );
    }
    return (
      <Badge
        variant='outline'
        className='bg-gray-50 text-gray-700 border-gray-200 text-xs'>
        Older
      </Badge>
    );
  };

  // Sort data by creation date (newest first)
  const sortedData = [...data].sort(
    (a, b) =>
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
  );

  // Calculate average age
  const avgAgeHours =
    data.reduce((sum, item) => {
      return (
        sum +
        Math.abs(now.getTime() - new Date(item.createdDate).getTime()) /
          (1000 * 60 * 60)
      );
    }, 0) / data.length;

  return (
    <div className='space-y-4'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card className='border border-gray-200 ' >
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2'>Total New Products</p>
              <div className='flex items-center justify-center gap-2 mb-1'>
                <Sparkles className='h-8 w-8 text-indigo-600' />
                <p className='text-xl font-bold text-gray-900'>{data.length}</p>
              </div>
              <p className='text-sm text-gray-500 mt-1'>recently added</p>
            </div>
          </CardContent>
        </Card>

        <Card className='border border-gray-200'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2'>Last 24 Hours</p>
              <p className='text-xl font-bold text-green-600'>{last24Hours}</p>
              <p className='text-sm text-gray-500 mt-1'>products added</p>
            </div>
          </CardContent>
        </Card>

        <Card className='border border-gray-200'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2'>This Week</p>
              <p className='text-xl font-bold text-blue-600'>{last7Days}</p>
              <p className='text-sm text-gray-500 mt-1'>products added</p>
            </div>
          </CardContent>
        </Card>

        <Card className='border border-gray-200'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2'>This Month</p>
              <p className='text-xl font-bold text-purple-600'>{last30Days}</p>
              <p className='text-sm text-gray-500 mt-1'>products added</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className='rounded-md border border-gray-200 max-h-[40vh] overflow-y-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-gray-50 hover:bg-gray-50'>
              <TableHead className='w-[15%] font-semibold text-gray-900'>
                Product Name
              </TableHead>
              <TableHead className='w-[25%] font-semibold text-gray-900'>
                Created Date
              </TableHead>
              <TableHead className='w-[15%] font-semibold text-gray-900 text-center'>
                Time Elapsed
              </TableHead>
              <TableHead className='w-[10%] font-semibold text-gray-900 text-center'>
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((product, index) => {
              const timeColor = getTimeColor(product.createdDate);
              const relativeTime = getRelativeTime(product.createdDate);

              return (
                <TableRow
                  key={index}
                  className={`hover:bg-gray-50 transition-colors ${
                    index < 3
                      ? "bg-gradient-to-r from-green-50/30 to-transparent"
                      : ""
                  }`}>
                  <TableCell className='font-medium text-gray-900'>
                    <div className='flex items-center gap-2'>
                      {index === 0 && (
                        <div className='flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold text-xs'>
                          1
                        </div>
                      )}
                      <span className='truncate max-w-[280px]'>
                        {product.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-sm text-gray-600'>
                      {new Date(product.createdDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    <div className='space-y-1'>
                      <div
                        className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-bold text-sm ${timeColor.bg} ${timeColor.text} ${timeColor.border}`}>
                        {relativeTime}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    {getRecencyBadge(product.createdDate)}
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
              <Clock className='h-4 w-4 inline mr-1' />
              Oldest Addition:{" "}
              <span className='font-bold text-green-900'>
                {sortedData.length > 0
                  ? new Date(
                      sortedData[sortedData.length - 1].createdDate,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "N/A"}
              </span>
            </span>
            <span className='text-green-700'>
              Avg Age:{" "}
              <span className='font-bold text-green-900'>
                {avgAgeHours < 24
                  ? `${Math.floor(avgAgeHours)}h`
                  : avgAgeHours < 720
                    ? `${Math.floor(avgAgeHours / 24)}d`
                    : `${Math.floor(avgAgeHours / 720)}mo`}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Activity Insights */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='border border-green-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0'>
              <div className='p-2 rounded-lg bg-green-100'>
                <TrendingUp className='h-5 w-5 text-green-600' />
              </div>
            </div>
            <div className='flex-1'>
              <h4 className='text-sm font-semibold text-green-900 mb-1'>
                Addition Rate
              </h4>
              <p className='text-xs text-green-700'>
                {last7Days > 0
                  ? `${(last7Days / 7).toFixed(1)} products/day average this week`
                  : "No additions this week"}
              </p>
            </div>
          </div>
        </div>

        <div className='border border-blue-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0'>
              <div className='p-2 rounded-lg bg-blue-100'>
                <Calendar className='h-5 w-5 text-blue-600' />
              </div>
            </div>
            <div className='flex-1'>
              <h4 className='text-sm font-semibold text-blue-900 mb-1'>
                Monthly Activity
              </h4>
              <p className='text-xs text-blue-700'>
                {last30Days} products added in the last 30 days (
                {last30Days > 0 ? ((last30Days / 30) * 100).toFixed(0) : 0}% of
                total)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentlyAddedTable;
