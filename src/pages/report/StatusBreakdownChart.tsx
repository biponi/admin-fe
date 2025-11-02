"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

export const description = "A multiple bar chart";

type chartDataType = {
  status: string;
  orders: number;
  amount: number;
};

const chartConfig = {
  orders: {
    label: "Orders",
    color: "#474787",
  },
  amount: {
    label: "Amount",
    color: "#227093",
  },
} satisfies ChartConfig;

const StatusBreakdownChart = ({
  chartData = [],
  duration = "",
}: {
  chartData?: chartDataType[];
  duration?: string;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Full Order By Status Breakdown</CardTitle>
        <CardDescription>{duration}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='max-h-[350px] w-full'>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='status'
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              fontWeight={500}
              fontSize={15}
              className='uppercase'
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='dashed' />}
            />
            <YAxis yAxisId='left' orientation='left' hide />
            <YAxis yAxisId='right' orientation='right' hide />
            <Bar
              yAxisId='left'
              dataKey='orders'
              fill='var(--color-orders)'
              radius={5}
            />
            <Bar
              yAxisId='right'
              dataKey='amount'
              fill='var(--color-amount)'
              radius={5}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col justify-center items-center  gap-2 text-sm'>
        <div className='flex gap-2 leading-none font-medium'>
          Trending data <TrendingUp className='h-4 w-4' />
        </div>
        <div className='text-muted-foreground leading-none'>
          Showing status breakdown for all orders
        </div>
      </CardFooter>
    </Card>
  );
};

export default StatusBreakdownChart;
