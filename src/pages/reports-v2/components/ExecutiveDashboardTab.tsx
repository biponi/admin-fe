import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Target, Activity, BarChart3 } from "lucide-react";
import { DashboardData } from "../../../api/reportV2";
import InfoPopover from "./InfoPopover";
import { ChartComponents, CHART_COLORS, CHART_COLORS_ALPHA, defaultTooltipStyle, defaultLegendStyle, defaultScaleOptions } from "./ChartjsSetup";

interface Props {
  data: DashboardData | null;
  formatCurrency: (v: number) => string;
  formatNumber: (v: number) => string;
}

const ExecutiveDashboardTab: React.FC<Props> = ({ data, formatCurrency, formatNumber }) => {
  if (!data) return <EmptyState />;

  const { kpis, charts, businessSummary } = data;

  const kpiCards = [
    { title: "Gross Revenue", value: formatCurrency(kpis.sales.grossRevenue), change: kpis.sales.growth.revenue, icon: DollarSign, bg: "bg-indigo-50", iconColor: "text-indigo-600" },
    { title: "Total Orders", value: formatNumber(kpis.sales.totalOrders), change: kpis.sales.growth.orders, icon: ShoppingCart, bg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { title: "Total Customers", value: formatNumber(kpis.customer.totalCustomers), subtitle: `${kpis.customer.newCustomers} new`, icon: Users, bg: "bg-amber-50", iconColor: "text-amber-600" },
    { title: "Net Profit", value: formatCurrency(kpis.financial.totalProfit), icon: Target, bg: "bg-violet-50", iconColor: "text-violet-600" },
    { title: "Avg Order Value", value: formatCurrency(kpis.performance.aov), icon: Activity, bg: "bg-cyan-50", iconColor: "text-cyan-600" },
    { title: "Completion Rate", value: `${kpis.performance.orderCompletionRate.toFixed(1)}%`, icon: Target, bg: "bg-rose-50", iconColor: "text-rose-600" },
  ];

  const trendData = (charts?.salesTrend || []).map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    sales: item.sales,
    orders: item.orders,
  }));

  const revenueDistData = (charts?.revenueDistribution || []).map((item) => ({
    name: item.segment,
    value: item.value,
  }));

  const categoryData = (charts?.topCategories || []).map((item) => ({
    category: item.category,
    revenue: item.revenue,
  }));

  const heatmapData: Array<{ hour: string; sales: number; orders: number; intensity: number }> = [];
  const heatmap = charts?.salesHeatmap || [];
  const maxSales = Math.max(...heatmap.map((h) => h.sales), 1);
  heatmap.forEach((item) => {
    const hour = item.hour % 12 || 12;
    const ampm = item.hour < 12 ? "AM" : "PM";
    heatmapData.push({
      hour: `${hour}${ampm}`,
      sales: item.sales,
      orders: item.orders,
      intensity: (item.sales / maxSales) * 100,
    });
  });

  const radarData = {
    labels: ["Revenue", "Orders", "Customers", "AOV", "Growth", "Retention"],
    datasets: [{
      data: [
        80,
        kpis.performance.orderCompletionRate,
        Math.min((kpis.customer.totalCustomers / 500) * 100, 100),
        Math.min((kpis.performance.aov / 5000) * 100, 100),
        Math.min(Math.max(kpis.sales.growth.revenue, 0), 100),
        100 - kpis.performance.refundRate * 10,
      ],
      backgroundColor: "rgba(99,102,241,0.2)",
      borderColor: "#6366f1",
      borderWidth: 2,
      pointBackgroundColor: "#6366f1",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 4,
    }],
  };

  const trendChartData = {
    labels: trendData.map((d) => d.date),
    datasets: [
      {
        label: "Revenue",
        data: trendData.map((d) => d.sales),
        backgroundColor: "rgba(99,102,241,0.7)",
        borderColor: "#6366f1",
        borderWidth: 0,
        borderRadius: 6,
        yAxisID: "y",
        order: 2,
      },
      {
        label: "Orders",
        data: trendData.map((d) => d.orders),
        type: "line" as const,
        borderColor: "#10b981",
        backgroundColor: "transparent",
        borderWidth: 2.5,
        pointRadius: 0,
        tension: 0.4,
        yAxisID: "y1",
        order: 1,
      },
    ],
  };

  const revenueDistChartData = {
    labels: revenueDistData.map((d) => d.name),
    datasets: [{
      data: revenueDistData.map((d) => d.value),
      backgroundColor: CHART_COLORS.slice(0, revenueDistData.length),
      borderColor: "#fff",
      borderWidth: 3,
      hoverOffset: 8,
    }],
  };

  const categoryChartData = {
    labels: categoryData.map((d) => d.category),
    datasets: [{
      label: "Revenue",
      data: categoryData.map((d) => d.revenue),
      backgroundColor: CHART_COLORS.slice(0, categoryData.length).map((c) => c + "cc"),
      borderColor: CHART_COLORS.slice(0, categoryData.length),
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const periodComparison = businessSummary?.currentPeriod && businessSummary?.previousPeriod
    ? Object.keys(businessSummary.currentPeriod).map((key) => ({
        metric: key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
        current: businessSummary.currentPeriod[key] || 0,
        previous: businessSummary.previousPeriod[key] || 0,
      })).filter((item) => item.current !== 0 || item.previous !== 0).slice(0, 8)
    : [];

  const periodChartData = {
    labels: periodComparison.map((d) => d.metric),
    datasets: [
      {
        label: "Current Period",
        data: periodComparison.map((d) => d.current),
        backgroundColor: "rgba(99,102,241,0.75)",
        borderColor: "#6366f1",
        borderWidth: 0,
        borderRadius: 6,
      },
      {
        label: "Previous Period",
        data: periodComparison.map((d) => d.previous),
        backgroundColor: "rgba(203,213,225,0.7)",
        borderColor: "#cbd5e1",
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${kpi.iconColor}`} />
                </div>
                {kpi.change !== undefined && (
                  <div className={`flex items-center gap-0.5 text-xs font-medium ${kpi.change >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {kpi.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(kpi.change).toFixed(1)}%
                  </div>
                )}
              </div>
              <p className="text-xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-1">{kpi.title}</p>
              {kpi.subtitle && <p className="text-xs text-slate-400">{kpi.subtitle}</p>}
            </div>
          );
        })}
      </div>

      <Card className="border-slate-100 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">Sales Trend (Combo)</CardTitle>
            <p className="text-xs text-slate-500">Revenue as bars, orders as line overlay</p>
          </div>
          <InfoPopover title="Sales Trend (Combo Chart)" description="Shows daily revenue and number of orders over time. Only includes active orders (processing, completed, shipped)." formula="Revenue = Total order value after discounts. Orders = Count of orders placed each day." />
        </CardHeader>
        <CardContent>
          <div style={{ height: 320 }}><ChartComponents.Bar data={trendChartData} options={{ responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: "index" }, plugins: { legend: defaultLegendStyle, tooltip: defaultTooltipStyle }, scales: { ...defaultScaleOptions, y: { ...defaultScaleOptions.y, position: "left" as const, ticks: { ...defaultScaleOptions.y.ticks, callback: (v: any) => `${(v / 1000).toFixed(0)}k` } }, y1: { position: "right" as const, grid: { drawOnChartArea: false }, ticks: { color: "#94a3b8", font: { size: 11 } } } } }} /></div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Revenue Distribution</CardTitle>
              <p className="text-xs text-slate-500">Breakdown by revenue segment</p>
            </div>
            <InfoPopover title="Revenue Distribution (Doughnut)" description="Breaks down your total revenue into four parts: product sales, shipping income, discounts given, and refunds paid out." formula="Product sales = What customers paid for items | Shipping = Delivery charges collected | Discounts = Amount reduced from prices | Refunds = Money returned to customers" />
          </CardHeader>
          <CardContent>
            <div style={{ height: 280 }}><ChartComponents.Doughnut data={revenueDistChartData} options={{ responsive: true, maintainAspectRatio: false, cutout: "55%", plugins: { legend: { position: "bottom", ...defaultLegendStyle }, tooltip: { ...defaultTooltipStyle, callbacks: { label: (ctx: any) => ` ${ctx.label}: ${formatCurrency(ctx.raw)}` } } } }} /></div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Performance Radar</CardTitle>
              <p className="text-xs text-slate-500">Multi-dimensional business health score</p>
            </div>
            <InfoPopover title="Performance Radar" description="Six key business metrics scored on a 0-100 scale. Larger area means healthier business performance." formula="Revenue vs 500k target | Completion rate = Completed orders out of total | Customers vs 500 target | AOV vs 5,000 target | Revenue growth % | Retention = 100 minus refund rate" />
          </CardHeader>
          <CardContent>
            <div style={{ height: 280 }}><ChartComponents.Radar data={radarData} options={{ responsive: true, maintainAspectRatio: false, scales: { r: { beginAtZero: true, max: 100, grid: { color: "rgba(226,232,240,0.6)" }, angleLines: { color: "rgba(226,232,240,0.6)" }, pointLabels: { font: { size: 11 }, color: "#64748b" }, ticks: { display: false } } }, plugins: { legend: { display: false }, tooltip: defaultTooltipStyle } }} /></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Top Categories</CardTitle>
              <p className="text-xs text-slate-500">Revenue by product category</p>
            </div>
            <InfoPopover title="Top Categories (Bar Chart)" description="Your top 10 product categories ranked by how much revenue they generated." formula="Revenue = Total sales value (after discounts) from all products in each category. Sorted from highest to lowest." />
          </CardHeader>
          <CardContent>
            <div style={{ height: 280 }}><ChartComponents.Bar data={categoryChartData} options={{ indexAxis: "y" as const, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...defaultTooltipStyle, callbacks: { label: (ctx: any) => ` Revenue: ${formatCurrency(ctx.raw)}` } } }, scales: { x: { ...defaultScaleOptions.x, ticks: { ...defaultScaleOptions.x.ticks, callback: (v: any) => `${(v / 1000).toFixed(0)}k` } }, y: { ...defaultScaleOptions.y, grid: { display: false } } } }} /></div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Sales Heatmap</CardTitle>
              <p className="text-xs text-slate-500">Sales intensity by hour of day</p>
            </div>
            <InfoPopover title="Sales Heatmap (Hourly)" description="Shows which hours of the day bring in the most sales. Darker cells = more revenue. Great for identifying peak shopping times." formula="Each cell = Total sales and order count for that hour across all days in the period. Only active orders counted." />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {heatmapData.map((item, i) => {
                const intensity = item.intensity;
                const bg = intensity > 80 ? "bg-indigo-600 text-white" : intensity > 60 ? "bg-indigo-500 text-white" : intensity > 40 ? "bg-indigo-400 text-white" : intensity > 20 ? "bg-indigo-200 text-slate-700" : "bg-indigo-50 text-slate-500";
                return (
                  <div key={i} className={`${bg} rounded-lg p-2.5 text-center transition-all hover:scale-105 cursor-default`} title={`${item.hour}: ${formatCurrency(item.sales)} (${item.orders} orders)`}>
                    <p className="text-[10px] font-medium opacity-80">{item.hour}</p>
                    <p className="text-xs font-bold">{(item.sales / 1000).toFixed(0)}k</p>
                    <p className="text-[10px] opacity-70">{item.orders} orders</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {periodComparison.length > 0 && (
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Period Comparison</CardTitle>
              <p className="text-xs text-slate-500">Current vs previous period performance</p>
            </div>
            <InfoPopover title="Period Comparison" description="Compares this period's performance against the exact same length of time before it." formula="Example: If you selected Jan 1-30, the previous period is Dec 2-31 (same 30-day window). Growth = ((This period - Previous period) / Previous period) × 100" />
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}><ChartComponents.Bar data={periodChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: defaultLegendStyle, tooltip: defaultTooltipStyle }, scales: defaultScaleOptions }} /></div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const EmptyState = () => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
      <p className="text-slate-500">No data available. Adjust date range and try again.</p>
    </div>
  </div>
);

export default ExecutiveDashboardTab;
