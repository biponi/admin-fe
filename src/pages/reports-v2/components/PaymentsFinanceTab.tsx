import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { PaymentsData, FinanceData } from "../../../api/reportV2";
import InfoPopover from "./InfoPopover";
import {
  ChartComponents,
  CHART_COLORS,
  defaultTooltipStyle,
  defaultLegendStyle,
  defaultScaleOptions,
} from "./ChartjsSetup";

interface Props {
  payments: PaymentsData | null;
  finance: FinanceData | null;
  formatCurrency: (v: number) => string;
  formatNumber: (v: number) => string;
}

const PaymentsFinanceTab: React.FC<Props> = ({
  payments,
  finance,
  formatCurrency,
  formatNumber,
}) => {
  if (!payments && !finance) return <EmptyState />;

  return (
    <div className='space-y-6'>
      {payments && (
        <PaymentsSection
          payments={payments}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
        />
      )}
      {finance && (
        <FinanceSection
          finance={finance}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
        />
      )}
    </div>
  );
};

const PaymentsSection: React.FC<{
  payments: PaymentsData;
  formatCurrency: (v: number) => string;
  formatNumber: (v: number) => string;
}> = ({ payments, formatCurrency, formatNumber }) => {
  const methodData = (payments.methodAnalysis || []).map((m) => ({
    method: (m.method || "").toUpperCase(),
    revenue: m.revenue,
    orders: m.orders,
  }));

  const trendData = (payments.successTrend || []).map((t) => ({
    period: new Date(t.period).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    completed: t.completed,
    failed: t.failed,
  }));

  const ps = payments.summary || ({} as any);
  const statusData = [
    { name: "Successful", value: ps.successful?.count || 0, color: "#10b981" },
    { name: "Failed", value: ps.failed?.count || 0, color: "#ef4444" },
    { name: "Processing", value: ps.processing?.count || 0, color: "#f59e0b" },
  ];

  const trendChartData = {
    labels: trendData.map((d) => d.period),
    datasets: [
      {
        label: "Completed",
        data: trendData.map((d) => d.completed),
        backgroundColor: "rgba(16,185,129,0.5)",
        borderColor: "#10b981",
        borderWidth: 0,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        order: 2,
      },
      {
        label: "Failed",
        data: trendData.map((d) => d.failed),
        type: "line" as const,
        borderColor: "#ef4444",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        order: 1,
      },
    ],
  };

  const methodChartData = {
    labels: methodData.map((d) => d.method),
    datasets: [
      {
        data: methodData.map((d) => d.revenue),
        backgroundColor: CHART_COLORS.slice(0, methodData.length),
        borderColor: "#fff",
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const statusChartData = {
    labels: statusData.map((d) => d.name),
    datasets: [
      {
        data: statusData.map((d) => d.value),
        backgroundColor: statusData.map((d) => d.color),
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-lg font-semibold text-slate-900'>
        Payment Analytics
      </h2>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-indigo-50 rounded-xl border border-slate-100 p-4'>
          <p className='text-xs text-slate-500 mb-1'>Total Payments</p>
          <p className='text-xl font-bold text-indigo-600'>
            {formatNumber(payments.summary.totalPayments)}
          </p>
        </div>
        <div className='bg-emerald-50 rounded-xl border border-slate-100 p-4'>
          <p className='text-xs text-slate-500 mb-1'>Successful</p>
          <p className='text-xl font-bold text-emerald-600'>
            {formatNumber(payments.summary.successful.count)}
          </p>
        </div>
        <div className='bg-red-50 rounded-xl border border-slate-100 p-4'>
          <p className='text-xs text-slate-500 mb-1'>Failed</p>
          <p className='text-xl font-bold text-red-600'>
            {formatNumber(payments.summary.failed.count)}
          </p>
        </div>
        <div className='bg-amber-50 rounded-xl border border-slate-100 p-4'>
          <p className='text-xs text-slate-500 mb-1'>Total Amount</p>
          <p className='text-xl font-bold text-amber-600'>
            {formatCurrency(payments.summary.totalAmount)}
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='border-slate-100 shadow-sm'>
          <CardHeader className='pb-2 flex flex-row items-center justify-between'>
            <div>
              <CardTitle className='text-base font-semibold text-slate-900'>
                Payment Success Trend
              </CardTitle>
              <p className='text-xs text-slate-500'>
                Daily successful vs failed payments
              </p>
            </div>
            <InfoPopover
              title='Payment Success Trend'
              description='Daily count of successful vs failed orders based on their final status.'
              formula='Successful = Orders completed, shipped, or still processing | Failed = Orders cancelled or failed | Success rate = Successful out of total (successful + failed)'
            />
          </CardHeader>
          <CardContent>
            <div style={{ height: 280 }}>
              <ChartComponents.Line
                data={trendChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: { intersect: false, mode: "index" },
                  plugins: {
                    legend: defaultLegendStyle,
                    tooltip: defaultTooltipStyle,
                  },
                  scales: defaultScaleOptions,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className='border-slate-100 shadow-sm'>
          <CardHeader className='pb-2 flex flex-row items-center justify-between'>
            <div>
              <CardTitle className='text-base font-semibold text-slate-900'>
                Payment Methods
              </CardTitle>
              <p className='text-xs text-slate-500'>
                Revenue by payment method
              </p>
            </div>
            <InfoPopover
              title='Payment Methods (Doughnut)'
              description='How much revenue was collected through each payment method.'
              formula='Revenue = Total amount received per payment type | Transactions = Number of payments | Average = Revenue per transaction'
            />
          </CardHeader>
          <CardContent>
            <div style={{ height: 280 }}>
              <ChartComponents.Doughnut
                data={methodChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: "50%",
                  plugins: {
                    legend: { position: "bottom", ...defaultLegendStyle },
                    tooltip: {
                      ...defaultTooltipStyle,
                      callbacks: {
                        label: (ctx: any) =>
                          ` ${ctx.label}: ${formatCurrency(ctx.raw)}`,
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className='border-slate-100 shadow-sm'>
        <CardHeader className='pb-2 flex flex-row items-center justify-between'>
          <div>
            <CardTitle className='text-base font-semibold text-slate-900'>
              Payment Status
            </CardTitle>
          </div>
          <InfoPopover
            title='Payment Status'
            description='How many orders are fully paid, partially paid, or unpaid.'
            formula='Paid in full = No remaining balance | Partial = Some paid, some remaining | No payment = Nothing paid yet'
          />
        </CardHeader>
        <CardContent>
          <div style={{ height: 200 }}>
            <ChartComponents.Bar
              data={statusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: defaultTooltipStyle,
                },
                scales: defaultScaleOptions,
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const FinanceSection: React.FC<{
  finance: FinanceData;
  formatCurrency: (v: number) => string;
  formatNumber: (v: number) => string;
}> = ({ finance, formatCurrency, formatNumber }) => {
  const fs = finance.summary || ({} as any);
  const summaryCards = [
    {
      label: "Gross Revenue",
      value: formatCurrency(fs.grossRevenue || 0),
      bg: "bg-indigo-50",
      color: "text-indigo-600",
    },
    {
      label: "Net Revenue",
      value: formatCurrency(fs.netRevenue || 0),
      bg: "bg-emerald-50",
      color: "text-emerald-600",
    },
    {
      label: "Gross Profit",
      value: formatCurrency(fs.grossProfit || 0),
      bg: "bg-violet-50",
      color: "text-violet-600",
    },
    {
      label: "Net Profit",
      value: formatCurrency(fs.netProfit || 0),
      bg: "bg-cyan-50",
      color: "text-cyan-600",
    },
    {
      label: "Total Discounts",
      value: formatCurrency(fs.totalDiscounts || 0),
      bg: "bg-amber-50",
      color: "text-amber-600",
    },
    {
      label: "Total Refunds",
      value: formatCurrency(fs.totalRefunds || 0),
      bg: "bg-red-50",
      color: "text-red-600",
    },
  ];

  const profitTrend = (finance.profitTrend || []).map((t) => ({
    period: new Date(t.period).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    revenue: t.revenue,
    cost: t.estimatedCost,
    profit: t.profit,
  }));

  const categoryMargin = (finance.grossMarginByCategory || []).map((c) => ({
    category: c.categoryId,
    revenue: c.revenue,
    cost: c.cost,
  }));

  const profitTrendData = {
    labels: profitTrend.map((d) => d.period),
    datasets: [
      {
        label: "Revenue",
        data: profitTrend.map((d) => d.revenue),
        backgroundColor: "rgba(99,102,241,0.65)",
        borderColor: "#6366f1",
        borderWidth: 0,
        borderRadius: 4,
        order: 3,
      },
      {
        label: "Cost",
        data: profitTrend.map((d) => d.cost),
        backgroundColor: "rgba(245,158,11,0.6)",
        borderColor: "#f59e0b",
        borderWidth: 0,
        borderRadius: 4,
        order: 2,
      },
      {
        label: "Profit",
        data: profitTrend.map((d) => d.profit),
        type: "line" as const,
        borderColor: "#10b981",
        backgroundColor: "transparent",
        borderWidth: 2.5,
        pointRadius: 0,
        tension: 0.4,
        order: 1,
      },
    ],
  };

  const categoryMarginData = {
    labels: categoryMargin.map((d) => d.category),
    datasets: [
      {
        label: "Revenue",
        data: categoryMargin.map((d) => d.revenue),
        backgroundColor: "rgba(16,185,129,0.7)",
        borderColor: "#10b981",
        borderWidth: 0,
        borderRadius: 6,
      },
      {
        label: "Cost",
        data: categoryMargin.map((d) => d.cost),
        backgroundColor: "rgba(245,158,11,0.65)",
        borderColor: "#f59e0b",
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-lg font-semibold text-slate-900'>
        Financial Analytics
      </h2>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
        {summaryCards.map((card, i) => (
          <div
            key={i}
            className={`${card.bg} rounded-xl border border-slate-100 p-4`}>
            <p className='text-xs text-slate-500 mb-1'>{card.label}</p>
            <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='border-slate-100 shadow-sm'>
          <CardHeader className='pb-2 flex flex-row items-center justify-between'>
            <div>
              <CardTitle className='text-base font-semibold text-slate-900'>
                Profit Trend
              </CardTitle>
              <p className='text-xs text-slate-500'>
                Revenue, cost, and profit over time
              </p>
            </div>
            <InfoPopover
              title='Profit Trend'
              description='Revenue, cost, and profit over time. Cost is based on real purchase order data when available.'
              formula='Revenue = What customers paid (after discounts) | Cost = What you paid suppliers (from purchase orders, or estimated at 30% if no data) | Profit = Revenue minus cost | Margin = Profit as a percentage of revenue'
            />
          </CardHeader>
          <CardContent>
            <div style={{ height: 320 }}>
              <ChartComponents.Bar
                data={profitTrendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: { intersect: false, mode: "index" },
                  plugins: {
                    legend: defaultLegendStyle,
                    tooltip: {
                      ...defaultTooltipStyle,
                      callbacks: {
                        label: (ctx: any) =>
                          ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`,
                      },
                    },
                  },
                  scales: {
                    ...defaultScaleOptions,
                    y: {
                      ...defaultScaleOptions.y,
                      ticks: {
                        ...defaultScaleOptions.y.ticks,
                        callback: (v: any) => `${(v / 1000).toFixed(0)}k`,
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className='border-slate-100 shadow-sm'>
          <CardHeader className='pb-2 flex flex-row items-center justify-between'>
            <div>
              <CardTitle className='text-base font-semibold text-slate-900'>
                Margin by Category
              </CardTitle>
              <p className='text-xs text-slate-500'>
                Profit margin across categories
              </p>
            </div>
            <InfoPopover
              title='Margin by Category'
              description='How profitable each product category is after subtracting purchase costs.'
              formula='Revenue = Net sales per category | Cost = Purchase cost from suppliers | Profit = Revenue minus cost | Margin = Profit as percentage of revenue'
            />
          </CardHeader>
          <CardContent>
            <div style={{ height: 320 }}>
              <ChartComponents.Bar
                data={categoryMarginData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: defaultLegendStyle,
                    tooltip: {
                      ...defaultTooltipStyle,
                      callbacks: {
                        label: (ctx: any) =>
                          ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`,
                      },
                    },
                  },
                  scales: {
                    ...defaultScaleOptions,
                    y: {
                      ...defaultScaleOptions.y,
                      ticks: {
                        ...defaultScaleOptions.y.ticks,
                        callback: (v: any) => `${(v / 1000).toFixed(0)}k`,
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className='border-slate-100 shadow-sm'>
        <CardHeader className='pb-2 flex flex-row items-center justify-between'>
          <div>
            <CardTitle className='text-base font-semibold text-slate-900'>
              Cash Flow Summary
            </CardTitle>
          </div>
          <InfoPopover
            title='Cash Flow Summary'
            description='Money coming in vs money going out, and your net position.'
            formula='Money in = Product sales + shipping charges | Money out = Refunds + product costs | Net = Money in minus money out | Collected = What customers have paid | Outstanding = What customers still owe'
          />
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-emerald-50 rounded-lg p-4 text-center'>
              <p className='text-sm text-emerald-600 font-medium'>Money In</p>
              <p className='text-2xl font-bold text-slate-900 mt-1'>
                {formatCurrency(finance.cashFlow?.moneyIn?.total || 0)}
              </p>
              <p className='text-xs text-slate-500 mt-1'>
                Collected: {formatCurrency(finance.cashFlow?.collected || 0)}
              </p>
            </div>
            <div className='bg-red-50 rounded-lg p-4 text-center'>
              <p className='text-sm text-red-600 font-medium'>Money Out</p>
              <p className='text-2xl font-bold text-slate-900 mt-1'>
                {formatCurrency(finance.cashFlow?.moneyOut?.total || 0)}
              </p>
              <p className='text-xs text-slate-500 mt-1'>
                Outstanding:{" "}
                {formatCurrency(finance.cashFlow?.outstanding || 0)}
              </p>
            </div>
            <div className='bg-indigo-50 rounded-lg p-4 text-center'>
              <p className='text-sm text-indigo-600 font-medium'>
                Net Cash Flow
              </p>
              <p className='text-2xl font-bold text-slate-900 mt-1'>
                {formatCurrency(finance.cashFlow?.netCashFlow || 0)}
              </p>
              <p className='text-xs text-slate-500 mt-1'>
                AOV: {formatCurrency(finance.summary?.aov || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const EmptyState = () => (
  <div className='flex items-center justify-center py-20'>
    <p className='text-slate-500'>No payment or finance data available.</p>
  </div>
);

export default PaymentsFinanceTab;
