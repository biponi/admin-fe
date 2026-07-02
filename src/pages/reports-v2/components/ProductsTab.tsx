import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { ProductsData } from "../../../api/reportV2";
import InfoPopover from "./InfoPopover";
import { ChartComponents, CHART_COLORS, defaultTooltipStyle, defaultLegendStyle, defaultScaleOptions } from "./ChartjsSetup";

interface Props {
  data: ProductsData | null;
  formatCurrency: (v: number) => string;
  formatNumber: (v: number) => string;
}

const ProductsTab: React.FC<Props> = ({ data, formatCurrency, formatNumber }) => {
  if (!data) return <EmptyState />;

  const s = data.summary || ({} as any);
  const summaryCards = [
    { label: "Total Products", value: s.totalProducts || 0, bg: "bg-indigo-50", color: "text-indigo-600" },
    { label: "Active", value: s.activeProducts || 0, bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: "Inactive", value: s.inactiveProducts || 0, bg: "bg-amber-50", color: "text-amber-600" },
    { label: "Out of Stock", value: s.outOfStock || 0, bg: "bg-red-50", color: "text-red-600" },
    { label: "Low Stock", value: s.lowStock || 0, bg: "bg-orange-50", color: "text-orange-600" },
  ];

  const bestSelling = (data.bestSellingProducts || []).slice(0, 10).map((p) => ({
    name: (p.productName || "").length > 18 ? p.productName.substring(0, 18) + "..." : (p.productName || "Unknown"),
    sold: p.totalSold,
  }));

  const profitProducts = (data.highestProfitProducts || []).slice(0, 8).map((p) => ({
    name: (p.productName || "").length > 18 ? p.productName.substring(0, 18) + "..." : (p.productName || "Unknown"),
    profit: p.estimatedMargin,
  }));

  const categoryPerf = (data.categoryPerformance || []).map((c) => ({
    category: c.categoryId,
    revenue: c.revenue,
    orders: c.orders,
  }));

  const brandPerf = (data.brandPerformance || []).map((b) => ({
    brand: b.brand,
    revenue: b.revenue,
  }));

  const neverSold = (data.neverSoldProducts || []).slice(0, 6).map((p) => ({
    name: (p.productName || "").length > 18 ? p.productName.substring(0, 18) + "..." : (p.productName || "Unknown"),
    stock: p.stock,
  }));

  const bestSellingData = {
    labels: bestSelling.map((d) => d.name),
    datasets: [{
      label: "Units Sold",
      data: bestSelling.map((d) => d.sold),
      backgroundColor: CHART_COLORS.slice(0, bestSelling.length).map((c) => c + "cc"),
      borderColor: CHART_COLORS.slice(0, bestSelling.length),
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const profitData = {
    labels: profitProducts.map((d) => d.name),
    datasets: [{
      label: "Profit",
      data: profitProducts.map((d) => d.profit),
      backgroundColor: "rgba(16,185,129,0.7)",
      borderColor: "#10b981",
      borderWidth: 0,
      borderRadius: 6,
    }],
  };

  const categoryData = {
    labels: categoryPerf.map((d) => d.category),
    datasets: [
      {
        label: "Revenue",
        data: categoryPerf.map((d) => d.revenue),
        backgroundColor: "rgba(99,102,241,0.75)",
        borderColor: "#6366f1",
        borderWidth: 0,
        borderRadius: 6,
      },
      {
        label: "Orders",
        data: categoryPerf.map((d) => d.orders),
        backgroundColor: "rgba(6,182,212,0.65)",
        borderColor: "#06b6d4",
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  const brandData = {
    labels: brandPerf.map((d) => d.brand),
    datasets: [{
      data: brandPerf.map((d) => d.revenue),
      backgroundColor: CHART_COLORS.slice(0, brandPerf.length),
      borderColor: "#fff",
      borderWidth: 3,
      hoverOffset: 8,
    }],
  };

  const neverSoldData = {
    labels: neverSold.map((d) => d.name),
    datasets: [{
      label: "Stock",
      data: neverSold.map((d) => d.stock),
      backgroundColor: "rgba(245,158,11,0.7)",
      borderColor: "#f59e0b",
      borderWidth: 0,
      borderRadius: 6,
    }],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {summaryCards.map((card, i) => (
          <div key={i} className={`${card.bg} rounded-xl border border-slate-100 p-4`}>
            <p className="text-xs text-slate-500 mb-1">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>{formatNumber(card.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Best Selling Products</CardTitle>
              <p className="text-xs text-slate-500">Top products by units sold</p>
            </div>
            <InfoPopover title="Best Selling Products" description="Your top 10 products ranked by how many units were sold during the period." formula="Units sold = Total quantity ordered for each product | Revenue = Sales value after discounts | Order count = How many different orders included this product" />
          </CardHeader>
          <CardContent>
            <div style={{ height: 350 }}><ChartComponents.Bar data={bestSellingData} options={{ indexAxis: "y" as const, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...defaultTooltipStyle, callbacks: { label: (ctx: any) => ` Units Sold: ${ctx.raw}` } } }, scales: { x: defaultScaleOptions.x, y: { ...defaultScaleOptions.y, grid: { display: false } } } }} /></div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Most Profitable Products</CardTitle>
              <p className="text-xs text-slate-500">Products generating highest margin</p>
            </div>
            <InfoPopover title="Most Profitable Products" description="Products that make you the most profit after subtracting the cost to purchase them." formula="Profit = Sales revenue minus purchase cost | Revenue = What customers paid (after discounts) | Cost = What you paid suppliers (from purchase orders). If no purchase data exists, cost is estimated at 30% of selling price." />
          </CardHeader>
          <CardContent>
            <div style={{ height: 350 }}><ChartComponents.Bar data={profitData} options={{ indexAxis: "y" as const, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...defaultTooltipStyle, callbacks: { label: (ctx: any) => ` Profit: ${formatCurrency(ctx.raw)}` } } }, scales: { x: { ...defaultScaleOptions.x, ticks: { ...defaultScaleOptions.x.ticks, callback: (v: any) => `${(v / 1000).toFixed(0)}k` } }, y: { ...defaultScaleOptions.y, grid: { display: false } } } }} /></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Category Performance</CardTitle>
              <p className="text-xs text-slate-500">Revenue and orders by category</p>
            </div>
            <InfoPopover title="Category Performance" description="Revenue, order count, and unique products sold for each category." formula="Revenue = Net sales (after discounts) per category | Orders = Number of distinct orders | Unique products = Different products sold from that category" />
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}><ChartComponents.Bar data={categoryData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: defaultLegendStyle, tooltip: { ...defaultTooltipStyle, callbacks: { label: (ctx: any) => ctx.dataset.label === "Revenue" ? ` Revenue: ${formatCurrency(ctx.raw)}` : ` Orders: ${ctx.raw}` } } }, scales: defaultScaleOptions }} /></div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Brand Revenue Share</CardTitle>
              <p className="text-xs text-slate-500">Revenue distribution by brand</p>
            </div>
            <InfoPopover title="Brand Revenue Share" description="What percentage of total revenue each brand contributes." formula="Revenue per brand = Total sales (after discounts) from all products belonging to that brand. Sorted by highest revenue." />
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}><ChartComponents.Doughnut data={brandData} options={{ responsive: true, maintainAspectRatio: false, cutout: "50%", plugins: { legend: { position: "bottom", ...defaultLegendStyle }, tooltip: { ...defaultTooltipStyle, callbacks: { label: (ctx: any) => ` ${ctx.label}: ${formatCurrency(ctx.raw)}` } } } }} /></div>
          </CardContent>
        </Card>
      </div>

      {neverSold.length > 0 && (
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Never Sold Products</CardTitle>
              <p className="text-xs text-slate-500">Products with zero sales in this period</p>
            </div>
            <InfoPopover title="Never Sold Products" description="Products that are in stock but haven't sold a single unit during this period." formula="Finds all products with zero orders in the selected date range. Shows current stock level so you can decide to discount, bundle, or discontinue." />
          </CardHeader>
          <CardContent>
            <div style={{ height: 200 }}><ChartComponents.Bar data={neverSoldData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...defaultTooltipStyle, callbacks: { label: (ctx: any) => ` Stock: ${ctx.raw}` } } }, scales: defaultScaleOptions }} /></div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const EmptyState = () => (
  <div className="flex items-center justify-center py-20">
    <p className="text-slate-500">No product data available.</p>
  </div>
);

export default ProductsTab;
