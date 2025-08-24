"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  processing: {
    label: "Processing: ",
    color: "hsl(var(--chart-1))",
  },
  completed: {
    label: "Completed: ",
    color: "hsl(var(--chart-2))",
  },
  cancel: {
    label: "Cancelled: ",
    color: "hsl(var(--chart-3))",
  },
  delete: {
    label: "Deleted: ",
    color: "hsl(var(--chart-4))",
  },
  shipped: {
    label: "Shipped: ",
    color: "hsl(var(--chart-5))",
  },
  failed: {
    label: "Failed: ",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

interface Props {
  title: string;
  subTitle: string;
  data: any[];
}

const InteractiveSingleCardComponent: React.FC<Props> = ({
  title,
  subTitle,
  data,
}) => {
  return (
    <Card>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6'>
          <CardTitle>Bar Chart - {title}</CardTitle>
          <CardDescription>{subTitle}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'>
          <AreaChart data={data}>
            <defs>
              <linearGradient id='fillDesktop' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-processing)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-processing)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillMobile' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-completed)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-completed)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillMobile' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-cancel)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-cancel)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillMobile' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-failed)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-failed)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillMobile' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-delete)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-delete)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillMobile' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-shipped)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-shipped)'
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='_id'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator='dot'
                />
              }
            />
            <Area
              dataKey='processing'
              type='natural'
              fill='url(#fillMobile)'
              stroke='var(--color-processing)'
              stackId='a'
            />
            <Area
              dataKey='completed'
              type='natural'
              fill='url(#fillDesktop)'
              stroke='var(--color-completed)'
              stackId='a'
            />
            <Area
              dataKey='shipped'
              type='natural'
              fill='url(#fillMobile)'
              stroke='var(--color-shipped)'
              stackId='a'
            />
            <Area
              dataKey='cancel'
              type='natural'
              fill='url(#fillDesktop)'
              stroke='var(--color-cancel)'
              stackId='a'
            />
            <Area
              dataKey='delete'
              type='natural'
              fill='url(#fillMobile)'
              stroke='var(--color-delete)'
              stackId='a'
            />
            <Area
              dataKey='failed'
              type='natural'
              fill='url(#fillDesktop)'
              stroke='var(--color-failed)'
              stackId='a'
            />
            <ChartLegend content={<ChartLegendContent payload={[]} />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default InteractiveSingleCardComponent;
