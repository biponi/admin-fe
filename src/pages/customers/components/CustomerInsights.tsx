/**
 * Customer insights — desktop analytics section mirroring the
 * /products/analytics renovation: horizontal SafeBar charts on Claude
 * chrome + a payment-health card with semantic tones.
 *
 * Fetches its own stats (same per-component hook pattern as CustomerStats).
 */
import { useEffect, useMemo } from "react";
import { Chart as ChartJS, type ChartData } from "chart.js";
import {
  BarChartHorizontalBig,
  Crown,
  Landmark,
  Loader2,
  Wallet,
} from "lucide-react";
import { SafeBar as Bar, claudeChartTheme, claudeSequentialRamp } from "@/lib/claudeChart";
import { claude } from "@/lib/claude";
import { cn } from "@/lib/utils";
import { useCustomerAnalytics } from "../hooks/useCustomerAnalytics";

/** Spending-tier buckets for the current page of customers. */
const SPEND_TIERS = [
  { label: "৳0", min: 0, max: 0 },
  { label: "৳1–1k", min: 1, max: 1_000 },
  { label: "৳1k–5k", min: 1_000, max: 5_000 },
  { label: "৳5k–20k", min: 5_000, max: 20_000 },
  { label: "৳20k+", min: 20_000, max: Infinity },
];

