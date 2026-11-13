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
  SquareActivity,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useToast } from "../../../components/ui/use-toast";
import { UserPerformanceCard } from "./UserPerformanceCard";
import { AuditContributorsGraph } from "./AuditContributorsGraph";
import { CombinedActivityCard } from "./CombinedActivityCard";
import { claude } from "../../../lib/claude";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  MobilePage,
  MobileStatRow,
  MobileStatTile,
  MobileListCard,
  MobileStaggeredList,
  MobileSkeletonList,
  MobileEmptyState,
} from "@/components/mobile";
import { PageHeader } from "../../../components/PageHeader";

dayjs.extend(relativeTime);

/**
 * Admin Audit Dashboard Component with consistent theme
 */
export const AuditDashboard: React.FC = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
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
    if (isMobile) {
      return (
        <MobilePage title='Audit Dashboard' back>
          <div className='space-y-3 px-4 pt-4'>
            <MobileSkeletonList count={4} />
          </div>
        </MobilePage>
      );
    }
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-center py-12'>
          <div className='flex flex-col items-center gap-4'>
            <div className={claude.spinner + " h-10 w-10"} />
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-[#141413]'>
                Loading Dashboard
              </h3>
              <p className='text-[13px] text-[#8A877D] mt-1'>
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
      <div className={claude.panel + " rounded-xl p-4"}>
        <p className='text-sm text-[#57554D]'>No data available</p>
      </div>
    );
  }

  // ── Mobile: Material dashboard shell ──
  if (isMobile) {
    const stats = [
      {
        label: "Order Ops",
        value: (dashboardData.orderAudits?.totalAudits || 0).toLocaleString(),
        icon: <ShoppingCart className='h-4 w-4' />,
      },
      {
        label: "Stock Adj.",
        value: (
          dashboardData.productAdjustments?.totalAdjustments || 0
        ).toLocaleString(),
        icon: <Package className='h-4 w-4' />,
      },
      {
        label: "Active Users",
        value: String(dashboardData.orderAudits?.uniqueUsersCount || 0),
        icon: <Users className='h-4 w-4' />,
      },
      {
        label: "Net Stock",
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
        tone:
          (dashboardData.productAdjustments?.totalAdded || 0) -
            (dashboardData.productAdjustments?.totalRemoved || 0) >
          0
            ? "bg-emerald-100 text-emerald-700"
            : "bg-rose-100 text-rose-700",
        icon:
          (dashboardData.productAdjustments?.totalAdded || 0) -
            (dashboardData.productAdjustments?.totalRemoved || 0) >
          0 ? (
            <TrendingUp className='h-4 w-4' />
          ) : (
            <TrendingDown className='h-4 w-4' />
          ),
      },
    ];
    const orderOps = [
      {
        label: "Created",
        value: (
          dashboardData.orderAudits?.operationCounts?.creates || 0
        ).toLocaleString(),
      },
      {
        label: "Status Updates",
        value: (
          dashboardData.orderAudits?.operationCounts?.statusUpdates || 0
        ).toLocaleString(),
      },
      {
        label: "Payments",
        value: (
          dashboardData.orderAudits?.operationCounts?.paymentUpdates || 0
        ).toLocaleString(),
      },
      {
        label: "Bulk Actions",
        value: (
          dashboardData.orderAudits?.operationCounts?.bulkActions || 0
        ).toLocaleString(),
      },
    ];
    const orderActions = dashboardData.recentActivities?.orderActions ?? [];
    const productAdjustments =
      dashboardData.recentActivities?.productAdjustments ?? [];

    return (
      <MobilePage
        title='Audit Dashboard'
        icon={<SquareActivity className='h-5 w-5 text-primary' />}
        subtitle='System-wide activity overview'
        back>
        <div className='space-y-4 px-4 pt-3 pb-6'>
          {/* Date range */}
          <div className='rounded-2xl border bg-card p-3 space-y-2'>
            <p className='text-[11px] font-semibold uppercase tracking-widest text-muted-foreground'>
              Date range
            </p>
            <input
              type='datetime-local'
              value={dayjs(dateRange.startDate).format("YYYY-MM-DDTHH:mm")}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className='w-full px-3 py-2 text-[13px] border rounded-lg bg-background focus:outline-none focus:border-primary'
            />
            <input
              type='datetime-local'
              value={dayjs(dateRange.endDate).format("YYYY-MM-DDTHH:mm")}
              onChange={(e) => {
                const endOfDay = dayjs(e.target.value)
                  .endOf("day")
                  .toISOString();
                setDateRange({ ...dateRange, endDate: endOfDay });
              }}
              className='w-full px-3 py-2 text-[13px] border rounded-lg bg-background focus:outline-none focus:border-primary'
            />
          </div>

          <MobileStatRow>
            {stats.map((s) => (
              <MobileStatTile
                key={s.label}
                label={s.label}
                value={s.value}
                icon={s.icon}
                tone={s.tone}
              />
            ))}
          </MobileStatRow>

          <CombinedActivityCard />

          {/* Operation breakdown */}
          <div className='rounded-2xl border bg-card p-3 space-y-2'>
            <p className='text-[11px] font-semibold uppercase tracking-widest text-muted-foreground'>
              Order operations
            </p>
            <div className='grid grid-cols-2 gap-2'>
              {orderOps.map((op) => (
                <div
                  key={op.label}
                  className='flex flex-col gap-0.5 rounded-xl border border-border/60 bg-muted/30 p-2.5'>
                  <span className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
                    {op.label}
                  </span>
                  <span className='text-lg font-semibold tabular-nums'>
                    {op.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent order actions */}
          <div className='space-y-2'>
            <p className='px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground'>
              Recent order actions
            </p>
            {orderActions.length > 0 ? (
              <MobileStaggeredList>
                {orderActions.slice(0, 5).map((action) => (
                  <MobileListCard
                    key={action.id}
                    leading={
                      <div className='grid h-9 w-9 place-items-center rounded-lg bg-[#D97757]/10 text-[#D97757]'>
                        <ShoppingCart className='h-4 w-4' />
                      </div>
                    }
                    title={`Order #${action.orderNumber}`}
                    subtitle={
                      <span className='flex items-center gap-1.5'>
                        {action.performedBy.userName} ·{" "}
                        {dayjs(action.timestamps.createdAt).fromNow()}
                      </span>
                    }
                    badge={
                      <Badge
                        className='bg-[#FAF9F6] border-[#E8E4DC] text-[#57554D]'
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
                    }
                  />
                ))}
              </MobileStaggeredList>
            ) : (
              <MobileEmptyState
                icon={<ShoppingCart className='h-7 w-7' />}
                title='No recent actions'
              />
            )}
          </div>

          {/* Recent stock adjustments */}
          <div className='space-y-2'>
            <p className='px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground'>
              Recent stock adjustments
            </p>
            {productAdjustments.length > 0 ? (
              <MobileStaggeredList>
                {productAdjustments.slice(0, 5).map((adjustment) => (
                  <MobileListCard
                    key={adjustment.id}
                    leading={
                      <div className='grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary'>
                        <Package className='h-4 w-4' />
                      </div>
                    }
                    title={adjustment.productName}
                    subtitle={
                      <span className='flex items-center gap-1.5'>
                        {adjustment.adjustedBy.userName} ·{" "}
                        {dayjs(adjustment.timestamps.createdAt).fromNow()}
                      </span>
                    }
                    badge={
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
                    }
                  />
                ))}
              </MobileStaggeredList>
            ) : (
              <MobileEmptyState
                icon={<Package className='h-7 w-7' />}
                title='No recent adjustments'
              />
            )}
          </div>

          <AuditContributorsGraph
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
          <UserPerformanceCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        </div>
      </MobilePage>
    );
  }

  return (
    <div className={`${claude.page} px-8 space-y-6 pt-2 pb-6`}>
      {/* Header */}
      <PageHeader
        icon={<SquareActivity className='h-5 w-5' />}
        title='Audit Dashboard'
        subtitle='System-wide activity overview'
        actions={
          <div className='flex items-center gap-2'>
            <input
              type='datetime-local'
              value={dayjs(dateRange.startDate).format("YYYY-MM-DDTHH:mm")}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className='px-3 py-2 text-[13px] border border-[#E8E4DC] rounded-md bg-white text-[#141413] focus:outline-none focus:border-[#D97757]'
            />
            <span className='text-[13px] text-[#8A877D]'>to</span>
            <input
              type='datetime-local'
              value={dayjs(dateRange.endDate).format("YYYY-MM-DDTHH:mm")}
              onChange={(e) => {
                const endOfDay = dayjs(e.target.value)
                  .endOf("day")
                  .toISOString();
                setDateRange({ ...dateRange, endDate: endOfDay });
              }}
              className='px-3 py-2 text-[13px] border border-[#E8E4DC] rounded-md bg-white text-[#141413] focus:outline-none focus:border-[#D97757]'
            />
          </div>
        }
      />

      {/* Summary Cards */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
        {[
          {
            label: "Order Operations",
            value: (
              dashboardData.orderAudits?.totalAudits || 0
            ).toLocaleString(),
            accent: "text-[#141413]",
            icon: ShoppingCart,
          },
          {
            label: "Stock Adjustments",
            value: (
              dashboardData.productAdjustments?.totalAdjustments || 0
            ).toLocaleString(),
            accent: "text-[#141413]",
            icon: Package,
          },
          {
            label: "Active Users",
            value: dashboardData.orderAudits?.uniqueUsersCount || 0,
            accent: "text-[#141413]",
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
            <div key={stat.label} className={claude.card + " p-4"}>
              <div className='flex items-center justify-between mb-2'>
                <div className={claude.iconTile}>
                  <Icon className='h-4 w-4' />
                </div>
                <div className='w-2 h-2 rounded-full bg-[#D97757]/50' />
              </div>
              <p
                className={`text-lg font-semibold ${stat.accent} tabular-nums leading-none mb-1`}>
                {stat.value}
              </p>
              <p className={claude.microLabel}>{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Combined Activity — 90 day pills */}
      <CombinedActivityCard />

      {/* Operation Breakdown */}
      <div className={claude.card + " overflow-hidden"}>
        <div
          className={`flex items-center gap-2.5 px-4 py-3 ${claude.cardHeader}`}>
          <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#D97757]/20 bg-[#D97757]/10 text-[#D97757]'>
            <ShoppingCart className='h-3.5 w-3.5' />
          </span>
          <div>
            <h3 className='text-[13px] font-semibold text-[#141413] leading-tight'>
              Order Operations Breakdown
            </h3>
            <p className='text-[11px] text-[#8A877D] mt-0.5'>
              Distribution of order activities
            </p>
          </div>
        </div>
        <div className='p-5'>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            {[
              {
                label: "Created",
                value: (
                  dashboardData.orderAudits?.operationCounts?.creates || 0
                ).toLocaleString(),
                color: "text-[#B85A3D]",
                badge: "bg-[#D97757]/10 border-[#D97757]/30 text-[#9A4B2E]",
              },
              {
                label: "Status Updates",
                value: (
                  dashboardData.orderAudits?.operationCounts?.statusUpdates || 0
                ).toLocaleString(),
                color: "text-[#57554D]",
                badge: "bg-[#FAF9F6] border-[#E8E4DC] text-[#57554D]",
              },
              {
                label: "Payments",
                value: (
                  dashboardData.orderAudits?.operationCounts?.paymentUpdates ||
                  0
                ).toLocaleString(),
                color: "text-[#57554D]",
                badge: "bg-[#FAF9F6] border-[#E8E4DC] text-[#57554D]",
              },
              {
                label: "Bulk Actions",
                value: (
                  dashboardData.orderAudits?.operationCounts?.bulkActions || 0
                ).toLocaleString(),
                color: "text-[#57554D]",
                badge: "bg-[#FAF9F6] border-[#E8E4DC] text-[#57554D]",
              },
            ].map((op) => (
              <div
                key={op.label}
                className='flex items-center justify-between p-3 bg-[#FAF9F6] rounded-md border border-[#E8E4DC]'>
                <div>
                  <p className={claude.microLabel + " mb-1"}>{op.label}</p>
                  <p
                    className={`text-xl font-semibold ${op.color} tabular-nums`}>
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
        <div className={claude.card + " overflow-hidden"}>
          <div
            className={`flex items-center gap-2.5 px-4 py-3 ${claude.cardHeader}`}>
            <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#D97757]/20 bg-[#D97757]/10 text-[#D97757]'>
              <ShoppingCart className='h-3.5 w-3.5' />
            </span>
            <div>
              <h3 className='text-[13px] font-semibold text-[#141413] leading-tight'>
                Recent Order Actions
              </h3>
              <p className='text-[11px] text-[#8A877D] mt-0.5'>
                Latest order activities
              </p>
            </div>
          </div>
          <div className='p-5'>
            {dashboardData.recentActivities?.orderActions?.length > 0 ? (
              <div className='space-y-4'>
                {dashboardData.recentActivities.orderActions
                  .slice(0, 5)
                  .map((action) => (
                    <div
                      key={action.id}
                      className='flex items-start gap-3 pb-4 border-b border-[#E8E4DC] last:border-0 last:pb-0'>
                      <div className={claude.iconTile + " flex-shrink-0"}>
                        <ShoppingCart className='h-4 w-4' />
                      </div>
                      <div className='flex-1 space-y-1 min-w-0'>
                        <div className='flex items-center justify-between gap-2'>
                          <p className='text-[13px] font-semibold text-[#141413] truncate'>
                            Order #{action.orderNumber}
                          </p>
                          <Badge
                            className='cursor-pointer flex-shrink-0 bg-[#FAF9F6] border-[#E8E4DC] text-[#57554D]'
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
                        <div className='flex items-center gap-2 text-[11px] text-[#8A877D]'>
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
                <ShoppingCart className='w-12 h-12 mx-auto mb-3 text-[#D8D3C8]' />
                <p className='text-sm text-[#57554D]'>No recent actions</p>
              </div>
            )}
          </div>
        </div>

        {/* Stock Adjustments */}
        <div className={claude.card + " overflow-hidden"}>
          <div
            className={`flex items-center gap-2.5 px-4 py-3 ${claude.cardHeader}`}>
            <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#D97757]/20 bg-[#D97757]/10 text-[#D97757]'>
              <Package className='h-3.5 w-3.5' />
            </span>
            <div>
              <h3 className='text-[13px] font-semibold text-[#141413] leading-tight'>
                Recent Stock Adjustments
              </h3>
              <p className='text-[11px] text-[#8A877D] mt-0.5'>
                Latest inventory changes
              </p>
            </div>
          </div>
          <div className='p-5'>
            {dashboardData.recentActivities?.productAdjustments?.length > 0 ? (
              <div className='space-y-4'>
                {dashboardData.recentActivities.productAdjustments
                  .slice(0, 5)
                  .map((adjustment) => (
                    <div
                      key={adjustment.id}
                      className='flex items-start gap-3 pb-4 border-b border-[#E8E4DC] last:border-0 last:pb-0'>
                      <div className={claude.iconTile + " flex-shrink-0"}>
                        <Package className='h-4 w-4' />
                      </div>
                      <div className='flex-1 space-y-1 min-w-0'>
                        <div className='flex items-center justify-between gap-2'>
                          <p className='text-[13px] font-semibold text-[#141413] truncate'>
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
                        <div className='flex items-center gap-2 text-[11px] text-[#8A877D]'>
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
                <Package className='w-12 h-12 mx-auto mb-3 text-[#D8D3C8]' />
                <p className='text-sm text-[#57554D]'>No recent adjustments</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contributors Graph */}
      <AuditContributorsGraph
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
      />

      {/* User Performance Overview */}
      <UserPerformanceCard
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
      />
    </div>
  );
};
