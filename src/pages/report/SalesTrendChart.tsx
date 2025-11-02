// ============================================
// FILE: components/reports/SalesTrendChart.tsx
// ============================================
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Download, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";

import { format } from "date-fns";
import useRoleCheck from "../auth/hooks/useRoleCheck";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#00b894",
  },
  paid: {
    label: "Paid",
    color: "#6c5ce7",
  },
  orders: {
    label: "Orders",
    color: "#d63031",
  },
} satisfies ChartConfig;

interface SalesTrendChartProps {
  data: any;
  onDownload: () => void;
}

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({
  data,
  onDownload,
}) => {
  const [metric, setMetric] = useState<"revenue" | "orders">("revenue");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const chartData =
    data.trend?.map((item: any) => ({
      date: format(new Date(item.period), "dd/MM"),
      revenue: item.revenue,
      orders: item.orderCount,
      paid: item.paid,
    })) || [];

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
        <div>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Sales Trend
          </CardTitle>
          <CardDescription>
            Daily sales performance over selected period
          </CardDescription>
        </div>
        <div className='flex gap-2'>
          <Button
            onClick={() => setMetric("revenue")}
            size='sm'
            variant={metric === "revenue" ? "default" : "outline"}>
            Revenue
          </Button>
          <Button
            onClick={() => setMetric("orders")}
            size='sm'
            variant={metric === "orders" ? "default" : "outline"}>
            Orders
          </Button>
          {useRoleCheck().hasRequiredPermission("Report", "download") && (
            <Button onClick={onDownload} size='sm' variant='outline'>
              <Download className='h-4 w-4 mr-2' />
              Download
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='h-[350px] w-full'>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              left: 12,
              right: 12,
            }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='line' />}
            />
            <YAxis
              tickFormatter={(value) =>
                metric === "revenue" ? formatCurrency(value) : value
              }
              hide
            />
            {/* <Line
              dataKey="desktop"
              type="natural"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-desktop)",
              }}
              activeDot={{
                r: 6,
              }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Line> */}

            {metric === "revenue" ? (
              <>
                <Line
                  type='monotone'
                  dataKey='revenue'
                  stroke='var(--color-revenue)'
                  strokeWidth={2}
                  name='Total Revenue'>
                  <LabelList
                    position='top'
                    offset={12}
                    className='fill-foreground'
                    fontSize={12}
                  />
                </Line>
                <Line
                  type='monotone'
                  dataKey='paid'
                  stroke='var(--color-paid)'
                  strokeWidth={2}
                  name='Paid Amount'>
                  <LabelList
                    position='top'
                    offset={12}
                    className='fill-foreground'
                    fontSize={12}
                  />
                </Line>
              </>
            ) : (
              <Line
                type='monotone'
                dataKey='orders'
                stroke='var(--color-orders)'
                strokeWidth={2}
                name='Order Count'>
                <LabelList
                  position='top'
                  offset={12}
                  className='fill-foreground'
                  fontSize={12}
                />
              </Line>
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SalesTrendChart;
