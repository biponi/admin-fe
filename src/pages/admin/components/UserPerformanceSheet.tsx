import React from "react";
import { UserPerformanceDetailResponse } from "../../../api/adminAudit";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../../components/ui/sheet";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Clock,
  Calendar,
  BarChart3,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ActivityPillGrid } from "./ActivityPillGrid";

dayjs.extend(relativeTime);

interface UserPerformanceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  userDetail: UserPerformanceDetailResponse | null;
  isLoading: boolean;
  error: string | null;
  startDate: string;
  endDate: string;
}

const ContributionHeatmap: React.FC<{ activityTrend: { date: string; orderActions: number; productAdjustments: number }[] }> = ({ activityTrend }) => (
  <ActivityPillGrid
    days={activityTrend.map((t) => ({
      date: t.date,
      count: t.orderActions + t.productAdjustments,
    }))}
  />
);

export const UserPerformanceSheet: React.FC<UserPerformanceSheetProps> = ({
  open,
  onOpenChange,
  userName,
  userDetail,
  isLoading,
  error,
  startDate,
  endDate,
}) => {
  const renderContent = () => {
    if (isLoading && !userDetail) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertDescription>Error: {error}</AlertDescription>
        </Alert>
      );
    }

    if (!userDetail) {
      return (
        <Alert>
          <AlertDescription>No data available</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-6">
        {/* Summary Section */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg space-y-2 bg-blue-50/50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Total Order Actions
              </p>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {userDetail.summary.totalOrderActions.toLocaleString()}
            </p>
          </div>

          <div className="p-4 border rounded-lg space-y-2 bg-purple-50/50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Product Adjustments
              </p>
              <Package className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {userDetail.summary.totalProductAdjustments.toLocaleString()}
            </p>
          </div>

          <div className="p-4 border rounded-lg space-y-2 bg-green-50/50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Total Activities
              </p>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {(
                userDetail.summary.totalOrderActions +
                userDetail.summary.totalProductAdjustments
              ).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Activity Heatmap */}
        {userDetail.activityTrend.length > 0 && (
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-semibold">Activity Heatmap</h3>
            </div>
            <ContributionHeatmap activityTrend={userDetail.activityTrend} />
          </div>
        )}

        {/* Order Operations Breakdown */}
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">
              Order Operations Breakdown
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {userDetail.orderOperations.breakdown.map((op) => (
              <div
                key={op.operation}
                className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                <div className="space-y-1">
                  <p className="font-medium capitalize">
                    {op.operation.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last: {dayjs(op.lastPerformed).fromNow()}
                  </p>
                </div>
                <Badge variant="secondary" className="text-base">
                  {op.count}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Order Actions */}
        {userDetail.orderOperations.recentActions.length > 0 && (
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Recent Order Actions</h3>
            </div>

            <div className="space-y-3">
              {userDetail.orderOperations.recentActions
                .slice(0, 10)
                .map((action) => (
                  <div
                    key={action.id}
                    className="flex items-start gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          Order #{action.orderNumber}
                        </p>
                        <Badge variant="outline">
                          {action.operation.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {action.operationDescription}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dayjs(action.timestamps.createdAt).format(
                          "MMM DD, YYYY HH:mm"
                        )}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Product Adjustments Breakdown */}
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">
              Product Adjustments Breakdown
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {userDetail.productAdjustments.typeBreakdown.map((type) => (
              <div
                key={type.type}
                className="p-3 border rounded-md bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium capitalize">{type.type}</p>
                  <Badge
                    variant={
                      type.type === "add"
                        ? "default"
                        : type.type === "remove"
                        ? "destructive"
                        : "secondary"
                    }>
                    {type.count}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Qty Change:{" "}
                  <span
                    className={`font-medium ${
                      type.totalQuantityChange > 0
                        ? "text-green-600"
                        : type.totalQuantityChange < 0
                        ? "text-red-600"
                        : ""
                    }`}>
                    {type.totalQuantityChange > 0 ? "+" : ""}
                    {type.totalQuantityChange}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Product Adjustments */}
        {userDetail.productAdjustments.recentAdjustments.length > 0 && (
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold">
                Recent Product Adjustments
              </h3>
            </div>

            <div className="space-y-3">
              {userDetail.productAdjustments.recentAdjustments
                .slice(0, 10)
                .map((adjustment) => (
                  <div
                    key={adjustment.id}
                    className="flex items-start gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Package className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {adjustment.productName}
                        </p>
                        <Badge
                          variant={
                            adjustment.adjustmentType === "add"
                              ? "default"
                              : "destructive"
                          }>
                          {adjustment.quantityChange > 0 ? "+" : ""}
                          {adjustment.quantityChange}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>SKU: {adjustment.productSku}</span>
                        <span>&bull;</span>
                        <span>
                          {adjustment.oldQuantity} &rarr; {adjustment.newQuantity}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {adjustment.reason}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dayjs(adjustment.timestamps.createdAt).format(
                          "MMM DD, YYYY HH:mm"
                        )}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Activity Trend */}
        {userDetail.activityTrend.length > 0 && (
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Activity Trend</h3>
            </div>

            <div className="space-y-2">
              {userDetail.activityTrend.slice(-14).map((trend) => {
                const totalActivity =
                  trend.orderActions + trend.productAdjustments;
                const maxActivity = Math.max(
                  ...userDetail.activityTrend.map(
                    (t) => t.orderActions + t.productAdjustments
                  ),
                  1
                );

                return (
                  <div key={trend.date} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">
                          {dayjs(trend.date).format("MMM DD, YYYY")}
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {totalActivity} activities
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                        <div className="flex h-full">
                          <div
                            className="bg-blue-500"
                            style={{
                              width: `${
                                (trend.orderActions / maxActivity) * 100
                              }%`,
                            }}
                            title={`${trend.orderActions} order actions`}
                          />
                          <div
                            className="bg-purple-500"
                            style={{
                              width: `${
                                (trend.productAdjustments / maxActivity) * 100
                              }%`,
                            }}
                            title={`${trend.productAdjustments} adjustments`}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline" className="bg-blue-50">
                          O: {trend.orderActions}
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50">
                          P: {trend.productAdjustments}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 pt-2 border-t text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span>Order Actions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded" />
                <span>Product Adjustments</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="text-xl">{userName}</span>
            {userDetail && (
              <Badge variant="secondary">{userDetail.user.type}</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {userDetail ? (
              <span>
                {userDetail.user.email} &bull; Performance report from{" "}
                {dayjs(startDate).format("MMM DD, YYYY")} to{" "}
                {dayjs(endDate).format("MMM DD, YYYY")}
              </span>
            ) : (
              <span>Loading performance data...</span>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
};
