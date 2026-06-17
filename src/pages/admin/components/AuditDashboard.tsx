import React, { useEffect, useState } from "react";
import { useAdminAudit } from "../../../hooks/useAdminAudit";
import { DashboardOverviewResponse } from "../../../api/adminAudit";
import { Badge } from "../../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  Activity,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useToast } from "../../../components/ui/use-toast";
import { UserPerformanceCard } from "./UserPerformanceCard";

dayjs.extend(relativeTime);

/**
 * Admin Audit Dashboard Component with consistent theme
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
        <div className='flex items-center justify-center py-12'>
          <div className='flex flex-col items-center gap-4'>
            <div className='relative'>
              <div className='w-16 h-16 border-4 border-slate-200 rounded-full'></div>
              <div className='absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin'></div>
            </div>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-slate-900'>
                Loading Dashboard
              </h3>
              <p className='text-sm text-slate-500 mt-1'>
                Please wait while we gather the data...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-rose-50 border border-rose-200 rounded-xl p-4'>
        <p className='text-sm text-rose-700'>Error: {error}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className='bg-slate-50 border border-slate-200 rounded-xl p-4'>
        <p className='text-sm text-slate-600'>No data available</p>
      </div>
    );
  }

  return (
    <div className='container space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200'>
            <Activity className='h-5 w-5 text-white' />
          </div>
          <div>
            <h2 className='text-xl font-semibold text-slate-900 leading-tight'>
              Audit Dashboard
            </h2>
            <p className='text-sm text-slate-500 mt-0.5'>
              System-wide activity overview
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <input
            type='datetime-local'
            value={dayjs(dateRange.startDate).format("YYYY-MM-DDTHH:mm")}
            onChange={(e) =>
              setDateRange({ ...dateRange, startDate: e.target.value })
            }
            className='px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
          />
          <span className='text-sm text-slate-500'>to</span>
          <input
            type='datetime-local'
            value={dayjs(dateRange.endDate).format("YYYY-MM-DDTHH:mm")}
            onChange={(e) => {
              const endOfDay = dayjs(e.target.value).endOf("day").toISOString();
              setDateRange({ ...dateRange, endDate: endOfDay });
            }}
            className='px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
        {[
          {
            label: "Order Operations",
            value: (
              dashboardData.orderAudits?.totalAudits || 0
            ).toLocaleString(),
            accent: "text-indigo-600",
            bg: "bg-indigo-50",
            icon: ShoppingCart,
          },
          {
            label: "Stock Adjustments",
            value: (
              dashboardData.productAdjustments?.totalAdjustments || 0
            ).toLocaleString(),
            accent: "text-emerald-600",
            bg: "bg-emerald-50",
            icon: Package,
          },
          {
            label: "Active Users",
            value: dashboardData.orderAudits?.uniqueUsersCount || 0,
            accent: "text-amber-600",
            bg: "bg-amber-50",
            icon: Users,
          },
          {
            label: "Net Stock Change",
            value: `${
              (dashboardData.productAdjustments?.totalAdded || 0) -
                (dashboardData.productAdjustments?.totalRemoved || 0) >
              0
                ? "+"
                : ""
            }${(
              (dashboardData.productAdjustments?.totalAdded || 0) -
              (dashboardData.productAdjustments?.totalRemoved || 0)
            ).toLocaleString()}`,
            accent:
              (dashboardData.productAdjustments?.totalAdded || 0) -
                (dashboardData.productAdjustments?.totalRemoved || 0) >
              0
                ? "text-emerald-600"
                : "text-rose-600",
            bg:
              (dashboardData.productAdjustments?.totalAdded || 0) -
                (dashboardData.productAdjustments?.totalRemoved || 0) >
              0
                ? "bg-emerald-50"
                : "bg-rose-50",
            icon:
              (dashboardData.productAdjustments?.totalAdded || 0) -
                (dashboardData.productAdjustments?.totalRemoved || 0) >
              0
                ? TrendingUp
                : TrendingDown,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className='bg-white rounded-xl border border-slate-100 p-4 shadow-sm'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50'>
                  <Icon className='h-4 w-4 text-indigo-600' />
                </div>
                <div className='w-2 h-2 rounded-full bg-slate-200' />
              </div>
              <p
                className={`text-lg font-semibold ${stat.accent} leading-none mb-1`}>
                {stat.value}
              </p>
              <p className='text-xs text-slate-500'>{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Operation Breakdown */}
      <div className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden'>
        <div className='p-5 border-b border-slate-100'>
          <h3 className='text-lg font-semibold text-slate-900'>
            Order Operations Breakdown
          </h3>
          <p className='text-sm text-slate-500 mt-1'>
            Distribution of order activities
          </p>
        </div>
        <div className='p-5'>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            {[
              {
                label: "Created",
                value: (
                  dashboardData.orderAudits?.operationCounts?.creates || 0
                ).toLocaleString(),
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                badge: "bg-emerald-50 border-emerald-200 text-emerald-700",
              },
              {
                label: "Status Updates",
                value: (
                  dashboardData.orderAudits?.operationCounts?.statusUpdates || 0
                ).toLocaleString(),
                color: "text-blue-600",
                bg: "bg-blue-50",
                badge: "bg-blue-50 border-blue-200 text-blue-700",
              },
              {
                label: "Payments",
                value: (
                  dashboardData.orderAudits?.operationCounts?.paymentUpdates ||
                  0
                ).toLocaleString(),
                color: "text-amber-600",
                bg: "bg-amber-50",
                badge: "bg-amber-50 border-amber-200 text-amber-700",
              },
              {
                label: "Bulk Actions",
                value: (
                  dashboardData.orderAudits?.operationCounts?.bulkActions || 0
                ).toLocaleString(),
                color: "text-purple-600",
                bg: "bg-purple-50",
                badge: "bg-purple-50 border-purple-200 text-purple-700",
              },
            ].map((op) => (
              <div
                key={op.label}
                className='flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100'>
                <div>
                  <p className='text-xs text-slate-500 mb-1'>{op.label}</p>
                  <p className={`text-xl font-semibold ${op.color}`}>
                    {op.value}
                  </p>
                </div>
                <Badge className={op.badge} variant='outline'>
                  {op.label.slice(0, 4)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Order Actions */}
        <div className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden'>
          <div className='p-5 border-b border-slate-100'>
            <h3 className='text-lg font-semibold text-slate-900'>
              Recent Order Actions
            </h3>
            <p className='text-sm text-slate-500 mt-1'>
              Latest order activities
            </p>
          </div>
          <div className='p-5'>
            {dashboardData.recentActivities?.orderActions?.length > 0 ? (
              <div className='space-y-4'>
                {dashboardData.recentActivities.orderActions
                  .slice(0, 5)
                  .map((action) => (
                    <div
                      key={action.id}
                      className='flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0'>
                      <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 flex-shrink-0'>
                        <ShoppingCart className='h-4 w-4 text-indigo-600' />
                      </div>
                      <div className='flex-1 space-y-1 min-w-0'>
                        <div className='flex items-center justify-between gap-2'>
                          <p className='text-sm font-medium text-slate-900 truncate'>
                            Order #{action.orderNumber}
                          </p>
                          <Badge
                            className='cursor-pointer flex-shrink-0'
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
                        <div className='flex items-center gap-2 text-xs text-slate-500'>
                          {action.performedBy.userAvatar ? (
                            <Avatar className='h-5 w-5'>
                              <AvatarImage
                                src={action.performedBy.userAvatar}
                              />
                              <AvatarFallback className='text-xs'>
                                {action.performedBy.userName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <User className='h-3 w-3' />
                          )}
                          <span className='truncate'>
                            {action.performedBy.userName}
                          </span>
                          <Clock className='h-3 w-3 ml-2 flex-shrink-0' />
                          <span className='flex-shrink-0'>
                            {dayjs(action.timestamps.createdAt).fromNow()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className='text-center py-8'>
                <ShoppingCart className='w-12 h-12 mx-auto mb-3 text-slate-300' />
                <p className='text-sm text-slate-500'>No recent actions</p>
              </div>
            )}
          </div>
        </div>

        {/* Stock Adjustments */}
        <div className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden'>
          <div className='p-5 border-b border-slate-100'>
            <h3 className='text-lg font-semibold text-slate-900'>
              Recent Stock Adjustments
            </h3>
            <p className='text-sm text-slate-500 mt-1'>
              Latest inventory changes
            </p>
          </div>
          <div className='p-5'>
            {dashboardData.recentActivities?.productAdjustments?.length > 0 ? (
              <div className='space-y-4'>
                {dashboardData.recentActivities.productAdjustments
                  .slice(0, 5)
                  .map((adjustment) => (
                    <div
                      key={adjustment.id}
                      className='flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0'>
                      <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 flex-shrink-0'>
                        <Package className='h-4 w-4 text-indigo-600' />
                      </div>
                      <div className='flex-1 space-y-1 min-w-0'>
                        <div className='flex items-center justify-between gap-2'>
                          <p className='text-sm font-medium text-slate-900 truncate'>
                            {adjustment.productName}
                          </p>
                          <Badge
                            className={`cursor-pointer flex-shrink-0 ${
                              adjustment.quantityChange > 0
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
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
                        <div className='flex items-center gap-2 text-xs text-slate-500'>
                          {adjustment.adjustedBy.userAvatar ? (
                            <Avatar className='h-5 w-5'>
                              <AvatarImage
                                src={adjustment.adjustedBy.userAvatar}
                              />
                              <AvatarFallback className='text-xs'>
                                {adjustment.adjustedBy.userName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <User className='h-3 w-3' />
                          )}
                          <span className='truncate'>
                            {adjustment.adjustedBy.userName}
                          </span>
                          <Clock className='h-3 w-3 ml-2 flex-shrink-0' />
                          <span className='flex-shrink-0'>
                            {dayjs(adjustment.timestamps.createdAt).fromNow()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className='text-center py-8'>
                <Package className='w-12 h-12 mx-auto mb-3 text-slate-300' />
                <p className='text-sm text-slate-500'>No recent adjustments</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's Activity Chart */}
      {dashboardData.todayActivity &&
        dashboardData.todayActivity.length > 0 && (
          <div className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden'>
            <div className='p-5 border-b border-slate-100'>
              <h3 className='text-lg font-semibold text-slate-900'>
                Today's Activity
              </h3>
              <p className='text-sm text-slate-500 mt-1'>Hourly distribution</p>
            </div>
            <div className='p-5'>
              <div className='flex items-end justify-between gap-2 h-64'>
                {dashboardData.todayActivity.map((item) => {
                  const maxCount = Math.max(
                    ...dashboardData.todayActivity.map((d) => d.count),
                    1,
                  );
                  const height = (item.count / maxCount) * 100;

                  return (
                    <div
                      key={item.hour}
                      className='flex-1 flex flex-col items-center gap-2'>
                      <div className='relative w-full flex items-end justify-center h-full'>
                        <div
                          className='w-full bg-indigo-500 rounded-t-md hover:bg-indigo-600 transition-colors relative group'
                          style={{ height: `${height}%` }}>
                          <div className='absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <Badge
                              variant='secondary'
                              className='bg-white border border-slate-200'>
                              {item.count}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <span className='text-xs text-slate-500'>
                        {item.hour}:00
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      {/* User Performance Overview */}
      <UserPerformanceCard
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
      />
    </div>
  );
};
