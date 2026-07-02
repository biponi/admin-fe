import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { CustomersData } from "../../../api/reportV2";
import GeoMapChart from "./GeoMapChart";
import InfoPopover from "./InfoPopover";
import {
  ChartComponents,
  CHART_COLORS,
  defaultTooltipStyle,
  defaultLegendStyle,
  defaultScaleOptions,
} from "./ChartjsSetup";

interface Props {
  data: CustomersData | null;
  formatCurrency: (v: number) => string;
  formatNumber: (v: number) => string;
}

const CustomersTab: React.FC<Props> = ({
  data,
  formatCurrency,
  formatNumber,
}) => {
  if (!data) return <EmptyState />;

  const summary = data.summary || ({} as any);
  const customerLifetimeValue = data.customerLifetimeValue || [];
  const inactiveCustomers = data.inactiveCustomers || [];
  const repeatPurchaseAnalysis = data.repeatPurchaseAnalysis || {
    summary: {} as any,
    topRepeatCustomers: [],
  };
  const rpSummary = repeatPurchaseAnalysis.summary || ({} as any);

  const summaryCards = [
    {
      label: "Total Customers",
      value: summary.totalCustomers || 0,
      bg: "bg-indigo-50",
      color: "text-indigo-600",
    },
    {
      label: "New Customers",
      value: summary.newCustomers || 0,
      bg: "bg-emerald-50",
      color: "text-emerald-600",
    },
    {
      label: "Returning",
      value: summary.returningCustomers || 0,
      bg: "bg-amber-50",
      color: "text-amber-600",
    },
    {
      label: "Avg Revenue/Customer",
      value: formatCurrency(summary.avgRevenuePerCustomer || 0),
      bg: "bg-violet-50",
      color: "text-violet-600",
      isCurrency: true,
    },
  ];

  const repeatData = {
    labels: ["One-time", "Repeat"],
    datasets: [
      {
        data: [rpSummary.oneTimeCustomers || 0, rpSummary.repeatCustomers || 0],
        backgroundColor: ["#f59e0b", "#10b981"],
        borderColor: "#fff",
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const clvData = customerLifetimeValue
    .slice(0, 20)
    .map((c: any, i: number) => ({
      name: c.customerName || "Unknown",
      shortName:
        (c.customerName || "Unknown").length > 12
          ? c.customerName.substring(0, 12) + "..."
          : c.customerName || "Unknown",
      spend: c.totalSpend || 0,
      orders: c.totalOrders || 0,
      avgOrder: c.avgOrderValue || 0,
      email: c.email || "",
      phone: c.phoneNumber || "",
      firstOrder: c.firstOrderDate,
      lastOrder: c.lastOrderDate,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

  const radarData = {
    labels: [
      "Total Customers",
      "New Customers",
      "Returning",
      "Repeat Rate",
      "Avg Revenue",
      "Avg Days",
    ],
    datasets: [
      {
        data: [
          Math.min(((summary.totalCustomers || 0) / 500) * 100, 100),
          Math.min(((summary.newCustomers || 0) / 300) * 100, 100),
          Math.min(((summary.returningCustomers || 0) / 200) * 100, 100),
          rpSummary.repeatRate || 0,
          Math.min(((summary.avgRevenuePerCustomer || 0) / 5000) * 100, 100),
          Math.min(((rpSummary.avgDaysBetweenOrders || 0) / 30) * 100, 100),
        ],
        backgroundColor: "rgba(99,102,241,0.2)",
        borderColor: "#6366f1",
        borderWidth: 2,
        pointBackgroundColor: "#6366f1",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const bubbleData = {
    datasets: clvData.map((c, i) => ({
      label: c.name,
      data: [
        {
          x: c.orders,
          y: c.spend,
          r: Math.max(4, Math.min(20, c.spend / 5000)),
        },
      ],
      backgroundColor: c.color + "aa",
      borderColor: c.color,
      borderWidth: 1.5,
    })),
  };

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {summaryCards.map((card, i) => (
          <div
            key={i}
            className={`${card.bg} rounded-xl border border-slate-100 p-4`}>
            <p className='text-xs text-slate-500 mb-1'>{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>
              {card.isCurrency
                ? card.value
                : formatNumber(card.value as number)}
            </p>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='border-slate-100 shadow-sm'>
          <CardHeader className='pb-2 flex flex-row items-center justify-between'>
            <div>
              <CardTitle className='text-base font-semibold text-slate-900'>
                Customer Retention
              </CardTitle>
              <p className='text-xs text-slate-500'>
                One-time vs repeat customers (
                {(rpSummary.repeatRate || 0).toFixed(1)}% repeat rate)
              </p>
            </div>
            <InfoPopover
              title='Customer Retention'
              description='Split between customers who ordered once vs those who came back to order again.'
              formula='One-time = Customers with exactly 1 order | Repeat = Customers with 2+ orders | Repeat rate = Repeat customers as a percentage of total'
            />
          </CardHeader>
          <CardContent>
            <div style={{ height: 280 }}>
              <ChartComponents.Doughnut
                data={repeatData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: "55%",
                  plugins: {
                    legend: { position: "bottom", ...defaultLegendStyle },
                    tooltip: defaultTooltipStyle,
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
                Customer Health Score
              </CardTitle>
              <p className='text-xs text-slate-500'>
                Multi-dimensional customer metrics
              </p>
            </div>
            <InfoPopover
              title='Customer Health Score'
              description='Six customer metrics scored on a 0-100 scale for a quick health snapshot.'
              formula='Total customers (vs 500 target) | New customers (vs 300) | Returning customers (vs 200) | Repeat purchase rate | Average revenue per customer (vs 5,000) | Average days between orders (vs 30)'
            />
          </CardHeader>
          <CardContent>
            <div style={{ height: 280 }}>
              <ChartComponents.Radar
                data={radarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 100,
                      grid: { color: "rgba(226,232,240,0.6)" },
                      angleLines: { color: "rgba(226,232,240,0.6)" },
                      pointLabels: { font: { size: 10 }, color: "#64748b" },
                      ticks: { display: false },
                    },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: defaultTooltipStyle,
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
              Geographic Distribution
            </CardTitle>
            <p className='text-xs text-slate-500'>
              Customer density across Bangladesh districts
            </p>
          </div>
          <InfoPopover
            title='Geographic Distribution'
            description='Where your customers are located across Bangladesh, grouped by district or area.'
            formula='Customers = Unique buyers from each area | Revenue = Total sales from that area | Orders = Number of orders | Avg order value = Revenue divided by orders'
          />
        </CardHeader>
        <CardContent>
          <GeoMapChart
            data={data.locationReport || []}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
          />
        </CardContent>
      </Card>

      <Card className='border-slate-100 shadow-sm'>
        <CardHeader className='pb-2 flex flex-row items-center justify-between'>
          <div>
            <CardTitle className='text-base font-semibold text-slate-900'>
              Top Customers by Spend
            </CardTitle>
            <p className='text-xs text-slate-500'>
              Bubble size = total spend, position = orders vs spend
            </p>
          </div>
          <InfoPopover
            title='Top Customers by Spend'
            description='Your 20 highest-value customers ranked by total lifetime spend. Bubble size shows spending magnitude.'
            formula="Total spend = Everything they've paid (after discounts) | Orders = How many times they ordered | Avg order = Total spend divided by orders | Tenure = Days between first and last order"
          />
        </CardHeader>
        <CardContent className='space-y-6'>
          <div style={{ height: 350 }}>
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
                      label: (ctx: any) => {
                        const d = clvData[ctx.datasetIndex];
                        return [
                          `${d.name}`,
                          `Spend: ${formatCurrency(d.spend)}`,
                          `Orders: ${d.orders}`,
                          `Avg Order: ${formatCurrency(d.avgOrder)}`,
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
                      text: "Orders",
                      color: "#64748b",
                      font: { size: 11 },
                    },
                  },
                  y: {
                    ...defaultScaleOptions.y,
                    title: {
                      display: true,
                      text: "Spend (BDT)",
                      color: "#64748b",
                      font: { size: 11 },
                    },
                    ticks: {
                      ...defaultScaleOptions.y.ticks,
                      callback: (v: any) => `${(v / 1000).toFixed(0)}k`,
                    },
                  },
                },
              }}
            />
          </div>

          <div className='bg-white rounded-lg border border-slate-100 overflow-hidden'>
            <div className='px-4 py-2.5 border-b border-slate-100 flex items-center justify-between'>
              <h4 className='text-sm font-semibold text-slate-900'>
                Customer Details
              </h4>
              <span className='text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full'>
                {clvData.length} customers
              </span>
            </div>
            <div className='overflow-x-auto max-h-96 overflow-y-auto'>
              <table className='w-full text-sm '>
                <thead className='sticky top-0  z-10'>
                  <tr className='bg-slate-100/80'>
                    <th className='text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                      #
                    </th>
                    <th className='text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                      Customer
                    </th>
                    <th className='text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                      Orders
                    </th>
                    <th className='text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                      Avg Order
                    </th>
                    <th className='text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                      Total Spend
                    </th>
                    <th className='text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                      First Order
                    </th>
                    <th className='text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                      Last Order
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-50 '>
                  {clvData.map((c, i) => {
                    const maxSpend = clvData[0]?.spend || 1;
                    const pct = (c.spend / maxSpend) * 100;
                    return (
                      <tr
                        key={i}
                        className='hover:bg-slate-50/40 transition-colors'>
                        <td className='px-4 py-2.5'>
                          <div
                            className='w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold'
                            style={{
                              backgroundColor: c.color,
                              color: "white",
                            }}>
                            {i + 1}
                          </div>
                        </td>
                        <td className='px-4 py-2.5'>
                          <p className='font-medium text-slate-900'>{c.name}</p>
                          <p className='text-[10px] text-slate-400'>
                            {c.email}
                          </p>
                        </td>
                        <td className='px-4 py-2.5 text-right font-medium text-slate-700 tabular-nums'>
                          {c.orders}
                        </td>
                        <td className='px-4 py-2.5 text-right font-medium text-slate-700 tabular-nums'>
                          {formatCurrency(c.avgOrder)}
                        </td>
                        <td className='px-4 py-2.5 text-right'>
                          <div className='flex items-center justify-end gap-2'>
                            <div className='w-16 bg-slate-100 rounded-full h-1.5'>
                              <div
                                className='h-1.5 rounded-full'
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: c.color,
                                }}
                              />
                            </div>
                            <span className='font-semibold text-slate-900 tabular-nums w-16 text-right'>
                              {formatCurrency(c.spend)}
                            </span>
                          </div>
                        </td>
                        <td className='px-4 py-2.5 text-xs text-slate-500'>
                          {c.firstOrder
                            ? new Date(c.firstOrder).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "-"}
                        </td>
                        <td className='px-4 py-2.5 text-xs text-slate-500'>
                          {c.lastOrder
                            ? new Date(c.lastOrder).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {inactiveCustomers.length > 0 && (
        <Card className='border-slate-100 shadow-sm'>
          <CardHeader className='pb-2 flex flex-row items-center justify-between'>
            <div>
              <CardTitle className='text-base font-semibold text-slate-900'>
                Inactive Customers
              </CardTitle>
              <p className='text-xs text-slate-500'>
                Customers who haven't ordered recently
              </p>
            </div>
            <InfoPopover
              title='Inactive Customers'
              description="Customers who haven't placed an order in over 90 days. Potential re-engagement targets."
              formula='Inactive = Last order was more than 90 days ago | Shown with their total past orders, total spent, and exact number of days since last purchase'
            />
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
              {inactiveCustomers.slice(0, 6).map((c, i) => (
                <div
                  key={i}
                  className='bg-slate-50 rounded-lg p-3 border border-slate-100'>
                  <p className='font-medium text-slate-900 text-sm'>
                    {c.customerName}
                  </p>
                  <p className='text-xs text-slate-500'>{c.email}</p>
                  <div className='flex justify-between mt-2 text-xs'>
                    <span className='text-slate-500'>
                      {c.totalOrders} orders
                    </span>
                    <span className='text-red-600 font-medium'>
                      {c.daysSinceLastOrder}d inactive
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const EmptyState = () => (
  <div className='flex items-center justify-center py-20'>
    <p className='text-slate-500'>No customer data available.</p>
  </div>
);

export default CustomersTab;
