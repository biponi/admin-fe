"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";

export const description = "A bar chart with a label";

export type chartData = {
  xKey: string;
  yKey: number;
};

const chartConfig = {
  yKey: {
    label: "yKey",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface Props {
  data: chartData[];
  names: {
    xKey: string;
    yKey: string;
  };
  label: string;
  duration?: string;
  footer?: string;
  footerDescription?: string;
  isUpwardTrend?: boolean;
}

const BarChartActive: React.FC<Props> = ({
  data,
  label,
  names,
  duration,
  footer,
  footerDescription,
  isUpwardTrend,
}) => {
  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        {duration && <CardDescription>{duration}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              top: 20,
            }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='xKey'
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              name={names.xKey}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey='yKey'
              fill='var(--color-yKey)'
              radius={8}
              name={names.yKey}>
              <LabelList
                position='top'
                offset={12}
                className='fill-foreground'
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col items-start gap-2 text-sm'>
        {!!footer && (
          <div className='flex gap-2 leading-none font-medium'>
            {footer} {isUpwardTrend && <TrendingUp className='h-4 w-4' />}
          </div>
        )}
        {!!footerDescription && (
          <div className='text-muted-foreground'>{footerDescription}</div>
        )}
      </CardFooter>
    </Card>
  );
};

export default BarChartActive;
