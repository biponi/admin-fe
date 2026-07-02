import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { OrdersData } from "../../../api/reportV2";
import InfoPopover from "./InfoPopover";
import { ChartComponents, CHART_COLORS, CHART_COLORS_ALPHA, defaultTooltipStyle, defaultLegendStyle, defaultScaleOptions } from "./ChartjsSetup";

interface Props {
  data: OrdersData | null;
  formatCurrency: (v: number) => string;
  formatNumber: (v: number) => string;
}

const STATUS_COLORS: Record<string, string> = {
  completed: "#10b981", pending: "#f59e0b", processing: "#6366f1",
  shipped: "#06b6d4", cancel: "#ef4444", failed: "#dc2626",
  return: "#f97316", delete: "#6b7280",
};

const OrdersTab: React.FC<Props> = ({ data, formatCurrency, formatNumber }) => {
  if (!data) return <EmptyState />;

  const summaryData = (data.summary || []).map((s) => ({
    status: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    count: s.count,
    revenue: s.revenue,
    color: STATUS_COLORS[s.status] || "#6b7280",
  }));

  const dailyData = (data.dailyReport || []).map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    totalOrders: d.totalOrders,
    completed: d.completed,
    cancelled: d.cancelled,
    returned: d.returned,
  }));

  const cancelledProducts = (data.topCancelledProducts || []).slice(0, 8).map((p) => ({
    name: (p.productName || "").length > 20 ? p.productName.substring(0, 20) + "..." : (p.productName || "Unknown"),
    cancellations: p.cancelledOrders,
  }));

  const lifecycle = data.lifecycle || { avgFulfillmentHours: 0, minFulfillmentHours: 0, maxFulfillmentHours: 0 };
  const lifecycleData = [
    { label: "Avg Fulfillment", value: lifecycle.avgFulfillmentHours, unit: "hrs" },
    { label: "Min Fulfillment", value: lifecycle.minFulfillmentHours, unit: "hrs" },
    { label: "Max Fulfillment", value: lifecycle.maxFulfillmentHours, unit: "hrs" },
  ];

  const maxCount = Math.max(...summaryData.map((s) => s.count), 1);
  const polarAreaData = {
    labels: summaryData.map((s) => s.status),
    datasets: [{
      data: summaryData.map((s) => s.count),
      backgroundColor: summaryData.map((s) => s.color + "88"),
      borderColor: summaryData.map((s) => s.color),
      borderWidth: 2,
    }],
  };

  const dailyChartData = {
    labels: dailyData.map((d) => d.date),
    datasets: [
      {
        label: "Completed",
        data: dailyData.map((d) => d.completed),
        backgroundColor: "rgba(16,185,129,0.6)",
        borderColor: "#10b981",
        borderWidth: 0,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        order: 3,
      },
      {
        label: "Cancelled",
        data: dailyData.map((d) => d.cancelled),
        backgroundColor: "rgba(239,68,68,0.5)",
        borderColor: "#ef4444",
        borderWidth: 0,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        order: 2,
      },
      {
        label: "Returned",
        data: dailyData.map((d) => d.returned),
        backgroundColor: "rgba(249,115,22,0.5)",
        borderColor: "#f97316",
        borderWidth: 0,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        order: 1,
      },
    ],
  };

  const radarData = {
    labels: summaryData.map((s) => s.status),
    datasets: [{
      label: "Orders",
      data: summaryData.map((s) => s.count),
      backgroundColor: "rgba(99,102,241,0.2)",
      borderColor: "#6366f1",
      borderWidth: 2,
      pointBackgroundColor: "#6366f1",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
    }],
  };

  const cancelledChartData = {
    labels: cancelledProducts.map((d) => d.name),
    datasets: [{
      label: "Cancellations",
      data: cancelledProducts.map((d) => d.cancellations),
      backgroundColor: "rgba(239,68,68,0.7)",
      borderColor: "#ef4444",
      borderWidth: 0,
      borderRadius: 6,
    }],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryData.slice(0, 4).map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <p className="text-xs text-slate-500 font-medium">{s.status}</p>
            </div>
            <p className="text-xl font-bold text-slate-900">{formatNumber(s.count)}</p>
            <p className="text-xs text-slate-500 mt-1">{formatCurrency(s.revenue)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Status Distribution</CardTitle>
              <p className="text-xs text-slate-500">Orders by status</p>
            </div>
              <InfoPopover title="Order Status Distribution (Polar Area)" description="Shows how orders are split across different statuses. Bigger slices mean more orders in that status." formula="Counts active orders (not deleted) by their current status: completed, pending, processing, shipped, cancelled, returned, etc." />
          </CardHeader>
          <CardContent>
            <div style={{ height: 280 }}><ChartComponents.PolarArea data={polarAreaData} options={{ responsive: true, maintainAspectRatio: false, scales: { r: { grid: { color: "rgba(226,232,240,0.6)" }, ticks: { display: false } } }, plugins: { legend: { position: "bottom", ...defaultLegendStyle }, tooltip: { ...defaultTooltipStyle, callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.raw} orders` } } } }} /></div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Daily Order Trend</CardTitle>
              <p className="text-xs text-slate-500">Order volume with status breakdown</p>
            </div>
            <InfoPopover title="Daily Order Trend" description="Stacked area showing daily order volumes split by completed, cancelled, and returned orders." formula="Total orders placed each day, with breakdown by status. Also shows gross revenue (before discounts) and net revenue (after discounts) per day." />
          </CardHeader>
          <CardContent>
            <div style={{ height: 280 }}><ChartComponents.Line data={dailyChartData} options={{ responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: "index" }, plugins: { legend: defaultLegendStyle, tooltip: defaultTooltipStyle }, scales: { ...defaultScaleOptions, y: { ...defaultScaleOptions.y, stacked: true } }, elements: { line: { tension: 0.4 } } }} /></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Order Radar View</CardTitle>
              <p className="text-xs text-slate-500">Order volume radar distribution</p>
            </div>
            <InfoPopover title="Order Volume Radar" description="Visual comparison of how many orders are in each status. Larger area = more orders overall." formula="Each point represents the order count for that status. Useful for quickly spotting which statuses dominate." />
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}><ChartComponents.Radar data={radarData} options={{ responsive: true, maintainAspectRatio: false, scales: { r: { beginAtZero: true, grid: { color: "rgba(226,232,240,0.6)" }, angleLines: { color: "rgba(226,232,240,0.6)" }, pointLabels: { font: { size: 11 }, color: "#64748b" }, ticks: { display: false } } }, plugins: { legend: { display: false }, tooltip: defaultTooltipStyle } }} /></div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Top Cancelled Products</CardTitle>
              <p className="text-xs text-slate-500">Products with most cancellations</p>
            </div>
            <InfoPopover title="Top Cancelled Products" description="Products that get cancelled or returned the most. High numbers may indicate quality or description issues." formula="Cancellations = Number of cancelled/returned orders containing each product | Lost revenue = Total value of those cancelled orders" />
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}><ChartComponents.Bar data={cancelledChartData} options={{ indexAxis: "y" as const, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...defaultTooltipStyle, callbacks: { label: (ctx: any) => ` Cancellations: ${ctx.raw}` } } }, scales: { x: { ...defaultScaleOptions.x }, y: { ...defaultScaleOptions.y, grid: { display: false } } } }} /></div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-100 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">Fulfillment Lifecycle</CardTitle>
            <p className="text-xs text-slate-500">Order processing time metrics</p>
          </div>
          <InfoPopover title="Fulfillment Lifecycle" description="How long it takes from order placement to delivery. Shows average, fastest, and slowest times." formula="Measured in hours from when the order was created to when it was delivered. Only includes delivered/shipped orders." />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {lifecycleData.map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-4 text-center">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{item.value.toFixed(1)}</p>
                <p className="text-xs text-slate-400">{item.unit}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex items-center justify-center py-20">
    <p className="text-slate-500">No order data available.</p>
  </div>
);

export default OrdersTab;
