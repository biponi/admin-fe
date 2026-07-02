import React, { useState } from "react";
import { Users, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import {
  ChartComponents,
  CHART_COLORS,
  defaultTooltipStyle,
  defaultScaleOptions,
} from "./ChartjsSetup";

interface GeoData {
  district: string;
  division: string;
  customerCount: number;
  orders: number;
  revenue: number;
}

interface Props {
  data: GeoData[];
  formatCurrency: (v: number) => string;
  formatNumber: (v: number) => string;
}

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
];

const GeoMapChart: React.FC<Props> = ({
  data,
  formatCurrency,
  formatNumber,
}) => {
  const [view, setView] = useState<"district" | "division">("district");
  const [xKey, setXKey] = useState<"orders" | "customerCount">("orders");
  const [yKey, setYKey] = useState<"revenue" | "customerCount">("revenue");
  const [sizeKey, setSizeKey] = useState<
    "customerCount" | "revenue" | "orders"
  >("customerCount");

  const axisLabel: Record<string, string> = {
    orders: "Orders",
    customerCount: "Customers",
    revenue: "Revenue (BDT)",
  };

  let chartData: any[] = [];

  if (view === "district") {
    chartData = data
      .sort((a, b) => b.customerCount - a.customerCount)
      .map((d, i) => ({
        name: d.district,
        division: d.division,
        customerCount: d.customerCount,
        orders: d.orders,
        revenue: d.revenue,
        color: COLORS[i % COLORS.length],
      }));
  } else {
    const divMap = new Map<
      string,
      { customerCount: number; orders: number; revenue: number; count: number }
    >();
    data.forEach((d) => {
      const existing = divMap.get(d.division) || {
        customerCount: 0,
        orders: 0,
        revenue: 0,
        count: 0,
      };
      existing.customerCount += d.customerCount;
      existing.orders += d.orders;
      existing.revenue += d.revenue;
      existing.count += 1;
      divMap.set(d.division, existing);
    });
    chartData = Array.from(divMap.entries())
      .map(([division, v], i) => ({
        name: division,
        customerCount: v.customerCount,
        orders: v.orders,
        revenue: v.revenue,
        districtCount: v.count,
        color: COLORS[i % COLORS.length],
      }))
      .sort((a, b) => b.customerCount - a.customerCount);
  }

  const maxCustomers = Math.max(...chartData.map((d) => d.customerCount), 1);
  const maxVal = Math.max(...chartData.map((d) => d[sizeKey] || 0), 1);

  const bubbleData = {
    datasets: chartData.map((d, i) => ({
      label: d.name,
      data: [
        {
          x: d[xKey],
          y: d[yKey],
          r: Math.max(4, Math.min(25, (d[sizeKey] / maxVal) * 25)),
        },
      ],
      backgroundColor: d.color + "aa",
      borderColor: d.color,
      borderWidth: 1.5,
    })),
  };

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <div className='inline-flex items-center bg-slate-100 p-0.5 rounded-lg'>
          <button
            onClick={() => setView("division")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${view === "division" ? "bg-white shadow-sm text-indigo-600" : "text-slate-600 hover:text-slate-800"}`}>
            By District
          </button>
          <button
            onClick={() => setView("district")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${view === "district" ? "bg-white shadow-sm text-indigo-600" : "text-slate-600 hover:text-slate-800"}`}>
            By Area
          </button>
        </div>
        <div className='inline-flex items-center bg-slate-100 p-0.5 rounded-lg'>
          <span className='text-[10px] text-slate-500 px-2'>X:</span>
          {(["orders", "customerCount"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setXKey(k)}
              className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${xKey === k ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}>
              {axisLabel[k]}
            </button>
          ))}
        </div>
        <div className='inline-flex items-center bg-slate-100 p-0.5 rounded-lg'>
          <span className='text-[10px] text-slate-500 px-2'>Y:</span>
          {(["revenue", "customerCount"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setYKey(k)}
              className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${yKey === k ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}>
              {axisLabel[k]}
            </button>
          ))}
        </div>
        <div className='inline-flex items-center bg-slate-100 p-0.5 rounded-lg'>
          <span className='text-[10px] text-slate-500 px-2'>Size:</span>
          {(["customerCount", "revenue", "orders"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setSizeKey(k)}
              className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${sizeKey === k ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}>
              {axisLabel[k]}
            </button>
          ))}
        </div>
      </div>

      <div className='bg-white rounded-xl border border-slate-100 p-4'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h4 className='text-sm font-semibold text-slate-900'>
              {view === "district" ? "Area" : "District"} Distribution
            </h4>
            <p className='text-xs text-slate-500 mt-0.5'>
              X: {axisLabel[xKey]} | Y: {axisLabel[yKey]} | Bubble size:{" "}
              {axisLabel[sizeKey]}
            </p>
          </div>
        </div>
        <div style={{ height: 400 }}>
          <ChartComponents.Bubble
            data={bubbleData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  ...defaultTooltipStyle,
                  callbacks: {
                    title: (items: any) => {
                      const idx = items[0]?.datasetIndex;
                      return chartData[idx]?.name || "";
                    },
                    label: (ctx: any) => {
                      const d = chartData[ctx.datasetIndex];
                      if (!d) return "";
                      return [
                        `Customers: ${formatNumber(d.customerCount)}`,
                        `Revenue: ${formatCurrency(d.revenue)}`,
                        `Orders: ${formatNumber(d.orders)}`,
                      ];
                    },
                  },
                },
              },
              scales: {
                x: {
                  ...defaultScaleOptions.x,
                  title: {
                    display: true,
                    text: axisLabel[xKey],
                    color: "#64748b",
                    font: { size: 11 },
                  },
                  ticks: {
                    ...defaultScaleOptions.x.ticks,
                    callback: (v: any) => {
                      if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
                      if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
                      return v;
                    },
                  },
                },
                y: {
                  ...defaultScaleOptions.y,
                  title: {
                    display: true,
                    text: axisLabel[yKey],
                    color: "#64748b",
                    font: { size: 11 },
                  },
                  ticks: {
                    ...defaultScaleOptions.y.ticks,
                    callback: (v: any) => {
                      if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
                      if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
                      return v;
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        <div className='bg-indigo-50 rounded-xl border border-indigo-100 p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <Users className='h-4 w-4 text-indigo-600' />
            <p className='text-xs text-slate-500 font-medium'>
              Total Customers
            </p>
          </div>
          <p className='text-xl font-bold text-slate-900'>
            {formatNumber(
              chartData.reduce((sum, d) => sum + d.customerCount, 0),
            )}
          </p>
          <p className='text-[10px] text-slate-400 mt-1'>
            Across {chartData.length} {view}s
          </p>
        </div>
        <div className='bg-emerald-50 rounded-xl border border-emerald-100 p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <DollarSign className='h-4 w-4 text-emerald-600' />
            <p className='text-xs text-slate-500 font-medium'>Total Revenue</p>
          </div>
          <p className='text-xl font-bold text-slate-900'>
            {formatCurrency(chartData.reduce((sum, d) => sum + d.revenue, 0))}
          </p>
          <p className='text-[10px] text-slate-400 mt-1'>
            Avg:{" "}
            {formatCurrency(
              chartData.reduce((sum, d) => sum + d.revenue, 0) /
                Math.max(chartData.length, 1),
            )}
          </p>
        </div>
        <div className='bg-amber-50 rounded-xl border border-amber-100 p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <TrendingUp className='h-4 w-4 text-amber-600' />
            <p className='text-xs text-slate-500 font-medium'>Total Orders</p>
          </div>
          <p className='text-xl font-bold text-slate-900'>
            {formatNumber(chartData.reduce((sum, d) => sum + d.orders, 0))}
          </p>
          <p className='text-[10px] text-slate-400 mt-1'>
            Avg per {view}:{" "}
            {formatNumber(
              Math.round(
                chartData.reduce((sum, d) => sum + d.orders, 0) /
                  Math.max(chartData.length, 1),
              ),
            )}
          </p>
        </div>
      </div>

      <div className='bg-white rounded-lg border border-slate-100 overflow-hidden'>
        <div className='px-4 py-2.5 border-b border-slate-100 flex items-center justify-between'>
          <h4 className='text-sm font-semibold text-slate-900'>
            {view === "district" ? "Area" : "District"} Details
          </h4>
          <span className='text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full'>
            {chartData.length} entries
          </span>
        </div>
        <div className='overflow-x-auto max-h-96 overflow-y-auto'>
          <table className='w-full text-sm'>
            <thead className='sticky top-0  z-10'>
              <tr className='bg-slate-100/80'>
                <th className='text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                  #
                </th>
                <th className='text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                  {view === "district" ? "District" : "Division"}
                </th>
                {view === "district" && (
                  <th className='text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                    Division
                  </th>
                )}
                <th className='text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                  Customers
                </th>
                <th className='text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                  Revenue
                </th>
                <th className='text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                  Orders
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-50'>
              {chartData.map((d, i) => {
                const pct =
                  maxCustomers > 0 ? (d.customerCount / maxCustomers) * 100 : 0;
                return (
                  <tr
                    key={d.name}
                    className='hover:bg-slate-50/40 transition-colors'>
                    <td className='px-4 py-2.5'>
                      <div
                        className='w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold'
                        style={{ backgroundColor: d.color, color: "white" }}>
                        {i + 1}
                      </div>
                    </td>
                    <td className='px-4 py-2.5 font-medium text-slate-900'>
                      {d.name}
                    </td>
                    {view === "district" && (
                      <td className='px-4 py-2.5'>
                        <span className='text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded'>
                          {d.division}
                        </span>
                      </td>
                    )}
                    <td className='px-4 py-2.5 text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        <div className='w-16 bg-slate-100 rounded-full h-1.5'>
                          <div
                            className='h-1.5 rounded-full'
                            style={{
                              width: `${pct}%`,
                              backgroundColor: d.color,
                            }}
                          />
                        </div>
                        <span className='text-slate-700 font-medium tabular-nums w-12 text-right'>
                          {formatNumber(d.customerCount)}
                        </span>
                      </div>
                    </td>
                    <td className='px-4 py-2.5 text-right font-medium text-slate-700 tabular-nums'>
                      {formatCurrency(d.revenue)}
                    </td>
                    <td className='px-4 py-2.5 text-right font-medium text-slate-700 tabular-nums'>
                      {formatNumber(d.orders)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GeoMapChart;
