import { RequestStatistics } from "../hooks/useOperationRequests";
import { CheckCircle, XCircle, Clock, Ban, Hourglass, TrendingUp } from "lucide-react";

interface RequestStatisticsProps {
  statistics: RequestStatistics[];
  isLoading?: boolean;
}

export const RequestStatistics = ({ statistics, isLoading = false }: RequestStatisticsProps) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3 bg-slate-100 rounded w-1/3 mb-2"></div>
              <div className="h-6 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Get product delete stats (or the first operation type stats)
  const stats = statistics.find((s) => s.operationType === "product_delete") || statistics[0];

  if (!stats) {
    return null;
  }

  const statItems = [
    {
      label: "Total Requests",
      value: stats.totalRequests,
      icon: TrendingUp,
      color: "text-indigo-600",
      dotColor: "bg-indigo-600",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-amber-600",
      dotColor: "bg-amber-600",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: CheckCircle,
      color: "text-emerald-600",
      dotColor: "bg-emerald-600",
    },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
      <div className="grid gap-6 md:grid-cols-3">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${stat.dotColor} shrink-0`} />
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Icon className={`h-4 w-4 ${stat.color} shrink-0`} />
                <p className="text-[12px] text-slate-500 font-medium truncate">{stat.label}</p>
              </div>
              <p className={`text-[15px] font-semibold ${stat.color} leading-none`}>
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
