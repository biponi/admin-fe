import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { RefundsData, CouponsData } from "../../../api/reportV2";
import InfoPopover from "./InfoPopover";
import { ChartComponents, CHART_COLORS, defaultTooltipStyle, defaultLegendStyle, defaultScaleOptions } from "./ChartjsSetup";

interface Props {
  refunds: RefundsData | null;
  coupons: CouponsData | null;
  formatCurrency: (v: number) => string;
  formatNumber: (v: number) => string;
}

const RefundsCouponsTab: React.FC<Props> = ({ refunds, coupons, formatCurrency, formatNumber }) => {
  if (!refunds && !coupons) return <EmptyState />;

  return (
    <div className="space-y-6">
      {refunds && <RefundsSection refunds={refunds} formatCurrency={formatCurrency} formatNumber={formatNumber} />}
      {coupons && <CouponsSection coupons={coupons} formatCurrency={formatCurrency} formatNumber={formatNumber} />}
    </div>
  );
};

const RefundsSection: React.FC<{ refunds: RefundsData; formatCurrency: (v: number) => string; formatNumber: (v: number) => string }> = ({ refunds, formatCurrency, formatNumber }) => {
  const rs = refunds.summary || ({} as any);
  const summaryCards = [
    { label: "Refund Requests", value: formatNumber(rs.refundRequests || 0), bg: "bg-red-50", color: "text-red-600" },
    { label: "Approved", value: formatNumber(rs.approvedRefunds || 0), bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: "Pending", value: formatNumber(rs.pendingRefunds || 0), bg: "bg-amber-50", color: "text-amber-600" },
    { label: "Total Refund Amount", value: formatCurrency(rs.totalRefundAmount || 0), bg: "bg-indigo-50", color: "text-indigo-600" },
  ];

  const reasonData = (refunds.reasonAnalysis || []).map((r) => ({
    reason: (r.reason || "").replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    count: r.count,
  }));

  const trendData = (refunds.returnTrend || []).map((t) => ({
    period: new Date(t.period).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    returns: t.returns,
    refundAmount: t.refundAmount,
  }));

  const returnedProducts = (refunds.mostReturnedProducts || []).slice(0, 6).map((p) => ({
    name: (p.productName || "").length > 18 ? p.productName.substring(0, 18) + "..." : (p.productName || "Unknown"),
    returns: p.returnCount,
  }));

  const reasonChartData = {
    labels: reasonData.map((d) => d.reason),
    datasets: [{
      data: reasonData.map((d) => d.count),
      backgroundColor: CHART_COLORS.slice(0, reasonData.length),
      borderColor: "#fff",
      borderWidth: 3,
      hoverOffset: 8,
    }],
  };

  const trendChartData = {
    labels: trendData.map((d) => d.period),
    datasets: [
      {
        label: "Returns",
        data: trendData.map((d) => d.returns),
        backgroundColor: "rgba(239,68,68,0.5)",
        borderColor: "#ef4444",
        borderWidth: 0,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        order: 2,
      },
      {
        label: "Refund Amount",
        data: trendData.map((d) => d.refundAmount),
        type: "line" as const,
        borderColor: "#f59e0b",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        order: 1,
      },
    ],
  };

  const returnedChartData = {
    labels: returnedProducts.map((d) => d.name),
    datasets: [{
      label: "Returns",
      data: returnedProducts.map((d) => d.returns),
      backgroundColor: "rgba(239,68,68,0.7)",
      borderColor: "#ef4444",
      borderWidth: 0,
      borderRadius: 6,
    }],
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Refund & Return Analytics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <CardTitle className="text-base font-semibold text-slate-900">Return Reasons</CardTitle>
              <p className="text-xs text-slate-500">Why customers return products</p>
            </div>
            <InfoPopover title="Return Reasons" description="Why customers are returning products — broken down by reason." formula="Count = Number of returns per reason | Amount = Total refund paid out per reason | Average = Refund amount per return" />
          </CardHeader>
          <CardContent>
            <div style={{ height: 280 }}><ChartComponents.Doughnut data={reasonChartData} options={{ responsive: true, maintainAspectRatio: false, cutout: "50%", plugins: { legend: { position: "bottom", ...defaultLegendStyle }, tooltip: defaultTooltipStyle } }} /></div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Return Trend</CardTitle>
              <p className="text-xs text-slate-500">Daily returns and refund amounts</p>
            </div>
            <InfoPopover title="Return Trend" description="Daily count of return requests and total refund amounts over time." formula="Returns = Number of return orders placed each day | Refund amount = Total BDT refunded each day. Helps spot spikes that may indicate product or service issues." />
          </CardHeader>
          <CardContent>
            <div style={{ height: 280 }}><ChartComponents.Line data={trendChartData} options={{ responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: "index" }, plugins: { legend: defaultLegendStyle, tooltip: { ...defaultTooltipStyle, callbacks: { label: (ctx: any) => ctx.dataset.label === "Refund Amount" ? ` Refund: ${formatCurrency(ctx.raw)}` : ` Returns: ${ctx.raw}` } } }, scales: defaultScaleOptions }} /></div>
          </CardContent>
        </Card>
      </div>

      {returnedProducts.length > 0 && (
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Most Returned Products</CardTitle>
            </div>
            <InfoPopover title="Most Returned Products" description="Products that customers return the most. May indicate quality, sizing, or description issues." formula="Return count = Number of times this product was returned | Total returned = Units returned | Refund amount = Total money refunded for this product" />
          </CardHeader>
          <CardContent>
            <div style={{ height: 220 }}><ChartComponents.Bar data={returnedChartData} options={{ indexAxis: "y" as const, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...defaultTooltipStyle, callbacks: { label: (ctx: any) => ` Returns: ${ctx.raw}` } } }, scales: { x: defaultScaleOptions.x, y: { ...defaultScaleOptions.y, grid: { display: false } } } }} /></div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const CouponsSection: React.FC<{ coupons: CouponsData; formatCurrency: (v: number) => string; formatNumber: (v: number) => string }> = ({ coupons, formatCurrency, formatNumber }) => {
  const cs = coupons.summary || ({} as any);
  const summaryCards = [
    { label: "Coupons Used", value: formatNumber(cs.couponsUsed || 0), bg: "bg-indigo-50", color: "text-indigo-600" },
    { label: "Total Discount", value: formatCurrency(cs.totalDiscount || 0), bg: "bg-red-50", color: "text-red-600" },
    { label: "Revenue Generated", value: formatCurrency(cs.revenueGenerated || 0), bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: "Avg Discount", value: formatCurrency(cs.averageDiscount || 0), bg: "bg-amber-50", color: "text-amber-600" },
  ];

  const performanceData = (coupons.performance || []).slice(0, 8).map((p) => ({
    code: p.couponCode,
    usage: p.usage,
    revenue: p.revenue,
  }));

  const di = coupons.discountImpact || ({} as any);
  const withDi = di.withDiscount || ({} as any);
  const withoutDi = di.withoutDiscount || ({} as any);

  const perfChartData = {
    labels: performanceData.map((d) => d.code),
    datasets: [
      {
        label: "Usage",
        data: performanceData.map((d) => d.usage),
        backgroundColor: "rgba(99,102,241,0.7)",
        borderColor: "#6366f1",
        borderWidth: 0,
        borderRadius: 6,
      },
      {
        label: "Revenue",
        data: performanceData.map((d) => d.revenue),
        backgroundColor: "rgba(16,185,129,0.7)",
        borderColor: "#10b981",
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  const impactData = {
    labels: ["With Discount", "Without Discount"],
    datasets: [
      {
        label: "Orders",
        data: [withDi.orders || 0, withoutDi.orders || 0],
        backgroundColor: "rgba(99,102,241,0.7)",
        borderColor: "#6366f1",
        borderWidth: 0,
        borderRadius: 6,
      },
      {
        label: "Avg Basket Size",
        data: [withDi.avgBasketSize || 0, withoutDi.avgBasketSize || 0],
        backgroundColor: "rgba(16,185,129,0.7)",
        borderColor: "#10b981",
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Coupon & Discount Analytics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <CardTitle className="text-base font-semibold text-slate-900">Top Coupons</CardTitle>
              <p className="text-xs text-slate-500">Coupon usage and revenue generated</p>
            </div>
            <InfoPopover title="Top Coupons" description="Your most-used coupon codes ranked by how many times they were applied." formula="Usage = Number of orders using this coupon | Revenue = Total sales from coupon orders | Sorted by most used first" />
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}><ChartComponents.Bar data={perfChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: defaultLegendStyle, tooltip: { ...defaultTooltipStyle, callbacks: { label: (ctx: any) => ctx.dataset.label === "Revenue" ? ` Revenue: ${formatCurrency(ctx.raw)}` : ` Usage: ${ctx.raw}` } } }, scales: defaultScaleOptions }} /></div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Discount Impact</CardTitle>
              <p className="text-xs text-slate-500">How discounts affect order behavior</p>
            </div>
            <InfoPopover title="Discount Impact" description="Compares order values between customers who used a coupon vs those who didn't." formula="With coupon = Average order value when a coupon was applied | Without coupon = Average order value with no coupon | Impact = How much more (or less) customers spend with coupons" />
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}><ChartComponents.Bar data={impactData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: defaultLegendStyle, tooltip: defaultTooltipStyle }, scales: defaultScaleOptions }} /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex items-center justify-center py-20">
    <p className="text-slate-500">No refund or coupon data available.</p>
  </div>
);

export default RefundsCouponsTab;