export const CustomerInsights = ({
  customers,
}: {
  customers: Array<{ customerName: string; totalSpent: number }>;
}) => {
  const { stats, fetchStats } = useCustomerAnalytics();

  useEffect(() => {
    fetchStats();
    //eslint-disable-next-line
  }, []);

  const topCustomers = Array.isArray(stats?.topCustomers) ? stats.topCustomers : [];
  const summary = stats?.summary;

  /* ── Chart 1: top customers by revenue (single coral hue) ───────── */
  const topChartData: ChartData<"bar"> | null = useMemo(() => {
    if (topCustomers.length === 0) return null;
    const kept = topCustomers.slice(0, 10);
    return {
      labels: kept.map((c) => c.customerName),
      datasets: [
        {
          data: kept.map((c) => Number(c.totalSpent) || 0),
          backgroundColor: "#C96442",
          borderRadius: { topLeft: 0, bottomLeft: 0, topRight: 4, bottomRight: 4 },
          borderSkipped: false,
          maxBarThickness: 18,
        },
      ],
    };
  }, [topCustomers]);

  const topChartOptions = useMemo(
    () => ({
      indexAxis: "y" as const,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          ...claudeChartTheme.tooltip,
          callbacks: {
            label: (ctx: ChartJS.TooltipContext<"bar">) =>
              ` ৳${(ctx.parsed.x as number).toLocaleString()} lifetime spend`,
          },
        },
      },
      scales: {
        x: {
          ...claudeChartTheme.scales.x,
          title: {
            display: true,
            text: "Revenue (৳)",
            color: "#8A877D",
            font: { size: 11 },
          },
          beginAtZero: true,
        },
        y: {
          ...claudeChartTheme.scales.y,
          beginAtZero: false,
          grid: { display: false },
        },
      },
    }),
    [],
  );

  /* ── Chart 2: spending tiers on the current page (sequential ramp) ─ */
  const tierChartData: ChartData<"bar"> | null = useMemo(() => {
    if (customers.length === 0) return null;
    const counts = SPEND_TIERS.map(
      (t) =>
        customers.filter((c) => {
          const spent = Number(c.totalSpent) || 0;
          return spent >= t.min && (t.max === Infinity || spent <= t.max);
        }).length,
    );
    return {
      labels: SPEND_TIERS.map((t) => t.label),
      datasets: [
        {
          data: counts,
          backgroundColor: [...claudeSequentialRamp].reverse(),
          borderRadius: 4,
          borderSkipped: false,
          maxBarThickness: 28,
        },
      ],
    };
  }, [customers]);

  const tierChartOptions = useMemo(
    () => ({
      indexAxis: "y" as const,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          ...claudeChartTheme.tooltip,
          callbacks: {
            label: (ctx: ChartJS.TooltipContext<"bar">) =>
              ` ${ctx.parsed.x as number} customer${(ctx.parsed.x as number) === 1 ? "" : "s"}`,
          },
        },
      },
      scales: {
        x: {
          ...claudeChartTheme.scales.x,
          title: {
            display: true,
            text: "Customers (this page)",
            color: "#8A877D",
            font: { size: 11 },
          },
          beginAtZero: true,
          ticks: {
            ...claudeChartTheme.scales.x.ticks,
            precision: 0,
          },
        },
        y: {
          ...claudeChartTheme.scales.y,
          beginAtZero: false,
          grid: { display: false },
        },
      },
    }),
    [],
  );

  /* ── Payment health ─────────────────────────────────────────────── */
  const totalRevenue = Number(summary?.totalRevenue) || 0;
  const totalPaid = Number(summary?.totalPaid) || 0;
  const totalPending = Number(summary?.totalPending) || 0;
  const paidRatio = totalRevenue > 0 ? Math.min((totalPaid / totalRevenue) * 100, 100) : 0;
  const pendingRatio = totalRevenue > 0 ? 100 - paidRatio : 0;
  const hasPaymentData = totalRevenue > 0 || totalPaid > 0 || totalPending > 0;

  return (
    <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
      {/* ── Top customers chart ─────────────────────────────────── */}
      <div className={cn(claude.card, "p-4 md:p-5")}>
        <div className='flex items-start justify-between gap-3 mb-4'>
          <div className='min-w-0'>
            <h2 className={claude.title}>Top customers by revenue</h2>
            <p className='text-xs text-[#8A877D] mt-0.5'>
              Highest lifetime spend across the store
            </p>
          </div>
          <span className={claude.iconTile + " shrink-0"}>
            <Crown className='h-4 w-4' />
          </span>
        </div>
        {topChartData ? (
          <div className='h-64 md:h-72 relative'>
            <Bar data={topChartData} options={topChartOptions} />
          </div>
        ) : (
          <div className='h-40 flex flex-col items-center justify-center gap-2 text-[#8A877D]'>
            <Loader2 className='h-5 w-5 animate-spin' />
            <span className='text-xs'>Loading customer stats…</span>
          </div>
        )}
      </div>

      {/* ── Right column: tiers + payment health ────────────────── */}
      <div className='flex flex-col gap-4'>
        {/* Spending tiers */}
        <div className={cn(claude.card, "p-4 md:p-5")}>
          <div className='flex items-start justify-between gap-3 mb-4'>
            <div className='min-w-0'>
              <h2 className={claude.title}>Spending tiers</h2>
              <p className='text-xs text-[#8A877D] mt-0.5'>
                Customers on this page grouped by lifetime spend
              </p>
            </div>
            <span className={claude.iconTile + " shrink-0"}>
              <BarChartHorizontalBig className='h-4 w-4' />
            </span>
          </div>
          {tierChartData ? (
            <div className='h-48 md:h-52 relative'>
              <Bar data={tierChartData} options={tierChartOptions} />
            </div>
          ) : (
            <div className='h-24 flex items-center justify-center text-xs text-[#8A877D]'>
              No customers to analyse
            </div>
          )}
        </div>

        {/* Payment health */}
        <div className={cn(claude.card, "p-4 md:p-5")}>
          <div className='flex items-start justify-between gap-3 mb-4'>
            <div className='min-w-0'>
              <h2 className={claude.title}>Payment health</h2>
              <p className='text-xs text-[#8A877D] mt-0.5'>
                Paid vs outstanding across all customer orders
              </p>
            </div>
            <span className={claude.iconTile + " shrink-0"}>
              <Landmark className='h-4 w-4' />
            </span>
          </div>
          {hasPaymentData ? (
            <>
              {/* Paid vs pending split bar */}
              <div className='flex h-3 w-full rounded-full overflow-hidden bg-[#F5F1EA]'>
                <div
                  className='h-full bg-[#1A7F37] transition-all duration-500'
                  style={{ width: `${paidRatio}%` }}
                />
                <div
                  className='h-full bg-[#B3365B] transition-all duration-500'
                  style={{ width: `${pendingRatio}%` }}
                />
              </div>
              <div className='mt-2 flex items-center justify-between text-xs'>
                <span className='inline-flex items-center gap-1.5 text-[#1A7F37] font-medium'>
                  <span className='h-2 w-2 rounded-full bg-[#1A7F37]' />
                  Paid {paidRatio.toFixed(1)}%
                </span>
                <span className='inline-flex items-center gap-1.5 text-[#B3365B] font-medium'>
                  <span className='h-2 w-2 rounded-full bg-[#B3365B]' />
                  Pending {pendingRatio.toFixed(1)}%
                </span>
              </div>

              <div className='mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5'>
                <div className={claude.panel + " px-3 py-2.5"}>
                  <p className={claude.microLabel}>Collected</p>
                  <p className='text-sm font-semibold text-[#141413] tabular-nums mt-0.5 truncate'>
                    ৳{totalPaid.toLocaleString()}
                  </p>
                </div>
                <div className={claude.panel + " px-3 py-2.5"}>
                  <p className={claude.microLabel}>Outstanding</p>
                  <p className='text-sm font-semibold text-[#B3365B] tabular-nums mt-0.5 truncate'>
                    ৳{totalPending.toLocaleString()}
                  </p>
                </div>
                <div className={claude.panel + " px-3 py-2.5 col-span-2 sm:col-span-1"}>
                  <p className={claude.microLabel}>Total revenue</p>
                  <p className='text-sm font-semibold text-[#141413] tabular-nums mt-0.5 truncate'>
                    ৳{totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className='h-16 flex items-center justify-center gap-2 text-xs text-[#8A877D]'>
              <Wallet className='h-4 w-4' />
              No payment data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerInsights;
