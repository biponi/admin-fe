import { ReportResponse } from "..";

type CombinedDailyComparison = {
  _id: string;
  totalPurchases?: number;
  totalOrders?: number;
}[];

export const combineDailyComparison = (
  dailyComparison: any[]
): CombinedDailyComparison => {
  if (dailyComparison.length === 0) return [];
  const purchases = dailyComparison[0];
  const orders = dailyComparison[1];
  // Create a map to combine data
  const combinedMap: Record<
    string,
    { _id: string; totalPurchases?: number; totalOrders?: number }
  > = {};

  // Add totalPurchases data to the map
  purchases.forEach((item: any) => {
    combinedMap[item._id] = {
      _id: item._id,
      totalPurchases: item.totalPurchases,
    };
  });

  // Add totalOrders data to the map
  orders.forEach((item: any) => {
    if (combinedMap[item._id]) {
      combinedMap[item._id].totalOrders = item.totalOrders;
    } else {
      combinedMap[item._id] = {
        _id: item._id,
        totalOrders: item.totalOrders,
        totalPurchases: 0,
      };
    }
  });

  // Convert the map back to an array
  return Object.values(combinedMap);
};

export const getRankWithEmoji = (rank: number): string => {
  // Determine the rank suffix ("st", "nd", "rd", or "th")
  let suffix = "th";
  if (rank === 1) {
    suffix = "st";
  } else if (rank === 2) {
    suffix = "nd";
  } else if (rank === 3) {
    suffix = "rd";
  }

  // Get the emoji for the top 3 ranks
  let emoji = "";
  if (rank === 1) {
    emoji = "🥇";
  } else if (rank === 2) {
    emoji = "🥈";
  } else if (rank === 3) {
    emoji = "🥉";
  }

  // Return the rank with emoji and suffix
  return !!emoji ? emoji : `${rank}${suffix}`;
};

export const statusArrayGenerator = (reportData: ReportResponse | null) => {
  if (!reportData) return [];
  const array = [
    {
      browser: "Total Orders: ",
      sum: reportData?.orderMetrics?.currentMetrics?.totalOrders,
    },
  ];
  reportData?.graphs?.statusCounts?.forEach((item) => {
    array.push({
      browser: item._id,
      sum: item.count,
    });
  });
  return array;
};

const transformStatusData = (data: {
  _id: string;
  statuses: { status: string; count: number }[];
}): Record<string, any> => {
  const result: Record<string, any> = { _id: data._id };

  data.statuses.forEach(({ status, count }) => {
    result[status] = count;
  });

  return result;
};

export const structureStatusData = (data: ReportResponse | null) => {
  if (!data) return [];
  return data?.graphs?.orderStatusDailyComparison?.map(transformStatusData);
};
