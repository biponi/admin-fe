import { Chart as ChartJS, type ChartData } from "chart.js";
import { Tag } from "lucide-react";
import {
  SafeBar,
  claudeChartTheme,
  claudeSequentialRamp,
} from "../../../../../lib/claudeChart";
import { ClaudeChartCard } from "../charts/ClaudeChartCard";
import { ReportSummaryFooter } from "../reportScaffold/ReportTable";
import { formatNumber } from "../../../../../utils/inventoryReportUtils";
import { PriceDistribution } from "../../../../../api/inventoryReport";

interface PriceDistributionChartProps {
  data: PriceDistribution[];
}

/**
 * Price Distribution — horizontal bar chart of products per price range.
 * Sequential coral ramp encodes magnitude (bin order = price order);
 * single series, so no legend.
 */
export const PriceDistributionChart = ({
  data,
}: PriceDistributionChartProps) => {
  const rows = Array.isArray(data) ? data : [];
  const totalProducts = rows.reduce((sum, item) => sum + item.numberOfProducts, 0);
  const maxCount = Math.max(...rows.map((d) => d.numberOfProducts), 0);

  // Ramp step follows bin rank (light → dark as price range grows)
  const rampColor = (index: number) => {
    if (rows.length <= 1) return claudeSequentialRamp[2];
    const step = Math.min(
      Math.floor((index / Math.max(rows.length - 1, 1)) * claudeSequentialRamp.length),
      claudeSequentialRamp.length - 1,
    );
    return claudeSequentialRamp[step];
  };

  const chartData: ChartData<"bar"> = {
    labels: rows.map((d) => d.priceRange),
    datasets: [
      {
        data: rows.map((d) => d.numberOfProducts),
        backgroundColor: rows.map((_, i) => rampColor(i)),
        borderRadius: { topLeft: 0, bottomLeft: 0, topRight: 4, bottomRight: 4 },
        borderSkipped: false,
        maxBarThickness: 28,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...claudeChartTheme.tooltip,
        callbacks: {
          label: (ctx: ChartJS.TooltipContext<"bar">) => {
            const pct = totalProducts > 0 ? ((ctx.parsed.x as number) / totalProducts) * 100 : 0;
            return ` ${formatNumber(ctx.parsed.x as number)} products · ${pct.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        ...claudeChartTheme.scales.x,
        title: { display: true, text: "Products", color: "#8A877D", font: { size: 11 } },
        beginAtZero: true,
      },
      y: { ...claudeChartTheme.scales.y, beginAtZero: false, grid: { display: false } },
    },
  };

  return (
    <div className='space-y-3'>
      <ClaudeChartCard
        title='Price range distribution'
        description='Products grouped by unit price range'
        icon={Tag}
        isEmpty={rows.length === 0}
        emptyTitle='No Price Data'
        emptyDescription='Unable to generate price distribution'>
        <SafeBar data={chartData} options={options} />
      </ClaudeChartCard>
      <ReportSummaryFooter
        items={[
          { label: "Total Products", value: formatNumber(totalProducts) },
          { label: "Price Ranges", value: rows.length },
          { label: "Largest Range", value: `${formatNumber(maxCount)} products` },
        ]}
      />
    </div>
  );
};

export default PriceDistributionChart;
