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
import { HourlyActivityData } from "../../../api/analytics";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface HourlyActivityChartProps {
  data: HourlyActivityData[];
  title?: string;
  description?: string;
}

const chartConfig = {
  users: {
    label: "Users",
    color: "var(--chart-1)",
  },
  sessions: {
    label: "Sessions",
    color: "var(--chart-2)",
  },
  transactions: {
    label: "Transactions",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const HourlyActivityChart: React.FC<HourlyActivityChartProps> = ({
  data,
  title = "24-Hour Activity Pattern",
  description,
}) => {
  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='hour'
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={formatHour}
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='dashed' />}
            />
            <Bar
              dataKey='users'
              fill='var(--color-users)'
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey='sessions'
              fill='var(--color-sessions)'
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default HourlyActivityChart;
