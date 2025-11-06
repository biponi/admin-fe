import React, { useEffect, useState } from "react";
import { useAdminAudit } from "../../../hooks/useAdminAudit";
import { DashboardOverviewResponse } from "../../../api/adminAudit";
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
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useToast } from "../../../components/ui/use-toast";
import { UserPerformanceCard } from "./UserPerformanceCard";

dayjs.extend(relativeTime);

/**
 * Admin Audit Dashboard Component with shadcn/ui
 */
export const AuditDashboard: React.FC = () => {
  const { toast } = useToast();
  const { fetchDashboard, isLoading, error } = useAdminAudit();
  const [dashboardData, setDashboardData] =
    useState<DashboardOverviewResponse | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  });

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line
  }, [dateRange]);

  const loadDashboard = async () => {
    const data = await fetchDashboard({
      startDate: new Date(dateRange.startDate).toISOString(),
      endDate: new Date(dateRange.endDate).toISOString(),
    });

    if (data) {
      setDashboardData(data);
    }
  };

  if (isLoading && !dashboardData) {
    return (
      <div className='space-y-6'>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className='h-4 w-32' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-8 w-20' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertDescription>Error: {error}</AlertDescription>
      </Alert>
    );
  }

  if (!dashboardData) {
    return (
      <Alert>
        <AlertDescription>No data available</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-6 mx-2 md:container'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>Audit Dashboard</h2>
          <p className='text-muted-foreground'>System-wide activity overview</p>
        </div>
        <div className='flex gap-2 items-center'>
          <input
            type='datetime-local'
            value={dayjs(dateRange.startDate).format("YYYY-MM-DDTHH:mm")}
            onChange={(e) =>
              setDateRange({ ...dateRange, startDate: e.target.value })
            }
            className='px-3 py-2 border rounded-md text-sm'
          />
          <span className='text-sm text-muted-foreground'>to</span>
          <input
            type='datetime-local'
            value={dayjs(dateRange.endDate).format("YYYY-MM-DDTHH:mm")}
            onChange={(e) => {
              const endOfDay = dayjs(e.target.value).endOf("day").toISOString();
              setDateRange({ ...dateRange, endDate: endOfDay });
            }}
            className='px-3 py-2 border rounded-md text-sm'
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Order Operations
            </CardTitle>
            <ShoppingCart className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {(dashboardData.orderAudits?.totalAudits || 0).toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              {dashboardData.orderAudits?.uniqueOrdersCount || 0} unique orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Stock Adjustments
            </CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {(
                dashboardData.productAdjustments?.totalAdjustments || 0
              ).toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              {dashboardData.productAdjustments?.uniqueProductsCount || 0}{" "}
              products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {dashboardData.orderAudits?.uniqueUsersCount || 0}
            </div>
            <p className='text-xs text-muted-foreground'>
              Performing operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Net Stock</CardTitle>
            {(dashboardData.productAdjustments?.totalAdded || 0) -
              (dashboardData.productAdjustments?.totalRemoved || 0) >
            0 ? (
              <TrendingUp className='h-4 w-4 text-green-600' />
            ) : (
              <TrendingDown className='h-4 w-4 text-red-600' />
            )}
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {(dashboardData.productAdjustments?.totalAdded || 0) -
                (dashboardData.productAdjustments?.totalRemoved || 0) >
              0
                ? "+"
                : ""}
              {(
                (dashboardData.productAdjustments?.totalAdded || 0) -
                (dashboardData.productAdjustments?.totalRemoved || 0)
              ).toLocaleString()}
            </div>
            <div className='flex gap-2 text-xs text-muted-foreground mt-1'>
              <span className='text-green-600'>
                +{dashboardData.productAdjustments?.totalAdded || 0}
              </span>
              <span>/</span>
              <span className='text-red-600'>
                -{dashboardData.productAdjustments?.totalRemoved || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operation Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Order Operations Breakdown</CardTitle>
          <CardDescription>Distribution of order activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <div className='flex items-center justify-between p-4 border rounded-lg'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Created
                </p>
                <p className='text-2xl font-bold text-green-600'>
                  {(
                    dashboardData.orderAudits?.operationCounts?.creates || 0
                  ).toLocaleString()}
                </p>
              </div>
              <Badge variant='outline' className='bg-green-50'>
                New
              </Badge>
            </div>

            <div className='flex items-center justify-between p-4 border rounded-lg'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Status Updates
                </p>
                <p className='text-2xl font-bold text-blue-600'>
                  {(
                    dashboardData.orderAudits?.operationCounts?.statusUpdates ||
                    0
                  ).toLocaleString()}
                </p>
              </div>
              <Badge variant='outline' className='bg-blue-50'>
                Status
              </Badge>
            </div>

            <div className='flex items-center justify-between p-4 border rounded-lg'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Payments
                </p>
                <p className='text-2xl font-bold text-amber-600'>
                  {(
                    dashboardData.orderAudits?.operationCounts
                      ?.paymentUpdates || 0
                  ).toLocaleString()}
                </p>
              </div>
              <Badge variant='outline' className='bg-amber-50'>
                Payment
              </Badge>
            </div>

            <div className='flex items-center justify-between p-4 border rounded-lg'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Bulk Actions
                </p>
                <p className='text-2xl font-bold text-purple-600'>
                  {(
                    dashboardData.orderAudits?.operationCounts?.bulkActions || 0
                  ).toLocaleString()}
                </p>
              </div>
              <Badge variant='outline' className='bg-purple-50'>
                Bulk
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Recent Order Actions</CardTitle>
            <CardDescription>Latest order activities</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.recentActivities?.orderActions?.length > 0 ? (
              <div className='space-y-4'>
                {dashboardData.recentActivities.orderActions
                  .slice(0, 5)
                  .map((action) => (
                    <div key={action.id} className='flex items-start gap-4'>
                      <div className='p-2 bg-blue-50 rounded-lg'>
                        <ShoppingCart className='h-4 w-4 text-blue-600' />
                      </div>
                      <div className='flex-1 space-y-1'>
                        <div className='flex items-center justify-between'>
                          <p className='text-sm font-medium'>
                            Order #{action.orderNumber}
                          </p>
                          <Badge
                            className=' cursor-pointer'
                            variant='outline'
                            onClick={() => {
                              if (action?.reason)
                                toast({
                                  title: `Order #${action?.orderNumber} (${action.performedBy.userName})`,
                                  description: action?.reason,
                                  variant: "alert",
                                });
                            }}>
                            {action.operation}
                          </Badge>
                        </div>
                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          <User className='h-3 w-3' />
                          <span>{action.performedBy.userName}</span>
                          <Clock className='h-3 w-3 ml-2' />
                          <span>
                            {dayjs(action.timestamps.createdAt).fromNow()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className='text-sm text-muted-foreground text-center py-8'>
                No recent actions
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Stock Adjustments</CardTitle>
            <CardDescription>Latest inventory changes</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.recentActivities?.productAdjustments?.length > 0 ? (
              <div className='space-y-4'>
                {dashboardData.recentActivities.productAdjustments
                  .slice(0, 5)
                  .map((adjustment) => (
                    <div key={adjustment.id} className='flex items-start gap-4'>
                      <div className='p-2 bg-purple-50 rounded-lg'>
                        <Package className='h-4 w-4 text-purple-600' />
                      </div>
                      <div className='flex-1 space-y-1'>
                        <div className='flex items-center justify-between'>
                          <p className='text-sm font-medium'>
                            {adjustment.productName}
                          </p>
                          <Badge
                            variant={
                              adjustment.quantityChange > 0
                                ? "default"
                                : "destructive"
                            }>
                            {adjustment.quantityChange > 0 ? "+" : ""}
                            {adjustment.quantityChange}
                          </Badge>
                          <Badge
                            className=' cursor-pointer'
                            variant='outline'
                            onClick={() => {
                              if (adjustment?.reason)
                                toast({
                                  title: `Product #${adjustment?.productName} Adjust By (${adjustment.adjustedBy.userName})`,
                                  description: adjustment?.reason,
                                  variant: "alert",
                                });
                            }}>
                            {adjustment.quantityChange > 0 ? "+" : ""}
                            {adjustment.quantityChange}
                          </Badge>
                        </div>
                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          <User className='h-3 w-3' />
                          <span>{adjustment.adjustedBy.userName}</span>
                          <Clock className='h-3 w-3 ml-2' />
                          <span>
                            {dayjs(adjustment.timestamps.createdAt).fromNow()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className='text-sm text-muted-foreground text-center py-8'>
                No recent adjustments
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Activity Chart */}
      {dashboardData.todayActivity &&
        dashboardData.todayActivity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Today's Activity</CardTitle>
              <CardDescription>Hourly distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex items-end justify-between gap-2 h-64'>
                {dashboardData.todayActivity.map((item) => {
                  const maxCount = Math.max(
                    ...dashboardData.todayActivity.map((d) => d.count),
                    1
                  );
                  const height = (item.count / maxCount) * 100;

                  return (
                    <div
                      key={item.hour}
                      className='flex-1 flex flex-col items-center gap-2'>
                      <div className='relative w-full flex items-end justify-center h-full'>
                        <div
                          className='w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-colors relative group'
                          style={{ height: `${height}%` }}>
                          <div className='absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <Badge variant='secondary'>{item.count}</Badge>
                          </div>
                        </div>
                      </div>
                      <span className='text-xs text-muted-foreground'>
                        {item.hour}:00
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

      {/* User Performance Overview */}
      <UserPerformanceCard
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
      />
    </div>
  );
};
