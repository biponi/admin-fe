import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../components/ui/chart";
import { TimeSeriesData } from "../../../api/analytics";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

interface RevenueChartProps {
  data: TimeSeriesData[];
  title?: string;
  description?: string;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
  transactions: {
    label: "Transactions",
    color: "var(--chart-2)",
  },
  sessions: {
    label: "Sessions",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  title = "Revenue & Orders Trend",
  description,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatRevenue = (value: number) => {
    if (value >= 1000000) return `৳${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `৳${(value / 1000).toFixed(1)}K`;
    return `৳${value}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatDate}
            />
            <YAxis
              yAxisId='left'
              tickLine={false}
              axisLine={false}
              tickFormatter={formatRevenue}
            />
            <YAxis
              yAxisId='right'
              orientation='right'
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              yAxisId='left'
              type='monotone'
              dataKey='revenue'
              stroke='var(--color-revenue)'
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId='right'
              type='monotone'
              dataKey='transactions'
              stroke='var(--color-transactions)'
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
