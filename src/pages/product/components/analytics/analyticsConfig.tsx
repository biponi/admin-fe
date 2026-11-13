/**
 * Shared analytics page config consumed by both the desktop Claude tree
 * and the mobile Material tree — stat definitions and inventory-health
 * metric metadata live once.
 */
import type { ReactNode } from "react";
import {
  Package,
  Layers,
  GitBranch,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import type {
  CategoryStockSummary,
  StockSummaryResponse,
} from "../../../interface";
import type { InventoryHealthResponse } from "../../../../api/inventoryReport";
import { formatNumber } from "../../../../utils/inventoryReportUtils";

export interface AnalyticsStat {
  key: keyof CategoryStockSummary | "totalActiveProductType" | "totalStock" | "totalVariants" | "totalPrice";
  label: string;
  icon: ReactNode;
  value: number | undefined;
}

export const buildStatsData = (
  summary: StockSummaryResponse | null,
): AnalyticsStat[] => [
  {
    key: "totalActiveProducts",
    label: "Active products",
    icon: <Package className='h-4 w-4' />,
    value: summary?.totalActiveProductType,
  },
  {
    key: "totalStock",
    label: "Total stock",
    icon: <Layers className='h-4 w-4' />,
    value: summary?.totals?.totalStock ?? summary?.totalStockUnits,
  },
  {
    key: "totalVariants",
    label: "Variations",
    icon: <GitBranch className='h-4 w-4' />,
    value: summary?.totalActiveProductVariations,
  },
  {
    key: "totalPrice",
    label: "Total value",
    icon: <DollarSign className='h-4 w-4' />,
    value: summary?.totalActiveProductPrice,
  },
];

export type HealthTone = "good" | "warn" | "bad" | "neutral";

export interface HealthMetric {
  label: string;
  value: number;
  unit: string;
  icon: ReactNode;
  tone: HealthTone;
  badgeText: string;
}

export const buildHealthMetrics = (
  health: InventoryHealthResponse | null,
): HealthMetric[] =>
  health
    ? [
        {
          label: "Healthy stock",
          value: health.healthy,
          unit: "products",
          icon: <CheckCircle2 className='h-4 w-4' />,
          tone: "good",
          badgeText: `${health.percentages?.healthy ?? 0}% of total`,
        },
        {
          label: "Low stock",
          value: health.lowStock,
          unit: "products",
          icon: <AlertTriangle className='h-4 w-4' />,
          tone: "warn",
          badgeText: `≤ ${health.threshold} units`,
        },
        {
          label: "Out of stock",
          value: health.outOfStock,
          unit: "products",
          icon: <XCircle className='h-4 w-4' />,
          tone: "bad",
          badgeText: "Urgent",
        },
        {
          label: "Dead stock",
          value: health.deadStock,
          unit: "products",
          icon: <Clock className='h-4 w-4' />,
          tone: "neutral",
          badgeText: `No sale ${health.deadStockDays}d+`,
        },
        {
          label: "Fast movers",
          value: health.fastMovers,
          unit: "products",
          icon: <TrendingUp className='h-4 w-4' />,
          tone: "good",
          badgeText: "Sold in 7d",
        },
        {
          label: "Slow movers",
          value: health.slowMovers,
          unit: "products",
          icon: <RefreshCw className='h-4 w-4' />,
          tone: "neutral",
          badgeText: "Review needed",
        },
      ]
    : [];

/** Formatted stat value (Total value renders in ৳). */
export const formatStatValue = (stat: AnalyticsStat): string =>
  stat.key === "totalPrice"
    ? `৳${formatNumber(stat.value)}`
    : formatNumber(stat.value);
