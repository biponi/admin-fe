import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { SalesData } from "../../../api/reportV2";
import InfoPopover from "./InfoPopover";
import { ChartComponents, CHART_COLORS, defaultTooltipStyle, defaultLegendStyle, defaultScaleOptions } from "./ChartjsSetup";

interface Props {
  data: SalesData | null;
  formatCurrency: (v: number) => string;
  formatNumber: (v: number) => string;
}

const SalesTab: React.FC<Props> = ({ data, formatCurrency, formatNumber }) => {
  if (!data) return <EmptyState />;

  const dailyData = (data.dailySales || []).map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    grossRevenue: d.grossRevenue,
    netRevenue: d.netRevenue,
    discounts: d.discounts,
    profit: d.profit,
    orders: d.orders,
    aov: d.aov,
  }));

  const categoryData = (data.byCategory || []).map((c) => ({
    category: c.categoryId,
    revenue: c.revenue,
    orders: c.orders,
  }));

  const brandData = (data.byBrand || []).map((b) => ({
    brand: b.brand,
    revenue: b.revenue,
  }));

  const paymentData = (data.byPaymentMethod || []).map((p) => ({
    method: (p.paymentMethod || "").toUpperCase(),
    revenue: p.revenue,
  }));

  const channelData = (data.byChannel || []).map((c) => ({
    channel: c.channel,
    revenue: c.revenue,
    orders: c.orders,
  }));

  const comparison = data.comparison || { currentPeriod: {} as any, previousPeriod: {} as any, growth: { orders: 0, revenue: 0, aov: 0 } };
  const growthCards = [
    { label: "Orders Growth", value: comparison.growth?.orders || 0, positive: (comparison.growth?.orders || 0) >= 0 },
    { label: "Revenue Growth", value: comparison.growth?.revenue || 0, positive: (comparison.growth?.revenue || 0) >= 0 },
    { label: "AOV Growth", value: comparison.growth?.aov || 0, positive: (comparison.growth?.aov || 0) >= 0 },
  ];

  const dailyChartData = {
    labels: dailyData.map((d) => d.date),
    datasets: [
      {
        label: "Gross Revenue",
        data: dailyData.map((d) => d.grossRevenue),
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2.5,
        yAxisID: "y",
        order: 2,
      },
      {
        label: "Profit",
        data: dailyData.map((d) => d.profit),
        type: "line" as const,
        borderColor: "#10b981",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        yAxisID: "y",
        order: 1,
      },
      {
        label: "Discounts",
        data: dailyData.map((d) => d.discounts),
        type: "bar" as const,
        backgroundColor: "rgba(245,158,11,0.5)",
        borderColor: "#f59e0b",
        borderWidth: 0,
        borderRadius: 3,
        yAxisID: "y",
        order: 3,
      },
    ],
  };

  const categoryChartData = {
    labels: categoryData.map((d) => d.category),
    datasets: [
      {
        label: "Revenue",
        data: categoryData.map((d) => d.revenue),
        backgroundColor: "rgba(99,102,241,0.75)",
        borderColor: "#6366f1",
        borderWidth: 0,
        borderRadius: 6,
      },
      {
        label: "Orders",
        data: categoryData.map((d) => d.orders),
        backgroundColor: "rgba(6,182,212,0.65)",
        borderColor: "#06b6d4",
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  const brandChartData = {
    labels: brandData.map((d) => d.brand),
    datasets: [{
      label: "Revenue",
      data: brandData.map((d) => d.revenue),
      backgroundColor: CHART_COLORS.slice(0, brandData.length).map((c) => c + "cc"),
      borderColor: CHART_COLORS.slice(0, brandData.length),
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const paymentChartData = {
    labels: paymentData.map((d) => d.method),
    datasets: [{
      data: paymentData.map((d) => d.revenue),
      backgroundColor: CHART_COLORS.slice(0, paymentData.length),
      borderColor: "#fff",
      borderWidth: 3,
      hoverOffset: 8,
    }],
  };

  const channelChartData = {
    labels: channelData.map((d) => d.channel),
    datasets: [
      {
        label: "Revenue",
        data: channelData.map((d) => d.revenue),
        backgroundColor: "rgba(99,102,241,0.2)",
        borderColor: "#6366f1",
        borderWidth: 2,
        pointBackgroundColor: "#6366f1",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
      {
        label: "Orders",
        data: channelData.map((d) => d.orders),
        backgroundColor: "rgba(16,185,129,0.2)",
        borderColor: "#10b981",
        borderWidth: 2,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {growthCards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs text-slate-500 mb-1">{card.label}</p>
            <p className={`text-xl font-bold ${card.positive ? "text-emerald-600" : "text-red-600"}`}>
              {card.positive ? "+" : ""}{card.value.toFixed(1)}%
            </p>
          </div>
        ))}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <p className="text-xs text-slate-500 mb-1">Avg Order Value</p>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(comparison.currentPeriod?.aov || 0)}</p>
        </div>
      </div>

      <Card className="border-slate-100 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">Daily Sales Performance</CardTitle>
            <p className="text-xs text-slate-500">Revenue trend with profit overlay</p>
          </div>
          <InfoPopover title="Daily Sales Performance" description="Tracks your daily revenue, discounts given, and profit over time. Includes all orders regardless of status." formula="Gross Revenue = Total order value before discounts | Net Revenue = After discounts | Discounts = Amount reduced | AOV = Net revenue divided by number of orders" />
        </CardHeader>
        <CardContent>
          <div style={{ height: 350 }}><ChartComponents.Bar data={dailyChartData} options={{ responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: "index" }, plugins: { legend: defaultLegendStyle, tooltip: { ...defaultTooltipStyle, callbacks: { label: (ctx: any) => ctx.dataset.type === "line" ? ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` : ctx.dataset.type === "bar" && ctx.dataset.label === "Discounts" ? ` Discounts: ${formatCurrency(ctx.raw)}` : ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` } } }, scales: { ...defaultScaleOptions, y: { ...defaultScaleOptions.y, ticks: { ...defaultScaleOptions.y.ticks, callback: (v: any) => `${(v / 1000).toFixed(0)}k` } } } }} /></div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Sales by Category</CardTitle>
              <p className="text-xs text-slate-500">Revenue and order breakdown by category</p>
            </div>
            <InfoPopover title="Sales by Category" description="Net revenue and number of orders for each product category." formula="Revenue = Sales value after discounts for products in each category | Orders = Distinct orders containing products from that category. Sorted by revenue." />
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}><ChartComponents.Bar data={categoryChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: defaultLegendStyle, tooltip: { ...defaultTooltipStyle, callbacks: { label: (ctx: any) => ctx.dataset.label === "Revenue" ? ` Revenue: ${formatCurrency(ctx.raw)}` : ` Orders: ${ctx.raw}` } } }, scales: defaultScaleOptions }} /></div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Sales by Brand</CardTitle>
              <p className="text-xs text-slate-500">Top performing brands by revenue</p>
            </div>
            <InfoPopover title="Sales by Brand" description="Total revenue generated by each brand from product sales." formula="Revenue = Sum of (product price minus discount) for all items belonging to each brand. Sorted by highest revenue." />
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}><ChartComponents.Bar data={brandChartData} options={{ indexAxis: "y" as const, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...defaultTooltipStyle, callbacks: { label: (ctx: any) => ` Revenue: ${formatCurrency(ctx.raw)}` } } }, scales: { x: { ...defaultScaleOptions.x, ticks: { ...defaultScaleOptions.x.ticks, callback: (v: any) => `${(v / 1000).toFixed(0)}k` } }, y: { ...defaultScaleOptions.y, grid: { display: false } } } }} /></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Payment Methods</CardTitle>
              <p className="text-xs text-slate-500">Revenue distribution by payment method</p>
            </div>
            <InfoPopover title="Payment Methods (Doughnut)" description="How much revenue came through each payment method (COD, Bkash, Nagad, Card, etc.)." formula="Revenue = Total amount collected per payment method | Count = Number of transactions | Average = Revenue divided by transactions" />
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}><ChartComponents.Doughnut data={paymentChartData} options={{ responsive: true, maintainAspectRatio: false, cutout: "50%", plugins: { legend: { position: "bottom", ...defaultLegendStyle }, tooltip: { ...defaultTooltipStyle, callbacks: { label: (ctx: any) => ` ${ctx.label}: ${formatCurrency(ctx.raw)}` } } } }} /></div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Sales Channels</CardTitle>
              <p className="text-xs text-slate-500">Performance across sales channels</p>
            </div>
            <InfoPopover title="Sales Channels (Radar)" description="Revenue and order count from each sales channel (website, app, marketplace, etc.)." formula="Revenue = Net sales (after discounts) per channel | Orders = Number of orders placed through each channel" />
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}><ChartComponents.Radar data={channelChartData} options={{ responsive: true, maintainAspectRatio: false, scales: { r: { beginAtZero: true, grid: { color: "rgba(226,232,240,0.6)" }, angleLines: { color: "rgba(226,232,240,0.6)" }, pointLabels: { font: { size: 11 }, color: "#64748b" }, ticks: { display: false } } }, plugins: { legend: defaultLegendStyle, tooltip: defaultTooltipStyle } }} /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex items-center justify-center py-20">
    <p className="text-slate-500">No sales data available.</p>
  </div>
);

export default SalesTab;
