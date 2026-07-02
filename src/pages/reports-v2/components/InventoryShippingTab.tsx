import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { InventoryData, ShippingData } from "../../../api/reportV2";
import InfoPopover from "./InfoPopover";
import { ChartComponents, CHART_COLORS, defaultTooltipStyle, defaultLegendStyle, defaultScaleOptions } from "./ChartjsSetup";

interface Props {
  inventory: InventoryData | null;
  shipping: ShippingData | null;
  formatCurrency: (v: number) => string;
  formatNumber: (v: number) => string;
}

const InventoryShippingTab: React.FC<Props> = ({ inventory, shipping, formatCurrency, formatNumber }) => {
  if (!inventory && !shipping) return <EmptyState />;

  return (
    <div className="space-y-6">
      {inventory && <InventorySection inventory={inventory} formatCurrency={formatCurrency} formatNumber={formatNumber} />}
      {shipping && <ShippingSection shipping={shipping} formatCurrency={formatCurrency} formatNumber={formatNumber} />}
    </div>
  );
};

const InventorySection: React.FC<{ inventory: InventoryData; formatCurrency: (v: number) => string; formatNumber: (v: number) => string }> = ({ inventory, formatCurrency, formatNumber }) => {
  const is = inventory.summary || ({} as any);
  const summaryCards = [
    { label: "Total Products", value: formatNumber(is.totalProducts || 0), bg: "bg-indigo-50", color: "text-indigo-600" },
    { label: "Total Stock", value: formatNumber(is.totalStock || 0), bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: "Cost Value", value: formatCurrency(is.totalCostValue || 0), bg: "bg-amber-50", color: "text-amber-600" },
    { label: "Selling Value", value: formatCurrency(is.totalSellingValue || 0), bg: "bg-violet-50", color: "text-violet-600" },
    { label: "Potential Profit", value: formatCurrency(is.potentialProfit || 0), bg: "bg-cyan-50", color: "text-cyan-600" },
    { label: "Out of Stock", value: formatNumber(is.outOfStock || 0), bg: "bg-red-50", color: "text-red-600" },
  ];

  const agingData = (inventory.inventoryAging || []).map((a) => ({
    period: a.period,
    products: a.productCount,
    stock: a.totalStock,
  }));

  const deadStockData = (inventory.deadStock || []).slice(0, 8).map((d) => ({
    name: (d.productName || "").length > 18 ? d.productName.substring(0, 18) + "..." : (d.productName || "Unknown"),
    stock: d.stock,
  }));

  const agingChartData = {
    labels: agingData.map((d) => d.period),
    datasets: [
      {
        label: "Products",
        data: agingData.map((d) => d.products),
        backgroundColor: "rgba(99,102,241,0.7)",
        borderColor: "#6366f1",
        borderWidth: 0,
        borderRadius: 6,
      },
      {
        label: "Stock",
        data: agingData.map((d) => d.stock),
        backgroundColor: "rgba(6,182,212,0.6)",
        borderColor: "#06b6d4",
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  const deadStockChartData = {
    labels: deadStockData.map((d) => d.name),
    datasets: [{
      label: "Stock",
      data: deadStockData.map((d) => d.stock),
      backgroundColor: "rgba(239,68,68,0.7)",
      borderColor: "#ef4444",
      borderWidth: 0,
      borderRadius: 6,
    }],
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Inventory Analytics</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {summaryCards.map((card, i) => (
          <div key={i} className={`${card.bg} rounded-xl border border-slate-100 p-4`}>
            <p className="text-xs text-slate-500 mb-1">{card.label}</p>
            <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Inventory Aging</CardTitle>
              <p className="text-xs text-slate-500">Stock distribution by age</p>
            </div>
            <InfoPopover title="Inventory Aging" description="How long products have been sitting in stock, grouped into age brackets." formula="0-30 days = Recently purchased | 31-60 days = Moderate age | 61-90 days = Getting old | 90+ days = Aging stock. Shows product count and stock value per bracket. Uses discounted selling prices." />
          </CardHeader>
          <CardContent>
            <div style={{ height: 280 }}><ChartComponents.Bar data={agingChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: defaultLegendStyle, tooltip: defaultTooltipStyle }, scales: defaultScaleOptions }} /></div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Dead Stock</CardTitle>
              <p className="text-xs text-slate-500">Products with no recent sales</p>
            </div>
            <InfoPopover title="Dead Stock" description="Products gathering dust — in stock but haven't sold in 90+ days." formula="Identifies products with zero sales in the last 90 days. Shows current stock level and estimated value. Consider discounting, bundling, or discontinuing these items." />
          </CardHeader>
          <CardContent>
            {deadStockData.length > 0 ? (
              <div style={{ height: 280 }}><ChartComponents.Bar data={deadStockChartData} options={{ indexAxis: "y" as const, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...defaultTooltipStyle, callbacks: { label: (ctx: any) => ` Stock: ${ctx.raw}` } } }, scales: { x: defaultScaleOptions.x, y: { ...defaultScaleOptions.y, grid: { display: false } } } }} /></div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No dead stock detected</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ShippingSection: React.FC<{ shipping: ShippingData; formatCurrency: (v: number) => string; formatNumber: (v: number) => string }> = ({ shipping, formatCurrency, formatNumber }) => {
  const ss = shipping.summary || ({} as any);
  const summaryCards = [
    { label: "Total Shipments", value: formatNumber(ss.totalShipments || 0), bg: "bg-indigo-50", color: "text-indigo-600" },
    { label: "Delivered", value: formatNumber(ss.delivered || 0), bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: "In Transit", value: formatNumber(ss.inTransit || 0), bg: "bg-amber-50", color: "text-amber-600" },
    { label: "Failed", value: formatNumber(ss.failed || 0), bg: "bg-red-50", color: "text-red-600" },
  ];

  const providerData = (ss.providers || []).map((p: any) => ({
    provider: ((p.provider || "").charAt(0).toUpperCase() + (p.provider || "").slice(1)),
    count: p.count,
  }));

  const courierData = (shipping.courierPerformance || []).map((c) => ({
    provider: ((c.provider || "").charAt(0).toUpperCase() + (c.provider || "").slice(1)),
    delivered: c.delivered,
    failed: c.failed,
    returned: c.returned,
  }));

  const providerChartData = {
    labels: providerData.map((d) => d.provider),
    datasets: [{
      data: providerData.map((d) => d.count),
      backgroundColor: CHART_COLORS.slice(0, providerData.length),
      borderColor: "#fff",
      borderWidth: 3,
      hoverOffset: 8,
    }],
  };

  const courierChartData = {
    labels: courierData.map((d) => d.provider),
    datasets: [
      {
        label: "Delivered",
        data: courierData.map((d) => d.delivered),
        backgroundColor: "rgba(16,185,129,0.7)",
        borderColor: "#10b981",
        borderWidth: 0,
        borderRadius: 6,
      },
      {
        label: "Failed",
        data: courierData.map((d) => d.failed),
        backgroundColor: "rgba(239,68,68,0.7)",
        borderColor: "#ef4444",
        borderWidth: 0,
        borderRadius: 6,
      },
      {
        label: "Returned",
        data: courierData.map((d) => d.returned),
        backgroundColor: "rgba(245,158,11,0.7)",
        borderColor: "#f59e0b",
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Shipping Analytics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <div key={i} className={`${card.bg} rounded-xl border border-slate-100 p-4`}>
            <p className="text-xs text-slate-500 mb-1">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Shipping Providers</CardTitle>
              <p className="text-xs text-slate-500">Shipment distribution by courier</p>
            </div>
            <InfoPopover title="Shipping Providers" description="How shipments are distributed across your courier services." formula="Shipments = Orders assigned to each courier | Delivered = Successfully delivered | Delivery rate = Delivered as percentage of total shipments per courier" />
          </CardHeader>
          <CardContent>
            <div style={{ height: 280 }}><ChartComponents.Doughnut data={providerChartData} options={{ responsive: true, maintainAspectRatio: false, cutout: "50%", plugins: { legend: { position: "bottom", ...defaultLegendStyle }, tooltip: defaultTooltipStyle } }} /></div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Courier Performance</CardTitle>
              <p className="text-xs text-slate-500">Delivery success by provider</p>
            </div>
            <InfoPopover title="Courier Performance" description="How each courier is performing — deliveries, failures, and returns." formula="Delivered = Successfully delivered shipments | Failed = Cancelled, returned, or unknown status | Sorted by total orders handled" />
          </CardHeader>
          <CardContent>
            <div style={{ height: 280 }}><ChartComponents.Bar data={courierChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: defaultLegendStyle, tooltip: defaultTooltipStyle }, scales: defaultScaleOptions }} /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex items-center justify-center py-20">
    <p className="text-slate-500">No inventory or shipping data available.</p>
  </div>
);

export default InventoryShippingTab;
