import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import type { PackageActivity } from "../../pages/package/interface";
import { PackageStatusBadge } from "./PackageStatusBadge";

interface ActivityTimelineProps {
  activities: PackageActivity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-6">
            {activities.map((activity, index) => (
              <div key={activity._id} className="relative">
                {/* Timeline line */}
                {index !== activities.length - 1 && (
                  <div className="absolute left-[7px] top-4 h-full w-0.5 bg-gray-200" />
                )}

                <div className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="h-4 w-4 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />

                  {/* Content */}
                  <div className="flex-1 space-y-1 pb-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{activity.actionDescription}</p>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    {/* Status change indicator */}
                    {activity.fromStatus && activity.toStatus && (
                      <div className="flex items-center gap-2 text-sm">
                        <PackageStatusBadge status={activity.fromStatus} />
                        <span>→</span>
                        <PackageStatusBadge status={activity.toStatus} />
                      </div>
                    )}

                    {/* User info */}
                    {activity.user && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{activity.user.name}</span>
                        <span>•</span>
                        <span className="lowercase">{activity.source}</span>
                      </div>
                    )}

                    {/* Reason if exists */}
                    {activity.reason && (
                      <p className="text-sm text-gray-600 italic">&quot;{activity.reason}&quot;</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {activities.length === 0 && (
              <p className="text-center text-gray-500 py-8">No activity recorded</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
