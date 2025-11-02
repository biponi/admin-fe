"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

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

export const description = "A multiple bar chart with a legend";

type ChartDataItem = any;

interface Props {
  data: ChartDataItem[];
  xKey: string;
  barKeys: string[];
  chartConfig: ChartConfig;
  label: string;
  duration?: string;
  footer?: string;
  footerDescription?: string;
  isUpwardTrend?: boolean;
  stacked?: boolean;
}

const BarChartWithLegend: React.FC<Props> = ({
  data,
  xKey,
  barKeys,
  chartConfig,
  label,
  duration,
  footer,
  footerDescription,
  isUpwardTrend,
  stacked = true,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        {duration && <CardDescription>{duration}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={xKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='dashed' />}
            />
            {barKeys.map((key, index) => (
              <Bar
                key={index}
                dataKey={key}
                fill={`var(--color-${key})`}
                radius={5}
              />
            ))}
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

export default BarChartWithLegend;
