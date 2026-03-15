import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import { Star } from "lucide-react";
import {
  generateStarRating,
  getRatingColor,
} from "../../../../../utils/inventoryReportUtils";
import { TopRatedProduct } from "../../../../../api/inventoryReport";

interface TopRatedTableProps {
  data: TopRatedProduct[];
}

/**
 * Top Rated Products Table Component
 * Displays highest customer-rated products with star ratings
 */
export const TopRatedTable = ({ data }: TopRatedTableProps) => {
  if (!data || data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='p-4 rounded-full bg-gray-50 mb-4'>
          <Star className='w-12 h-12 text-gray-400 fill-gray-200' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-1'>
          No Ratings Yet
        </h3>
        <p className='text-sm text-gray-600'>
          No products have been rated by customers
        </p>
      </div>
    );
  }

  // Calculate statistics
  const avgRating = data.reduce((sum, p) => sum + p.rating, 0) / data.length;
  const totalReviews = data.reduce((sum, p) => sum + p.totalReviews, 0);
  const perfectRatings = data.filter((p) => p.rating >= 4.5).length;

  // Get ranking badge based on position
  const getRankingBadge = (index: number) => {
    if (index === 0) {
      return (
        <div className='flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold text-xs shadow-md'>
          <Star className='h-4 w-4 fill-white' />
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className='flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-white font-bold text-sm shadow-md'>
          2
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className='flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white font-bold text-sm shadow-md'>
          3
        </div>
      );
    }
    return (
      <div className='flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-semibold text-xs'>
        {index + 1}
      </div>
    );
  };

  return (
    <div className='space-y-4'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-amber-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Highest Rating</p>
            <div className='flex items-center justify-center gap-1'>
              <Star className='h-6 w-6 text-yellow-500 fill-yellow-500' />
              <p className='text-2xl font-bold text-yellow-700'>
                {data[0]?.rating.toFixed(1) || "0.0"}
              </p>
            </div>
          </div>
        </div>

        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Perfect Ratings</p>
            <p className='text-2xl font-bold text-green-700'>
              {perfectRatings} / {data.length}
            </p>
          </div>
        </div>

        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Total Reviews</p>
            <p className='text-2xl font-bold text-blue-700'>
              {totalReviews.toLocaleString()}
            </p>
          </div>
        </div>

        <div className='border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Avg Rating</p>
            <div className='flex items-center justify-center gap-1'>
              <Star className='h-5 w-5 text-purple-500 fill-purple-500' />
              <p className='text-2xl font-bold text-purple-700'>
                {avgRating.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='rounded-md border border-gray-200 max-h-[60vh] overflow-y-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-gray-50 hover:bg-gray-50'>
              <TableHead className='w-[10%] font-semibold text-gray-900 text-center'>
                Rank
              </TableHead>
              <TableHead className='w-[20%] font-semibold text-gray-900'>
                Product Name
              </TableHead>
              <TableHead className='w-[20%] font-semibold text-gray-900 text-center'>
                Rating
              </TableHead>
              <TableHead className='w-[15%] font-semibold text-gray-900 text-center'>
                Reviews
              </TableHead>
              <TableHead className='w-[15%] font-semibold text-gray-900 text-center'>
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product, index) => {
              const ratingColor = getRatingColor(product.rating);
              const stars = generateStarRating(product.rating);

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
                  <TableCell className='font-medium text-gray-900'>
                    <div className='flex items-center gap-2'>
                      <span className='truncate max-w-[280px] uppercase'>
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
                  <TableCell className='text-center'>
                    <div className='space-y-1'>
                      <div className={`text-3xl font-bold ${ratingColor}`}>
                        {product.rating.toFixed(1)}
                      </div>
                      <div className='text-yellow-500 text-sm tracking-wider'>
                        {stars}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    <div className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200'>
                      <Star className='h-4 w-4 text-indigo-600 fill-indigo-600' />
                      <span className='font-semibold text-indigo-900'>
                        {product.totalReviews.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    <div
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                        product.rating >= 4.5
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : product.rating >= 4.0
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : product.rating >= 3.5
                              ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                              : "bg-gray-50 text-gray-700 border border-gray-200"
                      }`}>
                      {product.rating >= 4.5
                        ? "Excellent"
                        : product.rating >= 4.0
                          ? "Very Good"
                          : product.rating >= 3.5
                            ? "Good"
                            : "Average"}
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
              <Star className='h-4 w-4 inline mr-1 fill-yellow-600' />
              Top Rated:{" "}
              <span className='font-bold text-yellow-900'>
                {data[0]?.name || "N/A"}
              </span>
            </span>
            <span className='text-yellow-700'>
              Quality Score:{" "}
              <span className='font-bold text-yellow-900'>
                {perfectRatings > 0
                  ? `${((perfectRatings / data.length) * 100).toFixed(1)}% excellent`
                  : "N/A"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopRatedTable;
