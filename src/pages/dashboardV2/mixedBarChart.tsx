"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";

const chartConfig = {
  sum: {
    label: "Sum Of Amount: ",
  },
  purchase: {
    label: "Purchase",
    color: "hsl(var(--chart-1))",
  },
  totalSale: {
    label: "Total Sale",
    color: "hsl(var(--chart-2))",
  },
  returnAmount: {
    label: "Return Amount",
    color: "hsl(var(--chart-3))",
  },
  deliveryAmount: {
    label: "Delivery Amount",
    color: "hsl(var(--chart-4))",
  },
  discount: {
    label: "Discount",
    color: "hsl(var(--chart-5))",
  },
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig;

interface Props {
  title: string;
  subTitle: string;
  data: any[];
  footerString: string;
}

const MixedBarChart: React.FC<Props> = ({
  title,
  data,
  subTitle,
  footerString,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart - {title}</CardTitle>
        <CardDescription>{subTitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="browser"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="sum" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="sum"
              layout="vertical"
              fill="var(--color-purchase)"
              radius={4}
            >
              <LabelList
                dataKey="browser"
                position="insideLeft"
                offset={8}
                className="fill-[--color-label]"
                fontSize={12}
              />
              <LabelList
                dataKey="sum"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">{footerString}</div>
      </CardFooter>
    </Card>
  );
};

export default MixedBarChart;
