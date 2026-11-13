import { Chart as ChartJS, type ChartData } from "chart.js";
import { Star } from "lucide-react";
import {
  SafeBar,
  claudeChartTheme,
} from "../../../../../lib/claudeChart";
import { ClaudeChartCard } from "../charts/ClaudeChartCard";
import { ReportSummaryFooter } from "../reportScaffold/ReportTable";
import {
  formatNumber,
  calculateAverageRating,
} from "../../../../../utils/inventoryReportUtils";
import { RatingDistribution } from "../../../../../api/inventoryReport";

interface RatingDistributionChartProps {
  data: RatingDistribution[];
}

/**
 * Rating Distribution — horizontal bar chart of votes per star rating.
 * Single series in the coral accent; no legend (title names the series).
 */
export const RatingDistributionChart = ({
  data,
}: RatingDistributionChartProps) => {
  const rows = (Array.isArray(data) ? data : []).sort(
    (a, b) => parseInt(b.rating) - parseInt(a.rating),
  );
  const totalVotes = rows.reduce((sum, item) => sum + item.totalVotes, 0);
  const avgRating = calculateAverageRating(rows);

  const chartData: ChartData<"bar"> = {
    labels: rows.map((d) => `${d.rating}★`),
    datasets: [
      {
        data: rows.map((d) => d.totalVotes),
        backgroundColor: "#C96442",
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
            const pct = totalVotes > 0 ? ((ctx.parsed.x as number) / totalVotes) * 100 : 0;
            return ` ${formatNumber(ctx.parsed.x as number)} votes · ${pct.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        ...claudeChartTheme.scales.x,
        title: { display: true, text: "Votes", color: "#8A877D", font: { size: 11 } },
        beginAtZero: true,
      },
      y: { ...claudeChartTheme.scales.y, beginAtZero: false, grid: { display: false } },
    },
  };

  return (
    <div className='space-y-3'>
      <ClaudeChartCard
        title='Rating distribution'
        description='Customer ratings breakdown by star level'
        icon={Star}
        isEmpty={rows.length === 0}
        emptyTitle='No Rating Data'
        emptyDescription='Unable to generate rating distribution'>
        <SafeBar data={chartData} options={options} />
      </ClaudeChartCard>
      <ReportSummaryFooter
        items={[
          { label: "Average Rating", value: avgRating.toFixed(1) },
          { label: "Total Votes", value: formatNumber(totalVotes) },
          { label: "Rating Levels", value: rows.length },
        ]}
      />
    </div>
  );
};

export default RatingDistributionChart;
