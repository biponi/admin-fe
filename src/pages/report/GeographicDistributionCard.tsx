// ============================================
// FILE: components/reports/GeographicDistributionCard.tsx
// ============================================
import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Download, MapPin } from "lucide-react";
import useRoleCheck from "../auth/hooks/useRoleCheck";

import { ChartConfig } from "../../components/ui/chart";
import BarChartActive from "../../components/Charts/BarChartActive";
import BarChartWithLegend from "../../components/Charts/BarChartWithLegend";

interface GeographicData {
  discountPercentage: number;
  discounts: number;
  district: string;
  division: string;
  orderCount: number;
  revenue: number;
  subtotal: number;
  deliveryCharge?: number;
  paid?: number;
  due?: number;
}

interface GeographicDistributionCardProps {
  duration?: string;
  data: GeographicData[];
  onDownload: () => void;
}

const chartConfigForRevenue = {
  revenue: {
    label: "Revenue",
    color: "#10b981", // emerald-500
  },
  discounts: {
    label: "Discounts",
    color: "#ef4444", // red-500
  },
  paid: {
    label: "Paid",
    color: "#6366f1", // indigo-500
  },
  due: {
    label: "Due",
    color: "#f59e0b", // amber-500
  },
  subtotal: {
    label: "Subtotal",
    color: "#8b5cf6", // violet-500
  },
  deliveryCharge: {
    label: "Delivery Charge",
    color: "#06b6d4", // cyan-500
  },
  backgroundGrid: {
    color: "#e2e8f0", // slate-200
  },
} satisfies ChartConfig;

