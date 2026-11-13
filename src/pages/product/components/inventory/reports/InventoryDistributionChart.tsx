import { Chart as ChartJS, type ChartData } from "chart.js";
import { BarChartHorizontalBig } from "lucide-react";
import {
  SafeDoughnut,
  claudeChartPalette,
  claudeChartTheme,
  foldToPalette,
} from "../../../../../lib/claudeChart";
import { ClaudeChartCard } from "../charts/ClaudeChartCard";
import { ReportSummaryFooter } from "../reportScaffold/ReportTable";
import { formatNumber } from "../../../../../utils/inventoryReportUtils";
import { InventoryDistribution } from "../../../../../api/inventoryReport";

interface InventoryDistributionChartProps {
  data: InventoryDistribution[];
}

const formatStockRange = (range: unknown): string => {
  if (range === null || range === undefined) return "Unknown";
  const str = String(range).trim();
  switch (str) {
    case "0":
    case "0 units":
      return "0 units";
    case "1":
    case "1-10":
    case "1–10":
    case "1-10 units":
    case "1–10 units":
      return "1–10 units";
    case "11":
    case "11-50":
    case "11–50":
    case "11-50 units":
    case "11–50 units":
      return "11–50 units";
    case "51":
    case "51-100":
    case "51–100":
    case "51-100 units":
    case "51–100 units":
      return "51–100 units";
    case "101":
    case "101+":
    case "101+ units":
      return "101+ units";
    default:
      return str.toLowerCase().includes("unit") ? str : `${str} units`;
  }
};

/**
 * Inventory Distribution — doughnut of units by stock range (part-to-whole).
 * Fixed categorical palette in slot order; folds beyond 7 bins into "Other".
 */
export const InventoryDistributionChart = ({
  data,
}: InventoryDistributionChartProps) => {
  const rows = Array.isArray(data) ? data : [];
  const totalProducts = rows.reduce((sum, item) => sum + item.productCount, 0);
  const totalUnits = rows.reduce((sum, item) => sum + item.count, 0);

  const { labels, values, colors } = foldToPalette(
    rows.map((d) => formatStockRange(d.range)),
    rows.map((d) => d.count),
  );

  const chartData: ChartData<"doughnut"> = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: "#FFFFFF",
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: {
        display: true,
        position: "right" as const,
        labels: claudeChartTheme.legend.labels,
      },
      tooltip: {
        ...claudeChartTheme.tooltip,
        callbacks: {
          label: (ctx: ChartJS.TooltipContext<"doughnut">) => {
            const pct = totalUnits > 0 ? ((ctx.parsed as number) / totalUnits) * 100 : 0;
            return ` ${formatNumber(ctx.parsed as number)} units · ${pct.toFixed(1)}%`;
          },
        },
      },
    },
  };

  return (
    <div className='space-y-3'>
      <ClaudeChartCard
        title='Stock range distribution'
        description='Share of inventory units by stock range'
        icon={BarChartHorizontalBig}
        variant='doughnut'
        isEmpty={rows.length === 0}
        emptyTitle='No Distribution Data'
        emptyDescription='Unable to generate inventory distribution'>
        <SafeDoughnut data={chartData} options={options} />
      </ClaudeChartCard>
      <ReportSummaryFooter
        items={[
          { label: "Ranges", value: rows.length },
          { label: "Total Products", value: formatNumber(totalProducts) },
          { label: "Total Units", value: formatNumber(totalUnits) },
        ]}
      />
    </div>
  );
};

export default InventoryDistributionChart;
