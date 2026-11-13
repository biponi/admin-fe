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
import { claude } from "../../../lib/claude";

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
    <div className={claude.tooltip + " px-3 py-2"}>
      <p className="font-semibold mb-1">{dayjs(label).format("MMM D")}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-sm"
            style={{ background: entry.fill || entry.color }}
          />
          <span className="text-white/70">{entry.name}:</span>
          <span className="font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const ContributorCard: React.FC<{ contributor: ContributorData }> = ({ contributor }) => {
  return (
    <div className={claude.card + " p-4 hover:border-[#D8D3C8] transition-all duration-200"}>
      {/* Header: Avatar + Name + Total */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="h-10 w-10 rounded-md ring-1 ring-[#E8E4DC] shrink-0">
          <AvatarImage src={contributor.userAvatar} />
          <AvatarFallback className="rounded-md bg-[#FAF9F6] text-[#B85A3D] text-xs font-semibold">
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
            <h4 className="text-[13px] font-semibold text-[#141413] truncate">
              {contributor.userName}
            </h4>
            {contributor.userType && (
              <Badge
                variant="outline"
                className="rounded-md text-[9px] px-1.5 py-0 h-4 bg-[#FAF9F6] border-[#E8E4DC] text-[#57554D] shrink-0"
              >
                {contributor.userType}
              </Badge>
            )}
          </div>
          <p className="text-lg font-semibold text-[#141413] tabular-nums leading-tight">
            {contributor.totalActions.toLocaleString()}
            <span className="text-[10px] font-normal text-[#8A877D] ml-1">actions</span>
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-2 mb-3 text-[11px] text-[#8A877D]">
        <span className="flex items-center gap-1.5 bg-[#D97757]/10 border border-[#D97757]/20 text-[#B85A3D] px-2 py-1 rounded-md font-medium tabular-nums">
          <ShoppingCart className="h-3 w-3" />
          {contributor.orderActions}
        </span>
        <span className="flex items-center gap-1.5 bg-[#FAF9F6] border border-[#E8E4DC] text-[#57554D] px-2 py-1 rounded-md font-medium tabular-nums">
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
                cursor={{ fill: "rgba(87,85,77,0.06)" }}
              />
              <Bar
                dataKey="orders"
                name="Orders"
                fill="#D97757"
                radius={[2, 2, 0, 0]}
                stackId="stack"
              />
              <Bar
                dataKey="adjustments"
                name="Adjustments"
                fill="#57554D"
                radius={[2, 2, 0, 0]}
                stackId="stack"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-16 flex items-center justify-center text-xs text-[#8A877D] bg-[#FAF9F6] rounded-lg">
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
      <div className={claude.card + " p-8"}>
        <div className="flex flex-col items-center gap-4">
          <div className={claude.spinner} />
          <p className="text-[13px] text-[#8A877D]">Loading contributors...</p>
        </div>
      </div>
    );
  }

  if (contributors.length === 0) return null;

  return (
    <div className={claude.card + " overflow-hidden"}>
      <div className={`flex items-center gap-2.5 px-4 py-3 ${claude.cardHeader}`}>
        <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#D97757]/20 bg-[#D97757]/10 text-[#D97757]'>
          <Users className='h-3.5 w-3.5' />
        </span>
        <div>
          <h3 className='text-[13px] font-semibold text-[#141413] leading-tight'>
            Contributors
          </h3>
          <p className='text-[11px] text-[#8A877D] mt-0.5'>
            Individual activity breakdown — {contributors.length} contributors
          </p>
        </div>
        {loadingDetails && (
          <div className='ml-auto flex items-center gap-2 text-[11px] text-[#8A877D]'>
            <div className='w-3.5 h-3.5 border-2 border-[#D97757] border-t-transparent rounded-full animate-spin' />
            Loading...
          </div>
        )}
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
