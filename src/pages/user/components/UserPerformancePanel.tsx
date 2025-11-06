import React from "react";
import { UserPerformanceDetailResponse } from "../../../api/adminAudit";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import {
  Package,
  ShoppingCart,
  BarChart3,
  Activity,
  Calendar,
  Clock,
  Award,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface UserPerformancePanelProps {
  isLoading: boolean;
  error: any;
  userDetail: UserPerformanceDetailResponse | null;
}

export const UserPerformancePanel: React.FC<UserPerformancePanelProps> = ({
  error,
  isLoading,
  userDetail,
}) => {
  if (isLoading && !userDetail) {
    return (
      <div className='space-y-4'>
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-48' />
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-3'>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className='h-24' />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <Alert variant='destructive'>
            <AlertDescription>Error: {error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!userDetail) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>No performance data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Performance Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Award className='w-5 h-5 text-yellow-500' />
            Performance Overview
          </CardTitle>
          <CardDescription>
            Your activity from{" "}
            {dayjs(userDetail.summary.dateRange.startDate).format(
              "MMM DD, YYYY"
            )}{" "}
            to{" "}
            {dayjs(userDetail.summary.dateRange.endDate).format("MMM DD, YYYY")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className='grid gap-4 md:grid-cols-3'>
            {/* Total Activities */}
            <div className='relative p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 overflow-hidden group hover:shadow-lg transition-all'>
              <div className='absolute top-0 right-0 w-24 h-24 bg-blue-200/30 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform' />
              <div className='relative'>
                <div className='flex items-center justify-between mb-2'>
                  <p className='text-sm font-medium text-blue-700'>
                    Total Activities
                  </p>
                  <Activity className='w-5 h-5 text-blue-600' />
                </div>
                <p className='text-3xl font-bold text-blue-900'>
                  {(
                    userDetail.summary.totalOrderActions +
                    userDetail.summary.totalProductAdjustments
                  ).toLocaleString()}
                </p>
                <p className='text-xs text-blue-600 mt-1'>
                  All time operations
                </p>
              </div>
            </div>

            {/* Order Actions */}
            <div className='relative p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 overflow-hidden group hover:shadow-lg transition-all'>
              <div className='absolute top-0 right-0 w-24 h-24 bg-purple-200/30 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform' />
              <div className='relative'>
                <div className='flex items-center justify-between mb-2'>
                  <p className='text-sm font-medium text-purple-700'>
                    Order Actions
                  </p>
                  <ShoppingCart className='w-5 h-5 text-purple-600' />
                </div>
                <p className='text-3xl font-bold text-purple-900'>
                  {userDetail.summary.totalOrderActions.toLocaleString()}
                </p>
                <p className='text-xs text-purple-600 mt-1'>
                  {userDetail.orderOperations.breakdown.length} operation types
                </p>
              </div>
            </div>

            {/* Product Adjustments */}
            <div className='relative p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 overflow-hidden group hover:shadow-lg transition-all'>
              <div className='absolute top-0 right-0 w-24 h-24 bg-green-200/30 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform' />
              <div className='relative'>
                <div className='flex items-center justify-between mb-2'>
                  <p className='text-sm font-medium text-green-700'>
                    Stock Adjustments
                  </p>
                  <Package className='w-5 h-5 text-green-600' />
                </div>
                <p className='text-3xl font-bold text-green-900'>
                  {userDetail.summary.totalProductAdjustments.toLocaleString()}
                </p>
                <p className='text-xs text-green-600 mt-1'>
                  {userDetail.productAdjustments.typeBreakdown.length}{" "}
                  adjustment types
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operations Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ShoppingCart className='w-5 h-5 text-purple-600' />
            Order Operations Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            {userDetail.orderOperations.breakdown.map((op) => (
              <div
                key={op.operation}
                className='p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all'>
                <div className='flex items-center justify-between mb-2'>
                  <Badge variant='secondary' className='text-xs capitalize'>
                    {op.operation.replace(/_/g, " ")}
                  </Badge>
                  <span className='text-2xl font-bold text-purple-600'>
                    {op.count}
                  </span>
                </div>
                <div className='flex items-center text-xs text-gray-500 mt-2'>
                  <Clock className='w-3 h-3 mr-1' />
                  {dayjs(op.lastPerformed).fromNow()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Adjustments Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Package className='w-5 h-5 text-green-600' />
            Product Adjustments Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 sm:grid-cols-3'>
            {userDetail.productAdjustments.typeBreakdown.map((type) => (
              <div
                key={type.type}
                className='p-5 bg-gradient-to-br from-white to-gray-50 rounded-lg border-2 border-gray-200 hover:border-green-300 hover:shadow-md transition-all'>
                <div className='flex items-center justify-between mb-3'>
                  <Badge
                    variant={
                      type.type === "add"
                        ? "default"
                        : type.type === "remove"
                        ? "destructive"
                        : "secondary"
                    }
                    className='text-sm capitalize'>
                    {type.type}
                  </Badge>
                  <span className='text-2xl font-bold'>{type.count}</span>
                </div>
                <div className='text-sm'>
                  <span className='text-gray-600'>Quantity Change: </span>
                  <span
                    className={`font-bold ${
                      type.totalQuantityChange > 0
                        ? "text-green-600"
                        : type.totalQuantityChange < 0
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}>
                    {type.totalQuantityChange > 0 ? "+" : ""}
                    {type.totalQuantityChange.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Trend Chart */}
      {userDetail.activityTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='w-5 h-5 text-blue-600' />
              Activity Trend
            </CardTitle>
            <CardDescription>Last 14 days performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {userDetail.activityTrend.slice(-14).map((trend) => {
                const totalActivity =
                  trend.orderActions + trend.productAdjustments;
                const maxActivity = Math.max(
                  ...userDetail.activityTrend.map(
                    (t) => t.orderActions + t.productAdjustments
                  ),
                  1
                );
                const orderPercent = (trend.orderActions / maxActivity) * 100;
                const adjustmentPercent =
                  (trend.productAdjustments / maxActivity) * 100;

                return (
                  <div key={trend.date} className='space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <div className='flex items-center gap-2'>
                        <Calendar className='w-4 h-4 text-gray-400' />
                        <span className='font-medium text-gray-700'>
                          {dayjs(trend.date).format("ddd, MMM DD")}
                        </span>
                      </div>
                      <div className='flex items-center gap-4'>
                        <span className='text-xs text-gray-500'>
                          {totalActivity}{" "}
                          {totalActivity === 1 ? "activity" : "activities"}
                        </span>
                        <Badge
                          variant={totalActivity > 0 ? "default" : "secondary"}
                          className='text-xs'>
                          {totalActivity}
                        </Badge>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden'>
                        <div className='flex h-full'>
                          <div
                            className='bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center transition-all'
                            style={{ width: `${orderPercent}%` }}
                            title={`${trend.orderActions} order actions`}>
                            {trend.orderActions > 0 && (
                              <span className='text-xs font-bold text-white px-2'>
                                {trend.orderActions}
                              </span>
                            )}
                          </div>
                          <div
                            className='bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center transition-all'
                            style={{ width: `${adjustmentPercent}%` }}
                            title={`${trend.productAdjustments} adjustments`}>
                            {trend.productAdjustments > 0 && (
                              <span className='text-xs font-bold text-white px-2'>
                                {trend.productAdjustments}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className='flex items-center justify-center gap-6 pt-4 mt-4 border-t'>
              <div className='flex items-center gap-2'>
                <div className='w-4 h-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded' />
                <span className='text-sm text-gray-600'>Order Actions</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded' />
                <span className='text-sm text-gray-600'>Stock Adjustments</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
