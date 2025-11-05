"use client";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { ChartConfig, ChartContainer } from "../../components/ui/chart";
// const chartData = [
//   { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
// ];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;
interface Props {
  count: number;
  total: number;
  label: string;
  title: string;
  subTitle: string;
  chartData: any;
  footerSrting: string;
}
const RadialChartComponent: React.FC<Props> = ({
  total,
  label,
  title,
  count,
  subTitle,
  chartData,
  footerSrting,
}) => {
  console.log(chartData);
  return (
    <Card className='group flex flex-col relative overflow-hidden border-0 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1'>
      {/* Decorative background element */}
      <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

      {/* Animated gradient orb */}
      <div className='absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700'></div>

      <CardHeader className='items-center pb-0 relative z-10'>
        <CardTitle className='text-base sm:text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-center'>
          {title}
        </CardTitle>
        <CardDescription className='text-xs sm:text-sm text-center line-clamp-2'>
          {subTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-1 p-0 relative z-10'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[250px]'>
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={total}
            innerRadius={80}
            outerRadius={110}>
            <PolarGrid
              gridType='circle'
              radialLines={false}
              stroke='none'
              className='first:fill-muted last:fill-background'
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey={label} background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'>
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-4xl font-bold'>
                          {chartData[0][label].toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground'>
                          {label}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col p-1 gap-2 text-sm relative z-10 pb-4'>
        <div className='flex items-center gap-2 font-medium leading-none text-primary'>
          {((count / total) * 100).toFixed(2)}% out of {total} orders
        </div>
      </CardFooter>

      {/* Bottom accent gradient */}
      <div className='h-1 w-full bg-gradient-to-r from-primary/40 via-primary/20 to-transparent'></div>
    </Card>
  );
};

export default RadialChartComponent;
