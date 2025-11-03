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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface GenericData {
  [key: string]: any;
}

interface DemographicsChartProps {
  data: GenericData[];
  title?: string;
  description?: string;
  dataKey?: string;
  valueKey?: string;
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
  revenue: {
    label: "Revenue",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const DemographicsChart: React.FC<DemographicsChartProps> = ({
  data,
  title = "Demographics",
  description,
  dataKey,
  valueKey = "users",
}) => {
  // Auto-detect the key for x-axis label
  const labelKey =
    dataKey ||
    Object.keys(data[0] || {}).find(
      (key) =>
        key === "country" ||
        key === "city" ||
        key === "deviceCategory" ||
        key === "browser" ||
        key === "district"
    ) ||
    "name";

  // Sort by value descending and take top 10
  const sortedData = [...data]
    .sort((a, b) => (b[valueKey] || 0) - (a[valueKey] || 0))
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={sortedData} layout='vertical' margin={{ left: 100 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type='number' tickLine={false} axisLine={false} />
            <YAxis
              type='category'
              dataKey={labelKey}
              tickLine={false}
              axisLine={false}
              width={95}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='dashed' />}
            />
            <Bar
              dataKey={valueKey}
              fill={`var(--color-${valueKey})`}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default DemographicsChart;
