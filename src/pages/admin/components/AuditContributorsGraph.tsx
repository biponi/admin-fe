import React, { useEffect, useState } from "react";
import { useAdminAudit } from "../../../hooks/useAdminAudit";
import {
  UserPerformanceSummary,
  ActivityTrend,
} from "../../../api/adminAudit";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Users, ShoppingCart, Package } from "lucide-react";
import dayjs from "dayjs";

interface AuditContributorsGraphProps {
  startDate: string;
  endDate: string;
}

interface ContributorData {
  userId: string;
  userName: string;
  userAvatar?: string;
  userType?: string;
  totalActions: number;
  orderActions: number;
  productAdjustments: number;
  chartData: { date: string; orders: number; adjustments: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
      <p className="font-semibold mb-1">{dayjs(label).format("MMM D")}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-sm"
            style={{ background: entry.fill || entry.color }}
          />
          <span className="text-slate-300">{entry.name}:</span>
          <span className="font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const ContributorCard: React.FC<{ contributor: ContributorData }> = ({ contributor }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:shadow-md hover:border-slate-200 transition-all">
      {/* Header: Avatar + Name + Total */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="h-10 w-10 ring-2 ring-slate-100 shrink-0">
          <AvatarImage src={contributor.userAvatar} />
          <AvatarFallback className="bg-indigo-50 text-indigo-600 text-xs font-semibold">
            {contributor.userName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-900 truncate">
              {contributor.userName}
            </h4>
            {contributor.userType && (
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 h-4 bg-slate-50 border-slate-200 text-slate-500 shrink-0"
              >
                {contributor.userType}
              </Badge>
            )}
          </div>
          <p className="text-lg font-bold text-indigo-600 leading-tight">
            {contributor.totalActions.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1">actions</span>
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md font-medium">
          <ShoppingCart className="h-3 w-3" />
          {contributor.orderActions}
        </span>
        <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md font-medium">
          <Package className="h-3 w-3" />
          {contributor.productAdjustments}
        </span>
      </div>

      {/* Bar chart */}
      {contributor.chartData.length > 0 ? (
        <div className="h-16 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={contributor.chartData} barCategoryGap="15%">
              <XAxis
                dataKey="date"
                hide
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(99,102,241,0.05)" }}
              />
              <Bar
                dataKey="orders"
                name="Orders"
                fill="#6366f1"
                radius={[2, 2, 0, 0]}
                stackId="stack"
              />
              <Bar
                dataKey="adjustments"
                name="Adjustments"
                fill="#10b981"
                radius={[2, 2, 0, 0]}
                stackId="stack"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-16 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-lg">
          No daily data
        </div>
      )}
    </div>
  );
};

export const AuditContributorsGraph: React.FC<AuditContributorsGraphProps> = ({
  startDate,
  endDate,
}) => {
  const { fetchUserPerformance, fetchUserDetail, isLoading } = useAdminAudit();
  const [contributors, setContributors] = useState<ContributorData[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadContributors();
  }, [startDate, endDate]);

  const loadContributors = async () => {
    setLoadingDetails(true);
    const data = await fetchUserPerformance({
      startDate,
      endDate,
      limit: 20,
    });

    if (data && data.users.length > 0) {
      const results: ContributorData[] = [];

      const details = await Promise.all(
        data.users.slice(0, 12).map(async (user) => {
          const detail = await fetchUserDetail(user.userId, { startDate, endDate });
          return { user, detail };
        })
      );

      for (const { user, detail } of details) {
        const chartData: ContributorData["chartData"] = [];

        if (detail?.activityTrend) {
          detail.activityTrend.forEach((trend: ActivityTrend) => {
            chartData.push({
              date: trend.date,
              orders: trend.orderActions,
              adjustments: trend.productAdjustments,
            });
          });
        }

        results.push({
          userId: user.userId,
          userName: user.userName,
          userAvatar: user.userAvatar,
          userType: user.userType,
          totalActions: user.orderOperations.total + user.productAdjustments.total,
          orderActions: user.orderOperations.total,
          productAdjustments: user.productAdjustments.total,
          chartData,
        });
      }

      results.sort((a, b) => b.totalActions - a.totalActions);
      setContributors(results);
    }
    setLoadingDetails(false);
  };

  if (isLoading && contributors.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-slate-200 rounded-full" />
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-slate-500">Loading contributors...</p>
        </div>
      </div>
    );
  }

  if (contributors.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Contributors
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Individual activity breakdown — {contributors.length} contributors
            </p>
          </div>
          {loadingDetails && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {contributors.map((contributor) => (
            <ContributorCard key={contributor.userId} contributor={contributor} />
          ))}
        </div>
      </div>
    </div>
  );
};
