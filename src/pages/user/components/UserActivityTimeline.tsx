import React, { useEffect, useState } from "react";
import { useAdminAudit } from "../../../hooks/useAdminAudit";
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
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Package, ShoppingCart, Clock, History } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface UserActivityTimelineProps {
  userId: string;
  startDate?: string;
  endDate?: string;
}

export const UserActivityTimeline: React.FC<UserActivityTimelineProps> = ({
  userId,
  startDate,
  endDate,
}) => {
  const { fetchUserDetail, isLoading, error } = useAdminAudit();
  const [userDetail, setUserDetail] =
    useState<UserPerformanceDetailResponse | null>(null);

  useEffect(() => {
    if (userId) {
      loadUserDetail();
    }
    // eslint-disable-next-line
  }, [userId, startDate, endDate]);

  const loadUserDetail = async () => {
    const data = await fetchUserDetail(userId, {
      startDate,
      endDate,
    });

    if (data) {
      setUserDetail(data);
    }
  };

  if (isLoading && !userDetail) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertDescription>Error: {error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!userDetail) {
    return null;
  }

  // Combine and sort activities
  const recentOrderActions = userDetail.orderOperations.recentActions.map(
    (action) => ({
      type: "order" as const,
      id: action.id,
      timestamp: action.timestamps.createdAt,
      data: action,
    })
  );

  const recentAdjustments = userDetail.productAdjustments.recentAdjustments.map(
    (adjustment) => ({
      type: "adjustment" as const,
      id: adjustment.id,
      timestamp: adjustment.timestamps.createdAt,
      data: adjustment,
    })
  );

  const allActivities = [...recentOrderActions, ...recentAdjustments].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          Recent Activity
        </CardTitle>
        <CardDescription>Your latest operations and changes</CardDescription>
      </CardHeader>

      <CardContent>
        {allActivities.length === 0 ? (
          <Alert>
            <AlertDescription>No recent activities found</AlertDescription>
          </Alert>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="relative space-y-6">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-transparent" />

              {allActivities.slice(0, 20).map((activity, index) => (
                <div key={activity.id} className="relative pl-12">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-3 w-4 h-4 rounded-full border-4 border-white shadow-md ${
                      activity.type === "order"
                        ? "bg-purple-500"
                        : "bg-green-500"
                    }`}
                  />

                  {/* Activity Card */}
                  <div
                    className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                      activity.type === "order"
                        ? "bg-purple-50 border-purple-200 hover:border-purple-300"
                        : "bg-green-50 border-green-200 hover:border-green-300"
                    }`}>
                    {activity.type === "order" ? (
                      // Order Action
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <ShoppingCart className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-purple-900">
                                Order #{activity.data.orderNumber}
                              </p>
                              <Badge
                                variant="outline"
                                className="mt-1 bg-white text-xs">
                                {activity.data.operation.replace(/_/g, " ")}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 pl-12">
                          {activity.data.operationDescription}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 pl-12">
                          <Clock className="w-3 h-3" />
                          <span>
                            {dayjs(activity.timestamp).format(
                              "MMM DD, YYYY · HH:mm"
                            )}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span>{dayjs(activity.timestamp).fromNow()}</span>
                        </div>
                      </div>
                    ) : (
                      // Product Adjustment
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Package className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-green-900">
                                {activity.data.productName}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                SKU: {activity.data.productSku}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              activity.data.adjustmentType === "add"
                                ? "default"
                                : "destructive"
                            }
                            className="text-sm">
                            {activity.data.quantityChange > 0 ? "+" : ""}
                            {activity.data.quantityChange}
                          </Badge>
                        </div>
                        <div className="pl-12 space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="font-medium">Quantity:</span>
                            <span>
                              {activity.data.oldQuantity} →{" "}
                              <span className="font-semibold text-green-700">
                                {activity.data.newQuantity}
                              </span>
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 italic">
                            "{activity.data.reason}"
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>
                              {dayjs(activity.timestamp).format(
                                "MMM DD, YYYY · HH:mm"
                              )}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span>{dayjs(activity.timestamp).fromNow()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