const GeographicDistributionCard: React.FC<GeographicDistributionCardProps> = ({
  data,
  duration = "",
  onDownload,
}) => {
  const { hasRequiredPermission } = useRoleCheck();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace("BDT", "৳");
  };

  const divisionMap: { [key: string]: GeographicData } = {};

  data.forEach((item) => {
    if (!divisionMap[item.division]) {
      divisionMap[item.division] = {
        discountPercentage: 0,
        discounts: 0,
        district: "",
        division: item.division,
        orderCount: 0,
        revenue: 0,
        subtotal: 0,
      };
    }
    divisionMap[item.division].discountPercentage += item.discountPercentage;
    divisionMap[item.division].discounts += item.discounts;
    divisionMap[item.division].orderCount += item.orderCount;
    divisionMap[item.division].revenue += item.revenue;
    divisionMap[item.division].subtotal += item.subtotal;
    divisionMap[item.division].deliveryCharge =
      (divisionMap[item.division].deliveryCharge || 0) +
      (item.deliveryCharge || 0);
    divisionMap[item.division].paid =
      (divisionMap[item.division].paid || 0) + (item.paid || 0);
    divisionMap[item.division].due =
      (divisionMap[item.division].due || 0) + (item.due || 0);
  });

  const metricsForDivision = Object.values(divisionMap).map((item) => ({
    xKey: item.division,
    yKey: item.orderCount,
  }));

  const metricsForDivisionWithRevenue = Object.values(divisionMap).map(
    (item) => ({
      division: item.division,
      revenue: item.revenue,
      discounts: item.discounts,
      deliveryCharge: item.deliveryCharge,
      paid: item.paid,
      due: item.due,
      subtotal: item.subtotal,
    }),
  );

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Geographic Distribution
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Sales performance by geographic region
            </p>
          </div>
          {hasRequiredPermission("Report", "download") && (
            <button
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="space-y-6">
          <Tabs defaultValue="District">
            <TabsList>
              <TabsTrigger value="District">District</TabsTrigger>
              <TabsTrigger value="Area">Area</TabsTrigger>
            </TabsList>
            <TabsContent value="District">
              {/* Chart */}
              <div className="h-auto w-full grid grid-cols-1 gap-3 sm:grid-cols-2 mb-3">
                <BarChartActive
                  names={{
                    xKey: "District",
                    yKey: "Orders: ",
                  }}
                  data={metricsForDivision}
                  label="Order Count by District"
                  duration={duration}
                  footer="Order Count Data"
                  footerDescription={
                    "Total Orders: " +
                    formatCurrency(
                      data.reduce((acc, item) => acc + item.orderCount, 0),
                    )
                  }
                  isUpwardTrend={false}
                />
                <BarChartWithLegend
                  data={metricsForDivisionWithRevenue}
                  xKey="division"
                  barKeys={["subtotal", "revenue"]}
                  chartConfig={chartConfigForRevenue}
                  label="Revenue vs Subtotal by District"
                  duration={duration}
                  footer="Revenue Vs Subtotal"
                  footerDescription={
                    "Total Revenue " +
                    formatCurrency(
                      data.reduce((acc, item) => acc + item.revenue, 0),
                    ) +
                    " vs " +
                    "Total Subtotal " +
                    formatCurrency(
                      data.reduce((acc, item) => acc + item.subtotal, 0),
                    )
                  }
                  isUpwardTrend={false}
                />
              </div>

              <div className="h-auto w-full grid grid-cols-1 gap-3 sm:grid-cols-2">
                <BarChartWithLegend
                  data={metricsForDivisionWithRevenue}
                  xKey="division"
                  barKeys={["discounts", "deliveryCharge"]}
                  chartConfig={chartConfigForRevenue}
                  label="Discount vs Delivery Charge by District"
                  duration={duration}
                  footer="Discount Vs Delivery Charge"
                  footerDescription={
                    "Total Discounts " +
                    formatCurrency(
                      data.reduce((acc, item) => acc + item.discounts, 0),
                    ) +
                    " vs " +
                    "Total Delivery Charge " +
                    formatCurrency(
                      data.reduce(
                        (acc, item) => acc + (item.deliveryCharge ?? 0),
                        0,
                      ),
                    )
                  }
                  isUpwardTrend={false}
                />
                <BarChartWithLegend
                  data={metricsForDivisionWithRevenue}
                  xKey="division"
                  barKeys={["paid", "due"]}
                  chartConfig={chartConfigForRevenue}
                  label="Paid vs Due by District"
                  duration={duration}
                  footer="Paid Vs Due"
                  footerDescription={
                    "Total Paid " +
                    formatCurrency(
                      data.reduce((acc, item) => acc + (item.paid || 0), 0),
                    ) +
                    " vs " +
                    "Total Due " +
                    formatCurrency(
                      data.reduce((acc, item) => acc + (item.due || 0), 0),
                    )
                  }
                  isUpwardTrend={false}
                />
              </div>
            </TabsContent>
            <TabsContent value="Area">
              {/* Data Table */}
              <div className="rounded-lg border border-slate-200">
                <div className="max-h-96 overflow-y-auto overflow-x-auto">
                  <table className="w-full text-sm relative">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="p-3 text-left font-medium text-slate-700">
                          Area
                        </th>
                        <th className="p-3 text-right font-medium text-slate-700">
                          Orders
                        </th>
                        <th className="p-3 text-right font-medium text-slate-700">
                          Subtotal
                        </th>
                        <th className="p-3 text-right font-medium text-slate-700">
                          Discounts
                        </th>
                        <th className="p-3 text-right font-medium text-slate-700">
                          Revenue
                        </th>
                        <th className="p-3 text-right font-medium text-slate-700">
                          Delivery Charge
                        </th>
                        <th className="p-3 text-right font-medium text-slate-700">
                          Paid
                        </th>
                        <th className="p-3 text-right font-medium text-slate-700">
                          Due
                        </th>

                        <th className="p-3 text-right font-medium text-slate-700">
                          Paid %
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-medium text-slate-900">
                            {item.district}
                          </td>
                          <td className="p-3 text-right text-slate-700">
                            {item.orderCount}
                          </td>

                          <td className="p-3 text-right text-slate-700">
                            {formatCurrency(item.subtotal)}
                          </td>
                          <td className="p-3 text-right text-rose-600">
                            {formatCurrency(item.discounts)}
                          </td>
                          <td className="p-3 text-right font-semibold text-slate-900">
                            {formatCurrency(item.revenue)}
                          </td>
                          <td className="p-3 text-right font-semibold text-slate-900">
                            {formatCurrency(item.deliveryCharge || 0)}
                          </td>
                          <td className="p-3 text-right font-semibold text-slate-900">
                            {formatCurrency(item.paid || 0)}
                          </td>
                          <td className="p-3 text-right font-semibold text-slate-900">
                            {formatCurrency(item.due || 0)}
                          </td>

                          <td className="p-3 text-right text-slate-700">
                            {(
                              ((item.paid || 0) /
                                (item.revenue + (item.deliveryCharge || 0))) *
                              100
                            ).toFixed(1)}
                            %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default GeographicDistributionCard;
